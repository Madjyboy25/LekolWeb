import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Edit2,
  FileCheck,
  FileText,
  GraduationCap,
  Info,
  MapPin,
  MessageCircle,
  Plus,
  Search,
  Trash2,
  User,
  Users,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { SCHOOL_LEVELS } from '../../lib/constants';
import { schoolService } from '../../services/schoolService';
import { Application, ApplicationStatus, ChildProfile } from '../../types';

interface ParentDashboardProps {
  initialTab?: 'applications' | 'children' | 'search';
  onNavigateToDiscovery: () => void;
  onOpenSchoolProfile: (slug: string) => void;
  onNavigateToAuth?: (mode: 'login' | 'register') => void;
}

export function ParentDashboard({
  initialTab = 'applications',
  onNavigateToDiscovery,
  onOpenSchoolProfile,
  onNavigateToAuth,
}: ParentDashboardProps) {
  const { currentUser, userProfile } = useAuth();

  const [activeTab, setActiveTab] = useState<'applications' | 'children'>(
    initialTab === 'children' ? 'children' : 'applications'
  );

  const [applications, setApplications] = useState<Application[]>([]);
  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // Application details modal state
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  // Child Profile modal states
  const [showChildModal, setShowChildModal] = useState(false);
  const [editingChild, setEditingChild] = useState<ChildProfile | null>(null);
  const [childFirstName, setChildFirstName] = useState('');
  const [childLastName, setChildLastName] = useState('');
  const [childDob, setChildDob] = useState('');
  const [childGender, setChildGender] = useState<'M' | 'F' | 'Other'>('M');
  const [childCurrentGrade, setChildCurrentGrade] = useState('');
  const [childPreviousSchool, setChildPreviousSchool] = useState('');
  const [childNotes, setChildNotes] = useState('');
  const [childGuardianName, setChildGuardianName] = useState(userProfile?.displayName || '');
  const [childGuardianPhone, setChildGuardianPhone] = useState(userProfile?.phoneNumber || '+509 ');
  const [childGuardianEmail, setChildGuardianEmail] = useState(currentUser?.email || '');
  const [childGuardianAddress, setChildGuardianAddress] = useState('');
  const [childSaving, setChildSaving] = useState(false);
  const [childError, setChildError] = useState('');

  useEffect(() => {
    if (currentUser) {
      loadParentData();
    }
  }, [currentUser]);

  const loadParentData = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const [apps, kids] = await Promise.all([
        schoolService.getApplicationsForParent(currentUser.uid),
        schoolService.getChildrenForParent(currentUser.uid),
      ]);
      setApplications(apps);
      setChildren(kids);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddChild = () => {
    setEditingChild(null);
    setChildFirstName('');
    setChildLastName('');
    setChildDob('');
    setChildGender('M');
    setChildCurrentGrade('');
    setChildPreviousSchool('');
    setChildNotes('');
    setChildGuardianName(userProfile?.displayName || '');
    setChildGuardianPhone(userProfile?.phoneNumber || '+509 ');
    setChildGuardianEmail(currentUser?.email || '');
    setChildGuardianAddress('');
    setChildError('');
    setShowChildModal(true);
  };

  const handleOpenEditChild = (child: ChildProfile) => {
    setEditingChild(child);
    setChildFirstName(child.firstName);
    setChildLastName(child.lastName);
    setChildDob(child.dateOfBirth);
    setChildGender(child.gender);
    setChildCurrentGrade(child.currentGrade || '');
    setChildPreviousSchool(child.previousSchool || '');
    setChildNotes(child.medicalOrSpecialNotes || '');
    setChildGuardianName(child.guardianName || '');
    setChildGuardianPhone(child.guardianPhone || '');
    setChildGuardianEmail(child.guardianEmail || '');
    setChildGuardianAddress(child.guardianAddress || '');
    setChildError('');
    setShowChildModal(true);
  };

  const handleSaveChild = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!childFirstName.trim() || !childLastName.trim()) {
      setChildError('Le nom et le prénom de l\'enfant sont obligatoires.');
      return;
    }
    if (!childGuardianPhone.trim() || childGuardianPhone.trim() === '+509') {
      setChildError('Veuillez renseigner un numéro de téléphone de contact.');
      return;
    }

    setChildSaving(true);
    try {
      const saved = await schoolService.saveChildProfile(
        currentUser.uid,
        {
          firstName: childFirstName.trim(),
          lastName: childLastName.trim(),
          dateOfBirth: childDob,
          gender: childGender,
          currentGrade: childCurrentGrade,
          previousSchool: childPreviousSchool.trim(),
          medicalOrSpecialNotes: childNotes.trim(),
          guardianName: childGuardianName.trim() || userProfile?.displayName || 'Parent',
          guardianRelationship: 'Parent / Tuteur légal',
          guardianPhone: childGuardianPhone.trim(),
          guardianEmail: childGuardianEmail.trim(),
          guardianAddress: childGuardianAddress.trim(),
        },
        editingChild?.id
      );

      if (editingChild) {
        setChildren(prev => prev.map(c => (c.id === saved.id ? saved : c)));
      } else {
        setChildren(prev => [saved, ...prev]);
      }
      setShowChildModal(false);
    } catch (err: any) {
      setChildError(err.message || 'Erreur lors de l\'enregistrement.');
    } finally {
      setChildSaving(false);
    }
  };

  const handleDeleteChild = async (childId: string) => {
    await schoolService.deleteChildProfile(childId);
    setChildren(prev => prev.filter(c => c.id !== childId));
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
      case 'withdrawn':
        return { label: 'Retirée', color: 'bg-slate-200 text-slate-600 border-slate-300' };
      default:
        return { label: 'Transmise', color: 'bg-teal-50 text-teal-800 border-teal-200' };
    }
  };

  if (!currentUser) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center mx-auto shadow-xs">
          <User className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-900">Espace Famille & Candidat</h2>
          <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
            Pour inscrire vos enfants et suivre l'état de traitement de vos demandes d'admission en temps réel, veuillez vous connecter à votre compte parent.
          </p>
        </div>
        <div className="p-4 bg-teal-50/70 rounded-2xl border border-teal-200 text-xs text-teal-900 max-w-md mx-auto space-y-2 text-left">
          <p className="font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal-700 shrink-0" />
            Dossier Unique et Suivi Centralisé
          </p>
          <p className="text-slate-600">
            Créez le profil de vos enfants une seule fois et postulez facilement auprès de toutes les écoles partenaires de votre choix.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          {onNavigateToAuth ? (
            <>
              <button
                onClick={() => onNavigateToAuth('login')}
                className="w-full sm:w-auto px-6 py-3 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all"
              >
                Se connecter
              </button>
              <button
                onClick={() => onNavigateToAuth('register')}
                className="w-full sm:w-auto px-6 py-3 bg-white hover:bg-slate-50 text-teal-900 border border-slate-300 font-bold text-xs rounded-xl transition-all"
              >
                Créer un compte Parent
              </button>
            </>
          ) : (
            <p className="text-xs text-slate-500">Veuillez vous connecter via le menu supérieur.</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-left space-y-8">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200">
              Espace Famille & Candidat
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Bonjour, {userProfile?.displayName || 'Parent'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
            Gérez vos enfants et suivez l'ensemble de vos demandes d'inscription scolaire dans les écoles d'Haïti depuis ce tableau de bord unique.
          </p>
        </div>

        <button
          onClick={onNavigateToDiscovery}
          className="px-5 py-3 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-colors flex items-center gap-2 shrink-0"
        >
          <Search className="w-4 h-4 text-teal-200" />
          <span>Trouver une nouvelle école</span>
        </button>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-semibold text-slate-400">Total Demandes</span>
          <p className="text-2xl font-black text-slate-900">{applications.length}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-semibold text-blue-600">En cours d'examen</span>
          <p className="text-2xl font-black text-slate-900">
            {applications.filter(a => a.status === 'under_review' || a.status === 'submitted').length}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-semibold text-emerald-600">Acceptées</span>
          <p className="text-2xl font-black text-emerald-800">
            {applications.filter(a => a.status === 'accepted').length}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-semibold text-teal-700">Enfants enregistrés</span>
          <p className="text-2xl font-black text-slate-900">{children.length}</p>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('applications')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'applications'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Mes Demandes d'inscription ({applications.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('children')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'children'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Mes Enfants ({children.length})</span>
        </button>
      </div>

      {/* TAB 1: APPLICATIONS */}
      {activeTab === 'applications' && (
        <div className="space-y-4">
          {loading ? (
            <div className="py-20 text-center space-y-2">
              <div className="w-7 h-7 border-3 border-teal-700 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-400">Chargement de vos demandes...</p>
            </div>
          ) : applications.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {applications.map(app => {
                const badge = getStatusBadge(app.status);
                return (
                  <div
                    key={app.id}
                    className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-xs hover:border-teal-300 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold border ${badge.color}`}>
                          {badge.label}
                        </span>
                        <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-md">
                          {app.referenceNumber}
                        </span>
                        <span className="text-[10px] font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-md">
                          Année {app.academicYearName || '2026–2027'}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-400">
                          {app.formType === 'new_enrollment' ? 'Nouvelle Inscription' : 'Confirmation Réinscription'}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-base font-bold text-slate-900">
                          {app.studentName}
                        </h3>
                        <p className="text-xs text-teal-800 font-semibold mt-0.5">
                          {app.schoolName} {app.schoolCommune ? `(${app.schoolCommune})` : ''}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                        <span>Classe : <strong className="text-slate-800">{app.requestedLevel}</strong></span>
                        <span>
                          Transmis le :{' '}
                          {new Date(app.submittedAt).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                        {app.statusNote && (
                          <span className="text-amber-800 font-medium bg-amber-50 px-2 py-0.5 rounded">
                            Note de l'école : {app.statusNote}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                      <button
                        onClick={() => setSelectedApp(app)}
                        className="flex-1 sm:flex-initial px-4 py-2 bg-slate-100 hover:bg-teal-50 hover:text-teal-800 text-slate-800 text-xs font-bold rounded-xl transition-colors text-center"
                      >
                        Voir les détails
                      </button>
                      {app.schoolSlug && (
                        <button
                          onClick={() => onOpenSchoolProfile(app.schoolSlug!)}
                          className="px-3 py-2 text-slate-400 hover:text-slate-700 text-xs font-semibold rounded-xl"
                          title="Voir le profil de l'école"
                        >
                          École
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
              <FileCheck className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">Aucune demande d'inscription pour le moment</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Explorez l'annuaire des écoles en Haïti et soumettez votre premier dossier en quelques clics.
              </p>
              <button
                onClick={onNavigateToDiscovery}
                className="px-5 py-2.5 bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs mt-2"
              >
                Découvrir les écoles
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CHILDREN PROFILES */}
      {activeTab === 'children' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Profils de vos enfants</h3>
              <p className="text-xs text-slate-500">
                Ces profils permettent de pré-remplir instantanément vos formulaires d'admissions pour n'importe quelle école.
              </p>
            </div>
            <button
              onClick={handleOpenAddChild}
              className="px-4 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Ajouter un enfant</span>
            </button>
          </div>

          {children.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {children.map(child => (
                <div
                  key={child.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-sm">
                        {child.firstName.charAt(0)}
                      </div>
                      <span className="text-[11px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                        {child.gender === 'F' ? 'Fille' : 'Garçon'}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-base font-bold text-slate-900">
                        {child.firstName} {child.lastName}
                      </h4>
                      {child.dateOfBirth && (
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>Né(e) le {child.dateOfBirth}</span>
                        </p>
                      )}
                    </div>

                    <div className="text-xs text-slate-600 space-y-1 pt-1 border-t border-slate-100">
                      {child.currentGrade && (
                        <p>
                          <span className="font-semibold text-slate-700">Classe :</span> {child.currentGrade}
                        </p>
                      )}
                      {child.previousSchool && (
                        <p className="truncate">
                          <span className="font-semibold text-slate-700">École :</span> {child.previousSchool}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => handleOpenEditChild(child)}
                      className="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Modifier</span>
                    </button>
                    <button
                      onClick={() => handleDeleteChild(child.id)}
                      className="text-slate-400 hover:text-red-600 p-1 rounded-md"
                      title="Supprimer le profil"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 space-y-3">
              <Users className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-sm font-bold text-slate-800">Aucun enfant enregistré</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Ajoutez le profil de votre enfant pour postuler facilement à toutes les écoles participantes.
              </p>
              <button
                onClick={handleOpenAddChild}
                className="px-4 py-2 bg-teal-700 text-white text-xs font-bold rounded-xl shadow-xs"
              >
                Ajouter mon enfant
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modal: View Application Details */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 border border-slate-200 shadow-2xl space-y-6 text-left relative animate-fade-in my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold border ${getStatusBadge(selectedApp.status).color}`}>
                    {getStatusBadge(selectedApp.status).label}
                  </span>
                  <span className="text-[10px] font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded-md">
                    Année académique : {selectedApp.academicYearName || '2026–2027'}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mt-1">Dossier {selectedApp.referenceNumber}</h3>
                <p className="text-xs text-teal-800 font-semibold">{selectedApp.schoolName}</p>
              </div>
              <button onClick={() => setSelectedApp(null)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status Note from School */}
            {selectedApp.statusNote && (
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-1 text-xs text-amber-950">
                <p className="font-bold flex items-center gap-1.5">
                  <MessageCircle className="w-4 h-4 text-amber-700" />
                  <span>Message de la direction de l'école :</span>
                </p>
                <p className="leading-relaxed">{selectedApp.statusNote}</p>
              </div>
            )}

            {/* Student & Guardian Info Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
              <div>
                <p className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Élève candidat</p>
                <p className="font-bold text-slate-900 text-sm mt-0.5">{selectedApp.studentName}</p>
                {selectedApp.studentDob && <p className="text-slate-500">Né(e) le : {selectedApp.studentDob}</p>}
                <p className="text-slate-500">Classe sollicitée : <strong className="text-slate-700">{selectedApp.requestedLevel}</strong></p>
              </div>

              <div>
                <p className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Responsable légal</p>
                <p className="font-bold text-slate-900 text-sm mt-0.5">{selectedApp.guardianName}</p>
                <p className="text-slate-500">Tél : {selectedApp.guardianPhone}</p>
                {selectedApp.guardianEmail && <p className="text-slate-500">Email : {selectedApp.guardianEmail}</p>}
              </div>
            </div>

            {/* Answers Submitted */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Réponses fournies au formulaire de l'école
              </h4>
              <div className="space-y-2 text-xs">
                {Object.entries(selectedApp.answers || {}).map(([k, v]) => (
                  <div key={k} className="p-3 bg-white rounded-xl border border-slate-200 flex flex-col sm:flex-row justify-between gap-1">
                    <span className="font-semibold text-slate-500 capitalize">{k.replace(/_/g, ' ')}</span>
                    <span className="font-bold text-slate-900">{Array.isArray(v) ? v.join(', ') : String(v)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Status History Timeline */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Historique de traitement
              </h4>
              <div className="space-y-2">
                {(selectedApp.statusHistory || []).map((h, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-slate-800">
                        {h.note || `Statut : ${h.status}`}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {new Date(h.timestamp).toLocaleString('fr-FR')} • {h.updatedBy}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
              <button
                onClick={() => setSelectedApp(null)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add / Edit Child Profile */}
      {showChildModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-slate-200 shadow-2xl space-y-5 text-left relative animate-fade-in my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">
                {editingChild ? 'Modifier le profil de l\'enfant' : 'Ajouter un enfant'}
              </h3>
              <button onClick={() => setShowChildModal(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {childError && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{childError}</span>
              </div>
            )}

            <form onSubmit={handleSaveChild} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Prénom <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={childFirstName}
                    onChange={e => setChildFirstName(e.target.value)}
                    placeholder="Ex: Jean-Marc"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Nom de famille <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={childLastName}
                    onChange={e => setChildLastName(e.target.value)}
                    placeholder="Ex: Pierre"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Date de naissance</label>
                  <input
                    type="date"
                    value={childDob}
                    onChange={e => setChildDob(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Sexe</label>
                  <select
                    value={childGender}
                    onChange={e => setChildGender(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white"
                  >
                    <option value="M">Masculin</option>
                    <option value="F">Féminin</option>
                    <option value="Other">Autre</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Classe ou cycle actuel / sollicité</label>
                <select
                  value={childCurrentGrade}
                  onChange={e => setChildCurrentGrade(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white"
                >
                  <option value="">Sélectionnez un niveau</option>
                  {SCHOOL_LEVELS.map(l => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">École précédente (si applicable)</label>
                <input
                  type="text"
                  value={childPreviousSchool}
                  onChange={e => setChildPreviousSchool(e.target.value)}
                  placeholder="Ex: École Nationale République du Chili"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Téléphone de contact du responsable <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={childGuardianPhone}
                  onChange={e => setChildGuardianPhone(e.target.value)}
                  placeholder="+509 3700 0000"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Observations ou informations de santé (optionnel)</label>
                <textarea
                  rows={2}
                  value={childNotes}
                  onChange={e => setChildNotes(e.target.value)}
                  placeholder="Allergies, régime particulier, besoin pédagogique spécifique..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowChildModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-bold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={childSaving}
                  className="px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl disabled:opacity-50"
                >
                  {childSaving ? 'Enregistrement...' : 'Enregistrer le profil'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
