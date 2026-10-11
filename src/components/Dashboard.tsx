import { useNavigate } from 'react-router-dom';
import { useProgress } from '../stores/progress';
import { getLanguageMeta } from '../utils/content';
import ProgressBar from './ProgressBar';
import type { LanguageCode } from '../types';

const LANGUAGES: { code: LanguageCode; displayName: string; script: string }[] = [
  { code: 'hindi',  displayName: 'Hindi',  script: 'namaste'     },
  { code: 'tamil',  displayName: 'Tamil',  script: 'vanakkam'    },
  { code: 'telugu', displayName: 'Telugu', script: 'namaskaaramu'},
];

export default function Dashboard() {
  const { progress, getLanguageCompletionPercent } = useProgress();
  const navigate = useNavigate();

  return (
    <div>
      {/* Greeting — on dark maroon background (60% zone) */}
      <div className="mb-12">
        <p
          className="text-xs tracking-widest uppercase mb-2"
          style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-on-dark-muted)', letterSpacing: '0.12em' }}
        >
          Welcome back
        </p>
        <h1
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(2rem, 5vw, 2.75rem)',
            lineHeight: 1.1,
            letterSpacing: '0.01em',
            color: 'var(--color-on-dark)',
          }}
          className="font-normal"
        >
          {progress.name}.
        </h1>
      </div>

      <div className="gold-rule mb-10" />

      <p
        className="text-xs tracking-widest uppercase mb-6"
        style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-on-dark-muted)', letterSpacing: '0.12em' }}
      >
        Your languages
      </p>

      {/* Language cards — neutral surfaces (30% zone) */}
      <div className="flex flex-col gap-3">
        {LANGUAGES.map(({ code, displayName, script }) => {
          const meta = getLanguageMeta(code);
          const percent = getLanguageCompletionPercent(code, meta.totalLessons);
          const done = Math.round((percent / 100) * meta.totalLessons);

          return (
            <button
              key={code}
              onClick={() => navigate(`/${code}`)}
              className="lang-card group"
            >
              <div className="flex items-end justify-between mb-4">
                <div>
                  <h2
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: '1.65rem',
                      letterSpacing: '0.01em',
                      lineHeight: 1,
                      color: 'var(--color-on-light)',
                    }}
                    className="font-normal mb-1"
                  >
                    {displayName}
                  </h2>
                  <p style={{ fontFamily: 'var(--font-script)', fontSize: '1rem', color: 'var(--color-on-light-muted)' }}>
                    {script}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs" style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-on-light-muted)' }}>
                    {done} of {meta.totalLessons}
                  </p>
                  <p className="text-sm font-medium" style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-on-light)' }}>
                    {percent}%
                  </p>
                </div>
              </div>
              <ProgressBar percent={percent} size="sm" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
