/**
 * Expands each lesson's exercise bank to 20 questions
 * by auto-generating questions from the lesson's vocabulary.
 * Run with: node scripts/expand-banks.cjs
 */

const fs = require('fs');
const path = require('path');

const LANGS = ['hindi', 'tamil', 'telugu'];
const LANG_NAMES = { hindi: 'Hindi', tamil: 'Tamil', telugu: 'Telugu' };
const LANG_CODES = { hindi: 'hi', tamil: 'ta', telugu: 'te' };
const TARGET = 20;
const CONTENT = path.join(__dirname, '../src/content');

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function getDistractors(allVocab, correctEnglish, count) {
  return shuffle(allVocab.filter(v => v.english !== correctEnglish))
    .slice(0, count)
    .map(v => v.english);
}

function insertAt(arr, idx, item) {
  const copy = [...arr];
  copy.splice(idx, 0, item);
  return copy.slice(0, 4);
}

for (const lang of LANGS) {
  const langDir = path.join(CONTENT, lang);
  const allVocab = JSON.parse(fs.readFileSync(path.join(langDir, 'vocabulary.json'), 'utf8'));
  const lessonsDir = path.join(langDir, 'lessons');
  const lc = LANG_CODES[lang];
  const langName = LANG_NAMES[lang];

  for (const file of fs.readdirSync(lessonsDir).sort()) {
    const lessonPath = path.join(lessonsDir, file);
    const lesson = JSON.parse(fs.readFileSync(lessonPath, 'utf8'));
    const existing = lesson.exercises.length;
    if (existing >= TARGET) { console.log(`${lang}/${file}: already ${existing} ✓`); continue; }

    const lessonVocab = lesson.vocabularyIds
      .map(id => allVocab.find(v => v.id === id))
      .filter(Boolean);

    if (lessonVocab.length === 0) { console.log(`${lang}/${file}: no vocab, skipping`); continue; }

    const generated = [];
    let genIdx = 0;

    for (const v of lessonVocab) {
      const base = `${lc}-${lesson.id}-g`;

      // 1. Multiple choice: romanized → english
      const d1 = getDistractors(allVocab, v.english, 3);
      if (d1.length === 3) {
        const pos = Math.floor(Math.random() * 4);
        const options = insertAt(d1, pos, v.english);
        generated.push({
          id: `${base}${String(++genIdx).padStart(2,'0')}`,
          type: 'multiple_choice',
          question: `What does '${v.romanized}' mean?`,
          options,
          correctIndex: options.indexOf(v.english),
          explanation: `'${v.romanized}' means '${v.english}' in ${langName}.`,
        });
      }

      // 2. Translation from_english
      generated.push({
        id: `${base}${String(++genIdx).padStart(2,'0')}`,
        type: 'translation',
        prompt: `How do you say '${v.english}' in ${langName}?`,
        direction: 'from_english',
        correct: v.romanized,
        acceptedVariants: [],
        hint: `sounds like: ${v.romanized}`,
        explanation: `'${v.english}' in ${langName} is '${v.romanized}'.`,
      });

      // 3. Translation to_english
      generated.push({
        id: `${base}${String(++genIdx).padStart(2,'0')}`,
        type: 'translation',
        prompt: `Translate '${v.romanized}' to English.`,
        direction: 'to_english',
        correct: v.english,
        acceptedVariants: [],
        explanation: `'${v.romanized}' means '${v.english}'.`,
      });
    }

    const needed = TARGET - existing;
    const toAdd = shuffle(generated).slice(0, needed);
    lesson.exercises = [...lesson.exercises, ...toAdd];

    fs.writeFileSync(lessonPath, JSON.stringify(lesson, null, 2));
    console.log(`${lang}/${file}: ${existing} → ${lesson.exercises.length} exercises`);
  }
}

console.log('\nDone.');
