import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, ShieldCheck, Clock, CheckCircle2, XCircle, ExternalLink, Store } from 'lucide-react';
import { getAcheteurSession } from '../lib/supabase';
import { getKycStatus } from '../lib/kyc';
import { persistVendeurSession } from '../lib/session';
import type { KycStatus } from '../lib/kyc';
import MayfiPayLogo from '../components/MayfiPayLogo';

const APP_URL = 'https://app.mayfipay.com';

const AVANTAGES = [
  { emoji: '💰', titre: 'Paiement sécurisé', desc: 'Vos ventes sont protégées par le Coffre-fort MayfiPay.' },
  { emoji: '📱', titre: 'Partagez facilement', desc: 'Créez des liens et des QR codes pour vos produits.' },
  { emoji: '💳', titre: 'Retirez rapidement', desc: 'Recevez votre argent sur Mobile Money (MTN, Airtel...).' },
];

const ETAPES = [
  'Allez sur app.mayfipay.com',
  'Complétez votre vérification d’identité (KYC)',
  'Attendez la validation (généralement rapide)',
  'Une fois vérifié, créez votre boutique et vos produits',
];

export default function DevenirVendeur() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<KycStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const session = getAcheteurSession();

  useEffect(() => {
    let active = true;
    if (!session) {
      setLoading(false);
      return;
    }
    getKycStatus(session.id)
      .then((s) => { if (active) setStatus(s); })
      .catch(() => { if (active) setStatus({ etape: 'none', kycVerified: false }); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  function goEspaceVendeur() {
    if (session) {
      persistVendeurSession({ id: session.id, nom: session.nom, tel: session.tel, role: 'vendeur' });
    }
    navigate('/vendeur');
  }

  const etape = status?.etape || 'none';

  return (
    <div className="min-h-screen bg-mayfipay-bg flex flex-col">
      {/* En-tête */}
      <header className="bg-white border-b border-mayfipay-border-light">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <MayfiPayLogo size={36} />
            <span className="text-xl font-bold text-mayfipay-text">MAYFIPAY <span className="font-normal">STORE</span></span>
          </Link>
          <Link to="/" className="flex items-center gap-1 text-sm font-medium text-mayfipay-text-sec hover:text-mayfipay-blue transition-colors">
            <ChevronLeft size={16} /> Accueil
          </Link>
        </div>
      </header>

      <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-10">
        {/* Titre */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-mayfipay-orange text-white mb-4">
            <Store size={32} />
          </div>
          <h1 className="text-3xl font-extrabold text-mayfipay-text">Devenir vendeur sur MayfiPay</h1>
          <p className="text-mayfipay-text-sec mt-2">Vendez vos produits en toute sécurité, en Afrique.</p>
        </div>

        {!session ? (
          /* État : non connecté */
          <div className="bg-white rounded-3xl border border-mayfipay-border-light p-8 text-center">
            <p className="text-mayfipay-text-sec mb-6">
              Connectez-vous avec votre compte MayfiPay pour commencer votre parcours de vendeur.
            </p>
            <Link
              to="/login?redirect=/devenir-vendeur"
              className="inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-semibold text-white bg-mayfipay-orange hover:bg-mayfipay-orange-dark transition-colors"
            >
              <MayfiPayLogo size={22} /> Se connecter avec MayfiPay
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Carte avantages */}
            <div className="grid sm:grid-cols-3 gap-4">
              {AVANTAGES.map((a, i) => (
                <div key={i} className="bg-white rounded-2xl border border-mayfipay-border-light p-5">
                  <div className="text-3xl mb-3">{a.emoji}</div>
                  <p className="font-semibold text-mayfipay-text">{a.titre}</p>
                  <p className="text-sm text-mayfipay-text-sec mt-1">{a.desc}</p>
                </div>
              ))}
            </div>

            {/* Comment ça marche */}
            <div className="bg-white rounded-3xl border border-mayfipay-border-light p-7">
              <h2 className="font-bold text-mayfipay-text mb-5 text-lg">Comment ça marche ?</h2>
              <ol className="space-y-3">
                {ETAPES.map((e, i) => (
                  <li key={i} className="flex gap-3 items-start">
                    <span className="flex items-center justify-center w-7 h-7 rounded-full bg-mayfipay-orange text-white text-sm font-bold shrink-0">{i + 1}</span>
                    <span className="text-mayfipay-text-sec">{e}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Bloc statut KYC */}
            {loading ? (
              <div className="bg-white rounded-3xl border border-mayfipay-border-light p-8 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mayfipay-orange"></div>
              </div>
            ) : etape === 'verified' ? (
              <div className="bg-green-50 border border-green-200 rounded-3xl p-8 text-center">
                <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-3" />
                <h2 className="text-xl font-bold text-mayfipay-text">KYC vérifié — Vous êtes désormais vendeur 🎉</h2>
                <p className="text-sm text-mayfipay-text-sec mt-2 mb-6">
                  Votre identité est confirmée. Accédez à votre espace vendeur pour créer votre boutique et vos produits.
                </p>
                <button
                  onClick={goEspaceVendeur}
                  className="inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-semibold text-white bg-mayfipay-orange hover:bg-mayfipay-orange-dark transition-colors"
                >
                  <Store size={20} /> Accéder à mon espace vendeur
                </button>
              </div>
            ) : etape === 'pending' ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-3xl p-8 text-center">
                <Clock className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
                <h2 className="text-xl font-bold text-mayfipay-text">Votre KYC est en cours de validation</h2>
                <p className="text-sm text-mayfipay-text-sec mt-2 mb-4">
                  Votre demande a bien été reçue. Merci de patienter — vous serez vendeur dès sa validation.
                </p>
                <a href={APP_URL} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-mayfipay-orange hover:underline">
                  Voir le statut sur app.mayfipay.com <ExternalLink size={14} />
                </a>
              </div>
            ) : etape === 'rejected' ? (
              <div className="bg-red-50 border border-red-200 rounded-3xl p-8 text-center">
                <XCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                <h2 className="text-xl font-bold text-mayfipay-text">Votre demande a été refusée</h2>
                <p className="text-sm text-mayfipay-text-sec mt-2 mb-6">
                  Pas d’inquiétude, vous pouvez soumettre de nouveaux documents depuis l’application MayfiPay.
                </p>
                <a href={APP_URL} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-semibold text-white bg-mayfipay-orange hover:bg-mayfipay-orange-dark transition-colors">
                  Recommencer ma vérification <ExternalLink size={16} />
                </a>
              </div>
            ) : (
              /* État : à faire (none) */
              <div className="bg-white rounded-3xl border border-mayfipay-border-light p-8 text-center">
                <ShieldCheck className="w-12 h-12 text-mayfipay-orange mx-auto mb-3" />
                <h2 className="text-xl font-bold text-mayfipay-text">Commencez votre vérification d’identité</h2>
                <p className="text-sm text-mayfipay-text-sec mt-2 mb-6">
                  Pour vendre sur le Store, une vérification d’identité (KYC) est obligatoire. Elle se fait en quelques minutes sur l’application MayfiPay.
                </p>
                <a href={APP_URL} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-semibold text-white bg-mayfipay-orange hover:bg-mayfipay-orange-dark transition-colors">
                  <ShieldCheck size={20} /> Commencer ma vérification (KYC) <ExternalLink size={16} />
                </a>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-mayfipay-border-light mt-auto">
        <div className="max-w-3xl mx-auto px-4 py-5 text-center text-xs text-mayfipay-text-muted">
          © 2026 MayfiPay — Paiements sécurisés en Afrique
        </div>
      </footer>
    </div>
  );
}

