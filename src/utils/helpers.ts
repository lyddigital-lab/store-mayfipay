export function formatPrix(prix: number): string {
  return prix.toLocaleString('fr-FR') + ' FCFA';
}

export function getInitials(nom: string): string {
  return nom
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function getDeepLink(produitId: string, prix: number): string {
  // Deep link vers l'app MayfiPay
  return `mayfipay://paiement?produit_id=${produitId}&montant=${prix}`;
}

export function getAppUrl(): string {
  return 'https://app.mayfipay.com';
}

export function getStatutLabel(statut: string): string {
  const labels: Record<string, string> = {
    en_attente_paiement: 'En attente de paiement',
    payee: 'Payée',
    en_cours: 'En cours',
    livree: 'Livrée',
    terminee: 'Terminée',
    annulee: 'Annulée',
    litige: 'Litige',
  };
  return labels[statut] || statut;
}

export function getStatutColor(statut: string): string {
  const colors: Record<string, string> = {
    en_attente_paiement: 'bg-yellow-100 text-yellow-700',
    payee: 'bg-blue-100 text-blue-700',
    en_cours: 'bg-purple-100 text-purple-700',
    livree: 'bg-green-100 text-green-700',
    terminee: 'bg-gray-100 text-gray-700',
    annulee: 'bg-red-100 text-red-700',
    litige: 'bg-orange-100 text-orange-700',
  };
  return colors[statut] || 'bg-gray-100 text-gray-700';
}