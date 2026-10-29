import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Pause, Play } from 'lucide-react';
import { SupportedLanguage } from '../../types/story';

interface NarratorAudioProps {
  text: string;
  sceneTitle?: string;
  storyLanguage: SupportedLanguage;
}

const LANG_VOICE_MAP: Record<SupportedLanguage, string> = {
  en: 'en-US',
  hi: 'hi-IN',
  es: 'es-ES',
  fr: 'fr-FR',
  ja: 'ja-JP',
  ko: 'ko-KR',
};

export const NarratorAudio: React.FC<NarratorAudioProps> = ({
  text,
  sceneTitle,
  storyLanguage
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [rate, setRate] = useState(1);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  // Cleanup on unmount or when text changes
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [text]);

  if (!isSupported) {
    return null;
  }

  const handleTogglePlay = () => {
    if (!('speechSynthesis' in window)) return;

    if (isPlaying && !isPaused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      return;
    }

    if (isPlaying && isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      return;
    }

    // Start fresh narration
    window.speechSynthesis.cancel();

    const fullNarration = sceneTitle
      ? `${sceneTitle}. ${text}`
      : text;

    const utterance = new SpeechSynthesisUtterance(fullNarration);
    utteranceRef.current = utterance;

    const targetLang = LANG_VOICE_MAP[storyLanguage] || 'en-US';
    utterance.lang = targetLang;
    utterance.rate = rate;
    utterance.pitch = 1.0;

    // Pick appropriate system voice if available
    const voices = window.speechSynthesis.getVoices();
    const matchingVoice = voices.find(v => v.lang.startsWith(targetLang.split('-')[0]));
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utterance.onerror = (e) => {
      if (e.error !== 'canceled' && e.error !== 'interrupted') {
        console.warn('Speech synthesis notice:', e.error);
      }
      setIsPlaying(false);
      setIsPaused(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const handleStop = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setIsPaused(false);
  };

  const cycleSpeed = () => {
    const nextRate = rate === 1 ? 1.25 : rate === 1.25 ? 0.9 : 1;
    setRate(nextRate);
    if (isPlaying) {
      handleStop();
    }
  };

  return (
    <div className="flex items-center gap-1.5 p-1 bg-dark-elevated/70 border border-dark-border/80 rounded-xl backdrop-blur-sm text-xs">
      <button
        onClick={handleTogglePlay}
        className={`px-2.5 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-all ${
          isPlaying && !isPaused
            ? 'bg-brand-primary text-white shadow-glow-sm animate-pulse'
            : 'bg-dark-surface hover:bg-dark-surface/80 text-dark-text border border-dark-border/60'
        }`}
        title={isPlaying && !isPaused ? 'Pause Narration' : 'Read Aloud'}
        aria-label="Narrator Speech"
      >
        {isPlaying && !isPaused ? (
          <>
            <Pause className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Playing</span>
          </>
        ) : (
          <>
            <Play className="w-3.5 h-3.5 text-brand-primary fill-brand-primary" />
            <span className="hidden sm:inline">Listen</span>
          </>
        )}
      </button>

      {isPlaying && (
        <>
          <button
            onClick={handleStop}
            className="p-1.5 rounded-lg text-dark-muted hover:text-red-400 hover:bg-dark-surface"
            title="Stop Narration"
            aria-label="Stop Narration"
          >
            <VolumeX className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={cycleSpeed}
            className="px-1.5 py-0.5 rounded text-[10px] font-mono text-dark-muted hover:text-white bg-dark-surface"
            title="Speech Speed"
          >
            {rate}x
          </button>

          <div className="flex items-center gap-0.5 px-1">
            <span className="w-0.5 h-2 bg-brand-primary rounded-full animate-bounce" />
            <span className="w-0.5 h-3.5 bg-brand-accent rounded-full animate-bounce [animation-delay:150ms]" />
            <span className="w-0.5 h-2.5 bg-brand-glow rounded-full animate-bounce [animation-delay:300ms]" />
          </div>
        </>
      )}

      {!isPlaying && (
        <span className="text-[10px] text-dark-muted px-1 hidden md:inline flex items-center gap-1">
          <Volume2 className="w-3 h-3 inline text-dark-muted" /> AI Audio
        </span>
      )}
    </div>
  );
};
