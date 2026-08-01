import { createClient } from '@supabase/supabase-js';
import type { Boutique, BoutiqueProduit, Produit, Commande, Livreur, Pays, ExpeditionInfo } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://pwstqskkogfchgebwhiz.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3c3Rxc2trb2dmY2hnZWJ3aGl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzczMDUwODcsImV4cCI6MjA5Mjg4MTA4N30.UgUiTfZANmR1YZOw85JxsChdwnQf_F_1zfyQoyj5gK0';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in environment');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ─── Session vendeur (compte MayfiPay, pas Supabase Auth) ──

export interface VendeurSession {
  id: string;
  nom: string;
  tel: string;
  role: string;
}

export function getVendeurSession(): VendeurSession | null {
  const raw = localStorage.getItem('store_vendeur_user');
  if (!raw) return null;
  try {
    const user = JSON.parse(raw);
    if (user && user.id && user.role === 'vendeur') return user;
    return null;
  } catch {
    return null;
  }
}

export function clearVendeurSession(): void {
  localStorage.removeItem('store_vendeur_user');
}

// ─── Session acheteur ───────────────────────────────────────

export interface AcheteurSession {
  id: string;
  nom: string;
  tel: string;
  role: string;
}

export function getAcheteurSession(): AcheteurSession | null {
  const raw = localStorage.getItem('store_acheteur_user');
  if (!raw) return null;
  try {
    const user = JSON.parse(raw);
    // Rejeter les sessions vendeur qui auraient atterri ici par erreur
    if (user && user.id) return user;
    return null;
  } catch {
    return null;
  }
}

export function clearAcheteurSession(): void {
  localStorage.removeItem('store_acheteur_user');
}

export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// ─── Boutiques ───────────────────────────────────────────

export async function getBoutiques() {
  const { data, error } = await supabase
    .from('boutiques')
    .select('*, vendeur:users!boutiques_vendeur_id_fkey(id, nom, tel)')
    .eq('active', true)
    .order('created_at', { ascending: false });

  if (error) throw error;

  // Ajouter le nombre de produits pour chaque boutique
  const withCounts = await Promise.all(
    (data || []).map(async (boutique) => {
      const { count } = await supabase
        .from('boutiques_produits')
        .select('*', { count: 'exact', head: true })
        .eq('boutique_id', boutique.id)
        .eq('visible', true);
      return { ...boutique, nb_produits: count || 0 };
    })
  );

  return withCounts as Boutique[];
}

export async function getBoutiqueBySlug(slug: string) {
  const { data, error } = await supabase
    .from('boutiques')
    .select('*, vendeur:users!boutiques_vendeur_id_fkey(id, nom, tel)')
    .eq('slug', slug)
    .maybeSingle();

  if (error) throw error;
  return data as Boutique | null;
}

export async function getProduitsBoutique(boutiqueId: string) {
  const { data, error } = await supabase
    .from('boutiques_produits')
    .select('*, produit:produits(*)')
    .eq('boutique_id', boutiqueId)
    .eq('visible', true)
    .order('ordre', { ascending: true });

  if (error) throw error;
  return (data || []) as BoutiqueProduit[];
}

export async function getProduitDetail(produitId: string) {
  const { data, error } = await supabase
    .from('produits')
    .select('*, vendeur:users!produits_vendeur_id_fkey(nom, tel, pays)')
    .eq('id', produitId)
    .maybeSingle();

  if (error) throw error;
  return data as Produit | null;
}

// ─── Produits du store (tous les produits visibles) ──────

export async function getProduitsStore(filters?: {
  categorie?: string;
  paysCode?: string;
  ville?: string;
  search?: string;
}) {
  let query = supabase
    .from('produits')
    .select('*, vendeur:users!produits_vendeur_id_fkey(nom, tel, pays)')
    .eq('actif', true)
    .eq('visible_store', true)
    .gt('stock', 0)
    .order('created_at', { ascending: false });

  // Filtrer par catégorie (supporte ancien 'categorie' ET nouveau 'categories' array)
  if (filters?.categorie) {
    query = query.or(`categorie.eq.${filters.categorie},categories.cs.{${filters.categorie}}`);
  }
  if (filters?.search) {
    query = query.or(`nom.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
  }

  const { data, error } = await query;
  if (error) throw error;

  let produits = (data || []) as Produit[];

  // Filtre pays côté client (utilise le mapping code → noms pour matcher)
  if (filters?.paysCode) {
    produits = produits.filter((p: any) => matchPaysCode(filters.paysCode!, p.vendeur?.pays));
  }

  // Filtre ville côté client (car c'est dans le tableau villes_vente)
  if (filters?.ville) {
    produits = produits.filter((p: any) => {
      const villes = p.villes_vente || [];
      return villes.some((v: any) => v.ville === filters.ville);
    });
  }

  return produits;
}

// ─── Catégories distinctes ───────────────────────────────

export async function getCategories() {
  const { data, error } = await supabase
    .from('produits')
    .select('categorie, categories')
    .eq('actif', true);

  if (error) throw error;

  const allCats = new Set<string>();
  (data || []).forEach((p: any) => {
    if (p.categorie) allCats.add(p.categorie);
    if (Array.isArray(p.categories)) {
      p.categories.forEach((c: string) => { if (c) allCats.add(c); });
    }
  });

  return [...allCats].sort();
}

// ─── Pays (table dediee avec drapeaux) ───────────────────

export async function getPays(): Promise<Pays[]> {
  const { data, error } = await supabase
    .from('pays')
    .select('*')
    .eq('actif', true)
    .order('nom');
  if (error) throw error;
  return (data || []) as Pays[];
}

// ─── Villes (depuis table villes, avec pays_code) ───────────────────────────

export async function getVilles(paysCode?: string): Promise<string[]> {
  let query = supabase.from('villes').select('nom').eq('actif', true).order('nom');
  if (paysCode) query = query.eq('pays_code', paysCode);
  const { data, error } = await query;
  if (error) throw error;
  return (data || []).map(v => v.nom);
}

export interface VilleWithPays {
  ville: string;
  pays_code?: string;
}

export async function getVillesWithPays(): Promise<VilleWithPays[]> {
  const { data, error } = await supabase
    .from('villes')
    .select('nom, pays_code')
    .eq('actif', true)
    .order('nom');
  if (error) throw error;
  return (data || []).map(v => ({ ville: v.nom, pays_code: v.pays_code }));
}

// Mapping ville → pays (pour les filtres store)
// NOTE: tant que zones_livraison n'a pas de pays_code, on utilise un mapping statique
const VILLE_PAYS_MAP: Record<string, string> = {
  'Brazzaville': 'CG',
  'Pointe-Noire': 'CG',
  // Ajouter ici les villes par pays si besoin
};

export function getPaysByVille(ville: string): string | undefined {
  return VILLE_PAYS_MAP[ville];
}

// Mapping code pays → noms possibles (pour matcher les données existantes en base)
const PAYS_CODE_TO_NOMS: Record<string, string[]> = {
  'CG': ['Congo Brazzaville', 'Congo-Brazzaville', 'Congo', 'Republic of Congo', 'Congo (Brazzaville)'],
  'CM': ['Cameroun', 'Cameroon'],
  'CI': ['Côte d\'Ivoire', 'Ivory Coast'],
  'SN': ['Sénégal', 'Senegal'],
  'BJ': ['Bénin', 'Benin'],
  'TG': ['Togo'],
  'GA': ['Gabon'],
  'CD': ['Congo Kinshasa', 'Congo-Kinshasa', 'RDC', 'Democratic Republic of Congo', 'Congo (Kinshasa)'],
};

function normalizePaysName(name: string): string {
  return name.toLowerCase().replace(/[-_\s]+/g, ' ').trim();
}

export function matchPaysCode(paysCode: string, paysName?: string): boolean {
  if (!paysName) return false;
  const variants = PAYS_CODE_TO_NOMS[paysCode] || [];
  const normalized = normalizePaysName(paysName);
  return variants.some(v => normalizePaysName(v) === normalized);
}

// ─── Update produit complet (categories, photos, villes_vente) ─

export async function updateProduitComplet(id: string, data: Partial<Produit>): Promise<void> {
  const stock = data.stock ?? 0;
  const { error } = await supabase
    .from('produits')
    .update({
      nom: data.nom,
      prix: data.prix,
      stock: stock,
      actif: stock > 0,
      categorie: data.categories?.[0] || data.categorie || null,
      categories: data.categories,
      photos: data.photos,
      villes_vente: data.villes_vente,
      description: data.description,
      visible_store: data.visible_store,
    })
    .eq('id', id);
  if (error) throw error;
}

// ─── Check disponibilite ville pour un produit ────────────

export function checkDisponibiliteVille(produit: Produit, villeNom: string): ExpeditionInfo {
  const villesVente = produit.villes_vente || [];
  const match = villesVente.find(v => 
    v.ville.toLowerCase() === villeNom.toLowerCase()
  );

  if (!match) {
    return {
      disponible: false,
      message: 'Ce vendeur ne livre pas ce produit dans votre ville. Contactez le vendeur pour plus d\'informations.',
    };
  }

  if (match.type === 'local') {
    return {
      disponible: true,
      type: 'local',
      message: 'Produit disponible sur place dans votre ville.',
      ville_vendeur: match.ville,
    };
  }

  // expedition
  const coutMode = match.cout_mode || 'gratuit';
  if (coutMode === 'gratuit') {
    return {
      disponible: true,
      type: 'expedition',
      cout_mode: 'gratuit',
      cout: 0,
      message: `Le vendeur réside à ${villesVente.find(v => v.type === 'local')?.ville || 'sa ville'} et peut vous expédier le produit à ${villeNom}. Expédition gratuite.`,
    };
  }

  if (coutMode === 'fixe') {
    return {
      disponible: true,
      type: 'expedition',
      cout_mode: 'fixe',
      cout: match.cout_montant || 0,
      message: `Le vendeur réside à ${villesVente.find(v => v.type === 'local')?.ville || 'sa ville'} et peut vous expédier le produit à ${villeNom}. Frais d'expédition : ${match.cout_montant || 0} FCFA.`,
    };
  }

  // client paie au retrait
  return {
    disponible: true,
    type: 'expedition',
    cout_mode: 'client',
    cout: 0,
    message: `Le vendeur réside à ${villesVente.find(v => v.type === 'local')?.ville || 'sa ville'} et peut vous expédier le produit à ${villeNom}. Vous paierez l'expédition au retrait du colis.`,
  };
}

export async function getZonesLivraison() {
  const { data, error } = await supabase
    .from('zones_livraison')
    .select('*')
    .order('ville')
    .order('numero_zone');

  if (error) throw error;
  return data || [];
}

// ─── Vendeur (dashboard) ─────────────────────────────────

export async function getBoutiqueByVendeur(vendeurId: string) {
  const { data, error } = await supabase
    .from('boutiques')
    .select('*')
    .eq('vendeur_id', vendeurId)
    .maybeSingle();

  if (error) throw error;
  return data as Boutique | null;
}

export async function updateBoutique(id: string, data: Partial<Boutique>) {
  const { error } = await supabase
    .from('boutiques')
    .update(data)
    .eq('id', id);

  if (error) throw error;
}

export async function toggleProduitVisibilite(boutiqueId: string, produitId: string, visible: boolean) {
  // Vérifier si le lien existe déjà
  const { data: existing } = await supabase
    .from('boutiques_produits')
    .select('id')
    .eq('boutique_id', boutiqueId)
    .eq('produit_id', produitId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from('boutiques_produits')
      .update({ visible })
      .eq('id', existing.id);
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from('boutiques_produits')
      .insert({ boutique_id: boutiqueId, produit_id: produitId, visible });
    if (error) throw error;
  }
}

export async function getCommandesByVendeur(vendeurId: string) {
  const { data, error } = await supabase
    .from('commandes')
    .select('*, produit:produits(*)')
    .eq('vendeur_id', vendeurId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) throw error;
  return (data || []) as Commande[];
}

export async function getLivreursDisponibles() {
  const { data, error } = await supabase
    .from('livreurs_partenaires')
    .select('*')
    .eq('is_active', true);

  if (error) throw error;
  return (data || []) as Livreur[];
}

export async function assignerLivreur(boutiqueId: string, livreurId: string) {
  const { error } = await supabase
    .from('boutiques')
    .update({ livreur_id: livreurId })
    .eq('id', boutiqueId);

  if (error) throw error;
}

// ─── Achat ───────────────────────────────────────────────

export async function creerOuTrouverAcheteur(tel: string, nom: string): Promise<string> {
  // Chercher si l'utilisateur existe déjà
  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('tel', tel)
    .maybeSingle();

  if (existing) return existing.id;

  // Créer un nouveau compte acheteur
  const { data: newUser, error } = await supabase
    .from('users')
    .insert({ nom, tel, role: 'acheteur', source: 'store' })
    .select('id')
    .single();

  if (error) throw error;
  return newUser.id;
}

export async function creerCommande(data: {
  produit_id: string;
  acheteur_id: string;
  vendeur_id: string;
  montant: number;
  adresse_livraison: { nom: string; tel: string; ville: string; quartier: string };
}) {
  // Générer un code de commande
  const code = 'STR' + Date.now().toString(36).toUpperCase();

  const { data: commande, error } = await supabase
    .from('commandes')
    .insert({
      code,
      produit_id: data.produit_id,
      acheteur_id: data.acheteur_id,
      vendeur_id: data.vendeur_id,
      montant: data.montant,
      commission: Math.round(data.montant * 0.035),
      montant_net: Math.floor(data.montant * 0.97),
      statut: 'en_attente_paiement',
      adresse_livraison: data.adresse_livraison,
    })
    .select()
    .single();

  if (error) throw error;
  return commande;
}

