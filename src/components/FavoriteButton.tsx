import { useState } from 'react';
import { Heart, Heart as HeartFilled } from 'lucide-react';
import {
  ajouterProduitFavori,
  retirerProduitFavori,
  estProduitFavori,
} from '../lib/supabase';
import { showSuccess, showError } from '../lib/toast';
import { getAcheteurSession } from '../lib/supabase';

interface FavoriteButtonProps {
  produitId: string;
  taille?: 'sm' | 'md' | 'lg';
  afficherTexte?: boolean;
}

const tailleMap: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
};

export default function FavoriteButton({
  produitId,
  taille = 'md',
  afficherTexte = true,
}: FavoriteButtonProps) {
  const [estFavori, setEstFavori] = useState<boolean>(false);
  const [chargement, setChargement] = useState<boolean>(false);
  const session = getAcheteurSession();

  // Vérifier si déjà en favori au montage
  const verifierFavori = async () => {
    if (!session || !produitId) return;
    try {
      const estFav = await estProduitFavori(produitId, session.id);
      setEstFavori(estFav);
    } catch {
      // Silent fail, affichera l'état non favori par défaut
    }
  };

  // Appel au premier rendu
  if (session && produitId) {
    verifierFavori();
  }

  const toggleFavori = async () => {
    if (!session) {
      showError('Connexion requise', 'Connectez-vous pour ajouter aux favoris.');
      return;
    }
    if (!produitId) return;

    setChargement(true);
    try {
      if (estFavori) {
        await retirerProduitFavori(produitId, session.id);
        setEstFavori(false);
        showSuccess('Retiré des favoris', 'Produit retiré de vos favoris.');
      } else {
        await ajouterProduitFavori(produitId, session.id);
        setEstFavori(true);
        showSuccess('Ajouté aux favoris', 'Produit ajouté à vos favoris.');
      }
    } catch (err: any) {
      showError('Erreur', 'Impossible de modifier les favoris.');
    } finally {
      setChargement(false);
    }
  };

  const { w, h } = { w: tailleMap[taille], h: tailleMap[taille] };

  return (
    <button
      type="button"
      onClick={toggleFavori}
      disabled={chargement}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
        estFavori
          ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
          : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50 hover:text-mayfipay-orange'
      }`}
      aria-label={estFavori ? 'Retirer des favoris' : 'Ajouter aux favoris'}
    >
      <Heart
        className={`${w} ${h} ${estFavori ? 'fill-red-500' : 'fill-current'}`}
        fill={estFavori ? 'red-500' : 'currentColor'}
      />
      {afficherTexte && (
        <span className={estFavori ? 'text-red-600' : 'text-gray-500'}>
          {estFavori ? 'Retirer' : 'Favori'}
        </span>
      )}
      {chargement && <span className="text-xs">...</span>}
    </button>
  );
}
