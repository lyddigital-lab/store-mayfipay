import { Link } from 'react-router-dom';
import { Store } from 'lucide-react';

export default function Header() {
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
          <Link
            to="/vendeur/login"
            className="text-sm font-medium text-mayfipay-orange hover:text-orange-600"
          >
            Vendeur
          </Link>
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
