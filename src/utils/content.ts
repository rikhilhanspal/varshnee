import type { LanguageCode, SectionManifest, Lesson, VocabularyEntry, GrammarNote, LanguageMeta } from '../types';

// Static imports for all content — Vite bundles these at build time
const manifestModules = import.meta.glob<{ default: SectionManifest }>(
  '../content/*/manifest.json',
  { eager: true }
);
const lessonModules = import.meta.glob<{ default: Lesson }>(
  '../content/*/lessons/*.json',
  { eager: true }
);
const vocabModules = import.meta.glob<{ default: VocabularyEntry[] }>(
  '../content/*/vocabulary.json',
  { eager: true }
);
const grammarModules = import.meta.glob<{ default: GrammarNote[] }>(
  '../content/*/grammar.json',
  { eager: true }
);
const metaModules = import.meta.glob<{ default: LanguageMeta }>(
  '../content/*/meta.json',
  { eager: true }
);

export function getLanguageMeta(lang: LanguageCode): LanguageMeta {
  const key = `../content/${lang}/meta.json`;
  return metaModules[key].default;
}

export function getAllLanguageMetas(): LanguageMeta[] {
  return Object.values(metaModules).map((m) => m.default);
}

export function getManifest(lang: LanguageCode): SectionManifest {
  const key = `../content/${lang}/manifest.json`;
  return manifestModules[key].default;
}

export function getLesson(lang: LanguageCode, lessonId: string): Lesson {
  const key = `../content/${lang}/lessons/${lessonId}.json`;
  const mod = lessonModules[key];
  if (!mod) throw new Error(`Lesson not found: ${lang}/${lessonId}`);
  return mod.default;
}

export function getVocabulary(lang: LanguageCode): VocabularyEntry[] {
  const key = `../content/${lang}/vocabulary.json`;
  return vocabModules[key]?.default ?? [];
}

export function getGrammar(lang: LanguageCode): GrammarNote[] {
  const key = `../content/${lang}/grammar.json`;
  return grammarModules[key]?.default ?? [];
}

export function getVocabularyByIds(lang: LanguageCode, ids: string[]): VocabularyEntry[] {
  const vocab = getVocabulary(lang);
  return ids.map((id) => vocab.find((v) => v.id === id)).filter(Boolean) as VocabularyEntry[];
}

export function getGrammarByIds(lang: LanguageCode, ids: string[]): GrammarNote[] {
  const grammar = getGrammar(lang);
  return ids.map((id) => grammar.find((g) => g.id === id)).filter(Boolean) as GrammarNote[];
}
