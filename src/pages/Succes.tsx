import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, Download } from 'lucide-react';

export default function Succes() {
  const [searchParams] = useSearchParams();
  const code = searchParams.get('code');

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <div className="mb-6 flex justify-center">
        <CheckCircle className="h-16 w-16 text-mayfipay-success" />
      </div>
      <h1 className="text-2xl font-bold text-mayfipay-text mb-2">Commande créée avec succès !</h1>
      {code && <p className="text-mayfipay-text-sec mb-6">Code de commande : <strong>{code}</strong></p>}
      <div className="mb-6 rounded-lg border border-mayfipay-border bg-mayfipay-orange-light p-4">
        <p className="text-sm text-mayfipay-text">
          Un SMS a été envoyé à votre téléphone avec un lien pour télécharger l'app MayfiPay
          et suivre votre commande.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link to="/" className="rounded-lg bg-mayfipay-orange px-6 py-3 text-sm font-medium text-white hover:bg-mayfipay-orange-dark transition-colors">
          Continuer mes achats
        </Link>
        <a href="https://app.mayfipay.com" className="inline-flex items-center justify-center gap-2 rounded-lg border border-mayfipay-border px-6 py-3 text-sm font-medium text-mayfipay-text hover:bg-mayfipay-border-light transition-colors">
          <Download className="h-4 w-4" />
          Télécharger l'app
        </a>
      </div>
    </div>
  );
}
