-- Ajouter pays_code dans zones_livraison
-- A executer dans le SQL Editor de Supabase

ALTER TABLE zones_livraison ADD COLUMN IF NOT EXISTS pays_code TEXT;

CREATE INDEX IF NOT EXISTS idx_zones_livraison_pays ON zones_livraison(pays_code);