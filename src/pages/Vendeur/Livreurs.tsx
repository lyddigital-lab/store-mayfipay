import { useState, useEffect } from 'react';
import { getVendeurSession, supabase, getLivreursDisponibles, assignerLivreur } from '../../lib/supabase';
import type { Livreur } from '../../types';

export default function VendeurLivreurs() {
  const [livreurs, setLivreurs] = useState<Livreur[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState<string | null>(null);
  const [boutiqueId, setBoutiqueId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const session = getVendeurSession();
      if (!session) return;
      const { data: boutique } = await supabase
        .from('boutiques')
        .select('id, livreur_id')
        .eq('vendeur_id', session.id)
        .maybeSingle();
      if (boutique) setBoutiqueId(boutique.id);
      const l = await getLivreursDisponibles();
      setLivreurs(l);
    } catch (err) { console.error('Erreur:', err); }
    finally { setLoading(false); }
  }

  async function handleAssign(livreurId: string) {
    if (!boutiqueId) return;
    setAssigning(livreurId);
    try {
      await assignerLivreur(boutiqueId, livreurId);
      alert('Livreur assigné !');
    } catch (err) { console.error('Erreur:', err); alert('Erreur.'); }
    finally { setAssigning(null); }
  }

  if (loading) return <div className="p-8">Chargement...</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-mayfipay-text mb-6">Livreurs disponibles</h1>
      <p className="text-sm text-mayfipay-text-sec mb-4">
        Sélectionnez un livreur pour votre boutique.
      </p>
      {livreurs.length === 0 ? (
        <p className="text-mayfipay-text-sec">Aucun livreur disponible.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {livreurs.map(l => (
            <div key={l.id} className="rounded-xl border border-mayfipay-border bg-white p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-mayfipay-orange-light">
                  <span className="text-lg">🚚</span>
                </div>
                <div>
                  <h3 className="font-semibold text-mayfipay-text">{l.nom}</h3>
                  <p className="text-sm text-mayfipay-text-sec">{l.tel}</p>
                </div>
              </div>
              <button
                onClick={() => handleAssign(l.id)}
                disabled={assigning === l.id || !boutiqueId}
                className="w-full rounded-lg bg-mayfipay-orange px-4 py-2 text-sm font-medium text-white hover:bg-mayfipay-orange-dark disabled:opacity-60 transition-colors"
              >
                {assigning === l.id ? 'Assignation...' : 'Assigner à ma boutique'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
