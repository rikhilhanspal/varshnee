import { useNavigate } from 'react-router-dom';
import type { LanguageCode } from '../types';

interface LessonCompleteProps {
  lang: LanguageCode;
  lessonTitle: string;
  score: number;
  totalExercises: number;
  nextLessonPath?: string;
  practiceAgainPath: string;
}

export default function LessonComplete({ lang, lessonTitle, score, totalExercises, nextLessonPath, practiceAgainPath }: LessonCompleteProps) {
  const navigate = useNavigate();
  const percent = Math.round((score / totalExercises) * 100);

  return (
    <div className="flex flex-col items-center text-center py-16 page-enter">
      {/* Script accent — on dark bg */}
      <p style={{ fontFamily: 'var(--font-script)', fontSize: '1.5rem', color: 'var(--color-gold)' }} className="mb-4">
        Well done
      </p>
      <h2
        style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.75rem, 5vw, 2.25rem)', letterSpacing: '0.01em', lineHeight: 1.1, color: 'var(--color-on-dark)' }}
        className="font-normal mb-2"
      >
        {lessonTitle}
      </h2>
      <p className="text-sm mb-12" style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-on-dark-muted)' }}>
        Lesson complete
      </p>

      {/* Score card — neutral surface */}
      <div
        className="mb-12 px-10 py-8"
        style={{ background: 'var(--color-neutral)', borderRadius: '2px', border: '1px solid var(--color-gold-border)' }}
      >
        <p className="text-xs tracking-widest uppercase mb-3" style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-on-light-muted)', letterSpacing: '0.12em' }}>
          Score
        </p>
        <p style={{ fontFamily: 'var(--font-serif)', fontSize: '3.5rem', lineHeight: 1, color: 'var(--color-on-light)' }}>
          {percent}<span style={{ color: 'var(--color-on-light-muted)', fontSize: '1.5rem' }}>%</span>
        </p>
        <p className="text-xs mt-2" style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-on-light-muted)' }}>
          {score} of {totalExercises} correct
        </p>
      </div>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        {nextLessonPath && (
          <button
            onClick={() => navigate(nextLessonPath)}
            className="w-full py-3.5 text-xs tracking-widest uppercase font-medium transition-all"
            style={{ background: 'var(--color-gold)', color: 'var(--color-maroon)', borderRadius: '2px', fontFamily: 'var(--font-sans)', letterSpacing: '0.12em' }}
          >
            Next Lesson
          </button>
        )}
        <button
          onClick={() => navigate(practiceAgainPath)}
          className="w-full py-3.5 text-xs tracking-widest uppercase font-medium transition-all"
          style={{ background: 'transparent', color: 'var(--color-on-dark-muted)', border: '1px solid var(--color-gold-border)', borderRadius: '2px', fontFamily: 'var(--font-sans)', letterSpacing: '0.12em' }}
        >
          Practice Again
        </button>
        <button
          onClick={() => navigate(`/${lang}`)}
          className="w-full py-2 text-xs tracking-widest uppercase transition-all opacity-40 hover:opacity-70"
          style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-on-dark-muted)', letterSpacing: '0.12em' }}
        >
          Back to {lang.charAt(0).toUpperCase() + lang.slice(1)}
        </button>
      </div>
    </div>
  );
}
