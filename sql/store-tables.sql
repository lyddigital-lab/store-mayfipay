-- Tables pour le store MayfiPay (store.mayfipay.com)
-- À exécuter dans le SQL Editor de Supabase

-- 1. TABLE BOUTIQUES
CREATE TABLE IF NOT EXISTS boutiques (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vendeur_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  nom TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  ville TEXT,
  zones_livraison TEXT[] DEFAULT '{}',
  delai_livraison TEXT DEFAULT '24-48h',
  livreur_id UUID REFERENCES users(id),
  active BOOLEAN DEFAULT false,
  slug TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_boutiques_vendeur ON boutiques(vendeur_id);
CREATE INDEX IF NOT EXISTS idx_boutiques_active ON boutiques(active);
CREATE INDEX IF NOT EXISTS idx_boutiques_slug ON boutiques(slug);

-- 2. TABLE BOUTIQUES_PRODUITS (produits visibles sur le store)
CREATE TABLE IF NOT EXISTS boutiques_produits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  boutique_id UUID REFERENCES boutiques(id) ON DELETE CASCADE NOT NULL,
  produit_id UUID REFERENCES produits(id) ON DELETE CASCADE NOT NULL,
  visible BOOLEAN DEFAULT true,
  ordre INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(boutique_id, produit_id)
);

CREATE INDEX IF NOT EXISTS idx_bp_boutique ON boutiques_produits(boutique_id);
CREATE INDEX IF NOT EXISTS idx_bp_produit ON boutiques_produits(produit_id);
CREATE INDEX IF NOT EXISTS idx_bp_visible ON boutiques_produits(visible);

-- 3. TRIGGER updated_at
CREATE OR REPLACE FUNCTION update_boutiques_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_boutiques_updated_at_trigger ON boutiques;
CREATE TRIGGER update_boutiques_updated_at_trigger
  BEFORE UPDATE ON boutiques
  FOR EACH ROW EXECUTE FUNCTION update_boutiques_updated_at();

-- 4. RLS
ALTER TABLE boutiques ENABLE ROW LEVEL SECURITY;
ALTER TABLE boutiques_produits ENABLE ROW LEVEL SECURITY;

-- Les boutiques publiques sont visibles par tous
CREATE POLICY "Boutiques publiques visibles" ON boutiques
  FOR SELECT USING (active = true);

-- Les vendeurs gèrent leur propre boutique
CREATE POLICY "Vendeur gère sa boutique" ON boutiques
  FOR ALL TO authenticated
  USING (vendeur_id = auth.uid())
  WITH CHECK (vendeur_id = auth.uid());

-- Les produits visibles sont accessibles
CREATE POLICY "Produits visibles accessibles" ON boutiques_produits
  FOR SELECT USING (visible = true);

-- Les vendeurs gèrent leurs produits de boutique
CREATE POLICY "Vendeur gère ses produits de boutique" ON boutiques_produits
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM boutiques
      WHERE boutiques.id = boutiques_produits.boutique_id
      AND boutiques.vendeur_id = auth.uid()
    )
  );
