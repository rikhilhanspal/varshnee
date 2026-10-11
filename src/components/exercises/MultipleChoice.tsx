import { useState } from 'react';
import type { MultipleChoiceExercise } from '../../types';

interface Props { exercise: MultipleChoiceExercise; onAnswer: (correct: boolean) => void; }

function optionClass(i: number, selected: number | null, correctIndex: number, submitted: boolean): string {
  const base = 'option-tile';
  if (submitted) {
    if (i === correctIndex) return `${base} correct`;
    if (i === selected) return `${base} incorrect`;
    return `${base} dimmed`;
  }
  if (i === selected) return `${base} selected`;
  return base;
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
            className={optionClass(i, selected, exercise.correctIndex, submitted)}>
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
          className={selected !== null ? 'btn-primary' : 'btn-ghost'}
          style={selected === null ? { color: 'var(--color-on-light)' } : undefined}>
          Check
        </button>
      )}
    </div>
  );
}
