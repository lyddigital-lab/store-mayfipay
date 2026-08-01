import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase, getProduitDetail, checkDisponibiliteVille, getPays, getVilles } from '../lib/supabase';
import { formatPrix } from '../utils/helpers';
import type { Produit, Pays, ExpeditionInfo } from '../types';
import { Shield, Lock } from 'lucide-react';

const COUNTRIES_TEL = [
  { code: '242', name: 'Congo Brazzaville', flag: '\u{1F1E8}\u{1F1EC}', placeholder: '06 XXX XX XX' },
  { code: '243', name: 'RDC Congo', flag: '\u{1F1E8}\u{1F1E9}', placeholder: '09 XXX XX XX' },
  { code: '237', name: 'Cameroun', flag: '\u{1F1E8}\u{1F1F2}', placeholder: '6X XXX XX XX' },
  { code: '225', name: "Côte d'Ivoire", flag: '\u{1F1E8}\u{1F1EE}', placeholder: '07 XXX XX XX' },
  { code: '221', name: 'Sénégal', flag: '\u{1F1F8}\u{1F1F3}', placeholder: '7X XXX XX XX' },
  { code: '229', name: 'Bénin', flag: '\u{1F1E7}\u{1F1EF}', placeholder: '9X XXX XXX' },
  { code: '226', name: 'Burkina Faso', flag: '\u{1F1E7}\u{1F1EB}', placeholder: '7X XX XX XX' },
  { code: '241', name: 'Gabon', flag: '\u{1F1EC}\u{1F1E6}', placeholder: '0X XX XX XX' },
  { code: '233', name: 'Ghana', flag: '\u{1F1EC}\u{1F1ED}', placeholder: '2X XXX XXXX' },
  { code: '254', name: 'Kenya', flag: '\u{1F1F0}\u{1F1EA}', placeholder: '7XX XXX XXX' },
  { code: '256', name: 'Ouganda', flag: '\u{1F1FA}\u{1F1EC}', placeholder: '7XX XXX XXX' },
  { code: '255', name: 'Tanzanie', flag: '\u{1F1F9}\u{1F1FF}', placeholder: '7XX XXX XXX' },
  { code: '250', name: 'Rwanda', flag: '\u{1F1F7}\u{1F1FC}', placeholder: '7X XXX XXXX' },
  { code: '260', name: 'Zambie', flag: '\u{1F1FF}\u{1F1F2}', placeholder: '9X XXX XXXX' },
  { code: '265', name: 'Malawi', flag: '\u{1F1F2}\u{1F1FC}', placeholder: '9XX XXX XXX' },
  { code: '234', name: 'Nigeria', flag: '\u{1F1F3}\u{1F1EC}', placeholder: '80X XXX XXXX' },
];

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export default function Paiement() {
  const [searchParams] = useSearchParams();
  const produitId = searchParams.get('produit_id');
  const villePreselected = searchParams.get('ville') || '';

  const [produit, setProduit] = useState<Produit | null>(null);
  const [loading, setLoading] = useState(!!produitId);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Localisation acheteur
  const [paysList, setPaysList] = useState<Pays[]>([]);
  const [villesList, setVillesList] = useState<string[]>([]);
  const [selectedPays, setSelectedPays] = useState('');
  const [selectedVille, setSelectedVille] = useState(villePreselected);
  const [expeditionInfo, setExpeditionInfo] = useState<ExpeditionInfo | null>(null);
  const [quartier, setQuartier] = useState('');

  // Infos acheteur
  const [nom, setNom] = useState('');
  const [countryTel, setCountryTel] = useState(COUNTRIES_TEL[0]);
  const [tel, setTel] = useState('');
  const [password, setPassword] = useState('');
  const [showCountries, setShowCountries] = useState(false);

  // Frais d'expédition calculés
  const fraisExpedition = expeditionInfo?.cout || 0;
  const fraisAcheteur = produit ? Math.round(produit.prix * 0.035) : 0;
  const total = produit ? produit.prix + fraisAcheteur + fraisExpedition : 0;

  useEffect(() => {
    if (produitId) loadProduit();
    loadPays();
  }, [produitId]);

  useEffect(() => {
    if (selectedPays) {
      getVilles(selectedPays).then(v => { setVillesList(v); setSelectedVille(''); });
    }
  }, [selectedPays]);

  useEffect(() => {
    if (produit && selectedVille) {
      const info = checkDisponibiliteVille(produit, selectedVille);
      setExpeditionInfo(info);
    } else {
      setExpeditionInfo(null);
    }
  }, [selectedVille, produit]);

  async function loadProduit() {
    try {
      const p = await getProduitDetail(produitId!);
      setProduit(p);
    } catch {
      console.error('Erreur chargement produit');
    } finally {
      setLoading(false);
    }
  }

  async function loadPays() {
    const p = await getPays();
    setPaysList(p);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!produit) return;
    setError('');
    setSubmitting(true);

    try {
      const passwordHash = await hashPassword(password);
      let localPhone = tel.replace(/[\s\-]/g, '');
      if (localPhone.startsWith('0')) localPhone = localPhone.slice(1);
      const fullPhone = countryTel.code + localPhone;

      // 1. Créer/récupérer le compte MayfiPay acheteur
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('tel', fullPhone)
        .eq('password_hash', passwordHash)
        .single();

      let userId: string;

      if (existingUser) {
        userId = existingUser.id;
      } else {
        const { data: phoneExists } = await supabase
          .from('users')
          .select('id')
          .eq('tel', fullPhone)
          .single();

        if (phoneExists) {
          setError('Un compte existe déjà avec ce numéro. Vérifiez votre mot de passe.');
          setSubmitting(false);
          return;
        }

        const { data: newUser, error: createErr } = await supabase
          .from('users')
          .insert({
            nom: nom.trim(),
            tel: fullPhone,
            password_hash: passwordHash,
            role: 'acheteur',
            source: 'store',
            pays: countryTel.name,
          })
          .select()
          .single();

        if (createErr || !newUser) throw new Error('Erreur création compte');
        userId = newUser.id;

        await supabase.from('portefeuilles').upsert({
          user_id: userId, solde_disponible: 0, solde_coffre_fort: 0,
        }, { onConflict: 'user_id', ignoreDuplicates: true });
      }

      // 2. Initier le paiement via Edge Function moneroo-payment
      const adresse = `${quartier ? quartier + ', ' : ''}${selectedVille}`;
      const { data: paymentData, error: paymentError } = await supabase.functions.invoke('moneroo-payment', {
        body: {
          action: 'initialize',
          data: {
            montant: total,
            description: `Achat: ${produit.nom}`,
            customer: {
              email: `${fullPhone}@mayfipay.app`,
              first_name: nom.trim().split(' ')[0] || 'Client',
              last_name: nom.trim().split(' ').slice(1).join(' ') || 'MayfiPay',
              phone: '+' + fullPhone,
            },
            methods: ['mtn_cg', 'airtel_cg'],
            metadata: {
              produit_id: produit.id,
              vendeur_id: produit.vendeur_id,
              acheteur_id: userId,
              acheteur_nom: nom.trim(),
              acheteur_tel: fullPhone,
              adresse_livraison: adresse,
              prix_produit: produit.prix,
              frais_acheteur: fraisAcheteur,
              frais_expedition: fraisExpedition,
              source: 'store',
            },
            return_url: `${window.location.origin}/succes`,
          },
        },
      });

      if (paymentError || !paymentData?.success) {
        throw new Error(paymentData?.error || 'Erreur lors du paiement');
      }

      // Sauvegarder session acheteur
      localStorage.setItem('mayfipay_user', JSON.stringify({
        id: userId, nom: nom.trim(), tel: fullPhone, role: 'acheteur',
      }));

      // Rediriger vers Moneroo
      window.location.href = paymentData.data?.data?.checkout_url;
    } catch (err: any) {
      setError(err.message || 'Erreur');
      setSubmitting(false);
    }
  }

  if (loading) return <div className="max-w-2xl mx-auto px-4 py-16 text-center">Chargement...</div>;
  if (!produit) return <div className="max-w-2xl mx-auto px-4 py-16 text-center">Produit introuvable.</div>;

  const villesDisponibles = (produit.villes_vente || []).map(v => v.ville);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold text-mayfipay-text mb-6">Finaliser votre achat</h1>

      {/* Récap produit */}
      <div className="mb-6 rounded-xl border border-mayfipay-border bg-white p-4">
        <div className="flex gap-4 items-center">
          <div className="w-16 h-16 rounded-lg bg-mayfipay-border-light flex items-center justify-center overflow-hidden shrink-0">
            {(produit.photos?.[0] || produit.image_url) ? (
              <img src={produit.photos?.[0] || produit.image_url!} alt={produit.nom} className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl">{produit.emoji || '📦'}</span>
            )}
          </div>
          <div className="flex-1">
            <p className="font-semibold text-mayfipay-text">{produit.nom}</p>
            <p className="text-sm text-mayfipay-text-sec">{produit.vendeur?.nom}</p>
          </div>
          <p className="text-lg font-black text-mayfipay-orange">{formatPrix(produit.prix)}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Section: Vos informations */}
        <div className="rounded-xl border border-mayfipay-border bg-white p-5">
          <h2 className="font-semibold text-mayfipay-text mb-4">Vos informations</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-mayfipay-text mb-1.5">Nom complet *</label>
              <input type="text" required value={nom} onChange={e => setNom(e.target.value)}
                placeholder="Ex: Marie Ngoma"
                className="w-full rounded-lg border border-mayfipay-border px-3 py-2.5 text-sm focus:border-mayfipay-orange focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-mayfipay-text mb-1.5">Téléphone Mobile Money *</label>
              <div className="flex gap-2">
                <div className="relative">
                  <button type="button" onClick={() => setShowCountries(!showCountries)}
                    className="flex items-center gap-1 px-3 py-2.5 border border-mayfipay-border rounded-lg hover:bg-gray-50 min-w-[90px]">
                    <span>{countryTel.flag}</span>
                    <span className="text-sm">+{countryTel.code}</span>
                    <span className="text-xs text-gray-400">▼</span>
                  </button>
                  {showCountries && (
                    <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 w-56 max-h-52 overflow-y-auto">
                      {COUNTRIES_TEL.map(c => (
                        <button key={c.code} type="button" onClick={() => { setCountryTel(c); setShowCountries(false); }}
                          className={`w-full flex items-center gap-2 px-3 py-2 hover:bg-orange-50 text-left text-sm ${c.code === countryTel.code ? 'bg-orange-50' : ''}`}>
                          <span>{c.flag}</span><span className="flex-1">{c.name}</span><span className="text-gray-400">+{c.code}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <input type="tel" required value={tel} onChange={e => setTel(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder={countryTel.placeholder}
                  className="flex-1 rounded-lg border border-mayfipay-border px-3 py-2.5 text-sm focus:border-mayfipay-orange focus:outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-mayfipay-text mb-1.5">Mot de passe *</label>
              <input type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Minimum 6 caractères"
                className="w-full rounded-lg border border-mayfipay-border px-3 py-2.5 text-sm focus:border-mayfipay-orange focus:outline-none" />
              <p className="text-xs text-mayfipay-text-muted mt-1">Pour vous connecter et suivre votre commande sur MayfiPay</p>
            </div>
          </div>
        </div>

        {/* Section: Livraison */}
        <div className="rounded-xl border border-mayfipay-border bg-white p-5">
          <h2 className="font-semibold text-mayfipay-text mb-4">Adresse de livraison</h2>
          <div className="space-y-4">
            {/* Pays */}
            <div>
              <label className="block text-sm font-medium text-mayfipay-text mb-1.5">Pays</label>
              <select value={selectedPays} onChange={e => setSelectedPays(e.target.value)}
                className="w-full rounded-lg border border-mayfipay-border px-3 py-2.5 text-sm focus:border-mayfipay-orange focus:outline-none">
                <option value="">Choisir votre pays</option>
                {paysList.map(p => <option key={p.code} value={p.code}>{p.drapeau} {p.nom}</option>)}
              </select>
            </div>
            {/* Ville */}
            <div>
              <label className="block text-sm font-medium text-mayfipay-text mb-1.5">Ville *</label>
              {villesDisponibles.length > 0 ? (
                <select required value={selectedVille} onChange={e => setSelectedVille(e.target.value)}
                  className="w-full rounded-lg border border-mayfipay-border px-3 py-2.5 text-sm focus:border-mayfipay-orange focus:outline-none">
                  <option value="">Choisir une ville</option>
                  {villesDisponibles.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              ) : (
                <select required value={selectedVille} onChange={e => setSelectedVille(e.target.value)}
                  className="w-full rounded-lg border border-mayfipay-border px-3 py-2.5 text-sm focus:border-mayfipay-orange focus:outline-none">
                  <option value="">Choisir une ville</option>
                  {villesList.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              )}
              {expeditionInfo && (
                <p className={`mt-1 text-xs ${expeditionInfo.disponible ? 'text-green-600' : 'text-red-500'}`}>
                  {expeditionInfo.message}
                </p>
              )}
            </div>
            {/* Quartier */}
            <div>
              <label className="block text-sm font-medium text-mayfipay-text mb-1.5">Quartier / Adresse</label>
              <input type="text" value={quartier} onChange={e => setQuartier(e.target.value)}
                placeholder="Ex: Bacongo, près du marché..."
                className="w-full rounded-lg border border-mayfipay-border px-3 py-2.5 text-sm focus:border-mayfipay-orange focus:outline-none" />
            </div>
          </div>
        </div>

        {/* Récap prix */}
        <div className="rounded-xl border border-mayfipay-border bg-white p-5">
          <h2 className="font-semibold text-mayfipay-text mb-3">Récapitulatif</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-mayfipay-text-sec">Prix produit</span>
              <span>{formatPrix(produit.prix)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-mayfipay-text-sec">Frais Mobile Money (3.5%)</span>
              <span>+{formatPrix(fraisAcheteur)}</span>
            </div>
            {fraisExpedition > 0 && (
              <div className="flex justify-between">
                <span className="text-mayfipay-text-sec">Frais d'expédition</span>
                <span>+{formatPrix(fraisExpedition)}</span>
              </div>
            )}
            <div className="border-t border-mayfipay-border mt-2 pt-2 flex justify-between font-bold">
              <span>Total à payer</span>
              <span className="text-mayfipay-orange text-lg">{formatPrix(total)}</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>
        )}

        <button type="submit"
          disabled={submitting || (expeditionInfo !== null && !expeditionInfo.disponible) || !nom || !tel || !password}
          className="w-full rounded-xl bg-mayfipay-orange px-6 py-4 font-bold text-white hover:bg-mayfipay-orange-dark disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
          <Lock className="h-4 w-4" />
          {submitting ? 'Traitement...' : `Payer ${formatPrix(total)}`}
        </button>

        <div className="flex items-center justify-center gap-2 text-xs text-mayfipay-text-muted">
          <Shield className="h-4 w-4 text-green-500" />
          <span>Paiement sécurisé — votre argent est protégé jusqu'à la livraison</span>
        </div>
      </form>
    </div>
  );
}
