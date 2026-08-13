import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import { getVendeurSession, supabase, updateProduitComplet, deleteProduit, getBoutiqueByVendeur } from '../../lib/supabase';
import PhotoUploader from '../../components/PhotoUploader';
import VillesSelector from '../../components/VillesSelector';
import type { VilleVente } from '../../types';

const CATEGORIES = ['Mode', 'Électronique', 'Alimentation', 'Beauté', 'Maison', 'Sport', 'Art', 'Autre'];
const MAX_CATEGORIES = 3;

export default function VendeurProduitForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [nom, setNom] = useState('');
  const [prix, setPrix] = useState('');
  const [stock, setStock] = useState('');
  const [description, setDescription] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [photos, setPhotos] = useState<string[]>([]);
  const [villesVente, setVillesVente] = useState<VilleVente[]>([]);
  const [visibleStore, setVisibleStore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadingProduit, setLoadingProduit] = useState(!!id);
  const [produitId, setProduitId] = useState<string | null>(id || null);

  useEffect(() => {
    if (id) loadProduit();
  }, [id]);

  useEffect(() => {
    if (loadingProduit || isEdit || produitId) return;
    const session = getVendeurSession();
    if (!session?.id) return;
    getBoutiqueByVendeur(session.id).then((boutique) => {
      if (!boutique) return;
      const defaults: VilleVente[] = [];
      if (boutique.ville) {
        defaults.push({
          ville_id: boutique.ville,
          ville: boutique.ville,
          pays: 'CG',
          type: 'local',
          cout_mode: 'gratuit',
          cout_montant: 0,
        });
      }
      (boutique.zones_livraison || []).forEach((ville) => {
        if (ville && ville !== boutique.ville && !defaults.find((d) => d.ville === ville)) {
          defaults.push({
            ville_id: ville,
            ville,
            pays: 'CG',
            type: 'expedition',
            cout_mode: 'gratuit',
            cout_montant: 0,
          });
        }
      });
      setVillesVente(defaults);
    });
  }, [isEdit, produitId, loadingProduit]);

  async function loadProduit() {
    try {
      const { data, error } = await supabase
        .from('produits')
        .select('*')
        .eq('id', id)
        .eq('vendeur_id', session.id)
        .single();
      if (error) throw error;
      if (data) {
        setNom(data.nom || '');
        setPrix(data.prix?.toString() || '');
        setStock(data.stock?.toString() || '');
        setDescription(data.description || '');
        setCategories(data.categories || (data.categorie ? [data.categorie] : []));
        setPhotos(data.photos || (data.image_url ? [data.image_url] : []));
        setVillesVente(data.villes_vente || []);
        setVisibleStore(data.visible_store !== false);
        setProduitId(data.id);
      } else {
        alert('Produit introuvable.');
        navigate('/vendeur/produits');
      }
    } catch (err) {
      console.error('Erreur chargement:', err);
      alert('Impossible de charger ce produit.');
      navigate('/vendeur/produits');
    } finally {
      setLoadingProduit(false);
    }
  }

  function toggleCategorie(cat: string) {
    if (categories.includes(cat)) {
      setCategories(categories.filter(c => c !== cat));
    } else if (categories.length < MAX_CATEGORIES) {
      setCategories([...categories, cat]);
    }
  }

  async function handleSave() {
    if (!nom || !prix || !stock) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const session = getVendeurSession();
    if (!session) {
      alert('Non connecté');
      return;
    }

    setLoading(true);
    try {
      const productData = {
        nom: nom.trim(),
        prix: parseInt(prix),
        stock: parseInt(stock),
        description: description.trim() || null,
        categories,
        photos,
        villes_vente: villesVente,
        visible_store: visibleStore,
        actif: parseInt(stock) > 0,
      };

      if (produitId) {
        await updateProduitComplet(produitId, productData, session.id);
        alert('Produit modifié !');
      } else {
        // Générer lien unique cryptographique
        const lienUnique = crypto.randomUUID().replace(/-/g, '').slice(0, 12);

        const { error } = await supabase.from('produits').insert([{
          ...productData,
          vendeur_id: session.id,
          lien_unique: lienUnique,
          emoji: '📦',
        }]);
        if (error) throw error;
        alert('Produit ajouté !');
      }
      navigate('/vendeur/produits');
    } catch (err: any) {
      console.error('Erreur sauvegarde:', err);
      alert('Une erreur est survenue lors de la sauvegarde.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!produitId) return;
    if (!confirm('Supprimer ce produit ?')) return;
    setLoading(true);
    try {
      await deleteProduit(produitId, session.id);
      alert('Produit supprimé');
      navigate('/vendeur/produits');
    } catch (err: any) {
      console.error('Erreur suppression:', err);
      alert('Impossible de supprimer ce produit.');
    } finally {
      setLoading(false);
    }
  }

  if (loadingProduit) {
    return <div className="p-8 text-center text-mayfipay-text-sec">Chargement...</div>;
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/vendeur/produits')}
          className="w-10 h-10 bg-white rounded-xl border border-mayfipay-border flex items-center justify-center hover:bg-gray-50 transition"
        >
          <ArrowLeft size={20} className="text-mayfipay-text-sec" />
        </button>
        <h1 className="text-xl font-bold text-mayfipay-text">
          {isEdit ? 'Modifier le produit' : 'Nouveau produit'}
        </h1>
      </div>

      {/* Photos */}
      <div className="bg-white rounded-xl border border-mayfipay-border p-5 mb-4">
        <p className="text-sm font-bold text-mayfipay-text-sec uppercase mb-3">Photos (max 4)</p>
        <PhotoUploader photos={photos} onChange={setPhotos} produitId={produitId || 'temp'} />
      </div>

      {/* Informations */}
      <div className="bg-white rounded-xl border border-mayfipay-border p-5 mb-4 space-y-4">
        <p className="text-sm font-bold text-mayfipay-text-sec uppercase">Informations</p>

        <div>
          <label className="block text-sm font-semibold text-mayfipay-text mb-1">Nom *</label>
          <input
            type="text"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            placeholder="Ex: Robe traditionnelle"
            className="w-full rounded-lg border border-mayfipay-border px-3 py-2 text-sm focus:border-mayfipay-orange focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold text-mayfipay-text mb-1">Prix (FCFA) *</label>
            <input
              type="number"
              value={prix}
              onChange={(e) => setPrix(e.target.value)}
              placeholder="25000"
              className="w-full rounded-lg border border-mayfipay-border px-3 py-2 text-sm focus:border-mayfipay-orange focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-mayfipay-text mb-1">Stock *</label>
            <input
              type="number"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              placeholder="10"
              className="w-full rounded-lg border border-mayfipay-border px-3 py-2 text-sm focus:border-mayfipay-orange focus:outline-none"
            />
          </div>
        </div>

        {/* Catégories multiples (max 3) */}
        <div>
          <label className="block text-sm font-semibold text-mayfipay-text mb-1">
            Catégories ({categories.length}/{MAX_CATEGORIES})
          </label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => toggleCategorie(cat)}
                disabled={!categories.includes(cat) && categories.length >= MAX_CATEGORIES}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                  categories.includes(cat)
                    ? 'bg-orange-100 text-orange-700 border border-orange-300'
                    : 'bg-gray-100 text-gray-600 border border-transparent hover:bg-gray-200 disabled:opacity-40'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-mayfipay-text mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Taille, couleur, état..."
            rows={3}
            className="w-full rounded-lg border border-mayfipay-border px-3 py-2 text-sm focus:border-mayfipay-orange focus:outline-none resize-none"
          />
        </div>

        {/* Visible store */}
        <div className="flex items-center justify-between">
          <div>
            <label className="block text-sm font-semibold text-mayfipay-text">Visible sur le store</label>
            <p className="text-xs text-mayfipay-text-muted">Rendre ce produit public</p>
          </div>
          <label className="relative inline-flex h-6 w-11 items-center cursor-pointer">
            <input
              type="checkbox"
              checked={visibleStore}
              onChange={(e) => setVisibleStore(e.target.checked)}
              className="sr-only"
            />
            <span className={`inline-block h-6 w-11 rounded-full transition ${visibleStore ? 'bg-mayfipay-orange' : 'bg-gray-300'}`}>
              <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${visibleStore ? 'translate-x-5' : 'translate-x-1'}`} />
            </span>
          </label>
        </div>
      </div>

      {/* Villes de vente / expédition */}
      <div className="bg-white rounded-xl border border-mayfipay-border p-5 mb-4">
        <p className="text-sm font-bold text-mayfipay-text-sec uppercase mb-3">Villes de vente & expédition</p>
        <VillesSelector value={villesVente} onChange={setVillesVente} />
      </div>

      {/* Boutons */}
      <div className="space-y-3">
        <button
          onClick={handleSave}
          disabled={!nom || !prix || !stock || loading}
          className="w-full flex items-center justify-center gap-2 bg-mayfipay-orange text-white py-3 rounded-xl font-bold hover:bg-mayfipay-orange-dark transition disabled:opacity-50"
        >
          <Save size={18} />
          {loading ? 'Enregistrement...' : isEdit ? 'Enregistrer' : 'Créer le produit'}
        </button>

        {isEdit && produitId && (
          <button
            onClick={handleDelete}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 py-3 rounded-xl font-bold hover:bg-red-100 transition border border-red-200"
          >
            <Trash2 size={18} />
            Supprimer
          </button>
        )}
      </div>
    </div>
  );
}