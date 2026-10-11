import { useState } from 'react';
import type { MatchingExercise } from '../../types';

interface Props { exercise: MatchingExercise; onAnswer: (correct: boolean) => void; }

export default function Matching({ exercise, onAnswer }: Props) {
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [matched, setMatched] = useState<Record<string, string>>({});
  const [pairOrder, setPairOrder] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const [shuffledRight] = useState(() =>
    [...exercise.pairs.map((p) => p.right)].sort(() => 0.5 - Math.random())
  );

  const matchedRights = new Set(Object.values(matched));
  const allMatched = Object.keys(matched).length === exercise.pairs.length;

  const handleLeftClick = (left: string) => {
    if (submitted || matched[left]) return;
    setSelectedLeft((p) => (p === left ? null : left));
  };

  const handleRightClick = (right: string) => {
    if (submitted || matchedRights.has(right) || !selectedLeft) return;
    setMatched({ ...matched, [selectedLeft]: right });
    setPairOrder([...pairOrder, selectedLeft]);
    setSelectedLeft(null);
  };

  const handleSubmit = () => {
    if (!allMatched) return;
    const correct = exercise.pairs.every((p) => matched[p.left] === p.right);
    setSubmitted(true);
    onAnswer(correct);
  };

  const getPairNum = (left: string) => pairOrder.indexOf(left) + 1;
  const getRightPairNum = (right: string) => {
    const leftKey = Object.keys(matched).find((k) => matched[k] === right);
    return leftKey ? getPairNum(leftKey) : 0;
  };

  const tileTransition = 'transform var(--duration-fast) var(--ease-out), background var(--duration-fast) var(--ease-out), border-color var(--duration-fast) var(--ease-out)';

  const leftStyle = (left: string): React.CSSProperties => {
    const isMatched = !!matched[left];
    const base: React.CSSProperties = { borderRadius: 'var(--radius-btn)', transition: tileTransition };
    if (submitted) {
      const ok = matched[left] === exercise.pairs.find((p) => p.left === left)?.right;
      return ok
        ? { ...base, background: 'var(--color-correct-bg)', border: '1px solid var(--color-correct)' }
        : { ...base, background: 'var(--color-incorrect-bg)', border: '1px solid rgba(63,2,10,0.15)' };
    }
    if (selectedLeft === left) return { ...base, background: 'var(--color-gold-subtle)', border: '1px solid var(--color-gold)' };
    if (isMatched) return { ...base, background: 'rgba(220,194,151,0.18)', border: '1px solid var(--color-gold)' };
    return { ...base, background: 'var(--color-neutral-dark)', border: '1px solid rgba(63,2,10,0.08)' };
  };

  const rightStyle = (right: string): React.CSSProperties => {
    const isMatched = matchedRights.has(right);
    const base: React.CSSProperties = { borderRadius: 'var(--radius-btn)', transition: tileTransition };
    if (submitted) {
      const correctLeft = exercise.pairs.find((p) => p.right === right)?.left;
      const ok = correctLeft ? matched[correctLeft] === right : false;
      return ok
        ? { ...base, background: 'var(--color-correct-bg)', border: '1px solid var(--color-correct)' }
        : { ...base, background: 'var(--color-incorrect-bg)', border: '1px solid rgba(63,2,10,0.15)' };
    }
    if (isMatched) return { ...base, background: 'rgba(220,194,151,0.18)', border: '1px solid var(--color-gold)' };
    if (selectedLeft && !isMatched) return { ...base, background: 'var(--color-neutral-dark)', border: '1px solid var(--color-gold-border)', cursor: 'pointer' };
    return { ...base, background: 'var(--color-neutral-dark)', border: '1px solid rgba(63,2,10,0.08)' };
  };

  const PairBadge = ({ num }: { num: number }) => (
    <span
      className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center text-xs shrink-0"
      style={{
        width: 18, height: 18, borderRadius: '50%',
        background: 'var(--color-gold)', color: 'var(--color-maroon)',
        fontSize: '10px', fontFamily: 'var(--font-sans)', fontWeight: 600,
      }}
    >
      {num}
    </span>
  );

  return (
    <div>
      <p className="text-xs tracking-widest uppercase mb-3" style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-on-light)', letterSpacing: '0.12em' }}>
        Match the pairs
      </p>
      <p className="text-sm mb-6" style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-on-light-muted)' }}>
        Select a word on the left, then its match on the right.
      </p>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="flex flex-col gap-2">
          {exercise.pairs.map((pair) => {
            const isMatched = !!matched[pair.left];
            const num = isMatched ? getPairNum(pair.left) : 0;
            return (
              <button key={pair.left} onClick={() => handleLeftClick(pair.left)}
                disabled={submitted || !!matched[pair.left]}
                className="relative px-4 py-3 text-sm text-left active:scale-98"
                style={{ ...leftStyle(pair.left), fontFamily: 'var(--font-sans)', color: 'var(--color-on-light)', paddingRight: isMatched && !submitted ? '2rem' : undefined }}>
                {pair.left}
                {isMatched && !submitted && <PairBadge num={num} />}
              </button>
            );
          })}
        </div>
        <div className="flex flex-col gap-2">
          {shuffledRight.map((right) => {
            const isMatched = matchedRights.has(right);
            const num = isMatched ? getRightPairNum(right) : 0;
            return (
              <button key={right} onClick={() => handleRightClick(right)}
                disabled={submitted || matchedRights.has(right) || !selectedLeft}
                className="relative px-4 py-3 text-sm text-left active:scale-98"
                style={{ ...rightStyle(right), fontFamily: 'var(--font-sans)', color: 'var(--color-on-light)', paddingRight: isMatched && !submitted ? '2rem' : undefined }}>
                {right}
                {isMatched && !submitted && <PairBadge num={num} />}
              </button>
            );
          })}
        </div>
      </div>

      {!submitted && Object.keys(matched).length > 0 && (
        <button onClick={() => { setMatched({}); setPairOrder([]); setSelectedLeft(null); }}
          className="w-full py-2 mb-3 text-xs opacity-40 hover:opacity-100"
          style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-on-light)', transition: 'opacity var(--duration-fast) var(--ease-out)' }}>
          Reset
        </button>
      )}

      {submitted && (
        <p className="text-sm mb-4 leading-relaxed" style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-on-light-muted)' }}>
          {exercise.explanation}
        </p>
      )}

      {!submitted && (
        <button onClick={handleSubmit} disabled={!allMatched}
          className={allMatched ? 'btn-primary' : 'btn-ghost'}
          style={!allMatched ? { color: 'var(--color-on-light)' } : undefined}>
          Check
        </button>
      )}
    </div>
  );
}
