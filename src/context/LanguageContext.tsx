import React, { createContext, useContext, useState } from 'react';

export type Language = 'fr' | 'ht';

interface Translations {
  [key: string]: {
    fr: string;
    ht: string;
  };
}

export const TRANSLATIONS: Translations = {
  // Navigation
  navHome: { fr: 'Accueil', ht: 'Akèy' },
  navTemplates: { fr: 'Modèles de sites', ht: 'Modèl sit yo' },
  navFeatures: { fr: 'Fonctionnalités', ht: 'Karakteristik' },
  navHowItWorks: { fr: 'Comment ça marche', ht: 'Kijan sa mache' },
  navPricing: { fr: 'Tarifs', ht: 'Pri yo' },
  navDirectory: { fr: 'Annuaire des écoles', ht: 'Lis lekòl yo' },
  navLogin: { fr: 'Se connecter', ht: 'Konekte' },
  navCreateSite: { fr: 'Créer mon site', ht: 'Kreye sit mwen' },
  navCreateMySite: { fr: 'Créer mon site', ht: 'Kreye sit mwen' },
  navDashboard: { fr: 'Tableau de bord', ht: 'Tablo kontwòl' },
  navAdmin: { fr: 'Administration', ht: 'Administrasyon' },

  // Hero
  heroTitle: {
    fr: 'Créez le site web de votre école en toute simplicité.',
    ht: 'Kreye sit entènèt lekòl ou an tout senpleman.',
  },
  heroSubtitle: {
    fr: 'Présentez votre établissement, informez les parents et recevez des demandes de préinscription grâce à un site web professionnel, sans avoir besoin de compétences techniques.',
    ht: 'Prezante lekòl ou a, bay paran yo enfòmasyon epi resevwa pre-enskripsyon gras ak yon sit entènèt pwofesyonèl, san w pa bezwen konn pwograme.',
  },
  heroCtaPrimary: { fr: 'Créer le site de mon école', ht: 'Kreye sit lekòl mwen' },
  heroCtaSecondary: { fr: 'Découvrir les modèles', ht: 'Dekouvri modèl yo' },

  // Pre-enrollment
  preEnrollmentTitle: { fr: 'Pré-inscriptions en ligne', ht: 'Pre-enskripsyon sou entènèt' },
  preEnrollmentDesc: {
    fr: 'Permettez aux parents de soumettre leur dossier depuis leur téléphone, sans file d\'attente.',
    ht: 'Pèmèt paran yo soumèt dosye pitit yo dirèkteman sou telefòn yo, san fè ranje.',
  },

  // Directory
  directoryTitle: { fr: 'Annuaire National des Écoles', ht: 'Lis Nasyonal Lekòl yo' },
  directorySubtitle: {
    fr: 'Explorez les établissements scolaires haïtiens déjà en ligne avec LekòlWeb.',
    ht: 'Dekouvri tout lekòl ann Ayiti ki deja gen sit ofisyèl yo sou LekòlWeb.',
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof TRANSLATIONS) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('fr');

  const t = (key: keyof typeof TRANSLATIONS): string => {
    if (!TRANSLATIONS[key]) return String(key);
    return TRANSLATIONS[key][language] || TRANSLATIONS[key].fr;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
