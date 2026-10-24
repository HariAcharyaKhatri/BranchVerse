import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChoiceList } from '../components/story/ChoiceList';
import { CustomActionInput } from '../components/story/CustomActionInput';
import { SaveIndicator } from '../components/story/SaveIndicator';
import { CharacterSheetDrawer } from '../components/story/CharacterSheetDrawer';
import { HeroWizard } from '../components/character/HeroWizard';
import { BottomNav } from '../components/navigation/BottomNav';
import { completeHeroProfile } from '../features/story/naturalPromptParser';

describe('BranchVerse UI Components & Mobile Experience', () => {

  describe('ChoiceList Component', () => {
    it('renders choices with text and risk badges, and triggers selection', () => {
      const onSelect = vi.fn();
      const choices = [
        {
          choiceId: 'c1',
          text: 'Charge the void beasts head-on',
          riskLevel: 'perilous' as const,
          consequenceHint: 'High danger of injury'
        },
        {
          choiceId: 'c2',
          text: 'Set up an arcane defensive barrier',
          riskLevel: 'safe' as const,
          consequenceHint: 'Conserves health at stamina cost'
        }
      ];

      render(<ChoiceList choices={choices} onSelectChoice={onSelect} />);

      expect(screen.getByText('Charge the void beasts head-on')).toBeInTheDocument();
      expect(screen.getByText('Set up an arcane defensive barrier')).toBeInTheDocument();
      expect(screen.getByText('Perilous')).toBeInTheDocument();
      expect(screen.getByText('Safe')).toBeInTheDocument();

      fireEvent.click(screen.getByText('Charge the void beasts head-on'));
      expect(onSelect).toHaveBeenCalledWith('c1');
    });
  });

  describe('CustomActionInput Component', () => {
    it('accepts custom user typing and submits action', () => {
      const onSubmit = vi.fn();
      render(<CustomActionInput onSubmitAction={onSubmit} />);

      const input = screen.getByPlaceholderText(/What will you do\?/i);
      fireEvent.change(input, {
        target: { value: 'I distract the guards, rescue the villagers, and secretly search for evidence.' }
      });

      const submitButton = screen.getByLabelText('Send custom action');
      fireEvent.click(submitButton);

      expect(onSubmit).toHaveBeenCalledWith('I distract the guards, rescue the villagers, and secretly search for evidence.');
    });

    it('toggles idea suggestions on mobile tap', () => {
      render(<CustomActionInput onSubmitAction={vi.fn()} />);

      const toggleBtn = screen.getByText('Inspire Me');
      fireEvent.click(toggleBtn);

      expect(screen.getByText(/I distract the guards/i)).toBeInTheDocument();
    });
  });

  describe('SaveIndicator Component', () => {
    it('renders correct status indicator states', () => {
      const { rerender } = render(<SaveIndicator status="saving" />);
      expect(screen.getByText('Saving...')).toBeInTheDocument();

      rerender(<SaveIndicator status="saved" lastSavedAt={Date.now()} />);
      expect(screen.getByText('Saved')).toBeInTheDocument();

      rerender(<SaveIndicator status="error" />);
      expect(screen.getByText('Save failed')).toBeInTheDocument();
    });
  });

  describe('CharacterSheetDrawer Component', () => {
    it('displays hero statistics, HP, and inventory when open', () => {
      const hero = completeHeroProfile({ name: 'Hari' });
      const state = {
        health: 85,
        maxHealth: 100,
        stamina: 70,
        powerLevel: 40,
        inventory: [
          { id: 'blade_1', name: 'Moonlight Katana', quantity: 1, description: 'Sharp curved steel', category: 'weapon' as const },
          { id: 'potion_1', name: 'Healing Salve', quantity: 2, description: 'Restores HP', category: 'consumable' as const, effectDescription: '+30 HP' }
        ],
        activeQuests: [
          { id: 'q1', title: 'Defend Valen', giver: 'Captain Ronald', objective: 'Repel rift marauders', status: 'active' as const }
        ],
        worldFlags: {},
        npcTrust: { 'Ronald': 50 },
        statusEffects: ['Vigilant'],
        timelineStep: 1,
        currentLocation: 'Valen',
        isGameOver: false
      };

      render(
        <CharacterSheetDrawer
          isOpen={true}
          onClose={vi.fn()}
          hero={hero}
          state={state}
        />
      );

      expect(screen.getByText('Hari')).toBeInTheDocument();
      expect(screen.getByText('85 / 100')).toBeInTheDocument();

      // Switch to Inventory tab
      const itemsTab = screen.getByText('Items');
      fireEvent.click(itemsTab);

      expect(screen.getByText('Moonlight Katana')).toBeInTheDocument();
      expect(screen.getByText('Healing Salve')).toBeInTheDocument();
    });
  });

  describe('HeroWizard Component', () => {
    it('navigates through steps and validates name requirement', () => {
      const onComplete = vi.fn();
      render(<HeroWizard onComplete={onComplete} />);

      expect(screen.getByText('Identity & Roots')).toBeInTheDocument();

      // Attempting to continue without name shows validation notification
      const continueBtn = screen.getByText('Continue');
      fireEvent.click(continueBtn);
      expect(screen.getByText(/Please enter a hero name/i)).toBeInTheDocument();

      // Enter hero name
      const nameInput = screen.getByPlaceholderText(/e\.g\. Hari/i);
      fireEvent.change(nameInput, { target: { value: 'Hari' } });

      fireEvent.click(continueBtn);
      expect(screen.getByText('Powers & Arsenal')).toBeInTheDocument();

      // Step 2 -> Step 3
      fireEvent.click(screen.getByText('Continue'));
      expect(screen.getByText('Soul & Ambition')).toBeInTheDocument();

      // Final step -> onComplete
      fireEvent.click(screen.getByText('Choose Genre'));
      expect(onComplete).toHaveBeenCalled();
      expect(onComplete.mock.calls[0][0].name).toBe('Hari');
    });
  });

  describe('BottomNav Component', () => {
    it('renders all four navigation items in an equal-width 4-column layout', () => {
      const onNavigate = vi.fn();
      const { container } = render(
        <BottomNav currentPath="#/" onNavigate={onNavigate} storyCount={3} />
      );

      // Verify grid-cols-4 layout
      const grid = container.querySelector('.grid-cols-4');
      expect(grid).toBeInTheDocument();

      // All 4 labels present
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Library')).toBeInTheDocument();
      expect(screen.getByText('Create')).toBeInTheDocument();
      expect(screen.getByText('Settings')).toBeInTheDocument();

      // Verify Create button does NOT have detached floating offset (-top-3)
      const createButton = screen.getByLabelText('Create');
      expect(createButton.className).not.toContain('-top-3');

      // Verify notification badge
      expect(screen.getByText('3')).toBeInTheDocument();

      // Clicking Create calls onNavigate('#/create-hero')
      fireEvent.click(createButton);
      expect(onNavigate).toHaveBeenCalledWith('#/create-hero');
    });

    it('hides completely in reader mode', () => {
      const { container } = render(
        <BottomNav currentPath="#/reader/story_123" onNavigate={vi.fn()} />
      );
      expect(container.firstChild).toBeNull();
    });

    it('maintains consistent structure across mobile widths (320px, 375px, 390px, 430px)', () => {
      const widths = [320, 375, 390, 430];
      for (const width of widths) {
        window.innerWidth = width;
        const { container } = render(
          <div style={{ width: `${width}px` }}>
            <BottomNav currentPath="#/create-hero" onNavigate={vi.fn()} />
          </div>
        );

        const grid = container.querySelector('.grid-cols-4');
        expect(grid).toBeInTheDocument();
        const buttons = grid?.querySelectorAll('button');
        expect(buttons?.length).toBe(4);

        // Every button has an identical 32px (w-8 h-8) icon container
        buttons?.forEach((btn) => {
          const iconWrapper = btn.querySelector('.w-8.h-8');
          expect(iconWrapper).toBeInTheDocument();
          // Ensure no floating offsets or detached positioning
          expect(btn.className).not.toMatch(/-top-\d+/);
          expect(btn.className).not.toMatch(/translate-y/);
        });
      }
    });
  });
});
