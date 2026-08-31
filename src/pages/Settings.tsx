import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProgress } from '../stores/progress';

function SettingRow({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-5" style={{ borderBottom: '1px solid rgba(220, 194, 151, 0.12)' }}>
      <div>
        <p className="text-sm font-medium" style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-on-dark)' }}>{label}</p>
        {description && (
          <p className="text-xs mt-0.5" style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-on-dark-muted)' }}>{description}</p>
        )}
      </div>
      {children}
    </div>
  );
}

export default function Settings() {
  const navigate = useNavigate();
  const { progress, setAudioEnabled, resetProgress } = useProgress();
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleReset = () => { resetProgress(); navigate('/'); };

  return (
    <div>
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-1.5 text-xs tracking-widest uppercase mb-10 transition-opacity hover:opacity-100 opacity-40"
        style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-on-dark)', letterSpacing: '0.12em' }}
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M9 6H3M5 4l-2 2 2 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Back
      </button>

      <h1
        style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.75rem, 4vw, 2.25rem)', letterSpacing: '0.01em', color: 'var(--color-on-dark)' }}
        className="font-normal mb-10"
      >
        Settings
      </h1>

      <div className="gold-rule mb-2" />

      <SettingRow label="Audio" description="Play pronunciation in exercises.">
        <button
          onClick={() => setAudioEnabled(!progress.settings.audioEnabled)}
          className="relative shrink-0 w-11 h-6 rounded-full transition-all"
          style={{ background: progress.settings.audioEnabled ? 'var(--color-gold)' : 'rgba(220, 194, 151, 0.15)' }}
        >
          <span
            className="absolute top-0.5 w-5 h-5 rounded-full shadow transition-all"
            style={{ left: progress.settings.audioEnabled ? '22px' : '2px', background: 'var(--color-bg)' }}
          />
        </button>
      </SettingRow>

      <SettingRow label="Reset all data" description="Delete all progress and settings.">
        {!showResetConfirm ? (
          <button
            onClick={() => setShowResetConfirm(true)}
            className="text-xs tracking-widest uppercase opacity-40 hover:opacity-60 transition-opacity"
            style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-on-dark)', letterSpacing: '0.12em' }}
          >
            Reset
          </button>
        ) : (
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowResetConfirm(false)}
              className="text-xs tracking-widest uppercase opacity-50 hover:opacity-100 transition-opacity"
              style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-on-dark)', letterSpacing: '0.12em' }}
            >
              Cancel
            </button>
            <button
              onClick={handleReset}
              className="text-xs tracking-widest uppercase font-medium px-3 py-1.5"
              style={{ fontFamily: 'var(--font-sans)', background: 'var(--color-gold)', color: 'var(--color-maroon)', borderRadius: '2px', letterSpacing: '0.12em' }}
            >
              Confirm
            </button>
          </div>
        )}
      </SettingRow>
    </div>
  );
}
