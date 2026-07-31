export interface Boutique {
  id: string;
  vendeur_id: string;
  nom: string;
  description: string | null;
  logo_url: string | null;
  ville: string | null;
  zones_livraison: string[];
  delai_livraison: string;
  livreur_id: string | null;
  active: boolean;
  slug: string;
  created_at: string;
  vendeur?: { nom: string; tel: string };
  nb_produits?: number;
}

export interface BoutiqueProduit {
  id: string;
  boutique_id: string;
  produit_id: string;
  visible: boolean;
  ordre: number;
  produit?: Produit;
}

export interface Pays {
  code: string;
  nom: string;
  drapeau: string;
  actif: boolean;
}

export interface Ville {
  id: string;
  pays_code: string;
  nom: string;
  actif: boolean;
}

export interface VilleVente {
  ville_id: string;
  ville: string;
  pays: string;
  type: 'local' | 'expedition';
  cout_mode?: 'fixe' | 'client' | 'gratuit';
  cout_montant?: number;
}

export interface ExpeditionInfo {
  disponible: boolean;
  type?: 'local' | 'expedition';
  message: string;
  cout?: number;
  cout_mode?: 'fixe' | 'client' | 'gratuit';
  ville_vendeur?: string;
}

export interface Produit {
  id: string;
  vendeur_id: string;
  nom: string;
  prix: number;
  description: string | null;
  stock: number;
  categorie: string | null;
  categories: string[];
  emoji: string;
  photo: string | null;
  image_url: string | null;
  photos: string[];
  lien_unique: string | null;
  lien_partage: string | null;
  actif: boolean;
  ville: string | null;
  villes_vente: VilleVente[];
  visible_store: boolean;
  created_at: string;
  vendeur?: { nom: string; tel: string; pays: string | null };
}

export interface Commande {
  id: string;
  code: string;
  produit_id: string;
  acheteur_id: string;
  vendeur_id: string;
  montant: number;
  commission: number;
  montant_net: number;
  statut: string;
  adresse_livraison: {
    nom?: string;
    tel?: string;
    ville: string;
    quartier: string;
  };
  created_at: string;
  date_paiement?: string;
  date_livraison?: string;
  produit?: Produit;
}

export interface User {
  id: string;
  nom: string;
  tel: string;
  email: string | null;
  role: 'acheteur' | 'vendeur';
  avatar: string | null;
  kyc_verified: boolean;
}

export interface Livreur {
  id: string;
  nom: string;
  user_id: string;
  tel: string;
  zones_couvertes: string[];
  is_active: boolean;
}

export interface AcheteurInfo {
  nom: string;
  tel: string;
  ville: string;
  quartier: string;
  produit_id: string;
}