import { useState, useEffect } from 'react';
import { getVendeurSession, getBoutiqueByVendeur, updateBoutique, getLivreursDisponibles, assignerLivreur } from '../../lib/supabase';
import type { Boutique } from '../../types';

export default function VendeurParametres() {
  const [boutique, setBoutique] = useState<Boutique | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [livreurs, setLivreurs] = useState<any[]>([]);
  const [form, setForm] = useState({ nom: '', description: '', ville: '', delai_livraison: '24-48h', active: false, logo_url: '' });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const session = getVendeurSession();
      if (!session) return;
      const b = await getBoutiqueByVendeur(session.id);
      setBoutique(b);
      if (b) setForm({
        nom: b.nom, description: b.description || '', ville: b.ville || '',
        delai_livraison: b.delai_livraison, active: b.active, logo_url: b.logo_url || ''
      });
      const l = await getLivreursDisponibles();
      setLivreurs(l);
    } catch (err) { console.error('Erreur:', err); }
    finally { setLoading(false); }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!boutique) return;
    setSaving(true);
    try {
      await updateBoutique(boutique.id, { ...form, slug: boutique.slug });
      setBoutique({ ...boutique, ...form });
      alert('Boutique mise à jour !');
    } catch (err) { console.error('Erreur:', err); alert('Erreur.'); }
    finally { setSaving(false); }
  }

  async function handleAssignLivreur(livreurId: string) {
    if (!boutique) return;
    await assignerLivreur(boutique.id, livreurId);
    setBoutique({ ...boutique, livreur_id: livreurId });
  }

  if (loading) return <div className="p-8">Chargement...</div>;

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-2xl font-bold text-mayfipay-text mb-6">Paramètres de la boutique</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-lg border border-mayfipay-border bg-white p-6">
          <h2 className="font-semibold text-mayfipay-text mb-4">Informations</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-mayfipay-text mb-1">Nom de la boutique</label>
              <input type="text" required value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })}
                className="w-full rounded-lg border border-mayfipay-border px-3 py-2 text-sm focus:border-mayfipay-orange focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-mayfipay-text mb-1">Description</label>
              <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3}
                className="w-full rounded-lg border border-mayfipay-border px-3 py-2 text-sm focus:border-mayfipay-orange focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-mayfipay-text mb-1">Ville</label>
              <input type="text" value={form.ville} onChange={e => setForm({ ...form, ville: e.target.value })}
                className="w-full rounded-lg border border-mayfipay-border px-3 py-2 text-sm focus:border-mayfipay-orange focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-mayfipay-text mb-1">Délai de livraison</label>
              <input type="text" value={form.delai_livraison} onChange={e => setForm({ ...form, delai_livraison: e.target.value })}
                className="w-full rounded-lg border border-mayfipay-border px-3 py-2 text-sm focus:border-mayfipay-orange focus:outline-none" placeholder="24-48h" />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={form.active} onChange={e => setForm({ ...form, active: e.target.checked })}
                className="w-4 h-4 rounded border-mayfipay-border text-mayfipay-orange focus:ring-mayfipay-orange" />
              <label className="text-sm text-mayfipay-text">Boutique publique sur le store</label>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-mayfipay-border bg-white p-6">
          <h2 className="font-semibold text-mayfipay-text mb-4">Livreur assigné</h2>
          <select onChange={e => e.target.value && handleAssignLivreur(e.target.value)}
            className="w-full rounded-lg border border-mayfipay-border px-3 py-2 text-sm focus:border-mayfipay-orange focus:outline-none">
            <option value="">Sélectionner un livreur</option>
            {livreurs.map(l => (
              <option key={l.id} value={l.id}>{l.nom} ({l.tel})</option>
            ))}
          </select>
          {boutique?.livreur_id && (
            <p className="mt-2 text-sm text-mayfipay-text-sec">
              Livreur actuel : {livreurs.find(l => l.id === boutique.livreur_id)?.nom || '—'}
            </p>
          )}
        </div>

        <button type="submit" disabled={saving}
          className="rounded-lg bg-mayfipay-orange px-6 py-3 text-sm font-medium text-white hover:bg-mayfipay-orange-dark disabled:opacity-60 transition-colors">
          {saving ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </form>
    </div>
  );
}
