import React from 'react';
import {
  ArrowRight,
  BarChart3,
  CheckCircle,
  FileSpreadsheet,
  FileText,
  GraduationCap,
  Layers,
  Lock,
  Megaphone,
  Plus,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Users,
} from 'lucide-react';

interface ForSchoolsPageProps {
  onRegisterSchool: () => void;
  onExploreDirectory: () => void;
}

export function ForSchoolsPage({
  onRegisterSchool,
  onExploreDirectory,
}: ForSchoolsPageProps) {
  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-4 sm:px-6 lg:px-8 text-left">
      <div className="max-w-5xl mx-auto space-y-16">
        {/* Hero */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="max-w-2xl space-y-5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold uppercase tracking-wider">
              <GraduationCap className="w-3.5 h-3.5 text-teal-700" />
              <span>Pour les Directions d'Établissements en Haïti</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1E293B] tracking-tight leading-tight">
              Modernisez vos admissions scolaires sans créer ni maintenir de site web.
            </h1>

            <p className="text-base text-[#64748B] leading-relaxed">
              LekòlWeb offre à chaque établissement scolaire un profil public certifié, un système de réception 
              de candidatures sur mesure, et un tableau de bord complet pour gérer vos admissions et annonces officielles.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={onRegisterSchool}
                className="inline-flex items-center gap-2 px-6 py-3 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl text-sm transition-all shadow-md active:scale-95"
              >
                <span>Inscrire mon établissement</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onExploreDirectory}
                className="inline-flex items-center gap-2 px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-sm transition-all active:scale-95 border border-slate-200"
              >
                <span>Découvrir le répertoire</span>
              </button>
            </div>
          </div>
        </div>

        {/* 6 Key Benefits */}
        <div className="space-y-6">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl font-black text-[#1E293B]">
              Pourquoi les écoles choisissent LekòlWeb
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B] mt-1">
              Fini les formulaires papier égarés et les files d'attente sous le soleil.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#1E293B]">
                Formulaires 100% Personnalisables
              </h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Créez vos propres questions pour la Nouvelle Inscription et la Réinscription : 
                bulletins requis, certificats de santé, personne responsable, options scolaires.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#1E293B]">
                Versionnage des Formulaires
              </h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Modifiez vos questions à tout moment sans altérer l'intégrité des candidatures 
                déjà enregistrées lors des versions précédentes.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#1E293B]">
                Gestion Multi-Établissements
              </h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Vous dirigez une congrégation, plusieurs collèges ou une annexe ? 
                Basculez entre vos établissements en un clic depuis un seul compte.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#1E293B]">
                Délégation Administrative Sécurisée
              </h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Invitez vos secrétaires, préfets des études ou censeurs en leur attribuant 
                des droits spécifiques (lecture seule, modification d'annonces, examen des dossiers).
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center">
                <Megaphone className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#1E293B]">
                Annonces & Calendrier Officiel
              </h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Publiez les dates des examens d'admission, les dates de rentrée et les convocations. 
                Visibles directement sur votre profil et dans le flux national.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#1E293B]">
                Export Excel / CSV & Filtres
              </h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Filtrez les candidats par classe, statut, statut financier, et téléchargez 
                la liste complète en un clic pour vos réunions de commission d'admission.
              </p>
            </div>
          </div>
        </div>

        {/* Anti-Duplicate & Protection */}
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-10 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-emerald-400 text-xs font-bold">
            <Lock className="w-3.5 h-3.5" />
            <span>Protection de l'identité des établissements</span>
          </div>
          <h2 className="text-2xl font-black">
            Contrôle anti-doublon et vérification d'authenticité
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
            LekòlWeb vérifie automatiquement chaque nouvelle inscription afin d'éviter les doublons 
            dans une même commune. Les directeurs peuvent fournir leurs pièces justificatives 
            pour recevoir le badge officiel <strong>Établissement Vérifié</strong>.
          </p>
          <div className="pt-2">
            <button
              onClick={onRegisterSchool}
              className="px-6 py-3 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl text-xs transition-all shadow-md"
            >
              Créer le compte de mon école
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
