import React from 'react';
import {
  ArrowRight,
  CheckCircle2,
  FileCheck,
  GraduationCap,
  HelpCircle,
  Layers,
  Search,
  ShieldCheck,
  UserCheck,
  Users,
} from 'lucide-react';

interface HowItWorksPageProps {
  onFindSchools: () => void;
  onRegisterSchool: () => void;
  onRegisterParent: () => void;
}

export function HowItWorksPage({
  onFindSchools,
  onRegisterSchool,
  onRegisterParent,
}: HowItWorksPageProps) {
  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-4 sm:px-6 lg:px-8 text-left">
      <div className="max-w-5xl mx-auto space-y-16">
        {/* Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold uppercase tracking-wider">
            <span>Guide d'utilisation</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1E293B] tracking-tight">
            Comment fonctionne LekòlWeb ?
          </h1>
          <p className="text-base sm:text-lg text-[#64748B] leading-relaxed">
            Une plateforme centralisée d'admission et de découverte scolaire pour Haïti. 
            Découvrez comment les familles et les directions d'école collaborent en toute transparence.
          </p>
        </div>

        {/* Section 1: Pour les Familles */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-sm space-y-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">
                  Parcours Famille & Parents
                </span>
                <h2 className="text-2xl font-black text-[#1E293B]">
                  Inscrire votre enfant en 5 étapes simples
                </h2>
              </div>
            </div>

            <button
              onClick={onFindSchools}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl text-xs transition-all shadow-sm"
            >
              <span>Trouver une école</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col justify-between">
              <div>
                <span className="w-7 h-7 rounded-full bg-teal-700 text-white text-xs font-black flex items-center justify-center mb-3">
                  1
                </span>
                <h3 className="text-sm font-bold text-[#1E293B] mb-1">Explorez les écoles</h3>
                <p className="text-xs text-[#64748B] leading-relaxed">
                  Recherchez par département, commune, cycle et type d'établissement.
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col justify-between">
              <div>
                <span className="w-7 h-7 rounded-full bg-teal-700 text-white text-xs font-black flex items-center justify-center mb-3">
                  2
                </span>
                <h3 className="text-sm font-bold text-[#1E293B] mb-1">Consultez le profil</h3>
                <p className="text-xs text-[#64748B] leading-relaxed">
                  Vérifiez les dates d'admissions, les pièces requises et les annonces officielles.
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col justify-between">
              <div>
                <span className="w-7 h-7 rounded-full bg-teal-700 text-white text-xs font-black flex items-center justify-center mb-3">
                  3
                </span>
                <h3 className="text-sm font-bold text-[#1E293B] mb-1">Créez votre compte</h3>
                <p className="text-xs text-[#64748B] leading-relaxed">
                  Un seul compte parent suffit pour gérer tous vos enfants et candidatures.
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col justify-between">
              <div>
                <span className="w-7 h-7 rounded-full bg-teal-700 text-white text-xs font-black flex items-center justify-center mb-3">
                  4
                </span>
                <h3 className="text-sm font-bold text-[#1E293B] mb-1">Remplissez le formulaire</h3>
                <p className="text-xs text-[#64748B] leading-relaxed">
                  Nouvelle inscription ou réinscription annuelle avec pièces jointes.
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col justify-between">
              <div>
                <span className="w-7 h-7 rounded-full bg-teal-700 text-white text-xs font-black flex items-center justify-center mb-3">
                  5
                </span>
                <h3 className="text-sm font-bold text-[#1E293B] mb-1">Suivez votre dossier</h3>
                <p className="text-xs text-[#64748B] leading-relaxed">
                  Obtenez votre numéro LKW officiel et suivez l'étude du dossier en temps réel.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Pour les Directeurs d'Établissement */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-sm space-y-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">
                  Parcours Établissements Scolaires
                </span>
                <h2 className="text-2xl font-black text-[#1E293B]">
                  Gérez vos admissions et votre présence en ligne
                </h2>
              </div>
            </div>

            <button
              onClick={onRegisterSchool}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-all shadow-sm"
            >
              <span>Inscrire mon école</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
              <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs">
                01
              </div>
              <h3 className="text-base font-bold text-[#1E293B]">Profil officiel sans site à coder</h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Votre école dispose immédiatement d'une page publique moderne accessible sur 
                <span className="text-teal-700 font-mono text-[11px] ml-1">/ecole/votre-nom</span>. 
                Aucun serveur, nom de domaine ou frais d'hébergement requis.
              </p>
            </div>

            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
              <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs">
                02
              </div>
              <h3 className="text-base font-bold text-[#1E293B]">Formulaires sur mesure</h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Personnalisez vos questions pour la Nouvelle Inscription et la Réinscription. 
                Chaque modification est versionnée automatiquement pour protéger les dossiers déjà soumis.
              </p>
            </div>

            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
              <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs">
                03
              </div>
              <h3 className="text-base font-bold text-[#1E293B]">Multi-écoles & Équipe administrative</h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Pilotez plusieurs succursales ou établissements depuis un compte unique. 
                Invitez vos secrétaires et censeurs avec des permissions granulaires sécurisées.
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: Numéro de Référence Officiel */}
        <div className="bg-teal-900 text-white rounded-3xl p-8 sm:p-10 relative overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-800 border border-teal-700 text-teal-200 text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-300" />
              <span>Numéro de dossier certifié</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Chaque dossier reçoit une référence unique (ex: LKW-2026-4821A)
            </h2>
            <p className="text-xs sm:text-sm text-teal-100 leading-relaxed">
              Ce numéro officiel permet aux parents et aux écoles de retrouver instantanément toute candidature, 
              d'effectuer le suivi au secrétariat de l'école et d'assurer une traçabilité totale sans perte de dossiers.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <button
                onClick={onFindSchools}
                className="px-5 py-2.5 bg-white hover:bg-slate-100 text-teal-950 font-bold rounded-xl text-xs transition-all shadow-md"
              >
                Explorer le répertoire
              </button>
              <button
                onClick={onRegisterParent}
                className="px-5 py-2.5 bg-teal-800 hover:bg-teal-700 text-white font-bold rounded-xl text-xs transition-all border border-teal-600"
              >
                Créer un compte parent
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
