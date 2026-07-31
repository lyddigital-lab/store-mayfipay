# Implementation Plan: VillesSelector Multi-Pays

[Overview]
Permettre au vendeur de configurer des villes de vente/expédition dans plusieurs pays simultanément depuis le formulaire de création/édition de produit.

Actuellement, `VillesSelector` n'affiche qu'un seul pays à la fois et **supprime les villes sélectionnées des autres pays** quand l'utilisateur change le pays dans le select. Cela empêche un vendeur congolais de configurer des expéditions vers le Cameroun, le Sénégal, etc. en même temps.

La refonte transforme le composant en un sélecteur multi-pays : le menu déroulant sert à **ajouter** des pays à la liste de configuration, et chaque pays dispose de son propre accordéon avec ses villes. Les villes sélectionnées de tous les pays sont conservées simultanément dans le tableau `VilleVente[]`.

[Types]
Le type `VilleVente` existant est suffisant — aucun changement de type n'est nécessaire.

```ts
// Existant dans types/index.ts — inchangé
export interface VilleVente {
  ville_id: string;
  ville: string;
  pays: string;        // nom du pays (utilisé pour l'affichage)
  type: 'local' | 'expedition';
  cout_mode?: 'fixe' | 'client' | 'gratuit';
  cout_montant?: number;
}

// Nouveau type interne à VillesSelector (pas exporté)
interface PaysActif {
  code: string;
  nom: string;
  drapeau: string;
  villes: string[];   // liste des villes disponibles pour ce pays
}
```

[Files]
Un seul fichier à modifier.

- **Modifié** : `c:/Users/DELL/Desktop/store-mayfipay/src/components/VillesSelector.tsx`
  - Refonte complète de la logique interne pour gérer plusieurs pays actifs simultanément
  - Le select pays devient un bouton "Ajouter un pays"
  - Chaque pays sélectionné est affiché dans un accordéon indépendant avec ses villes
  - Un bouton "✕ Retirer ce pays" permet de supprimer toutes les villes d'un pays d'un coup
  - La logique de suppression au changement de pays est retirée

- **Non modifié** : `ProduitForm.tsx` — l'interface `VillesSelector` (`value`/`onChange`) reste identique
- **Non modifié** : `types/index.ts` — `VilleVente` est inchangé
- **Non modifié** : `supabase.ts` — aucun impact

[Functions]
Description des fonctions modifiées et nouvelles dans `VillesSelector.tsx`.

**Fonctions supprimées :**
- L'`useEffect` sur `[selectedPays, value, onChange]` qui filtrait et supprimait les villes des autres pays → remplacé par la logique `addPays`

**Fonctions nouvelles :**
```ts
// Ajoute un pays à la liste des pays actifs (charge ses villes depuis Supabase)
async function addPays(paysCode: string): Promise<void>

// Retire tous les villes d'un pays du tableau value et supprime le pays actif
function removePays(paysCode: string): void

// Reste inchangé — bascule local/expedition pour une ville
function toggleVille(villeNom: string, type: 'local' | 'expedition'): void

// Reste inchangé — met à jour le coût d'expédition
function updateCout(villeNom: string, mode: ..., montant?: number): void
```

**État interne modifié :**
```ts
// Avant
const [selectedPays, setSelectedPays] = useState(defaultPays);
const [villes, setVilles] = useState<string[]>([]);

// Après
const [paysActifs, setPaysActifs] = useState<PaysActif[]>([]);
const [paysAAjouter, setPaysAAjouter] = useState('');  // select "ajouter un pays"
```

[Classes]
Aucune classe à modifier — le projet utilise des composants React fonctionnels.

[Dependencies]
Aucune nouvelle dépendance — les fonctions `getPays()` et `getVilles(paysCode)` de `supabase.ts` sont déjà disponibles.

[Testing]
Tests manuels à effectuer après implémentation.

1. **Création d'un produit** : Ajouter Congo → cocher Brazzaville (Local) → ajouter Cameroun → cocher Douala (Expédition) → sauvegarder → vérifier que `villes_vente` contient les 2 villes
2. **Édition d'un produit existant** : Charger un produit avec des villes déjà configurées → vérifier qu'elles s'affichent correctement dans leurs pays respectifs
3. **Retrait d'un pays** : Retirer le Cameroun → vérifier que seules les villes camerounaises sont supprimées
4. **Initialisation depuis boutique** : Pour un nouveau produit, vérifier que les villes par défaut de la boutique (Congo) sont pré-chargées

[Implementation Order]
Ordre séquentiel de modification.

1. Retravailler l'état interne de `VillesSelector` : remplacer `selectedPays`/`villes` par `paysActifs[]` et `paysAAjouter`
2. Modifier `loadData()` : charger les pays disponibles + initialiser `paysActifs` avec `defaultPays` (CG par défaut) ou depuis les villes déjà dans `value`
3. Ajouter `addPays()` : charge les villes du pays depuis Supabase, crée un `PaysActif`, l'ajoute à `paysActifs`
4. Ajouter `removePays()` : supprime le pays de `paysActifs` et retire ses villes de `value`
5. Refaire le JSX :
   - Select "Ajouter un pays" en haut (masque les pays déjà actifs)
   - Pour chaque `paysActif` : section accordéon avec drapeau + nom + bouton "✕" + liste des villes
   - Garder la logique toggleVille/updateCout existante (inchangée)
   - Garder le récap en bas
6. Retirer l'`useEffect` problématique sur `[selectedPays, value, onChange]`
7. Build + déploiement Vercel
