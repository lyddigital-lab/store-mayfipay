import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { supabase, hashPassword, getAcheteurSession } from '../lib/supabase';

const COUNTRIES = [
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

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const [country, setCountry] = useState(COUNTRIES[0]);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCountries, setShowCountries] = useState(false);

  useEffect(() => {
    if (getAcheteurSession()) navigate(redirect, { replace: true });
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const passwordHash = await hashPassword(password);
      let localPhone = phone.replace(/[\s\-]/g, '');
      if (localPhone.startsWith('0')) localPhone = localPhone.slice(1);
      const normalizedPhone = country.code + localPhone;

      const { data: user, error: queryError } = await supabase
        .from('users')
        .select('id, nom, tel, role, pays')
        .eq('tel', normalizedPhone)
        .eq('password_hash', passwordHash)
        .single();

      if (queryError || !user) throw new Error('Numéro ou mot de passe incorrect');

      localStorage.setItem('store_acheteur_user', JSON.stringify({
        id: user.id, nom: user.nom, tel: user.tel, role: user.role, pays: user.pays,
      }));

      navigate(redirect, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500 to-orange-400 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-2xl shadow-lg mb-3 p-2">
            <img src="/logo.png" alt="MayfiPay" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-white">MayfiPay</h1>
          <p className="text-white/80 text-sm mt-1">Connectez-vous pour acheter</p>
        </div>

        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xl">
          <h2 className="text-lg font-bold text-gray-900 mb-1">Connexion</h2>
          <p className="text-sm text-gray-500 mb-5">Connectez-vous avec votre compte MayfiPay</p>

          {/* Connexion avec MayfiPay (SSO) */}
          <a
            href={`https://app.mayfipay.com/login?redirect=${encodeURIComponent(window.location.origin + '/sso')}&source=store`}
            className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl font-bold bg-gray-900 text-white hover:bg-gray-800 transition mb-4"
          >
            <span className="w-6 h-6 bg-orange-500 rounded-lg flex items-center justify-center text-white text-xs font-black">M</span>
            Se connecter avec MayfiPay
          </a>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-xs text-gray-400 font-medium">OU</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">{error}</div>}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1.5">Téléphone</label>
              <div className="flex gap-2">
                <div className="relative">
                  <button type="button" onClick={() => setShowCountries(!showCountries)}
                    className="flex items-center gap-1 px-3 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 min-w-[100px]">
                    <span>{country.flag}</span>
                    <span className="text-sm font-medium">+{country.code}</span>
                    <span className="text-xs text-gray-400">▼</span>
                  </button>
                  {showCountries && (
                    <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 w-64 max-h-60 overflow-y-auto">
                      {COUNTRIES.map(c => (
                        <button key={c.code} type="button" onClick={() => { setCountry(c); setShowCountries(false); }}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-orange-50 text-left ${c.code === country.code ? 'bg-orange-50' : ''}`}>
                          <span>{c.flag}</span>
                          <span className="text-sm flex-1">{c.name}</span>
                          <span className="text-xs text-gray-400">+{c.code}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <input type="tel" required value={phone}
                  onChange={e => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder={country.placeholder}
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1.5">Mot de passe</label>
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none" />
            </div>

            <button type="submit" disabled={loading || !phone || !password}
              className="w-full bg-orange-500 text-white py-3.5 rounded-xl font-bold hover:bg-orange-600 transition disabled:opacity-50">
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            Pas encore de compte ?{' '}
            <Link to={`/register?redirect=${encodeURIComponent(redirect)}`} className="text-orange-500 font-semibold hover:underline">
              Créer un compte MayfiPay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
