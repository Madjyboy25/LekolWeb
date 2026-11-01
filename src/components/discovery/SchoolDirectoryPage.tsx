import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  Building,
  CheckCircle2,
  GraduationCap,
  MapPin,
  Phone,
  RefreshCw,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import {
  HAITIAN_COMMUNES_BY_DEPARTMENT,
  HAITIAN_DEPARTMENTS,
  SCHOOL_LEVELS,
} from '../../lib/constants';
import { schoolService } from '../../services/schoolService';
import { School } from '../../types';

interface SchoolDirectoryPageProps {
  initialSearch?: {
    searchQuery?: string;
    department?: string;
    commune?: string;
    level?: string;
  };
  onSelectSchool: (slug: string) => void;
  onOpenApplication: (school: School, formType: 'new_enrollment' | 're_enrollment') => void;
}

export function SchoolDirectoryPage({
  initialSearch,
  onSelectSchool,
  onOpenApplication,
}: SchoolDirectoryPageProps) {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter criteria
  const [searchQuery, setSearchQuery] = useState(initialSearch?.searchQuery || '');
  const [department, setDepartment] = useState(initialSearch?.department || '');
  const [commune, setCommune] = useState(initialSearch?.commune || '');
  const [level, setLevel] = useState(initialSearch?.level || '');
  const [schoolType, setSchoolType] = useState('');
  const [onlyOpenAdmissions, setOnlyOpenAdmissions] = useState(false);

  useEffect(() => {
    loadSchools();

    const handleSchoolsUpdated = () => {
      loadSchools();
    };
    window.addEventListener('lekolweb:schools-updated', handleSchoolsUpdated);
    return () => {
      window.removeEventListener('lekolweb:schools-updated', handleSchoolsUpdated);
    };
  }, [department, commune, schoolType, level]);

  const loadSchools = async () => {
    setLoading(true);
    try {
      const data = await schoolService.getPublishedSchools({
        department: department || undefined,
        commune: commune || undefined,
        schoolType: schoolType || undefined,
        level: level || undefined,
        searchQuery: searchQuery || undefined,
      });
      setSchools(data);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadSchools();
  };

  const resetFilters = () => {
    setSearchQuery('');
    setDepartment('');
    setCommune('');
    setLevel('');
    setSchoolType('');
    setOnlyOpenAdmissions(false);
  };

  const availableCommunes = department
    ? HAITIAN_COMMUNES_BY_DEPARTMENT[department] || []
    : [];

  const filteredSchools = schools.filter(s => {
    if (onlyOpenAdmissions && !s.newEnrollmentOpen && !s.reEnrollmentOpen) {
      return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        s.name.toLowerCase().includes(q) ||
        s.commune.toLowerCase().includes(q) ||
        s.department.toLowerCase().includes(q) ||
        s.description?.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-left space-y-8">
      {/* Page Header */}
      <div className="space-y-2">
        <span className="text-teal-700 font-bold text-xs uppercase tracking-widest bg-teal-50 px-3.5 py-1 rounded-full border border-teal-200/80">
          Annuaire Officiel
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Trouver un établissement scolaire en Haïti
        </h1>
        <p className="text-slate-600 text-sm sm:text-base max-w-3xl">
          Découvrez les profils officiels des écoles, consultez leurs dates d'admissions et postulez en ligne directement.
        </p>
      </div>

      {/* Filter Box */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-4">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search text */}
          <div className="lg:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1">Nom de l'école ou mot-clé</label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Rechercher par nom d'école, commune..."
                className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-700 bg-white"
              />
            </div>
          </div>

          {/* Department */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Département</label>
            <select
              value={department}
              onChange={e => {
                setDepartment(e.target.value);
                setCommune('');
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
              value={commune}
              onChange={e => setCommune(e.target.value)}
              disabled={!department}
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

          {/* School Level */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Cycle scolaire</label>
            <select
              value={level}
              onChange={e => setLevel(e.target.value)}
              className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-700 bg-white"
            >
              <option value="">Tous les cycles</option>
              {SCHOOL_LEVELS.map(lvl => (
                <option key={lvl} value={lvl}>
                  {lvl}
                </option>
              ))}
            </select>
          </div>

          {/* School Type */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Type d'école</label>
            <select
              value={schoolType}
              onChange={e => setSchoolType(e.target.value)}
              className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-700 bg-white"
            >
              <option value="">Tous types</option>
              <option value="congregational">Congréganiste</option>
              <option value="private">Privée laïque</option>
              <option value="public">Publique</option>
            </select>
          </div>

          {/* Checkbox: Open admissions only */}
          <div className="flex items-center gap-2 pt-6">
            <label className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={onlyOpenAdmissions}
                onChange={e => setOnlyOpenAdmissions(e.target.checked)}
                className="rounded text-teal-700 focus:ring-teal-600 w-4 h-4"
              />
              <span>Inscriptions ouvertes uniquement</span>
            </label>
          </div>

          {/* Action buttons */}
          <div className="flex items-end gap-2">
            <button
              type="submit"
              className="flex-1 py-2.5 px-4 bg-teal-700 hover:bg-teal-800 text-white font-bold text-sm rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" />
              <span>Filtrer</span>
            </button>
            <button
              type="button"
              onClick={resetFilters}
              className="py-2.5 px-3 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl transition-colors text-xs font-bold"
              title="Réinitialiser"
            >
              Effacer
            </button>
          </div>
        </form>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-sm text-slate-500">
        <span>
          <strong className="text-slate-900">{filteredSchools.length}</strong> établissement(s) trouvé(s)
        </span>
      </div>

      {/* Results Grid */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-8 h-8 border-3 border-teal-700 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500">Chargement des établissements...</p>
        </div>
      ) : filteredSchools.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSchools.map(school => (
            <div
              key={school.id}
              className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-xl hover:border-teal-300 transition-all duration-300 flex flex-col justify-between group"
            >
              {/* Cover Banner */}
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
                  <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-md bg-teal-700 text-white shadow-xs">
                    {school.department}
                  </span>
                </div>

                <div className="absolute bottom-3 left-3 flex items-center gap-2">
                  <div className="w-11 h-11 rounded-xl bg-white p-1 border border-white/50 shadow-md overflow-hidden">
                    <img src={school.logoUrl || '/LekòlWeb.png'} alt={school.name} className="w-full h-full object-contain" />
                  </div>
                  <span className="text-white text-xs font-semibold drop-shadow-sm flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-teal-300" />
                    <span>{school.commune}</span>
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h3
                    onClick={() => onSelectSchool(school.slug)}
                    className="text-lg font-bold text-slate-900 group-hover:text-teal-700 transition-colors cursor-pointer line-clamp-1"
                  >
                    {school.name}
                  </h3>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {school.description}
                  </p>
                </div>

                {/* Levels pills */}
                <div className="space-y-1.5">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Cycles offerts</p>
                  <div className="flex flex-wrap gap-1">
                    {(school.levelsOffered || []).slice(0, 2).map((l, i) => (
                      <span key={i} className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700">
                        {l.split('(')[0].trim()}
                      </span>
                    ))}
                    {(school.levelsOffered?.length || 0) > 2 && (
                      <span className="px-1.5 py-0.5 text-[10px] font-bold text-teal-700">
                        +{(school.levelsOffered?.length || 0) - 2}
                      </span>
                    )}
                  </div>
                </div>

                {/* Admissions status */}
                <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-1.5 text-[11px]">
                  {school.newEnrollmentOpen ? (
                    <span className="px-2 py-0.5 rounded-md font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      ● Nouvelle inscription ouverte
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-md text-slate-400 bg-slate-50 border border-slate-200">
                      Nouvelle inscription fermée
                    </span>
                  )}
                  {school.reEnrollmentOpen && (
                    <span className="px-2 py-0.5 rounded-md font-semibold bg-teal-50 text-teal-800 border border-teal-200">
                      ● Réinscription ouverte
                    </span>
                  )}
                </div>

                {/* Buttons */}
                <div className="pt-2 flex items-center gap-2">
                  <button
                    onClick={() => onSelectSchool(school.slug)}
                    className="flex-1 py-2.5 px-3 bg-slate-100 hover:bg-teal-50 hover:text-teal-800 text-slate-800 text-xs font-bold rounded-xl transition-colors text-center"
                  >
                    Voir le profil
                  </button>
                  {school.newEnrollmentOpen && (
                    <button
                      onClick={() => onOpenApplication(school, 'new_enrollment')}
                      className="flex-1 py-2.5 px-3 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors text-center"
                    >
                      Postuler
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3.5 shadow-xs">
          <Building className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base sm:text-lg font-bold text-slate-900">
            {schools.length === 0 && !searchQuery && !department && !commune && !schoolType && !level && !onlyOpenAdmissions
              ? 'Aucun établissement disponible pour le moment.'
              : 'Aucun établissement correspondant à vos critères.'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
            {schools.length === 0 && !searchQuery && !department && !commune && !schoolType && !level && !onlyOpenAdmissions
              ? 'Les établissements scolaires apparaîtront ici dès leur publication sur LekòlWeb.'
              : 'Essayez de modifier votre recherche ou de réinitialiser les filtres appliqués.'}
          </p>
          {(searchQuery || department || commune || schoolType || level || onlyOpenAdmissions) && (
            <button
              onClick={resetFilters}
              className="px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors mt-2"
            >
              Réinitialiser les filtres
            </button>
          )}
        </div>
      )}
    </div>
  );
}
