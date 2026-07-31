import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getVendeurSession, supabase } from '../../lib/supabase';
import { formatPrix } from '../../utils/helpers';
import { Plus, Pencil } from 'lucide-react';
import type { Produit } from '../../types';

export default function VendeurProduits() {
  const navigate = useNavigate();
  const [produits, setProduits] = useState<Produit[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingProduit, setLoadingProduit] = useState<string | null>(null);

  useEffect(() => {
    loadProduits();
  }, []);

  async function loadProduits() {
    try {
      const session = getVendeurSession();
      if (!session) return;
      const { data, error } = await supabase
        .from('produits')
        .select('*')
        .eq('vendeur_id', session.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setProduits(data || []);
    } catch (err) { console.error('Erreur:', err); }
    finally { setLoading(false); }
  }

  async function handleToggle(produitId: string) {
    setLoadingProduit(produitId);
    try {
      const produit = produits.find(p => p.id === produitId);
      if (!produit) return;
      const newVisible = !produit.visible_store;

      // Mettre à jour visible_store sur le produit
      const { error } = await supabase
        .from('produits')
        .update({ visible_store: newVisible })
        .eq('id', produitId);

      if (error) throw error;

      // Mettre à jour le state local
      setProduits(produits.map(p => p.id === produitId ? { ...p, visible_store: newVisible } : p));
    } catch (err) { console.error('Erreur:', err); }
    finally { setLoadingProduit(null); }
  }

  if (loading) return <div className="p-8">Chargement...</div>;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-mayfipay-text">Mes produits</h1>
        <button
          onClick={() => navigate('/vendeur/produit/nouveau')}
          className="flex items-center gap-2 bg-mayfipay-orange text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-mayfipay-orange-dark transition"
        >
          <Plus size={16} />
          Nouveau produit
        </button>
      </div>
      <p className="text-sm text-mayfipay-text-sec mb-4">
        Activez/désactivez la visibilité de chaque produit sur le store.
      </p>
      {produits.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-mayfipay-text-sec mb-4">Vous n'avez aucun produit.</p>
          <button
            onClick={() => navigate('/vendeur/produit/nouveau')}
            className="text-mayfipay-orange font-medium hover:underline"
          >
            Créer mon premier produit →
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {produits.map(p => {
            const photo = (p.photos && p.photos[0]) || p.image_url || p.photo;
            return (
              <div key={p.id} className="rounded-xl border border-mayfipay-border bg-white p-4">
                <div className="aspect-square mb-3 flex items-center justify-center bg-mayfipay-border-light rounded-lg overflow-hidden">
                  {photo ? <img src={photo} alt={p.nom} className="h-full w-full object-cover rounded-lg" /> : <span className="text-3xl">{p.emoji || '📦'}</span>}
                </div>
                <h3 className="font-medium text-mayfipay-text">{p.nom}</h3>
                <p className="text-mayfipay-orange font-bold">{formatPrix(p.prix)}</p>
                <p className="text-xs text-mayfipay-text-muted mt-1">Stock : {p.stock}</p>
                {p.categories && p.categories.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {p.categories.slice(0, 3).map(c => (
                      <span key={c} className="text-xs bg-mayfipay-border-light text-mayfipay-text-sec px-1.5 py-0.5 rounded">{c}</span>
                    ))}
                  </div>
                )}
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => navigate(`/vendeur/produit/${p.id}`)}
                    className="flex-1 flex items-center justify-center gap-1 rounded-lg bg-blue-50 text-blue-600 px-3 py-1.5 text-xs font-medium hover:bg-blue-100 transition"
                  >
                    <Pencil size={12} />
                    Modifier
                  </button>
                  <button
                    onClick={() => handleToggle(p.id)}
                    disabled={loadingProduit === p.id}
                    className={`flex-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                      p.visible_store
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                    }`}
                  >
                    {loadingProduit === p.id ? '...' : (p.visible_store ? '● Visible' : '○ Masqué')}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}