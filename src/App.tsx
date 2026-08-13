import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import LoginLayout from './components/LoginLayout';
import Accueil from './pages/Accueil';
import BoutiqueDetail from './pages/BoutiqueDetail';
import ProduitDetail from './pages/ProduitDetail';
import Paiement from './pages/Paiement';
import Succes from './pages/Succes';
import Login from './pages/Login';
import DevenirVendeur from './pages/DevenirVendeur';
import SSOCallback from './pages/SSOCallback';
import AcheteurDashboard from './pages/AcheteurDashboard';
import VendeurLayout from './pages/Vendeur/Layout';
import VendeurDashboard from './pages/Vendeur/Dashboard';
import VendeurParametres from './pages/Vendeur/Parametres';
import VendeurProduits from './pages/Vendeur/Produits';
import VendeurProduitForm from './pages/Vendeur/ProduitForm';
import VendeurCommandes from './pages/Vendeur/Commandes';
import VendeurLivreurs from './pages/Vendeur/Livreurs';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth / login pages — premium minimalist layout */}
        <Route path="/login" element={<LoginLayout />}>
          <Route index element={<Login />} />
        </Route>

        <Route path="/devenir-vendeur" element={<DevenirVendeur />} />

        {/* Main store — standard layout */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Accueil />} />
          <Route path="boutique/:slug" element={<BoutiqueDetail />} />
          <Route path="boutique/:slug/produit/:produitId" element={<ProduitDetail />} />
          <Route path="produit/:produitId" element={<ProduitDetail />} />
          <Route path="paiement" element={<Paiement />} />
          <Route path="succes" element={<Succes />} />
          <Route path="sso" element={<SSOCallback />} />
          <Route path="mon-compte" element={<AcheteurDashboard />} />
        </Route>

        {/* Espace vendeur */}
        <Route path="/vendeur" element={<VendeurLayout />}>
          <Route index element={<VendeurDashboard />} />
          <Route path="parametres" element={<VendeurParametres />} />
          <Route path="produits" element={<VendeurProduits />} />
          <Route path="produit/nouveau" element={<VendeurProduitForm />} />
          <Route path="produit/:id" element={<VendeurProduitForm />} />
          <Route path="commandes" element={<VendeurCommandes />} />
          <Route path="livreurs" element={<VendeurLivreurs />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
