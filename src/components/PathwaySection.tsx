import type { Section, LanguageCode } from '../types';
import { useProgress } from '../stores/progress';
import LessonButton from './LessonButton';

interface PathwaySectionProps {
  section: Section;
  lang: LanguageCode;
  index: number;
}

export default function PathwaySection({ section, lang, index }: PathwaySectionProps) {
  const { getLessonProgress } = useProgress();
  const completedCount = section.lessons.filter(
    (l) => getLessonProgress(lang, l.id)?.completed
  ).length;

  return (
    <div className="mb-10">
      {/* Header on dark bg */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-xs" style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-on-dark-muted)' }}>
            0{index + 1}
          </span>
          <h3
            style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', letterSpacing: '0.01em', color: 'var(--color-on-dark)' }}
            className="font-normal"
          >
            {section.title}
          </h3>
        </div>
        <span className="text-xs" style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-on-dark-muted)' }}>
          {completedCount} of {section.lessons.length}
        </span>
      </div>

      <div className="gold-rule mb-1" />

      {/* Lesson list — on dark bg, neutral hover interaction */}
      <div className="flex flex-col">
        {section.lessons.map((lesson) => {
          const lp = getLessonProgress(lang, lesson.id);
          return (
            <LessonButton
              key={lesson.id}
              lesson={lesson}
              lang={lang}
              sectionId={section.id}
              completed={lp?.completed ?? false}
              inProgress={!!(lp && !lp.completed && lp.lastExercise > 0)}
              bestScore={lp?.completed ? lp.score : undefined}
            />
          );
        })}
      </div>
    </div>
  );
}
