export interface SessionUser {
  id: string;
  nom: string;
  tel: string;
  role?: string;
  pays?: string;
  photo?: string;
}

export function persistAcheteurSession(user: SessionUser): void {
  localStorage.setItem('store_acheteur_user', JSON.stringify({
    id: user.id, nom: user.nom, tel: user.tel, role: user.role || 'acheteur', pays: user.pays || '', photo: user.photo || '',
  }));
}

export function persistVendeurSession(user: SessionUser): void {
  localStorage.setItem('store_vendeur_user', JSON.stringify({
    id: user.id, nom: user.nom, tel: user.tel, role: 'vendeur', pays: user.pays || '', photo: user.photo || '',
  }));
}
