import React from 'react';
import {
  FileText,
  Heart,
  HelpCircle,
  Mail,
  MapPin,
  Phone,
  Search,
  Shield,
  Smartphone,
} from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';

interface FooterProps {
  onNavigate: (view: string) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 text-left">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <BrandLogo size="md" light={true} showTagline={true} />
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm pt-1">
              La plateforme centralisée de découverte scolaire et de demandes d'inscription en Haïti. Inspirée du Common App, LekòlWeb connecte les familles aux établissements scolaires de tous les départements.
            </p>
            <div className="pt-2 flex flex-col gap-2 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-teal-400 shrink-0" />
                <span>Port-au-Prince, Cap-Haïtien, Les Cayes et les 10 départements d'Haïti</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-teal-400 shrink-0" />
                <span>contact@lekolweb.com</span>
              </div>
            </div>
          </div>

          {/* Families Navigation */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm tracking-wider uppercase">Pour les Familles</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <button onClick={() => onNavigate('discovery')} className="hover:text-teal-300 transition-colors">
                  Trouver une école
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('announcements')} className="hover:text-teal-300 transition-colors">
                  Annonces & Concours
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('how_it_works')} className="hover:text-teal-300 transition-colors">
                  Comment ça marche
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('parent_dashboard')} className="hover:text-teal-300 transition-colors">
                  Mon Espace Famille
                </button>
              </li>
            </ul>
          </div>

          {/* Schools Navigation */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm tracking-wider uppercase">Pour les Écoles</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <button onClick={() => onNavigate('for_schools')} className="hover:text-teal-300 transition-colors">
                  Présentation Écoles
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('register_director')} className="text-teal-300 font-bold hover:text-white transition-colors">
                  Inscrire mon établissement
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('director_dashboard')} className="hover:text-teal-300 transition-colors">
                  Tableau de bord Directeur
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('login')} className="hover:text-teal-300 transition-colors">
                  Connexion responsable
                </button>
              </li>
            </ul>
          </div>

          {/* Platform & Trust */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm tracking-wider uppercase">Confiance & Données</h4>
            <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/60 text-xs space-y-2">
              <div className="flex items-center gap-1.5 text-teal-300 font-semibold">
                <Shield className="w-4 h-4 text-teal-400" />
                <span>Protection des Données</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Les dossiers des élèves et les coordonnées des familles sont strictement confidentiels et uniquement transmis à l'école choisie.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} LekòlWeb. Tous droits réservés. Plateforme d'inscription pour Haïti.</p>
          <div className="flex items-center gap-6">
            <button onClick={() => onNavigate('privacy')} className="hover:text-teal-300 transition-colors">
              Politique de confidentialité
            </button>
            <button onClick={() => onNavigate('terms')} className="hover:text-teal-300 transition-colors">
              Conditions d'utilisation
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
