import { Outlet } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { User, Shield } from 'lucide-react';
import MayfiPayLogo from './MayfiPayLogo';

export default function LoginLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-mayfipay-bg">
      {/* ── Header ── */}
      <header className="bg-white border-b border-mayfipay-border-light">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <MayfiPayLogo size={36} />
            <span className="text-xl font-bold text-mayfipay-text">
              MAYFIPAY <span className="font-normal">STORE</span>
            </span>
          </Link>
          <Link
            to="/login"
            className="flex items-center gap-1.5 text-sm font-medium text-mayfipay-text-sec hover:text-mayfipay-blue transition-colors"
          >
            <User size={18} />
            <span className="hidden sm:block">Connexion</span>
          </Link>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <Outlet />
      </main>

      {/* ── Footer ── */}
      <footer className="bg-white border-t border-mayfipay-border-light mt-auto">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <MayfiPayLogo size={28} />
              <div>
                <p className="font-semibold text-sm text-mayfipay-text">
                  MayfiPay Store
                </p>
                <p className="text-xs text-mayfipay-text-muted">
                  Paiements sécurisés en Afrique
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs text-mayfipay-text-muted">
              <div className="flex items-center gap-1">
                <Shield size={14} className="text-mayfipay-blue" />
                <span>© 2026 MayfiPay. Tous droits réservés.</span>
              </div>
              <span>·</span>
              <span>Sécurisé · Fiable · Rapide</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
