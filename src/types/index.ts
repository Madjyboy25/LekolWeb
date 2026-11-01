export type SchoolType = 'private' | 'public' | 'congregational';

export type SchoolStatus = 'draft' | 'pending_review' | 'published' | 'suspended';

export type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected';

export type UserRole = 'parent' | 'principal' | 'student' | 'staff' | 'admin';

export type FormType = 'new_enrollment' | 're_enrollment';

export type FormStatus = 'draft' | 'open' | 'closed';

export type AnnouncementCategory =
  | 'new_enrollment'
  | 're_enrollment'
  | 'examinations'
  | 'important_dates'
  | 'school_activities'
  | 'general';

export type AnnouncementStatus = 'draft' | 'published' | 'archived';

export type ApplicationStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'info_requested'
  | 'accepted'
  | 'rejected'
  | 'waitlisted'
  | 'withdrawn';

export interface StaffPermissions {
  canEditProfile: boolean;
  canManageAnnouncements: boolean;
  canConfigureForms: boolean;
  canReviewNewEnrollment: boolean;
  canReviewReEnrollment: boolean;
  canViewReports: boolean;
}

export interface SchoolStaffMember {
  id: string;
  uid?: string;
  email: string;
  displayName: string;
  role: 'staff';
  permissions: StaffPermissions;
  status: 'active' | 'pending' | 'revoked';
  invitedAt: string;
  acceptedAt?: string;
}

export interface School {
  id: string;
  ownerId: string; // Director / School Owner UID
  name: string;
  slug: string;
  description: string;
  schoolType: SchoolType;
  department: string;
  commune: string;
  address: string;
  publicEmail: string;
  publicPhone: string;
  whatsappPhone?: string;
  logoUrl?: string;
  coverImageUrl?: string;
  status: SchoolStatus;
  verificationStatus: VerificationStatus;
  levelsOffered: string[];
  languages: string[];
  facilities?: string[];
  tuitionInfo?: string;
  admissionsInfo?: string;
  motto?: string;
  foundedYear?: number;
  newEnrollmentOpen?: boolean;
  reEnrollmentOpen?: boolean;
  staffIds?: string[];
  staffMembers?: SchoolStaffMember[];
  currentAcademicYearId?: string;
  currentAcademicYearName?: string;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type AcademicYearStatus = 'upcoming' | 'current' | 'past';

export interface AcademicYear {
  id: string;
  schoolId: string;
  name: string; // e.g. "2026–2027"
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  status: AcademicYearStatus;
  enrollmentOpen: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Announcement {
  id: string;
  schoolId: string;
  schoolName: string;
  schoolLogo?: string;
  schoolCommune?: string;
  academicYearId?: string;
  academicYearName?: string;
  title: string;
  content: string;
  category: AnnouncementCategory;
  imageUrl?: string;
  attachmentName?: string;
  attachmentUrl?: string;
  status: AnnouncementStatus;
  publishedAt?: string;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

export type FormFieldType =
  | 'short_text'
  | 'long_text'
  | 'date'
  | 'phone'
  | 'email'
  | 'number'
  | 'dropdown'
  | 'single_choice'
  | 'multiple_choice'
  | 'yes_no'
  | 'file_upload'
  | 'section_heading'
  | 'info_text';

export interface FormField {
  id: string;
  type: FormFieldType;
  label: string;
  placeholder?: string;
  instructions?: string;
  required: boolean;
  options?: string[]; // For dropdown, single_choice, multiple_choice
  validationRule?: string;
  defaultValue?: string;
  category?: 'student' | 'guardian' | 'academic' | 'document' | 'custom';
}

export interface ApplicationForm {
  id: string;
  schoolId: string;
  formType: FormType;
  title: string;
  description: string;
  instructions?: string;
  status: FormStatus;
  openDate?: string;
  deadlineDate?: string;
  requiredDocuments: string[];
  fields: FormField[];
  confirmationMessage?: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface ChildProfile {
  id: string;
  parentId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'M' | 'F' | 'Other';
  currentGrade?: string;
  previousSchool?: string;
  medicalOrSpecialNotes?: string;
  guardianName: string;
  guardianRelationship: string;
  guardianPhone: string;
  guardianEmail?: string;
  guardianAddress?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StatusHistoryEntry {
  status: ApplicationStatus;
  timestamp: string;
  note?: string;
  updatedBy: string;
}

export interface Application {
  id: string;
  referenceNumber: string;
  schoolId: string;
  schoolName: string;
  schoolSlug?: string;
  schoolCommune?: string;
  academicYearId: string; // Permanently associated academic year ID
  academicYearName?: string; // e.g. "2026–2027"
  applicantId: string; // Parent UID
  childId?: string;
  studentName: string;
  studentDob?: string;
  studentGender?: string;
  formType: FormType;
  formVersion: number;
  formSnapshot?: ApplicationForm;
  requestedLevel: string;
  previousSchool?: string;
  guardianName: string;
  guardianEmail?: string;
  guardianPhone: string;
  guardianAddress?: string;
  answers: Record<string, any>; // Keyed by field id
  uploadedDocuments?: {
    name: string;
    url: string;
    type?: string;
  }[];
  additionalNotes?: string;
  status: ApplicationStatus;
  statusNote?: string; // Message visible to parent
  internalNotes?: string; // Private to school staff
  studentUid?: string; // Authenticated student UID if linked
  statusHistory: StatusHistoryEntry[];
  submittedAt: string;
  updatedAt: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  fullName?: string;
  role: UserRole;
  phone?: string;
  phoneNumber?: string;
  accountStatus: 'active' | 'suspended';
  schoolIds?: string[]; // Schools owned or managed
  createdAt: string;
  updatedAt: string;
}

export interface SchoolStaffInvitation {
  id: string;
  schoolId: string;
  schoolName: string;
  email: string;
  permissions: StaffPermissions;
  status: 'pending' | 'accepted' | 'revoked' | 'expired';
  invitedBy: string;
  invitedAt: string;
  acceptedAt?: string;
  token: string;
}
