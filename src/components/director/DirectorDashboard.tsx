import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  Archive,
  ArrowRight,
  Bell,
  BookOpen,
  Building,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  Copy,
  Download,
  Edit2,
  ExternalLink,
  Eye,
  FileCheck,
  FileSpreadsheet,
  FileText,
  Filter,
  GraduationCap,
  HelpCircle,
  LayoutDashboard,
  Lock,
  Mail,
  MapPin,
  Megaphone,
  MessageCircle,
  MessageSquare,
  MoveDown,
  MoveUp,
  Palette,
  Phone,
  Plus,
  RefreshCw,
  School as SchoolIcon,
  Search,
  Send,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Trash2,
  UserCheck,
  Users,
  Wand2,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  DEFAULT_NEW_ENROLLMENT_FIELDS,
  DEFAULT_RE_ENROLLMENT_FIELDS,
  HAITIAN_COMMUNES_BY_DEPARTMENT,
  HAITIAN_DEPARTMENTS,
  SCHOOL_LEVELS,
} from '../../lib/constants';
import { schoolService, slugifySchoolName } from '../../services/schoolService';
import {
  AcademicYear,
  AcademicYearStatus,
  Announcement,
  AnnouncementCategory,
  Application,
  ApplicationForm,
  ApplicationStatus,
  FormField,
  FormFieldType,
  FormType,
  School,
  SchoolStaffMember,
  StaffPermissions,
} from '../../types';

interface DirectorDashboardProps {
  onViewSchoolProfile: (slug: string) => void;
  onNavigateToAuth?: (mode: 'login' | 'register', role?: 'principal' | 'parent') => void;
}

export function DirectorDashboard({ onViewSchoolProfile, onNavigateToAuth }: DirectorDashboardProps) {
  const { currentUser, userProfile, isAdmin } = useAuth();

  // Multi-school state
  const [schools, setSchools] = useState<School[]>([]);
  const [currentSchool, setCurrentSchool] = useState<School | null>(null);
  const [loading, setLoading] = useState(true);

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<
    'overview' | 'profile' | 'academic_years' | 'form_builder' | 'applications' | 'announcements' | 'staff'
  >('overview');

  // New School Modal state
  const [showAddSchoolModal, setShowAddSchoolModal] = useState(false);
  const [newSchoolName, setNewSchoolName] = useState('');
  const [newSchoolType, setNewSchoolType] = useState<'private' | 'public' | 'congregational'>('congregational');
  const [newSchoolDept, setNewSchoolDept] = useState('Ouest');
  const [newSchoolCommune, setNewSchoolCommune] = useState('Port-au-Prince');
  const [newSchoolAddress, setNewSchoolAddress] = useState('');
  const [newSchoolPhone, setNewSchoolPhone] = useState('+509 ');
  const [newSchoolEmail, setNewSchoolEmail] = useState('');
  const [newSchoolLevels, setNewSchoolLevels] = useState<string[]>([
    'Fondamental 1er Cycle (1ère à 4ème Année)',
    'Fondamental 2ème Cycle (5ème et 6ème Année)',
    'Fondamental 3ème Cycle (7ème, 8ème, 9ème A.F.)',
  ]);
  const [newSchoolDesc, setNewSchoolDesc] = useState('');
  const [newSchoolSaving, setNewSchoolSaving] = useState(false);
  const [newSchoolDuplicateWarning, setNewSchoolDuplicateWarning] = useState<string | null>(null);
  const [createSchoolError, setCreateSchoolError] = useState<string | null>(null);

  // Form Builder state
  const [activeFormType, setActiveFormType] = useState<FormType>('new_enrollment');
  const [currentForm, setCurrentForm] = useState<ApplicationForm | null>(null);
  const [formSaving, setFormSaving] = useState(false);
  const [formSavedNotice, setFormSavedNotice] = useState(false);
  const [showAddFieldModal, setShowAddFieldModal] = useState(false);
  const [newFieldLabel, setNewFieldLabel] = useState('');
  const [newFieldType, setNewFieldType] = useState<FormFieldType>('short_text');
  const [newFieldInstructions, setNewFieldInstructions] = useState('');
  const [newFieldRequired, setNewFieldRequired] = useState(false);
  const [newFieldOptions, setNewFieldOptions] = useState('');
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Academic Years state
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [showAddYearModal, setShowAddYearModal] = useState(false);
  const [editingYear, setEditingYear] = useState<AcademicYear | null>(null);
  const [yearName, setYearName] = useState('2026–2027');
  const [yearStartDate, setYearStartDate] = useState('2026-09-01');
  const [yearEndDate, setYearEndDate] = useState('2027-06-30');
  const [yearStatus, setYearStatus] = useState<AcademicYearStatus>('upcoming');
  const [yearEnrollmentOpen, setYearEnrollmentOpen] = useState(true);
  const [yearSaving, setYearSaving] = useState(false);

  // Applications state
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [appStatusFilter, setAppStatusFilter] = useState<string>('all');
  const [appTypeFilter, setAppTypeFilter] = useState<string>('all');
  const [appYearFilter, setAppYearFilter] = useState<string>('all');
  const [appSearch, setAppSearch] = useState('');
  const [newStatusInput, setNewStatusInput] = useState<ApplicationStatus>('under_review');
  const [statusNoteInput, setStatusNoteInput] = useState('');
  const [internalNotesInput, setInternalNotesInput] = useState('');
  const [updatingApp, setUpdatingApp] = useState(false);

  // Announcements state
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [showAddAnnModal, setShowAddAnnModal] = useState(false);
  const [editingAnnId, setEditingAnnId] = useState<string | null>(null);
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annCategory, setAnnCategory] = useState<AnnouncementCategory>('general');
  const [annAcademicYearId, setAnnAcademicYearId] = useState('');
  const [annFilterYearId, setAnnFilterYearId] = useState('all');
  const [annStartDate, setAnnStartDate] = useState('');
  const [annEndDate, setAnnEndDate] = useState('');
  const [annSaving, setAnnSaving] = useState(false);

  // Staff & Permissions state
  const [staffMembers, setStaffMembers] = useState<SchoolStaffMember[]>([]);
  const [showInviteStaffModal, setShowInviteStaffModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [staffPerms, setStaffPerms] = useState<StaffPermissions>({
    canEditProfile: true,
    canManageAnnouncements: true,
    canConfigureForms: false,
    canReviewNewEnrollment: true,
    canReviewReEnrollment: true,
    canViewReports: false,
  });
  const [inviteSaving, setInviteSaving] = useState(false);
  const [confirmRevokeStaff, setConfirmRevokeStaff] = useState<SchoolStaffMember | null>(null);

  // Profile Editor state
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSavedMsg, setProfileSavedMsg] = useState('');

  useEffect(() => {
    loadDirectorSchools();
  }, [currentUser]);

  useEffect(() => {
    if (currentSchool) {
      loadSchoolSubData(currentSchool.id);
    }
  }, [currentSchool?.id, activeTab, activeFormType]);

  const loadDirectorSchools = async () => {
    if (!currentUser?.uid) {
      setSchools([]);
      setCurrentSchool(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const list = await schoolService.getSchoolsForDirector(
        currentUser.uid,
        currentUser.email || undefined
      );
      setSchools(list);
      if (list.length > 0) {
        setCurrentSchool(list[0]);
      } else {
        setCurrentSchool(null);
      }
    } catch (err) {
      console.error('Failed to load director schools:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadSchoolSubData = async (schoolId: string) => {
    try {
      const [apps, anns, form, staff, years] = await Promise.all([
        schoolService.getApplicationsForSchool(schoolId),
        schoolService.getAnnouncements(schoolId, true),
        schoolService.getApplicationForm(schoolId, activeFormType),
        schoolService.getSchoolStaff(schoolId),
        schoolService.getAcademicYears(schoolId),
      ]);
      setApplications(apps);
      setAnnouncements(anns);
      setCurrentForm(form);
      setStaffMembers(staff);
      setAcademicYears(years);
    } catch {
      // safe fallback
    }
  };

  // Switch active school
  const handleSelectSchool = (school: School) => {
    setCurrentSchool(school);
  };

  // Anti-duplicate check during school creation
  const handleSchoolNameChange = async (val: string) => {
    setNewSchoolName(val);
    setNewSchoolDuplicateWarning(null);
    setCreateSchoolError(null);
    if (val.trim().length >= 4) {
      const check = await schoolService.findExistingSchool(val, newSchoolCommune);
      if (check.exists && check.existingSchool) {
        setNewSchoolDuplicateWarning(
          `Attention : Un établissement similaire nommé « ${check.existingSchool.name} » existe déjà à ${newSchoolCommune}.`
        );
      }
    }
  };

  const handleCreateSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSchoolName.trim()) return;

    if (!currentUser?.uid) {
      setCreateSchoolError('Vous devez être connecté avec un compte Directeur officiel pour créer un établissement.');
      return;
    }

    setCreateSchoolError(null);
    setNewSchoolSaving(true);
    try {
      const created = await schoolService.createSchool(currentUser.uid, {
        name: newSchoolName.trim(),
        schoolType: newSchoolType,
        department: newSchoolDept,
        commune: newSchoolCommune,
        address: newSchoolAddress.trim() || `${newSchoolCommune}, ${newSchoolDept}`,
        publicPhone: newSchoolPhone.trim() || '+509 3000-0000',
        publicEmail: newSchoolEmail.trim() || (currentUser?.email || ''),
        levelsOffered: newSchoolLevels,
        description: newSchoolDesc.trim(),
        publishImmediately: true,
      });

      setSchools(prev => {
        const withoutDup = prev.filter(s => s.id !== created.id && s.slug !== created.slug);
        return [created, ...withoutDup];
      });
      setCurrentSchool(created);
      setShowAddSchoolModal(false);
      setNewSchoolName('');
      setNewSchoolDesc('');
      setProfileSavedMsg(`Établissement « ${created.name} » créé et publié dans l'annuaire LekòlWeb !`);
      setTimeout(() => setProfileSavedMsg(''), 5000);
    } catch (err: any) {
      console.error('Error creating school:', err);
      setCreateSchoolError(err.message || 'Impossible d\'enregistrer l\'école dans Firestore.');
    } finally {
      setNewSchoolSaving(false);
    }
  };

  // ==========================================
  // PROFILE UPDATE HANDLERS
  // ==========================================
  const handleUpdateProfile = async (updates: Partial<School>) => {
    if (!currentSchool) return;
    setProfileSaving(true);
    setProfileSavedMsg('');
    try {
      const updated = await schoolService.updateSchoolProfile(currentSchool.id, updates);
      setCurrentSchool(updated);
      setSchools(prev => prev.map(s => (s.id === updated.id ? updated : s)));
      setProfileSavedMsg('Modifications enregistrées avec succès.');
      setTimeout(() => setProfileSavedMsg(''), 4000);
    } finally {
      setProfileSaving(false);
    }
  };

  // ==========================================
  // FORM BUILDER HANDLERS
  // ==========================================
  const handleSaveForm = async (updates: Partial<ApplicationForm>) => {
    if (!currentSchool || !currentForm) return;
    setFormSaving(true);
    try {
      const saved = await schoolService.saveApplicationForm(currentSchool.id, activeFormType, updates);
      setCurrentForm(saved);
      setFormSavedNotice(true);
      setTimeout(() => setFormSavedNotice(false), 3000);
    } finally {
      setFormSaving(false);
    }
  };

  const handleAddField = () => {
    if (!newFieldLabel.trim() || !currentForm) return;
    const newField: FormField = {
      id: `f_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      type: newFieldType,
      label: newFieldLabel.trim(),
      instructions: newFieldInstructions.trim() || undefined,
      required: newFieldRequired,
      options:
        newFieldType === 'dropdown' || newFieldType === 'single_choice' || newFieldType === 'multiple_choice'
          ? newFieldOptions
              .split('\n')
              .map(o => o.trim())
              .filter(Boolean)
          : undefined,
    };

    const updatedFields = [...(currentForm.fields || []), newField];
    handleSaveForm({ fields: updatedFields });
    setShowAddFieldModal(false);
    setNewFieldLabel('');
    setNewFieldInstructions('');
    setNewFieldOptions('');
    setNewFieldRequired(false);
  };

  const handleDeleteField = (fieldId: string) => {
    if (!currentForm) return;
    const updated = currentForm.fields.filter(f => f.id !== fieldId);
    handleSaveForm({ fields: updated });
  };

  const handleMoveField = (index: number, direction: 'up' | 'down') => {
    if (!currentForm) return;
    const fields = [...currentForm.fields];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= fields.length) return;
    const temp = fields[index];
    fields[index] = fields[targetIdx];
    fields[targetIdx] = temp;
    handleSaveForm({ fields });
  };

  // ==========================================
  // APPLICATIONS REVIEW HANDLERS
  // ==========================================
  const handleUpdateApplicationStatus = async () => {
    if (!selectedApp) return;
    setUpdatingApp(true);
    try {
      await schoolService.updateApplicationStatus(
        selectedApp.id,
        newStatusInput,
        statusNoteInput.trim() || undefined,
        userProfile?.displayName || 'Direction'
      );

      // Refresh applications list
      if (currentSchool) {
        const apps = await schoolService.getApplicationsForSchool(currentSchool.id);
        setApplications(apps);
        const refreshed = apps.find(a => a.id === selectedApp.id);
        if (refreshed) setSelectedApp(refreshed);
      }
      setStatusNoteInput('');
    } finally {
      setUpdatingApp(false);
    }
  };

  const handleSaveInternalNotes = async () => {
    if (!selectedApp) return;
    await schoolService.updateApplicationInternalNotes(selectedApp.id, internalNotesInput);
    setSelectedApp(prev => (prev ? { ...prev, internalNotes: internalNotesInput } : null));
  };

  // Export applications to CSV
  const handleExportCSV = () => {
    if (!applications.length || !currentSchool) return;
    const headers = [
      'Référence',
      'Élève',
      'Année académique',
      'Date naissance',
      'Sexe',
      'Classe demandée',
      'Parent/Tuteur',
      'Téléphone',
      'Email',
      'Statut',
      'Date soumission',
    ];

    const rows = applications.map(a => [
      a.referenceNumber,
      `"${a.studentName}"`,
      `"${a.academicYearName || '2026–2027'}"`,
      a.studentDob || '',
      a.studentGender || '',
      `"${a.requestedLevel}"`,
      `"${a.guardianName}"`,
      `"${a.guardianPhone}"`,
      a.guardianEmail || '',
      a.status,
      a.submittedAt.split('T')[0],
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `candidatures_${currentSchool.slug}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ==========================================
  // ACADEMIC YEAR HANDLERS
  // ==========================================
  const handleOpenAddYearModal = () => {
    setEditingYear(null);
    setYearName('2027–2028');
    setYearStartDate('2027-09-01');
    setYearEndDate('2028-06-30');
    setYearStatus('upcoming');
    setYearEnrollmentOpen(true);
    setShowAddYearModal(true);
  };

  const handleOpenEditYearModal = (year: AcademicYear) => {
    setEditingYear(year);
    setYearName(year.name);
    setYearStartDate(year.startDate);
    setYearEndDate(year.endDate);
    setYearStatus(year.status);
    setYearEnrollmentOpen(year.status === 'past' ? false : year.enrollmentOpen);
    setShowAddYearModal(true);
  };

  const handleSaveAcademicYear = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSchool || !yearName.trim()) return;
    setYearSaving(true);
    try {
      if (editingYear) {
        await schoolService.updateAcademicYear(currentSchool.id, editingYear.id, {
          name: yearName.trim(),
          startDate: yearStartDate,
          endDate: yearEndDate,
          status: yearStatus,
          enrollmentOpen: yearStatus === 'past' ? false : yearEnrollmentOpen,
        });
      } else {
        await schoolService.createAcademicYear(currentSchool.id, {
          name: yearName.trim(),
          startDate: yearStartDate,
          endDate: yearEndDate,
          status: yearStatus,
          enrollmentOpen: yearStatus === 'past' ? false : yearEnrollmentOpen,
        });
      }

      const updatedYears = await schoolService.getAcademicYears(currentSchool.id);
      setAcademicYears(updatedYears);
      const updatedSchool = await schoolService.getSchoolById(currentSchool.id);
      if (updatedSchool) setCurrentSchool(updatedSchool);
      setShowAddYearModal(false);
    } finally {
      setYearSaving(false);
    }
  };

  const handleSetCurrentYear = async (yearId: string) => {
    if (!currentSchool) return;
    try {
      await schoolService.setCurrentAcademicYear(currentSchool.id, yearId);
      const [updatedYears, updatedSchool] = await Promise.all([
        schoolService.getAcademicYears(currentSchool.id),
        schoolService.getSchoolById(currentSchool.id),
      ]);
      setAcademicYears(updatedYears);
      if (updatedSchool) setCurrentSchool(updatedSchool);
    } catch (err) {
      console.warn('Error setting current academic year:', err);
    }
  };

  const handleToggleEnrollment = async (yearId: string, currentIsOpen: boolean) => {
    if (!currentSchool) return;
    try {
      await schoolService.toggleEnrollmentAvailability(currentSchool.id, yearId, !currentIsOpen);
      const updatedYears = await schoolService.getAcademicYears(currentSchool.id);
      setAcademicYears(updatedYears);
    } catch (err) {
      console.warn('Error toggling enrollment:', err);
    }
  };

  // ==========================================
  // ANNOUNCEMENTS HANDLERS
  // ==========================================
  const handleSaveAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSchool || !annTitle.trim() || !annContent.trim()) return;
    setAnnSaving(true);
    try {
      const selectedYear = academicYears.find(y => y.id === annAcademicYearId);
      await schoolService.saveAnnouncement(
        currentSchool.id,
        currentSchool.name,
        {
          title: annTitle.trim(),
          content: annContent.trim(),
          category: annCategory,
          academicYearId: selectedYear ? selectedYear.id : undefined,
          academicYearName: selectedYear ? selectedYear.name : undefined,
          startDate: annStartDate || undefined,
          endDate: annEndDate || undefined,
          status: 'published',
        },
        editingAnnId || undefined
      );

      const updated = await schoolService.getAnnouncements(currentSchool.id, true);
      setAnnouncements(updated);
      setShowAddAnnModal(false);
      setAnnTitle('');
      setAnnContent('');
      setAnnAcademicYearId('');
      setEditingAnnId(null);
    } finally {
      setAnnSaving(false);
    }
  };

  const handleArchiveAnnouncement = async (annId: string) => {
    await schoolService.archiveAnnouncement(annId);
    setAnnouncements(prev => prev.map(a => (a.id === annId ? { ...a, status: 'archived' as const } : a)));
  };

  const handleDeleteAnnouncement = async (annId: string) => {
    await schoolService.deleteAnnouncement(annId);
    setAnnouncements(prev => prev.filter(a => a.id !== annId));
  };

  // ==========================================
  // STAFF INVITATION HANDLERS
  // ==========================================
  const handleInviteStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSchool || !inviteEmail.trim() || !inviteName.trim()) return;
    setInviteSaving(true);
    try {
      const added = await schoolService.inviteStaffMember(currentSchool.id, {
        email: inviteEmail.trim(),
        displayName: inviteName.trim(),
        permissions: staffPerms,
        invitedBy: currentUser?.email || 'Directeur',
      });

      setStaffMembers(prev => [...prev.filter(m => m.email !== added.email), added]);
      setShowInviteStaffModal(false);
      setInviteEmail('');
      setInviteName('');
    } finally {
      setInviteSaving(false);
    }
  };

  const handleRevokeStaff = async () => {
    if (!currentSchool || !confirmRevokeStaff) return;
    await schoolService.revokeStaffMember(currentSchool.id, confirmRevokeStaff.id);
    setStaffMembers(prev => prev.filter(m => m.id !== confirmRevokeStaff.id));
    setConfirmRevokeStaff(null);
  };

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case 'accepted':
        return { label: 'Admis(e) / Accepté(e)', color: 'bg-emerald-100 text-emerald-900 border-emerald-300' };
      case 'under_review':
        return { label: 'En cours d\'examen', color: 'bg-blue-50 text-blue-800 border-blue-200' };
      case 'info_requested':
        return { label: 'Complément requis', color: 'bg-amber-50 text-amber-900 border-amber-300' };
      case 'waitlisted':
        return { label: 'Liste d\'attente', color: 'bg-purple-50 text-purple-800 border-purple-200' };
      case 'rejected':
        return { label: 'Non retenu(e)', color: 'bg-rose-50 text-rose-800 border-rose-200' };
      case 'draft':
        return { label: 'Brouillon', color: 'bg-slate-100 text-slate-700 border-slate-300' };
      default:
        return { label: 'Transmise', color: 'bg-teal-50 text-teal-800 border-teal-200' };
    }
  };

  const filteredApplications = applications.filter(a => {
    if (appTypeFilter !== 'all' && a.formType !== appTypeFilter) return false;
    if (appStatusFilter !== 'all' && a.status !== appStatusFilter) return false;
    if (appYearFilter !== 'all') {
      const yearMatch = a.academicYearId === appYearFilter || a.academicYearName === appYearFilter;
      if (!yearMatch) return false;
    }
    if (appSearch) {
      const q = appSearch.toLowerCase();
      const match =
        a.studentName.toLowerCase().includes(q) ||
        a.guardianName.toLowerCase().includes(q) ||
        a.referenceNumber.toLowerCase().includes(q) ||
        (a.academicYearName && a.academicYearName.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  const filteredAnnouncements = announcements.filter(ann => {
    if (annFilterYearId !== 'all') {
      if (ann.academicYearId !== annFilterYearId) return false;
    }
    return true;
  });

  if (loading) {
    return (
      <div className="py-28 text-center space-y-3">
        <div className="w-8 h-8 border-3 border-teal-700 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-500">Chargement de votre espace de direction...</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center mx-auto shadow-xs">
          <Lock className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-900">Espace Direction d'Établissement</h2>
          <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
            La création, la publication et la gestion d'un profil scolaire officiel sur LekòlWeb nécessitent une authentification avec un compte Directeur d'école.
          </p>
        </div>
        <div className="p-4 bg-teal-50/70 rounded-2xl border border-teal-200 text-xs text-teal-900 max-w-md mx-auto space-y-2 text-left">
          <p className="font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal-700 shrink-0" />
            Compte Directeur Officiel & Données Réelles
          </p>
          <p className="text-slate-600">
            Une fois connecté, votre école sera enregistrée en direct dans la base de données Firestore et immédiatement accessible aux parents dans l'annuaire national.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          {onNavigateToAuth ? (
            <>
              <button
                onClick={() => onNavigateToAuth('login', 'principal')}
                className="w-full sm:w-auto px-6 py-3 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all"
              >
                Se connecter à mon compte
              </button>
              <button
                onClick={() => onNavigateToAuth('register', 'principal')}
                className="w-full sm:w-auto px-6 py-3 bg-white hover:bg-slate-50 text-teal-900 border border-slate-300 font-bold text-xs rounded-xl transition-all"
              >
                Créer un compte Directeur
              </button>
            </>
          ) : (
            <p className="text-xs text-slate-500">Veuillez utiliser le menu supérieur pour vous connecter.</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-left space-y-8">
      {/* Top Bar: Multi-School Switcher & "+ Inscrire une école" */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-700 text-white flex items-center justify-center font-bold shadow-xs">
            <SchoolIcon className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Établissement actif ({schools.length} sous votre gestion)
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              {schools.length > 0 ? (
                <>
                  <select
                    value={currentSchool?.id || ''}
                    onChange={e => {
                      const s = schools.find(item => item.id === e.target.value);
                      if (s) handleSelectSchool(s);
                    }}
                    className="text-base sm:text-lg font-extrabold text-slate-900 bg-transparent border-none p-0 focus:ring-0 cursor-pointer hover:text-teal-800"
                  >
                    {schools.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.commune})
                      </option>
                    ))}
                  </select>
                  {currentSchool?.status === 'published' ? (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800">
                      Publié
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 text-amber-800">
                      Brouillon
                    </span>
                  )}
                </>
              ) : (
                <span className="text-base font-bold text-slate-600">Aucun établissement enregistré</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {currentSchool && (
            <button
              onClick={() => onViewSchoolProfile(currentSchool.slug)}
              className="flex-1 md:flex-initial px-4 py-2 bg-slate-100 hover:bg-teal-50 hover:text-teal-800 text-slate-800 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Voir le profil public</span>
            </button>
          )}

          <button
            onClick={() => setShowAddSchoolModal(true)}
            className="flex-1 md:flex-initial px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter une école</span>
          </button>
        </div>
      </div>

      {schools.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 sm:p-14 border border-slate-200 text-center space-y-5 shadow-xs">
          <div className="w-16 h-16 rounded-3xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center mx-auto shadow-xs">
            <SchoolIcon className="w-8 h-8" />
          </div>
          <div className="space-y-2 max-w-md mx-auto">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              Bienvenue dans votre Espace de Direction
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Vous n'avez pas encore d'école enregistrée. Cliquez sur le bouton ci-dessous pour créer la fiche officielle de votre établissement et commencer à recevoir des candidatures.
            </p>
          </div>
          <div className="pt-2">
            <button
              onClick={() => setShowAddSchoolModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-teal-700 hover:bg-teal-800 text-white font-bold text-sm rounded-xl shadow-md transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Inscrire mon premier établissement</span>
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-200">
        {[
          { id: 'overview', label: 'Vue d\'ensemble', icon: LayoutDashboard },
          { id: 'profile', label: 'Profil de l\'école', icon: Building },
          { id: 'academic_years', label: `Années Scolaires (${academicYears.length})`, icon: Calendar },
          { id: 'form_builder', label: 'Formulaires d\'admission', icon: Wand2 },
          { id: 'applications', label: `Candidatures (${applications.length})`, icon: FileText },
          { id: 'announcements', label: `Annonces (${announcements.length})`, icon: Bell },
          { id: 'staff', label: `Équipe & Accès (${staffMembers.length})`, icon: Users },
        ].map(tab => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ============================================================ */}
      {/* TAB 1: OVERVIEW */}
      {/* ============================================================ */}
      {activeTab === 'overview' && currentSchool && (
        <div className="space-y-8">
          {/* Key Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-xs font-semibold text-slate-400">Total Candidatures</span>
              <p className="text-2xl font-black text-slate-900">{applications.length}</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-xs font-semibold text-emerald-600">Nouvelles Inscriptions</span>
              <p className="text-2xl font-black text-emerald-800">
                {applications.filter(a => a.formType === 'new_enrollment').length}
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-xs font-semibold text-teal-700">Réinscriptions</span>
              <p className="text-2xl font-black text-teal-900">
                {applications.filter(a => a.formType === 're_enrollment').length}
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-xs font-semibold text-blue-600">À examiner</span>
              <p className="text-2xl font-black text-blue-900">
                {applications.filter(a => a.status === 'submitted' || a.status === 'under_review').length}
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-xs font-semibold text-purple-600">Annonces actives</span>
              <p className="text-2xl font-black text-purple-900">{announcements.length}</p>
            </div>
          </div>

          {/* Quick Actions & Recent Applications */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900">Dossiers récents reçus</h3>
                <button
                  onClick={() => setActiveTab('applications')}
                  className="text-xs font-bold text-teal-700 hover:underline"
                >
                  Tout afficher
                </button>
              </div>

              {applications.length > 0 ? (
                <div className="space-y-2.5">
                  {applications.slice(0, 5).map(app => (
                    <div
                      key={app.id}
                      onClick={() => {
                        setSelectedApp(app);
                        setActiveTab('applications');
                      }}
                      className="p-3.5 bg-slate-50 hover:bg-teal-50/50 rounded-xl border border-slate-200 transition-colors flex items-center justify-between cursor-pointer"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] font-bold text-teal-900">{app.referenceNumber}</span>
                          <span className="font-bold text-xs text-slate-900">{app.studentName}</span>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          {app.requestedLevel} • {app.formType === 'new_enrollment' ? 'Nouvelle Inscription' : 'Réinscription'}
                        </p>
                      </div>

                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md border ${getStatusBadge(app.status).color}`}>
                        {getStatusBadge(app.status).label}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-10 text-center text-slate-400 text-xs">
                  Aucun dossier reçu pour le moment.
                </div>
              )}
            </div>

            <div className="lg:col-span-4 space-y-4">
              <div className="bg-gradient-to-br from-teal-900 to-slate-900 text-white rounded-3xl p-6 space-y-4 shadow-sm">
                <h4 className="font-extrabold text-sm">Contrôle des inscriptions</h4>
                <p className="text-xs text-teal-100 leading-relaxed">
                  Activez ou suspendez les candidatures pour votre école sur LekòlWeb.
                </p>

                <div className="space-y-2 pt-1 text-xs">
                  <div className="flex items-center justify-between p-2.5 bg-white/10 rounded-xl">
                    <span>Nouvelles inscriptions</span>
                    <button
                      onClick={() => handleUpdateProfile({ newEnrollmentOpen: !currentSchool.newEnrollmentOpen })}
                      className={`px-3 py-1 rounded-lg font-bold ${
                        currentSchool.newEnrollmentOpen ? 'bg-emerald-400 text-slate-950' : 'bg-slate-700 text-white'
                      }`}
                    >
                      {currentSchool.newEnrollmentOpen ? 'Ouvert' : 'Fermé'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-white/10 rounded-xl">
                    <span>Réinscriptions</span>
                    <button
                      onClick={() => handleUpdateProfile({ reEnrollmentOpen: !currentSchool.reEnrollmentOpen })}
                      className={`px-3 py-1 rounded-lg font-bold ${
                        currentSchool.reEnrollmentOpen ? 'bg-emerald-400 text-slate-950' : 'bg-slate-700 text-white'
                      }`}
                    >
                      {currentSchool.reEnrollmentOpen ? 'Ouvert' : 'Fermé'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Form versioning info */}
              <div className="bg-white rounded-3xl p-5 border border-slate-200 text-xs text-slate-600 space-y-2">
                <p className="font-bold text-slate-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-teal-700" />
                  <span>Sécurité des versions de formulaire</span>
                </p>
                <p className="text-[11px] leading-relaxed text-slate-500">
                  Chaque fois que vous modifiez les questions du formulaire d'admission, LekòlWeb archive la version actuelle. Les réponses déjà envoyées par les parents restent intactes et lisibles.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 2: SCHOOL PROFILE EDITOR */}
      {/* ============================================================ */}
      {activeTab === 'profile' && currentSchool && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Profil public de l'établissement</h3>
              <p className="text-xs text-slate-500">
                Ces informations sont affichées sur votre page publique officielle sur LekòlWeb.
              </p>
            </div>
            {profileSavedMsg && (
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                {profileSavedMsg}
              </span>
            )}
          </div>

          <form
            onSubmit={e => {
              e.preventDefault();
              handleUpdateProfile(currentSchool);
            }}
            className="space-y-4 text-xs"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Nom de l'école</label>
                <input
                  type="text"
                  value={currentSchool.name}
                  onChange={e => setCurrentSchool({ ...currentSchool, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Statut de publication</label>
                <select
                  value={currentSchool.status}
                  onChange={e => setCurrentSchool({ ...currentSchool, status: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl bg-white"
                >
                  <option value="published">Publiée (Visible sur l'annuaire)</option>
                  <option value="draft">Brouillon (Non visible)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Département</label>
                <select
                  value={currentSchool.department}
                  onChange={e => setCurrentSchool({ ...currentSchool, department: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl bg-white"
                >
                  {HAITIAN_DEPARTMENTS.map(d => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Commune</label>
                <input
                  type="text"
                  value={currentSchool.commune}
                  onChange={e => setCurrentSchool({ ...currentSchool, commune: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Type d'école</label>
                <select
                  value={currentSchool.schoolType}
                  onChange={e => setCurrentSchool({ ...currentSchool, schoolType: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl bg-white"
                >
                  <option value="congregational">Congréganiste</option>
                  <option value="private">Privée</option>
                  <option value="public">Publique</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Téléphone public</label>
                <input
                  type="text"
                  value={currentSchool.publicPhone}
                  onChange={e => setCurrentSchool({ ...currentSchool, publicPhone: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">WhatsApp (optionnel)</label>
                <input
                  type="text"
                  value={currentSchool.whatsappPhone || ''}
                  onChange={e => setCurrentSchool({ ...currentSchool, whatsappPhone: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Email public</label>
                <input
                  type="email"
                  value={currentSchool.publicEmail}
                  onChange={e => setCurrentSchool({ ...currentSchool, publicEmail: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Adresse complète</label>
              <input
                type="text"
                value={currentSchool.address}
                onChange={e => setCurrentSchool({ ...currentSchool, address: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Présentation & Histoire de l'établissement</label>
              <textarea
                rows={4}
                value={currentSchool.description}
                onChange={e => setCurrentSchool({ ...currentSchool, description: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Critères & Modalités d'admission</label>
                <textarea
                  rows={2}
                  value={currentSchool.admissionsInfo || ''}
                  onChange={e => setCurrentSchool({ ...currentSchool, admissionsInfo: e.target.value })}
                  placeholder="Ex: Concours d'admission, test de niveau, pièces requises..."
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Frais de scolarité & facilités</label>
                <textarea
                  rows={2}
                  value={currentSchool.tuitionInfo || ''}
                  onChange={e => setCurrentSchool({ ...currentSchool, tuitionInfo: e.target.value })}
                  placeholder="Ex: Paiement en 3 tranches trimestrielles..."
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl"
                />
              </div>
            </div>

            <div className="pt-4 flex items-center justify-end">
              <button
                type="submit"
                disabled={profileSaving}
                className="px-6 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl shadow-xs disabled:opacity-50"
              >
                {profileSaving ? 'Enregistrement...' : 'Enregistrer le profil'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 3: ACADEMIC YEARS MANAGEMENT */}
      {/* ============================================================ */}
      {activeTab === 'academic_years' && currentSchool && (
        <div className="space-y-8">
          {/* Header & New Year Action */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-teal-800 uppercase tracking-wider bg-teal-50 px-2.5 py-1 rounded-md">
                Périodes & Calendrier d'Admissions
              </span>
              <h3 className="text-xl font-extrabold text-slate-900">
                Gestion des Années Académiques
              </h3>
              <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
                Configurez les années scolaires propres à votre établissement, définissez l'année en cours et ouvrez/fermez les candidatures selon votre calendrier. LekòlWeb préserve l'historique complet de toutes vos cohortes.
              </p>
            </div>

            <button
              onClick={handleOpenAddYearModal}
              className="px-4 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Créer une année scolaire</span>
            </button>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-xs font-semibold text-slate-400">Année en cours</span>
              <p className="text-xl font-black text-slate-900">
                {academicYears.find(y => y.status === 'current')?.name || 'Non définie'}
              </p>
              <div className="pt-1">
                {(() => {
                  const curr = academicYears.find(y => y.status === 'current');
                  if (!curr) return null;
                  return curr.enrollmentOpen ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Inscriptions Ouvertes
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                      Inscriptions Clôturées
                    </span>
                  );
                })()}
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-xs font-semibold text-teal-700">Années à venir</span>
              <p className="text-xl font-black text-teal-900">
                {academicYears.filter(y => y.status === 'upcoming').length}
              </p>
              <p className="text-[11px] text-slate-400">
                {academicYears.filter(y => y.status === 'upcoming' && y.enrollmentOpen).length} avec inscriptions anticipées
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-xs font-semibold text-slate-500">Années passées</span>
              <p className="text-xl font-black text-slate-700">
                {academicYears.filter(y => y.status === 'past').length}
              </p>
              <p className="text-[11px] text-slate-400">Archives historiques permanentes</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-xs font-semibold text-blue-600">Total Candidatures</span>
              <p className="text-xl font-black text-blue-900">{applications.length}</p>
              <p className="text-[11px] text-slate-400">Toutes promotions confondues</p>
            </div>
          </div>

          {/* Boundaries Clarification Banner */}
          <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-2xl text-xs flex items-start gap-3">
            <HelpCircle className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-teal-950">Principe de fonctionnement LekòlWeb :</p>
              <p className="text-slate-600 leading-relaxed">
                LekòlWeb est exclusivement dédié à la visibilité scolaire, aux avis publics et à la réception des candidatures d'admission. Il ne gère pas les notes des élèves, les bulletins trimestriels, les feuilles de présence ni l'avancement pédagogique. Les candidatures passées ne sont jamais modifiées lors des changements d'année scolaire.
              </p>
            </div>
          </div>

          {/* SECTION 1: ANNÉE SCOLAIRE EN COURS */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Année Académique Active</span>
            </h4>

            {(() => {
              const currentYear = academicYears.find(y => y.status === 'current');
              if (!currentYear) {
                return (
                  <div className="p-6 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 space-y-2">
                    <p className="font-bold">Aucune année académique n'est actuellement définie comme "Année en cours".</p>
                    <p>Sélectionnez une année existante ci-dessous ou créez-en une nouvelle pour activer les candidatures.</p>
                  </div>
                );
              }

              const yearApps = applications.filter(
                a => a.academicYearId === currentYear.id || a.academicYearName === currentYear.name
              );
              const yearAnns = announcements.filter(
                a => a.academicYearId === currentYear.id
              );

              return (
                <div className="p-6 bg-gradient-to-br from-emerald-50/60 to-white rounded-3xl border-2 border-emerald-300 shadow-xs space-y-5">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl font-black text-slate-900">{currentYear.name}</span>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          Année en cours
                        </span>
                        {currentYear.enrollmentOpen ? (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-100 text-teal-800 border border-teal-200 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-teal-600 animate-pulse" />
                            Inscriptions Ouvertes
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
                            Inscriptions Fermées
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500">
                        Calendrier officiel : du {new Date(currentYear.startDate).toLocaleDateString('fr-FR')} au {new Date(currentYear.endDate).toLocaleDateString('fr-FR')}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => handleToggleEnrollment(currentYear.id, currentYear.enrollmentOpen)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs ${
                          currentYear.enrollmentOpen
                            ? 'bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        }`}
                      >
                        {currentYear.enrollmentOpen ? (
                          <>
                            <Lock className="w-3.5 h-3.5" />
                            <span>Fermer les inscriptions</span>
                          </>
                        ) : (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Ouvrir les inscriptions</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleOpenEditYearModal(currentYear)}
                        className="px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl"
                      >
                        Modifier les dates
                      </button>
                    </div>
                  </div>

                  {/* Highlights Bar */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-emerald-100 text-xs">
                    <div className="p-3 bg-white rounded-xl border border-emerald-100 flex items-center justify-between">
                      <span className="text-slate-500">Candidatures reçues :</span>
                      <strong className="text-slate-900 font-extrabold">{yearApps.length} dossier(s)</strong>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-emerald-100 flex items-center justify-between">
                      <span className="text-slate-500">Annonces rattachées :</span>
                      <strong className="text-teal-800 font-extrabold">{yearAnns.length} annonce(s)</strong>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-emerald-100 flex items-center justify-between">
                      <span className="text-slate-500">État d'accès parent :</span>
                      <span className={`font-bold ${currentYear.enrollmentOpen ? 'text-emerald-700' : 'text-slate-500'}`}>
                        {currentYear.enrollmentOpen ? 'Accessible sur le profil' : 'Formulaire masqué'}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-2">
                    <button
                      onClick={() => {
                        setAppYearFilter(currentYear.id);
                        setActiveTab('applications');
                      }}
                      className="px-3.5 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-lg text-xs font-bold flex items-center gap-1.5"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Consulter les {yearApps.length} candidature(s) de {currentYear.name}</span>
                    </button>

                    <button
                      onClick={() => {
                        setAnnAcademicYearId(currentYear.id);
                        setEditingAnnId(null);
                        setAnnTitle(`Rentrée scolaire — Année ${currentYear.name}`);
                        setShowAddAnnModal(true);
                      }}
                      className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1.5"
                    >
                      <Bell className="w-3.5 h-3.5" />
                      <span>Publier une annonce pour {currentYear.name}</span>
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* SECTION 2: ANNÉES À VENIR (INSCRIPTIONS ANTICIPÉES) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>Années Académiques à Venir (Inscriptions Anticipées)</span>
              </h4>
            </div>

            {academicYears.filter(y => y.status === 'upcoming').length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {academicYears
                  .filter(y => y.status === 'upcoming')
                  .map(year => {
                    const yearApps = applications.filter(
                      a => a.academicYearId === year.id || a.academicYearName === year.name
                    );

                    return (
                      <div
                        key={year.id}
                        className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4 text-xs"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-bold text-slate-900">{year.name}</span>
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                À venir
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              Du {new Date(year.startDate).toLocaleDateString('fr-FR')} au {new Date(year.endDate).toLocaleDateString('fr-FR')}
                            </p>
                          </div>

                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                              year.enrollmentOpen
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                : 'bg-slate-100 text-slate-600 border-slate-200'
                            }`}
                          >
                            {year.enrollmentOpen ? 'Inscriptions Ouvertes' : 'Inscriptions Fermées'}
                          </span>
                        </div>

                        <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                          <div className="flex justify-between text-slate-600">
                            <span>Dossiers reçus par anticipation :</span>
                            <strong className="text-slate-900 font-bold">{yearApps.length}</strong>
                          </div>
                          <p className="text-[11px] text-slate-400">
                            {year.enrollmentOpen
                              ? 'Les parents peuvent dès à présent postuler pour cette promotion sur le profil public.'
                              : 'Les candidatures anticipées sont closes pour le moment.'}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
                          <button
                            onClick={() => handleToggleEnrollment(year.id, year.enrollmentOpen)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                              year.enrollmentOpen
                                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300'
                            }`}
                          >
                            {year.enrollmentOpen ? 'Suspendre inscriptions' : 'Ouvrir par anticipation'}
                          </button>

                          <button
                            onClick={() => handleSetCurrentYear(year.id)}
                            className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold rounded-lg text-xs transition-colors"
                            title="Définir cette année comme année scolaire en cours"
                          >
                            Passer en "Année en cours"
                          </button>

                          <button
                            onClick={() => handleOpenEditYearModal(year)}
                            className="px-2.5 py-1.5 text-slate-400 hover:text-slate-700 text-xs font-bold rounded-lg"
                          >
                            Modifier
                          </button>

                          {yearApps.length > 0 && (
                            <button
                              onClick={() => {
                                setAppYearFilter(year.id);
                                setActiveTab('applications');
                              }}
                              className="px-3 py-1.5 text-teal-700 font-bold hover:underline text-xs ml-auto"
                            >
                              Voir dossiers ({yearApps.length})
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center text-xs text-slate-500 space-y-2">
                <p>Aucune année à venir n'est enregistrée pour le moment.</p>
                <button
                  onClick={handleOpenAddYearModal}
                  className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl text-xs inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Programmer l'année prochaine</span>
                </button>
              </div>
            )}
          </div>

          {/* SECTION 3: ANNÉES PASSÉES (ARCHIVES PERMANENTES) */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Archive className="w-4 h-4 text-slate-500" />
              <span>Années Académiques Passées (Archives Historiques)</span>
            </h4>

            {academicYears.filter(y => y.status === 'past').length > 0 ? (
              <div className="space-y-3">
                {academicYears
                  .filter(y => y.status === 'past')
                  .map(year => {
                    const yearApps = applications.filter(
                      a => a.academicYearId === year.id || a.academicYearName === year.name
                    );

                    return (
                      <div
                        key={year.id}
                        className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800 text-base">{year.name}</span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                              Clôturée / Archivée
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-50 text-slate-400">
                              Dépôt interdit
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400">
                            Période : {new Date(year.startDate).toLocaleDateString('fr-FR')} au {new Date(year.endDate).toLocaleDateString('fr-FR')} • {yearApps.length} candidature(s) conservée(s)
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setAppYearFilter(year.id);
                              setActiveTab('applications');
                            }}
                            className="px-3.5 py-1.5 bg-slate-100 hover:bg-teal-50 hover:text-teal-800 text-slate-700 font-bold rounded-lg text-xs transition-colors"
                          >
                            Consulter les {yearApps.length} dossiers archivés
                          </button>
                          <button
                            onClick={() => handleOpenEditYearModal(year)}
                            className="px-2.5 py-1.5 text-slate-400 hover:text-slate-700 font-bold rounded-lg text-xs"
                          >
                            Modifier
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-400 text-center">
                Aucune année scolaire passée dans les archives.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 4: CUSTOMIZABLE FORM BUILDER */}
      {/* ============================================================ */}
      {activeTab === 'form_builder' && currentSchool && (
        <div className="space-y-6">
          {/* Sub-tabs: Nouvelle Inscription vs Réinscription */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <span className="text-[11px] font-bold text-teal-800 uppercase tracking-wider bg-teal-50 px-2.5 py-1 rounded-md">
                  Générateur de Formulaires • Form Builder
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 mt-1">
                  Personnalisez les questions pour votre école
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowPreviewModal(true)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5"
                >
                  <Eye className="w-4 h-4 text-slate-500" />
                  <span>Aperçu formulaire</span>
                </button>
                <button
                  onClick={() => setShowAddFieldModal(true)}
                  className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Ajouter une question</span>
                </button>
              </div>
            </div>

            {/* Type selector */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveFormType('new_enrollment')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeFormType === 'new_enrollment'
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                1. Formulaire Nouvelle Inscription
              </button>
              <button
                onClick={() => setActiveFormType('re_enrollment')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeFormType === 're_enrollment'
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                2. Formulaire Réinscription
              </button>
            </div>

            {/* Form Settings Strip */}
            {currentForm && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Statut du formulaire</label>
                  <select
                    value={currentForm.status}
                    onChange={e => handleSaveForm({ status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white font-semibold"
                  >
                    <option value="open">Ouvert aux candidatures</option>
                    <option value="closed">Fermé temporairement</option>
                    <option value="draft">Brouillon interne</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Date limite de dépôt</label>
                  <input
                    type="date"
                    value={currentForm.deadlineDate || ''}
                    onChange={e => handleSaveForm({ deadlineDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Version archivée</label>
                  <p className="py-2 text-slate-500 font-mono font-semibold">
                    v{currentForm.version} (Mise à jour automatique à chaque modification)
                  </p>
                </div>
              </div>
            )}

            {formSavedNotice && (
              <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200">
                Formulaire enregistré avec succès (Nouvelle version créée).
              </div>
            )}

            {/* Questions List */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Questions configurées ({currentForm?.fields?.length || 0})
              </h4>

              {currentForm?.fields && currentForm.fields.length > 0 ? (
                <div className="space-y-2.5">
                  {currentForm.fields.map((f, idx) => (
                    <div
                      key={f.id}
                      className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900">{f.label}</span>
                          {f.required && <span className="text-red-500 font-bold text-xs">*</span>}
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">
                            {f.type}
                          </span>
                        </div>
                        {f.instructions && <p className="text-[11px] text-slate-400">{f.instructions}</p>}
                        {f.options && (
                          <p className="text-[10px] text-teal-700">Options : {f.options.join(', ')}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleMoveField(idx, 'up')}
                          disabled={idx === 0}
                          className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded"
                          title="Monter"
                        >
                          <MoveUp className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveField(idx, 'down')}
                          disabled={idx === currentForm.fields.length - 1}
                          className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded"
                          title="Descendre"
                        >
                          <MoveDown className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteField(f.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded"
                          title="Supprimer la question"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 py-6 text-center">
                  Aucune question configurée pour ce formulaire.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 4: APPLICATIONS MANAGEMENT */}
      {/* ============================================================ */}
      {activeTab === 'applications' && currentSchool && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Dossiers d'admissions reçus</h3>
              <p className="text-xs text-slate-500">
                Traitez les demandes de nouvelle inscription et réinscription pour {currentSchool.name}.
              </p>
            </div>
            <button
              onClick={handleExportCSV}
              disabled={!applications.length}
              className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-2 disabled:opacity-40"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Exporter CSV</span>
            </button>
          </div>

          {/* Filters Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={appSearch}
                onChange={e => setAppSearch(e.target.value)}
                placeholder="Rechercher par élève, parent, réf..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300"
              />
            </div>

            <select
              value={appYearFilter}
              onChange={e => setAppYearFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-semibold text-teal-900"
            >
              <option value="all">Toutes les années scolaires</option>
              {academicYears.map(y => (
                <option key={y.id} value={y.id}>
                  {y.name} {y.status === 'current' ? '(En cours)' : y.status === 'upcoming' ? '(À venir)' : '(Passée)'}
                </option>
              ))}
            </select>

            <select
              value={appTypeFilter}
              onChange={e => setAppTypeFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
            >
              <option value="all">Tous types d'inscription</option>
              <option value="new_enrollment">Nouvelle Inscription</option>
              <option value="re_enrollment">Réinscription</option>
            </select>

            <select
              value={appStatusFilter}
              onChange={e => setAppStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
            >
              <option value="all">Tous statuts</option>
              <option value="submitted">Transmis</option>
              <option value="under_review">En cours d'examen</option>
              <option value="info_requested">Complément requis</option>
              <option value="accepted">Accepté / Admis</option>
              <option value="waitlisted">Liste d'attente</option>
              <option value="rejected">Refusé</option>
            </select>
          </div>

          {/* Applications Table */}
          {filteredApplications.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-3">Réf</th>
                    <th className="py-3 px-3">Élève</th>
                    <th className="py-3 px-3">Année</th>
                    <th className="py-3 px-3">Classe</th>
                    <th className="py-3 px-3">Type</th>
                    <th className="py-3 px-3">Responsable</th>
                    <th className="py-3 px-3">Statut</th>
                    <th className="py-3 px-3">Date</th>
                    <th className="py-3 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredApplications.map(app => {
                    const badge = getStatusBadge(app.status);
                    return (
                      <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-3 font-mono font-bold text-teal-900">{app.referenceNumber}</td>
                        <td className="py-3 px-3 font-bold text-slate-900">{app.studentName}</td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-teal-50 text-teal-800 border border-teal-200">
                            {app.academicYearName || '2026–2027'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-600">{app.requestedLevel}</td>
                        <td className="py-3 px-3 text-slate-500">
                          {app.formType === 'new_enrollment' ? 'Nouvelle' : 'Réinscription'}
                        </td>
                        <td className="py-3 px-3 text-slate-600">{app.guardianName}</td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] border ${badge.color}`}>
                            {badge.label}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-400">
                          {new Date(app.submittedAt).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => {
                              setSelectedApp(app);
                              setNewStatusInput(app.status);
                              setInternalNotesInput(app.internalNotes || '');
                            }}
                            className="px-3 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold rounded-lg"
                          >
                            Examiner
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 text-xs">
              Aucun dossier ne correspond aux critères sélectionnés.
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 5: ANNOUNCEMENTS */}
      {/* ============================================================ */}
      {activeTab === 'announcements' && currentSchool && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Annonces officielles de l'école</h3>
              <p className="text-xs text-slate-500">
                Publiez les avis de rentrée, résultats de concours et circulaires aux parents avec rattachement aux années scolaires.
              </p>
            </div>
            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <select
                value={annFilterYearId}
                onChange={e => setAnnFilterYearId(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-semibold text-slate-700"
              >
                <option value="all">Toutes les années académiques</option>
                {academicYears.map(y => (
                  <option key={y.id} value={y.id}>
                    {y.name} {y.status === 'current' ? '(En cours)' : y.status === 'upcoming' ? '(À venir)' : '(Passée)'}
                  </option>
                ))}
              </select>

              <button
                onClick={() => {
                  setEditingAnnId(null);
                  setAnnTitle('');
                  setAnnContent('');
                  setAnnStartDate('');
                  setAnnEndDate('');
                  const curr = academicYears.find(y => y.status === 'current');
                  setAnnAcademicYearId(curr ? curr.id : '');
                  setShowAddAnnModal(true);
                }}
                className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Publier une annonce</span>
              </button>
            </div>
          </div>

          {filteredAnnouncements.length > 0 ? (
            <div className="space-y-3">
              {filteredAnnouncements.map(ann => (
                <div
                  key={ann.id}
                  className={`p-5 rounded-2xl border flex flex-col sm:flex-row justify-between gap-4 text-xs ${
                    ann.status === 'archived' ? 'bg-slate-100/70 border-slate-300 opacity-80' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-teal-800">{ann.title}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-white border border-slate-200 text-slate-500 font-semibold">
                        {ann.category}
                      </span>
                      {ann.academicYearName && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                          Année {ann.academicYearName}
                        </span>
                      )}
                      {ann.status === 'archived' && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                          Archivée
                        </span>
                      )}
                    </div>
                    <p className="text-slate-600 line-clamp-2 leading-relaxed">{ann.content}</p>
                    <p className="text-slate-400 text-[10px]">
                      Publiée le {new Date(ann.publishedAt || ann.createdAt).toLocaleDateString('fr-FR')}
                      {ann.startDate && ` • Validité : du ${new Date(ann.startDate).toLocaleDateString('fr-FR')}`}
                      {ann.endDate && ` au ${new Date(ann.endDate).toLocaleDateString('fr-FR')}`}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {ann.status !== 'archived' && (
                      <button
                        onClick={() => handleArchiveAnnouncement(ann.id)}
                        className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 font-bold hover:bg-white flex items-center gap-1"
                        title="Archiver sans supprimer l'historique"
                      >
                        <Archive className="w-3.5 h-3.5" />
                        <span>Archiver</span>
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setEditingAnnId(ann.id);
                        setAnnTitle(ann.title);
                        setAnnContent(ann.content);
                        setAnnCategory(ann.category);
                        setAnnAcademicYearId(ann.academicYearId || '');
                        setAnnStartDate(ann.startDate || '');
                        setAnnEndDate(ann.endDate || '');
                        setShowAddAnnModal(true);
                      }}
                      className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-700 font-bold hover:bg-white"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDeleteAnnouncement(ann.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg"
                      title="Supprimer définitivement"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 text-xs">
              Aucune annonce correspondant aux critères pour le moment.
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 6: STAFF & PERMISSIONS */}
      {/* ============================================================ */}
      {activeTab === 'staff' && currentSchool && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Équipe d'administration de l'école</h3>
              <p className="text-xs text-slate-500">
                Invitez des collaborateurs (secrétaires, directeurs des études) et définissez précisément leurs droits.
              </p>
            </div>
            <button
              onClick={() => setShowInviteStaffModal(true)}
              className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Inviter un collaborateur</span>
            </button>
          </div>

          {staffMembers.length > 0 ? (
            <div className="space-y-3">
              {staffMembers.map(member => (
                <div
                  key={member.id}
                  className="p-5 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900 text-sm">{member.displayName}</h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {member.status === 'active' ? 'Actif' : 'En attente'}
                      </span>
                    </div>
                    <p className="text-slate-500 font-mono">{member.email}</p>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {member.permissions.canReviewNewEnrollment && (
                        <span className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[10px]">
                          Candidatures nouvelles
                        </span>
                      )}
                      {member.permissions.canReviewReEnrollment && (
                        <span className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[10px]">
                          Réinscriptions
                        </span>
                      )}
                      {member.permissions.canManageAnnouncements && (
                        <span className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[10px]">
                          Annonces
                        </span>
                      )}
                      {member.permissions.canEditProfile && (
                        <span className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[10px]">
                          Profil école
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => setConfirmRevokeStaff(member)}
                    className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                    title="Révoquer l'accès"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 text-xs">
              Aucun administrateur délégué invité pour le moment. Vous seul gérez cette école.
            </div>
          )}
        </div>
      )}
      </>
    )}

      {/* ============================================================ */}
      {/* MODALS */}
      {/* ============================================================ */}

      {/* MODAL 1: ADD NEW SCHOOL */}
      {showAddSchoolModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 border border-slate-200 shadow-2xl space-y-5 text-left relative animate-fade-in my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">Inscrire un nouvel établissement scolaire</h3>
              <button onClick={() => setShowAddSchoolModal(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {newSchoolDuplicateWarning && (
              <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                <span>{newSchoolDuplicateWarning}</span>
              </div>
            )}

            {createSchoolError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-900 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{createSchoolError}</span>
              </div>
            )}

            <form onSubmit={handleCreateSchool} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Nom officiel de l'école <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={newSchoolName}
                  onChange={e => handleSchoolNameChange(e.target.value)}
                  placeholder="Ex: Collège Mixte Jean Price-Mars"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Département</label>
                  <select
                    value={newSchoolDept}
                    onChange={e => {
                      setNewSchoolDept(e.target.value);
                      const communes = HAITIAN_COMMUNES_BY_DEPARTMENT[e.target.value] || [];
                      setNewSchoolCommune(communes[0] || '');
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white"
                  >
                    {HAITIAN_DEPARTMENTS.map(d => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Commune</label>
                  <select
                    value={newSchoolCommune}
                    onChange={e => setNewSchoolCommune(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white"
                  >
                    {(HAITIAN_COMMUNES_BY_DEPARTMENT[newSchoolDept] || []).map(c => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Type d'école</label>
                  <select
                    value={newSchoolType}
                    onChange={e => setNewSchoolType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white"
                  >
                    <option value="congregational">Congréganiste</option>
                    <option value="private">Privée laïque</option>
                    <option value="public">Publique</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Téléphone de contact</label>
                  <input
                    type="text"
                    value={newSchoolPhone}
                    onChange={e => setNewSchoolPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Description courte</label>
                <textarea
                  rows={2}
                  value={newSchoolDesc}
                  onChange={e => setNewSchoolDesc(e.target.value)}
                  placeholder="Présentez la mission et l'excellence de votre école..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddSchoolModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={newSchoolSaving}
                  className="px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl shadow-xs disabled:opacity-50"
                >
                  {newSchoolSaving ? 'Création...' : 'Créer l\'école'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: APPLICATION DETAILS & REVIEW */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 border border-slate-200 shadow-2xl space-y-6 text-left relative animate-fade-in my-8 max-h-[92vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold border ${getStatusBadge(selectedApp.status).color}`}>
                    {getStatusBadge(selectedApp.status).label}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                    Année scolaire : {selectedApp.academicYearName || '2026–2027'}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mt-1">Dossier {selectedApp.referenceNumber}</h3>
                <p className="text-xs text-slate-500">
                  {selectedApp.formType === 'new_enrollment' ? 'Nouvelle Inscription' : 'Confirmation Réinscription'}
                </p>
              </div>
              <button onClick={() => setSelectedApp(null)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Candidate & Guardian info */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Candidat</p>
                <p className="font-bold text-slate-900 text-sm">{selectedApp.studentName}</p>
                <p className="text-slate-500">Né(e) le : {selectedApp.studentDob || 'Non précisé'}</p>
                <p className="text-slate-500">Sexe : {selectedApp.studentGender || '—'}</p>
                <p className="text-slate-500">Classe : <strong className="text-slate-800">{selectedApp.requestedLevel}</strong></p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Responsable Légal</p>
                <p className="font-bold text-slate-900 text-sm">{selectedApp.guardianName}</p>
                <p className="text-slate-500">Tél : {selectedApp.guardianPhone}</p>
                <p className="text-slate-500">Email : {selectedApp.guardianEmail || '—'}</p>
                <p className="text-slate-500 truncate">Adresse : {selectedApp.guardianAddress || '—'}</p>
              </div>
            </div>

            {/* Form Answers Submitted */}
            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[10px]">
                Réponses fournies au formulaire
              </h4>
              <div className="space-y-2">
                {Object.entries(selectedApp.answers || {}).map(([key, val]) => (
                  <div key={key} className="p-3 bg-white border border-slate-200 rounded-xl flex flex-col sm:flex-row justify-between gap-1">
                    <span className="font-semibold text-slate-500 capitalize">{key.replace(/_/g, ' ')}</span>
                    <span className="font-bold text-slate-900">{Array.isArray(val) ? val.join(', ') : String(val)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Review Decision Box */}
            <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-2xl space-y-3 text-xs">
              <h4 className="font-bold text-teal-950 uppercase tracking-wider text-[10px]">
                Prendre une décision sur ce dossier
              </h4>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setNewStatusInput('accepted')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                    newStatusInput === 'accepted' ? 'bg-emerald-700 text-white shadow-xs' : 'bg-white text-emerald-800 border border-emerald-300'
                  }`}
                >
                  ✓ Accepter / Admettre
                </button>
                <button
                  type="button"
                  onClick={() => setNewStatusInput('under_review')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                    newStatusInput === 'under_review' ? 'bg-blue-700 text-white shadow-xs' : 'bg-white text-blue-800 border border-blue-300'
                  }`}
                >
                  En cours d'examen
                </button>
                <button
                  type="button"
                  onClick={() => setNewStatusInput('info_requested')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                    newStatusInput === 'info_requested' ? 'bg-amber-700 text-white shadow-xs' : 'bg-white text-amber-800 border border-amber-300'
                  }`}
                >
                  Complément requis
                </button>
                <button
                  type="button"
                  onClick={() => setNewStatusInput('waitlisted')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                    newStatusInput === 'waitlisted' ? 'bg-purple-700 text-white shadow-xs' : 'bg-white text-purple-800 border border-purple-300'
                  }`}
                >
                  Liste d'attente
                </button>
                <button
                  type="button"
                  onClick={() => setNewStatusInput('rejected')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                    newStatusInput === 'rejected' ? 'bg-rose-700 text-white shadow-xs' : 'bg-white text-rose-800 border border-rose-300'
                  }`}
                >
                  Non retenu
                </button>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Message destiné au parent (visible dans son espace) :</label>
                <input
                  type="text"
                  value={statusNoteInput}
                  onChange={e => setStatusNoteInput(e.target.value)}
                  placeholder="Ex: Votre enfant est convoqué pour le test de niveau le 15 août..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white"
                />
              </div>

              <button
                type="button"
                disabled={updatingApp}
                onClick={handleUpdateApplicationStatus}
                className="px-4 py-2 bg-teal-700 text-white font-bold rounded-xl shadow-xs disabled:opacity-50"
              >
                {updatingApp ? 'Enregistrement...' : 'Valider le changement de statut'}
              </button>
            </div>

            {/* Confidential Internal Notes */}
            <div className="space-y-1 text-xs">
              <label className="font-bold text-slate-700">Notes internes confidentielles (Strictement réservées à l'école) :</label>
              <textarea
                rows={2}
                value={internalNotesInput}
                onChange={e => setInternalNotesInput(e.target.value)}
                placeholder="Remarques pédagogiques ou administratives..."
                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
              />
              <button
                type="button"
                onClick={handleSaveInternalNotes}
                className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs"
              >
                Enregistrer notes internes
              </button>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedApp(null)}
                className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl font-bold text-xs"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: ADD FIELD TO FORM BUILDER */}
      {showAddFieldModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-slate-200 shadow-2xl space-y-4 text-left relative animate-fade-in my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">Ajouter une question personnalisée</h3>
              <button onClick={() => setShowAddFieldModal(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Libellé de la question</label>
                <input
                  type="text"
                  value={newFieldLabel}
                  onChange={e => setNewFieldLabel(e.target.value)}
                  placeholder="Ex: Numéro d'acte de naissance..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Type de champ</label>
                <select
                  value={newFieldType}
                  onChange={e => setNewFieldType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white"
                >
                  <option value="short_text">Texte court</option>
                  <option value="long_text">Texte long</option>
                  <option value="date">Date</option>
                  <option value="phone">Téléphone</option>
                  <option value="email">Email</option>
                  <option value="number">Nombre</option>
                  <option value="dropdown">Menu déroulant</option>
                  <option value="single_choice">Choix unique (Radio)</option>
                  <option value="multiple_choice">Choix multiples</option>
                  <option value="yes_no">Oui / Non</option>
                  <option value="file_upload">Téléversement de fichier</option>
                  <option value="section_heading">Titre de section</option>
                </select>
              </div>

              {(newFieldType === 'dropdown' || newFieldType === 'single_choice' || newFieldType === 'multiple_choice') && (
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Options disponibles (une par ligne)</label>
                  <textarea
                    rows={3}
                    value={newFieldOptions}
                    onChange={e => setNewFieldOptions(e.target.value)}
                    placeholder="Option 1&#10;Option 2&#10;Option 3"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Consigne ou aide pour le parent (optionnel)</label>
                <input
                  type="text"
                  value={newFieldInstructions}
                  onChange={e => setNewFieldInstructions(e.target.value)}
                  placeholder="Ex: Renseignez le numéro tel qu'il apparaît sur l'extrait..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <label className="inline-flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                <input
                  type="checkbox"
                  checked={newFieldRequired}
                  onChange={e => setNewFieldRequired(e.target.checked)}
                  className="rounded text-teal-700"
                />
                <span>Champ obligatoire</span>
              </label>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddFieldModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-bold"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleAddField}
                  className="px-5 py-2 bg-teal-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Ajouter au formulaire
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: PUBLISH ANNOUNCEMENT */}
      {showAddAnnModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-slate-200 shadow-2xl space-y-4 text-left relative animate-fade-in my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">
                {editingAnnId ? 'Modifier l\'annonce' : 'Publier une annonce officielle'}
              </h3>
              <button onClick={() => setShowAddAnnModal(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAnnouncement} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Titre de l'annonce</label>
                <input
                  type="text"
                  required
                  value={annTitle}
                  onChange={e => setAnnTitle(e.target.value)}
                  placeholder="Ex: Concours d'admission en classe de 7ème Année"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Catégorie</label>
                <select
                  value={annCategory}
                  onChange={e => setAnnCategory(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white"
                >
                  <option value="new_enrollment">Nouvelle Inscription</option>
                  <option value="re_enrollment">Réinscription</option>
                  <option value="examinations">Examens & Résultats</option>
                  <option value="important_dates">Dates Importantes</option>
                  <option value="school_activities">Activités Scolaires</option>
                  <option value="general">Général</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Année scolaire associée (Optionnel)</label>
                <select
                  value={annAcademicYearId}
                  onChange={e => setAnnAcademicYearId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white"
                >
                  <option value="">Aucune (Communication générale permanente)</option>
                  {academicYears.map(y => (
                    <option key={y.id} value={y.id}>
                      {y.name} {y.status === 'current' ? '— Année en cours' : y.status === 'upcoming' ? '— Promotion à venir' : '— Année archivée'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Contenu officiel de l'annonce</label>
                <textarea
                  rows={4}
                  required
                  value={annContent}
                  onChange={e => setAnnContent(e.target.value)}
                  placeholder="Rédigez les détails pour les parents et élèves..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Date début (optionnel)</label>
                  <input
                    type="date"
                    value={annStartDate}
                    onChange={e => setAnnStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Date fin (optionnel)</label>
                  <input
                    type="date"
                    value={annEndDate}
                    onChange={e => setAnnEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddAnnModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-bold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={annSaving}
                  className="px-5 py-2 bg-teal-700 text-white font-bold rounded-xl shadow-xs disabled:opacity-50"
                >
                  {annSaving ? 'Publication...' : 'Publier sur LekòlWeb'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: INVITE STAFF MEMBER */}
      {showInviteStaffModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-slate-200 shadow-2xl space-y-4 text-left relative animate-fade-in my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">Inviter un collaborateur</h3>
              <button onClick={() => setShowInviteStaffModal(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleInviteStaff} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Nom complet du collaborateur</label>
                <input
                  type="text"
                  required
                  value={inviteName}
                  onChange={e => setInviteName(e.target.value)}
                  placeholder="Ex: M. Jean-Claude Pierre"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Adresse e-mail</label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  placeholder="collaborateur@gmail.com"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <p className="font-bold text-slate-900 uppercase tracking-wider text-[10px]">
                  Permissions accordées à ce collaborateur :
                </p>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={staffPerms.canReviewNewEnrollment}
                    onChange={e => setStaffPerms({ ...staffPerms, canReviewNewEnrollment: e.target.checked })}
                    className="rounded text-teal-700"
                  />
                  <span>Examiner et traiter les nouvelles inscriptions</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={staffPerms.canReviewReEnrollment}
                    onChange={e => setStaffPerms({ ...staffPerms, canReviewReEnrollment: e.target.checked })}
                    className="rounded text-teal-700"
                  />
                  <span>Examiner les confirmations de réinscription</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={staffPerms.canManageAnnouncements}
                    onChange={e => setStaffPerms({ ...staffPerms, canManageAnnouncements: e.target.checked })}
                    className="rounded text-teal-700"
                  />
                  <span>Créer et publier des annonces scolaires</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={staffPerms.canEditProfile}
                    onChange={e => setStaffPerms({ ...staffPerms, canEditProfile: e.target.checked })}
                    className="rounded text-teal-700"
                  />
                  <span>Modifier les informations du profil de l'école</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={staffPerms.canConfigureForms}
                    onChange={e => setStaffPerms({ ...staffPerms, canConfigureForms: e.target.checked })}
                    className="rounded text-teal-700"
                  />
                  <span>Modifier la configuration des formulaires d'admissions</span>
                </label>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowInviteStaffModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-bold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={inviteSaving}
                  className="px-5 py-2 bg-teal-700 text-white font-bold rounded-xl shadow-xs disabled:opacity-50"
                >
                  {inviteSaving ? 'Envoi...' : 'Accorder l\'accès'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 6: CONFIRM REVOKE STAFF */}
      {confirmRevokeStaff && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 border border-slate-200 shadow-2xl space-y-4 text-left animate-fade-in">
            <h3 className="text-base font-bold text-slate-900">Révoquer l'accès ?</h3>
            <p className="text-xs text-slate-500">
              Confirmez-vous la révocation des accès de{' '}
              <strong className="text-slate-900">{confirmRevokeStaff.displayName}</strong> ? Cette personne ne pourra plus gérer cette école.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmRevokeStaff(null)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-bold text-xs"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleRevokeStaff}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs"
              >
                Révoquer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 7: LIVE FORM PREVIEW */}
      {showPreviewModal && currentForm && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 border border-slate-200 shadow-2xl space-y-5 text-left relative animate-fade-in my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded">
                  Aperçu en direct pour les parents
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">{currentForm.title}</h3>
              </div>
              <button onClick={() => setShowPreviewModal(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {currentForm.instructions && (
                <div className="p-3 bg-teal-50/60 rounded-xl border border-teal-200 text-slate-700">
                  {currentForm.instructions}
                </div>
              )}

              {currentForm.fields.map(field => (
                <div key={field.id} className="space-y-1">
                  <label className="font-bold text-slate-700">
                    {field.label} {field.required && <span className="text-red-500">*</span>}
                  </label>
                  {field.type === 'long_text' ? (
                    <textarea rows={2} readOnly placeholder={field.placeholder || ''} className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-slate-50" />
                  ) : (
                    <input type="text" readOnly placeholder={field.placeholder || ''} className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-slate-50" />
                  )}
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowPreviewModal(false)}
                className="px-4 py-2 bg-teal-700 text-white rounded-xl font-bold text-xs"
              >
                Fermer l'aperçu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 8: CREATE / EDIT ACADEMIC YEAR */}
      {showAddYearModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-slate-200 shadow-2xl space-y-4 text-left relative animate-fade-in my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded uppercase">
                  Configuration Établissement
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">
                  {editingYear ? `Modifier l'année ${editingYear.name}` : 'Créer une nouvelle année scolaire'}
                </h3>
              </div>
              <button onClick={() => setShowAddYearModal(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAcademicYear} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">
                  Nom ou libellé de l'année scolaire <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={yearName}
                  onChange={e => setYearName(e.target.value)}
                  placeholder="Ex: 2026–2027, 2027–2028..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold"
                />
                <p className="text-[11px] text-slate-400">
                  Format standard en Haïti : Année de départ–Année de fin (ex: 2026–2027).
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Date d'ouverture officielle</label>
                  <input
                    type="date"
                    required
                    value={yearStartDate}
                    onChange={e => setYearStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Date de clôture officielle</label>
                  <input
                    type="date"
                    required
                    value={yearEndDate}
                    onChange={e => setYearEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Statut de l'année scolaire</label>
                <select
                  value={yearStatus}
                  onChange={e => {
                    const val = e.target.value as AcademicYearStatus;
                    setYearStatus(val);
                    if (val === 'past') setYearEnrollmentOpen(false);
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white font-semibold"
                >
                  <option value="upcoming">À venir — Année future / Rentrée prochaine</option>
                  <option value="current">Année en cours — Année académique active de l'école</option>
                  <option value="past">Passée — Archive historique (Inscriptions interdites)</option>
                </select>
                <p className="text-[11px] text-slate-400">
                  {yearStatus === 'current'
                    ? "Définir cette année comme 'Année en cours' basculera automatiquement l'ancienne année active en archive passée ou à venir."
                    : yearStatus === 'upcoming'
                    ? "Permet d'ouvrir les inscriptions anticipées pour les parents sans clôturer l'année en cours."
                    : "Une année passée conserve tous ses dossiers reçus mais refuse tout nouveau dépôt."}
                </p>
              </div>

              <div className="pt-2">
                {yearStatus !== 'past' ? (
                  <label className="flex items-center gap-2.5 cursor-pointer font-bold text-slate-800 p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <input
                      type="checkbox"
                      checked={yearEnrollmentOpen}
                      onChange={e => setYearEnrollmentOpen(e.target.checked)}
                      className="rounded text-teal-700 w-4 h-4"
                    />
                    <div>
                      <span>Ouvrir les inscriptions pour cette année</span>
                      <p className="text-[11px] font-normal text-slate-500">
                        Si coché, les parents pourront soumettre des candidatures pour cette année depuis le profil public de l'école.
                      </p>
                    </div>
                  </label>
                ) : (
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs">
                    <strong>Règle de conformité :</strong> Pour toute année passée, les inscriptions sont obligatoirement verrouillées et closes.
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddYearModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-bold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={yearSaving}
                  className="px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl shadow-xs disabled:opacity-50"
                >
                  {yearSaving ? 'Enregistrement...' : editingYear ? 'Mettre à jour' : 'Créer l\'année scolaire'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
