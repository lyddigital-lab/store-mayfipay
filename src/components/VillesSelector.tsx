import { useState, useEffect } from 'react';
import { MapPin, Truck, Package, X, Plus, AlertTriangle } from 'lucide-react';
import { getVilles, getPays } from '../lib/supabase';
import type { Pays, VilleVente } from '../types';

interface VillesSelectorProps {
  value: VilleVente[];
  onChange: (villes: VilleVente[]) => void;
  defaultPays?: string;
}

interface PaysActif {
  code: string;
  nom: string;
  drapeau: string;
  villes: string[];
}

export default function VillesSelector({ value, onChange, defaultPays = 'CG' }: VillesSelectorProps) {
  const [paysList, setPaysList] = useState<Pays[]>([]);
  const [paysActifs, setPaysActifs] = useState<PaysActif[]>([]);
  const [paysAAjouter, setPaysAAjouter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const paysData = await getPays();
      setPaysList(paysData);

      // Initialiser avec le pays par défaut ou les pays déjà dans value
      const paysCodesExistants = new Set(value.map(v => {
        const pays = paysData.find(p => p.nom === v.pays);
        return pays?.code || defaultPays;
      }));

      if (paysCodesExistants.size === 0) {
        paysCodesExistants.add(defaultPays);
      }

      const actifs: PaysActif[] = [];
      for (const code of paysCodesExistants) {
        const pays = paysData.find(p => p.code === code);
        if (pays) {
          const villesData = await getVilles(code);
          actifs.push({
            code: pays.code,
            nom: pays.nom,
            drapeau: pays.drapeau,
            villes: villesData,
          });
        }
      }
      setPaysActifs(actifs);
    } catch (err) {
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  }

  async function addPays() {
    if (!paysAAjouter || paysActifs.find(p => p.code === paysAAjouter)) return;
    
    const pays = paysList.find(p => p.code === paysAAjouter);
    if (!pays) return;

    try {
      const villesData = await getVilles(paysAAjouter);
      setPaysActifs([...paysActifs, {
        code: pays.code,
        nom: pays.nom,
        drapeau: pays.drapeau,
        villes: villesData,
      }]);
      setPaysAAjouter('');
    } catch (err) {
      console.error('Erreur:', err);
    }
  }

  function removePays(paysCode: string) {
    const pays = paysActifs.find(p => p.code === paysCode);
    if (!pays) return;

    // Retirer toutes les villes de ce pays
    onChange(value.filter(v => v.pays !== pays.nom));
    setPaysActifs(paysActifs.filter(p => p.code !== paysCode));
  }

  function toggleVille(paysNom: string, villeNom: string, type: 'local' | 'expedition') {
    const existing = value.find(v => v.ville === villeNom && v.pays === paysNom);
    
    if (existing) {
      if (existing.type === type) {
        // Même type cliqué = désélectionner
        onChange(value.filter(v => !(v.ville === villeNom && v.pays === paysNom)));
      } else {
        // Type différent = changer le type
        onChange(value.map(v => 
          v.ville === villeNom && v.pays === paysNom 
            ? { ...v, type, cout_mode: type === 'expedition' ? 'gratuit' : undefined, cout_montant: 0 } 
            : v
        ));
      }
    } else {
      const newVille: VilleVente = {
        ville_id: villeNom,
        ville: villeNom,
        pays: paysNom,
        type,
        cout_mode: type === 'expedition' ? 'gratuit' : undefined,
        cout_montant: 0,
      };
      onChange([...value, newVille]);
    }
  }

  function updateCout(paysNom: string, villeNom: string, mode: 'fixe' | 'client' | 'gratuit', montant?: number) {
    onChange(value.map(v =>
      v.ville === villeNom && v.pays === paysNom
        ? { ...v, cout_mode: mode, cout_montant: mode === 'fixe' ? (montant || 0) : 0 }
        : v
    ));
  }

  if (loading) {
    return <div className="text-sm text-mayfipay-text-sec">Chargement...</div>;
  }

  const paysDisponibles = paysList.filter(p => !paysActifs.find(pa => pa.code === p.code));

  return (
    <div className="space-y-4">
      {/* Ajouter un pays */}
      <div className="flex gap-2">
        <select
          value={paysAAjouter}
          onChange={(e) => setPaysAAjouter(e.target.value)}
          className="flex-1 rounded-lg border border-mayfipay-border bg-white px-3 py-2 text-sm focus:border-mayfipay-orange focus:outline-none"
        >
          <option value="">Ajouter un pays...</option>
          {paysDisponibles.map(p => (
            <option key={p.code} value={p.code}>{p.drapeau} {p.nom}</option>
          ))}
        </select>
        <button
          type="button"
          onClick={addPays}
          disabled={!paysAAjouter}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-mayfipay-orange text-white text-sm font-medium hover:bg-mayfipay-orange-dark disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          <Plus size={16} />
          Ajouter
        </button>
      </div>

      {/* Liste des pays actifs */}
      {paysActifs.map(pays => {
        const villesPays = value.filter(v => v.pays === pays.nom);
        const isEtranger = pays.code !== defaultPays;

        return (
          <div key={pays.code} className="rounded-lg border border-mayfipay-border bg-white p-4">
            {/* En-tête pays */}
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-mayfipay-text flex items-center gap-2">
                <span className="text-xl">{pays.drapeau}</span>
                {pays.nom}
              </h3>
              <button
                type="button"
                onClick={() => removePays(pays.code)}
                className="text-red-500 hover:text-red-700 transition"
                title="Retirer ce pays"
              >
                <X size={18} />
              </button>
            </div>

            {/* Message d'avertissement pour pays étrangers */}
            {isEtranger && (
              <div className="mb-3 flex gap-2 rounded-lg bg-yellow-50 border border-yellow-200 p-3">
                <AlertTriangle size={16} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-yellow-800">
                  <strong>Envoi vers l'étranger :</strong> Avant d'activer ce pays, soyez sûr de savoir comment envoyer vos colis là-bas : quel transporteur utiliser, combien ça coûte et combien de temps ça prend. Si vous n'êtes pas sûr, il vaut mieux ne pas cocher de villes ici pour l'instant.
                </div>
              </div>
            )}

            <p className="text-xs text-mayfipay-text-muted mb-3">
              Cochez "Local" pour les villes où le produit est disponible sur place. Cochez "Expédition" pour les villes où vous acceptez d'expédier.
            </p>

            {/* Grille des villes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {pays.villes.map(villeNom => {
                const config = villesPays.find(v => v.ville === villeNom);
                const isLocal = config?.type === 'local';
                const isExpedition = config?.type === 'expedition';

                return (
                  <div key={villeNom} className="rounded-lg border border-mayfipay-border-light bg-gray-50 p-2.5">
                    <div className="flex items-center gap-1.5 mb-2">
                      <MapPin size={12} className="text-mayfipay-text-muted flex-shrink-0" />
                      <span className="text-xs font-medium text-mayfipay-text truncate">{villeNom}</span>
                    </div>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => toggleVille(pays.nom, villeNom, 'local')}
                        className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded text-xs font-medium transition ${
                          isLocal
                            ? 'bg-green-100 text-green-700 border border-green-300'
                            : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <Package size={10} />
                        Local
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleVille(pays.nom, villeNom, 'expedition')}
                        className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded text-xs font-medium transition ${
                          isExpedition
                            ? 'bg-blue-100 text-blue-700 border border-blue-300'
                            : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <Truck size={10} />
                        Expéd.
                      </button>
                    </div>

                    {/* Config expédition */}
                    {isExpedition && (
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <select
                          value={config?.cout_mode || 'gratuit'}
                          onChange={(e) => updateCout(pays.nom, villeNom, e.target.value as any, config?.cout_montant)}
                          className="w-full rounded border border-mayfipay-border px-2 py-1 text-xs focus:border-mayfipay-orange focus:outline-none mb-1"
                        >
                          <option value="gratuit">Gratuit</option>
                          <option value="fixe">Montant fixe</option>
                          <option value="client">Client paie</option>
                        </select>
                        {config?.cout_mode === 'fixe' && (
                          <input
                            type="number"
                            value={config?.cout_montant || 0}
                            onChange={(e) => updateCout(pays.nom, villeNom, 'fixe', parseInt(e.target.value) || 0)}
                            placeholder="Montant FCFA"
                            className="w-full rounded border border-mayfipay-border px-2 py-1 text-xs focus:border-mayfipay-orange focus:outline-none"
                          />
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Récapitulatif */}
      {value.length > 0 && (
        <div className="rounded-lg bg-mayfipay-border-light p-3">
          <p className="text-xs font-semibold text-mayfipay-text">
            {value.filter(v => v.type === 'local').length} ville(s) locale(s) · {' '}
            {value.filter(v => v.type === 'expedition').length} ville(s) en expédition
          </p>
        </div>
      )}
    </div>
  );
}
