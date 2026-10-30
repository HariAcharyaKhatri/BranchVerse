import React, { useState, useEffect } from 'react';
import { ScreenHeader } from '../components/navigation/ScreenHeader';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Moon, Sun, Type, Trash2, Sparkles, HardDrive, Image as ImageIcon, ShieldCheck, User, LogIn, LogOut, CheckCircle2, Globe, Cpu } from 'lucide-react';
import { LOCAL_ASSET_MANIFEST } from '../features/assets/assetManifest';
import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../i18n';
import { LANGUAGE_LABELS, SupportedLanguage } from '../types/story';

interface SettingsPageProps {
  onBack?: () => void;
  onNavigate?: (path: string) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onBack, onNavigate }) => {
  const { language, setLanguage, t } = useI18n();
  const { user, loading: authLoading, signOut } = useAuth();
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('bv_theme') as any) || 'dark';
  });

  const [fontSize, setFontSize] = useState<number>(() => {
    return parseInt(localStorage.getItem('bv_font_size') || '16', 10);
  });

  const [fontFamily, setFontFamily] = useState<'serif' | 'sans'>(() => {
    return (localStorage.getItem('bv_font_family') as any) || 'serif';
  });

  const [quotaInfo, setQuotaInfo] = useState<{ usedMb: string; quotaMb: string } | null>(null);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isCreditsModalOpen, setIsCreditsModalOpen] = useState(false);
  const [resetFeedback, setResetFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (navigator.storage && navigator.storage.estimate) {
      navigator.storage.estimate().then(estimate => {
        const usedMb = ((estimate.usage || 0) / (1024 * 1024)).toFixed(2);
        const quotaMb = ((estimate.quota || 0) / (1024 * 1024)).toFixed(0);
        setQuotaInfo({ usedMb, quotaMb });
      });
    }
  }, []);

  const handleThemeChange = (newTheme: 'dark' | 'light') => {
    setTheme(newTheme);
    localStorage.setItem('bv_theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleFontSizeChange = (size: number) => {
    setFontSize(size);
    localStorage.setItem('bv_font_size', size.toString());
  };

  const handleFontFamilyChange = (family: 'serif' | 'sans') => {
    setFontFamily(family);
    localStorage.setItem('bv_font_family', family);
  };

  const handleClearAllData = async () => {
    try {
      window.indexedDB.deleteDatabase('branchverse_db');
      localStorage.clear();
      setIsResetModalOpen(false);
      setResetFeedback('All local storage cleared. Reloading app...');
      setTimeout(() => {
        window.location.hash = '#/';
        window.location.reload();
      }, 1500);
    } catch (err: any) {
      setResetFeedback(`Failed to reset: ${err.message}`);
    }
  };

  return (
    <div className="flex flex-col h-full bg-dark-bg">
      <ScreenHeader
        title={t.settings.title}
        subtitle={t.settings.appLanguageDesc}
        onBack={onBack}
      />

      <div className="flex-1 p-4 overflow-y-auto overscroll-contain max-w-md mx-auto w-full space-y-4 safe-area-bottom">
        {/* App Info Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-dark-surface to-dark-elevated border border-dark-border text-center space-y-1">
          <h3 className="font-bold text-base text-dark-text tracking-tight flex items-center justify-center gap-1.5">
            <Sparkles className="w-4 h-4 text-brand-primary" /> {t.common.appName}
          </h3>
          <p className="text-xs text-dark-muted font-medium">
            "{t.common.tagline}"
          </p>
          <div className="text-[10px] text-dark-muted/70 pt-1">
            Mobile-First Interactive Storytelling Platform • Dual Gemini AI Engine
          </div>
        </div>

        {/* App Interface Language Section */}
        <div className="p-4 rounded-2xl bg-dark-surface border border-dark-border space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-dark-muted uppercase tracking-wider flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-brand-primary" /> {t.settings.appLanguage}
            </span>
            <span className="text-[10px] text-brand-glow font-bold bg-brand-primary/10 px-2 py-0.5 rounded-full border border-brand-primary/30">
              {LANGUAGE_LABELS[language].flag} {LANGUAGE_LABELS[language].native}
            </span>
          </div>
          <p className="text-xs text-dark-muted leading-relaxed">
            {t.settings.appLanguageDesc}
          </p>
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(LANGUAGE_LABELS) as SupportedLanguage[]).map((langKey) => (
              <button
                key={langKey}
                onClick={() => setLanguage(langKey)}
                className={`p-2.5 rounded-xl text-xs font-medium border flex items-center justify-center gap-1.5 transition-all select-none ${
                  language === langKey
                    ? 'bg-brand-primary/20 border-brand-primary text-white shadow-sm ring-1 ring-brand-primary/50'
                    : 'bg-dark-elevated border-dark-border/80 text-dark-muted hover:text-dark-text hover:border-dark-border'
                }`}
              >
                <span>{LANGUAGE_LABELS[langKey].flag}</span>
                <span className="truncate">{LANGUAGE_LABELS[langKey].native}</span>
              </button>
            ))}
          </div>
        </div>

        {/* AI Narrative Engine Status */}
        <div className="p-4 rounded-2xl bg-dark-surface border border-dark-border space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-dark-muted uppercase tracking-wider flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-brand-glow" /> {t.settings.aiBackendStatus}
            </span>
            <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              Dual Model Active
            </span>
          </div>
          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded-xl bg-dark-elevated border border-dark-border/80 flex items-center justify-between">
              <div>
                <div className="font-semibold text-white">{t.settings.modelA}</div>
                <div className="text-[10px] text-dark-muted font-mono">ID: gemini-3.8-flash (World Premise & Opening)</div>
              </div>
              <span className="text-[10px] px-2 py-0.5 bg-brand-primary/20 text-brand-primary font-mono rounded">
                5 RPM / 20 RPD
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-dark-elevated border border-dark-border/80 flex items-center justify-between">
              <div>
                <div className="font-semibold text-white">{t.settings.modelB}</div>
                <div className="text-[10px] text-dark-muted font-mono">ID: gemini-3.1-flash-lite (Turns & Action Consequences)</div>
              </div>
              <span className="text-[10px] px-2 py-0.5 bg-amber-500/20 text-amber-300 font-mono rounded">
                15 RPM / 500 RPD
              </span>
            </div>
          </div>
        </div>

        {/* Account & Identity Section */}
        <div className="p-4 rounded-2xl bg-dark-surface border border-dark-border space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-dark-muted uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-brand-primary" /> Account & Identity
            </span>
            {user && (
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Google Verified
              </span>
            )}
          </div>

          {user ? (
            <div className="p-3 rounded-xl bg-dark-elevated border border-dark-border/80 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'Hero'}
                    className="w-10 h-10 rounded-full border border-brand-primary/50 object-cover shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-brand-primary/20 text-brand-primary flex items-center justify-center font-bold text-sm border border-brand-primary/40 shrink-0">
                    {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'H'}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white truncate">
                    {user.displayName || 'Hari Khatri'}
                  </div>
                  <div className="text-[11px] text-dark-muted truncate">
                    {user.email || 'Google Account'}
                  </div>
                </div>
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={signOut}
                disabled={authLoading}
                className="shrink-0 text-xs text-red-400 border-red-500/30 hover:bg-red-500/10"
              >
                <LogOut className="w-3.5 h-3.5 mr-1" /> Sign Out
              </Button>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-dark-elevated border border-dark-border/80 space-y-2">
              <p className="text-xs text-dark-muted leading-relaxed">
                Sign in with your Google account to access your hero legacy.
              </p>
              <Button
                size="sm"
                variant="primary"
                className="w-full text-xs"
                onClick={() => {
                  if (onNavigate) {
                    onNavigate('#/login');
                  } else {
                    window.location.hash = '#/login';
                  }
                }}
              >
                <LogIn className="w-3.5 h-3.5 mr-1.5" /> Sign In with Google
              </Button>
            </div>
          )}
        </div>

        {/* Local Anime Asset Library Status */}
        <div className="p-4 rounded-2xl bg-dark-surface border border-dark-border space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-dark-muted uppercase tracking-wider flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-brand-accent" /> Local Anime Art Assets
            </span>
            <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> CC0 & CC-BY
            </span>
          </div>
          <p className="text-xs text-dark-muted leading-relaxed">
            All visual novel backgrounds and character sprites are hosted locally inside the app. No external image servers or generative fees required.
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs pt-1">
            <div className="p-2.5 rounded-xl bg-dark-elevated border border-dark-border text-center">
              <div className="font-bold text-base text-dark-text">{LOCAL_ASSET_MANIFEST.characters.length}</div>
              <div className="text-[10px] text-dark-muted">Character Sets</div>
            </div>
            <div className="p-2.5 rounded-xl bg-dark-elevated border border-dark-border text-center">
              <div className="font-bold text-base text-dark-text">{LOCAL_ASSET_MANIFEST.backgrounds.length}</div>
              <div className="text-[10px] text-dark-muted">Scene Backgrounds</div>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            fullWidth
            onClick={() => setIsCreditsModalOpen(true)}
          >
            View Art Attributions & Licenses
          </Button>
        </div>

        {/* Theme Settings */}
        <div className="p-4 rounded-2xl bg-dark-surface border border-dark-border space-y-2.5">
          <div className="text-xs font-semibold text-dark-muted uppercase tracking-wider">
            Theme Appearance
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleThemeChange('dark')}
              className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-semibold transition-all ${
                theme === 'dark'
                  ? 'bg-brand-primary/20 border-brand-primary text-white shadow-sm'
                  : 'bg-dark-elevated border-dark-border text-dark-muted'
              }`}
            >
              <Moon className="w-4 h-4 text-indigo-400" /> Dark Mode
            </button>
            <button
              onClick={() => handleThemeChange('light')}
              className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-semibold transition-all ${
                theme === 'light'
                  ? 'bg-brand-primary/20 border-brand-primary text-white shadow-sm'
                  : 'bg-dark-elevated border-dark-border text-dark-muted'
              }`}
            >
              <Sun className="w-4 h-4 text-amber-400" /> Light Mode
            </button>
          </div>
        </div>

        {/* Reader Typography */}
        <div className="p-4 rounded-2xl bg-dark-surface border border-dark-border space-y-3">
          <div className="text-xs font-semibold text-dark-muted uppercase tracking-wider flex items-center gap-1.5">
            <Type className="w-3.5 h-3.5 text-brand-primary" /> Reader Typography
          </div>

          <div>
            <label className="block text-[11px] font-medium text-dark-muted mb-1.5">
              Reading Font Style
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleFontFamilyChange('serif')}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  fontFamily === 'serif'
                    ? 'bg-brand-primary/20 border-brand-primary text-white font-bold'
                    : 'bg-dark-elevated border-dark-border text-dark-muted'
                }`}
              >
                <span className="font-narrative text-sm">Merriweather (Book)</span>
              </button>
              <button
                onClick={() => handleFontFamilyChange('sans')}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  fontFamily === 'sans'
                    ? 'bg-brand-primary/20 border-brand-primary text-white font-bold'
                    : 'bg-dark-elevated border-dark-border text-dark-muted'
                }`}
              >
                <span className="font-sans text-sm">Inter (Modern)</span>
              </button>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center text-[11px] font-medium text-dark-muted mb-1">
              <span>Text Size</span>
              <span className="font-bold text-dark-text">{fontSize}px</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-dark-muted">A</span>
              <input
                type="range"
                min="14"
                max="22"
                step="1"
                value={fontSize}
                onChange={(e) => handleFontSizeChange(parseInt(e.target.value, 10))}
                className="w-full accent-brand-primary cursor-pointer h-2 bg-dark-border rounded-lg"
              />
              <span className="text-base font-bold text-dark-text">A</span>
            </div>
          </div>
        </div>

        {/* Local Storage & Cache */}
        <div className="p-4 rounded-2xl bg-dark-surface border border-dark-border space-y-3">
          <div className="text-xs font-semibold text-dark-muted uppercase tracking-wider flex items-center gap-1.5">
            <HardDrive className="w-3.5 h-3.5 text-amber-400" /> Device Storage
          </div>

          {quotaInfo && (
            <div className="text-xs text-dark-muted space-y-1">
              <div className="flex justify-between">
                <span>IndexedDB Used:</span>
                <span className="font-semibold text-dark-text">{quotaInfo.usedMb} MB</span>
              </div>
              <div className="flex justify-between">
                <span>Available Quota:</span>
                <span className="font-semibold text-dark-text">{quotaInfo.quotaMb} MB</span>
              </div>
            </div>
          )}

          <div className="pt-2">
            <Button
              variant="danger"
              size="sm"
              fullWidth
              onClick={() => setIsResetModalOpen(true)}
              iconLeft={<Trash2 className="w-3.5 h-3.5" />}
            >
              Reset All Local Stories & Data
            </Button>
          </div>

          {resetFeedback && (
            <div className="p-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-center">
              {resetFeedback}
            </div>
          )}
        </div>
      </div>

      {/* Credits & Attributions Modal */}
      <Modal
        isOpen={isCreditsModalOpen}
        onClose={() => setIsCreditsModalOpen(false)}
        title="Art & Asset Attributions"
        footer={
          <Button size="sm" variant="primary" onClick={() => setIsCreditsModalOpen(false)}>
            Close
          </Button>
        }
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 rounded-xl bg-dark-elevated border border-dark-border space-y-1">
            <h4 className="font-bold text-dark-text">Character Sprites & Expressions</h4>
            <p className="text-dark-muted">
              • <strong>Hari, Aria, Master Shen, Captain Ronald, Masked Commander</strong>: Created by <em>FALLiNG_AiR</em> under <strong>CC0 1.0 Universal (Public Domain)</strong> via OpenGameArt.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-dark-elevated border border-dark-border space-y-1">
            <h4 className="font-bold text-dark-text">Background Environments</h4>
            <p className="text-dark-muted">
              • <strong>Fantasy Citadel, Mountain Peaks, Temples, Shrines</strong>: Created by <em>olracadejup</em> under <strong>CC0 1.0 Universal</strong>.
            </p>
            <p className="text-dark-muted">
              • <strong>Cyberpunk Street & Underbelly</strong>: Created by <em>ansimuz</em> under <strong>CC-BY 3.0</strong>.
            </p>
            <p className="text-dark-muted">
              • <strong>Sci-Fi Biotech Lab</strong>: Created by <em>ask4asset.com</em> under <strong>CC0 1.0 Universal</strong>.
            </p>
            <p className="text-dark-muted">
              • <strong>The Whisperwood Forests</strong>: Created by <em>Tamara Ramsay (ramtam) & Bertram</em> under <strong>CC-BY-SA 3.0</strong>.
            </p>
            <p className="text-dark-muted">
              • <strong>School Hallways & Auditorium</strong>: Created by <em>Gunnar Klingen (Uncle Mugen)</em> under <strong>CC-BY 3.0</strong>.
            </p>
            <p className="text-dark-muted">
              • <strong>Tavern Lounge & Ruined Battleground</strong>: Created by <em>potat0</em> under <strong>CC-BY 3.0</strong>.
            </p>
          </div>
        </div>
      </Modal>

      {/* Reset Confirmation Modal */}
      <Modal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        title="Reset All Local Data?"
        footer={
          <>
            <Button size="sm" variant="ghost" onClick={() => setIsResetModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" variant="danger" onClick={handleClearAllData}>
              Yes, Clear Everything
            </Button>
          </>
        }
      >
        <p className="text-xs text-dark-muted leading-relaxed">
          This action will permanently delete all created heroes, narrative turns, and saved stories from your browser’s IndexedDB. Ensure you have downloaded a JSON backup if you wish to keep them!
        </p>
      </Modal>
    </div>
  );
};
