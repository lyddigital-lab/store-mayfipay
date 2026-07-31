import { useState, useEffect } from 'react';
import { getVendeurSession, getCommandesByVendeur } from '../../lib/supabase';
import { formatPrix, getStatutLabel, getStatutColor } from '../../utils/helpers';
import type { Commande } from '../../types';

export default function VendeurCommandes() {
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCommandes();
  }, []);

  async function loadCommandes() {
    try {
      const session = getVendeurSession();
      if (!session) return;
      const c = await getCommandesByVendeur(session.id);
      setCommandes(c);
    } catch (err) { console.error('Erreur:', err); }
    finally { setLoading(false); }
  }

  if (loading) return <div className="p-8">Chargement...</div>;

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-xl md:text-2xl font-bold text-mayfipay-text mb-4 md:mb-6">Mes commandes</h1>
      {commandes.length === 0 ? (
        <p className="text-mayfipay-text-sec">Aucune commande pour le moment.</p>
      ) : (
        <>
          {/* Vue mobile : cartes */}
          <div className="md:hidden space-y-3">
            {commandes.map(c => (
              <div key={c.id} className="rounded-lg border border-mayfipay-border bg-white p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-xs text-mayfipay-text-muted">Code</p>
                    <p className="font-medium text-mayfipay-text">{c.code}</p>
                  </div>
                  <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${getStatutColor(c.statut)}`}>
                    {getStatutLabel(c.statut)}
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-mayfipay-text"><span className="text-mayfipay-text-muted">Produit :</span> {c.produit?.nom || '—'}</p>
                  <p className="text-sm font-bold text-mayfipay-orange">{formatPrix(c.montant)}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Vue desktop : tableau */}
          <div className="hidden md:block overflow-x-auto rounded-lg border border-mayfipay-border bg-white">
            <table className="w-full">
              <thead>
                <tr className="bg-mayfipay-border-light">
                  <th className="px-4 py-2 text-left text-xs font-medium text-mayfipay-text-muted">Code</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-mayfipay-text-muted">Produit</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-mayfipay-text-muted">Acheteur</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-mayfipay-text-muted">Montant</th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-mayfipay-text-muted">Statut</th>
                </tr>
              </thead>
              <tbody>
                {commandes.map(c => (
                  <tr key={c.id} className="border-t border-mayfipay-border">
                    <td className="px-4 py-2 text-sm text-mayfipay-text">{c.code}</td>
                    <td className="px-4 py-2 text-sm text-mayfipay-text">{c.produit?.nom || '—'}</td>
                    <td className="px-4 py-2 text-sm text-mayfipay-text">{c.acheteur_id}</td>
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
        </>
      )}
    </div>
  );
}
