import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getProduitDetail, checkDisponibiliteVille, getAcheteurSession } from '../lib/supabase';
import { formatPrix } from '../utils/helpers';
import type { Produit, ExpeditionInfo } from '../types';
import { Shield, Lock } from 'lucide-react';

export default function Paiement() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const produitId = searchParams.get('produit_id');
  const villePreselected = searchParams.get('ville') || '';

  const [produit, setProduit] = useState<Produit | null>(null);
  const [loading, setLoading] = useState(!!produitId);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const session = getAcheteurSession();

  // Livraison
  const [selectedVille, setSelectedVille] = useState(villePreselected);
  const [quartier, setQuartier] = useState('');
  const [expeditionInfo, setExpeditionInfo] = useState<ExpeditionInfo | null>(null);

  // Villes du produit uniquement
  const villesDisponibles = (produit?.villes_vente || []);
  const villesNoms = villesDisponibles.map(v => v.ville);

  const fraisExpedition = expeditionInfo?.cout || 0;
  const fraisAcheteur = produit ? Math.round(produit.prix * 0.035) : 0;
  const total = produit ? produit.prix + fraisAcheteur + fraisExpedition : 0;

  useEffect(() => {
    // Rediriger si pas connecté
    if (!session) {
      navigate(`/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`, { replace: true });
      return;
    }
    if (produitId) loadProduit();
  }, [produitId]);

  useEffect(() => {
    if (produit && selectedVille) {
      const info = checkDisponibiliteVille(produit, selectedVille);
      setExpeditionInfo(info);
    } else {
      setExpeditionInfo(null);
    }
  }, [selectedVille, produit]);

  async function loadProduit() {
    try {
      const p = await getProduitDetail(produitId!);
      setProduit(p);
    } catch {
      console.error('Erreur chargement produit');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!produit || !session) return;
    if (!selectedVille) { setError('Choisissez votre ville de livraison'); return; }
    if (expeditionInfo && !expeditionInfo.disponible) { setError('Ce produit n\'est pas disponible dans cette ville'); return; }

    setError('');
    setSubmitting(true);

    try {
      const adresse = `${quartier ? quartier + ', ' : ''}${selectedVille}`;
      const phone = '+' + session.tel;

      const MAYFIPAY_API_KEY = import.meta.env.VITE_MAYFIPAY_API_KEY;

      const res = await fetch('https://api.mayfipay.com/v1/payments', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${MAYFIPAY_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: total,
          currency: 'XAF',
          external_id: `store_${session.id}_${produit.id}_${Date.now()}`,
          description: `Achat: ${produit.nom}`,
          customer: {
            phone: phone,
            name: session.nom,
          },
          return_url: `${window.location.origin}/succes`,
          metadata: {
            produit_id: produit.id,
            vendeur_id: produit.vendeur_id,
            acheteur_id: session.id,
            acheteur_tel: session.tel,
            adresse_livraison: adresse,
            prix_produit: produit.prix,
            frais_acheteur: fraisAcheteur,
            source: 'store',
          },
        }),
      });

      const data = await res.json();
      if (!data?.success) throw new Error(data?.error || 'Erreur lors du paiement');

      const checkoutUrl = data?.data?.checkout_url;
      if (!checkoutUrl) throw new Error('Lien de paiement non reçu');

      window.location.href = checkoutUrl;
    } catch (err: any) {
      setError(err.message || 'Erreur');
      setSubmitting(false);
    }
  }

  if (!session) return null;
  if (loading) return <div className="max-w-2xl mx-auto px-4 py-16 text-center">Chargement...</div>;
  if (!produit) return <div className="max-w-2xl mx-auto px-4 py-16 text-center">Produit introuvable.</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold text-mayfipay-text mb-6">Finaliser votre achat</h1>

      {/* Récap produit */}
      <div className="mb-6 rounded-xl border border-mayfipay-border bg-white p-4">
        <div className="flex gap-4 items-center">
          <div className="w-16 h-16 rounded-lg bg-mayfipay-border-light flex items-center justify-center overflow-hidden shrink-0">
            {(produit.photos?.[0] || produit.image_url) ? (
              <img src={produit.photos?.[0] || produit.image_url!} alt={produit.nom} className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl">{produit.emoji || '📦'}</span>
            )}
          </div>
          <div className="flex-1">
            <p className="font-semibold text-mayfipay-text">{produit.nom}</p>
            <p className="text-sm text-mayfipay-text-sec">{produit.vendeur?.nom}</p>
          </div>
          <p className="text-lg font-black text-mayfipay-orange">{formatPrix(produit.prix)}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Acheteur connecté */}
        <div className="rounded-xl border border-mayfipay-border bg-white p-5">
          <h2 className="font-semibold text-mayfipay-text mb-3">Vos informations</h2>
          <div className="flex items-center gap-3 bg-orange-50 rounded-lg p-3">
            <div className="w-10 h-10 rounded-full bg-mayfipay-orange flex items-center justify-center text-white font-bold shrink-0">
              {session.nom.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-mayfipay-text text-sm">{session.nom}</p>
              <p className="text-xs text-mayfipay-text-sec">+{session.tel}</p>
            </div>
            <button type="button" onClick={() => navigate('/login?redirect=' + encodeURIComponent(window.location.pathname + window.location.search))}
              className="ml-auto text-xs text-mayfipay-orange hover:underline">
              Changer de compte
            </button>
          </div>
        </div>

        {/* Livraison */}
        <div className="rounded-xl border border-mayfipay-border bg-white p-5">
          <h2 className="font-semibold text-mayfipay-text mb-4">Adresse de livraison</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-mayfipay-text mb-1.5">Ville *</label>
              {villesNoms.length > 0 ? (
                <select required value={selectedVille} onChange={e => setSelectedVille(e.target.value)}
                  className="w-full rounded-lg border border-mayfipay-border px-3 py-2.5 text-sm focus:border-mayfipay-orange focus:outline-none">
                  <option value="">Choisir une ville</option>
                  {villesNoms.map(v => {
                    const vv = villesDisponibles.find(x => x.ville === v);
                    return <option key={v} value={v}>{v} {vv?.type === 'local' ? '📍' : '🚚'}</option>;
                  })}
                </select>
              ) : (
                <p className="text-sm text-red-500">Ce produit n'est pas encore disponible dans votre ville.</p>
              )}
              {expeditionInfo && (
                <p className={`mt-1.5 text-xs ${expeditionInfo.disponible ? 'text-green-600' : 'text-red-500'}`}>
                  {expeditionInfo.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-mayfipay-text mb-1.5">Quartier / Adresse précise</label>
              <input type="text" value={quartier} onChange={e => setQuartier(e.target.value)}
                placeholder="Ex: Bacongo, près du marché..."
                className="w-full rounded-lg border border-mayfipay-border px-3 py-2.5 text-sm focus:border-mayfipay-orange focus:outline-none" />
            </div>
          </div>
        </div>

        {/* Récap prix */}
        <div className="rounded-xl border border-mayfipay-border bg-white p-5">
          <h2 className="font-semibold text-mayfipay-text mb-3">Récapitulatif</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-mayfipay-text-sec">Prix produit</span>
              <span>{formatPrix(produit.prix)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-mayfipay-text-sec">Frais Mobile Money (3.5%)</span>
              <span>+{formatPrix(fraisAcheteur)}</span>
            </div>
            {fraisExpedition > 0 && (
              <div className="flex justify-between">
                <span className="text-mayfipay-text-sec">Frais d'expédition</span>
                <span>+{formatPrix(fraisExpedition)}</span>
              </div>
            )}
            <div className="border-t border-mayfipay-border mt-2 pt-2 flex justify-between font-bold">
              <span>Total à payer</span>
              <span className="text-mayfipay-orange text-lg">{formatPrix(total)}</span>
            </div>
          </div>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}

        <button type="submit"
          disabled={submitting || !selectedVille || (expeditionInfo !== null && !expeditionInfo?.disponible) || villesNoms.length === 0}
          className="w-full rounded-xl bg-mayfipay-orange px-6 py-4 font-bold text-white hover:bg-mayfipay-orange-dark disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
          <Lock className="h-4 w-4" />
          {submitting ? 'Traitement...' : `Payer ${formatPrix(total)}`}
        </button>

        <div className="flex items-center justify-center gap-2 text-xs text-mayfipay-text-muted">
          <Shield className="h-4 w-4 text-green-500" />
          <span>Paiement sécurisé — votre argent est protégé jusqu'à la livraison</span>
        </div>
      </form>
    </div>
  );
}
