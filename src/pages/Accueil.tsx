import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { SlidersHorizontal, X, RotateCcw, Search } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { getProduitsStore, getPays, getVillesWithPays } from '../lib/supabase';
import type { Produit, Pays } from '../types';

const CATEGORIES = ['Mode', 'High-Tech', 'Maison', 'Beauté', 'Auto', 'Sports', 'Alimentation'];

export default function Accueil() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const searchQuery = searchParams.get('q') || '';

  const [produits, setProduits] = useState<Produit[]>([]);
  const [loading, setLoading] = useState(true);
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
        search: searchQuery || undefined,
      });
      setProduits(data);
    } catch (err) {
      console.error('Erreur produits:', err);
    }
  }

  useEffect(() => {
    if (!loading) loadProduits();
  }, [filtreCategorie, filtreVille, filtrePays, searchQuery]);

  function handleResetFilters() {
    setFiltrePays('');
    setFiltreVille('');
    setFiltreCategorie('');
    if (searchQuery) {
      navigate('/');
    }
  }

  const activeFiltersCount = (filtrePays ? 1 : 0) + (filtreVille ? 1 : 0) + (filtreCategorie ? 1 : 0) + (searchQuery ? 1 : 0);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              Produits
              <span className="text-sm font-semibold text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full">
                {produits.length}
              </span>
            </h1>
            {searchQuery && (
              <p className="text-sm text-gray-500 mt-1 flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-mayfipay-orange" />
                Résultats pour « <span className="font-semibold text-gray-800">{searchQuery}</span> »
                <button
                  onClick={() => navigate('/')}
                  className="ml-2 text-xs text-mayfipay-orange hover:underline font-medium inline-flex items-center gap-0.5"
                >
                  <X className="w-3 h-3" /> Effacer la recherche
                </button>
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {activeFiltersCount > 0 && (
              <button
                onClick={handleResetFilters}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                title="Réinitialiser tous les filtres"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Effacer tout</span>
              </button>
            )}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
                showFilters || activeFiltersCount > 0
                  ? 'border-mayfipay-orange text-mayfipay-orange bg-orange-50 font-semibold'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50 font-medium'
              }`}
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span className="text-sm">Filtres</span>
              {activeFiltersCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-mayfipay-orange text-white text-xs flex items-center justify-center font-bold">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mb-8 p-6 bg-gray-50 rounded-2xl border border-gray-200 shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Pays</label>
                <select
                  value={filtrePays}
                  onChange={(e) => setFiltrePays(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-mayfipay-orange"
                >
                  <option value="">Tous les pays</option>
                  {paysList.map(p => <option key={p.code} value={p.code}>{p.drapeau} {p.nom}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Ville</label>
                <select
                  value={filtreVille}
                  onChange={(e) => setFiltreVille(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-mayfipay-orange"
                >
                  <option value="">Toutes les villes</option>
                  {villesFiltrees.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Catégorie</label>
                <select
                  value={filtreCategorie}
                  onChange={(e) => setFiltreCategorie(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-mayfipay-orange"
                >
                  <option value="">Toutes les catégories</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Categories Pills */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-8">
          <button
            onClick={() => setFiltreCategorie('')}
            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
              !filtreCategorie
                ? 'bg-mayfipay-orange text-white border-mayfipay-orange shadow-sm'
                : 'bg-gray-100 text-gray-700 border-transparent hover:bg-gray-200'
            }`}
          >
            Tout voir
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setFiltreCategorie(filtreCategorie === cat ? '' : cat)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
                filtreCategorie === cat
                  ? 'bg-mayfipay-orange text-white border-mayfipay-orange shadow-sm'
                  : 'bg-gray-100 text-gray-700 border-transparent hover:bg-gray-200'
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
          <div className="text-center py-20 px-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200 max-w-xl mx-auto my-8">
            <p className="text-4xl mb-3">🔍</p>
            <h3 className="text-base font-bold text-gray-900 mb-1">Aucun produit trouvé</h3>
            <p className="text-xs text-gray-500 mb-6">Modifiez vos filtres ou effectuez une autre recherche.</p>
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-mayfipay-orange text-white text-xs font-bold hover:bg-mayfipay-orange-dark transition-colors shadow-sm"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {produits.map(p => <ProductCard key={p.id} produit={p} />)}
          </div>
        )}
      </div>
    </div>
  );
}
