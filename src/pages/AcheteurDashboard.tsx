import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase, getAcheteurSession, clearAcheteurSession, getVendeurSession } from '../lib/supabase';
import { ShoppingBag, Package, Smartphone, ArrowRight, LogOut, Store } from 'lucide-react';

interface Commande {
  id: string;
  numero?: string;
  description?: string;
  montant: number;
  statut: string;
  created_at: string;
  acheteur_nom?: string;
}

const STATUT_CONFIG: Record<string, { label: string; color: string }> = {
  payee:    { label: 'En attente de livraison', color: 'bg-yellow-100 text-yellow-700' },
  en_cours: { label: 'En livraison',            color: 'bg-blue-100 text-blue-700'   },
  livree:   { label: 'Livrée',                  color: 'bg-green-100 text-green-700' },
  annulee:  { label: 'Annulée',                 color: 'bg-red-100 text-red-600'     },
};

export default function AcheteurDashboard() {
  const navigate = useNavigate();
  const session = getAcheteurSession();
  const vendeurSession = getVendeurSession();
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [loading, setLoading] = useState(true);
  const [switching, setSwitching] = useState(false);

  useEffect(() => {
    if (!session) { navigate('/login'); return; }
    loadCommandes();
  }, []);

  async function loadCommandes() {
    if (!session) return;
    try {
      // Commandes app/web (table commandes)
      const { data: appData } = await supabase
        .from('commandes')
        .select('id, numero, montant, statut, created_at')
        .eq('acheteur_id', session.id)
        .order('created_at', { ascending: false })
        .limit(20);

      // Commandes API/store (table api_commandes)
      const { data: apiData } = await supabase
        .from('api_commandes')
        .select('id, numero, description, montant, statut, created_at')
        .eq('acheteur_id', session.id)
        .order('created_at', { ascending: false })
        .limit(20);

      const all = [
        ...(appData || []).map(c => ({ ...c, description: c.numero })),
        ...(apiData || []),
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setCommandes(all);
    } catch (err) {
      console.error('Erreur chargement commandes:', err);
    } finally {
      setLoading(false);
    }
  }

  function handleSwitch() {
    setSwitching(true);
    setTimeout(() => {
      if (vendeurSession) {
        navigate('/vendeur');
      } else {
        navigate('/vendeur/login');
      }
    }, 3000);
  }

  function handleLogout() {
    clearAcheteurSession();
    navigate('/');
  }

  if (!session) return null;

  const enCours = commandes.filter(c => c.statut === 'payee' || c.statut === 'en_cours').length;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Switch animation overlay */}
      {switching && (
        <div className="fixed inset-0 bg-mayfipay-orange/90 z-50 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="flex items-center justify-center gap-4 text-2xl font-bold mb-2">
              <span>Acheteur</span>
              <ArrowRight className="w-8 h-8 animate-bounce" />
              <span>Vendeur</span>
            </div>
            <p className="text-white/80 text-sm">Changement de mode...</p>
          </div>
        </div>
      )}

      {/* Message de bienvenue */}
      <div className="bg-gradient-to-r from-mayfipay-orange to-orange-400 rounded-2xl p-5 mb-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/80 text-sm mb-0.5">Bonjour 👋</p>
            <h1 className="text-xl font-bold">{session.nom}</h1>
            <p className="text-white/70 text-xs mt-1">Vous êtes en mode <strong>Acheteur</strong></p>
          </div>
          <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-2xl font-black">
            {session.nom.charAt(0).toUpperCase()}
          </div>
        </div>

        {/* Switch vers vendeur */}
        <button
          onClick={handleSwitch}
          className="mt-4 w-full flex items-center justify-between bg-white/20 hover:bg-white/30 rounded-xl px-4 py-2.5 transition"
        >
          <div className="flex items-center gap-2">
            <Store className="w-4 h-4" />
            <span className="text-sm font-medium">
              {vendeurSession ? 'Passer en mode Vendeur' : 'Devenir vendeur'}
            </span>
          </div>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-mayfipay-border p-4 text-center">
          <p className="text-2xl font-black text-mayfipay-orange">{commandes.length}</p>
          <p className="text-xs text-mayfipay-text-sec mt-0.5">Commandes totales</p>
        </div>
        <div className="bg-white rounded-xl border border-mayfipay-border p-4 text-center">
          <p className="text-2xl font-black text-blue-600">{enCours}</p>
          <p className="text-xs text-mayfipay-text-sec mt-0.5">En cours</p>
        </div>
      </div>

      {/* CTA app mobile */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
        <div className="flex items-start gap-3">
          <Smartphone className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-blue-800 mb-1">Suivez vos commandes sur l'app MayfiPay</p>
            <p className="text-xs text-blue-600 mb-3">
              Recevez des notifications en temps réel, confirmez la livraison avec votre code et gérez votre coffre-fort depuis l'app.
            </p>
            <a
              href="https://mayfipay.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-100 px-3 py-1.5 rounded-lg hover:bg-blue-200 transition"
            >
              <Smartphone className="w-3.5 h-3.5" />
              Télécharger l'app
            </a>
          </div>
        </div>
      </div>

      {/* Comment ça marche - Coffre-fort */}
      <div className="bg-white border border-mayfipay-border rounded-xl p-4 mb-6">
        <h3 className="font-semibold text-mayfipay-text text-sm mb-3 flex items-center gap-2">
          🔒 Comment fonctionne le coffre-fort ?
        </h3>
        <ol className="space-y-2 text-xs text-mayfipay-text-sec">
          <li className="flex gap-2"><span className="font-bold text-mayfipay-orange shrink-0">1.</span> Vous payez → l'argent est sécurisé dans le coffre-fort MayfiPay</li>
          <li className="flex gap-2"><span className="font-bold text-mayfipay-orange shrink-0">2.</span> Le vendeur livre votre produit</li>
          <li className="flex gap-2"><span className="font-bold text-mayfipay-orange shrink-0">3.</span> Vous recevez un <strong>code de livraison à 6 chiffres</strong></li>
          <li className="flex gap-2"><span className="font-bold text-mayfipay-orange shrink-0">4.</span> Donnez ce code au vendeur <strong>uniquement après avoir reçu votre produit</strong></li>
          <li className="flex gap-2"><span className="font-bold text-mayfipay-orange shrink-0">5.</span> L'argent est libéré au vendeur ✅</li>
        </ol>
        <div className="mt-3 bg-orange-50 rounded-lg p-2.5 text-xs text-orange-700">
          <strong>⚠️ Ne donnez jamais le code avant d'avoir votre produit</strong> — une fois donné, le paiement est définitif.
        </div>
      </div>

      {/* Mes commandes */}
      <div>
        <h2 className="font-bold text-mayfipay-text mb-4 flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-mayfipay-orange" />
          Mes commandes
        </h2>

        {loading ? (
          <div className="text-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mayfipay-orange mx-auto"></div></div>
        ) : commandes.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-mayfipay-border">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-mayfipay-text-sec text-sm">Aucune commande pour l'instant</p>
            <Link to="/" className="text-mayfipay-orange text-sm font-medium mt-2 inline-block hover:underline">
              Découvrir les produits →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {commandes.map(cmd => {
              const config = STATUT_CONFIG[cmd.statut] || { label: cmd.statut, color: 'bg-gray-100 text-gray-600' };
              return (
                <div key={cmd.id} className="bg-white rounded-xl border border-mayfipay-border p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-mayfipay-text text-sm truncate">
                        {cmd.description || cmd.numero || 'Commande'}
                      </p>
                      <p className="text-xs text-mayfipay-text-muted mt-0.5">
                        {new Date(cmd.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-black text-mayfipay-orange">{cmd.montant.toLocaleString('fr-FR')} F</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${config.color}`}>
                        {config.label}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Déconnexion */}
      <button
        onClick={handleLogout}
        className="mt-8 w-full flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-red-600 py-2 transition"
      >
        <LogOut className="w-4 h-4" />
        Déconnexion
      </button>
    </div>
  );
}
