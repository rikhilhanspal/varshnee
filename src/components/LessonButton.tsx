import { useNavigate } from 'react-router-dom';
import type { LessonSummary, LanguageCode } from '../types';

interface LessonButtonProps {
  lesson: LessonSummary;
  lang: LanguageCode;
  sectionId: string;
  completed: boolean;
}

export default function LessonButton({ lesson, lang, sectionId, completed }: LessonButtonProps) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(`/${lang}/${sectionId}/${lesson.id}`)}
      className="group w-full text-left flex items-center justify-between py-4 transition-all border-b"
      style={{ borderColor: 'rgba(219, 208, 194, 0.10)' }}
    >
      <div className="flex items-center gap-4">
        <span
          className="shrink-0 w-4 h-4 rounded-full flex items-center justify-center transition-all"
          style={{
            background: completed ? 'var(--color-gold)' : 'transparent',
            border: completed ? '1.5px solid var(--color-gold)' : '1.5px solid rgba(219, 208, 194, 0.22)',
          }}
        >
          {completed && (
            <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
              <path d="M1 3l2 2 4-4" stroke="#3F020A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </span>
        <div>
          <p className="text-sm font-medium" style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-on-dark)' }}>
            {lesson.title}
          </p>
          <p className="text-xs mt-0.5" style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-on-dark-muted)' }}>
            {lesson.description}
          </p>
        </div>
      </div>

      <svg
        width="14" height="14" viewBox="0 0 14 14" fill="none"
        className="shrink-0 transition-opacity opacity-20 group-hover:opacity-60"
        style={{ color: 'var(--color-gold)' }}
      >
        <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}
