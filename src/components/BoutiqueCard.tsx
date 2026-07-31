import { Link } from 'react-router-dom';
import { Store, MapPin, Package } from 'lucide-react';
import type { Boutique } from '../types';

interface Props {
  boutique: Boutique;
}

export default function BoutiqueCard({ boutique }: Props) {
  return (
    <Link
      to={`/boutique/${boutique.slug}`}
      className="group rounded-xl border border-mayfipay-border bg-mayfipay-card p-5 shadow-sm hover:shadow-md transition-all"
    >
      <div className="flex items-start gap-4">
        {boutique.logo_url ? (
          <img
            src={boutique.logo_url}
            alt={boutique.nom}
            className="h-14 w-14 rounded-xl object-cover"
          />
        ) : (
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-mayfipay-orange-light">
            <Store className="h-7 w-7 text-mayfipay-orange" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-mayfipay-text group-hover:text-mayfipay-orange transition-colors truncate">
            {boutique.nom}
          </h3>
          {boutique.vendeur && (
            <p className="text-sm text-mayfipay-text-sec truncate">
              {boutique.vendeur.nom}
            </p>
          )}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-mayfipay-text-sec">
        {boutique.ville && (
          <div className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            <span>{boutique.ville}</span>
          </div>
        )}
        <div className="flex items-center gap-1">
          <Package className="h-3.5 w-3.5" />
          <span>{boutique.nb_produits || 0} produits</span>
        </div>
      </div>

      {boutique.description && (
        <p className="mt-2 text-sm text-mayfipay-text-muted line-clamp-2">
          {boutique.description}
        </p>
      )}
    </Link>
  );
}