import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { isProtagonistHariKhatri, getHariKhatriNarrativeDirective } from '../../server/narrativeGuidelines';
import { geminiService } from '../../server/geminiService';
import { CreateStoryWizardPage } from '../pages/CreateStoryWizardPage';
import { RoleplaySetupPage } from '../pages/RoleplaySetupPage';
import { HeroWizard } from '../components/character/HeroWizard';
import { AuthContext, AuthContextType } from '../contexts/AuthContext';
import { I18nProvider } from '../i18n';

describe('Part 1: Authenticated User Name Pre-fill & Character Creation', () => {
  const mockAuthUser = {
    uid: 'user_alexandra_99',
    displayName: 'Alexandra Stone',
    email: 'alexandra@example.com',
    photoURL: 'https://example.com/avatar.png',
    providerId: 'google.com'
  };

  const mockAuthContextValue: AuthContextType = {
    user: mockAuthUser,
    loading: false,
    isConfigured: true,
    isInitialized: true,
    initializationError: null,
    error: null,
    signInWithGoogle: vi.fn(),
    signInWithGoogleRedirect: vi.fn(),
    signOut: vi.fn(),
    clearError: vi.fn()
  };

  it('pre-fills CreateStoryWizardPage with logged-in user display name as default character name', () => {
    const onLaunchStory = vi.fn();

    render(
      <AuthContext.Provider value={mockAuthContextValue}>
        <I18nProvider>
          <CreateStoryWizardPage onBack={vi.fn()} onLaunchStory={onLaunchStory} />
        </I18nProvider>
      </AuthContext.Provider>
    );

    // Advance to Step 3 (Cast)
    const nextBtn = screen.getByRole('button', { name: /Next Step/i });
    fireEvent.click(nextBtn); // To Step 2
    fireEvent.click(nextBtn); // To Step 3

    const nameInput = screen.getByPlaceholderText('Alexandra Stone') as HTMLInputElement;
    expect(nameInput).toBeInTheDocument();
    expect(nameInput.value).toBe('Alexandra Stone');
  });

  it('allows the user to freely edit or replace the pre-filled character name', () => {
    const onLaunchStory = vi.fn();

    render(
      <AuthContext.Provider value={mockAuthContextValue}>
        <I18nProvider>
          <CreateStoryWizardPage onBack={vi.fn()} onLaunchStory={onLaunchStory} />
        </I18nProvider>
      </AuthContext.Provider>
    );

    // Advance to Step 3
    const nextBtn = screen.getByRole('button', { name: /Next Step/i });
    fireEvent.click(nextBtn);
    fireEvent.click(nextBtn);

    const nameInput = screen.getByPlaceholderText('Alexandra Stone') as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: 'Sylvia Vane' } });
    expect(nameInput.value).toBe('Sylvia Vane');

    // Advance to Step 5 and launch
    fireEvent.click(screen.getByRole('button', { name: /Next Step/i }));
    fireEvent.click(screen.getByRole('button', { name: /Next Step/i }));

    const launchBtn = screen.getByRole('button', { name: /Begin Chronicle/i });
    fireEvent.click(launchBtn);

    expect(onLaunchStory).toHaveBeenCalledTimes(1);
    const callArgs = onLaunchStory.mock.calls[0][0];
    expect(callArgs.overrideHero.name).toBe('Sylvia Vane');
    // Ensure private auth data (email, uid, photoURL) is NOT attached to hero
    expect(callArgs.overrideHero.email).toBeUndefined();
    expect(callArgs.overrideHero.uid).toBeUndefined();
  });

  it('pre-fills RoleplaySetupPage with logged-in user display name and preserves edits', () => {
    const onLaunchRoleplay = vi.fn();

    render(
      <AuthContext.Provider value={mockAuthContextValue}>
        <I18nProvider>
          <RoleplaySetupPage onBack={vi.fn()} onLaunchRoleplay={onLaunchRoleplay} />
        </I18nProvider>
      </AuthContext.Provider>
    );

    // Switch to Character Tab
    const charTab = screen.getByRole('button', { name: /2\. Character Identity/i });
    fireEvent.click(charTab);

    const nameInput = screen.getByPlaceholderText('Alexandra Stone') as HTMLInputElement;
    expect(nameInput.value).toBe('Alexandra Stone');

    // User edits name
    fireEvent.change(nameInput, { target: { value: 'Cipher Runner Zero' } });
    expect(nameInput.value).toBe('Cipher Runner Zero');

    // Launch roleplay
    const launchBtn = screen.getByRole('button', { name: /Begin Role-Play/i });
    fireEvent.click(launchBtn);

    expect(onLaunchRoleplay).toHaveBeenCalledTimes(1);
    const args = onLaunchRoleplay.mock.calls[0][0];
    expect(args.overrideHero.name).toBe('Cipher Runner Zero');
  });

  it('falls back to default character name when user has no display name or is guest', () => {
    const guestContextValue: AuthContextType = {
      ...mockAuthContextValue,
      user: null
    };

    render(
      <AuthContext.Provider value={guestContextValue}>
        <I18nProvider>
          <HeroWizard onComplete={vi.fn()} />
        </I18nProvider>
      </AuthContext.Provider>
    );

    const nameInput = screen.getByPlaceholderText('Hari Khatri') as HTMLInputElement;
    expect(nameInput.value).toBe('Hari Khatri');
  });
});

describe('Part 2: Hari Khatri Adaptive Narrative System Guidelines', () => {
  describe('Protagonist Name Safeguard Detection', () => {
    it('detects when the protagonist is named "Hari Khatri" across case variations', () => {
      expect(isProtagonistHariKhatri('Hari Khatri')).toBe(true);
      expect(isProtagonistHariKhatri('hari khatri')).toBe(true);
      expect(isProtagonistHariKhatri('HARI KHATRI')).toBe(true);
      expect(isProtagonistHariKhatri('  Hari   Khatri  ')).toBe(true);
      expect(isProtagonistHariKhatri('Sir Hari Khatri')).toBe(true);
      expect(isProtagonistHariKhatri('Hari Khatri Jr.')).toBe(true);
    });

    it('returns false when protagonist is any other character name', () => {
      expect(isProtagonistHariKhatri('Alexandra Stone')).toBe(false);
      expect(isProtagonistHariKhatri('Elena')).toBe(false);
      expect(isProtagonistHariKhatri('Master Balthazar')).toBe(false);
      expect(isProtagonistHariKhatri('Hari')).toBe(false);
      expect(isProtagonistHariKhatri('')).toBe(false);
      expect(isProtagonistHariKhatri(undefined)).toBe(false);
    });

    it('emits identity safeguard directive when protagonist is named Hari Khatri', () => {
      const directive = getHariKhatriNarrativeDirective('Hari Khatri');
      expect(directive).toContain('[PROTAGONIST IDENTITY SAFEGUARD]');
      expect(directive).toContain('Do NOT introduce a second character named Hari Khatri');
      expect(directive).not.toContain('[ADAPTIVE WORLD CONNECTION - HARI KHATRI]');
    });

    it('emits rich adaptive world connection directive when protagonist has another name', () => {
      const directive = getHariKhatriNarrativeDirective('Alexandra Stone');
      expect(directive).toContain('[ADAPTIVE WORLD CONNECTION - HARI KHATRI]');
      expect(directive).toContain('Alexandra Stone');
      expect(directive).toContain('shrewd, reputable merchant');
      expect(directive).toContain('talented senior student');
      expect(directive).toContain('NARRATIVE RELEVANCE RULE');
      expect(directive).toContain('ABSOLUTE PLAYER AGENCY & OPTIONAL ASSISTANCE');
      expect(directive).toContain('DYNAMIC PLAYER CHOICES (NO RESERVED SLOTS)');
      expect(directive).toContain('If you ever need help again, you know how to find me.');
      expect(directive).not.toContain('[PROTAGONIST IDENTITY SAFEGUARD]');
    });
  });

  describe('Server-Side Narrative Prompt Construction', () => {
    let originalClient: any;

    beforeEach(() => {
      originalClient = (geminiService as any).client;
      vi.spyOn(geminiService, 'isConfigured').mockReturnValue(true);
      (geminiService as any).client = {
        models: { generateContent: vi.fn() },
        interactions: { create: vi.fn() }
      };
    });

    afterEach(() => {
      (geminiService as any).client = originalClient;
      vi.restoreAllMocks();
    });

    it('injects adaptive Hari Khatri guidance into initial story prompt', async () => {
      let capturedPrompt = '';
      const spyCall = vi.spyOn(geminiService as any, 'callWithRetry').mockImplementation(
        async (_model: string, prompt: string) => {
          capturedPrompt = prompt;
          return {
            text: JSON.stringify({
              sceneTitle: 'The Grand Bazaar of Solis',
              narrativeText: 'You walk through the bustling market.',
              proposedChoices: [
                { choiceId: 'c1', text: 'Inspect the silk wares', riskLevel: 'safe', requiredStamina: 4 }
              ]
            }),
            modelUsed: 'gemini-3.8-flash'
          };
        }
      );

      await geminiService.generateInitialStory({
        hero: {
          name: 'Marcus Vance',
          race: 'Human',
          origin: 'Trade Haven',
          backstory: 'An ambitious apprentice merchant.',
          personality: ['Astute'],
          skills: ['Negotiation']
        },
        genres: ['Historical Fiction'],
        worldName: 'Solis Trading Port',
        tone: 'Balanced Narrative',
        pacing: 'Balanced Narrative',
        difficulty: 'Adventurer (Standard)',
        storyLanguage: 'en',
        narrativeLength: 'balanced'
      });

      expect(capturedPrompt).toContain('[ADAPTIVE WORLD CONNECTION - HARI KHATRI]');
      expect(capturedPrompt).toContain('Marcus Vance');
      expect(capturedPrompt).toContain('shrewd, reputable merchant');
      expect(capturedPrompt).toContain('Do NOT reserve a choice slot for Hari Khatri');

      spyCall.mockRestore();
    });

    it('injects identity safeguard when protagonist is named Hari Khatri', async () => {
      let capturedPrompt = '';
      const spyCall = vi.spyOn(geminiService as any, 'callWithRetry').mockImplementation(
        async (_model: string, prompt: string) => {
          capturedPrompt = prompt;
          return {
            text: JSON.stringify({
              sceneTitle: 'The Opening Arena',
              narrativeText: 'You stand in the center of the ring.',
              proposedChoices: [
                { choiceId: 'c1', text: 'Draw your training blade', riskLevel: 'safe', requiredStamina: 5 }
              ]
            }),
            modelUsed: 'gemini-3.8-flash'
          };
        }
      );

      await geminiService.generateInitialStory({
        hero: {
          name: 'Hari Khatri',
          race: 'Human',
          origin: 'Citadel',
          backstory: 'A warrior apprentice.',
          personality: ['Disciplined'],
          skills: ['Swordsmanship']
        },
        genres: ['High Fantasy'],
        worldName: 'Imperial Arena',
        tone: 'Epic Fantasy',
        pacing: 'Balanced Narrative',
        difficulty: 'Adventurer (Standard)',
        storyLanguage: 'en'
      });

      expect(capturedPrompt).toContain('[PROTAGONIST IDENTITY SAFEGUARD]');
      expect(capturedPrompt).toContain('Do NOT introduce a second character named Hari Khatri');
      expect(capturedPrompt).not.toContain('[ADAPTIVE WORLD CONNECTION - HARI KHATRI]');

      spyCall.mockRestore();
    });

    it('injects adaptive guidance into turn prompts and passes custom player action without reserving choices', async () => {
      let capturedPrompt = '';
      const spyCall = vi.spyOn(geminiService as any, 'callWithRetry').mockImplementation(
        async (_model: string, prompt: string) => {
          capturedPrompt = prompt;
          return {
            text: JSON.stringify({
              sceneTitle: 'Encounter with the Archmage',
              narrativeText: 'The ancient wizard studies you with glowing eyes.',
              proposedChoices: [
                { choiceId: 'c1', text: 'Request passage through the sealed gate', riskLevel: 'safe', requiredStamina: 6 }
              ]
            }),
            modelUsed: 'gemini-3.1-flash-lite'
          };
        }
      );

      await geminiService.generateStoryTurn({
        storyId: 'story_777',
        chapterNumber: 3,
        hero: {
          name: 'Valeria',
          powerLevel: 45,
          stamina: 75,
          inventory: ['Amulet of Dawn']
        },
        currentLocation: 'The Sunken Spire',
        genre: 'High Fantasy',
        tone: 'Mystery & Suspense',
        storyLanguage: 'en',
        narrativeLength: 'balanced',
        activeQuests: [],
        recentTurns: [
          {
            sceneTitle: 'The Submerged Chamber',
            narrativeSummary: 'Valeria deciphered the tidal glyphs and entered.',
            actionTaken: 'Decipher glyphs'
          }
        ],
        playerAction: {
          type: 'action',
          customActionText: 'I search for someone who knows how to open the obsidian seal.'
        }
      });

      expect(capturedPrompt).toContain('[ADAPTIVE WORLD CONNECTION - HARI KHATRI]');
      expect(capturedPrompt).toContain('Valeria');
      expect(capturedPrompt).toContain('Do NOT reserve a choice slot for Hari Khatri');
      expect(capturedPrompt).toContain('I search for someone who knows how to open the obsidian seal.');

      spyCall.mockRestore();
    });
  });
});
