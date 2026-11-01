import React, { useState } from 'react';
import {
  Bell,
  ChevronDown,
  Compass,
  FileText,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  PlusCircle,
  School as SchoolIcon,
  Search,
  User,
  Users,
  X,
} from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';
import { useAuth } from '../../context/AuthContext';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string, params?: any) => void;
}

export function Navbar({ currentView, onNavigate }: NavbarProps) {
  const {
    currentUser,
    userProfile,
    isAdmin,
    isDirector,
    isParent,
    logout,
  } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navLinks = [
    { id: 'home', label: 'Accueil' },
    { id: 'discovery', label: 'Trouver une école', icon: Search },
    { id: 'announcements', label: 'Annonces', icon: Bell },
    { id: 'how_it_works', label: 'Comment ça marche', icon: Compass },
    { id: 'for_schools', label: 'Pour les écoles', icon: SchoolIcon },
  ];

  const handleLinkClick = (viewId: string) => {
    onNavigate(viewId);
    setMobileMenuOpen(false);
  };

  const getDashboardView = () => {
    if (isAdmin) return 'admin';
    if (isDirector) return 'director_dashboard';
    return 'parent_dashboard';
  };

  const getDashboardLabel = () => {
    if (isAdmin) return 'Administration Plateforme';
    if (isDirector) return 'Tableau de bord Directeur';
    return 'Mon Espace Famille';
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <button
            onClick={() => handleLinkClick('home')}
            className="focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 rounded-xl p-1 text-left transition-transform active:scale-95"
            aria-label="LekòlWeb Accueil"
          >
            <BrandLogo size="md" showTagline={false} />
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map(link => {
              const isActive = currentView === link.id;
              const Icon = link.icon;
              return (
                <button
                  key={link.id}
                  onClick={() => handleLinkClick(link.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold rounded-xl transition-all ${
                    isActive
                      ? 'text-teal-800 bg-teal-50 font-bold border border-teal-100 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  {Icon && <Icon className={`w-4 h-4 ${isActive ? 'text-teal-700' : 'text-slate-400'}`} />}
                  <span>{link.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action buttons */}
          <div className="hidden md:flex items-center gap-3">

            {/* Authenticated user menu vs Guest actions */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-teal-300 hover:bg-slate-50 text-sm font-medium text-slate-800 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-teal-700 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                    {userProfile?.displayName ? userProfile.displayName.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="text-left max-w-[140px]">
                    <p className="text-xs font-bold text-slate-800 truncate">{userProfile?.displayName || 'Mon Compte'}</p>
                    <span className="text-[10px] text-teal-700 font-semibold block capitalize">
                      {isAdmin ? 'Admin' : isDirector ? 'Directeur' : 'Parent'}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 animate-fade-in text-left">
                    <div className="px-4 py-2.5 border-b border-slate-100">
                      <p className="text-[11px] font-semibold text-slate-400">Connecté en tant que</p>
                      <p className="text-sm font-bold text-slate-800 truncate">{currentUser.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                        {isAdmin ? 'Plateforme Admin' : isDirector ? 'Direction Scolaire' : 'Espace Famille'}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onNavigate(getDashboardView());
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-teal-50 hover:text-teal-800 flex items-center gap-2.5 font-medium transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4 text-teal-600" />
                      <span>{getDashboardLabel()}</span>
                    </button>

                    {isParent && (
                      <>
                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            onNavigate('parent_dashboard', { tab: 'applications' });
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-teal-50 flex items-center gap-2.5 font-medium transition-colors"
                        >
                          <FileText className="w-4 h-4 text-teal-600" />
                          <span>Mes Demandes d'inscription</span>
                        </button>
                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            onNavigate('parent_dashboard', { tab: 'children' });
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-teal-50 flex items-center gap-2.5 font-medium transition-colors"
                        >
                          <Users className="w-4 h-4 text-teal-600" />
                          <span>Mes Enfants</span>
                        </button>
                      </>
                    )}

                    {isDirector && (
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onNavigate('director_dashboard', { tab: 'schools' });
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-teal-50 flex items-center gap-2.5 font-medium transition-colors"
                      >
                        <SchoolIcon className="w-4 h-4 text-teal-600" />
                        <span>Mes Établissements</span>
                      </button>
                    )}

                    <div className="border-t border-slate-100 my-1" />

                    <button
                      onClick={async () => {
                        setUserDropdownOpen(false);
                        await logout();
                        onNavigate('home');
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2.5 font-medium transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Se déconnecter</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigate('login')}
                  className="px-3.5 py-2 text-sm font-semibold text-slate-700 hover:text-teal-800 transition-colors"
                >
                  Se connecter
                </button>
                <button
                  onClick={() => onNavigate('discovery')}
                  className="inline-flex items-center gap-2 px-4.5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white text-sm font-bold rounded-xl shadow-xs hover:shadow-md transition-all active:scale-[0.98]"
                >
                  <Search className="w-4 h-4 text-teal-200" />
                  <span>Trouver une école</span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile hamburger button */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100"
              aria-label="Menu de navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6 text-slate-800" /> : <Menu className="w-6 h-6 text-slate-800" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-6 space-y-3 text-left">
          <div className="space-y-1">
            {navLinks.map(link => {
              const isActive = currentView === link.id;
              const Icon = link.icon;
              return (
                <button
                  key={link.id}
                  onClick={() => handleLinkClick(link.id)}
                  className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold rounded-xl text-left ${
                    isActive ? 'bg-teal-50 text-teal-800 font-bold' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {Icon && <Icon className="w-4 h-4 text-teal-600" />}
                  <span>{link.label}</span>
                </button>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-100 space-y-2">
            {currentUser ? (
              <>
                <button
                  onClick={() => handleLinkClick(getDashboardView())}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-teal-700 text-white font-bold text-sm rounded-xl"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>{getDashboardLabel()}</span>
                </button>
                <button
                  onClick={async () => {
                    await logout();
                    handleLinkClick('home');
                  }}
                  className="w-full py-2.5 text-center text-sm font-semibold text-red-600 hover:bg-red-50 rounded-xl"
                >
                  Se déconnecter
                </button>
              </>
            ) : (
              <div className="space-y-2">
                <button
                  onClick={() => handleLinkClick('discovery')}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-teal-700 text-white font-bold text-sm rounded-xl shadow-xs"
                >
                  <Search className="w-4 h-4 text-teal-200" />
                  <span>Trouver une école</span>
                </button>
                <button
                  onClick={() => handleLinkClick('login')}
                  className="w-full py-2.5 text-center text-sm font-semibold text-slate-700 border border-slate-200 rounded-xl"
                >
                  Se connecter
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
