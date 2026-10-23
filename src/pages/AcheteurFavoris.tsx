import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, Package } from 'lucide-react';
import { getAcheteurSession } from '../lib/supabase';
import { getFavorisAcheteur, getUserName } from '../lib/supabase';
import { formatPrix } from '../utils/helpers';
import type { Produit } from '../types';

export default function AcheteurFavoris() {
  const [favoris, setFavoris] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const session = getAcheteurSession();

  useEffect(() => {
    if (!session) {
      navigate('/login?redirect=/favoris');
      return;
    }
    loadFavoris();
  }, []);

  async function loadFavoris() {
    if (!session) return;
    try {
      const data = await getFavorisAcheteur(session.id);
      setFavoris(data || []);
    } catch (err) {
      console.error('Erreur chargement favoris:', err);
    } finally {
      setLoading(false);
    }
  }

  async function retirerDuFavoris(produitId: string) {
    if (!session) return;
    try {
      const { retireProduitFavori } = await import('../lib/supabase');
      await retireProduitFavori(produitId, session.id);
      setFavoris(favoris.filter((f) => f.produit_id !== produitId));
    } catch (err) {
      console.error('Erreur:', err);
    }
  }

  if (!session) return null;

  if (loading) return <div className="p-8 text-center">Chargement...</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-mayfipay-text">
          <Heart className="w-5 h-5 text-mayfipay-orange mr-2" />
          Mes favoris
        </h1>
        <Link
          to="/"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-mayfipay-orange text-white text-sm font-medium hover:bg-mayfipay-orange-dark transition"
        >
          <Package className="w-4 h-4" />
          Continuer mes achats
        </Link>
      </div>

      {favoris.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-mayfipay-border">
          <Heart className="w-24 h-24 text-gray-200 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-mayfipay-text mb-2">Aucun favori pour l'instant</h3>
          <p className="text-mayfipay-text-sec mb-6">
            Ajoutez des produits à vos favoris en cliquant sur le cœur sur les fiches produits.
          </p>
          <Link
            to="/"
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-mayfipay-orange text-white text-sm font-medium hover:bg-mayfipay-orange-dark transition"
          >
            <Package className="w-4 h-4" />
            Découvrir les produits
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {favoris.map((f: any) => {
            const produit = f.produit;
            if (!produit) return null;
            return (
              <div key={f.id} className="group relative bg-white rounded-xl border border-mayfipay-border p-4 hover:shadow-md transition">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const { retirerProduitFavori } = require('../lib/supabase');
                    retirerProduitFavori(produit.id, session.id);
                    setFavoris(favoris.filter((f: any) => f.produit_id !== produit.id));
                  }}
                  className="absolute top-2 right-2 bg-red-50 text-red-600 rounded-full p-1.5 hover:bg-red-100 transition"
                >
                  <Heart className="w-4 h-4 fill-red-500" />
                </button>
                <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden mb-2.5 flex items-center justify-center">
                  {(produit.photos?.[0] || produit.image_url || produit.photo) ? (
                    <img
                      src={produit.photos?.[0] || produit.image_url || produit.photo}
                      alt={produit.nom}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl">{produit.emoji || '📦'}</span>
                  )}
                </div>
                <h3 className="font-semibold text-mayfipay-text text-sm mb-1 line-clamp-2">{produit.nom}</h3>
                <p className="text-sm font-extrabold text-mayfipay-orange">{formatPrix(produit.prix)}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs text-mayfipay-text-muted">
                    {produit.stock > 0 ? 'En stock' : 'Rupture'}
                  </span>
                  <Link
                    to={`/produit/${produit.id}`}
                    className="text-xs text-mayfipay-orange font-medium hover:underline"
                  >
                    Voir
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
