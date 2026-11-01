import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  FileText,
  Lock,
  Shield,
  Sparkles,
  X,
} from 'lucide-react';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { ApplicationModal } from './components/admissions/ApplicationModal';
import { AnnouncementsPage } from './components/announcements/AnnouncementsPage';
import { AuthPages } from './components/auth/AuthPages';
import { DirectorDashboard } from './components/director/DirectorDashboard';
import { SchoolDirectoryPage } from './components/discovery/SchoolDirectoryPage';
import { HomePage } from './components/home/HomePage';
import { Footer } from './components/layout/Footer';
import { Navbar } from './components/layout/Navbar';
import { ForSchoolsPage } from './components/marketing/ForSchoolsPage';
import { HowItWorksPage } from './components/marketing/HowItWorksPage';
import { ParentDashboard } from './components/parent/ParentDashboard';
import { SchoolPublicProfile } from './components/school/SchoolPublicProfile';
import { AuthProvider, useAuth } from './context/AuthContext';
import { schoolService } from './services/schoolService';
import { Application, FormType, School } from './types';

type ActiveView =
  | 'home'
  | 'discovery'
  | 'announcements'
  | 'how_it_works'
  | 'for_schools'
  | 'school_profile'
  | 'parent_dashboard'
  | 'director_dashboard'
  | 'admin'
  | 'login'
  | 'register'
  | 'terms'
  | 'privacy';

function MainApp() {
  const { currentUser, userProfile, isAdmin, isDirector, isParent } = useAuth();

  const [currentView, setCurrentView] = useState<ActiveView>('home');
  const [authInitialRole, setAuthInitialRole] = useState<'parent' | 'principal'>('parent');
  const [selectedSchoolSlug, setSelectedSchoolSlug] = useState<string>('');
  const [selectedAnnouncementId, setSelectedAnnouncementId] = useState<string | undefined>(undefined);

  // Search parameters for discovery
  const [discoverySearchParams, setDiscoverySearchParams] = useState<{
    searchQuery?: string;
    department?: string;
    commune?: string;
    level?: string;
  } | undefined>(undefined);

  // Application Modal state
  const [applicationModal, setApplicationModal] = useState<{
    isOpen: boolean;
    school: School | null;
    formType: FormType;
  }>({
    isOpen: false,
    school: null,
    formType: 'new_enrollment',
  });

  // Success Notification banner
  const [notification, setNotification] = useState<{
    type: 'success' | 'info';
    message: string;
    actionLabel?: string;
    actionView?: ActiveView;
  } | null>(null);

  useEffect(() => {
    // Purge any residual demo schools and announcements from Firestore
    schoolService.cleanupDemoData();
  }, []);

  const handleOpenApplicationModal = (school: School, formType: FormType = 'new_enrollment') => {
    setApplicationModal({
      isOpen: true,
      school,
      formType,
    });
  };

  const handleApplicationSuccess = (application: Application) => {
    setApplicationModal({ isOpen: false, school: null, formType: 'new_enrollment' });
    setNotification({
      type: 'success',
      message: `Votre demande a été enregistrée avec succès sous la référence officielle ${application.referenceNumber}.`,
      actionLabel: 'Suivre ma demande',
      actionView: 'parent_dashboard',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewSchoolProfile = (slug: string) => {
    setSelectedSchoolSlug(slug);
    setCurrentView('school_profile');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigate = (view: string, params?: any) => {
    if (view === 'discovery') {
      if (params) {
        setDiscoverySearchParams(params);
      }
      setCurrentView('discovery');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (view === 'announcements') {
      if (params?.announcementId) {
        setSelectedAnnouncementId(params.announcementId);
      }
      setCurrentView('announcements');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (view === 'school_profile' && params?.slug) {
      handleViewSchoolProfile(params.slug);
      return;
    }

    if (view === 'register_director') {
      setAuthInitialRole('principal');
      setCurrentView('register');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (view === 'register_parent') {
      setAuthInitialRole('parent');
      setCurrentView('register');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (view === 'apply' && params?.school) {
      handleOpenApplicationModal(params.school, params.formType || 'new_enrollment');
      return;
    }

    setCurrentView(view as ActiveView);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAuthSuccess = () => {
    // Intelligently route user to corresponding dashboard
    if (isAdmin) {
      setCurrentView('admin');
    } else if (isDirector || authInitialRole === 'principal') {
      setCurrentView('director_dashboard');
    } else {
      setCurrentView('parent_dashboard');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col text-slate-800 antialiased selection:bg-teal-700 selection:text-white">
      {/* Toast Notification */}
      {notification && (
        <div className="sticky top-20 z-40 bg-teal-800 text-white px-4 py-3 shadow-lg border-b border-teal-700">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-teal-300 shrink-0" />
              <span>{notification.message}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {notification.actionLabel && notification.actionView && (
                <button
                  onClick={() => {
                    setCurrentView(notification.actionView!);
                    setNotification(null);
                  }}
                  className="px-3 py-1 bg-white text-teal-900 font-bold rounded-lg text-xs hover:bg-teal-50 transition-colors shadow-xs"
                >
                  {notification.actionLabel}
                </button>
              )}
              <button
                onClick={() => setNotification(null)}
                className="p-1 hover:bg-teal-700 rounded-md transition-colors"
                aria-label="Fermer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Navbar */}
      <Navbar currentView={currentView} onNavigate={handleNavigate} />

      {/* Main Content Router */}
      <main className="flex-1">
        {currentView === 'home' && (
          <HomePage
            onNavigate={handleNavigate}
            onSelectSchool={handleViewSchoolProfile}
            onOpenApplication={handleOpenApplicationModal}
          />
        )}

        {currentView === 'discovery' && (
          <SchoolDirectoryPage
            initialSearch={discoverySearchParams}
            onSelectSchool={handleViewSchoolProfile}
            onOpenApplication={handleOpenApplicationModal}
          />
        )}

        {currentView === 'announcements' && (
          <AnnouncementsPage
            initialSelectedId={selectedAnnouncementId}
            onSelectSchool={handleViewSchoolProfile}
          />
        )}

        {currentView === 'how_it_works' && (
          <HowItWorksPage
            onFindSchools={() => handleNavigate('discovery')}
            onRegisterSchool={() => handleNavigate('register_director')}
            onRegisterParent={() => handleNavigate('register_parent')}
          />
        )}

        {currentView === 'for_schools' && (
          <ForSchoolsPage
            onRegisterSchool={() => handleNavigate('register_director')}
            onExploreDirectory={() => handleNavigate('discovery')}
          />
        )}

        {currentView === 'school_profile' && (
          <SchoolPublicProfile
            slug={selectedSchoolSlug}
            onBack={() => handleNavigate('discovery')}
            onOpenApplication={handleOpenApplicationModal}
          />
        )}

        {currentView === 'parent_dashboard' && (
          <ParentDashboard
            onNavigateToDiscovery={() => handleNavigate('discovery')}
            onOpenSchoolProfile={handleViewSchoolProfile}
            onNavigateToAuth={(mode) => {
              setAuthInitialRole('parent');
              setCurrentView(mode);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentView === 'director_dashboard' && (
          <DirectorDashboard
            onViewSchoolProfile={handleViewSchoolProfile}
            onNavigateToAuth={(mode, role) => {
              setAuthInitialRole(role || 'principal');
              setCurrentView(mode);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentView === 'admin' && (
          <AdminDashboard onViewSchool={handleViewSchoolProfile} />
        )}

        {(currentView === 'login' || currentView === 'register') && (
          <AuthPages
            initialMode={currentView === 'login' ? 'login' : 'register'}
            initialRole={authInitialRole}
            onSuccess={handleAuthSuccess}
            onNavigateHome={() => setCurrentView('home')}
          />
        )}

        {currentView === 'terms' && (
          <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8 text-left space-y-6">
            <h1 className="text-3xl font-black text-[#1E293B]">Conditions Générales d'Utilisation</h1>
            <p className="text-sm text-slate-500">Dernière mise à jour : 30 octobre 2026</p>
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4 text-sm text-slate-600 leading-relaxed">
              <h2 className="text-base font-bold text-slate-900">1. Objet de la plateforme LekòlWeb</h2>
              <p>
                LekòlWeb est un service numérique d'intérêt public facilitant la découverte des établissements scolaires en Haïti et la soumission dématérialisée de dossiers d'inscription et de réinscription scolaire, inspiré du modèle Common App.
              </p>
              <h2 className="text-base font-bold text-slate-900">2. Responsabilité des directions d'école</h2>
              <p>
                Les directions d'écoles reconnues sont responsables de la véracité des informations académiques, des dates de concours, des frais de scolarité et de l'examen impartial des candidatures transmises via la plateforme.
              </p>
              <h2 className="text-base font-bold text-slate-900">3. Engagements des familles et tuteurs</h2>
              <p>
                Les parents certifient l'authenticité des actes d'état civil, bulletins scolaires et justificatifs téléversés lors de la soumission de toute candidature. Tout dossier frauduleux pourra faire l'objet d'un rejet immédiat.
              </p>
            </div>
            <button
              onClick={() => setCurrentView('home')}
              className="px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl text-xs transition-all"
            >
              Retour à l'accueil
            </button>
          </div>
        )}

        {currentView === 'privacy' && (
          <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8 text-left space-y-6">
            <h1 className="text-3xl font-black text-[#1E293B]">Politique de Confidentialité et Protection des Données</h1>
            <p className="text-sm text-slate-500">Dernière mise à jour : 30 octobre 2026</p>
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4 text-sm text-slate-600 leading-relaxed">
              <h2 className="text-base font-bold text-slate-900">1. Protection de l'identité des mineurs</h2>
              <p>
                Les informations relatives aux enfants (noms, date de naissance, bulletins, santé) sont strictement réservées à la famille dépositaire et à l'établissement scolaire récepteur dûment authentifié.
              </p>
              <h2 className="text-base font-bold text-slate-900">2. Sécurité et chiffrement</h2>
              <p>
                Toutes les transmissions et documents sont protégés par chiffrement SSL de bout en bout et hébergés selon les règles de sécurité Cloud Firestore les plus strictes.
              </p>
              <h2 className="text-base font-bold text-slate-900">3. Non-commercialisation des données</h2>
              <p>
                LekòlWeb s'engage formellement à ne jamais revendre, louer ou divulguer les coordonnées des familles ou des élèves à des fins publicitaires ou tierces.
              </p>
            </div>
            <button
              onClick={() => setCurrentView('home')}
              className="px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl text-xs transition-all"
            >
              Retour à l'accueil
            </button>
          </div>
        )}
      </main>

      {/* Global Footer */}
      <Footer onNavigate={handleNavigate} />

      {/* Application Modal (Common App Submission Dialog) */}
      {applicationModal.isOpen && applicationModal.school && (
        <ApplicationModal
          school={applicationModal.school}
          formType={applicationModal.formType}
          onClose={() => setApplicationModal({ isOpen: false, school: null, formType: 'new_enrollment' })}
          onSuccess={handleApplicationSuccess}
          onNavigateToAuth={() => {
            setApplicationModal({ isOpen: false, school: null, formType: 'new_enrollment' });
            setAuthInitialRole('parent');
            setCurrentView('login');
          }}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
