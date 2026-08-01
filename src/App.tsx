import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Accueil from './pages/Accueil';
import BoutiqueDetail from './pages/BoutiqueDetail';
import ProduitDetail from './pages/ProduitDetail';
import Paiement from './pages/Paiement';
import Succes from './pages/Succes';
import VendeurLayout from './pages/Vendeur/Layout';
import VendeurLogin from './pages/Vendeur/Login';
import VendeurRegister from './pages/Vendeur/Register';
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
        {/* Pages publiques */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Accueil />} />
          <Route path="boutique/:slug" element={<BoutiqueDetail />} />
          <Route path="boutique/:slug/produit/:produitId" element={<ProduitDetail />} />
          <Route path="produit/:produitId" element={<ProduitDetail />} />
          <Route path="paiement" element={<Paiement />} />
          <Route path="succes" element={<Succes />} />
        </Route>

        {/* Espace vendeur */}
        <Route path="/vendeur/login" element={<VendeurLogin />} />
        <Route path="/vendeur/register" element={<VendeurRegister />} />
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
