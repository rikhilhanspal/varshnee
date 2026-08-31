import { useState } from 'react';
import type { TranslationExercise } from '../../types';
import { checkTextAnswer } from '../../utils/validation';

interface Props { exercise: TranslationExercise; onAnswer: (correct: boolean) => void; }

export default function Translation({ exercise, onAnswer }: Props) {
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

  return (
    <div>
      <p className="text-xs tracking-widest uppercase mb-3" style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-on-light)', letterSpacing: '0.12em' }}>
        {exercise.direction === 'to_english' ? 'Translate to English' : 'Translate'}
      </p>
      <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.2rem, 3vw, 1.45rem)', letterSpacing: '0.01em', lineHeight: 1.3, color: 'var(--color-on-light)' }} className="font-normal mb-4">
        {exercise.prompt}
      </h3>
      {!submitted && exercise.hint && (
        <div className="mb-5">
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
      {!exercise.hint && <div className="mb-3" />}

      <div className="mb-6">
        <input
          type="text" value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !submitted && handleSubmit()}
          disabled={submitted} placeholder="Your answer"
          className="w-full bg-transparent border-b pb-2 text-base focus:outline-none transition-colors"
          style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-on-light)', caretColor: 'var(--color-gold)', borderColor: submitted ? (isCorrect ? 'var(--color-correct)' : 'rgba(63,2,10,0.2)') : 'var(--color-gold-border)' }}
          onFocus={(e) => { if (!submitted) e.currentTarget.style.borderColor = 'var(--color-gold)'; }}
          onBlur={(e) => { if (!submitted) e.currentTarget.style.borderColor = 'var(--color-gold-border)'; }}
        />
        {submitted && !isCorrect && (
          <p className="text-xs mt-3" style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-on-light-muted)' }}>
            Correct: <span style={{ color: 'var(--color-on-light)', fontWeight: 500 }}>{exercise.correct}</span>
          </p>
        )}
      </div>

      {submitted && (
        <p className="text-sm mb-2 leading-relaxed" style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-on-light-muted)' }}>
          {exercise.explanation}
        </p>
      )}
      {!submitted && (
        <button onClick={handleSubmit} disabled={!input.trim()}
          className="w-full py-3.5 text-xs tracking-widest uppercase font-medium transition-all disabled:opacity-50"
          style={{ background: input.trim() ? 'var(--color-gold)' : 'transparent', color: input.trim() ? 'var(--color-maroon)' : 'var(--color-on-light)', border: input.trim() ? 'none' : '1px solid var(--color-gold-border)', borderRadius: '2px', fontFamily: 'var(--font-sans)', letterSpacing: '0.12em' }}>
          Check
        </button>
      )}
    </div>
  );
}
