import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { getBoutiqueBySlug, getProduitsBoutique } from '../lib/supabase';
import type { Boutique, BoutiqueProduit } from '../types';

export default function BoutiqueDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [boutique, setBoutique] = useState<Boutique | null>(null);
  const [produits, setProduits] = useState<BoutiqueProduit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) loadBoutique();
  }, [slug]);

  async function loadBoutique() {
    try {
      const b = await getBoutiqueBySlug(slug!);
      setBoutique(b);
      if (b) {
        const p = await getProduitsBoutique(b.id);
        setProduits(p);
      }
    } catch (err) {
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <LoadingSpinner />;
  if (!boutique) return <div className="max-w-6xl mx-auto px-4 py-16 text-center"><p>Boutique introuvable.</p></div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8 flex items-start gap-4">
        {boutique.logo_url ? (
          <img src={boutique.logo_url} alt={boutique.nom} className="h-20 w-20 rounded-xl object-cover" />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-mayfipay-orange-light">
            <span className="text-3xl">🏪</span>
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold text-mayfipay-text">{boutique.nom}</h1>
          {boutique.vendeur && <p className="text-mayfipay-text-sec">Par {boutique.vendeur.nom}</p>}
          {boutique.description && <p className="mt-2 text-sm text-mayfipay-text-sec">{boutique.description}</p>}
          {boutique.ville && <p className="mt-1 text-sm text-mayfipay-text-muted">📍 {boutique.ville}</p>}
          {boutique.delai_livraison && <p className="mt-1 text-sm text-mayfipay-text-muted">🚚 Livraison : {boutique.delai_livraison}</p>}
        </div>
      </div>

      <h2 className="mb-4 text-lg font-semibold text-mayfipay-text">Produits ({produits.length})</h2>
      {produits.length === 0 ? (
        <p className="text-mayfipay-text-sec">Aucun produit disponible.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {produits.map(bp => <ProductCard key={bp.id} produit={bp.produit!} boutiqueSlug={boutique.slug} />)}
        </div>
      )}
    </div>
  );
}
