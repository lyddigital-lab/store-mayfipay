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
        }));
        localStorage.removeItem('store_acheteur_user');
        navigate(redirect === '/' ? '/vendeur' : redirect, { replace: true });
      } else {
        localStorage.setItem('store_acheteur_user', JSON.stringify({
          id: userData.id,
          nom: userData.nom,
          tel: userData.tel,
          role: 'acheteur',
          pays: userData.pays || '',
        }));
        localStorage.removeItem('store_vendeur_user');
        navigate(redirect, { replace: true });
      }
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

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 shadow-lg max-w-md w-full text-center">
        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Connexion en cours...</h1>
        <p className="text-gray-500">Authentification avec MayfiPay</p>
      </div>
    </div>
  );
}