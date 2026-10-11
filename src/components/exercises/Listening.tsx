import { useState } from 'react';
import type { ListeningExercise } from '../../types';
import { checkTextAnswer } from '../../utils/validation';
import { playAudio, speakText } from '../../utils/audio';
import { useProgress } from '../../stores/progress';

interface Props { exercise: ListeningExercise; onAnswer: (correct: boolean) => void; }

function optionClass(i: number, selected: number | null, correctIndex: number | undefined, submitted: boolean): string {
  const base = 'option-tile';
  if (submitted) {
    if (i === correctIndex) return `${base} correct`;
    if (i === selected) return `${base} incorrect`;
    return `${base} dimmed`;
  }
  if (i === selected) return `${base} selected`;
  return base;
}

export default function Listening({ exercise, onAnswer }: Props) {
  const [selected, setSelected] = useState<number | null>(null);
  const [input, setInput] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [playing, setPlaying] = useState(false);
  const { progress } = useProgress();

  const handlePlay = async () => {
    if (!progress.settings.audioEnabled) return;
    setPlaying(true);

    const transcript = exercise.mode === 'select'
      ? (exercise.options?.[exercise.correctIndex ?? 0] ?? '')
      : (exercise.correct ?? '');

    let played = false;
    if (exercise.audio) {
      try { await playAudio(exercise.audio); played = true; } catch { /* file missing */ }
    }
    if (!played && transcript) {
      try { await speakText(transcript); } catch { /* ignore */ }
    }

    setPlaying(false);
  };

  const handleSubmit = () => {
    let correct = false;
    if (exercise.mode === 'select') {
      if (selected === null) return;
      correct = selected === exercise.correctIndex;
    } else {
      if (!input.trim()) return;
      correct = checkTextAnswer(input, exercise.correct!, exercise.acceptedVariants);
    }
    setIsCorrect(correct);
    setSubmitted(true);
    onAnswer(correct);
  };

  const canSubmit = exercise.mode === 'select' ? selected !== null : !!input.trim();

  return (
    <div>
      <p className="text-xs tracking-widest uppercase mb-3" style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-on-light)', letterSpacing: '0.12em' }}>
        Listen and answer
      </p>

      <button onClick={handlePlay} disabled={playing} className="flex items-center gap-3 mb-8 group">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
          style={{
            background: playing ? 'var(--color-gold)' : 'var(--color-neutral-dark)',
            border: '1px solid var(--color-gold-border)',
            transition: 'background var(--duration-normal) var(--ease-out), transform var(--duration-fast) var(--ease-out)',
            transform: playing ? 'scale(1.05)' : 'scale(1)',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d={playing ? 'M4 3h2v8H4V3zM8 3h2v8H8V3z' : 'M4 2.5l8 4.5-8 4.5V2.5z'}
              fill={playing ? 'var(--color-maroon)' : 'var(--color-gold)'}
            />
          </svg>
        </div>
        <span className="text-sm group-hover:opacity-100 opacity-60" style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-on-light)', transition: 'opacity var(--duration-fast) var(--ease-out)' }}>
          {playing ? 'Playing...' : 'Play audio'}
        </span>
      </button>

      {exercise.mode === 'select' && exercise.options && (
        <div className="flex flex-col gap-2 mb-6">
          {exercise.options.map((option, i) => (
            <button
              key={i}
              onClick={() => !submitted && setSelected(i)}
              disabled={submitted}
              className={optionClass(i, selected, exercise.correctIndex, submitted)}
            >
              {option}
            </button>
          ))}
        </div>
      )}

      {exercise.mode === 'type' && (
        <div className="mb-6">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !submitted && handleSubmit()}
            disabled={submitted}
            placeholder="Type what you hear"
            className="w-full bg-transparent border-b pb-3 text-base focus:outline-none"
            style={{
              fontFamily: 'var(--font-sans)', color: 'var(--color-on-light)', caretColor: 'var(--color-gold)',
              borderColor: submitted ? (isCorrect ? 'var(--color-correct)' : 'rgba(63,2,10,0.2)') : 'var(--color-gold-border)',
              transition: 'border-color var(--duration-normal) var(--ease-out)',
            }}
            onFocus={(e) => { if (!submitted) e.currentTarget.style.borderColor = 'var(--color-gold)'; }}
            onBlur={(e) => { if (!submitted) e.currentTarget.style.borderColor = 'var(--color-gold-border)'; }}
          />
          {submitted && !isCorrect && (
            <p className="text-xs mt-3" style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-on-light-muted)' }}>
              Correct: <span style={{ color: 'var(--color-on-light)', fontWeight: 500 }}>{exercise.correct}</span>
            </p>
          )}
        </div>
      )}

      {submitted && (
        <p className="text-sm mb-4 leading-relaxed" style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-on-light-muted)' }}>
          {exercise.explanation}
        </p>
      )}

      {!submitted && (
        <button onClick={handleSubmit} disabled={!canSubmit}
          className={canSubmit ? 'btn-primary' : 'btn-ghost'}
          style={!canSubmit ? { color: 'var(--color-on-light)' } : undefined}>
          Check
        </button>
      )}
    </div>
  );
}
