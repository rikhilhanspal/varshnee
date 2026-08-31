import { useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { LanguageCode, MultipleChoiceExercise, Exercise } from '../types';
import { getLesson, getManifest, getVocabularyByIds, getGrammarByIds, getVocabulary } from '../utils/content';
import { useProgress } from '../stores/progress';
import ExerciseRenderer from '../components/exercises/ExerciseRenderer';
import LessonComplete from '../components/LessonComplete';
import ProgressBar from '../components/ProgressBar';

const QUESTIONS_PER_SESSION = 10;

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

export default function LessonPage() {
  const { lang, lesson: lessonId } = useParams<{ lang: string; section: string; lesson: string }>();
  const navigate = useNavigate();
  const { saveLessonResume, markLessonComplete, getLessonProgress } = useProgress();
  const langCode = lang as LanguageCode;

  let lessonData;
  try { lessonData = getLesson(langCode, lessonId!); }
  catch { navigate(`/${lang}`); return null; }

  const manifest = getManifest(langCode);
  const allLessons = manifest.sections.flatMap((s) => s.lessons.map((l) => ({ ...l, sectionId: s.id })));
  const currentLessonIdx = allLessons.findIndex((l) => l.id === lessonId);
  const nextLesson = allLessons[currentLessonIdx + 1];
  const nextLessonPath = nextLesson ? `/${lang}/${nextLesson.sectionId}/${nextLesson.id}` : undefined;
  const practiceAgainPath = `/${lang}/${lessonData.sectionId}/${lessonData.id}`;
  const langLabel = lang ? lang.charAt(0).toUpperCase() + lang.slice(1) : '';

  // Pick up to QUESTIONS_PER_SESSION exercises randomly from the bank — fixed for this mount
  const [selectedExercises] = useState<Exercise[]>(() =>
    shuffle(lessonData.exercises).slice(0, QUESTIONS_PER_SESSION)
  );

  // Review exercises from the last completed lesson (appended after selected)
  const reviewExercises = useMemo<MultipleChoiceExercise[]>(() => {
    if (currentLessonIdx <= 0) return [];
    const completedPrev = allLessons
      .slice(0, currentLessonIdx)
      .filter((l) => getLessonProgress(langCode, l.id)?.completed);
    if (completedPrev.length === 0) return [];

    let prevLessonData;
    try { prevLessonData = getLesson(langCode, completedPrev[completedPrev.length - 1].id); }
    catch { return []; }

    const reviewVocab = getVocabularyByIds(langCode, prevLessonData.vocabularyIds);
    if (reviewVocab.length < 2) return [];
    const allVocab = getVocabulary(langCode);
    const picked = shuffle(reviewVocab).slice(0, 2);

    return picked.map((v, i) => {
      const distractors = allVocab
        .filter((ov) => ov.english !== v.english)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3)
        .map((ov) => ov.english);
      const pos = Math.floor(Math.random() * 4);
      const options = [...distractors];
      options.splice(pos, 0, v.english);
      options.splice(4);
      return {
        id: `review-${v.id}-${i}`,
        type: 'multiple_choice' as const,
        question: `What does '${v.romanized}' mean?`,
        options,
        correctIndex: options.indexOf(v.english),
        explanation: `'${v.romanized}' means '${v.english}'. Keep reviewing past vocabulary to retain it!`,
      };
    });
  }, [langCode, currentLessonIdx]);

  const allExercises = useMemo<Exercise[]>(
    () => [...selectedExercises, ...reviewExercises],
    [selectedExercises, reviewExercises]
  );

  const existingProgress = getLessonProgress(langCode, lessonId!);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [showIntro, setShowIntro] = useState(true);

  const totalExercises = allExercises.length;
  const isReview = currentIndex >= selectedExercises.length;

  const handleAnswer = useCallback((correct: boolean) => {
    if (correct && !isReview) setScore((s) => s + 1);
    setAnswered(true);
    saveLessonResume(langCode, lessonData.id, currentIndex + 1);
  }, [currentIndex, isReview, langCode, lessonData.id, saveLessonResume]);

  const handleContinue = () => {
    if (currentIndex + 1 >= totalExercises) {
      markLessonComplete(langCode, lessonData.id, Math.round((score / selectedExercises.length) * 100));
      setCompleted(true);
    } else {
      setCurrentIndex((i) => i + 1);
      setAnswered(false);
    }
  };

  if (completed) {
    return (
      <LessonComplete
        lang={langCode}
        lessonTitle={lessonData.title}
        score={score}
        totalExercises={selectedExercises.length}
        nextLessonPath={nextLessonPath}
        practiceAgainPath={practiceAgainPath}
      />
    );
  }

  if (showIntro) {
    const vocab = getVocabularyByIds(langCode, lessonData.vocabularyIds);
    const grammar = getGrammarByIds(langCode, lessonData.grammarNoteIds);

    return (
      <div className="page-enter">
        <button
          onClick={() => navigate(`/${lang}`)}
          className="flex items-center gap-1.5 text-xs tracking-widest uppercase mb-10 opacity-40 hover:opacity-100 transition-opacity"
          style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-on-dark)', letterSpacing: '0.12em' }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M9 6H3M5 4l-2 2 2 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {langLabel}
        </button>

        <p className="text-xs tracking-widest uppercase mb-2" style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-on-dark-muted)', letterSpacing: '0.12em' }}>
          Lesson {currentLessonIdx + 1}
        </p>
        <h1
          style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.75rem, 5vw, 2.25rem)', letterSpacing: '0.01em', lineHeight: 1.1, color: 'var(--color-on-dark)' }}
          className="font-normal mb-2"
        >
          {lessonData.title}
        </h1>
        <p className="text-sm mb-10" style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-on-dark-muted)', lineHeight: 1.6 }}>
          {lessonData.description}
        </p>

        <div className="gold-rule mb-8" />

        {vocab.length > 0 && (
          <div className="mb-6" style={{ background: 'var(--color-neutral)', borderRadius: '2px', padding: '1.25rem 1.5rem' }}>
            <p className="text-xs tracking-widest uppercase mb-4" style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-on-light)', letterSpacing: '0.12em' }}>
              Vocabulary
            </p>
            {vocab.map((v, i) => (
              <div
                key={v.id}
                className="flex items-baseline justify-between py-3"
                style={{ borderBottom: i < vocab.length - 1 ? '1px solid rgba(63, 2, 10, 0.08)' : 'none' }}
              >
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-medium" style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-on-light)' }}>{v.romanized}</span>
                  <span className="text-xs" style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-on-light-muted)' }}>{v.pronunciation}</span>
                </div>
                <span className="text-sm" style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-on-light-muted)' }}>{v.english}</span>
              </div>
            ))}
          </div>
        )}

        {grammar.length > 0 && (
          <div className="mb-8">
            <p className="text-xs tracking-widest uppercase mb-3 mt-6" style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-on-dark-muted)', letterSpacing: '0.12em' }}>
              Grammar notes
            </p>
            {grammar.map((g) => (
              <div key={g.id} className="p-4 mb-3" style={{ background: 'var(--color-neutral)', borderLeft: '2px solid var(--color-gold-border)', borderRadius: '0 2px 2px 0' }}>
                <p className="text-sm font-medium mb-1" style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-on-light)' }}>{g.title}</p>
                <p className="text-sm leading-relaxed" style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-on-light-muted)' }}>{g.body}</p>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={() => setShowIntro(false)}
          className="w-full py-3.5 text-xs tracking-widest uppercase font-medium"
          style={{ background: 'var(--color-gold)', color: 'var(--color-maroon)', borderRadius: '2px', fontFamily: 'var(--font-sans)', letterSpacing: '0.12em' }}
        >
          Start — {selectedExercises.length} Questions
        </button>
        {existingProgress?.completed && (
          <p className="text-xs text-center mt-3 opacity-40" style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-on-dark-muted)' }}>
            Best score: {existingProgress.score}%
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="page-enter">
      <div className="flex items-center gap-4 mb-10">
        <button
          onClick={() => navigate(`/${lang}`)}
          className="opacity-30 hover:opacity-100 transition-opacity"
          style={{ color: 'var(--color-on-dark)' }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <ProgressBar percent={(currentIndex / totalExercises) * 100} className="flex-1" />
        <span className="text-xs shrink-0" style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-on-dark-muted)' }}>
          {currentIndex + 1} / {totalExercises}
        </span>
      </div>

      <div style={{ background: 'var(--color-neutral)', borderRadius: '2px', padding: '2rem' }}>
        {isReview && (
          <p className="text-xs tracking-widest uppercase mb-4 pb-3"
            style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-gold)', letterSpacing: '0.12em', borderBottom: '1px solid rgba(220,194,151,0.2)' }}>
            review
          </p>
        )}
        <ExerciseRenderer exercise={allExercises[currentIndex]} onAnswer={handleAnswer} />
      </div>

      {answered && (
        <button
          onClick={handleContinue}
          className="w-full py-3.5 mt-4 text-xs tracking-widest uppercase font-medium transition-all"
          style={{ background: 'var(--color-gold)', color: 'var(--color-maroon)', borderRadius: '2px', fontFamily: 'var(--font-sans)', letterSpacing: '0.12em' }}
        >
          {currentIndex + 1 >= totalExercises ? 'Finish' : 'Continue'}
        </button>
      )}
    </div>
  );
}
