import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Produit } from '../types';
import { formatPrix } from '../utils/helpers';
import { Package } from 'lucide-react';

export default function ProductCard({ produit, boutiqueSlug }: { produit: Produit; boutiqueSlug?: string }) {
  const [imgError, setImgError] = useState(false);
  const imageUrl = (produit.photos && produit.photos[0]) || produit.image_url || produit.photo;
  const link = boutiqueSlug
    ? `/boutique/${boutiqueSlug}/produit/${produit.id}`
    : `/produit/${produit.id}`;

  const hasValidImage = !!imageUrl && !imgError;

  return (
    <Link to={link} className="group block bg-white rounded-xl border border-gray-100 p-2.5 sm:p-3 hover:border-orange-200 hover:shadow-md transition-all">
      <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden mb-2.5 relative flex items-center justify-center">
        {hasValidImage ? (
          <img 
            src={imageUrl} 
            alt={produit.nom} 
            onError={() => setImgError(true)}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" 
          />
        ) : (
          <div className="h-full w-full flex flex-col items-center justify-center bg-gradient-to-br from-orange-50/50 to-gray-50 text-gray-400 p-4">
            {produit.emoji ? (
              <span className="text-4xl mb-1">{produit.emoji}</span>
            ) : (
              <Package className="h-10 w-10 text-orange-200 mb-1" />
            )}
            <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">MayfiPay</span>
          </div>
        )}
        {produit.stock !== undefined && produit.stock <= 3 && produit.stock > 0 && (
          <span className="absolute top-2 left-2 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
            Plus que {produit.stock} en stock
          </span>
        )}
      </div>
      {produit.vendeur?.nom && (
        <p className="text-[11px] font-medium text-gray-400 mb-0.5 truncate">{produit.vendeur.nom}</p>
      )}
      <h3 className="text-xs sm:text-sm font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:text-mayfipay-orange transition-colors">
        {produit.nom}
      </h3>
      <p className="text-sm font-extrabold text-gray-900 group-hover:text-mayfipay-orange transition-colors">
        {formatPrix(produit.prix)}
      </p>
    </Link>
  );
}
