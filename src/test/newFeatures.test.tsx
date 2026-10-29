import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { evaluateD20Roll, FateDiceRoller } from '../components/story/FateDiceRoller';
import { NarratorAudio } from '../components/story/NarratorAudio';
import { AtmosphereSoundscape } from '../components/story/AtmosphereSoundscape';
import { completeHeroProfile, parseHeroPrompt } from '../features/story/naturalPromptParser';

describe('BranchVerse New Interactive Features & Hero Defaults', () => {
  describe('Default Hero Name', () => {
    it('defaults the protagonist name to "Hari Khatri" in completeHeroProfile', () => {
      const hero = completeHeroProfile({});
      expect(hero.name).toBe('Hari Khatri');
    });

    it('preserves an explicitly chosen hero name', () => {
      const hero = completeHeroProfile({ name: 'Aria Silverblade' });
      expect(hero.name).toBe('Aria Silverblade');
    });

    it('extracts hero name from prompt when provided', () => {
      const result = parseHeroPrompt('Create Ren, an agile shadow assassin');
      expect(result.name).toBe('Ren');
    });
  });

  describe('D20 Fate & Skill Check Dice Roller', () => {
    it('calculates Critical Triumph on Natural 20', () => {
      const outcome = evaluateD20Roll('Hari Khatri', 35, 20);
      expect(outcome.natural).toBe(20);
      expect(outcome.bonus).toBe(3); // Math.floor(35 / 10)
      expect(outcome.total).toBe(23);
      expect(outcome.tier).toBe('nat20');
      expect(outcome.title).toContain('CRITICAL TRIUMPH');
      expect(outcome.narrativeDescription).toContain('Hari Khatri');
    });

    it('calculates Critical Complication on Natural 1', () => {
      const outcome = evaluateD20Roll('Hari Khatri', 20, 1);
      expect(outcome.natural).toBe(1);
      expect(outcome.tier).toBe('nat1');
      expect(outcome.title).toContain('CRITICAL COMPLICATION');
    });

    it('calculates Heroic Success when total >= 16', () => {
      const outcome = evaluateD20Roll('Hari Khatri', 40, 15);
      expect(outcome.natural).toBe(15);
      expect(outcome.bonus).toBe(4);
      expect(outcome.total).toBe(19);
      expect(outcome.tier).toBe('heroic');
    });

    it('calculates Hard-Fought Resolve when total between 9 and 15', () => {
      const outcome = evaluateD20Roll('Hari Khatri', 10, 10);
      expect(outcome.natural).toBe(10);
      expect(outcome.bonus).toBe(1);
      expect(outcome.total).toBe(11);
      expect(outcome.tier).toBe('grit');
    });

    it('calculates Perilous Resistance when total < 9', () => {
      const outcome = evaluateD20Roll('Hari Khatri', 10, 5);
      expect(outcome.total).toBe(6);
      expect(outcome.tier).toBe('complication');
    });

    it('renders FateDiceRoller button and opens modal with action button', () => {
      const applyMock = vi.fn();
      render(
        <FateDiceRoller
          heroName="Hari Khatri"
          powerLevel={35}
          onApplyToCustomAction={applyMock}
        />
      );

      const rollBtn = screen.getByRole('button', { name: /Roll D20 Fate/i });
      expect(rollBtn).toBeInTheDocument();

      fireEvent.click(rollBtn);
      expect(screen.getByText(/D20 Fate & Skill Check/i)).toBeInTheDocument();
      expect(screen.getByText(/Reroll Fate/i)).toBeInTheDocument();
    });
  });

  describe('Atmosphere Soundscape Generator', () => {
    it('renders ambient soundscape toggle button', () => {
      render(<AtmosphereSoundscape />);
      const soundBtn = screen.getByRole('button', { name: /Toggle Soundscape/i });
      expect(soundBtn).toBeInTheDocument();

      // Open soundscape menu
      fireEvent.click(soundBtn);
      expect(screen.getByText(/Cosmic Resonance/i)).toBeInTheDocument();
      expect(screen.getByText(/Ruins of Mist/i)).toBeInTheDocument();
      expect(screen.getByText(/Silence/i)).toBeInTheDocument();
    });
  });

  describe('Narrator Audio (Text-to-Speech)', () => {
    it('renders speech narration controls gracefully when speech synthesis is available', () => {
      // Mock window.speechSynthesis in jsdom
      Object.defineProperty(window, 'speechSynthesis', {
        value: {
          speak: vi.fn(),
          cancel: vi.fn(),
          pause: vi.fn(),
          resume: vi.fn(),
          getVoices: vi.fn().mockReturnValue([])
        },
        writable: true,
        configurable: true
      });

      render(
        <NarratorAudio
          text="The obsidian gates open slowly into the mist."
          sceneTitle="Awakening"
          storyLanguage="en"
        />
      );

      const playBtn = screen.getByRole('button', { name: /Narrator Speech/i });
      expect(playBtn).toBeInTheDocument();
      expect(screen.getByText(/Listen/i)).toBeInTheDocument();
    });
  });
});
