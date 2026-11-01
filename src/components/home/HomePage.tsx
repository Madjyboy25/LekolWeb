import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  Bell,
  Briefcase,
  Building,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Compass,
  FileCheck,
  FileText,
  Filter,
  GraduationCap,
  HelpCircle,
  Laptop,
  MapPin,
  Phone,
  School as SchoolIcon,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';
import {
  HAITIAN_COMMUNES_BY_DEPARTMENT,
  HAITIAN_DEPARTMENTS,
  SCHOOL_LEVELS,
} from '../../lib/constants';
import { schoolService } from '../../services/schoolService';
import { Announcement, School } from '../../types';

interface HomePageProps {
  onNavigate: (view: string, params?: any) => void;
  onSelectSchool: (slug: string) => void;
  onOpenApplication: (school: School, formType: 'new_enrollment' | 're_enrollment') => void;
}

export function HomePage({
  onNavigate,
  onSelectSchool,
  onOpenApplication,
}: HomePageProps) {
  // Search and filter states
  const [searchName, setSearchName] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedCommune, setSelectedCommune] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');

  // Data states
  const [schools, setSchools] = useState<School[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  // FAQ state
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    loadData();

    const handleDataUpdate = () => {
      loadData();
    };
    window.addEventListener('lekolweb:schools-updated', handleDataUpdate);
    window.addEventListener('lekolweb:announcements-updated', handleDataUpdate);
    return () => {
      window.removeEventListener('lekolweb:schools-updated', handleDataUpdate);
      window.removeEventListener('lekolweb:announcements-updated', handleDataUpdate);
    };
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [fetchedSchools, fetchedAnnouncements] = await Promise.all([
        schoolService.getPublishedSchools(),
        schoolService.getAnnouncements(undefined, false),
      ]);
      setSchools(fetchedSchools);
      setAnnouncements(fetchedAnnouncements);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigate('discovery', {
      searchQuery: searchName,
      department: selectedDepartment,
      commune: selectedCommune,
      level: selectedLevel,
    });
  };

  const availableCommunes = selectedDepartment
    ? HAITIAN_COMMUNES_BY_DEPARTMENT[selectedDepartment] || []
    : [];

  const faqs = [
    {
      question: 'Qu\'est-ce que LekòlWeb ?',
      answer:
        'LekòlWeb est la plateforme centralisée d\'inscription et de découverte scolaire pour Haïti, inspirée du modèle Common App. Elle permet aux familles de trouver des écoles, de consulter leurs annonces officielles et de soumettre des demandes de nouvelle inscription ou de réinscription sans se déplacer.',
    },
    {
      question: 'Les écoles ont-elles besoin de créer leur propre site web ?',
      answer:
        'Non. Avec LekòlWeb, les écoles n\'ont plus besoin d\'acheter un nom de domaine, de payer un hébergement ou de coder un site web. Chaque établissement dispose d\'un profil public officiel intégré sur LekòlWeb, d\'un gestionnaire d\'annonces et de formulaires d\'admissions sur-mesure.',
    },
    {
      question: 'Comment un parent soumet-il une demande ?',
      answer:
        'Un parent crée un compte unique sur LekòlWeb. Il peut ajouter ses enfants dans son profil, puis postuler à une ou plusieurs écoles de son choix en remplissant le formulaire de l\'établissement. Un numéro de dossier officiel est immédiatement généré.',
    },
    {
      question: 'Quelle est la différence entre nouvelle inscription et réinscription ?',
      answer:
        'La « Nouvelle inscription » s\'adresse aux élèves qui rejoignent pour la première fois l\'établissement. La « Réinscription » est réservée aux élèves déjà inscrits durant l\'année écoulée pour confirmer leur place pour la nouvelle année.',
    },
    {
      question: 'Comment les directeurs d\'école gèrent-ils leurs établissements ?',
      answer:
        'Depuis un compte directeur unique, un responsable peut gérer un ou plusieurs établissements scolaires, personnaliser les formulaires d\'inscription, publier des annonces, traiter les dossiers de candidature et inviter des administrateurs avec des droits d\'accès contrôlés.',
    },
  ];

  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      {/* ============================================================ */}
      {/* 1. HERO SECTION */}
      {/* ============================================================ */}
      <section className="relative overflow-hidden pt-8 pb-16 md:pt-16 md:pb-24 bg-gradient-to-b from-teal-50/70 via-white to-slate-50 border-b border-slate-200">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-teal-100/50 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-0 -ml-20 w-80 h-80 bg-teal-200/30 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center text-left">
            {/* Left Column: Value Proposition */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200/80 text-teal-900 text-xs font-bold uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                <span>Plateforme Centralisée d'Inscription Scolaire • Haïti</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
                Trouvez une école en Haïti et{' '}
                <span className="text-teal-700 underline decoration-teal-300 decoration-wavy decoration-2 underline-offset-8">
                  simplifiez vos démarches
                </span>{' '}
                d'inscription.
              </h1>

              <p className="text-lg sm:text-xl text-slate-600 font-normal leading-relaxed max-w-2xl">
                Découvrez les établissements scolaires, consultez leurs informations et leurs annonces, puis soumettez vos demandes d'inscription sur une seule plateforme.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
                <button
                  onClick={() => onNavigate('discovery')}
                  className="inline-flex items-center justify-center gap-2 px-7 py-4 bg-teal-700 hover:bg-teal-800 text-white font-bold text-base rounded-2xl shadow-md hover:shadow-lg hover:shadow-teal-700/20 transition-all active:scale-[0.98]"
                >
                  <Search className="w-5 h-5 text-teal-200" />
                  <span>Trouver une école</span>
                </button>

                <button
                  onClick={() => {
                    const el = document.getElementById('decouvrir-lekolweb');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="inline-flex items-center justify-center gap-2 px-6 py-4 bg-white hover:bg-teal-50/50 text-slate-800 font-bold text-base rounded-2xl border border-slate-300 shadow-xs hover:border-teal-400 transition-all"
                >
                  <Compass className="w-5 h-5 text-teal-700" />
                  <span>Découvrir LekòlWeb</span>
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-200/80">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-teal-700 shrink-0" />
                  <span>1 Compte pour toutes les écoles</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-teal-700 shrink-0" />
                  <span>Suivi de dossier en direct</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-teal-700 shrink-0" />
                  <span>10 Départements d'Haïti</span>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Platform Preview (Common App Haiti) */}
            <div className="lg:col-span-5 relative">
              <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200/90 space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-400 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block" />
                    <span className="text-xs font-mono font-semibold text-slate-400 ml-2">lekolweb.com/admissions</span>
                  </div>
                </div>

                {/* Simulated School Profile Card */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
                  <div className="flex items-start gap-3">
                    <img
                      src="/LekòlWeb.png"
                      alt="Logo Lycée Jean Jacques Dessalines"
                      className="w-12 h-12 rounded-xl object-contain bg-white p-1 border border-slate-200 shadow-xs"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-sm font-bold text-slate-900 truncate">Lycée Jean Jacques Dessalines</h4>
                        <span className="w-4 h-4 rounded-full bg-teal-600 text-white flex items-center justify-center text-[9px] font-bold">✓</span>
                      </div>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-teal-600" />
                        <span>Port-au-Prince, Ouest • Établissement public</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      ● Nouvelle inscription ouverte
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-teal-50 text-teal-800 border border-teal-200">
                      ● Réinscription ouverte
                    </span>
                  </div>
                </div>

                {/* Simulated Parent Common App Application Tracking */}
                <div className="bg-teal-900 text-white rounded-2xl p-4.5 space-y-3.5 shadow-md border border-teal-800/60">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-teal-200/90 font-medium">Dossier de candidature</span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-teal-200 text-teal-950 font-mono tracking-wide shadow-xs">
                      LKW-2026-4821A
                    </span>
                  </div>

                  <div className="space-y-0.5">
                    <p className="text-sm sm:text-base font-bold text-white tracking-tight">Marcelin Vincent</p>
                    <div className="flex items-center gap-2 text-xs text-teal-200">
                      <span>Classe demandée :</span>
                      <span className="font-bold text-white bg-teal-800/80 px-2 py-0.5 rounded-md border border-teal-700/60">Philo</span>
                    </div>
                  </div>

                  {/* Progress Pipeline & Stage Breakdown */}
                  <div className="pt-2 border-t border-teal-800/60 space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-teal-300 font-medium">Statut de la demande</span>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-400/20 text-teal-200 border border-teal-400/40">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-300 animate-pulse" />
                        Application en attente
                      </span>
                    </div>

                    {/* Progress Bar (Partially filled ~55% in teal gradient, remaining in light gray track) */}
                    <div className="w-full bg-slate-200/20 rounded-full h-2.5 overflow-hidden p-0.5 relative">
                      <div
                        className="bg-gradient-to-r from-emerald-400 via-teal-400 to-teal-300 h-full rounded-full transition-all duration-500 shadow-xs"
                        style={{ width: '55%' }}
                      />
                    </div>

                    {/* 3 Clear Application Stages */}
                    <div className="grid grid-cols-3 gap-1 pt-0.5 text-[10px] sm:text-[11px] leading-tight">
                      {/* Stage 1: Demande soumise (Completed with green/teal checkmark) */}
                      <div className="flex items-center gap-1 text-emerald-300 font-semibold">
                        <span className="w-3.5 h-3.5 rounded-full bg-emerald-400/20 text-emerald-300 flex items-center justify-center shrink-0 text-[9px] font-bold border border-emerald-400/40">
                          ✓
                        </span>
                        <span className="truncate">Demande soumise</span>
                      </div>

                      {/* Stage 2: Application en attente (Current stage highlighted in teal) */}
                      <div className="flex items-center justify-center gap-1 text-teal-200 font-extrabold text-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-300 animate-pulse shrink-0" />
                        <span className="text-white drop-shadow-xs">Application en attente</span>
                      </div>

                      {/* Stage 3: Décision finale (Upcoming stage in gray) */}
                      <div className="flex items-center justify-end gap-1 text-slate-400/80 font-medium text-right">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-500 shrink-0" />
                        <span className="truncate">Décision finale</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-center pt-1">
                  <button
                    onClick={() => onNavigate('discovery')}
                    className="text-xs text-teal-700 font-bold hover:underline inline-flex items-center gap-1"
                  >
                    <span>Explorer le répertoire complet des écoles</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 2. SCHOOL DISCOVERY & SEARCH SECTION */}
      {/* ============================================================ */}
      <section id="decouvrir-lekolweb" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left space-y-8">
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-6">
          <div className="max-w-3xl space-y-2">
            <span className="text-teal-700 font-bold text-xs uppercase tracking-widest bg-teal-50 px-3.5 py-1 rounded-full border border-teal-200/80">
              Recherche & Découverte
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Trouvez l'établissement idéal pour votre enfant
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Filtrez par nom d'école, commune, département et niveau d'enseignement parmi les écoles enregistrées en Haïti.
            </p>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Name input */}
            <div className="lg:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Nom de l'école</label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchName}
                  onChange={e => setSearchName(e.target.value)}
                  placeholder="Ex: Saint-Louis, Frère André..."
                  className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-700 bg-white"
                />
              </div>
            </div>

            {/* Department */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Département</label>
              <select
                value={selectedDepartment}
                onChange={e => {
                  setSelectedDepartment(e.target.value);
                  setSelectedCommune('');
                }}
                className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-700 bg-white"
              >
                <option value="">Tous les départements</option>
                {HAITIAN_DEPARTMENTS.map(d => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Commune */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Commune</label>
              <select
                value={selectedCommune}
                onChange={e => setSelectedCommune(e.target.value)}
                disabled={!selectedDepartment}
                className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-700 bg-white disabled:bg-slate-50 disabled:text-slate-400"
              >
                <option value="">Toutes les communes</option>
                {availableCommunes.map(c => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Search CTA */}
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-teal-700 hover:bg-teal-800 text-white font-bold text-sm rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
              >
                <Search className="w-4 h-4 text-teal-200" />
                <span>Rechercher</span>
              </button>
            </div>
          </form>

          {/* Quick Level Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-500 mr-1">Filtrer par niveau :</span>
            {SCHOOL_LEVELS.slice(0, 4).map(lvl => (
              <button
                key={lvl}
                onClick={() =>
                  onNavigate('discovery', {
                    level: lvl,
                  })
                }
                className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 hover:border-teal-300 hover:bg-teal-50 hover:text-teal-800 text-slate-600 transition-all font-medium"
              >
                {lvl.split('(')[0].trim()}
              </button>
            ))}
          </div>
        </div>

        {/* Featured Schools Cards Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-900">Établissements récents sur LekòlWeb</h3>
            <button
              onClick={() => onNavigate('discovery')}
              className="text-sm font-bold text-teal-700 hover:text-teal-900 inline-flex items-center gap-1"
            >
              <span>Voir tout l'annuaire ({schools.length})</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {schools.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {schools.slice(0, 6).map(school => (
                <div
                  key={school.id}
                  className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-lg hover:border-teal-300 transition-all duration-300 flex flex-col justify-between group"
                >
                  {/* Cover Image & Badges */}
                  <div className="relative h-44 overflow-hidden bg-slate-900">
                    <img
                      src={school.coverImageUrl || 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80'}
                      alt={school.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20" />

                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-white/95 text-slate-900 shadow-sm backdrop-blur-xs">
                        {school.schoolType === 'congregational' ? 'Congréganiste' : school.schoolType === 'public' ? 'Public' : 'Privé'}
                      </span>
                    </div>

                    <div className="absolute top-3 right-3">
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-teal-700 text-white">
                        {school.department}
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-3 flex items-center gap-2">
                      <div className="w-10 h-10 rounded-xl bg-white p-1 border border-white/50 shadow-sm overflow-hidden">
                        <img src={school.logoUrl || '/LekòlWeb.png'} alt={school.name} className="w-full h-full object-contain" />
                      </div>
                      <span className="text-white text-xs font-semibold drop-shadow-sm">{school.commune}</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <h4
                        onClick={() => onSelectSchool(school.slug)}
                        className="text-base font-bold text-slate-900 group-hover:text-teal-700 transition-colors cursor-pointer line-clamp-1"
                      >
                        {school.name}
                      </h4>
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {school.description}
                      </p>
                    </div>

                    {/* Admissions Status Pills */}
                    <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-1.5 text-[11px]">
                      {school.newEnrollmentOpen && (
                        <span className="px-2 py-0.5 rounded-md font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          ● Nouvelle inscription
                        </span>
                      )}
                      {school.reEnrollmentOpen && (
                        <span className="px-2 py-0.5 rounded-md font-semibold bg-teal-50 text-teal-800 border border-teal-200">
                          ● Réinscription
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="pt-2 flex items-center gap-2">
                      <button
                        onClick={() => onSelectSchool(school.slug)}
                        className="flex-1 py-2 px-3 bg-slate-100 hover:bg-teal-50 hover:text-teal-800 text-slate-800 text-xs font-bold rounded-xl transition-colors text-center"
                      >
                        Voir le profil
                      </button>
                      {school.newEnrollmentOpen && (
                        <button
                          onClick={() => onOpenApplication(school, 'new_enrollment')}
                          className="flex-1 py-2 px-3 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors text-center"
                        >
                          S'inscrire
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-10 sm:p-14 border border-slate-200 text-center space-y-4 shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center mx-auto shadow-xs">
                <SchoolIcon className="w-7 h-7" />
              </div>
              <div className="space-y-1.5 max-w-md mx-auto">
                <h4 className="text-base sm:text-lg font-bold text-slate-900">
                  Aucun établissement disponible pour le moment.
                </h4>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                  Les établissements scolaires apparaîtront ici dès leur publication sur LekòlWeb.
                </p>
              </div>
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => onNavigate('discovery')}
                  className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors inline-flex items-center justify-center gap-1.5"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Voir tout l'annuaire</span>
                </button>
                <button
                  onClick={() => onNavigate('register_director')}
                  className="w-full sm:w-auto px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors inline-flex items-center justify-center gap-1.5"
                >
                  <span>Inscrire mon établissement</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ============================================================ */}
      {/* 3. RECENT ANNOUNCEMENTS SECTION */}
      {/* ============================================================ */}
      <section className="bg-slate-50 border-y border-slate-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left space-y-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-teal-700 font-bold text-xs uppercase tracking-widest bg-teal-50 px-3.5 py-1 rounded-full border border-teal-200/80">
                Avis Officiels & Rentrée
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Annonces récentes des établissements
              </h2>
            </div>
            <button
              onClick={() => onNavigate('announcements')}
              className="text-sm font-bold text-teal-700 hover:text-teal-900 inline-flex items-center gap-1"
            >
              <span>Toutes les annonces</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {announcements.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {announcements.slice(0, 4).map(ann => {
                const getCategoryBadge = (cat: string) => {
                  switch (cat) {
                    case 'new_enrollment':
                      return { label: 'Nouvelles Admissions', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
                    case 're_enrollment':
                      return { label: 'Réinscriptions', color: 'bg-teal-50 text-teal-800 border-teal-200' };
                    case 'examinations':
                      return { label: 'Examens & Résultats', color: 'bg-amber-50 text-amber-900 border-amber-200' };
                    case 'important_dates':
                      return { label: 'Dates Importantes', color: 'bg-indigo-50 text-indigo-800 border-indigo-200' };
                    default:
                      return { label: 'Information Générale', color: 'bg-slate-100 text-slate-700 border-slate-200' };
                  }
                };
                const catBadge = getCategoryBadge(ann.category);

                return (
                  <div
                    key={ann.id}
                    className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs hover:shadow-md hover:border-teal-300 transition-all space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold border ${catBadge.color}`}>
                        {catBadge.label}
                      </span>
                      <span className="text-xs text-slate-400">
                        {new Date(ann.publishedAt || ann.createdAt).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-teal-700">{ann.schoolName}</p>
                      <h4 className="text-base font-bold text-slate-900 mt-0.5">{ann.title}</h4>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                      {ann.content}
                    </p>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-400">{ann.schoolCommune}</span>
                      <button
                        onClick={() => onNavigate('announcements', { selectedId: ann.id })}
                        className="text-teal-700 font-bold hover:underline inline-flex items-center gap-1"
                      >
                        <span>Lire l'annonce</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center space-y-2">
              <Bell className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-700">Aucune annonce publiée pour le moment</p>
              <p className="text-xs text-slate-500">Les dates de concours, résultats d'admissions et avis des écoles s'afficheront ici.</p>
            </div>
          )}
        </div>
      </section>

      {/* ============================================================ */}
      {/* 4. HOW IT WORKS (Common App Process) */}
      {/* ============================================================ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-teal-700 font-bold text-xs uppercase tracking-widest bg-teal-50 px-3.5 py-1 rounded-full border border-teal-200/80">
            Processus Simple & Sécurisé
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Comment fonctionne LekòlWeb pour les familles ?
          </h2>
          <p className="text-base text-slate-600">
            Un parcours transparent et guidé pour inscrire vos enfants dans les meilleures écoles sans tracasseries.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[
            {
              step: '01',
              title: 'Trouver une école',
              desc: 'Recherchez par nom, commune ou département parmi les écoles de tout le pays.',
              icon: Search,
            },
            {
              step: '02',
              title: 'Explorer le profil',
              desc: 'Consultez les informations, tarifs, dates limites et exigences d\'admission.',
              icon: Building,
            },
            {
              step: '03',
              title: 'Créer un compte',
              desc: 'Enregistrez-vous une seule fois et ajoutez le profil de vos enfants.',
              icon: Users,
            },
            {
              step: '04',
              title: 'Remplir le formulaire',
              desc: 'Complétez la nouvelle inscription ou réinscription selon votre situation.',
              icon: FileText,
            },
            {
              step: '05',
              title: 'Suivre le dossier',
              desc: 'Recevez un numéro officiel et suivez l\'avis de la direction en temps réel.',
              icon: CheckCircle2,
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:border-teal-300 hover:shadow-md transition-all space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between pb-2">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center font-bold">
                      <Icon className="w-5 h-5 text-teal-700" />
                    </div>
                    <span className="text-xl font-black text-slate-200">{item.step}</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 mt-2">{item.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed mt-1">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ============================================================ */}
      {/* 5. FOR SCHOOLS (Director Value Proposition) */}
      {/* ============================================================ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-teal-900 via-teal-950 to-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-xl border border-teal-800/40 text-left grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-teal-800/60 text-teal-200 border border-teal-400/30">
              <GraduationCap className="w-4 h-4 text-teal-300" />
              <span>Espace Dédié aux Directions Scolaires</span>
            </span>

            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
              Directeurs d'école : centralisez vos admissions et gagnez un temps précieux.
            </h3>

            <p className="text-teal-100 text-sm sm:text-base leading-relaxed max-w-2xl">
              Gérez un ou plusieurs établissements scolaires depuis un seul compte. Personnalisez vos formulaires de nouvelle inscription et de réinscription, publiez vos annonces officielles et traitez les dossiers avec votre équipe.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-teal-100">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-300 shrink-0" />
                <span>Formulaires personnalisables (Form Builder)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-300 shrink-0" />
                <span>Gestion multi-écoles sans déconnexion</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-300 shrink-0" />
                <span>Attribution de droits et permissions au personnel</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-300 shrink-0" />
                <span>Exportation Excel/CSV des listes d'élèves</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col items-center lg:items-end justify-center">
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10 space-y-4 w-full max-w-sm text-center">
              <h4 className="font-bold text-base text-white">Inscrivez votre établissement</h4>
              <p className="text-xs text-teal-100">
                L'inscription est rapide et sans engagement. Publiez votre profil en quelques minutes.
              </p>
              <button
                onClick={() => onNavigate('register_director')}
                className="w-full py-3.5 px-6 bg-teal-300 hover:bg-teal-200 text-slate-950 font-extrabold text-sm rounded-xl shadow-lg transition-all active:scale-95"
              >
                Inscrire mon école
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 6. FAQ SECTION */}
      {/* ============================================================ */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-left space-y-6">
        <div className="text-center space-y-2">
          <span className="text-teal-700 font-bold text-xs uppercase tracking-widest bg-teal-50 px-3.5 py-1 rounded-full border border-teal-200/80">
            Foire Aux Questions
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Questions fréquentes
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:border-teal-300 transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full py-4.5 px-6 text-left flex items-center justify-between gap-4 font-bold text-slate-900 hover:text-teal-700 transition-colors"
                >
                  <span className="text-sm sm:text-base">{faq.question}</span>
                  <span className={`text-slate-400 font-bold text-lg transition-transform ${isOpen ? 'rotate-45' : ''}`}>
                    +
                  </span>
                </button>
                {isOpen && (
                  <div className="px-6 pb-5 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
