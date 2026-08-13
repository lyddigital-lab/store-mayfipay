import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, Truck, Settings, LogOut, Menu, X, Home } from 'lucide-react';
import { getVendeurSession, clearVendeurSession } from '../../lib/supabase';
import { useEffect, useState } from 'react';

export default function VendeurLayout() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [_vendeur, setVendeur] = useState<{ nom: string } | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const session = getVendeurSession();
    if (!session) {
      navigate('/login');
    } else {
      setVendeur({ nom: session.nom });
      setLoading(false);
    }
  }, []);

  function handleLogout() {
    clearVendeurSession();
    navigate('/');
  }

  if (loading) return <div className="flex items-center justify-center min-h-screen">Chargement...</div>;

  return (
    <div className="min-h-screen bg-mayfipay-bg flex flex-col md:flex-row">
      {/* Header mobile avec hamburger */}
      <div className="md:hidden bg-white border-b border-mayfipay-border p-4 flex items-center justify-between">
        <h2 className="font-bold text-mayfipay-text">Espace vendeur</h2>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="p-2 rounded-lg hover:bg-mayfipay-border-light transition-colors"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar desktop + menu mobile */}
      <aside className={`
        ${menuOpen ? 'block' : 'hidden'} md:block
        w-full md:w-64 bg-white border-r border-mayfipay-border md:min-h-screen
        ${menuOpen ? 'absolute z-50 shadow-lg' : ''}
      `}>
        <div className="hidden md:block p-4 border-b border-mayfipay-border">
          <h2 className="font-bold text-mayfipay-text">Espace vendeur</h2>
        </div>
        <nav className="p-2 space-y-1">
          <NavLink 
            to="/" 
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-mayfipay-text-sec hover:bg-mayfipay-orange-light hover:text-mayfipay-orange transition-colors"
          >
            <Home className="h-4 w-4" /> Accueil
          </NavLink>
          <NavLink 
            to="/vendeur" 
            end 
            onClick={() => setMenuOpen(false)}
            className={({ isActive }) => `flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
              isActive ? 'bg-mayfipay-orange-light text-mayfipay-orange' : 'text-mayfipay-text-sec hover:bg-mayfipay-orange-light hover:text-mayfipay-orange'
            }`}
          >
            <LayoutDashboard className="h-4 w-4" /> Tableau de bord
          </NavLink>
          <NavLink 
            to="/vendeur/parametres" 
            onClick={() => setMenuOpen(false)}
            className={({ isActive }) => `flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
              isActive ? 'bg-mayfipay-orange-light text-mayfipay-orange' : 'text-mayfipay-text-sec hover:bg-mayfipay-orange-light hover:text-mayfipay-orange'
            }`}
          >
            <Settings className="h-4 w-4" /> Paramètres boutique
          </NavLink>
          <NavLink 
            to="/vendeur/produits" 
            onClick={() => setMenuOpen(false)}
            className={({ isActive }) => `flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
              isActive ? 'bg-mayfipay-orange-light text-mayfipay-orange' : 'text-mayfipay-text-sec hover:bg-mayfipay-orange-light hover:text-mayfipay-orange'
            }`}
          >
            <Package className="h-4 w-4" /> Mes produits
          </NavLink>
          <NavLink 
            to="/vendeur/commandes" 
            onClick={() => setMenuOpen(false)}
            className={({ isActive }) => `flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
              isActive ? 'bg-mayfipay-orange-light text-mayfipay-orange' : 'text-mayfipay-text-sec hover:bg-mayfipay-orange-light hover:text-mayfipay-orange'
            }`}
          >
            <ShoppingCart className="h-4 w-4" /> Commandes
          </NavLink>
          <NavLink 
            to="/vendeur/livreurs" 
            onClick={() => setMenuOpen(false)}
            className={({ isActive }) => `flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
              isActive ? 'bg-mayfipay-orange-light text-mayfipay-orange' : 'text-mayfipay-text-sec hover:bg-mayfipay-orange-light hover:text-mayfipay-orange'
            }`}
          >
            <Truck className="h-4 w-4" /> Livreurs
          </NavLink>
          <button 
            onClick={() => { handleLogout(); setMenuOpen(false); }} 
            className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-mayfipay-text-sec hover:bg-mayfipay-orange-light hover:text-mayfipay-orange transition-colors"
          >
            <LogOut className="h-4 w-4" /> Déconnexion
          </button>
        </nav>
      </aside>
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
