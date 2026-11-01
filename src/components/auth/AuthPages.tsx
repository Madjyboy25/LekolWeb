import React, { useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  GraduationCap,
  Lock,
  Mail,
  User,
  Users,
} from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

interface AuthPageProps {
  initialMode?: 'login' | 'register' | 'reset';
  initialRole?: 'parent' | 'principal';
  onSuccess: () => void;
  onNavigateHome: () => void;
}

export function AuthPages({
  initialMode = 'login',
  initialRole = 'parent',
  onSuccess,
  onNavigateHome,
}: AuthPageProps) {
  const [mode, setMode] = useState<'login' | 'register' | 'reset'>(initialMode);
  const [selectedRole, setSelectedRole] = useState<'parent' | 'principal'>(initialRole);
  const {
    loginWithEmail,
    registerWithEmail,
    loginWithGoogle,
    resetPassword,
  } = useAuth();

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      await loginWithEmail(email, password);
      onSuccess();
    } catch (err: any) {
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found') {
        setErrorMsg('Adresse e-mail ou mot de passe incorrect.');
      } else if (err.code === 'auth/too-many-requests') {
        setErrorMsg('Trop de tentatives. Veuillez réessayer dans quelques instants.');
      } else {
        setErrorMsg(err.message || 'Erreur lors de la connexion.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (password.length < 6) {
      setErrorMsg('Le mot de passe doit comporter au moins 6 caractères.');
      return;
    }
    setLoading(true);
    try {
      await registerWithEmail(email, password, displayName, selectedRole);
      onSuccess();
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setErrorMsg('Cette adresse email est déjà enregistrée. Veuillez vous connecter.');
      } else {
        setErrorMsg(err.message || 'Erreur lors de la création du compte.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setErrorMsg('');
    setLoading(true);
    try {
      await loginWithGoogle(selectedRole);
      onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || 'Erreur lors de la connexion avec Google.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);
    try {
      await resetPassword(email);
      setSuccessMsg('Un lien de réinitialisation vous a été envoyé par e-mail.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Impossible d\'envoyer le courriel de réinitialisation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="max-w-md w-full mx-auto space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <button
            onClick={onNavigateHome}
            className="inline-flex items-center gap-2 hover:opacity-90 transition-opacity"
          >
            <BrandLogo size="md" />
          </button>
          <h1 className="text-2xl font-black text-[#1E293B]">
            {mode === 'login' && 'Connexion à votre espace'}
            {mode === 'register' && 'Créer votre compte LekòlWeb'}
            {mode === 'reset' && 'Réinitialiser votre mot de passe'}
          </h1>
          <p className="text-xs text-[#64748B]">
            {mode === 'login' && 'Accédez à vos candidatures ou gérez votre établissement.'}
            {mode === 'register' && 'Rejoignez la plateforme centralisée d\'admissions scolaires en Haïti.'}
            {mode === 'reset' && 'Indiquez votre adresse e-mail pour recevoir les instructions.'}
          </p>
        </div>

        {/* Card Box */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5 text-left">
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Quick Google Sign In */}
          <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={loading}
            className="w-full py-3 px-4 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold rounded-xl text-xs flex items-center justify-center gap-2.5 shadow-xs transition-all active:scale-95 disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Continuer avec Google</span>
          </button>

          <div className="relative text-center my-3">
            <span className="bg-white px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider relative z-10">
              Ou avec identifiants
            </span>
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
          </div>

          {/* Form */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Adresse e-mail
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="famille@gmail.com ou direction@ecole.edu.ht"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-700 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Mot de passe
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('reset');
                      setErrorMsg('');
                    }}
                    className="text-xs text-teal-700 hover:text-teal-800 hover:underline font-semibold"
                  >
                    Mot de passe oublié ?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-700 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl text-sm shadow-md transition-all active:scale-95 disabled:opacity-50"
              >
                {loading ? 'Connexion en cours...' : 'Se connecter'}
              </button>
            </form>
          )}

          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              {/* Role Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Type de profil :
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedRole('parent')}
                    className={`p-3 rounded-xl border text-xs font-bold text-left flex flex-col gap-1 transition-all ${
                      selectedRole === 'parent'
                        ? 'border-teal-700 bg-teal-50 text-teal-900 shadow-xs ring-1 ring-teal-700'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-teal-700 shrink-0" />
                      <span>Parent / Famille</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-normal">
                      Inscrire des enfants dans plusieurs écoles
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedRole('principal')}
                    className={`p-3 rounded-xl border text-xs font-bold text-left flex flex-col gap-1 transition-all ${
                      selectedRole === 'principal'
                        ? 'border-teal-700 bg-teal-50 text-teal-900 shadow-xs ring-1 ring-teal-700'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4 text-teal-700 shrink-0" />
                      <span>Directeur d'école</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-normal">
                      Gérer des écoles, formulaires et admissions
                    </span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nom et prénom
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    placeholder="Jean-Baptiste Pierre"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-700 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Adresse e-mail
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="votre-email@example.com"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-700 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mot de passe (minimum 6 caractères)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-700 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="text-[11px] text-slate-500">
                En créant un compte, vous acceptez les conditions d'utilisation et la politique de protection de la vie privée de LekòlWeb.
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl text-sm shadow-md transition-all active:scale-95 disabled:opacity-50"
              >
                {loading ? 'Création en cours...' : 'Créer mon compte'}
              </button>
            </form>
          )}

          {mode === 'reset' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Votre adresse e-mail
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="votre-email@example.com"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-700 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl text-sm shadow-md transition-all active:scale-95 disabled:opacity-50"
              >
                {loading ? 'Envoi...' : 'Envoyer le lien de réinitialisation'}
              </button>
            </form>
          )}

          {/* Bottom Switcher */}
          <div className="pt-2 text-center text-xs text-slate-600">
            {mode === 'login' ? (
              <p>
                Vous n'avez pas encore de compte ?{' '}
                <button
                  onClick={() => {
                    setMode('register');
                    setErrorMsg('');
                  }}
                  className="font-bold text-teal-700 hover:text-teal-800 hover:underline"
                >
                  S'inscrire
                </button>
              </p>
            ) : (
              <p>
                Vous avez déjà un compte ?{' '}
                <button
                  onClick={() => {
                    setMode('login');
                    setErrorMsg('');
                  }}
                  className="font-bold text-teal-700 hover:text-teal-800 hover:underline"
                >
                  Se connecter
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
