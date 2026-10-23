import fs from 'node:fs';
import { join } from 'node:path';
const root='C:/Users/DELL/Desktop/store-mayfipay/src';
function patch(rel, pairs){
  const p=join(root, rel);
  let c=fs.readFileSync(p,'utf8').replace(/\r\n/g,'\n');
  let applied=[];
  for(const [o,n] of pairs){
    if(c.indexOf(o)!==-1){ c=c.split(o).join(n); applied.push('OK:'+o.slice(0,44).replace(/\n/g,'§')); }
    else { applied.push('MISS:'+o.slice(0,44).replace(/\n/g,'§')); }
  }
  fs.writeFileSync(p,c,'utf8');
  console.log('PATCH '+rel); console.log(applied.join('\n'));
}
patch('pages/DevenirVendeur.tsx', [
 ["import { getAcheteurSession, getKycStatus, persistVendeurSession } from '../lib/supabase';", "import { getAcheteurSession } from '../lib/supabase';\nimport { getKycStatus } from '../lib/kyc';\nimport { persistVendeurSession } from '../lib/session';"],
 ["import type { KycStatus } from '../lib/supabase';", "import type { KycStatus } from '../lib/kyc';"],
]);
patch('pages/AcheteurDashboard.tsx', [
 ["import { supabase, getAcheteurSession, clearAcheteurSession, getVendeurSession } from '../lib/supabase';", "import { supabase, getAcheteurSession, clearAcheteurSession, getVendeurSession } from '../lib/supabase';\nimport { persistVendeurSession } from '../lib/session';\nimport { getKycStatus } from '../lib/kyc';"],
 ["  const [switching, setSwitching] = useState(false);\n\n  useEffect(() => {\n    if (!session) { navigate('/login?redirect=/mon-compte'); return; }\n    loadCommandes();\n  }, []);", "  const [switching, setSwitching] = useState(false);\n  const [kycVerified, setKycVerified] = useState(false);\n\n  useEffect(() => {\n    if (!session) { navigate('/login?redirect=/mon-compte'); return; }\n    loadCommandes();\n    getKycStatus(session.id).then(s => setKycVerified(s.etape === 'verified')).catch(() => {});\n  }, []);"],
 ["  function handleSwitch() {\n    setSwitching(true);\n    setTimeout(() => {\n      if (vendeurSession) {\n        navigate('/vendeur');\n      } else {\n        navigate('/login');\n      }\n    }, 3000);\n  }", "  function handleSwitch() {\n    let target = '/devenir-vendeur';\n    if (vendeurSession) {\n      target = '/vendeur';\n    } else if (kycVerified && session) {\n      persistVendeurSession({ id: session.id, nom: session.nom, tel: session.tel, role: 'vendeur' });\n      target = '/vendeur';\n    }\n    setSwitching(true);\n    setTimeout(() => navigate(target), 1200);\n  }"],
 ["{vendeurSession ? 'Passer en mode Vendeur' : 'Devenir vendeur'}", "{vendeurSession ? 'Passer en mode Vendeur' : kycVerified ? 'KYC vérifié — Accéder à l’espace vendeur' : 'Devenir vendeur'}"],
]);
patch('pages/Vendeur/Dashboard.tsx', [
 ["import { getVendeurSession, getBoutiqueByVendeur, getCommandesByVendeur } from '../../lib/supabase';", "import { getVendeurSession, getBoutiqueByVendeur, getCommandesByVendeur } from '../../lib/supabase';\nimport { persistAcheteurSession } from '../../lib/session';"],
 ["  function handleSwitchAcheteur() {\n    setSwitching(true);\n    setTimeout(() => navigate('/mon-compte'), 3000);\n  }", "  function handleSwitchAcheteur() {\n    const s = getVendeurSession();\n    if (s) {\n      persistAcheteurSession({ id: s.id, nom: s.nom, tel: s.tel, role: 'acheteur' });\n    }\n    setSwitching(true);\n    setTimeout(() => navigate('/'), 1500);\n  }"],
]);
patch('pages/Vendeur/Layout.tsx', [
 ["import { LayoutDashboard, Package, ShoppingCart, Truck, Settings, LogOut, Menu, X } from 'lucide-react';", "import { LayoutDashboard, Package, ShoppingCart, Truck, Settings, LogOut, Menu, X, Home } from 'lucide-react';"],
 ["        <nav className=\"p-2 space-y-1\">\n          <NavLink \n            to=\"/vendeur\" \n            end \n", "        <nav className=\"p-2 space-y-1\">\n          <NavLink \n            to=\"/\" \n            className=\"flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-mayfipay-text-sec hover:bg-mayfipay-orange-light hover:text-mayfipay-orange transition-colors\"\n          >\n            <Home className=\"h-4 w-4\" /> Accueil\n          </NavLink>\n          <NavLink \n            to=\"/vendeur\" \n            end \n"],
]);
patch('App.tsx', [
 ["import Login from './pages/Login';", "import Login from './pages/Login';\nimport DevenirVendeur from './pages/DevenirVendeur';"],
 ["        <Route path=\"/login\" element={<LoginLayout />}>\n          <Route index element={<Login />} />\n        </Route>", "        <Route path=\"/login\" element={<LoginLayout />}>\n          <Route index element={<Login />} />\n        </Route>\n\n        <Route path=\"/devenir-vendeur\" element={<DevenirVendeur />} />"],
]);

