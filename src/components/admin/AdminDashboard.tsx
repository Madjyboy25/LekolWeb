import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle,
  Eye,
  Filter,
  Globe,
  Plus,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  Users,
} from 'lucide-react';
import { RESERVED_SLUGS } from '../../lib/constants';
import { schoolService } from '../../services/schoolService';
import { School, VerificationStatus } from '../../types';

interface AdminDashboardProps {
  onViewSchool: (slug: string) => void;
}

export function AdminDashboard({ onViewSchool }: AdminDashboardProps) {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'schools' | 'verifications' | 'plans' | 'slugs'>('schools');

  useEffect(() => {
    loadSchools();
  }, []);

  const loadSchools = async () => {
    setLoading(true);
    try {
      const list = await schoolService.getSchools();
      setSchools(list);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateVerification = async (schoolId: string, status: VerificationStatus) => {
    await schoolService.updateVerificationStatus(schoolId, status);
    setActionMessage(`Statut de vérification mis à jour (${status})`);
    setTimeout(() => setActionMessage(''), 3000);
    await loadSchools();
  };

  const handleToggleSuspension = async (school: School) => {
    const newStatus = school.status === 'suspended' ? 'published' : 'suspended';
    await schoolService.updateSchool(school.id, { status: newStatus });
    setActionMessage(
      newStatus === 'suspended' ? 'École suspendue temporairement' : 'École réactivée en ligne'
    );
    setTimeout(() => setActionMessage(''), 3000);
    await loadSchools();
  };

  const filtered = schools.filter(s => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.commune.toLowerCase().includes(q) ||
      s.slug.toLowerCase().includes(q)
    );
  });

  const verifiedCount = schools.filter(s => s.verificationStatus === 'verified').length;
  const suspendedCount = schools.filter(s => s.status === 'suspended').length;

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8 text-left">
        {/* Header */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold uppercase tracking-wider mb-2">
              <ShieldAlert className="w-3.5 h-3.5 text-teal-700" />
              <span>Super-Administration LekòlWeb</span>
            </div>
            <h1 className="text-2xl font-extrabold text-[#1E293B]">
              Supervision Nationale des Écoles Connectées
            </h1>
            <p className="text-xs text-[#64748B]">
              Gestion du registre des établissements scolaires en Haïti, conformité et noms de domaine.
            </p>
          </div>

          <button
            onClick={loadSchools}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Actualiser</span>
          </button>
        </div>

        {actionMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionMessage}</span>
          </div>
        )}

        {/* Global Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Écoles Enregistrées
            </span>
            <p className="text-3xl font-black text-[#1E293B]">{schools.length}</p>
            <p className="text-xs text-[#64748B]">À travers les départements d'Haïti</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Établissements Vérifiés
            </span>
            <p className="text-3xl font-black text-teal-700">{verifiedCount}</p>
            <p className="text-xs text-[#64748B]">Badges d'authenticité validés</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Sous-Domaines Réservés
            </span>
            <p className="text-3xl font-black text-amber-600">{schools.length + RESERVED_SLUGS.size}</p>
            <p className="text-xs text-[#64748B]">Index DNS .lekolweb.com</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Écoles Suspendues
            </span>
            <p className="text-3xl font-black text-red-600">{suspendedCount}</p>
            <p className="text-xs text-[#64748B]">Pour non-conformité ou litige</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 gap-2 pb-1 text-xs font-bold">
          <button
            onClick={() => setActiveTab('schools')}
            className={`py-2 px-4 rounded-xl transition-all ${
              activeTab === 'schools' ? 'bg-teal-700 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Liste des Écoles ({schools.length})
          </button>
          <button
            onClick={() => setActiveTab('verifications')}
            className={`py-2 px-4 rounded-xl transition-all ${
              activeTab === 'verifications' ? 'bg-teal-700 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Vérifications & Badges
          </button>
          <button
            onClick={() => setActiveTab('plans')}
            className={`py-2 px-4 rounded-xl transition-all ${
              activeTab === 'plans' ? 'bg-teal-700 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Programme de Gratuité
          </button>
          <button
            onClick={() => setActiveTab('slugs')}
            className={`py-2 px-4 rounded-xl transition-all ${
              activeTab === 'slugs' ? 'bg-teal-700 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Slugs & Domaines Réservés
          </button>
        </div>

        {/* TAB 1: SCHOOLS MANAGEMENT */}
        {activeTab === 'schools' && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Rechercher par nom, commune ou slug..."
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600"
                />
              </div>
            </div>

            <div className="border border-slate-200 rounded-2xl overflow-hidden overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-3.5">Établissement</th>
                    <th className="p-3.5">Localisation</th>
                    <th className="p-3.5">Profil URL</th>
                    <th className="p-3.5">Type</th>
                    <th className="p-3.5">Statut</th>
                    <th className="p-3.5">Badge</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map(s => (
                    <tr key={s.id} className="hover:bg-slate-50">
                      <td className="p-3.5 font-bold text-slate-900">{s.name}</td>
                      <td className="p-3.5 text-slate-600">
                        {s.commune}, Dép. {s.department}
                      </td>
                      <td className="p-3.5 font-mono text-teal-700">/ecole/{s.slug}</td>
                      <td className="p-3.5 capitalize">{s.schoolType}</td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            s.status === 'published'
                              ? 'bg-emerald-100 text-emerald-800'
                              : s.status === 'suspended'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {s.status}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            s.verificationStatus === 'verified'
                              ? 'bg-teal-50 text-teal-800 border border-teal-200'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {s.verificationStatus}
                        </span>
                      </td>
                      <td className="p-3.5 text-right space-x-1.5">
                        <button
                          onClick={() => onViewSchool(s.slug)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-colors"
                        >
                          Aperçu
                        </button>
                        <button
                          onClick={() => handleToggleSuspension(s)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                            s.status === 'suspended'
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                              : 'bg-red-50 text-red-700 hover:bg-red-100'
                          }`}
                        >
                          {s.status === 'suspended' ? 'Réactiver' : 'Suspendre'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: VERIFICATIONS */}
        {activeTab === 'verifications' && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <p className="text-xs text-slate-600">
              L'attribution du badge vérifié certifie l'existence physique de l'école et sa reconnaissance par les instances éducatives.
            </p>

            <div className="space-y-3">
              {schools.map(s => (
                <div
                  key={s.id}
                  className="p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{s.name}</h4>
                    <p className="text-xs text-slate-500">
                      {s.commune}, Dép. {s.department} • Téléphone : {s.publicPhone} • Email : {s.publicEmail}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {s.verificationStatus === 'verified' ? (
                      <button
                        onClick={() => handleUpdateVerification(s.id, 'unverified')}
                        className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-200 transition-colors"
                      >
                        Retirer le badge vérifié
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUpdateVerification(s.id, 'verified')}
                        className="px-3 py-1.5 bg-teal-700 text-white text-xs font-bold rounded-lg hover:bg-teal-800 flex items-center gap-1 transition-colors"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-teal-200" />
                        <span>Accorder le badge vérifié</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: FREE LAUNCH STATUS */}
        {activeTab === 'plans' && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5 text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 font-bold shrink-0">
                <CheckCircle className="w-5 h-5 text-teal-700" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Politique de Lancement 100% Gratuit</h3>
                <p className="text-slate-500 text-xs">Tous les établissements scolaires en Haïti bénéficient d'un accès sans frais.</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-teal-50/70 border border-teal-200/80 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-teal-900">Statut de la tarification</span>
                <span className="px-2.5 py-0.5 rounded-full bg-teal-700 text-white font-bold text-[10px]">
                  Phase Initiale Gratuite
                </span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Les forfaits payants sont actuellement désactivés. Chaque école inscrite dispose automatiquement d'un site complet, d'un sous-domaine officiel sécurisé, de pré-inscriptions illimitées, de la galerie et des annonces sans aucun abonnement requis.
              </p>
            </div>
          </div>
        )}

        {/* TAB 4: RESERVED SLUGS */}
        {activeTab === 'slugs' && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">
              Mots-clés et sous-domaines protégés contre toute inscription publique
            </h3>
            <div className="flex flex-wrap gap-2 text-xs font-mono">
              {Array.from(RESERVED_SLUGS).map(slug => (
                <span
                  key={slug}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 border border-slate-200"
                >
                  {slug}.lekolweb.com
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
