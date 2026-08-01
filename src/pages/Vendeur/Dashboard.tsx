import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getVendeurSession, getBoutiqueByVendeur, getCommandesByVendeur } from '../../lib/supabase';
import { formatPrix, getStatutLabel, getStatutColor } from '../../utils/helpers';
import { ShoppingBag, ArrowLeft } from 'lucide-react';
import type { Boutique, Commande } from '../../types';

export default function VendeurDashboard() {
  const navigate = useNavigate();
  const [boutique, setBoutique] = useState<Boutique | null>(null);
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [loading, setLoading] = useState(true);
  const [switching, setSwitching] = useState(false);

  const session = getVendeurSession();

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

  function handleSwitchAcheteur() {
    setSwitching(true);
    setTimeout(() => navigate('/mon-compte'), 3000);
  }

  if (loading) return <div className="p-8">Chargement...</div>;

  return (
    <div className="p-8">
      {/* Switch animation */}
      {switching && (
        <div className="fixed inset-0 bg-mayfipay-orange/90 z-50 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="flex items-center justify-center gap-4 text-2xl font-bold mb-2">
              <span>Vendeur</span>
              <ArrowLeft className="w-8 h-8 animate-bounce" />
              <span>Acheteur</span>
            </div>
            <p className="text-white/80 text-sm">Changement de mode...</p>
          </div>
        </div>
      )}

      {/* Bienvenue + switch */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-mayfipay-text-sec">Bonjour {session?.nom?.split(' ')[0]} 👋</p>
          <h1 className="text-2xl font-bold text-mayfipay-text">Tableau de bord</h1>
          <p className="text-xs text-mayfipay-text-muted mt-0.5">Vous êtes en mode <strong>Vendeur</strong></p>
        </div>
        <button onClick={handleSwitchAcheteur}
          className="flex items-center gap-2 px-3 py-2 bg-orange-50 text-mayfipay-orange text-sm font-medium rounded-xl hover:bg-orange-100 transition border border-orange-200">
          <ShoppingBag className="w-4 h-4" />
          Mode Acheteur
        </button>
      </div>
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
