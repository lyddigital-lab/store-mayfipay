import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Package, MapPin, Truck, Phone } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { getProduitDetail, getPays, getVilles, checkDisponibiliteVille } from '../lib/supabase';
import { formatPrix } from '../utils/helpers';
import type { Produit, Pays, ExpeditionInfo } from '../types';

export default function ProduitDetail() {
  const { produitId, slug } = useParams<{ produitId: string; slug?: string }>();
  const navigate = useNavigate();
  const [produit, setProduit] = useState<Produit | null>(null);
  const [loading, setLoading] = useState(true);
  const [activePhoto, setActivePhoto] = useState(0);
  
  // Sélection localisation acheteur
  const [paysList, setPaysList] = useState<Pays[]>([]);
  const [villesList, setVillesList] = useState<string[]>([]);
  const [selectedPays, setSelectedPays] = useState('');
  const [selectedVille, setSelectedVille] = useState('');
  const [expeditionInfo, setExpeditionInfo] = useState<ExpeditionInfo | null>(null);

  useEffect(() => {
    if (produitId) loadProduit();
    loadPays();
  }, [produitId]);

  useEffect(() => {
    if (selectedPays) {
      getVilles(selectedPays).then(v => {
        setVillesList(v);
        setSelectedVille('');
        setExpeditionInfo(null);
      });
    }
  }, [selectedPays]);

  useEffect(() => {
    if (produit && selectedVille) {
      const info = checkDisponibiliteVille(produit, selectedVille);
      setExpeditionInfo(info);
    } else {
      setExpeditionInfo(null);
    }
  }, [selectedVille, produit]);

  async function loadProduit() {
    try {
      const p = await getProduitDetail(produitId!);
      setProduit(p);
    } catch (err) {
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  }

  async function loadPays() {
    try {
      const p = await getPays();
      setPaysList(p);
    } catch (err) {
      console.error('Erreur:', err);
    }
  }

  function handleAcheter() {
    if (!produit) return;
    
    // Si ville sélectionnée, rediriger vers page paiement avec ville pré-remplie
    if (selectedVille && expeditionInfo?.disponible) {
      navigate(`/paiement?produit_id=${produit.id}&ville=${encodeURIComponent(selectedVille)}`);
      return;
    }

    // Sinon, comportement classique (lien unique)
    const lienUnique = produit.lien_unique;
    if (lienUnique) {
      window.location.href = `https://app.mayfipay.com/p/${lienUnique}`;
    } else {
      alert('Veuillez sélectionner votre ville de livraison.');
    }
  }

  function handleContact() {
    if (!produit?.vendeur?.tel) return;
    const tel = produit.vendeur.tel.replace(/\s+/g, '');
    window.open(`https://wa.me/${tel}?text=Bonjour, je suis intéressé par votre produit "${produit.nom}"`, '_blank');
  }

  if (loading) return <LoadingSpinner />;
  if (!produit) return <div className="max-w-4xl mx-auto px-4 py-16 text-center"><p>Produit introuvable.</p></div>;

  const photos = (produit.photos && produit.photos.length > 0) ? produit.photos : (produit.image_url ? [produit.image_url] : (produit.photo ? [produit.photo] : []));
  const backLink = slug ? `/boutique/${slug}` : '/';
  const villesDesservies = produit.villes_vente || [];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link to={backLink} className="text-sm text-mayfipay-text-sec hover:text-mayfipay-orange">← Retour</Link>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Galerie photos */}
        <div>
          <div className="aspect-square flex items-center justify-center bg-mayfipay-border-light rounded-xl overflow-hidden">
            {photos.length > 0 ? (
              <img src={photos[activePhoto]} alt={produit.nom} className="h-full w-full object-cover" />
            ) : (
              <span className="text-6xl">{produit.emoji || '📦'}</span>
            )}
          </div>
          {photos.length > 1 && (
            <div className="flex gap-2 mt-3">
              {photos.map((photo, i) => (
                <button key={i} onClick={() => setActivePhoto(i)} className={`w-16 h-16 rounded-lg overflow-hidden border-2 ${i === activePhoto ? 'border-mayfipay-orange' : 'border-transparent'}`}>
                  <img src={photo} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Zones desservies */}
          {villesDesservies.length > 0 && (
            <div className="mt-6 rounded-lg border border-mayfipay-border bg-white p-4">
              <h3 className="text-sm font-semibold text-mayfipay-text mb-2 flex items-center gap-2">
                <Truck size={16} />
                Zones desservies
              </h3>
              <div className="flex flex-wrap gap-2">
                {villesDesservies.map((v, i) => (
                  <span key={i} className={`text-xs px-2.5 py-1 rounded-full ${v.type === 'local' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                    {v.ville} {v.type === 'local' ? '📍' : '🚚'}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Infos produit */}
        <div>
          <h1 className="text-2xl font-bold text-mayfipay-text">{produit.nom}</h1>
          <p className="mt-2 text-2xl font-bold text-mayfipay-orange">{formatPrix(produit.prix)}</p>

          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-mayfipay-text-sec">
            <div className="flex items-center gap-1.5">
              <Package className="h-4 w-4" />
              <span>Stock : {produit.stock > 0 ? `${produit.stock} disponible(s)` : 'Rupture'}</span>
            </div>
            {produit.categorie && (
              <span className="bg-mayfipay-border-light text-mayfipay-text-sec px-2.5 py-1 rounded-full text-xs">
                {produit.categorie}
              </span>
            )}
          </div>

          {produit.vendeur && (
            <p className="mt-3 text-sm text-mayfipay-text-sec">
              Vendeur : <span className="font-medium">{produit.vendeur.nom}</span>
              {produit.vendeur.pays && <span className="text-mayfipay-text-muted"> · {produit.vendeur.pays}</span>}
            </p>
          )}

          {produit.description && <p className="mt-4 text-sm text-mayfipay-text-sec">{produit.description}</p>}

          {/* Sélecteur localisation */}
          <div className="mt-6 rounded-lg border border-mayfipay-border bg-mayfipay-border-light p-4">
            <h3 className="text-sm font-semibold text-mayfipay-text mb-3 flex items-center gap-2">
              <MapPin size={16} />
              Où êtes-vous ?
            </h3>
            <div className="space-y-3">
              <select
                value={selectedPays}
                onChange={(e) => setSelectedPays(e.target.value)}
                className="w-full rounded-lg border border-mayfipay-border bg-white px-3 py-2 text-sm focus:border-mayfipay-orange focus:outline-none"
              >
                <option value="">Choisir votre pays</option>
                {paysList.map(p => <option key={p.code} value={p.code}>{p.drapeau} {p.nom}</option>)}
              </select>
              {selectedPays && (
                <select
                  value={selectedVille}
                  onChange={(e) => setSelectedVille(e.target.value)}
                  className="w-full rounded-lg border border-mayfipay-border bg-white px-3 py-2 text-sm focus:border-mayfipay-orange focus:outline-none"
                >
                  <option value="">Choisir votre ville</option>
                  {villesList.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              )}
            </div>

            {/* Message disponibilité */}
            {expeditionInfo && (
              <div className={`mt-3 rounded-lg p-3 text-sm ${expeditionInfo.disponible ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                {expeditionInfo.message}
              </div>
            )}
          </div>

          {/* Boutons action */}
          <div className="mt-6 space-y-2">
            {expeditionInfo?.disponible ? (
              <button
                onClick={handleAcheter}
                disabled={produit.stock === 0}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-mayfipay-orange px-6 py-3 text-sm font-medium text-white hover:bg-mayfipay-orange-dark disabled:opacity-50 transition-colors"
              >
                <ShoppingCart className="h-4 w-4" />
                Acheter maintenant
              </button>
            ) : expeditionInfo && !expeditionInfo.disponible ? (
              <button
                onClick={handleContact}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-6 py-3 text-sm font-medium text-white hover:bg-green-700 transition-colors"
              >
                <Phone className="h-4 w-4" />
                Contacter le vendeur
              </button>
            ) : (
              <button
                disabled
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-gray-300 px-6 py-3 text-sm font-medium text-gray-500 cursor-not-allowed"
              >
                <ShoppingCart className="h-4 w-4" />
                Sélectionnez votre ville
              </button>
            )}
            <p className="text-xs text-mayfipay-text-muted text-center">
              Paiement sécurisé via MayfiPay
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
