import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Award,
  Bell,
  BookOpen,
  Building,
  Calendar,
  CheckCircle2,
  DollarSign,
  ExternalLink,
  FileText,
  GraduationCap,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  School as SchoolIcon,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';
import { schoolService } from '../../services/schoolService';
import { AcademicYear, Announcement, ApplicationForm, School } from '../../types';

interface SchoolPublicProfileProps {
  slug: string;
  onBack: () => void;
  onOpenApplication: (school: School, formType: 'new_enrollment' | 're_enrollment') => void;
}

export function SchoolPublicProfile({
  slug,
  onBack,
  onOpenApplication,
}: SchoolPublicProfileProps) {
  const [school, setSchool] = useState<School | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [newEnrollmentForm, setNewEnrollmentForm] = useState<ApplicationForm | null>(null);
  const [reEnrollmentForm, setReEnrollmentForm] = useState<ApplicationForm | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSchoolData();
  }, [slug]);

  const loadSchoolData = async () => {
    setLoading(true);
    try {
      const data = await schoolService.getSchoolBySlug(slug);
      if (data) {
        setSchool(data);
        const [ann, formNew, formRe, years] = await Promise.all([
          schoolService.getAnnouncements(data.id, false),
          schoolService.getApplicationForm(data.id, 'new_enrollment'),
          schoolService.getApplicationForm(data.id, 're_enrollment'),
          schoolService.getAcademicYears(data.id),
        ]);
        setAnnouncements(ann);
        setNewEnrollmentForm(formNew);
        setReEnrollmentForm(formRe);
        setAcademicYears(years);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-32 text-center space-y-3">
        <div className="w-8 h-8 border-3 border-teal-700 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-500">Chargement du profil de l'école...</p>
      </div>
    );
  }

  if (!school) {
    return (
      <div className="max-w-3xl mx-auto py-20 px-4 text-center space-y-4">
        <Building className="w-12 h-12 text-slate-300 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800">Établissement introuvable</h2>
        <p className="text-xs text-slate-500">
          Ce profil n'existe pas ou n'a pas encore été publié par la direction de l'école.
        </p>
        <button
          onClick={onBack}
          className="px-5 py-2.5 bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs"
        >
          Retour à la recherche d'écoles
        </button>
      </div>
    );
  }

  const openYears = academicYears.filter(y => y.enrollmentOpen && y.status !== 'past');
  const hasOpenAcademicYear = openYears.length > 0;
  const currentYear = academicYears.find(y => y.status === 'current');

  const isNewEnrollmentAvailable =
    hasOpenAcademicYear && school.newEnrollmentOpen && newEnrollmentForm?.status === 'open';

  const isReEnrollmentAvailable =
    hasOpenAcademicYear && school.reEnrollmentOpen && reEnrollmentForm?.status === 'open';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-left space-y-8">
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-teal-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Retour à l'annuaire des écoles</span>
      </button>

      {/* Hero Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        {/* Cover image */}
        <div className="relative h-60 sm:h-72 w-full bg-slate-900 overflow-hidden">
          <img
            src={school.coverImageUrl || 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1200&q=80'}
            alt={school.name}
            className="w-full h-full object-cover opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-black/20 to-transparent" />

          <div className="absolute top-4 left-4">
            <span className="px-3 py-1 text-xs font-bold rounded-lg bg-white/95 text-slate-900 shadow-sm backdrop-blur-xs">
              {school.schoolType === 'congregational' ? 'Congréganiste' : school.schoolType === 'public' ? 'Public' : 'Privé'}
            </span>
          </div>

          <div className="absolute top-4 right-4">
            <span className="px-3 py-1 text-xs font-bold rounded-lg bg-teal-700 text-white shadow-xs">
              {school.department} • {school.commune}
            </span>
          </div>
        </div>

        {/* Profile Card Header Info */}
        <div className="p-6 sm:p-8 relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 -mt-16 sm:-mt-20">
            {/* Logo + Basic details */}
            <div className="flex items-end gap-4">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-white p-2 border-2 border-white shadow-xl overflow-hidden shrink-0">
                <img
                  src={school.logoUrl || '/LekòlWeb.png'}
                  alt={school.name}
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                    {school.name}
                  </h1>
                  {school.verificationStatus === 'verified' && (
                    <span
                      title="Établissement vérifié"
                      className="w-5 h-5 rounded-full bg-teal-700 text-white flex items-center justify-center text-xs font-bold"
                    >
                      ✓
                    </span>
                  )}
                </div>
                {school.motto && (
                  <p className="text-xs italic text-teal-800 font-semibold">« {school.motto} »</p>
                )}
                <p className="text-xs text-slate-500 flex items-center gap-1.5 pt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  <span>{school.address || `${school.commune}, ${school.department}, Haïti`}</span>
                </p>

                {/* Academic Year badges */}
                <div className="flex flex-wrap items-center gap-2 pt-2 text-xs">
                  {currentYear && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold bg-teal-50 text-teal-800 border border-teal-200">
                      <Calendar className="w-3.5 h-3.5 text-teal-600" />
                      <span>Année en cours : {currentYear.name}</span>
                    </span>
                  )}
                  {hasOpenAcademicYear ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Inscriptions ouvertes ({openYears.map(y => y.name).join(', ')})</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold bg-slate-100 text-slate-600 border border-slate-200">
                      <span>Inscriptions clôturées</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Direct Action Buttons for Admissions */}
            <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
              {isNewEnrollmentAvailable && (
                <button
                  onClick={() => onOpenApplication(school, 'new_enrollment')}
                  className="flex-1 sm:flex-initial px-5 py-3 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <FileText className="w-4 h-4 text-teal-200" />
                  <span>Nouvelle Inscription</span>
                </button>
              )}

              {isReEnrollmentAvailable && (
                <button
                  onClick={() => onOpenApplication(school, 're_enrollment')}
                  className="flex-1 sm:flex-initial px-5 py-3 bg-white hover:bg-teal-50 text-teal-900 border border-teal-300 font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-teal-700" />
                  <span>Réinscription</span>
                </button>
              )}

              {!isNewEnrollmentAvailable && !isReEnrollmentAvailable && (
                <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-3 py-2 rounded-xl">
                  Inscriptions fermées pour le moment
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Description, Levels, Contacts, Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (8 cols): Content */}
        <div className="lg:col-span-8 space-y-8">
          {/* Presentation */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-teal-700" />
              <span>Présentation de l'établissement</span>
            </h2>
            <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {school.description}
            </div>

            {/* Facilities / Infrastructure */}
            {school.facilities && school.facilities.length > 0 && (
              <div className="pt-4 border-t border-slate-100 space-y-2">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Installations & Équipements
                </h4>
                <div className="flex flex-wrap gap-2">
                  {school.facilities.map((fac, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-700"
                    >
                      ✓ {fac}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Cycles & Niveaux offerts */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-teal-700" />
              <span>Cycles scolaires et programmes d'enseignement</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(school.levelsOffered || []).map((lvl, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl border border-teal-100 bg-teal-50/50 flex items-start gap-2.5 text-xs text-slate-800 font-semibold"
                >
                  <CheckCircle2 className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                  <span>{lvl}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Admissions Requirements & Tuition */}
          {(school.admissionsInfo || school.tuitionInfo) && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-teal-700" />
                <span>Conditions d'admission et scolarité</span>
              </h2>

              {school.admissionsInfo && (
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Critères & Modalités</h4>
                  <p className="text-sm text-slate-700 leading-relaxed">{school.admissionsInfo}</p>
                </div>
              )}

              {school.tuitionInfo && (
                <div className="space-y-1 pt-3 border-t border-slate-100">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Frais & Échéances</h4>
                  <p className="text-sm text-slate-700 leading-relaxed">{school.tuitionInfo}</p>
                </div>
              )}
            </div>
          )}

          {/* School-specific Announcements */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Bell className="w-5 h-5 text-teal-700" />
                <span>Annonces officielles de l'école</span>
              </h2>
              <span className="text-xs font-bold text-slate-400">{announcements.length} publication(s)</span>
            </div>

            {announcements.length > 0 ? (
              <div className="space-y-3">
                {announcements.map(ann => (
                  <div key={ann.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-teal-800">{ann.title}</span>
                      <span className="text-slate-400">
                        {new Date(ann.publishedAt || ann.createdAt).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{ann.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-4 text-center">
                Aucune annonce en cours pour cet établissement.
              </p>
            )}
          </div>
        </div>

        {/* Right Column (4 cols): Quick Contacts & Admissions Box */}
        <div className="lg:col-span-4 space-y-6">
          {/* Admissions Action Box */}
          <div className="bg-gradient-to-br from-teal-900 to-slate-900 text-white rounded-3xl p-6 shadow-md space-y-4">
            <h3 className="font-extrabold text-base flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-300" />
              <span>Inscriptions ouvertes</span>
            </h3>
            <p className="text-xs text-teal-100 leading-relaxed">
              Postulez en ligne avec votre compte LekòlWeb. Vous pouvez enregistrer votre brouillon et suivre le statut de votre candidature en direct.
            </p>

            <div className="space-y-2 pt-1">
              {isNewEnrollmentAvailable && (
                <button
                  onClick={() => onOpenApplication(school, 'new_enrollment')}
                  className="w-full py-3 px-4 bg-teal-300 hover:bg-teal-200 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all text-center"
                >
                  Déposer une Nouvelle Inscription
                </button>
              )}

              {isReEnrollmentAvailable && (
                <button
                  onClick={() => onOpenApplication(school, 're_enrollment')}
                  className="w-full py-3 px-4 bg-white/10 hover:bg-white/20 text-white border border-teal-400/40 font-bold text-xs rounded-xl transition-all text-center"
                >
                  Confirmer une Réinscription
                </button>
              )}
            </div>
          </div>

          {/* Contact Details Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">
              Coordonnées Officielles
            </h3>

            <div className="space-y-3 text-xs text-slate-700">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                <span>{school.address || `${school.commune}, ${school.department}`}</span>
              </div>

              {school.publicPhone && (
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-teal-700 shrink-0" />
                  <a href={`tel:${school.publicPhone}`} className="hover:underline font-mono">
                    {school.publicPhone}
                  </a>
                </div>
              )}

              {school.whatsappPhone && (
                <div className="flex items-center gap-2.5">
                  <MessageCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-mono">WhatsApp : {school.whatsappPhone}</span>
                </div>
              )}

              {school.publicEmail && (
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-teal-700 shrink-0" />
                  <a href={`mailto:${school.publicEmail}`} className="hover:underline truncate">
                    {school.publicEmail}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Safe & Verified Badge */}
          <div className="bg-teal-50/70 rounded-3xl p-5 border border-teal-200/80 text-xs text-teal-900 space-y-2">
            <div className="flex items-center gap-2 font-bold">
              <ShieldCheck className="w-4 h-4 text-teal-700" />
              <span>Garantie LekòlWeb</span>
            </div>
            <p className="text-[11px] text-teal-800 leading-relaxed">
              Les formulaires d'admission et annonces sur ce profil sont directement émis et administrés par la direction officielle de l'école.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
