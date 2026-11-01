import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  runTransaction,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import {
  DEFAULT_NEW_ENROLLMENT_FIELDS,
  DEFAULT_RE_ENROLLMENT_FIELDS,
  RESERVED_SLUGS,
} from '../lib/constants';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import {
  AcademicYear,
  AcademicYearStatus,
  Announcement,
  AnnouncementCategory,
  Application,
  ApplicationForm,
  ApplicationStatus,
  ChildProfile,
  FormType,
  School,
  SchoolStaffMember,
  StaffPermissions,
} from '../types';

/**
 * Sanitizes an object before writing to Firestore by removing any keys with undefined values
 */
function sanitizeForFirestore<T extends Record<string, any>>(obj: T): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined) {
      continue;
    }
    if (value !== null && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
      result[key] = sanitizeForFirestore(value);
    } else {
      result[key] = value;
    }
  }
  return result;
}

const LOCAL_STORAGE_SCHOOLS_KEY = 'lekolweb_custom_schools';
const LOCAL_STORAGE_ACADEMIC_YEARS_KEY = 'lekolweb_custom_academic_years';

function getCachedSchools(): School[] {
  try {
    if (typeof localStorage === 'undefined') return [];
    const raw = localStorage.getItem(LOCAL_STORAGE_SCHOOLS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveCachedSchool(school: School): void {
  try {
    if (typeof localStorage === 'undefined') return;
    const existing = getCachedSchools();
    const index = existing.findIndex(s => s.id === school.id || s.slug === school.slug);
    let updated: School[];
    if (index >= 0) {
      updated = [...existing];
      updated[index] = { ...existing[index], ...school };
    } else {
      updated = [school, ...existing];
    }
    localStorage.setItem(LOCAL_STORAGE_SCHOOLS_KEY, JSON.stringify(updated));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('lekolweb:schools-updated', { detail: school }));
    }
  } catch (e) {
    // safe fallback
  }
}

function saveAllCachedSchools(schools: School[]): void {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(LOCAL_STORAGE_SCHOOLS_KEY, JSON.stringify(schools));
  } catch {
    // ignore
  }
}

function getCachedAcademicYears(schoolId?: string): AcademicYear[] {
  try {
    if (typeof localStorage === 'undefined') return [];
    const raw = localStorage.getItem(LOCAL_STORAGE_ACADEMIC_YEARS_KEY);
    if (!raw) return [];
    const list: AcademicYear[] = JSON.parse(raw);
    if (schoolId) {
      return list.filter(y => y.schoolId === schoolId);
    }
    return list;
  } catch {
    return [];
  }
}

function saveCachedAcademicYear(year: AcademicYear): void {
  try {
    if (typeof localStorage === 'undefined') return;
    const existing = getCachedAcademicYears();
    const index = existing.findIndex(y => y.id === year.id || (y.schoolId === year.schoolId && y.name === year.name));
    let updated: AcademicYear[];
    if (index >= 0) {
      updated = [...existing];
      updated[index] = { ...existing[index], ...year };
    } else {
      updated = [year, ...existing];
    }
    localStorage.setItem(LOCAL_STORAGE_ACADEMIC_YEARS_KEY, JSON.stringify(updated));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('lekolweb:academic-years-updated', { detail: year }));
    }
  } catch (e) {
    // safe fallback
  }
}

function saveAllCachedAcademicYears(years: AcademicYear[]): void {
  try {
    if (typeof localStorage === 'undefined') return;
    const existing = getCachedAcademicYears();
    const map = new Map<string, AcademicYear>();
    for (const y of existing) {
      map.set(y.id, y);
    }
    for (const y of years) {
      map.set(y.id, y);
    }
    localStorage.setItem(LOCAL_STORAGE_ACADEMIC_YEARS_KEY, JSON.stringify(Array.from(map.values())));
  } catch {
    // ignore
  }
}

/**
 * Standard default academic years for Haitian schools
 */
function generateDefaultAcademicYears(schoolId: string): AcademicYear[] {
  const now = new Date().toISOString();
  return [
    {
      id: `ay-${schoolId}-2026-2027`,
      schoolId,
      name: '2026–2027',
      startDate: '2026-09-01',
      endDate: '2027-06-30',
      status: 'current',
      enrollmentOpen: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: `ay-${schoolId}-2027-2028`,
      schoolId,
      name: '2027–2028',
      startDate: '2027-09-01',
      endDate: '2028-06-30',
      status: 'upcoming',
      enrollmentOpen: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: `ay-${schoolId}-2025-2026`,
      schoolId,
      name: '2025–2026',
      startDate: '2025-09-01',
      endDate: '2026-06-30',
      status: 'past',
      enrollmentOpen: false,
      createdAt: now,
      updatedAt: now,
    },
  ];
}

/**
 * Normalizes a school name to a valid URL slug
 */
export function slugifySchoolName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

/**
 * Generates an official reference number for applications (e.g., LKW-2026-4821A)
 */
export function generateReferenceNumber(): string {
  const year = new Date().getFullYear();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const randomChar = String.fromCharCode(65 + Math.floor(Math.random() * 26));
  return `LKW-${year}-${randomSuffix}${randomChar}`;
}

export const schoolService = {
  /**
   * Purge residual demo schools and sample announcements from Firestore if any exist
   */
  async cleanupDemoData(): Promise<void> {
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.removeItem(LOCAL_STORAGE_SCHOOLS_KEY);
      } catch {
        // ignore
      }
    }

    const demoSchoolIds = [
      'institution-saint-louis',
      'college-frere-andre',
      'lycee-petionville',
      'regina-assumpta-cap',
    ];
    const demoAnnIds = ['ann-1', 'ann-2', 'ann-3', 'ann-4'];

    for (const sId of demoSchoolIds) {
      try {
        await deleteDoc(doc(db, 'schools', sId));
        await deleteDoc(doc(db, 'schools', sId, 'forms', 'new_enrollment'));
        await deleteDoc(doc(db, 'schools', sId, 'forms', 're_enrollment'));
      } catch {
        // Ignore
      }
    }

    for (const aId of demoAnnIds) {
      try {
        await deleteDoc(doc(db, 'announcements', aId));
      } catch {
        // Ignore
      }
    }
  },

  /**
   * Check if a slug is available
   */
  async checkSlugAvailability(slug: string): Promise<{ available: boolean; error?: string }> {
    const cleanSlug = slug.toLowerCase().trim();
    if (!cleanSlug || cleanSlug.length < 3) {
      return { available: false, error: 'L\'identifiant doit comporter au moins 3 caractères.' };
    }
    if (!/^[a-z0-9-]+$/.test(cleanSlug)) {
      return { available: false, error: 'Seules les lettres minuscules, chiffres et tirets sont autorisés.' };
    }
    if (RESERVED_SLUGS.has(cleanSlug)) {
      return { available: false, error: `Ce nom (${cleanSlug}) est réservé par la plateforme LekòlWeb.` };
    }
    try {
      const q = query(collection(db, 'schools'), where('slug', '==', cleanSlug));
      const snap = await getDocs(q);
      return { available: snap.empty, error: snap.empty ? undefined : 'Ce nom est déjà utilisé par une autre école.' };
    } catch {
      return { available: true };
    }
  },

  /**
   * Check if a school with similar name in the same commune already exists (anti-duplicate)
   */
  async findExistingSchool(name: string, commune: string): Promise<{
    exists: boolean;
    existingSchool?: { id: string; name: string; slug: string; commune: string };
  }> {
    const normalizedTarget = name.toLowerCase().trim().replace(/^(institution|college|ecole|lycee)\s+/i, '');
    try {
      const q = query(collection(db, 'schools'), where('commune', '==', commune));
      const snap = await getDocs(q);
      for (const d of snap.docs) {
        const s = d.data() as School;
        const normExisting = s.name.toLowerCase().trim().replace(/^(institution|college|ecole|lycee)\s+/i, '');
        if (normExisting === normalizedTarget || normExisting.includes(normalizedTarget) || normalizedTarget.includes(normExisting)) {
          return {
            exists: true,
            existingSchool: {
              id: d.id,
              name: s.name,
              slug: s.slug,
              commune: s.commune,
            },
          };
        }
      }
    } catch {
      // Return false if check fails
    }
    return { exists: false };
  },

  /**
   * Fetch all published schools for the discovery directory and homepage
   */
  async getPublishedSchools(filters?: {
    department?: string;
    commune?: string;
    schoolType?: string;
    level?: string;
    searchQuery?: string;
  }): Promise<School[]> {
    const map = new Map<string, School>();

    // 1. Fetch directly from Firestore (real database first)
    try {
      const schoolsRef = collection(db, 'schools');
      const snapshot = await getDocs(schoolsRef);

      snapshot.docs.forEach(d => {
        const s = {
          id: d.id,
          ...(d.data() as Omit<School, 'id'>),
        };
        if (s.status === 'published') {
          map.set(d.id, s);
        }
      });

      // Update cache with real Firestore documents
      saveAllCachedSchools(Array.from(map.values()));
    } catch (err) {
      console.warn('Could not fetch schools from Firestore, falling back to local cache:', err);
      // 2. Fallback to locally cached schools only if network/offline
      const cached = getCachedSchools();
      for (const s of cached) {
        if (s.status === 'published') {
          map.set(s.id, s);
        }
      }
    }

    let schools = Array.from(map.values());

    // Sort by createdAt / updatedAt descending so newest created schools appear first!
    schools.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

    if (filters?.department) {
      schools = schools.filter(s => s.department === filters.department);
    }
    if (filters?.commune) {
      schools = schools.filter(s => s.commune?.toLowerCase().includes(filters.commune!.toLowerCase()));
    }
    if (filters?.schoolType) {
      schools = schools.filter(s => s.schoolType === filters.schoolType);
    }
    if (filters?.level) {
      schools = schools.filter(s => s.levelsOffered?.some(l => l.toLowerCase().includes(filters.level!.toLowerCase())));
    }
    if (filters?.searchQuery) {
      const qLow = filters.searchQuery.toLowerCase();
      schools = schools.filter(
        s =>
          s.name.toLowerCase().includes(qLow) ||
          s.commune?.toLowerCase().includes(qLow) ||
          s.department?.toLowerCase().includes(qLow) ||
          s.description?.toLowerCase().includes(qLow)
      );
    }

    return schools;
  },

  /**
   * Get a school by slug
   */
  async getSchoolBySlug(slug: string): Promise<School | null> {
    const cleanSlug = slug.toLowerCase().trim();

    try {
      const q = query(collection(db, 'schools'), where('slug', '==', cleanSlug));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const docSnap = snap.docs[0];
        const s = { id: docSnap.id, ...(docSnap.data() as Omit<School, 'id'>) };
        saveCachedSchool(s);
        return s;
      }

      // Check if parameter is a direct document ID
      const directDoc = await getDoc(doc(db, 'schools', cleanSlug));
      if (directDoc.exists()) {
        const s = { id: directDoc.id, ...(directDoc.data() as Omit<School, 'id'>) };
        saveCachedSchool(s);
        return s;
      }
    } catch {
      // Fallback to cache
    }

    const cached = getCachedSchools();
    const found = cached.find(s => s.slug?.toLowerCase().trim() === cleanSlug);
    if (found) return found;

    return null;
  },

  /**
   * Get a school by ID
   */
  async getSchoolById(schoolId: string): Promise<School | null> {
    try {
      const docSnap = await getDoc(doc(db, 'schools', schoolId));
      if (docSnap.exists()) {
        const s = { id: docSnap.id, ...(docSnap.data() as Omit<School, 'id'>) };
        saveCachedSchool(s);
        return s;
      }
    } catch {
      // Fallback
    }

    const cached = getCachedSchools();
    return cached.find(s => s.id === schoolId) || null;
  },

  /**
   * Fetch all schools accessible by a director or invited staff member
   */
  async getSchoolsForDirector(userId: string, userEmail?: string): Promise<School[]> {
    if (!userId || userId === 'demo-director' || userId === 'director-primary') {
      return [];
    }

    const map = new Map<string, School>();

    try {
      const schoolsRef = collection(db, 'schools');
      // Fetch schools owned by director directly from Firestore
      const qOwner = query(schoolsRef, where('ownerId', '==', userId));
      const snapOwner = await getDocs(qOwner);

      snapOwner.docs.forEach(d => {
        const s = { id: d.id, ...(d.data() as Omit<School, 'id'>) };
        map.set(d.id, s);
        saveCachedSchool(s);
      });

      // Also fetch schools where user is listed in staffIds
      try {
        const qStaff = query(schoolsRef, where('staffIds', 'array-contains', userId));
        const snapStaff = await getDocs(qStaff);
        snapStaff.docs.forEach(d => {
          const s = { id: d.id, ...(d.data() as Omit<School, 'id'>) };
          map.set(d.id, s);
          saveCachedSchool(s);
        });
      } catch {
        // array-contains query if available
      }
    } catch (err) {
      console.warn('Firestore getSchoolsForDirector error, falling back to cache:', err);
      const cached = getCachedSchools();
      for (const s of cached) {
        if (s.ownerId === userId || (s.staffIds && s.staffIds.includes(userId))) {
          map.set(s.id, s);
        }
      }
    }

    return Array.from(map.values()).sort(
      (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
  },

  /**
   * Create a new school for a director
   */
  async createSchool(
    directorUid: string,
    schoolData: {
      name: string;
      schoolType: 'private' | 'public' | 'congregational';
      department: string;
      commune: string;
      address: string;
      publicPhone: string;
      publicEmail?: string;
      whatsappPhone?: string;
      levelsOffered: string[];
      description?: string;
      logoUrl?: string;
      coverImageUrl?: string;
      motto?: string;
      foundedYear?: number;
      publishImmediately?: boolean;
    }
  ): Promise<School> {
    if (!directorUid || directorUid === 'director-primary' || directorUid === 'demo-director') {
      throw new Error('Vous devez être connecté avec un compte Directeur réel pour enregistrer un établissement.');
    }

    const slug = slugifySchoolName(schoolData.name) || 'etablissement';
    const schoolId = `sch-${slug.slice(0, 45)}-${Date.now().toString().slice(-4)}${Math.floor(100 + Math.random() * 900)}`;
    const now = new Date().toISOString();

    const newSchool: School = {
      id: schoolId,
      ownerId: directorUid,
      name: schoolData.name.trim(),
      slug,
      description: schoolData.description?.trim() || `Bienvenue sur le profil officiel de l'établissement ${schoolData.name.trim()} sur LekòlWeb.`,
      schoolType: schoolData.schoolType,
      department: schoolData.department,
      commune: schoolData.commune,
      address: schoolData.address,
      publicEmail: schoolData.publicEmail?.trim() || '',
      publicPhone: schoolData.publicPhone.trim(),
      whatsappPhone: schoolData.whatsappPhone?.trim() || '',
      logoUrl: schoolData.logoUrl || '/LekòlWeb.png',
      coverImageUrl: schoolData.coverImageUrl || 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
      status: schoolData.publishImmediately !== false ? 'published' : 'draft',
      verificationStatus: 'unverified',
      levelsOffered: schoolData.levelsOffered && schoolData.levelsOffered.length > 0
        ? schoolData.levelsOffered
        : ['Fondamental 1er cycle (1ère à 3ème AF)'],
      languages: ['Français', 'Créole haïtien'],
      newEnrollmentOpen: true,
      reEnrollmentOpen: true,
      staffIds: [],
      staffMembers: [],
      currentAcademicYearId: `ay-${schoolId}-2026-2027`,
      currentAcademicYearName: '2026–2027',
      motto: schoolData.motto || '',
      foundedYear: schoolData.foundedYear || new Date().getFullYear(),
      publishedAt: now,
      createdAt: now,
      updatedAt: now,
    };

    // Initialize standard default academic years for the school
    const defaultYears = generateDefaultAcademicYears(schoolId);

    // 1. Commit primary school record to real Firestore database
    const sanitizedSchool = sanitizeForFirestore(newSchool);
    try {
      await setDoc(doc(db, 'schools', schoolId), sanitizedSchool);
    } catch (err: any) {
      console.error('CRITICAL: Firestore setDoc failed for school:', err);
      throw new Error(`Échec de l'enregistrement dans la base de données Firestore : ${err.message || 'Permissions insuffisantes'}`);
    }

    // 2. Persist default academic years to Firestore subcollection
    for (const y of defaultYears) {
      try {
        await setDoc(doc(db, 'schools', schoolId, 'academicYears', y.id), sanitizeForFirestore(y));
      } catch (err) {
        console.warn(`Subcollection academicYears/${y.id} notice:`, err);
      }
    }

    // 3. Initialize default forms for new school
    try {
      await setDoc(doc(db, 'schools', schoolId, 'forms', 'new_enrollment'), sanitizeForFirestore({
        id: 'new_enrollment',
        schoolId,
        formType: 'new_enrollment',
        title: `Demande de Nouvelle Inscription — ${newSchool.name}`,
        description: 'Formulaire officiel d\'admission pour les nouveaux élèves.',
        instructions: 'Veuillez remplir l\'ensemble des informations requises avec précision.',
        status: 'open',
        requiredDocuments: ['Extrait d\'acte de naissance', 'Dernier bulletin scolaire'],
        fields: DEFAULT_NEW_ENROLLMENT_FIELDS,
        confirmationMessage: 'Votre demande de nouvelle admission a été soumise avec succès.',
        version: 1,
        createdAt: now,
        updatedAt: now,
      } as ApplicationForm));

      await setDoc(doc(db, 'schools', schoolId, 'forms', 're_enrollment'), sanitizeForFirestore({
        id: 're_enrollment',
        schoolId,
        formType: 're_enrollment',
        title: `Confirmation de Réinscription — ${newSchool.name}`,
        description: 'Réservé aux élèves déjà inscrits dans l\'établissement.',
        instructions: 'Vérifiez et confirmez les informations de votre enfant pour la nouvelle année scolaire.',
        status: 'open',
        requiredDocuments: ['Reçu de paiement de réinscription'],
        fields: DEFAULT_RE_ENROLLMENT_FIELDS,
        confirmationMessage: 'Votre confirmation de réinscription a bien été enregistrée.',
        version: 1,
        createdAt: now,
        updatedAt: now,
      } as ApplicationForm));
    } catch (err) {
      console.warn('Subcollection forms initialization notice:', err);
    }

    // Cache locally for fast subsequent renders
    saveCachedSchool(newSchool);
    defaultYears.forEach(y => saveCachedAcademicYear(y));

    // Notify all directory and homepage components
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('lekolweb:schools-updated', { detail: newSchool }));
    }

    return newSchool;
  },

  /**
   * Update school profile
   */
  async updateSchoolProfile(schoolId: string, updates: Partial<School>): Promise<School> {
    const now = new Date().toISOString();
    const dataToUpdate = sanitizeForFirestore({ ...updates, updatedAt: now });

    try {
      await updateDoc(doc(db, 'schools', schoolId), dataToUpdate);
    } catch (err: any) {
      console.error('School profile updated Firestore error:', err);
      throw new Error(`Échec de la mise à jour dans Firestore : ${err.message || 'Permissions insuffisantes'}`);
    }

    const current = await this.getSchoolById(schoolId);
    const result = { ...((current || updates) as School), ...dataToUpdate };
    saveCachedSchool(result);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('lekolweb:schools-updated', { detail: result }));
    }

    return result;
  },

  /**
   * Alias for updateSchoolProfile
   */
  async updateSchool(schoolId: string, updates: Partial<School>): Promise<School> {
    return this.updateSchoolProfile(schoolId, updates);
  },

  /**
   * Update school verification status (Super-Admin)
   */
  async updateVerificationStatus(schoolId: string, status: import('../types').VerificationStatus): Promise<void> {
    const now = new Date().toISOString();
    try {
      await updateDoc(doc(db, 'schools', schoolId), {
        verificationStatus: status,
        updatedAt: now,
      });
    } catch {
      // safe fallback
    }
  },

  /**
   * Get all schools for admin supervision
   */
  async getSchools(): Promise<School[]> {
    const map = new Map<string, School>();
    const cached = getCachedSchools();
    for (const s of cached) {
      map.set(s.id, s);
    }
    try {
      const snap = await getDocs(collection(db, 'schools'));
      snap.docs.forEach(d => {
        const s = { id: d.id, ...(d.data() as Omit<School, 'id'>) };
        map.set(d.id, s);
      });
      saveAllCachedSchools(Array.from(map.values()));
    } catch {
      // fallback
    }
    return Array.from(map.values()).sort(
      (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
  },

  /**
   * Alias for cleanupDemoData
   */
  async seedDemoSchool(): Promise<void> {
    return this.cleanupDemoData();
  },

  // ==========================================
  // ACADEMIC YEARS MANAGEMENT
  // ==========================================

  /**
   * Fetch all academic years for a school
   */
  async getAcademicYears(schoolId: string): Promise<AcademicYear[]> {
    const map = new Map<string, AcademicYear>();

    // 1. Seed from local cache
    const cached = getCachedAcademicYears(schoolId);
    for (const y of cached) {
      map.set(y.id, y);
    }

    // 2. Fetch from Firestore subcollection
    try {
      const colRef = collection(db, 'schools', schoolId, 'academicYears');
      const snap = await getDocs(colRef);
      if (!snap.empty) {
        snap.docs.forEach(d => {
          const item = { id: d.id, ...(d.data() as Omit<AcademicYear, 'id'>) };
          map.set(d.id, item);
          saveCachedAcademicYear(item);
        });
      } else if (map.size === 0) {
        // Automatically initialize default academic years for this school if none exist
        const defaults = generateDefaultAcademicYears(schoolId);
        for (const item of defaults) {
          map.set(item.id, item);
          saveCachedAcademicYear(item);
          try {
            await setDoc(doc(db, 'schools', schoolId, 'academicYears', item.id), sanitizeForFirestore(item));
          } catch {
            // ignore
          }
        }
      }
    } catch (err) {
      console.warn('Firestore getAcademicYears fallback:', err);
      if (map.size === 0) {
        const defaults = generateDefaultAcademicYears(schoolId);
        for (const item of defaults) {
          map.set(item.id, item);
          saveCachedAcademicYear(item);
        }
      }
    }

    const items = Array.from(map.values());
    const orderScore = (y: AcademicYear) => (y.status === 'current' ? 0 : y.status === 'upcoming' ? 1 : 2);
    return items.sort((a, b) => {
      const scoreDiff = orderScore(a) - orderScore(b);
      if (scoreDiff !== 0) return scoreDiff;
      return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
    });
  },

  /**
   * Fetch academic years with open enrollment for parent applications
   * Never returns past academic years or closed enrollment years
   */
  async getOpenAcademicYears(schoolId: string): Promise<AcademicYear[]> {
    const all = await this.getAcademicYears(schoolId);
    return all.filter(y => y.enrollmentOpen === true && y.status !== 'past');
  },

  /**
   * Create a new academic year for a school
   */
  async createAcademicYear(
    schoolId: string,
    data: {
      name: string;
      startDate: string;
      endDate: string;
      status: AcademicYearStatus;
      enrollmentOpen: boolean;
    }
  ): Promise<AcademicYear> {
    const slugName = slugifySchoolName(data.name);
    const id = `ay-${slugifySchoolName(schoolId)}-${slugName}-${Date.now()}`;
    const now = new Date().toISOString();

    const isEnrollmentOpen = data.status === 'past' ? false : data.enrollmentOpen;

    const newYear: AcademicYear = {
      id,
      schoolId,
      name: data.name.trim(),
      startDate: data.startDate,
      endDate: data.endDate,
      status: data.status,
      enrollmentOpen: isEnrollmentOpen,
      createdAt: now,
      updatedAt: now,
    };

    if (data.status === 'current') {
      const existingYears = await this.getAcademicYears(schoolId);
      for (const y of existingYears) {
        if (y.status === 'current' && y.id !== id) {
          const newStatus: AcademicYearStatus = new Date(y.endDate).getTime() < new Date(data.startDate).getTime() ? 'past' : 'upcoming';
          const updatedOld: AcademicYear = {
            ...y,
            status: newStatus,
            enrollmentOpen: newStatus === 'past' ? false : y.enrollmentOpen,
            updatedAt: now,
          };
          saveCachedAcademicYear(updatedOld);
          try {
            await updateDoc(doc(db, 'schools', schoolId, 'academicYears', y.id), sanitizeForFirestore(updatedOld));
          } catch {
            // ignore
          }
        }
      }
      try {
        await this.updateSchoolProfile(schoolId, {
          currentAcademicYearId: id,
          currentAcademicYearName: newYear.name,
        });
      } catch {
        // ignore
      }
    }

    saveCachedAcademicYear(newYear);

    try {
      await setDoc(doc(db, 'schools', schoolId, 'academicYears', id), sanitizeForFirestore(newYear));
    } catch (err) {
      console.warn('Academic year saved locally, Firestore error:', err);
    }

    return newYear;
  },

  /**
   * Update an academic year
   */
  async updateAcademicYear(
    schoolId: string,
    yearId: string,
    updates: Partial<AcademicYear>
  ): Promise<AcademicYear> {
    const now = new Date().toISOString();
    const existingYears = await this.getAcademicYears(schoolId);
    const existing = existingYears.find(y => y.id === yearId);
    if (!existing) {
      throw new Error('Année académique introuvable.');
    }

    const finalStatus = updates.status || existing.status;
    let finalEnrollmentOpen = updates.enrollmentOpen !== undefined ? updates.enrollmentOpen : existing.enrollmentOpen;
    if (finalStatus === 'past') {
      finalEnrollmentOpen = false;
    }

    if (updates.status === 'current' && existing.status !== 'current') {
      for (const y of existingYears) {
        if (y.id !== yearId && y.status === 'current') {
          const demotedStatus: AcademicYearStatus = new Date(y.endDate).getTime() < new Date(updates.startDate || existing.startDate).getTime() ? 'past' : 'upcoming';
          const updatedOther: AcademicYear = {
            ...y,
            status: demotedStatus,
            enrollmentOpen: demotedStatus === 'past' ? false : y.enrollmentOpen,
            updatedAt: now,
          };
          saveCachedAcademicYear(updatedOther);
          try {
            await updateDoc(doc(db, 'schools', schoolId, 'academicYears', y.id), sanitizeForFirestore(updatedOther));
          } catch {
            // ignore
          }
        }
      }
      try {
        await this.updateSchoolProfile(schoolId, {
          currentAcademicYearId: yearId,
          currentAcademicYearName: updates.name || existing.name,
        });
      } catch {
        // ignore
      }
    }

    const updated: AcademicYear = {
      ...existing,
      ...updates,
      status: finalStatus,
      enrollmentOpen: finalEnrollmentOpen,
      updatedAt: now,
    };

    saveCachedAcademicYear(updated);

    try {
      await updateDoc(doc(db, 'schools', schoolId, 'academicYears', yearId), sanitizeForFirestore(updated));
    } catch (err) {
      console.warn('Academic year updated locally, DB sync error:', err);
    }

    return updated;
  },

  /**
   * Set the current academic year for a school
   */
  async setCurrentAcademicYear(schoolId: string, yearId: string): Promise<void> {
    await this.updateAcademicYear(schoolId, yearId, { status: 'current' });
  },

  /**
   * Open or close enrollment for an academic year
   */
  async toggleEnrollmentAvailability(schoolId: string, yearId: string, isOpen: boolean): Promise<AcademicYear> {
    const existingYears = await this.getAcademicYears(schoolId);
    const existing = existingYears.find(y => y.id === yearId);
    if (!existing) {
      throw new Error('Année académique introuvable.');
    }
    if (existing.status === 'past' && isOpen) {
      throw new Error('Impossible d\'ouvrir les inscriptions pour une année académique passée.');
    }
    return this.updateAcademicYear(schoolId, yearId, { enrollmentOpen: isOpen });
  },

  // ==========================================
  // FORM BUILDER & FORMS
  // ==========================================

  /**
   * Get an application form for a school (new_enrollment or re_enrollment)
   */
  async getApplicationForm(schoolId: string, formType: FormType): Promise<ApplicationForm> {
    try {
      const docSnap = await getDoc(doc(db, 'schools', schoolId, 'forms', formType));
      if (docSnap.exists()) {
        return docSnap.data() as ApplicationForm;
      }
    } catch {
      // fallback
    }

    // Default starter form if not found
    const isNew = formType === 'new_enrollment';
    return {
      id: formType,
      schoolId,
      formType,
      title: isNew ? 'Demande de Nouvelle Inscription' : 'Confirmation de Réinscription',
      description: isNew
        ? 'Formulaire officiel d\'admission pour les nouveaux élèves.'
        : 'Formulaire de confirmation pour les élèves déjà inscrits.',
      instructions: 'Remplissez soigneusement les champs obligatoires.',
      status: 'open',
      requiredDocuments: isNew
        ? ['Extrait d\'acte de naissance', 'Dernier bulletin scolaire']
        : ['Reçu des frais de réinscription'],
      fields: isNew ? DEFAULT_NEW_ENROLLMENT_FIELDS : DEFAULT_RE_ENROLLMENT_FIELDS,
      confirmationMessage: 'Votre demande a été soumise avec succès.',
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  },

  /**
   * Save an application form (incrementing version for audit/history consistency)
   */
  async saveApplicationForm(
    schoolId: string,
    formType: FormType,
    formData: Partial<ApplicationForm>
  ): Promise<ApplicationForm> {
    const existing = await this.getApplicationForm(schoolId, formType);
    const now = new Date().toISOString();
    const newVersion = (existing.version || 1) + 1;

    const updatedForm: ApplicationForm = {
      ...existing,
      ...formData,
      version: newVersion,
      updatedAt: now,
    };

    try {
      await setDoc(doc(db, 'schools', schoolId, 'forms', formType), updatedForm, { merge: true });
    } catch (err) {
      console.warn('Form saved locally:', err);
    }

    return updatedForm;
  },

  // ==========================================
  // ANNOUNCEMENTS
  // ==========================================

  /**
   * Get published announcements (all for public feed, or filtered by school and academic year)
   */
  async getAnnouncements(
    schoolId?: string,
    includeDrafts: boolean = false,
    academicYearId?: string
  ): Promise<Announcement[]> {
    try {
      const ref = collection(db, 'announcements');
      let q = query(ref);

      if (schoolId) {
        q = includeDrafts
          ? query(ref, where('schoolId', '==', schoolId))
          : query(ref, where('schoolId', '==', schoolId), where('status', '==', 'published'));
      } else {
        q = query(ref, where('status', '==', 'published'));
      }

      const snap = await getDocs(q);
      let items: Announcement[] = snap.docs.map(d => ({
        id: d.id,
        ...(d.data() as Omit<Announcement, 'id'>),
      }));

      if (academicYearId && academicYearId !== 'all') {
        items = items.filter(a => a.academicYearId === academicYearId);
      }

      if (items.length > 0) {
        return items.sort((a, b) => new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime());
      }
    } catch {
      // Fallback
    }

    return [];
  },

  /**
   * Save an announcement with optional academic year association
   */
  async saveAnnouncement(
    schoolId: string,
    schoolName: string,
    annData: Partial<Announcement>,
    annId?: string
  ): Promise<Announcement> {
    const id = annId || `ann-${Date.now()}`;
    const now = new Date().toISOString();

    const fullItem: Announcement = {
      id,
      schoolId,
      schoolName,
      academicYearId: annData.academicYearId || undefined,
      academicYearName: annData.academicYearName || undefined,
      title: annData.title || 'Annonce sans titre',
      content: annData.content || '',
      category: annData.category || 'general',
      status: annData.status || 'published',
      imageUrl: annData.imageUrl,
      attachmentName: annData.attachmentName,
      attachmentUrl: annData.attachmentUrl,
      startDate: annData.startDate,
      endDate: annData.endDate,
      publishedAt: annData.status === 'published' ? (annData.publishedAt || now) : undefined,
      createdAt: annData.createdAt || now,
      updatedAt: now,
    };

    try {
      await setDoc(doc(db, 'announcements', id), sanitizeForFirestore(fullItem), { merge: true });
    } catch (err) {
      console.warn('Announcement saved locally:', err);
    }

    return fullItem;
  },

  /**
   * Archive an announcement without deleting it
   */
  async archiveAnnouncement(announcementId: string): Promise<void> {
    const now = new Date().toISOString();
    try {
      await updateDoc(doc(db, 'announcements', announcementId), {
        status: 'archived',
        updatedAt: now,
      });
    } catch (err) {
      console.warn('Announcement archive error:', err);
    }
  },

  /**
   * Delete an announcement
   */
  async deleteAnnouncement(announcementId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'announcements', announcementId));
    } catch {
      // Ignore
    }
  },

  // ==========================================
  // CHILD PROFILES (Parent Common App System)
  // ==========================================

  /**
   * Fetch all child profiles created by a parent
   */
  async getChildrenForParent(parentId: string): Promise<ChildProfile[]> {
    try {
      const q = query(collection(db, 'children'), where('parentId', '==', parentId));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({
        id: d.id,
        ...(d.data() as Omit<ChildProfile, 'id'>),
      }));
    } catch {
      // Return empty array if not initialized
      return [];
    }
  },

  /**
   * Save or create a child profile
   */
  async saveChildProfile(
    parentId: string,
    childData: Omit<ChildProfile, 'id' | 'parentId' | 'createdAt' | 'updatedAt'>,
    childId?: string
  ): Promise<ChildProfile> {
    const id = childId || `chd-${Date.now()}`;
    const now = new Date().toISOString();

    const profile: ChildProfile = {
      id,
      parentId,
      ...childData,
      createdAt: now,
      updatedAt: now,
    };

    try {
      await setDoc(doc(db, 'children', id), profile, { merge: true });
    } catch (err) {
      console.warn('Child profile saved in memory:', err);
    }

    return profile;
  },

  /**
   * Delete a child profile
   */
  async deleteChildProfile(childId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'children', childId));
    } catch {
      // Ignore
    }
  },

  // ==========================================
  // APPLICATIONS WORKFLOW (Common App Submission)
  // ==========================================

  /**
   * Submit an application to a school
   */
  async submitApplication(applicationData: {
    schoolId: string;
    schoolName: string;
    schoolSlug?: string;
    schoolCommune?: string;
    academicYearId: string;
    academicYearName?: string;
    applicantId: string;
    childId?: string;
    studentName: string;
    studentDob?: string;
    studentGender?: string;
    formType: FormType;
    requestedLevel: string;
    previousSchool?: string;
    guardianName: string;
    guardianPhone: string;
    guardianEmail?: string;
    guardianAddress?: string;
    answers: Record<string, any>;
    uploadedDocuments?: { name: string; url: string; type?: string }[];
    status?: ApplicationStatus;
  }): Promise<Application> {
    if (!applicationData.academicYearId) {
      throw new Error('Veuillez sélectionner une année académique valide pour votre candidature.');
    }

    // Validate academic year availability before accepting application
    const academicYears = await this.getAcademicYears(applicationData.schoolId);
    const targetYear = academicYears.find(y => y.id === applicationData.academicYearId);
    if (!targetYear) {
      throw new Error('L\'année académique sélectionnée n\'existe pas pour cet établissement.');
    }
    if (targetYear.status === 'past') {
      throw new Error('Les inscriptions pour une année académique passée ne sont plus autorisées.');
    }
    if (!targetYear.enrollmentOpen) {
      throw new Error(`Les inscriptions sont actuellement fermées pour l'année académique ${targetYear.name}.`);
    }

    const resolvedYearName = applicationData.academicYearName || targetYear.name;

    const refNumber = generateReferenceNumber();
    const id = `app-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
    const now = new Date().toISOString();

    // Snapshot form version
    const formConfig = await this.getApplicationForm(applicationData.schoolId, applicationData.formType);

    const appRecord: Application = {
      id,
      referenceNumber: refNumber,
      schoolId: applicationData.schoolId,
      schoolName: applicationData.schoolName,
      schoolSlug: applicationData.schoolSlug,
      schoolCommune: applicationData.schoolCommune,
      academicYearId: applicationData.academicYearId,
      academicYearName: resolvedYearName,
      applicantId: applicationData.applicantId,
      childId: applicationData.childId,
      studentName: applicationData.studentName.trim(),
      studentDob: applicationData.studentDob,
      studentGender: applicationData.studentGender,
      formType: applicationData.formType,
      formVersion: formConfig.version || 1,
      formSnapshot: formConfig,
      requestedLevel: applicationData.requestedLevel,
      previousSchool: applicationData.previousSchool,
      guardianName: applicationData.guardianName.trim(),
      guardianPhone: applicationData.guardianPhone.trim(),
      guardianEmail: applicationData.guardianEmail?.trim(),
      guardianAddress: applicationData.guardianAddress,
      answers: applicationData.answers,
      uploadedDocuments: applicationData.uploadedDocuments || [],
      status: applicationData.status || 'submitted',
      statusHistory: [
        {
          status: applicationData.status || 'submitted',
          timestamp: now,
          note: `Dossier transmis avec succès via LekòlWeb au titre de l'année scolaire ${resolvedYearName}.`,
          updatedBy: 'Parent / Candidat',
        },
      ],
      submittedAt: now,
      updatedAt: now,
    };

    try {
      await setDoc(doc(db, 'applications', id), sanitizeForFirestore(appRecord));
    } catch (err) {
      console.warn('Application submitted in memory:', err);
    }

    return appRecord;
  },

  /**
   * Fetch all applications for a parent across all schools
   */
  async getApplicationsForParent(parentId: string): Promise<Application[]> {
    try {
      const q = query(collection(db, 'applications'), where('applicantId', '==', parentId));
      const snap = await getDocs(q);
      const apps = snap.docs.map(d => ({
        id: d.id,
        ...(d.data() as Omit<Application, 'id'>),
      }));
      return apps.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
    } catch {
      return [];
    }
  },

  /**
   * Fetch applications for a specific school (for directors / staff)
   */
  async getApplicationsForSchool(
    schoolId: string,
    filters?: {
      formType?: FormType;
      status?: ApplicationStatus;
      academicYearId?: string;
      searchQuery?: string;
    }
  ): Promise<Application[]> {
    try {
      const q = query(collection(db, 'applications'), where('schoolId', '==', schoolId));
      const snap = await getDocs(q);
      let apps = snap.docs.map(d => ({
        id: d.id,
        ...(d.data() as Omit<Application, 'id'>),
      }));

      if (filters?.academicYearId && filters.academicYearId !== 'all') {
        apps = apps.filter(a => a.academicYearId === filters.academicYearId);
      }
      if (filters?.formType) {
        apps = apps.filter(a => a.formType === filters.formType);
      }
      if (filters?.status) {
        apps = apps.filter(a => a.status === filters.status);
      }
      if (filters?.searchQuery) {
        const qLow = filters.searchQuery.toLowerCase();
        apps = apps.filter(
          a =>
            a.studentName.toLowerCase().includes(qLow) ||
            a.guardianName.toLowerCase().includes(qLow) ||
            a.referenceNumber.toLowerCase().includes(qLow) ||
            a.academicYearName?.toLowerCase().includes(qLow)
        );
      }

      return apps.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
    } catch {
      return [];
    }
  },

  /**
   * Update application status (accepted, under_review, waitlisted, etc.)
   */
  async updateApplicationStatus(
    applicationId: string,
    newStatus: ApplicationStatus,
    statusNote: string | undefined,
    updatedByName: string
  ): Promise<void> {
    const now = new Date().toISOString();
    try {
      const appRef = doc(db, 'applications', applicationId);
      const appSnap = await getDoc(appRef);
      if (appSnap.exists()) {
        const app = appSnap.data() as Application;
        const newHistory = [
          ...(app.statusHistory || []),
          {
            status: newStatus,
            timestamp: now,
            note: statusNote || `Statut mis à jour vers : ${newStatus}`,
            updatedBy: updatedByName,
          },
        ];

        await updateDoc(appRef, {
          status: newStatus,
          statusNote: statusNote || '',
          statusHistory: newHistory,
          updatedAt: now,
        });
      }
    } catch {
      // Ignore
    }
  },

  /**
   * Update private internal notes for an application (school staff only)
   */
  async updateApplicationInternalNotes(applicationId: string, internalNotes: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'applications', applicationId), {
        internalNotes,
        updatedAt: new Date().toISOString(),
      });
    } catch {
      // Ignore
    }
  },

  // ==========================================
  // STAFF & PERMISSIONS INVITATIONS
  // ==========================================

  /**
   * Get staff members for a school
   */
  async getSchoolStaff(schoolId: string): Promise<SchoolStaffMember[]> {
    try {
      const school = await this.getSchoolById(schoolId);
      return school?.staffMembers || [];
    } catch {
      return [];
    }
  },

  /**
   * Invite an administrator to help manage a school
   */
  async inviteStaffMember(
    schoolId: string,
    staffData: {
      email: string;
      displayName: string;
      permissions: StaffPermissions;
      invitedBy: string;
    }
  ): Promise<SchoolStaffMember> {
    const id = `stf-${Date.now()}`;
    const now = new Date().toISOString();

    const newMember: SchoolStaffMember = {
      id,
      email: staffData.email.toLowerCase().trim(),
      displayName: staffData.displayName.trim(),
      role: 'staff',
      permissions: staffData.permissions,
      status: 'pending',
      invitedAt: now,
    };

    try {
      const sRef = doc(db, 'schools', schoolId);
      const sSnap = await getDoc(sRef);
      if (sSnap.exists()) {
        const currentSchool = sSnap.data() as School;
        const members = currentSchool.staffMembers || [];
        const updated = [...members.filter(m => m.email !== newMember.email), newMember];
        await updateDoc(sRef, {
          staffMembers: updated,
          updatedAt: now,
        });
      }
    } catch (err) {
      console.warn('Staff member invited in memory:', err);
    }

    return newMember;
  },

  /**
   * Update staff permissions
   */
  async updateStaffPermissions(
    schoolId: string,
    staffId: string,
    permissions: Partial<StaffPermissions>
  ): Promise<void> {
    try {
      const sRef = doc(db, 'schools', schoolId);
      const sSnap = await getDoc(sRef);
      if (sSnap.exists()) {
        const s = sSnap.data() as School;
        const members = (s.staffMembers || []).map(m => {
          if (m.id === staffId) {
            return {
              ...m,
              permissions: { ...m.permissions, ...permissions },
            };
          }
          return m;
        });
        await updateDoc(sRef, { staffMembers: members, updatedAt: new Date().toISOString() });
      }
    } catch {
      // Ignore
    }
  },

  /**
   * Revoke or remove staff member
   */
  async revokeStaffMember(schoolId: string, staffId: string): Promise<void> {
    try {
      const sRef = doc(db, 'schools', schoolId);
      const sSnap = await getDoc(sRef);
      if (sSnap.exists()) {
        const s = sSnap.data() as School;
        const members = (s.staffMembers || []).filter(m => m.id !== staffId);
        await updateDoc(sRef, { staffMembers: members, updatedAt: new Date().toISOString() });
      }
    } catch {
      // Ignore
    }
  },
};
