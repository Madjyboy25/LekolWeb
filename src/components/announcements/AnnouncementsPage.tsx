import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Bell,
  Building,
  Calendar,
  ChevronRight,
  ExternalLink,
  Filter,
  GraduationCap,
  MapPin,
  Megaphone,
  School as SchoolIcon,
  Search,
} from 'lucide-react';
import { schoolService } from '../../services/schoolService';
import { Announcement, AnnouncementCategory, School } from '../../types';

interface AnnouncementsPageProps {
  initialSelectedId?: string;
  onSelectSchool: (slug: string) => void;
}

export function AnnouncementsPage({
  initialSelectedId,
  onSelectSchool,
}: AnnouncementsPageProps) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    setLoading(true);
    try {
      const data = await schoolService.getAnnouncements(undefined, false);
      setAnnouncements(data);
      if (initialSelectedId) {
        const found = data.find(a => a.id === initialSelectedId);
        if (found) setSelectedAnnouncement(found);
      }
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: 'all', label: 'Toutes les annonces' },
    { id: 'new_enrollment', label: 'Nouvelles inscriptions' },
    { id: 're_enrollment', label: 'Réinscriptions' },
    { id: 'examinations', label: 'Examens & Résultats' },
    { id: 'important_dates', label: 'Dates & Calendrier' },
    { id: 'school_activities', label: 'Activités scolaires' },
    { id: 'general', label: 'Général' },
  ];

  const filteredAnnouncements = announcements.filter(a => {
    if (selectedCategory !== 'all' && a.category !== selectedCategory) {
      return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        a.title.toLowerCase().includes(q) ||
        a.content.toLowerCase().includes(q) ||
        a.schoolName.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

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
      case 'school_activities':
        return { label: 'Activités & Événements', color: 'bg-purple-50 text-purple-800 border-purple-200' };
      default:
        return { label: 'Information Générale', color: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-left space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <span className="text-teal-700 font-bold text-xs uppercase tracking-widest bg-teal-50 px-3.5 py-1 rounded-full border border-teal-200/80">
          Communications Officielles
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Annonces des établissements scolaires
        </h1>
        <p className="text-slate-600 text-sm sm:text-base max-w-2xl">
          Restez informés des dates de concours, des périodes de réinscription, des résultats officiels et des événements éducatifs en Haïti.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Rechercher une annonce par titre, école, mot-clé..."
              className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-700 bg-white"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
          {categories.map(c => {
            const isActive = selectedCategory === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`text-xs px-3 py-1.5 rounded-xl font-bold transition-all ${
                  isActive
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {c.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of Announcements */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-8 h-8 border-3 border-teal-700 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500">Chargement des annonces...</p>
        </div>
      ) : filteredAnnouncements.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAnnouncements.map(ann => {
            const badge = getCategoryBadge(ann.category);
            return (
              <div
                key={ann.id}
                className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs hover:shadow-xl hover:border-teal-300 transition-all flex flex-col justify-between space-y-4 text-left"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold border ${badge.color}`}>
                      {badge.label}
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
                    <h3 className="text-base font-bold text-slate-900 line-clamp-2">
                      {ann.title}
                    </h3>
                    <p className="text-xs text-teal-700 font-semibold mt-1 flex items-center gap-1">
                      <SchoolIcon className="w-3.5 h-3.5" />
                      <span>{ann.schoolName}</span>
                    </p>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-4 leading-relaxed">
                    {ann.content}
                  </p>

                  {(ann.startDate || ann.endDate) && (
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 text-[11px] text-slate-600 flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                      <span>
                        Période : {ann.startDate || ''} {ann.endDate ? `au ${ann.endDate}` : ''}
                      </span>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-400">{ann.schoolCommune || 'Haïti'}</span>
                  <button
                    onClick={() => setSelectedAnnouncement(ann)}
                    className="text-xs font-bold text-teal-700 hover:text-teal-900 inline-flex items-center gap-1"
                  >
                    <span>Voir le détail</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
          <Megaphone className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">Aucune annonce trouvée</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Aucune publication ne correspond à vos critères actuels. Essayez une autre catégorie.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSearchQuery('');
            }}
            className="px-4 py-2 bg-teal-700 text-white text-xs font-bold rounded-xl shadow-xs mt-2"
          >
            Afficher toutes les annonces
          </button>
        </div>
      )}

      {/* Modal / Dialog: View Announcement Full Detail */}
      {selectedAnnouncement && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 border border-slate-200 shadow-2xl space-y-5 text-left relative animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${getCategoryBadge(selectedAnnouncement.category).color}`}>
                {getCategoryBadge(selectedAnnouncement.category).label}
              </span>
              <button
                onClick={() => setSelectedAnnouncement(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="font-bold text-teal-800 text-sm">{selectedAnnouncement.schoolName}</span>
                <span>•</span>
                <span>
                  Publié le {new Date(selectedAnnouncement.publishedAt || selectedAnnouncement.createdAt).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                {selectedAnnouncement.title}
              </h2>
            </div>

            {(selectedAnnouncement.startDate || selectedAnnouncement.endDate) && (
              <div className="p-3 bg-teal-50 rounded-2xl border border-teal-200 text-xs text-teal-900 font-semibold flex items-center gap-2">
                <Calendar className="w-4 h-4 text-teal-700" />
                <span>
                  Calendrier officiel : du {selectedAnnouncement.startDate || '—'} au {selectedAnnouncement.endDate || '—'}
                </span>
              </div>
            )}

            <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line space-y-3 pt-2">
              {selectedAnnouncement.content}
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                onClick={() => setSelectedAnnouncement(null)}
                className="px-4 py-2 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50"
              >
                Fermer
              </button>
              <button
                onClick={() => {
                  const s = selectedAnnouncement.schoolId;
                  setSelectedAnnouncement(null);
                  onSelectSchool(s);
                }}
                className="px-4.5 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2"
              >
                <span>Voir le profil de l'école</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
