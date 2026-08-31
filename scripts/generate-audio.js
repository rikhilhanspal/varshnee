#!/usr/bin/env node
/**
 * generate-audio.js
 * Generates MP3 audio files for all vocabulary entries using Google Cloud TTS.
 *
 * Prerequisites:
 *   npm install @google-cloud/text-to-speech
 *   Set GOOGLE_APPLICATION_CREDENTIALS env var to your service account JSON path
 *
 * Usage:
 *   node scripts/generate-audio.js
 *   node scripts/generate-audio.js --lang hindi
 *   node scripts/generate-audio.js --dry-run
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const LANGUAGES = {
  hindi: {
    vocabPath: 'src/content/hindi/vocabulary.json',
    audioDir: 'static/audio/hindi',
    ttsLang: 'hi-IN',
    ttsVoice: 'hi-IN-Neural2-A',
  },
  tamil: {
    vocabPath: 'src/content/tamil/vocabulary.json',
    audioDir: 'static/audio/tamil',
    ttsLang: 'ta-IN',
    ttsVoice: 'ta-IN-Neural2-A',
  },
  telugu: {
    vocabPath: 'src/content/telugu/vocabulary.json',
    audioDir: 'static/audio/telugu',
    ttsLang: 'te-IN',
    ttsVoice: 'te-IN-Standard-A',
  },
};

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const langFilter = args.includes('--lang') ? args[args.indexOf('--lang') + 1] : null;

async function generateAudio() {
  // Lazy-load to allow running without the package
  let TextToSpeechClient;
  if (!dryRun) {
    try {
      const tts = await import('@google-cloud/text-to-speech');
      TextToSpeechClient = tts.TextToSpeechClient;
    } catch {
      console.error('ERROR: @google-cloud/text-to-speech not installed.');
      console.error('Run: npm install @google-cloud/text-to-speech');
      process.exit(1);
    }
  }

  const client = dryRun ? null : new TextToSpeechClient();

  const langs = langFilter
    ? [[langFilter, LANGUAGES[langFilter]]]
    : Object.entries(LANGUAGES);

  let totalGenerated = 0;
  let totalSkipped = 0;

  for (const [lang, config] of langs) {
    if (!config) {
      console.warn(`Unknown language: ${lang}`);
      continue;
    }

    const vocabPath = join(ROOT, config.vocabPath);
    const audioDir = join(ROOT, config.audioDir);

    if (!existsSync(vocabPath)) {
      console.warn(`Vocab file not found: ${vocabPath}`);
      continue;
    }

    const vocab = JSON.parse(readFileSync(vocabPath, 'utf-8'));
    mkdirSync(audioDir, { recursive: true });

    console.log(`\n[${lang}] Processing ${vocab.length} vocabulary entries...`);

    for (const entry of vocab) {
      if (!entry.audio) continue;

      const filename = entry.audio.split('/').pop();
      const outPath = join(audioDir, filename);

      if (existsSync(outPath)) {
        console.log(`  SKIP  ${filename} (exists)`);
        totalSkipped++;
        continue;
      }

      if (dryRun) {
        console.log(`  DRY   ${filename} ← "${entry.romanized}"`);
        totalGenerated++;
        continue;
      }

      try {
        const [response] = await client.synthesizeSpeech({
          input: { text: entry.romanized },
          voice: { languageCode: config.ttsLang, name: config.ttsVoice },
          audioConfig: { audioEncoding: 'MP3', speakingRate: 0.9 },
        });

        writeFileSync(outPath, response.audioContent, 'binary');
        console.log(`  GEN   ${filename} ← "${entry.romanized}"`);
        totalGenerated++;

        // Rate limiting: 10 requests/second
        await new Promise((r) => setTimeout(r, 100));
      } catch (err) {
        console.error(`  ERR   ${filename}: ${err.message}`);
      }
    }
  }

  console.log(`\nDone. Generated: ${totalGenerated}, Skipped: ${totalSkipped}`);
}

generateAudio();
