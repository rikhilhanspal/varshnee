// ---- Language & Content ----

export type LanguageCode = 'hindi' | 'tamil' | 'telugu';

export interface LanguageMeta {
  code: LanguageCode;
  name: string;
  totalLessons: number;
  totalSections: number;
  romanizationNotes: string;
}

export interface Section {
  id: string;
  title: string;
  lessons: LessonSummary[];
}

export interface LessonSummary {
  id: string;
  title: string;
  description: string;
}

export interface SectionManifest {
  language: LanguageCode;
  sections: Section[];
}

export interface VocabularyEntry {
  id: string;
  romanized: string;
  english: string;
  pronunciation: string;
  partOfSpeech: string;
  audio?: string;
}

export interface GrammarNote {
  id: string;
  title: string;
  body: string;
}

// ---- Exercises ----

export type ExerciseType =
  | 'multiple_choice'
  | 'translation'
  | 'fill_in_blank'
  | 'word_ordering'
  | 'listening'
  | 'matching';

interface ExerciseBase {
  id: string;
  type: ExerciseType;
  explanation: string;
  audio?: string;
}

export interface MultipleChoiceExercise extends ExerciseBase {
  type: 'multiple_choice';
  question: string;
  options: string[];
  correctIndex: number;
}

export interface TranslationExercise extends ExerciseBase {
  type: 'translation';
  prompt: string;
  direction: 'to_english' | 'from_english';
  correct: string;
  acceptedVariants: string[];
  hint?: string; // pronunciation guide (from_english) or meaning reminder (to_english)
}

export interface FillInBlankExercise extends ExerciseBase {
  type: 'fill_in_blank';
  sentence: string; // use ___ for blank
  correct: string;
  acceptedVariants: string[];
  hint?: string;
}

export interface WordOrderingExercise extends ExerciseBase {
  type: 'word_ordering';
  prompt: string;
  tiles: { id: string; text: string }[];
  correctOrder: string[]; // tile IDs in correct order
}

export interface ListeningExercise extends ExerciseBase {
  type: 'listening';
  audio: string;
  mode: 'select' | 'type';
  options?: string[];
  correctIndex?: number;
  correct?: string;
  acceptedVariants?: string[];
}

export interface MatchingExercise extends ExerciseBase {
  type: 'matching';
  pairs: { left: string; right: string }[];
}

export type Exercise =
  | MultipleChoiceExercise
  | TranslationExercise
  | FillInBlankExercise
  | WordOrderingExercise
  | ListeningExercise
  | MatchingExercise;

// ---- Lesson ----

export interface Lesson {
  id: string;
  sectionId: string;
  title: string;
  description: string;
  vocabularyIds: string[];
  grammarNoteIds: string[];
  exercises: Exercise[];
}
