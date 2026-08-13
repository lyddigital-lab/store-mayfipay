import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { getAcheteurSession } from '../lib/supabase';
import MayfiPayLogo from '../components/MayfiPayLogo';

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  useEffect(() => {
    if (getAcheteurSession()) navigate(redirect, { replace: true });
  }, [navigate, redirect]);

  // Mémoriser la page d'origine pour y revenir après la connexion SSO
  useEffect(() => {
    const target = redirect && redirect.startsWith('/') && redirect !== '/' ? redirect : '/';
    localStorage.setItem('store_redirect', target);
  }, [redirect]);

  const returnUrl = encodeURIComponent(window.location.origin + '/sso');
  const ssoUrl = `https://app.mayfipay.com/login?redirect=${returnUrl}&source=store&intent=buyer`;
  const registerUrl = `https://app.mayfipay.com/register?redirect=${returnUrl}&source=store&intent=buyer`;

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Premium minimalist card */}
      <div className="bg-white rounded-[28px] shadow-[0_4px_24px_rgba(15,23,42,0.04)] border border-mayfipay-border-light overflow-hidden">
        <div className="px-8 py-9 sm:px-10 sm:py-10">
          {/* Small MayfiPay icon */}
          <div className="flex justify-center mb-6">
            <MayfiPayLogo size={44} />
          </div>

          {/* Title */}
          <h1 className="text-[38px] sm:text-[44px] font-extrabold text-mayfipay-text text-center leading-tight mb-3">
            Connectez-vous à votre compte
          </h1>

          {/* Subtitle */}
          <p className="text-center text-mayfipay-text-sec mb-8">
            Utilisez votre compte MayfiPay pour accéder au Store.
          </p>

          {/* Se connecter avec MayfiPay — UNIQUE grand bouton orange */}
          <a
            href={ssoUrl}
            className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-xl font-semibold text-white bg-mayfipay-orange hover:bg-mayfipay-orange-dark transition-all duration-150 shadow-[0_8px_20px_rgba(249,114,22,0.28)]"
          >
            <MayfiPayLogo size={22} />
            <span>Se connecter avec MayfiPay</span>
          </a>

          {/* Inscription link → app.mayfipay.com */}
          <p className="text-center text-sm text-mayfipay-text-sec mt-6">
            Vous n'avez pas de compte ?{' '}
            <a
              href={registerUrl}
              className="font-medium text-mayfipay-blue hover:underline transition-colors"
            >
              Inscrivez-vous
            </a>
          </p>
        </div>

        {/* Bottom badge */}
        <div className="flex items-center justify-center gap-2 px-8 py-4 bg-mayfipay-blue-lighter border-t border-mayfipay-border-light">
          <Shield size={14} className="text-mayfipay-blue" />
          <span className="text-xs text-mayfipay-text-sec">
            Sécurisé · Fiable · Rapide
          </span>
        </div>
      </div>
    </div>
  );
}
