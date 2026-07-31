import { Link } from 'react-router-dom';
import type { Produit } from '../types';
import { formatPrix } from '../utils/helpers';

export default function ProductCard({ produit, boutiqueSlug }: { produit: Produit; boutiqueSlug?: string }) {
  const imageUrl = (produit.photos && produit.photos[0]) || produit.image_url || produit.photo;
  const link = boutiqueSlug
    ? `/boutique/${boutiqueSlug}/produit/${produit.id}`
    : `/produit/${produit.id}`;

  return (
    <Link to={link} className="group block">
      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-3">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={produit.nom} 
            className="h-full w-full object-cover group-hover:opacity-90 transition-opacity" 
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <span className="text-5xl">{produit.emoji || '📦'}</span>
          </div>
        )}
      </div>
      {produit.vendeur?.nom && (
        <p className="text-xs text-gray-500 mb-1">{produit.vendeur.nom}</p>
      )}
      <h3 className="text-sm font-medium text-gray-900 mb-1 line-clamp-2">
        {produit.nom}
      </h3>
      <p className="text-sm text-gray-700 group-hover:text-mayfipay-orange transition-colors">
        {formatPrix(produit.prix)}
      </p>
    </Link>
  );
}
