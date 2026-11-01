import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { parseStoryIdeaPrompt, completeHeroProfile } from '../features/story/naturalPromptParser';
import { CreateStoryWizardPage } from '../pages/CreateStoryWizardPage';
import { RoleplaySetupPage } from '../pages/RoleplaySetupPage';
import { BottomInteractionArea } from '../components/story/BottomInteractionArea';
import { storyRepository } from '../lib/storage/storyRepository';
import { createNewStory } from '../features/story/storyEngine';
import { I18nProvider } from '../i18n';

describe('Story Creation & Role-Play Platform Features', () => {
  describe('Mode 1: Natural Language Story Idea Parsing', () => {
    it('accurately parses a magical academy prompt into structured story setup', () => {
      const prompt = "I want to become a student in a magical academy where I slowly discover that I have forbidden powers.";
      const parsed = parseStoryIdeaPrompt(prompt);

      expect(parsed.genre).toBe('High Fantasy');
      expect(parsed.worldName).toContain('Academy');
      expect(parsed.tone).toBe('Anime Shonen');
      expect(parsed.heroName).toBe('Hari Khatri');
      expect(parsed.heroPersonality).toContain('Determined');
      expect(parsed.heroBackstory).toContain('forbidden powers');
      expect(parsed.mainObjective).toContain('grimoires');
    });

    it('accurately parses a cyberpunk corporate espionage prompt', () => {
      const prompt = "A neon-lit cyberpunk city where I play as an undercover netrunner hacking an evil megacorp.";
      const parsed = parseStoryIdeaPrompt(prompt);

      expect(parsed.genre).toBe('Cyberpunk');
      expect(parsed.tone).toBe('Cyberpunk Noir');
      expect(parsed.worldName).toContain('Neo');
      expect(parsed.heroName).toBe('Hari Khatri');
      expect(parsed.mainObjective).toContain('corporate');
    });

    it('accurately parses cosmic dread horror prompt', () => {
      const prompt = "A dark gothic town where strange eldritch cultists are summoning an ancient void god.";
      const parsed = parseStoryIdeaPrompt(prompt);

      expect(parsed.genre).toBe('Cosmic Horror');
      expect(parsed.tone).toBe('Dark & Gritty');
      expect(parsed.heroName).toBe('Hari Khatri');
    });
  });

  describe('Mode 1: CreateStoryWizardPage Multi-Step Progression', () => {
    it('navigates through steps 1 to 5 and triggers launch with structured params', () => {
      const onLaunchStory = vi.fn();
      const onBack = vi.fn();

      render(
        <I18nProvider>
          <CreateStoryWizardPage
            onBack={onBack}
            onLaunchStory={onLaunchStory}
          />
        </I18nProvider>
      );

      // Step 1: Concept & Idea
      expect(screen.getByText(/Describe Your Story Idea/i)).toBeInTheDocument();
      const descInput = screen.getByPlaceholderText(/I want to become a student in a magical academy/i);
      fireEvent.change(descInput, {
        target: { value: 'I want to become a student in a magical academy where I slowly discover that I have forbidden powers.' }
      });

      // Click "AI Suggest & Pre-fill Story"
      const aiConvertBtn = screen.getByText(/AI Suggest & Pre-fill Story/i);
      fireEvent.click(aiConvertBtn);

      // Advance through Step 2, 3, 4 to Step 5
      const nextStepBtn1 = screen.getByRole('button', { name: /Next Step/i });
      fireEvent.click(nextStepBtn1);

      // Step 2
      const nextStepBtn2 = screen.getByRole('button', { name: /Next Step/i });
      fireEvent.click(nextStepBtn2);

      // Step 3
      const nextStepBtn3 = screen.getByRole('button', { name: /Next Step/i });
      fireEvent.click(nextStepBtn3);

      // Step 4
      const nextStepBtn4 = screen.getByRole('button', { name: /Next Step/i });
      fireEvent.click(nextStepBtn4);

      // Step 5: Chronicle Preview & Launch
      expect(screen.getByText(/Story Preview & Confirmation/i)).toBeInTheDocument();
      const launchBtn = screen.getByRole('button', { name: /Begin Chronicle/i });
      fireEvent.click(launchBtn);

      expect(onLaunchStory).toHaveBeenCalledTimes(1);
      const callArgs = onLaunchStory.mock.calls[0][0];
      expect(callArgs.overrideHero.name).toBe('Hari Khatri');
      expect(callArgs.settings.mode).toBe('story');
      expect(callArgs.settings.narrativeLength).toBe('balanced');
    });
  });

  describe('Mode 2: RoleplaySetupPage Living World Simulator', () => {
    it('renders curated scenarios and triggers roleplay launch with correct mode', () => {
      const onLaunchRoleplay = vi.fn();
      const onBack = vi.fn();

      render(
        <I18nProvider>
          <RoleplaySetupPage
            onBack={onBack}
            onLaunchRoleplay={onLaunchRoleplay}
          />
        </I18nProvider>
      );

      // Scenario tab is default
      expect(screen.getByText('Choose Your Starting Scenario')).toBeInTheDocument();
      expect(screen.getByText('The Forbidden Arcana')).toBeInTheDocument();
      expect(screen.getByText('Neon Syndicate Infiltration')).toBeInTheDocument();

      // Launch button
      const launchBtn = screen.getByRole('button', { name: /Begin Role-Play/i });
      fireEvent.click(launchBtn);

      expect(onLaunchRoleplay).toHaveBeenCalledTimes(1);
      const args = onLaunchRoleplay.mock.calls[0][0];
      expect(args.settings.mode).toBe('roleplay');
      expect(args.overrideHero.name).toBe('Hari Khatri');
      expect(args.overrideHero.skills.length).toBeGreaterThan(0);
    });
  });

  describe('BottomInteractionArea RPG Controls', () => {
    it('supports switching between Choices, Action, and Speak tabs', () => {
      const onSelectChoice = vi.fn();
      const onSubmitAction = vi.fn();

      const mockChoices = [
        { choiceId: 'c1', text: 'Investigate the glowing rune', riskLevel: 'safe' as const },
        { choiceId: 'c2', text: 'Charge the enemy vanguard', riskLevel: 'perilous' as const }
      ];

      render(
        <I18nProvider>
          <BottomInteractionArea
            choices={mockChoices}
            onSelectChoice={onSelectChoice}
            onSubmitAction={onSubmitAction}
            isLoading={false}
            knownNpcs={['Master Balthazar', 'Elena']}
          />
        </I18nProvider>
      );

      // Choices tab should be active by default
      expect(screen.getByText('Investigate the glowing rune')).toBeInTheDocument();
      fireEvent.click(screen.getByText('Investigate the glowing rune'));
      expect(onSelectChoice).toHaveBeenCalledWith('c1');

      // Switch to Action tab
      const actionTabBtn = screen.getByRole('button', { name: /Action/i });
      fireEvent.click(actionTabBtn);

      const actionInput = screen.getByPlaceholderText(/What will you do\?/i);
      fireEvent.change(actionInput, { target: { value: 'I climb the cathedral tower to scout ahead' } });
      const submitActionBtn = screen.getByLabelText('Submit action');
      fireEvent.click(submitActionBtn);

      expect(onSubmitAction).toHaveBeenCalledWith(
        'I climb the cathedral tower to scout ahead',
        'action'
      );

      // Switch to Speak tab
      const speakTabBtn = screen.getByRole('button', { name: /Speak/i });
      fireEvent.click(speakTabBtn);

      const dialogueInput = screen.getByPlaceholderText('What do you say?');
      fireEvent.change(dialogueInput, { target: { value: 'Who authorized this lockdown?' } });
      const speakBtn = screen.getByLabelText('Speak dialogue');
      fireEvent.click(speakBtn);

      expect(onSubmitAction).toHaveBeenCalledWith(
        'Who authorized this lockdown?',
        'dialogue',
        'Master Balthazar'
      );
    });

    it('shows elapsed timer and cancel generation button during loading', () => {
      const onCancelGeneration = vi.fn();

      render(
        <I18nProvider>
          <BottomInteractionArea
            choices={[]}
            onSelectChoice={vi.fn()}
            onSubmitAction={vi.fn()}
            onCancelGeneration={onCancelGeneration}
            isLoading={true}
          />
        </I18nProvider>
      );

      expect(screen.getByText(/Gemini AI is weaving next chapter/i)).toBeInTheDocument();
      const cancelBtn = screen.getByRole('button', { name: /Cancel/i });
      fireEvent.click(cancelBtn);
      expect(onCancelGeneration).toHaveBeenCalledTimes(1);
    });
  });

  describe('Story Branch Duplication in Repository', () => {
    it('creates an independent branch copy of a chronicle', async () => {
      const hero = completeHeroProfile({ name: 'Hari Khatri' });
      const original = createNewStory({
        title: 'Chronicle of Aethelgard',
        hero,
        genres: ['High Fantasy'],
        worldId: 'aethelgard',
        worldName: 'Aethelgard High Realm',
        settings: {
          tone: 'Epic Fantasy',
          pacing: 'Balanced Narrative',
          difficulty: 'Adventurer (Standard)',
          storyLanguage: 'en'
        }
      });

      await storyRepository.saveStory(original);

      const duplicated = await storyRepository.duplicateStory(original.id);
      expect(duplicated).not.toBeNull();
      expect(duplicated?.id).not.toBe(original.id);
      expect(duplicated?.title).toBe('Chronicle of Aethelgard (Branch)');
      expect(duplicated?.hero.name).toBe('Hari Khatri');
      expect(duplicated?.turns.length).toBe(1);

      // Clean up
      await storyRepository.deleteStory(original.id);
      if (duplicated) {
        await storyRepository.deleteStory(duplicated.id);
      }
    });
  });
});
