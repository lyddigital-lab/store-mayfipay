import { useState, useEffect } from 'react';
import { getVendeurSession, getBoutiqueByVendeur, getCommandesByVendeur } from '../../lib/supabase';
import { formatPrix, getStatutLabel, getStatutColor } from '../../utils/helpers';
import type { Boutique, Commande } from '../../types';

export default function VendeurDashboard() {
  const [boutique, setBoutique] = useState<Boutique | null>(null);
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const session = getVendeurSession();
      if (!session) return;
      const b = await getBoutiqueByVendeur(session.id);
      setBoutique(b);
      if (b) {
        const c = await getCommandesByVendeur(session.id);
        setCommandes(c);
      }
    } catch (err) {
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  }

  const totalVentes = commandes.filter(c => c.statut === 'livree').reduce((sum, c) => sum + c.montant_net, 0);
  const totalCommandes = commandes.length;

  if (loading) return <div className="p-8">Chargement...</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-mayfipay-text mb-6">Tableau de bord</h1>
      {!boutique ? (
        <div className="rounded-lg border border-mayfipay-border bg-white p-6 text-center">
          <p className="text-mayfipay-text-sec mb-2">Vous n'avez pas encore de boutique.</p>
          <button onClick={() => window.location.href = '/vendeur/parametres'}
            className="rounded-lg bg-mayfipay-orange px-4 py-2 text-sm font-medium text-white hover:bg-mayfipay-orange-dark">
            Créer ma boutique
          </button>
        </div>
      ) : (
        <>
          <div className="mb-6 rounded-lg border border-mayfipay-border bg-white p-6">
            <h2 className="font-semibold text-mayfipay-text mb-2">{boutique.nom}</h2>
            <p className="text-sm text-mayfipay-text-sec">{boutique.description}</p>
            <span className={`mt-2 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
              boutique.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
            }`}>
              {boutique.active ? 'Boutique publique' : 'Boutique privée'}
            </span>
          </div>

          <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-lg border border-mayfipay-border bg-white p-4">
              <p className="text-2xl font-bold text-mayfipay-orange">{totalVentes.toLocaleString('fr-FR')} FCFA</p>
              <p className="text-sm text-mayfipay-text-sec">Ventes totales</p>
            </div>
            <div className="rounded-lg border border-mayfipay-border bg-white p-4">
              <p className="text-2xl font-bold text-mayfipay-text">{totalCommandes}</p>
              <p className="text-sm text-mayfipay-text-sec">Commandes</p>
            </div>
            <div className="rounded-lg border border-mayfipay-border bg-white p-4">
              <p className="text-2xl font-bold text-mayfipay-blue">{commandes.filter(c => c.statut === 'en_attente_paiement').length}</p>
              <p className="text-sm text-mayfipay-text-sec">En attente</p>
            </div>
          </div>

          <div className="rounded-lg border border-mayfipay-border bg-white">
            <div className="p-4 border-b border-mayfipay-border">
              <h3 className="font-semibold text-mayfipay-text">Dernières commandes</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-mayfipay-border-light">
                    <th className="px-4 py-2 text-left text-xs font-medium text-mayfipay-text-muted">Code</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-mayfipay-text-muted">Produit</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-mayfipay-text-muted">Montant</th>
                    <th className="px-4 py-2 text-center text-xs font-medium text-mayfipay-text-muted">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {commandes.slice(0, 5).map(c => (
                    <tr key={c.id} className="border-t border-mayfipay-border">
                      <td className="px-4 py-2 text-sm text-mayfipay-text">{c.code}</td>
                      <td className="px-4 py-2 text-sm text-mayfipay-text">{c.produit?.nom || '—'}</td>
                      <td className="px-4 py-2 text-right text-sm text-mayfipay-text">{formatPrix(c.montant)}</td>
                      <td className="px-4 py-2 text-center">
                        <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${getStatutColor(c.statut)}`}>
                          {getStatutLabel(c.statut)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
