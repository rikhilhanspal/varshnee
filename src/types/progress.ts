import type { LanguageCode } from './index';

export interface LessonProgress {
  completed: boolean;
  score: number;
  completedAt?: string;
  lastExercise: number;
  attempts: number;
}

export interface LanguageProgress {
  lessons: Record<string, LessonProgress>;
}

export interface UserProgress {
  v: number;
  name: string;
  languages: LanguageCode[];
  progress: Partial<Record<LanguageCode, LanguageProgress>>;
  settings: {
    audioEnabled: boolean;
  };
}

export const CURRENT_SCHEMA_VERSION = 1;

export function createDefaultProgress(): UserProgress {
  return {
    v: CURRENT_SCHEMA_VERSION,
    name: '',
    languages: [],
    progress: {},
    settings: { audioEnabled: true },
  };
}
