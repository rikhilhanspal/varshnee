import { useSyncExternalStore, useCallback } from 'react';
import type { LanguageCode } from '../types';
import type { UserProgress, LessonProgress } from '../types/progress';
import { CURRENT_SCHEMA_VERSION, createDefaultProgress } from '../types/progress';

const STORAGE_KEY = 'varshnee_progress';

function migrateProgress(data: Record<string, unknown>): UserProgress {
  const v = (data.v as number) ?? 0;
  if (v === CURRENT_SCHEMA_VERSION) return data as unknown as UserProgress;
  // Future migrations go here
  return { ...(data as unknown as UserProgress), v: CURRENT_SCHEMA_VERSION };
}

function loadProgress(): UserProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultProgress();
    const parsed = JSON.parse(raw);
    return migrateProgress(parsed);
  } catch {
    return createDefaultProgress();
  }
}

function saveProgress(progress: UserProgress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  // Notify subscribers
  listeners.forEach((l) => l());
}

// External store pattern for React 18+
let listeners: Array<() => void> = [];
let cachedSnapshot: UserProgress | null = null;

function subscribe(listener: () => void) {
  listeners = [...listeners, listener];
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

function getSnapshot(): UserProgress {
  if (!cachedSnapshot) {
    cachedSnapshot = loadProgress();
  }
  return cachedSnapshot;
}

function getServerSnapshot(): UserProgress {
  return createDefaultProgress();
}

let pushTimer: ReturnType<typeof setTimeout> | null = null;

function schedulePush(progress: UserProgress) {
  if (pushTimer) clearTimeout(pushTimer);
  pushTimer = setTimeout(async () => {
    const { pushProgress, isSyncConfigured } = await import('../utils/sync');
    if (isSyncConfigured() && progress.name) {
      pushProgress(progress).catch(() => {});
    }
  }, 2000);
}

function update(fn: (prev: UserProgress) => UserProgress) {
  const current = loadProgress();
  const next = fn(current);
  cachedSnapshot = next;
  saveProgress(next);
  schedulePush(next);
}

// ---- Hook ----

export function useProgress() {
  const progress = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setName = useCallback((name: string) => {
    update((p) => ({ ...p, name }));
  }, []);

  const setLanguages = useCallback((languages: LanguageCode[]) => {
    update((p) => {
      const newProgress = { ...p, languages };
      for (const lang of languages) {
        if (!newProgress.progress[lang]) {
          newProgress.progress = { ...newProgress.progress, [lang]: { lessons: {} } };
        }
      }
      return newProgress;
    });
  }, []);

  const toggleLanguage = useCallback((lang: LanguageCode) => {
    update((p) => {
      const has = p.languages.includes(lang);
      const languages = has
        ? p.languages.filter((l) => l !== lang)
        : [...p.languages, lang];
      const newProgress = { ...p, languages };
      if (!has && !newProgress.progress[lang]) {
        newProgress.progress = { ...newProgress.progress, [lang]: { lessons: {} } };
      }
      return newProgress;
    });
  }, []);

  const saveLessonResume = useCallback(
    (lang: LanguageCode, lessonId: string, exerciseIndex: number) => {
      update((p) => {
        const langProgress = p.progress[lang] ?? { lessons: {} };
        const existing = langProgress.lessons[lessonId];
        return {
          ...p,
          progress: {
            ...p.progress,
            [lang]: {
              ...langProgress,
              lessons: {
                ...langProgress.lessons,
                [lessonId]: {
                  completed: existing?.completed ?? false,
                  score: existing?.score ?? 0,
                  completedAt: existing?.completedAt,
                  lastExercise: exerciseIndex,
                  attempts: existing?.attempts ?? 1,
                },
              },
            },
          },
        };
      });
    },
    []
  );

  const markLessonComplete = useCallback(
    (lang: LanguageCode, lessonId: string, score: number) => {
      update((p) => {
        const langProgress = p.progress[lang] ?? { lessons: {} };
        const existing = langProgress.lessons[lessonId];
        return {
          ...p,
          progress: {
            ...p.progress,
            [lang]: {
              ...langProgress,
              lessons: {
                ...langProgress.lessons,
                [lessonId]: {
                  completed: true,
                  score: Math.max(score, existing?.score ?? 0),
                  completedAt: new Date().toISOString(),
                  lastExercise: 0,
                  attempts: (existing?.attempts ?? 0) + 1,
                },
              },
            },
          },
        };
      });
    },
    []
  );

  const getLessonProgress = useCallback(
    (lang: LanguageCode, lessonId: string): LessonProgress | undefined => {
      return progress.progress[lang]?.lessons[lessonId];
    },
    [progress]
  );

  const getLanguageCompletionPercent = useCallback(
    (lang: LanguageCode, totalLessons: number): number => {
      const langProgress = progress.progress[lang];
      if (!langProgress) return 0;
      const completed = Object.values(langProgress.lessons).filter((l) => l.completed).length;
      return Math.round((completed / totalLessons) * 100);
    },
    [progress]
  );

  const setAudioEnabled = useCallback((enabled: boolean) => {
    update((p) => ({ ...p, settings: { ...p.settings, audioEnabled: enabled } }));
  }, []);

  const exportProgress = useCallback((): string => {
    return JSON.stringify(progress, null, 2);
  }, [progress]);

  const importProgress = useCallback((json: string) => {
    try {
      const parsed = JSON.parse(json);
      const migrated = migrateProgress(parsed);
      cachedSnapshot = migrated;
      saveProgress(migrated);
    } catch (e) {
      throw new Error('Invalid progress data');
    }
  }, []);

  const resetProgress = useCallback(() => {
    const fresh = createDefaultProgress();
    cachedSnapshot = fresh;
    saveProgress(fresh);
  }, []);

  // Clears local session only — cloud data is preserved for next login
  const logout = useCallback(() => {
    const fresh = createDefaultProgress();
    cachedSnapshot = fresh;
    saveProgress(fresh);
  }, []);

  // All 3 languages are always enrolled — onboarding just needs a name
  const isOnboarded = progress.name.length > 0;

  return {
    progress,
    isOnboarded,
    setName,
    setLanguages,
    toggleLanguage,
    saveLessonResume,
    markLessonComplete,
    getLessonProgress,
    getLanguageCompletionPercent,
    setAudioEnabled,
    exportProgress,
    importProgress,
    resetProgress,
    logout,
  };
}
