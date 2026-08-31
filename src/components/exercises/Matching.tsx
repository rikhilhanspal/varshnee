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
    if (Object.keys(matched).length !== exercise.pairs.length) return;
    const correct = exercise.pairs.every((p) => matched[p.left] === p.right);
    setSubmitted(true);
    onAnswer(correct);
  };

  const getPairNum = (left: string) => pairOrder.indexOf(left) + 1;
  const getRightPairNum = (right: string) => {
    const leftKey = Object.keys(matched).find((k) => matched[k] === right);
    return leftKey ? getPairNum(leftKey) : 0;
  };

  const leftStyle = (left: string): React.CSSProperties => {
    const isMatched = !!matched[left];
    if (submitted) {
      const ok = matched[left] === exercise.pairs.find((p) => p.left === left)?.right;
      return ok
        ? { background: 'var(--color-correct-bg)', border: '1px solid var(--color-correct)', borderRadius: '2px' }
        : { background: 'var(--color-incorrect-bg)', border: '1px solid rgba(63,2,10,0.15)', borderRadius: '2px' };
    }
    if (selectedLeft === left) return { background: 'var(--color-gold-subtle)', border: '1px solid var(--color-gold)', borderRadius: '2px' };
    if (isMatched) return { background: 'rgba(220,194,151,0.18)', border: '1px solid var(--color-gold)', borderRadius: '2px' };
    return { background: 'var(--color-neutral-dark)', border: '1px solid rgba(63,2,10,0.08)', borderRadius: '2px' };
  };

  const rightStyle = (right: string): React.CSSProperties => {
    const isMatched = matchedRights.has(right);
    if (submitted) {
      const correctLeft = exercise.pairs.find((p) => p.right === right)?.left;
      const ok = correctLeft ? matched[correctLeft] === right : false;
      return ok
        ? { background: 'var(--color-correct-bg)', border: '1px solid var(--color-correct)', borderRadius: '2px' }
        : { background: 'var(--color-incorrect-bg)', border: '1px solid rgba(63,2,10,0.15)', borderRadius: '2px' };
    }
    if (isMatched) return { background: 'rgba(220,194,151,0.18)', border: '1px solid var(--color-gold)', borderRadius: '2px' };
    if (selectedLeft && !isMatched) return { background: 'var(--color-neutral-dark)', border: '1px solid var(--color-gold-border)', borderRadius: '2px', cursor: 'pointer' };
    return { background: 'var(--color-neutral-dark)', border: '1px solid rgba(63,2,10,0.08)', borderRadius: '2px' };
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
                className="relative px-4 py-3 text-sm text-left transition-all"
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
                className="relative px-4 py-3 text-sm text-left transition-all"
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
          className="w-full py-2 mb-3 text-xs opacity-40 hover:opacity-100 transition-opacity"
          style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-on-light)' }}>
          Reset
        </button>
      )}

      {submitted && (
        <p className="text-sm mb-4 leading-relaxed" style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-on-light-muted)' }}>
          {exercise.explanation}
        </p>
      )}

      {!submitted && (
        <button onClick={handleSubmit} disabled={Object.keys(matched).length !== exercise.pairs.length}
          className="w-full py-3.5 text-xs tracking-widest uppercase font-medium transition-all disabled:opacity-50"
          style={{ background: Object.keys(matched).length === exercise.pairs.length ? 'var(--color-gold)' : 'transparent', color: Object.keys(matched).length === exercise.pairs.length ? 'var(--color-maroon)' : 'var(--color-on-light)', border: Object.keys(matched).length === exercise.pairs.length ? 'none' : '1px solid var(--color-gold-border)', borderRadius: '2px', fontFamily: 'var(--font-sans)', letterSpacing: '0.12em' }}>
          Check
        </button>
      )}
    </div>
  );
}
