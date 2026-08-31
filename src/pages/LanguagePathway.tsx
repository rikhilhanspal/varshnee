import { useParams, useNavigate } from 'react-router-dom';
import type { LanguageCode } from '../types';
import { getManifest, getLanguageMeta } from '../utils/content';
import { useProgress } from '../stores/progress';
import PathwaySection from '../components/PathwaySection';
import ProgressBar from '../components/ProgressBar';

export default function LanguagePathway() {
  const { lang } = useParams<{ lang: string }>();
  const navigate = useNavigate();
  const { getLanguageCompletionPercent } = useProgress();

  if (!lang || !['hindi', 'tamil', 'telugu'].includes(lang)) {
    navigate('/');
    return null;
  }

  const langCode = lang as LanguageCode;
  const meta = getLanguageMeta(langCode);
  const manifest = getManifest(langCode);
  const percent = getLanguageCompletionPercent(langCode, meta.totalLessons);

  return (
    <div>
      {/* Header on dark bg */}
      <div className="mb-10">
        <p className="text-xs tracking-widest uppercase mb-2" style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-on-dark-muted)', letterSpacing: '0.12em' }}>
          Learning path
        </p>
        <div className="flex items-end justify-between gap-4">
          <h1
            style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2rem, 5vw, 2.75rem)', letterSpacing: '0.01em', lineHeight: 1, color: 'var(--color-on-dark)' }}
            className="font-normal"
          >
            {meta.name}
          </h1>
          <span className="text-sm pb-1" style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-gold)' }}>
            {percent}%
          </span>
        </div>
        <ProgressBar percent={percent} className="mt-4" size="sm" />
      </div>

      {manifest.sections.map((section, i) => (
        <PathwaySection key={section.id} section={section} lang={langCode} index={i} />
      ))}
    </div>
  );
}
