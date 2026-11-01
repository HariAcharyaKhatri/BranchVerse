import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CharacterIntroductionCard } from '../components/story/CharacterIntroductionCard';
import { CharacterSheetDrawer } from '../components/story/CharacterSheetDrawer';
import { BottomInteractionArea } from '../components/story/BottomInteractionArea';
import { NarrativeReader } from '../components/story/NarrativeReader';
import { I18nProvider } from '../i18n';
import { StoryDocument } from '../types/story';
import { HeroProfile } from '../types/character';

function createMockHero(overrides?: Partial<HeroProfile>): HeroProfile {
  return {
    id: 'hero_test_1',
    name: 'Kaelen Shadowmend',
    age: '24',
    gender: 'Male',
    race: 'Moon Elf',
    origin: 'Aethelgard High Guild',
    backstory: 'Exiled archivist searching for the shattered Leyline Shards before the Eclipse.',
    personality: ['Perceptive', 'Guarded'],
    skills: ['Runic Inscription', 'Shadow Stepping'],
    powers: ['Astral Vision', 'Moonlight Veil'],
    weapons: ['Silver Stiletto'],
    weaknesses: ['Vulnerable to Iron'],
    powerLevel: 35,
    goals: ['Recover the Leyline Core'],
    motivations: ['Clear his family name'],
    fears: ['Total blindness'],
    secrets: ['Stole the Forbidden Codex'],
    alignment: 'Chaotic Good',
    relationships: [],
    createdAt: Date.now(),
    appearance: {
      hair: 'Silver',
      eyes: 'Violet',
      clothing: 'Shadowed traveling cloak',
      distinguishingFeatures: 'Crescent scar over left temple'
    },
    ...overrides
  };
}

function createMockStory(overrides?: Partial<StoryDocument>): StoryDocument {
  const hero = createMockHero();
  return {
    id: 'story_live_test',
    title: 'Echoes of the Moon',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    hero,
    genres: ['High Fantasy'],
    worldId: 'aethelgard',
    worldName: 'Aethelgard',
    settings: {
      tone: 'Epic Fantasy',
      pacing: 'Balanced Narrative',
      difficulty: 'Adventurer (Standard)',
      mainObjective: 'Infiltrate the Obsidian Keep before midnight.'
    },
    state: {
      stamina: 85,
      powerLevel: 35,
      currentLocation: 'Valen’s Crossing',
      worldFlags: {
        kingdom: 'Aethelgard Kingdom',
        region: 'Western Marches',
        wealth: '120 Silver Shillings',
        rank: 'Master Inscriber'
      },
      statusEffects: ['Awakened Senses', 'Well-Provisioned'],
      inventory: [
        { id: 'item_1', name: 'Astral Compass', quantity: 1, description: 'Points toward active magical rifts.', category: 'artifact' },
        { id: 'item_2', name: 'Elder-Leaf Salve', quantity: 2, description: 'Restores stamina when applied.', category: 'consumable', effectDescription: '+35 Stamina' }
      ],
      activeQuests: [
        { id: 'q1', title: 'Defend Valen’s Crossing', giver: 'Captain Ronald', objective: 'Repel the void-rift marauders.', status: 'active' }
      ],
      npcTrust: {
        'Captain Ronald': 45,
        'Hari Khatri': 60
      },
      timelineStep: 1,
      isGameOver: false
    },
    turns: [
      {
        turnId: 'turn_1',
        chapterNumber: 1,
        sceneTitle: 'Arrival at Valen’s Crossing',
        narrativeText: 'Midnight arrives not with silence, but with the roar of violet thunder across the craggy borderlands. You stand near the edge of the gorge, rain drumming heavily against your traveling cloak. Below, the timber homes of Valen’s Crossing glow with eerie embers.',
        dialogues: [
          { speaker: 'Captain Ronald', text: 'Steady your blade, traveler! The beasts are circling the granary!', emotion: 'terrified' }
        ],
        choices: [
          { choiceId: 'c1', text: 'Draw your Silver Stiletto and charge the beasts', riskLevel: 'moderate', requiredStamina: 10 },
          { choiceId: 'c2', text: 'Activate Astral Vision to locate the alpha pack leader', riskLevel: 'safe', requiredStamina: 6 },
          { choiceId: 'c3', text: 'Signal the sentry tower with your lantern', riskLevel: 'safe', requiredStamina: 4 }
        ],
        timestamp: Date.now()
      }
    ],
    status: 'active',
    version: 1,
    generationMode: 'ai',
    storyLanguage: 'en',
    ...overrides
  };
}

describe('Character Introduction & Live Dynamic Status Panel', () => {
  describe('PART 1 & 4: Character Introduction at the Start of Chronicle', () => {
    it('renders concise and immersive character dossier from actual story state in a Fantasy world', () => {
      const hero = createMockHero();
      const story = createMockStory();

      render(
        <CharacterIntroductionCard
          hero={hero}
          state={story.state}
          worldName={story.worldName}
          genres={story.genres}
          mainObjective={story.settings.mainObjective}
        />
      );

      // Verify character identity
      expect(screen.getByText('Kaelen Shadowmend')).toBeInTheDocument();
      expect(screen.getByText('(Moon Elf)')).toBeInTheDocument();
      expect(screen.getByText('Aethelgard High Guild')).toBeInTheDocument();

      // Verify location matches actual authoritative state
      expect(screen.getByText('Valen’s Crossing')).toBeInTheDocument();
      expect(screen.getByText(/Aethelgard Kingdom/i)).toBeInTheDocument();

      // Verify abilities and skills from hero
      expect(screen.getByText(/Astral Vision/i)).toBeInTheDocument();
      expect(screen.getByText(/Shadow Stepping/i)).toBeInTheDocument();
      expect(screen.getByText(/Silver Stiletto/i)).toBeInTheDocument();

      // Verify background and primary objective
      expect(screen.getByText(/Exiled archivist searching for the shattered Leyline Shards/i)).toBeInTheDocument();
      expect(screen.getByText(/Infiltrate the Obsidian Keep before midnight/i)).toBeInTheDocument();

      // Verify collapse and re-expand toggle
      const toggleBtn = screen.getByLabelText(/Collapse character dossier/i);
      fireEvent.click(toggleBtn);
      expect(screen.queryByText(/Exiled archivist searching for the shattered Leyline Shards/i)).not.toBeInTheDocument();

      const expandBtn = screen.getByLabelText(/Expand character dossier/i);
      fireEvent.click(expandBtn);
      expect(screen.getByText(/Exiled archivist searching for the shattered Leyline Shards/i)).toBeInTheDocument();
    });

    it('adapts character introduction to a Business / Commercial genre without fantasy magic', () => {
      const businessHero = createMockHero({
        name: 'Julian Mercer',
        race: 'Human',
        origin: 'Mercer Capital Holdings',
        backstory: 'A venture trader seeking exclusive spice imports in the southern port.',
        skills: ['Negotiation', 'Supply Chain Strategy', 'Market Valuation'],
        powers: [], // No magical powers in realistic business story
        weapons: []
      });

      const businessStory = createMockStory({
        hero: businessHero,
        genres: ['Business Commerce', 'Historical Drama'],
        worldName: 'Solis Trading Port',
        state: {
          ...createMockStory().state,
          currentLocation: 'Solis Harbour Docks',
          worldFlags: {
            region: 'Southern Trade Federation',
            wealth: '15,000 Gold Sovereigns',
            rank: 'Senior Partner'
          }
        }
      });

      render(
        <CharacterIntroductionCard
          hero={businessHero}
          state={businessStory.state}
          worldName={businessStory.worldName}
          genres={businessStory.genres}
          mainObjective="Acquire the monopoly on the winter spice route."
        />
      );

      // Business dossier headers
      expect(screen.getByText('Julian Mercer')).toBeInTheDocument();
      expect(screen.getByText('Commercial Ledger & Persona')).toBeInTheDocument();
      expect(screen.getByText('Mercer Capital Holdings')).toBeInTheDocument();
      expect(screen.getByText('Solis Harbour Docks')).toBeInTheDocument();
      expect(screen.getByText('15,000 Gold Sovereigns')).toBeInTheDocument();
      expect(screen.getByText(/Supply Chain Strategy/i)).toBeInTheDocument();
      expect(screen.getByText(/Negotiation/i)).toBeInTheDocument();
    });

    it('adapts character introduction to a Realistic / Student setting without magic', () => {
      const studentHero = createMockHero({
        name: 'Maya Chen',
        race: 'Human',
        origin: 'Metropolitan Academy',
        backstory: 'A senior journalism student investigating financial fraud at the city council.',
        skills: ['Investigative Research', 'Photography', 'Cryptography'],
        powers: [],
        weapons: []
      });

      const studentStory = createMockStory({
        hero: studentHero,
        genres: ['Modern Mystery', 'Student Drama'],
        worldName: 'Crestview City',
        state: {
          ...createMockStory().state,
          currentLocation: 'Crestview Library Archives',
          worldFlags: {
            region: 'Downtown District',
            wealth: 'Modest Savings ($450)',
            rank: 'Chief Editor'
          }
        }
      });

      render(
        <CharacterIntroductionCard
          hero={studentHero}
          state={studentStory.state}
          worldName={studentStory.worldName}
          genres={studentStory.genres}
        />
      );

      expect(screen.getByText('Maya Chen')).toBeInTheDocument();
      expect(screen.getByText('Crestview Library Archives')).toBeInTheDocument();
      expect(screen.getByText(/Investigative Research/i)).toBeInTheDocument();
      expect(screen.getByText(/Photography/i)).toBeInTheDocument();
    });
  });

  describe('PART 2 & 3: Live Dynamic Character Status Panel', () => {
    it('displays comprehensive status from authoritative story state and reflects live updates', () => {
      const story = createMockStory();
      const onUseItem = vi.fn();

      const { rerender } = render(
        <CharacterSheetDrawer
          isOpen={true}
          onClose={vi.fn()}
          hero={story.hero}
          state={story.state}
          genres={story.genres}
          worldName={story.worldName}
          onUseItem={onUseItem}
        />
      );

      // Check initial location, wealth, and status
      expect(screen.getByText('Valen’s Crossing')).toBeInTheDocument();
      expect(screen.getByText('120 Silver Shillings')).toBeInTheDocument();
      expect(screen.getByText('Master Inscriber')).toBeInTheDocument();
      expect(screen.getAllByText('Level 35').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/85 \/ 100/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText(/Awakened Senses/i)).toBeInTheDocument();

      // TEST LIVE UPDATE 1: Character changes cities (Travels to Grand Citadel)
      const updatedStateCity = {
        ...story.state,
        currentLocation: 'The Grand Citadel of Lumina',
        worldFlags: {
          ...story.state.worldFlags,
          region: 'High Sun Province'
        }
      };

      rerender(
        <CharacterSheetDrawer
          isOpen={true}
          onClose={vi.fn()}
          hero={story.hero}
          state={updatedStateCity}
          genres={story.genres}
          worldName={story.worldName}
          onUseItem={onUseItem}
        />
      );

      expect(screen.getByText('The Grand Citadel of Lumina')).toBeInTheDocument();
      expect(screen.getByText(/High Sun Province/i)).toBeInTheDocument();

      // TEST LIVE UPDATE 2: Character gains or spends wealth (Earns 850 Gold Coins)
      const updatedStateWealth = {
        ...updatedStateCity,
        worldFlags: {
          ...updatedStateCity.worldFlags,
          wealth: '850 Gold Sovereigns'
        }
      };

      rerender(
        <CharacterSheetDrawer
          isOpen={true}
          onClose={vi.fn()}
          hero={story.hero}
          state={updatedStateWealth}
          genres={story.genres}
          worldName={story.worldName}
          onUseItem={onUseItem}
        />
      );

      expect(screen.getByText('850 Gold Sovereigns')).toBeInTheDocument();

      // TEST LIVE UPDATE 3: Character gains a new status title (Promoted to Royal Archon)
      const updatedStateTitle = {
        ...updatedStateWealth,
        worldFlags: {
          ...updatedStateWealth.worldFlags,
          rank: 'Royal Archon of the Sun'
        },
        statusEffects: ['Favored by the Crown', 'Awakened Senses']
      };

      rerender(
        <CharacterSheetDrawer
          isOpen={true}
          onClose={vi.fn()}
          hero={story.hero}
          state={updatedStateTitle}
          genres={story.genres}
          worldName={story.worldName}
          onUseItem={onUseItem}
        />
      );

      expect(screen.getByText('Royal Archon of the Sun')).toBeInTheDocument();
      expect(screen.getByText(/Favored by the Crown/i)).toBeInTheDocument();

      // TEST TAB NAVIGATION: Switch to Inventory tab and use consumable item
      const itemsTab = screen.getByRole('button', { name: /Items/i });
      fireEvent.click(itemsTab);

      expect(screen.getByText('Astral Compass')).toBeInTheDocument();
      expect(screen.getByText('Elder-Leaf Salve')).toBeInTheDocument();

      const useBtn = screen.getByRole('button', { name: /Use/i });
      fireEvent.click(useBtn);
      expect(onUseItem).toHaveBeenCalledWith('item_2');

      // TEST TAB NAVIGATION: Switch to Bonds tab and verify NPC trust meters
      const bondsTab = screen.getByRole('button', { name: /Bonds/i });
      fireEvent.click(bondsTab);

      expect(screen.getByText('Captain Ronald')).toBeInTheDocument();
      expect(screen.getByText('+45 Trust')).toBeInTheDocument();
      expect(screen.getByText('Hari Khatri')).toBeInTheDocument();
      expect(screen.getByText('+60 Trust')).toBeInTheDocument();
    });
  });

  describe('PART 5 & 6: Story Choices UI — Natural Continuation After Content', () => {
    it('renders choices directly after narrative content in document flow and never covers story text', () => {
      const story = createMockStory();
      const onSelectChoice = vi.fn();
      const onSubmitAction = vi.fn();

      const { container } = render(
        <I18nProvider>
          <NarrativeReader
            story={story}
            onSelectChoice={onSelectChoice}
            onSubmitAction={onSubmitAction}
            isLoading={false}
          />
        </I18nProvider>
      );

      // Verify the story text is present
      const storyParagraph = screen.getByText(/Midnight arrives not with silence, but with the roar of violet thunder/i);
      expect(storyParagraph).toBeInTheDocument();

      // Verify the final line of dialogue is completely rendered
      const finalDialogueLine = screen.getByText(/Steady your blade, traveler! The beasts are circling the granary!/i);
      expect(finalDialogueLine).toBeInTheDocument();

      // Verify the choices container is present and flows naturally after the story
      const choicesArea = screen.getByTestId('story-choices-area');
      expect(choicesArea).toBeInTheDocument();

      // Verify choices area is styled relatively (in-flow), NOT as a fixed or sticky overlay
      expect(choicesArea.className).toContain('relative');
      expect(choicesArea.className).not.toContain('sticky');

      // Verify choice options are visible and selectable
      expect(screen.getByText('Draw your Silver Stiletto and charge the beasts')).toBeInTheDocument();
      expect(screen.getByText('Activate Astral Vision to locate the alpha pack leader')).toBeInTheDocument();

      fireEvent.click(screen.getByText('Activate Astral Vision to locate the alpha pack leader'));
      expect(onSelectChoice).toHaveBeenCalledWith('c2');
    });

    it('renders cleanly for long scenes and short scenes without clipping the final lines', () => {
      // Long narrative scene with multiple paragraphs
      const longNarrativeText = `First paragraph of intense tactical deliberation in the dark forest.
The rain continues to fall in torrential sheets upon the iron ramparts.
Ancient sentinels watch from the parapets, their obsidian eyes tracking every breath.
You feel the leylines pulsing beneath your boots, offering both peril and salvation.
Final line: With a steady exhale, you prepare to take your decisive move.`;

      const longStory = createMockStory({
        turns: [
          {
            turnId: 'turn_long',
            chapterNumber: 1,
            sceneTitle: 'The Long Siege',
            narrativeText: longNarrativeText,
            choices: [
              { choiceId: 'c1', text: 'Step through the northern sally port', riskLevel: 'moderate' },
              { choiceId: 'c2', text: 'Wait for the enemy vanguard to pass', riskLevel: 'safe' }
            ],
            timestamp: Date.now()
          }
        ]
      });

      render(
        <I18nProvider>
          <NarrativeReader
            story={longStory}
            onSelectChoice={vi.fn()}
            onSubmitAction={vi.fn()}
            isLoading={false}
          />
        </I18nProvider>
      );

      // Check first paragraph and final line are both rendered cleanly
      expect(screen.getByText(/First paragraph of intense tactical deliberation/i)).toBeInTheDocument();
      expect(screen.getByText(/Final line: With a steady exhale, you prepare to take your decisive move/i)).toBeInTheDocument();

      // Choices appear after the long narrative
      expect(screen.getByText('Step through the northern sally port')).toBeInTheDocument();
    });
  });
});
