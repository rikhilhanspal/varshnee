import { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation, useParams } from 'react-router-dom';
import Home from './pages/Home';
import LanguagePathway from './pages/LanguagePathway';
import LessonPage from './pages/LessonPage';
import Settings from './pages/Settings';

// Forces LessonPage to fully remount when navigating between lessons,
// so state (completed, currentIndex, etc.) never carries over.
function LessonPageKeyed() {
  const { lang, section, lesson } = useParams<{ lang: string; section: string; lesson: string }>();
  const location = useLocation();
  return <LessonPage key={`${lang}-${section}-${lesson}-${location.key}`} />;
}
import { useProgress } from './stores/progress';
import { pullProgress, isSyncConfigured } from './utils/sync';
import type { LanguageCode } from './types';

const ALL_LANGS: { code: LanguageCode; label: string }[] = [
  { code: 'hindi',  label: 'hindi'  },
  { code: 'tamil',  label: 'tamil'  },
  { code: 'telugu', label: 'telugu' },
];

function Navbar() {
  const { isOnboarded, logout } = useProgress();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  if (!isOnboarded) return null;

  const langMatch = location.pathname.match(/^\/(hindi|tamil|telugu)/);
  const activeLang = langMatch?.[1] as LanguageCode | undefined;

  return (
    <header className="sticky top-0 z-20" style={{ background: 'var(--color-maroon)' }}>
      <div className="max-w-2xl mx-auto px-6 h-14 flex items-center justify-between gap-6">
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <img src="/logo.png" alt="varshnee" className="h-8 w-8 object-contain brightness-0 invert opacity-90" />
          <span
            style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', letterSpacing: '0.01em', color: 'var(--color-sand)' }}
            className="font-normal"
          >
            varshnee
          </span>
        </Link>

        <div className="relative">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Menu"
            className="flex flex-col justify-center gap-[5px] p-1 opacity-50 hover:opacity-100 transition-opacity"
          >
            <span className="block w-5 h-px" style={{ background: 'var(--color-sand)' }} />
            <span className="block w-5 h-px" style={{ background: 'var(--color-sand)' }} />
            <span className="block w-5 h-px" style={{ background: 'var(--color-sand)' }} />
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div
                className="absolute right-0 top-full mt-2 z-20 min-w-40"
                style={{ background: 'var(--color-neutral)', border: '1px solid var(--color-gold-border)', borderRadius: '2px' }}
              >
                {activeLang && (
                  <div className="px-4 pt-3 pb-2" style={{ borderBottom: '1px solid rgba(220,194,151,0.15)' }}>
                    <p className="text-xs tracking-widest uppercase mb-2"
                      style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-on-light-muted)', letterSpacing: '0.12em', opacity: 0.5 }}>
                      languages
                    </p>
                    {ALL_LANGS.map(({ code, label }) => (
                      <button
                        key={code}
                        onClick={() => { navigate(`/${code}`); setMenuOpen(false); }}
                        className="block w-full text-left py-1.5 text-sm transition-colors"
                        style={{
                          fontFamily: 'var(--font-sans)',
                          color: activeLang === code ? 'var(--color-gold)' : 'var(--color-on-light)',
                          fontWeight: activeLang === code ? 500 : 400,
                        }}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                )}
                <div className="px-4 py-3 flex flex-col gap-3">
                  <Link
                    to="/settings"
                    onClick={() => setMenuOpen(false)}
                    className="block text-sm transition-colors"
                    style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-on-light)' }}
                  >
                    settings
                  </Link>
                  <button
                    onClick={() => { logout(); navigate('/'); setMenuOpen(false); }}
                    className="block w-full text-left text-sm transition-colors opacity-50 hover:opacity-100"
                    style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-on-light)' }}
                  >
                    log out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

/** Pulls remote progress once when the user is identified. Push is handled by the store. */
function SyncManager() {
  const { progress, isOnboarded, importProgress } = useProgress();
  const pulled = useRef(false);

  useEffect(() => {
    if (!isSyncConfigured() || !isOnboarded || pulled.current) return;
    pulled.current = true;
    pullProgress(progress.name).then((remote) => {
      if (remote) importProgress(JSON.stringify(remote));
    });
  }, [isOnboarded]);

  return null;
}

function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="max-w-2xl mx-auto px-6 py-10 page-enter">{children}</main>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <SyncManager />
      <Routes>
        <Route path="/" element={<AppShell><Home /></AppShell>} />
        <Route path="/settings" element={<AppShell><Settings /></AppShell>} />
        <Route path="/:lang" element={<AppShell><LanguagePathway /></AppShell>} />
        <Route path="/:lang/:section/:lesson" element={<AppShell><LessonPageKeyed /></AppShell>} />
      </Routes>
    </BrowserRouter>
  );
}
