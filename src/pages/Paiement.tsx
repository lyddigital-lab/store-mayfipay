import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase, creerOuTrouverAcheteur, creerCommande, getProduitDetail, checkDisponibiliteVille } from '../lib/supabase';
import { formatPrix } from '../utils/helpers';
import type { Produit, ExpeditionInfo } from '../types';

export default function Paiement() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const produitId = searchParams.get('produit_id');
  const villePreselected = searchParams.get('ville');
  const [produit, setProduit] = useState<Produit | null>(null);
  const [loading, setLoading] = useState(!!produitId);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ nom: '', tel: '', ville: '', quartier: '' });
  const [expeditionInfo, setExpeditionInfo] = useState<ExpeditionInfo | null>(null);

  useEffect(() => {
    if (produitId) loadProduit();
  }, [produitId]);

  // Pré-remplir la ville si elle vient de l'URL
  useEffect(() => {
    if (villePreselected && !form.ville) {
      setForm(prev => ({ ...prev, ville: villePreselected }));
    }
  }, [villePreselected]);

  // Vérifier la disponibilité quand la ville change
  useEffect(() => {
    if (produit && form.ville) {
      const info = checkDisponibiliteVille(produit, form.ville);
      setExpeditionInfo(info);
    } else {
      setExpeditionInfo(null);
    }
  }, [form.ville, produit]);

  async function loadProduit() {
    try {
      const p = await getProduitDetail(produitId!);
      setProduit(p);
    } catch (err) {
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!produit || !form.nom || !form.tel || !form.ville || !form.quartier) return;
    if (expeditionInfo && !expeditionInfo.disponible) return;

    setSubmitting(true);
    try {
      const acheteurId = await creerOuTrouverAcheteur(form.tel, form.nom);
      const commande = await creerCommande({
        produit_id: produit.id,
        acheteur_id: acheteurId,
        vendeur_id: produit.vendeur_id,
        montant: produit.prix,
        adresse_livraison: { nom: form.nom, tel: form.tel, ville: form.ville, quartier: form.quartier },
      });
      await supabase.from('notifications').insert({
        user_id: acheteurId,
        title: 'Commande créée',
        body: `Votre commande ${commande.code} a été créée. Téléchargez l'app MayfiPay pour suivre votre commande.`,
        data: { type: 'commande', commande_id: commande.id },
      });
      navigate(`/succes?code=${commande.code}`);
    } catch (err) {
      console.error('Erreur:', err);
      alert('Erreur lors de la création de la commande.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="max-w-2xl mx-auto px-4 py-16 text-center">Chargement...</div>;
  if (!produit) return <div className="max-w-2xl mx-auto px-4 py-16 text-center">Produit introuvable.</div>;

  // Villes disponibles (depuis villes_vente du produit)
  const villesDisponibles = (produit.villes_vente || []).map(v => v.ville);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-mayfipay-text mb-6">Finaliser votre achat</h1>
      <div className="mb-6 rounded-lg border border-mayfipay-border bg-white p-4">
        <h2 className="font-semibold text-mayfipay-text">{produit.nom}</h2>
        <p className="text-mayfipay-orange font-bold">{formatPrix(produit.prix)}</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-mayfipay-text mb-1">Nom complet *</label>
          <input type="text" required value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })}
            className="w-full rounded-lg border border-mayfipay-border px-3 py-2 text-sm focus:border-mayfipay-orange focus:outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-mayfipay-text mb-1">Téléphone *</label>
          <input type="tel" required value={form.tel} onChange={e => setForm({ ...form, tel: e.target.value })}
            className="w-full rounded-lg border border-mayfipay-border px-3 py-2 text-sm focus:border-mayfipay-orange focus:outline-none" placeholder="+242 06 00 00 00" />
        </div>
        <div>
          <label className="block text-sm font-medium text-mayfipay-text mb-1">Ville *</label>
          {villesDisponibles.length > 0 ? (
            <select
              required
              value={form.ville}
              onChange={e => setForm({ ...form, ville: e.target.value })}
              className="w-full rounded-lg border border-mayfipay-border px-3 py-2 text-sm focus:border-mayfipay-orange focus:outline-none"
            >
              <option value="">Choisir une ville</option>
              {villesDisponibles.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          ) : (
            <input type="text" required value={form.ville} onChange={e => setForm({ ...form, ville: e.target.value })}
              className="w-full rounded-lg border border-mayfipay-border px-3 py-2 text-sm focus:border-mayfipay-orange focus:outline-none" />
          )}
          {/* Info expédition */}
          {expeditionInfo && (
            <p className={`mt-1 text-xs ${expeditionInfo.disponible ? 'text-green-600' : 'text-red-500'}`}>
              {expeditionInfo.message}
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-mayfipay-text mb-1">Quartier *</label>
          <input type="text" required value={form.quartier} onChange={e => setForm({ ...form, quartier: e.target.value })}
            className="w-full rounded-lg border border-mayfipay-border px-3 py-2 text-sm focus:border-mayfipay-orange focus:outline-none" />
        </div>
        <button type="submit" disabled={submitting || (expeditionInfo !== null && !expeditionInfo.disponible)}
          className="w-full rounded-lg bg-mayfipay-orange px-6 py-3 text-sm font-medium text-white hover:bg-mayfipay-orange-dark disabled:opacity-60 transition-colors">
          {submitting ? 'Création...' : `Payer ${formatPrix(produit.prix)}`}
        </button>
      </form>
    </div>
  );
}
