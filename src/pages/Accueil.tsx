import { useState, useEffect } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { getProduitsStore, getPays, getVillesWithPays } from '../lib/supabase';
import type { Produit, Pays } from '../types';

const CATEGORIES = ['Mode', 'High-Tech', 'Maison', 'Beauté', 'Auto', 'Sports', 'Alimentation'];

export default function Accueil() {
  const [produits, setProduits] = useState<Produit[]>([]);
  const [loading, setLoading] = useState(true);
  const [search] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [allVilles, setAllVilles] = useState<{ville: string; pays_code?: string}[]>([]);
  const [paysList, setPaysList] = useState<Pays[]>([]);
  const [filtrePays, setFiltrePays] = useState('');
  const [filtreCategorie, setFiltreCategorie] = useState('');
  const [filtreVille, setFiltreVille] = useState('');
  const [villesFiltrees, setVillesFiltrees] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!filtrePays) {
      setVillesFiltrees(allVilles.map(v => v.ville));
    } else {
      setVillesFiltrees(allVilles.filter(v => v.pays_code === filtrePays).map(v => v.ville));
    }
    setFiltreVille('');
  }, [filtrePays, allVilles]);

  async function loadData() {
    try {
      const [paysData, villesData] = await Promise.all([
        getPays(),
        getVillesWithPays(),
      ]);
      setPaysList(paysData);
      setAllVilles(villesData);
      await loadProduits();
    } catch (err) {
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  }

  async function loadProduits() {
    try {
      const data = await getProduitsStore({
        categorie: filtreCategorie || undefined,
        ville: filtreVille || undefined,
        paysCode: filtrePays || undefined,
        search: search || undefined,
      });
      setProduits(data);
    } catch (err) {
      console.error('Erreur produits:', err);
    }
  }

  useEffect(() => {
    if (!loading) loadProduits();
  }, [filtreCategorie, filtreVille, filtrePays, search]);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Produits <span className="font-normal text-gray-500 text-lg">{produits.length}</span>
          </h1>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span className="text-sm font-medium">Filtres</span>
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mb-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pays</label>
                <select
                  value={filtrePays}
                  onChange={(e) => setFiltrePays(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-gray-900"
                >
                  <option value="">Tous</option>
                  {paysList.map(p => <option key={p.code} value={p.code}>{p.drapeau} {p.nom}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ville</label>
                <select
                  value={filtreVille}
                  onChange={(e) => setFiltreVille(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-gray-900"
                >
                  <option value="">Toutes</option>
                  {villesFiltrees.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie</label>
                <select
                  value={filtreCategorie}
                  onChange={(e) => setFiltreCategorie(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-gray-900"
                >
                  <option value="">Toutes</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Categories Pills */}
        <div className="flex gap-3 overflow-x-auto pb-4 mb-8">
          <button
            onClick={() => setFiltreCategorie('')}
            className={`px-4 py-1.5 text-sm whitespace-nowrap transition-colors ${
              !filtreCategorie
                ? 'text-mayfipay-orange font-medium'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Tout
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setFiltreCategorie(cat)}
              className={`px-4 py-1.5 text-sm whitespace-nowrap transition-colors ${
                filtreCategorie === cat
                  ? 'text-mayfipay-orange font-medium'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {loading ? (
          <LoadingSpinner />
        ) : produits.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500">Aucun produit trouvé</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
            {produits.map(p => <ProductCard key={p.id} produit={p} />)}
          </div>
        )}
      </div>
    </div>
  );
}
