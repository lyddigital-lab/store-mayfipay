import { Link, useLocation } from 'react-router-dom';
import { Store, User, LogOut } from 'lucide-react';
import { getAcheteurSession, clearAcheteurSession } from '../lib/supabase';
import { useState, useEffect } from 'react';

export default function Header() {
  const location = useLocation();
  const [showMenu, setShowMenu] = useState(false);
  const [session, setSession] = useState(() => getAcheteurSession());

  // Resynchroniser la session à chaque changement de route (retour SSO, déconnexion…)
  useEffect(() => {
    setSession(getAcheteurSession());
  }, [location.pathname]);

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-mayfipay-orange">
              <Store className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight">
              MAYFIPAY <span className="font-normal">STORE</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            {session ? (
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-50 text-mayfipay-orange text-sm font-medium hover:bg-orange-100"
                >
                  {session.photo ? (
                    <img
                      src={session.photo}
                      alt={session.nom}
                      className="w-6 h-6 rounded-full object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-mayfipay-orange text-white flex items-center justify-center text-xs font-bold shrink-0">
                      {session.nom.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="hidden sm:block text-sm">{session.nom.split(' ')[0]}</span>
                </button>
                {showMenu && (
                  <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 w-52 py-1">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="font-semibold text-sm text-gray-900">{session.nom}</p>
                      <p className="text-xs text-gray-400">+{session.tel}</p>
                    </div>
                    <Link
                      to="/mon-compte"
                      onClick={() => setShowMenu(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <User className="w-4 h-4 text-mayfipay-orange" />
                      Mon compte
                    </Link>
                    {session.role === 'vendeur' && (
                      <Link
                        to="/vendeur"
                        onClick={() => setShowMenu(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <Store className="w-4 h-4 text-mayfipay-orange" />
                        Espace vendeur
                      </Link>
                    )}
                    <button
                      onClick={() => { clearAcheteurSession(); setShowMenu(false); window.location.reload(); }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="w-4 h-4" />
                      Déconnexion
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-mayfipay-orange">
                <User className="w-4 h-4" />
                <span className="hidden sm:block">Connexion</span>
              </Link>
            )}
          </div>
        </div>
        <input
          type="text"
          placeholder="Rechercher..."
          className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:border-gray-900 text-sm"
        />
      </div>
    </header>
  );
}
