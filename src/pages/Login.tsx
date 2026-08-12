import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getAcheteurSession } from '../lib/supabase';

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  useEffect(() => {
    if (getAcheteurSession()) navigate(redirect, { replace: true });
  }, []);

  const ssoUrl = `https://app.mayfipay.com/login?redirect=${encodeURIComponent(window.location.origin + '/sso')}&source=store&intent=buyer`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500 to-orange-400 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-2xl shadow-lg mb-3 p-2">
            <img src="/logo.png" alt="MayfiPay Store" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-white">MAYFIPAY STORE</h1>
          <p className="text-white/80 text-sm mt-1">Connectez-vous pour acheter</p>
        </div>

        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xl">
          {/* Bouton principal : Se connecter avec MayfiPay */}
          <a
            href={ssoUrl}
            className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl font-bold bg-gray-900 text-white hover:bg-gray-800 transition"
          >
            <span className="w-6 h-6 bg-orange-500 rounded-lg flex items-center justify-center text-white text-xs font-black">M</span>
            Se connecter avec MayfiPay
          </a>

          <p className="text-center text-sm text-gray-500 mt-4">
            <a href={ssoUrl} className="hover:underline">
              Nouveau sur MayfiPay ? Créez votre compte en un clic
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}