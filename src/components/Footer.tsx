import { Store } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-mayfipay-border mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Store className="h-5 w-5 text-mayfipay-orange" />
            <span className="font-semibold text-sm text-mayfipay-text">
              MayfiPay Store
            </span>
          </div>
          <p className="text-sm text-mayfipay-text-muted">
            &copy; {new Date().getFullYear()} MayfiPay. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}