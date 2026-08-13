import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function SSOCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState('');

  useEffect(() => {
    const ssoData = searchParams.get('sso');
    const redirect = searchParams.get('redirect') || '/';

    if (!ssoData) {
      setError('Aucune session SSO trouvée');
      return;
    }

    try {
      // Décoder les données utilisateur envoyées par MayfiPay
      const userData = JSON.parse(decodeURIComponent(ssoData));

      if (!userData.id || !userData.nom || !userData.tel) {
        setError('Session SSO invalide');
        return;
      }

      const role = userData.role || 'acheteur';

      // Créer la session dans le store selon le rôle
      if (role === 'vendeur') {
        localStorage.setItem('store_vendeur_user', JSON.stringify({
          id: userData.id,
          nom: userData.nom,
          tel: userData.tel,
          role: 'vendeur',
          pays: userData.pays || '',
          photo: userData.photo || '',
        }));
        localStorage.removeItem('store_acheteur_user');
      } else {
        localStorage.setItem('store_acheteur_user', JSON.stringify({
          id: userData.id,
          nom: userData.nom,
          tel: userData.tel,
          role: 'acheteur',
          pays: userData.pays || '',
          photo: userData.photo || '',
        }));
        localStorage.removeItem('store_vendeur_user');
      }

      // Acheteur : revenir à la page mémorisée avant le login (ex: paiement en cours)
      let buyerTarget = '/';
      const saved = localStorage.getItem('store_redirect');
      localStorage.removeItem('store_redirect');
      if (saved && saved.startsWith('/') && !saved.startsWith('//')) buyerTarget = saved;

      // Redirection automatique après 3 secondes
      const target = role === 'vendeur' ? (redirect === '/' ? '/vendeur' : redirect) : buyerTarget;
      setTimeout(() => navigate(target, { replace: true }), 3000);
    } catch (e) {
      setError('Erreur lors de la lecture de la session');
      console.error('SSO parse error:', e);
    }
  }, [searchParams, navigate]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 shadow-lg max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">⚠️</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Erreur de connexion</h1>
          <p className="text-gray-500 mb-6">{error}</p>
          <a
            href="/login"
            className="inline-block w-full py-3 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition"
          >
            Retour à la connexion
          </a>
        </div>
      </div>
    );
  }

  // Écran de transition : Logo MayfiPay → Sync verte animée → Logo Store
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Les 3 éléments alignés horizontalement */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {/* Logo MayfiPay (gauche) */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-14 h-14 rounded-2xl bg-gray-900 flex items-center justify-center shadow-lg">
              <span className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-white font-black text-sm">M</span>
            </div>
            <span className="text-xs font-semibold text-gray-600">MayfiPay</span>
          </div>

          {/* Trait fin + icône sync */}
          <div className="flex items-center">
            <div className="w-8 h-px bg-gray-200"></div>
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mx-1">
              <svg className="w-5 h-5 text-green-600 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 12a9 9 0 1 1-2.64-6.36" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="w-8 h-px bg-gray-200"></div>
          </div>

          {/* Logo Store (droite) */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-14 h-14 rounded-2xl bg-orange-500 flex items-center justify-center shadow-lg">
              <span className="text-white font-black text-sm">S</span>
            </div>
            <span className="text-xs font-semibold text-gray-600">Store</span>
          </div>
        </div>

        <p className="text-center text-gray-600 text-base leading-relaxed">
          Vous êtes en train de vous connecter au Store avec votre compte MayfiPay.
          <br />
          Cette connexion est automatique.
        </p>
      </div>
    </div>
  );
}