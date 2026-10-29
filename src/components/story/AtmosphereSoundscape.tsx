import React, { useState, useEffect, useRef } from 'react';
import { Music, VolumeX, Sparkles, Wind } from 'lucide-react';

type SoundscapeMode = 'off' | 'cosmic' | 'winds';

export const AtmosphereSoundscape: React.FC = () => {
  const [mode, setMode] = useState<SoundscapeMode>('off');
  const [isOpen, setIsOpen] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);
  const gainNodeRef = useRef<GainNode | null>(null);

  const cleanupAudio = () => {
    oscillatorsRef.current.forEach(osc => {
      try {
        osc.stop();
        osc.disconnect();
      } catch {
        // already stopped
      }
    });
    oscillatorsRef.current = [];

    if (gainNodeRef.current) {
      try {
        gainNodeRef.current.disconnect();
      } catch {
        // already disconnected
      }
      gainNodeRef.current = null;
    }

    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      try {
        audioCtxRef.current.close();
      } catch {
        // ignore
      }
      audioCtxRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      cleanupAudio();
    };
  }, []);

  const startSoundscape = async (newMode: SoundscapeMode) => {
    cleanupAudio();

    if (newMode === 'off') {
      setMode('off');
      return;
    }

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;

      const ctx = new AudioContextClass();
      audioCtxRef.current = ctx;

      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.04, ctx.currentTime);
      masterGain.connect(ctx.destination);
      gainNodeRef.current = masterGain;

      if (newMode === 'cosmic') {
        // Gentle cosmic drone (binaural 108Hz and 112Hz + 216Hz overtone)
        const frequencies = [108, 112, 216];
        const oscs: OscillatorNode[] = [];

        frequencies.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          osc.type = idx === 0 ? 'sine' : 'triangle';
          osc.frequency.setValueAtTime(freq, ctx.currentTime);

          const oscGain = ctx.createGain();
          oscGain.gain.setValueAtTime(0.3 / (idx + 1), ctx.currentTime);
          osc.connect(oscGain);
          oscGain.connect(masterGain);

          osc.start();
          oscs.push(osc);
        });

        oscillatorsRef.current = oscs;
      } else if (newMode === 'winds') {
        // Atmospheric wind drone using low-frequency modulation
        const baseOsc = ctx.createOscillator();
        baseOsc.type = 'sine';
        baseOsc.frequency.setValueAtTime(65, ctx.currentTime);

        const modOsc = ctx.createOscillator();
        modOsc.type = 'sine';
        modOsc.frequency.setValueAtTime(0.2, ctx.currentTime); // slow wind pulse

        const modGain = ctx.createGain();
        modGain.gain.setValueAtTime(20, ctx.currentTime);

        modOsc.connect(modGain);
        modGain.connect(baseOsc.frequency);

        baseOsc.connect(masterGain);

        baseOsc.start();
        modOsc.start();
        oscillatorsRef.current = [baseOsc, modOsc];
      }

      setMode(newMode);
    } catch (err) {
      console.warn('Atmospheric soundscape unavailable:', err);
      setMode('off');
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 rounded-xl border transition-all active:scale-95 flex items-center gap-1.5 text-xs font-semibold ${
          mode !== 'off'
            ? 'bg-indigo-950/80 border-indigo-500/50 text-indigo-300 shadow-glow-sm'
            : 'bg-dark-elevated border-dark-border text-dark-muted hover:text-dark-text'
        }`}
        title="Ambient Soundscape"
        aria-label="Toggle Soundscape"
      >
        {mode === 'off' ? (
          <Music className="w-4 h-4" />
        ) : (
          <>
            <Sparkles className="w-4 h-4 text-indigo-400 animate-spin" style={{ animationDuration: '6s' }} />
            <span className="hidden sm:inline text-[10px] text-indigo-300 capitalize">{mode}</span>
          </>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-dark-surface/95 backdrop-blur-md border border-dark-border rounded-2xl p-2 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2">
          <div className="text-[10px] font-semibold text-dark-muted px-2 py-1 uppercase tracking-wider">
            Ambient Soundscape
          </div>

          <div className="space-y-1">
            <button
              onClick={() => {
                startSoundscape('cosmic');
                setIsOpen(false);
              }}
              className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs flex items-center gap-2 transition-colors ${
                mode === 'cosmic'
                  ? 'bg-brand-primary text-white font-medium'
                  : 'text-dark-text hover:bg-dark-elevated'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Cosmic Resonance</span>
            </button>

            <button
              onClick={() => {
                startSoundscape('winds');
                setIsOpen(false);
              }}
              className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs flex items-center gap-2 transition-colors ${
                mode === 'winds'
                  ? 'bg-brand-primary text-white font-medium'
                  : 'text-dark-text hover:bg-dark-elevated'
              }`}
            >
              <Wind className="w-3.5 h-3.5 text-teal-400" />
              <span>Ruins of Mist</span>
            </button>

            <button
              onClick={() => {
                startSoundscape('off');
                setIsOpen(false);
              }}
              className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs flex items-center gap-2 transition-colors ${
                mode === 'off'
                  ? 'bg-dark-elevated text-white font-medium'
                  : 'text-dark-muted hover:bg-dark-elevated hover:text-white'
              }`}
            >
              <VolumeX className="w-3.5 h-3.5 text-red-400" />
              <span>Silence</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
