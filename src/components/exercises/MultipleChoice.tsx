import { useState } from 'react';
import type { MultipleChoiceExercise } from '../../types';

interface Props { exercise: MultipleChoiceExercise; onAnswer: (correct: boolean) => void; }

function optionStyle(i: number, selected: number | null, correctIndex: number, submitted: boolean): React.CSSProperties {
  if (submitted) {
    if (i === correctIndex) return { background: 'var(--color-correct-bg)', border: '1px solid var(--color-correct)', borderRadius: '2px' };
    if (i === selected)    return { background: 'var(--color-incorrect-bg)', border: '1px solid rgba(63,2,10,0.15)', borderRadius: '2px', opacity: 0.6 };
    return { background: 'var(--color-neutral-dark)', border: '1px solid transparent', borderRadius: '2px', opacity: 0.35 };
  }
  if (i === selected) return { background: 'var(--color-gold-subtle)', border: '1px solid var(--color-gold)', borderRadius: '2px' };
  return { background: 'var(--color-neutral-dark)', border: '1px solid rgba(63,2,10,0.08)', borderRadius: '2px' };
}

export default function MultipleChoice({ exercise, onAnswer }: Props) {
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (selected === null) return;
    setSubmitted(true);
    onAnswer(selected === exercise.correctIndex);
  };

  return (
    <div>
      <p className="text-xs tracking-widest uppercase mb-3" style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-on-light)', letterSpacing: '0.12em' }}>
        Choose the correct answer
      </p>
      <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.2rem, 3vw, 1.45rem)', letterSpacing: '0.01em', lineHeight: 1.3, color: 'var(--color-on-light)' }} className="font-normal mb-7">
        {exercise.question}
      </h3>

      <div className="flex flex-col gap-2 mb-6">
        {exercise.options.map((option, i) => (
          <button key={i} onClick={() => !submitted && setSelected(i)} disabled={submitted}
            className="w-full text-left px-5 py-3.5 text-sm transition-all"
            style={{ ...optionStyle(i, selected, exercise.correctIndex, submitted), fontFamily: 'var(--font-sans)', color: 'var(--color-on-light)' }}>
            {option}
          </button>
        ))}
      </div>

      {submitted && (
        <p className="text-sm mb-2 leading-relaxed" style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-on-light-muted)' }}>
          {exercise.explanation}
        </p>
      )}
      {!submitted && (
        <button onClick={handleSubmit} disabled={selected === null}
          className="w-full py-3.5 text-xs tracking-widest uppercase font-medium transition-all disabled:opacity-50"
          style={{ background: selected !== null ? 'var(--color-gold)' : 'transparent', color: selected !== null ? 'var(--color-maroon)' : 'var(--color-on-light)', border: selected !== null ? 'none' : '1px solid var(--color-gold-border)', borderRadius: '2px', fontFamily: 'var(--font-sans)', letterSpacing: '0.12em' }}>
          Check
        </button>
      )}
    </div>
  );
}
