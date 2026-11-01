import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Calendar,
  CheckCircle2,
  FileCheck,
  FileText,
  Lock,
  Plus,
  Sparkles,
  Upload,
  User,
  Users,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { schoolService } from '../../services/schoolService';
import {
  AcademicYear,
  Application,
  ApplicationForm,
  ChildProfile,
  FormField,
  FormType,
  School,
} from '../../types';

interface ApplicationModalProps {
  school: School;
  formType: FormType;
  onClose: () => void;
  onSuccess: (app: Application) => void;
  onNavigateToAuth: () => void;
}

export function ApplicationModal({
  school,
  formType,
  onClose,
  onSuccess,
  onNavigateToAuth,
}: ApplicationModalProps) {
  const { currentUser, userProfile } = useAuth();

  const [formConfig, setFormConfig] = useState<ApplicationForm | null>(null);
  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string>('');

  // Academic Years state
  const [openAcademicYears, setOpenAcademicYears] = useState<AcademicYear[]>([]);
  const [selectedAcademicYearId, setSelectedAcademicYearId] = useState<string>('');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [submittedApp, setSubmittedApp] = useState<Application | null>(null);

  // Form field answers dictionary: key = field.id, val = answer
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [studentName, setStudentName] = useState('');
  const [studentDob, setStudentDob] = useState('');
  const [studentGender, setStudentGender] = useState('Masculin');
  const [requestedLevel, setRequestedLevel] = useState(school.levelsOffered[0] || '1ère Année');
  const [guardianName, setGuardianName] = useState(userProfile?.displayName || '');
  const [guardianPhone, setGuardianPhone] = useState(userProfile?.phoneNumber || '+509 ');
  const [guardianEmail, setGuardianEmail] = useState(currentUser?.email || '');
  const [guardianAddress, setGuardianAddress] = useState('');
  const [previousSchool, setPreviousSchool] = useState('');

  useEffect(() => {
    loadFormAndChildren();
  }, [school.id, formType, currentUser]);

  const loadFormAndChildren = async () => {
    setLoading(true);
    try {
      const [form, years] = await Promise.all([
        schoolService.getApplicationForm(school.id, formType),
        schoolService.getOpenAcademicYears(school.id),
      ]);
      setFormConfig(form);
      setOpenAcademicYears(years);

      // Default select current academic year if open, or the first open year
      const currentYear = years.find(y => y.status === 'current');
      if (currentYear) {
        setSelectedAcademicYearId(currentYear.id);
      } else if (years.length > 0) {
        setSelectedAcademicYearId(years[0].id);
      }

      if (currentUser) {
        const myChildren = await schoolService.getChildrenForParent(currentUser.uid);
        setChildren(myChildren);
        if (myChildren.length > 0) {
          applyChildProfile(myChildren[0]);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const applyChildProfile = (child: ChildProfile) => {
    setSelectedChildId(child.id);
    const fullName = `${child.firstName} ${child.lastName}`.trim();
    setStudentName(fullName);
    setStudentDob(child.dateOfBirth || '');
    setStudentGender(child.gender === 'F' ? 'Féminin' : 'Masculin');
    if (child.currentGrade) setRequestedLevel(child.currentGrade);
    if (child.previousSchool) setPreviousSchool(child.previousSchool);
    if (child.guardianName) setGuardianName(child.guardianName);
    if (child.guardianPhone) setGuardianPhone(child.guardianPhone);
    if (child.guardianEmail) setGuardianEmail(child.guardianEmail);
    if (child.guardianAddress) setGuardianAddress(child.guardianAddress);

    // Also populate common answer keys if matching
    setAnswers(prev => ({
      ...prev,
      student_full_name: fullName,
      student_dob: child.dateOfBirth,
      student_gender: child.gender === 'F' ? 'Féminin' : 'Masculin',
      guardian_name: child.guardianName,
      guardian_phone: child.guardianPhone,
      guardian_email: child.guardianEmail,
      guardian_address: child.guardianAddress,
      previous_school: child.previousSchool,
    }));
  };

  const handleAnswerChange = (fieldId: string, value: any) => {
    setAnswers(prev => ({ ...prev, [fieldId]: value }));

    // Keep core properties synchronized for quick listing & indexing
    if (fieldId === 'student_full_name') setStudentName(value);
    if (fieldId === 'student_dob') setStudentDob(value);
    if (fieldId === 'student_gender') setStudentGender(value);
    if (fieldId === 'requested_level') setRequestedLevel(value);
    if (fieldId === 'guardian_name') setGuardianName(value);
    if (fieldId === 'guardian_phone') setGuardianPhone(value);
    if (fieldId === 'guardian_email') setGuardianEmail(value);
    if (fieldId === 'guardian_address') setGuardianAddress(value);
    if (fieldId === 'previous_school') setPreviousSchool(value);
  };

  const handleSubmit = async (isDraft: boolean = false) => {
    setErrorMsg('');

    if (!currentUser) {
      onNavigateToAuth();
      return;
    }

    if (!studentName.trim()) {
      setErrorMsg('Veuillez renseigner le nom et prénom de l\'élève.');
      return;
    }

    if (!guardianPhone.trim() || guardianPhone.trim() === '+509') {
      setErrorMsg('Veuillez renseigner un numéro de téléphone joignable.');
      return;
    }

    // Validate required fields if not a draft
    if (!isDraft && formConfig?.fields) {
      for (const f of formConfig.fields) {
        if (f.required && f.type !== 'section_heading' && f.type !== 'info_text') {
          const val = answers[f.id];
          if (val === undefined || val === null || val === '') {
            setErrorMsg(`Le champ obligatoire « ${f.label} » n'est pas renseigné.`);
            return;
          }
        }
      }
    }

    // Validate Academic Year selection
    const selectedYear = openAcademicYears.find(y => y.id === selectedAcademicYearId);
    if (!selectedYear) {
      setErrorMsg('Veuillez sélectionner l\'année académique pour laquelle vous souhaitez postuler.');
      return;
    }

    if (selectedYear.status === 'past') {
      setErrorMsg('Les inscriptions pour une année académique passée ne sont plus autorisées.');
      return;
    }

    if (!selectedYear.enrollmentOpen) {
      setErrorMsg(`Les inscriptions sont actuellement fermées pour l'année scolaire ${selectedYear.name}.`);
      return;
    }

    setSubmitting(true);
    try {
      const app = await schoolService.submitApplication({
        schoolId: school.id,
        schoolName: school.name,
        schoolSlug: school.slug,
        schoolCommune: `${school.commune}, ${school.department}`,
        academicYearId: selectedYear.id,
        academicYearName: selectedYear.name,
        applicantId: currentUser.uid,
        childId: selectedChildId || undefined,
        studentName: studentName.trim(),
        studentDob: studentDob || undefined,
        studentGender: studentGender || undefined,
        formType,
        requestedLevel,
        previousSchool: previousSchool || undefined,
        guardianName: guardianName.trim() || userProfile?.displayName || 'Parent',
        guardianPhone: guardianPhone.trim(),
        guardianEmail: guardianEmail.trim() || currentUser.email || undefined,
        guardianAddress: guardianAddress.trim() || undefined,
        answers,
        status: isDraft ? 'draft' : 'submitted',
      });

      setSubmittedApp(app);
      onSuccess(app);
    } catch (err: any) {
      setErrorMsg(err.message || 'Erreur lors de la transmission du dossier.');
    } finally {
      setSubmitting(false);
    }
  };

  // Helper to render dynamic custom field types
  const renderField = (field: FormField) => {
    const val = answers[field.id] ?? '';

    switch (field.type) {
      case 'section_heading':
        return (
          <div key={field.id} className="pt-4 pb-1 border-b border-slate-200">
            <h4 className="text-sm font-bold text-slate-900">{field.label}</h4>
            {field.instructions && (
              <p className="text-xs text-slate-500 mt-0.5">{field.instructions}</p>
            )}
          </div>
        );

      case 'info_text':
        return (
          <div key={field.id} className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-xs text-teal-900">
            <p className="font-semibold">{field.label}</p>
            {field.instructions && <p className="mt-1 text-[11px] text-teal-800">{field.instructions}</p>}
          </div>
        );

      case 'short_text':
      case 'phone':
      case 'email':
      case 'number':
        return (
          <div key={field.id} className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            {field.instructions && (
              <p className="text-[11px] text-slate-400">{field.instructions}</p>
            )}
            <input
              type={field.type === 'number' ? 'number' : field.type === 'email' ? 'email' : 'text'}
              value={val}
              onChange={e => handleAnswerChange(field.id, e.target.value)}
              placeholder={field.placeholder || ''}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-700 bg-white"
            />
          </div>
        );

      case 'date':
        return (
          <div key={field.id} className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <input
              type="date"
              value={val}
              onChange={e => handleAnswerChange(field.id, e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-700 bg-white"
            />
          </div>
        );

      case 'long_text':
        return (
          <div key={field.id} className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            {field.instructions && (
              <p className="text-[11px] text-slate-400">{field.instructions}</p>
            )}
            <textarea
              rows={3}
              value={val}
              onChange={e => handleAnswerChange(field.id, e.target.value)}
              placeholder={field.placeholder || ''}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-700 bg-white"
            />
          </div>
        );

      case 'dropdown':
        return (
          <div key={field.id} className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <select
              value={val}
              onChange={e => handleAnswerChange(field.id, e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-700 bg-white"
            >
              <option value="">Sélectionnez une option</option>
              {(field.options || []).map((opt, i) => (
                <option key={i} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        );

      case 'single_choice':
        return (
          <div key={field.id} className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <div className="space-y-1">
              {(field.options || []).map((opt, i) => (
                <label key={i} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name={field.id}
                    value={opt}
                    checked={val === opt}
                    onChange={() => handleAnswerChange(field.id, opt)}
                    className="text-teal-700 focus:ring-teal-700"
                  />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case 'multiple_choice':
        const selectedArr = Array.isArray(val) ? val : [];
        return (
          <div key={field.id} className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <div className="space-y-1">
              {(field.options || []).map((opt, i) => {
                const checked = selectedArr.includes(opt);
                return (
                  <label key={i} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={e => {
                        if (e.target.checked) {
                          handleAnswerChange(field.id, [...selectedArr, opt]);
                        } else {
                          handleAnswerChange(
                            field.id,
                            selectedArr.filter((x: string) => x !== opt)
                          );
                        }
                      }}
                      className="rounded text-teal-700 focus:ring-teal-700"
                    />
                    <span>{opt}</span>
                  </label>
                );
              })}
            </div>
          </div>
        );

      case 'yes_no':
        return (
          <div key={field.id} className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <div className="flex items-center gap-4">
              <label className="inline-flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                <input
                  type="radio"
                  name={field.id}
                  value="Oui"
                  checked={val === 'Oui'}
                  onChange={() => handleAnswerChange(field.id, 'Oui')}
                  className="text-teal-700 focus:ring-teal-700"
                />
                <span>Oui</span>
              </label>
              <label className="inline-flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                <input
                  type="radio"
                  name={field.id}
                  value="Non"
                  checked={val === 'Non'}
                  onChange={() => handleAnswerChange(field.id, 'Non')}
                  className="text-teal-700 focus:ring-teal-700"
                />
                <span>Non</span>
              </label>
            </div>
          </div>
        );

      case 'file_upload':
        return (
          <div key={field.id} className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            {field.instructions && (
              <p className="text-[11px] text-slate-400">{field.instructions}</p>
            )}
            <div className="p-3 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 flex items-center justify-between text-xs text-slate-600">
              <span className="truncate">{val || 'Aucun fichier sélectionné (PDF, JPG, PNG)'}</span>
              <button
                type="button"
                onClick={() => {
                  const sampleDocName = `${field.label.slice(0, 15)}-document.pdf`;
                  handleAnswerChange(field.id, sampleDocName);
                }}
                className="px-2.5 py-1 bg-white border border-slate-200 text-teal-800 font-bold rounded-lg hover:bg-slate-100"
              >
                Parcourir
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 border border-slate-200 shadow-2xl space-y-6 text-left relative animate-fade-in my-8 max-h-[92vh] flex flex-col justify-between">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                {formType === 'new_enrollment' ? 'Nouvelle Inscription' : 'Confirmation de Réinscription'}
              </span>
              <span className="text-xs font-mono text-slate-400">v{formConfig?.version || 1}</span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 mt-1">{school.name}</h2>
            <p className="text-xs text-slate-500">{formConfig?.description}</p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Submission Success vs Active Form */}
        {submittedApp ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-extrabold text-slate-900">Demande transmise avec succès !</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Votre dossier a été transmis à la direction de {school.name}. Conservez précieusement votre numéro de dossier officiel ci-dessous.
              </p>
            </div>

            {/* Reference Number Card */}
            <div className="p-4 bg-teal-50 rounded-2xl border border-teal-200 max-w-sm mx-auto space-y-2">
              <p className="text-[11px] font-bold text-teal-800 uppercase tracking-wider">Numéro de dossier officiel</p>
              <p className="text-xl font-black text-teal-950 font-mono tracking-wider">
                {submittedApp.referenceNumber}
              </p>
              <div className="pt-2 border-t border-teal-200/70 text-left text-xs space-y-1">
                <p className="text-teal-900"><span className="text-slate-500 font-normal">Élève :</span> <strong>{submittedApp.studentName}</strong></p>
                <p className="text-teal-900"><span className="text-slate-500 font-normal">Année scolaire :</span> <strong>{submittedApp.academicYearName}</strong></p>
                <p className="text-teal-900"><span className="text-slate-500 font-normal">Niveau :</span> <strong>{submittedApp.requestedLevel}</strong></p>
              </div>
            </div>

            <p className="text-xs text-slate-500">
              Vous pouvez suivre l'état d'examen de ce dossier à tout moment depuis votre tableau de bord famille.
            </p>

            <div className="pt-4 flex items-center justify-center gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs hover:bg-teal-800"
              >
                Fermer et voir mes demandes
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto pr-2 space-y-6">
            {/* If not logged in: Banner */}
            {!currentUser && (
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 text-xs flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>Connectez-vous ou créez un compte gratuit pour enregistrer et soumettre cette candidature.</span>
                </div>
                <button
                  type="button"
                  onClick={onNavigateToAuth}
                  className="px-3 py-1.5 bg-amber-800 text-white font-bold rounded-lg shrink-0 text-xs"
                >
                  Se connecter
                </button>
              </div>
            )}

            {/* Child Profile Quick Selector (Common App Haiti Feature) */}
            {currentUser && children.length > 0 && (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-teal-700" />
                    <span>Choisir un enfant enregistré dans votre profil famille :</span>
                  </label>
                  <span className="text-[11px] text-teal-700 font-semibold">Pré-remplissage automatique</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {children.map(child => (
                    <button
                      key={child.id}
                      type="button"
                      onClick={() => applyChildProfile(child)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        selectedChildId === child.id
                          ? 'bg-teal-700 text-white shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-700 hover:border-teal-300'
                      }`}
                    >
                      {child.firstName} {child.lastName} ({child.gender})
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Academic Year Selection Card */}
            <div className="p-4 bg-teal-50/50 rounded-2xl border border-teal-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-teal-700" />
                  <span>Année académique d'inscription <span className="text-red-500">*</span> :</span>
                </label>
                {openAcademicYears.length > 0 && (
                  <span className="text-[11px] text-teal-800 font-semibold">
                    {openAcademicYears.length} session{openAcademicYears.length > 1 ? 's' : ''} ouverte{openAcademicYears.length > 1 ? 's' : ''}
                  </span>
                )}
              </div>

              {openAcademicYears.length === 0 ? (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-rose-900">Inscriptions actuellement indisponibles</p>
                    <p className="mt-1 leading-relaxed">
                      Les inscriptions sont actuellement fermées pour toutes les années académiques de cet établissement. Vous ne pouvez pas soumettre de candidature pour le moment.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {openAcademicYears.map(year => (
                    <button
                      key={year.id}
                      type="button"
                      onClick={() => setSelectedAcademicYearId(year.id)}
                      className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between gap-1.5 ${
                        selectedAcademicYearId === year.id
                          ? 'border-teal-700 bg-teal-700 text-white shadow-xs ring-2 ring-teal-700/20'
                          : 'border-slate-200 bg-white text-slate-800 hover:border-teal-400 hover:bg-teal-50/30'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-sm">{year.name}</span>
                        {year.status === 'current' ? (
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            selectedAcademicYearId === year.id
                              ? 'bg-white text-teal-900'
                              : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          }`}>
                            Année en cours
                          </span>
                        ) : (
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            selectedAcademicYearId === year.id
                              ? 'bg-teal-800 text-white border border-teal-600'
                              : 'bg-indigo-50 text-indigo-800 border border-indigo-200'
                          }`}>
                            À venir — Anticipée
                          </span>
                        )}
                      </div>
                      <p className={`text-[11px] ${selectedAcademicYearId === year.id ? 'text-teal-100' : 'text-slate-500'}`}>
                        Du {year.startDate} au {year.endDate}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Instructions */}
            {formConfig?.instructions && (
              <div className="p-3.5 bg-teal-50/60 border border-teal-200/70 rounded-2xl text-xs text-slate-700 space-y-1">
                <p className="font-bold text-teal-900">Consignes de l'école :</p>
                <p className="leading-relaxed">{formConfig.instructions}</p>
              </div>
            )}

            {/* Form Fields (Rendered dynamically based on the school's configured form) */}
            <div className="space-y-4">
              {formConfig?.fields && formConfig.fields.length > 0 ? (
                formConfig.fields.map(field => renderField(field))
              ) : (
                <p className="text-xs text-slate-400 py-4 text-center">
                  Chargement des champs du formulaire...
                </p>
              )}
            </div>

            {/* Required Documents Notice */}
            {formConfig?.requiredDocuments && formConfig.requiredDocuments.length > 0 && (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
                <p className="font-bold text-slate-900">Pièces justificatives à fournir selon l'école :</p>
                <ul className="space-y-1 text-slate-600 list-disc list-inside">
                  {formConfig.requiredDocuments.map((docItem, idx) => (
                    <li key={idx}>{docItem}</li>
                  ))}
                </ul>
                <p className="text-[11px] text-slate-400 pt-1">
                  * Vous pourrez joindre ou présenter ces documents lors de la confirmation définitive par la direction.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Footer Actions */}
        {!submittedApp && (
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition-colors"
            >
              Annuler
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={submitting || openAcademicYears.length === 0}
                onClick={() => handleSubmit(true)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Enregistrer brouillon
              </button>

              <button
                type="button"
                disabled={submitting || openAcademicYears.length === 0}
                onClick={() => handleSubmit(false)}
                className="px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                title={openAcademicYears.length === 0 ? "Inscriptions fermées pour cet établissement" : undefined}
              >
                {submitting ? (
                  <span>Envoi en cours...</span>
                ) : openAcademicYears.length === 0 ? (
                  <span>Inscriptions fermées</span>
                ) : (
                  <>
                    <span>Soumettre la demande</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
