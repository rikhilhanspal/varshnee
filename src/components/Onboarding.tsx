import { useState } from 'react';
import { useProgress } from '../stores/progress';
import type { LanguageCode } from '../types';

const ALL_LANGUAGES: LanguageCode[] = ['hindi', 'tamil', 'telugu'];

export default function Onboarding() {
  const { setName, setLanguages } = useProgress();
  const [nameInput, setNameInput] = useState('');

  const handleBegin = () => {
    const trimmed = nameInput.trim();
    if (!trimmed) return;
    setName(trimmed);
    setLanguages(ALL_LANGUAGES);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-16">
      {/* Logo — inverted to show on dark maroon bg */}
      <img src="/logo.png" alt="varshnee" className="h-20 w-20 object-contain mb-8 brightness-0 invert opacity-75" />

      <h1
        style={{ fontFamily: 'var(--font-serif)', letterSpacing: '0.04em', fontSize: 'clamp(2rem, 6vw, 3rem)', color: 'var(--color-on-dark)' }}
        className="font-normal mb-2 text-center"
      >
        varshnee
      </h1>
      <p
        style={{ fontFamily: 'var(--font-script)', fontSize: '1.35rem', color: 'var(--color-gold)' }}
        className="mb-12 text-center"
      >
        Hindi · Tamil · Telugu
      </p>

      <div className="gold-rule w-16 mb-10" />

      {/* Neutral card — 30% zone */}
      <div className="w-full max-w-sm surface" style={{ padding: '2rem' }}>
        <label
          htmlFor="name"
          className="block text-xs tracking-widest uppercase mb-3"
          style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-on-light)', letterSpacing: '0.12em' }}
        >
          Your name
        </label>
        <input
          id="name"
          type="text"
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleBegin()}
          placeholder="Enter your name"
          autoFocus
          className="w-full bg-transparent border-b pb-3 text-base focus:outline-none transition-colors mb-8"
          style={{
            fontFamily: 'var(--font-sans)',
            color: 'var(--color-on-light)',
            borderColor: 'var(--color-gold-border)',
            caretColor: 'var(--color-gold)',
            transition: 'border-color var(--duration-normal) var(--ease-out)',
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--color-gold)')}
          onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--color-gold-border)')}
        />
        <button
          onClick={handleBegin}
          disabled={!nameInput.trim()}
          className="btn-primary"
        >
          Begin
        </button>
      </div>

    </div>
  );
}
