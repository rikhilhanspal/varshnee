import { useState } from 'react';
import type { WordOrderingExercise } from '../../types';
import { checkWordOrder } from '../../utils/validation';

interface Props { exercise: WordOrderingExercise; onAnswer: (correct: boolean) => void; }

const tileBase: React.CSSProperties = { borderRadius: '2px', fontFamily: 'var(--font-sans)', fontSize: '0.875rem', color: 'var(--color-on-light)' };

export default function WordOrdering({ exercise, onAnswer }: Props) {
  const [placed, setPlaced] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const available = exercise.tiles.filter((t) => !placed.includes(t.id));
  const getTileText = (id: string) => exercise.tiles.find((t) => t.id === id)?.text ?? '';

  const handleTap = (id: string) => {
    if (submitted) return;
    setPlaced((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);
  };

  const handleSubmit = () => {
    if (placed.length !== exercise.tiles.length) return;
    const correct = checkWordOrder(placed, exercise.correctOrder);
    setIsCorrect(correct);
    setSubmitted(true);
    onAnswer(correct);
  };

  return (
    <div>
      <p className="text-xs tracking-widest uppercase mb-3" style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-on-light)', letterSpacing: '0.12em' }}>
        Arrange the words
      </p>
      <h3
        style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.2rem, 3vw, 1.45rem)', letterSpacing: '0.01em', lineHeight: 1.3, color: 'var(--color-on-light)' }}
        className="font-normal mb-8"
      >
        {exercise.prompt}
      </h3>

      {/* Drop zone */}
      <div
        className="flex flex-wrap gap-2 p-4 mb-4"
        style={{
          minHeight: '56px',
          background: 'var(--color-neutral-dark)',
          border: submitted
            ? isCorrect ? '1px solid var(--color-correct)' : '1px solid rgba(63,2,10,0.2)'
            : '1px solid var(--color-gold-border)',
          borderRadius: '2px',
        }}
      >
        {placed.length === 0 && (
          <span className="text-sm py-1 opacity-30" style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-on-light)' }}>
            Tap words to build your answer
          </span>
        )}
        {placed.map((id) => (
          <button key={id} onClick={() => handleTap(id)} disabled={submitted} className="px-3 py-1.5 transition-all"
            style={{ ...tileBase, background: 'var(--color-gold-subtle)', border: '1px solid var(--color-gold-border)' }}>
            {getTileText(id)}
          </button>
        ))}
      </div>

      {/* Available tiles */}
      <div className="flex flex-wrap gap-2 mb-6">
        {available.map((tile) => (
          <button key={tile.id} onClick={() => handleTap(tile.id)} disabled={submitted} className="px-3 py-1.5 transition-all"
            style={{ ...tileBase, background: 'var(--color-neutral-dark)', border: '1px solid rgba(63,2,10,0.12)' }}
            onMouseEnter={(e) => { if (!submitted) (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-gold-border)'; }}
            onMouseLeave={(e) => { if (!submitted) (e.currentTarget as HTMLElement).style.borderColor = 'rgba(63,2,10,0.12)'; }}
          >
            {tile.text}
          </button>
        ))}
      </div>

      {submitted && !isCorrect && (
        <p className="text-xs mb-4" style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-on-light-muted)' }}>
          Correct: <span style={{ color: 'var(--color-on-light)', fontWeight: 500 }}>{exercise.correctOrder.map(getTileText).join(' ')}</span>
        </p>
      )}
      {submitted && (
        <p className="text-sm mb-4 leading-relaxed" style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-on-light-muted)' }}>
          {exercise.explanation}
        </p>
      )}

      {!submitted && (
        <button
          onClick={handleSubmit}
          disabled={placed.length !== exercise.tiles.length}
          className="w-full py-3.5 text-xs tracking-widest uppercase font-medium transition-all disabled:opacity-50"
          style={{ background: placed.length === exercise.tiles.length ? 'var(--color-gold)' : 'transparent', color: placed.length === exercise.tiles.length ? 'var(--color-maroon)' : 'var(--color-on-light)', border: placed.length === exercise.tiles.length ? 'none' : '1px solid var(--color-gold-border)', borderRadius: '2px', fontFamily: 'var(--font-sans)', letterSpacing: '0.12em' }}
        >
          Check
        </button>
      )}
    </div>
  );
}
