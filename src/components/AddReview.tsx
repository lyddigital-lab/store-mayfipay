import { useState } from 'react';
import { Star } from 'lucide-react';
import { showSuccess, showError } from '../lib/toast';
import { creerAvis, getAcheteurSession } from '../lib/supabase';

interface AddReviewProps {
  produitId: string;
  onReviewAdded?: () => void;
}

export default function AddReview({ produitId, onReviewAdded }: AddReviewProps) {
  const [note, setNote] = useState<number>(0);
  const [commentaire, setCommentaire] = useState('');
  const [soumission, setSoumission] = useState(false);

  const session = getAcheteurSession();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      showError('Connexion requise', 'Vous devez être connecté pour laisser un avis.');
      return;
    }
    if (!note || note < 1 || note > 5) {
      showError('Note requise', 'Veuillez sélectionner une note entre 1 et 5.');
      return;
    }

    setSoumission(true);
    creerAvis({
      produit_id: produitId,
      acheteur_id: session.id,
      note,
      commentaire: commentaire.trim() || undefined,
    })
      .then(() => {
        showSuccess('Avis publié', 'Merci pour votre avis !');
        onReviewAdded?.();
        setNote(0);
        setCommentaire('');
      })
      .catch((err: any) => {
        showError('Erreur', 'Impossible d\'ajouter votre avis.');
        console.error(err);
      })
      .finally(() => setSoumission(false));
  };

  return (
    <div className="bg-white rounded-xl border border-mayfipay-border p-6 mb-6">
      <h3 className="text-lg font-bold text-mayfipay-text mb-4">Donner votre avis</h3>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <p className="text-sm font-medium text-mayfipay-text mb-2">Votre note</p>
          <div className="flex items-center gap-1">
            {[5, 4, 3, 2, 1].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setNote(n)}
                className={`w-8 h-8 flex items-center justify-center rounded text-xl transition-colors ${
                  note >= n ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-400'
                }`}
                aria-label={`Noter ${n} étoile${n > 1 ? 's' : ''}`}
              >
                <Star className={note >= n ? 'fill-yellow-400' : 'fill-current'} />
              </button>
            ))}
          </div>
          {note > 0 && <p className="text-xs text-mayfipay-orange mt-1">Note : {note} / 5</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-mayfipay-text mb-1">
            Commentaire (optionnel)
          </label>
          <textarea
            rows={3}
            placeholder="Partagez votre expérience avec ce produit..."
            className="w-full rounded-lg border border-mayfipay-border px-3 py-2 text-sm focus:border-mayfipay-orange focus:outline-none resize-none"
            value={commentaire}
            onChange={(e) => setCommentaire(e.target.value)}
          />
        </div>

        <button
          type="submit"
          disabled={soumission || !note}
          className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            note
              ? 'bg-mayfipay-orange text-white hover:bg-mayfipay-orange-dark'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
        >
          {soumission ? 'Envoi...' : note ? 'Publier l\'avis' : 'Sélectionnez une note'}
        </button>
      </form>
    </div>
  );
}
