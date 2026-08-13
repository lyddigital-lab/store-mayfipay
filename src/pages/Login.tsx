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

  const ssoUrl = `https://app.mayfipay.com/login?redirect=${encodeURIComponent(window.location.origin + '/sso')}&source=store&intent=buyer`;

        return (
    <div className="w-full max-w-md mx-auto">
      {/* Premium minimalist card */}
      <div className="bg-white rounded-[28px] shadow-[0_4px_24px_rgba(15,23,42,0.04)] border border-mayfipay-border-light overflow-hidden">
        {/* Top accent */}
        <div className="px-8 py-8 sm:px-10 sm:py-10">
          {/* Small MayfiPay icon */}
          <div className="flex justify-center mb-6">
            <MayfiPayLogo size={44} />
          </div>

          {/* Title */}
          <h1 className="text-[38px] sm:text-[44px] font-extrabold text-mayfipay-text text-center leading-tight mb-2">
            Connectez-vous à votre compte
          </h1>

          {/* Inscription link */}
          <p className="text-center text-sm text-mayfipay-text-sec mb-8">
            Vous n’avez pas de compte ?{' '}
            <a
              href="/register"
              className="font-medium text-mayfipay-blue hover:underline transition-colors"
            >
              Inscrivez-vous
            </a>
          </p>

          {/* Se connecter avec MayfiPay (SSO) */}
          <a
            href={ssoUrl}
            className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl font-semibold text-mayfipay-text bg-white border border-mayfipay-border hover:bg-gray-50 transition-all duration-150 shadow-[0_1px_3px_rgba(15,23,42,0.04)]"
          >
            <MayfiPayLogo size={20} />
            <span>Se connecter avec MayfiPay</span>
          </a>

          {/* Separator */}
          <div className="flex items-center my-6">
            <div className="flex-1 h-px bg-mayfipay-border-light"></div>
            <span className="px-4 text-xs text-mayfipay-text-muted font-medium">Ou</span>
            <div className="flex-1 h-px bg-mayfipay-border-light"></div>
          </div>

          {/* Se connecter (vendor) */}
          <a
            href="/vendeur/login"
            className="w-full flex items-center justify-center py-3.5 px-4 rounded-xl font-semibold text-white bg-mayfipay-blue hover:bg-mayfipay-blue-hover transition-all duration-150 shadow-[0_4px_12px_rgba(11,136,229,0.25)]"
          >
            <span>Se connecter</span>
          </a>
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