import { useState } from 'react';
import type { FillInBlankExercise } from '../../types';
import { checkTextAnswer } from '../../utils/validation';

interface Props { exercise: FillInBlankExercise; onAnswer: (correct: boolean) => void; }

export default function FillInBlank({ exercise, onAnswer }: Props) {
  const [input, setInput] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const handleSubmit = () => {
    if (!input.trim()) return;
    const correct = checkTextAnswer(input, exercise.correct, exercise.acceptedVariants);
    setIsCorrect(correct);
    setSubmitted(true);
    onAnswer(correct);
  };

  const parts = exercise.sentence.split('___');

  return (
    <div>
      <p className="text-xs tracking-widest uppercase mb-3" style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-on-light)', letterSpacing: '0.12em' }}>
        Fill in the blank
      </p>

      <div
        className="flex flex-wrap items-end gap-x-2 mb-8"
        style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.2rem, 3vw, 1.45rem)', letterSpacing: '0.01em', lineHeight: 1.5, color: 'var(--color-on-light)' }}
      >
        <span>{parts[0]}</span>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !submitted && handleSubmit()}
          disabled={submitted}
          placeholder="..."
          className="bg-transparent border-b focus:outline-none transition-colors"
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'inherit',
            color: 'var(--color-on-light)',
            caretColor: 'var(--color-gold)',
            borderColor: submitted ? (isCorrect ? 'var(--color-correct)' : 'rgba(63,2,10,0.2)') : 'var(--color-gold-border)',
            width: Math.max(80, input.length * 14 + 40) + 'px',
            minWidth: '80px',
          }}
          onFocus={(e) => { if (!submitted) e.currentTarget.style.borderColor = 'var(--color-gold)'; }}
          onBlur={(e) => { if (!submitted) e.currentTarget.style.borderColor = 'var(--color-gold-border)'; }}
        />
        {parts[1] && <span>{parts[1]}</span>}
      </div>

      {!submitted && exercise.hint && (
        <div className="mb-4 -mt-4">
          <button
            onClick={() => setShowHint(!showHint)}
            className="text-xs transition-opacity opacity-40 hover:opacity-80"
            style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-gold)', letterSpacing: '0.08em' }}
          >
            {showHint ? 'hide hint' : 'hint'}
          </button>
          {showHint && (
            <p className="mt-2 text-sm italic" style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-on-light-muted)' }}>
              {exercise.hint}
            </p>
          )}
        </div>
      )}

      {submitted && !isCorrect && (
        <p className="text-xs mb-4" style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-on-light-muted)' }}>
          Correct: <span style={{ color: 'var(--color-on-light)', fontWeight: 500 }}>{exercise.correct}</span>
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
          disabled={!input.trim()}
          className="w-full py-3.5 text-xs tracking-widest uppercase font-medium transition-all disabled:opacity-50"
          style={{ background: input.trim() ? 'var(--color-gold)' : 'transparent', color: input.trim() ? 'var(--color-maroon)' : 'var(--color-on-light)', border: input.trim() ? 'none' : '1px solid var(--color-gold-border)', borderRadius: '2px', fontFamily: 'var(--font-sans)', letterSpacing: '0.12em' }}
        >
          Check
        </button>
      )}
    </div>
  );
}
