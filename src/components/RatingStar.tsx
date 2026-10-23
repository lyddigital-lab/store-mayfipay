import { Star } from 'lucide-react';

interface RatingStarProps {
  note: number;
  taille?: 'sm' | 'md' | 'lg';
  editable?: boolean;
  onNoteSelect?: (note: number) => void;
  noteSelectionnee?: number;
}

const tailleMap: Record<'sm' | 'md' | 'lg', { w: string; h: string }> = {
  sm: { w: 'w-4', h: 'h-4' },
  md: { w: 'w-5', h: 'h-5' },
  lg: { w: 'w-6', h: 'h-6' },
};

export default function RatingStar({
  note,
  taille = 'md',
  editable = false,
  onNoteSelect,
  noteSelectionne,
}: RatingStarProps) {
  const { w, h } = tailleMap[taille];
  const notes = [1, 2, 3, 4, 5];

  return (
    <div className="flex items-center gap-1" role="rating" aria-label={`Note ${note} sur 5`}>
      {notes.map((n) => {
        const estRempli = n <= Math.round(note);
        const estSelectionne = editable && noteSelectionne === n;
        const estActive = estRempli || estSelectionne;

        return (
          <button
            key={n}
            type="button"
            onClick={() => onNoteSelect?.(n)}
            aria-label={`Noter ${n} étoile${n > 1 ? 's' : ''}`}
            className={`cursor-pointer transition-colors duration-200 flex items-center ${w} ${h} ${
              estActive ? 'text-yellow-400' : 'text-gray-300'
            }`}
          >
            <Star className={`fill-current ${estActive ? 'text-yellow-400' : 'text-gray-300'}`} />
          </button>
        );
      })}
      <span className="ml-1 text-xs text-gray-500">{note.toFixed(1)} / 5</span>
    </div>
  );
}
