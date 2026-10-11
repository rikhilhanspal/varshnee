import { useNavigate } from 'react-router-dom';
import type { LessonSummary, LanguageCode } from '../types';

interface LessonButtonProps {
  lesson: LessonSummary;
  lang: LanguageCode;
  sectionId: string;
  completed: boolean;
  inProgress?: boolean;
  bestScore?: number;
}

export default function LessonButton({ lesson, lang, sectionId, completed, inProgress, bestScore }: LessonButtonProps) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(`/${lang}/${sectionId}/${lesson.id}`)}
      className="group w-full text-left flex items-center justify-between py-4 border-b active:opacity-70"
      style={{
        borderColor: 'rgba(219, 208, 194, 0.10)',
        transition: 'opacity var(--duration-fast) var(--ease-out)',
      }}
    >
      <div className="flex items-center gap-4">
        <span
          className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center"
          style={{
            background: completed ? 'var(--color-gold)' : inProgress ? 'var(--color-gold-subtle)' : 'transparent',
            border: completed ? '1.5px solid var(--color-gold)' : inProgress ? '1.5px solid var(--color-gold)' : '1.5px solid rgba(219, 208, 194, 0.22)',
            transition: 'background var(--duration-normal) var(--ease-out), border-color var(--duration-normal) var(--ease-out)',
          }}
        >
          {completed && (
            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
              <path d="M1 4l3 3 5-5" stroke="#3F020A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </span>
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium" style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-on-dark)' }}>
              {lesson.title}
            </p>
            {bestScore !== undefined && (
              <span className="text-xs" style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-gold)', opacity: 0.7 }}>
                {bestScore}%
              </span>
            )}
          </div>
        </div>
      </div>

      <svg
        width="14" height="14" viewBox="0 0 14 14" fill="none"
        className="shrink-0 opacity-20 group-hover:opacity-60"
        style={{ color: 'var(--color-gold)', transition: 'opacity var(--duration-fast) var(--ease-out), transform var(--duration-fast) var(--ease-out)', transform: 'translateX(0)' }}
      >
        <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}
