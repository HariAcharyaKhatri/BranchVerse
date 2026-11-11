import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { IsekaiReincarnationPage } from '../pages/IsekaiReincarnationPage';
import { LoginPage } from '../pages/LoginPage';
import { ReaderPage } from '../pages/ReaderPage';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { StoryDocument } from '../types/story';
import { storyRepository } from '../lib/storage/storyRepository';

// Mock storage repository
vi.mock('../lib/storage/storyRepository', () => ({
  storyRepository: {
    getStory: vi.fn(),
    saveStory: vi.fn().mockResolvedValue(undefined),
  },
}));

// Mock audio & soundscape components to avoid JSDOM audio failures
vi.mock('../components/story/AtmosphereSoundscape', () => ({
  AtmosphereSoundscape: () => <div data-testid="mock-soundscape" />,
}));
vi.mock('../components/story/FateDiceRoller', () => ({
  FateDiceRoller: () => <div data-testid="mock-dice-roller" />,
}));
vi.mock('../components/story/NarratorAudio', () => ({
  NarratorAudio: () => <div data-testid="mock-narrator-audio" />,
}));

const mockStoryDoc: StoryDocument = {
  id: 'story_resp_test_1',
  title: 'Chronicles of Seraphina',
  worldId: 'aethelgard',
  worldName: 'Aethelgard',
  genres: ['Fantasy'],
  hero: {
    name: 'Hari Khatri',
    race: 'Human',
    origin: 'Wandering Swordsman',
    powerLevel: 35,
    attributes: {
      strength: 15,
      agility: 15,
      vitality: 15,
      intelligence: 15,
      wisdom: 15,
      perception: 15,
      dexterity: 15,
      luck: 15,
      magicalControl: 15,
      magicalCapacity: 15,
      charisma: 15,
    },
  },
  state: {
    turnNumber: 1,
    powerLevel: 35,
    currentLocation: 'Verdant Outskirts',
    statusEffects: [],
    inventory: [
      { id: 'item_1', name: 'Celestial Elixir', quantity: 2, description: 'Restores essence' },
    ],
    activeQuests: ['Seek the Celestial Shrine'],
  },
  settings: {
    storyLanguage: 'hi',
    difficulty: 'Adventurer (Standard)',
    tone: 'Epic Fantasy',
    pacing: 'Balanced Narrative',
  },
  turns: [
    {
      turnId: 'turn_1',
      chapterNumber: 1,
      sceneTitle: 'The Awakening Leyline',
      narrativeText: 'तुम नीले प्रकाश के स्तंभ के बीच जागते हो। हवा में ईथर की सौंधी खुशबू तैर रही है।',
      choices: [
        {
          choiceId: 'c1',
          text: 'पवित्र वेदी की ओर बढ़ो',
          riskLevel: 'safe',
        },
        {
          choiceId: 'c2',
          text: 'चारों ओर रक्षात्मक सुरक्षा घेरा बनाओ',
          riskLevel: 'moderate',
        },
      ],
    },
  ],
  generationMode: 'ai',
  storyLanguage: 'hi',
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

describe('Mobile-First UI/UX & Responsive Journey Optimization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('1. Guest Pilgrim Authentication Flow', () => {
    it('allows users to enter immediately as Guest Pilgrim without Google credentials', async () => {
      const onLoginSuccess = vi.fn();
      render(
        <AuthProvider>
          <LoginPage onSuccess={onLoginSuccess} onBack={vi.fn()} />
        </AuthProvider>
      );

      // Verify guest button exists with prominent accessible text
      const guestBtn = screen.getByRole('button', { name: /enter as guest pilgrim/i });
      expect(guestBtn).toBeInTheDocument();

      fireEvent.click(guestBtn);
      await waitFor(() => {
        expect(onLoginSuccess).toHaveBeenCalled();
      });
    });

    it('creates an authenticated session with guest properties in AuthContext', () => {
      const TestConsumer = () => {
        const { user, signInAsGuest } = useAuth();
        return (
          <div>
            <span data-testid="user-status">{user ? `User: ${user.displayName}` : 'Anonymous'}</span>
            <span data-testid="guest-flag">{user?.isGuest ? 'IsGuest' : 'NotGuest'}</span>
            <button onClick={() => signInAsGuest()}>Sign As Guest</button>
          </div>
        );
      };

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      expect(screen.getByTestId('user-status')).toHaveTextContent('Anonymous');
      fireEvent.click(screen.getByRole('button', { name: /sign as guest/i }));

      expect(screen.getByTestId('user-status')).toHaveTextContent('Guest Pilgrim');
      expect(screen.getByTestId('guest-flag')).toHaveTextContent('IsGuest');
    });
  });

  describe('2. Sequential Stepper Navigation & Journey Flow', () => {
    it('advances sequentially through steps 1 to 8 without skipping required context', async () => {
      const onLaunchStory = vi.fn();
      const onNavigate = vi.fn();

      render(
        <AuthProvider>
          <IsekaiReincarnationPage onLaunchStory={onLaunchStory} onNavigate={onNavigate} />
        </AuthProvider>
      );

      // Skip prologue straight to Angel communion
      const skipBtn = screen.getByRole('button', { name: /skip to angel encounter/i });
      fireEvent.click(skipBtn);

      // Verify Step 1: Soul Name & Identity
      expect(screen.getByText(/Step 1 of 8/i)).toBeInTheDocument();
      expect(screen.getByText(/Soul Name & Identity/i)).toBeInTheDocument();

      // Enter name: Seraphina recognizes name and advances to Step 2
      const nameInput = screen.getByPlaceholderText(/Seraphina awaits your name/i);
      fireEvent.change(nameInput, { target: { value: 'My name is Kaelen Starfall.' } });
      fireEvent.click(screen.getByLabelText('Send response to Angel'));

      // Automatically transitions to Step 2: Species & Bloodline
      expect(screen.getByText(/Step 2 of 8/i)).toBeInTheDocument();
      expect(screen.getByText(/Species & Bloodline/i)).toBeInTheDocument();

      // Advance to Step 3: Social Origin & Station
      const nextBtnStep2 = screen.getByRole('button', { name: /^continue$/i });
      fireEvent.click(nextBtnStep2);

      expect(screen.getByText(/Step 3 of 8/i)).toBeInTheDocument();
      expect(screen.getByText(/Social Origin & Station/i)).toBeInTheDocument();

      // Back navigation returns to Step 2
      const backBtn = screen.getByRole('button', { name: /^back$/i });
      fireEvent.click(backBtn);

      expect(screen.getByText(/Step 2 of 8/i)).toBeInTheDocument();
      expect(screen.getByText(/Species & Bloodline/i)).toBeInTheDocument();
    });

    it('provides quick jump to final review dossier at any time via header', async () => {
      const onLaunchStory = vi.fn();
      const onNavigate = vi.fn();

      render(
        <AuthProvider>
          <IsekaiReincarnationPage onLaunchStory={onLaunchStory} onNavigate={onNavigate} />
        </AuthProvider>
      );

      // Skip prologue straight to Angel
      fireEvent.click(screen.getByRole('button', { name: /skip to angel encounter/i }));

      // Header "Proceed to Final Review" button is accessible
      const reviewShortcut = screen.getByRole('button', { name: /proceed to final review/i });
      expect(reviewShortcut).toBeInTheDocument();
      fireEvent.click(reviewShortcut);

      // Verify arrival at final review confirmation
      expect(screen.getByText(/Reincarnation Affirmation/i)).toBeInTheDocument();
      expect(screen.getByText(/Dimensional Gate Primed/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /awaken in/i })).toBeInTheDocument();
    });
  });

  describe('3. Desktop vs Mobile Reader Layout', () => {
    it('renders responsive desktop sidebar with hero status, quests, and inventory on ReaderPage', async () => {
      (storyRepository.getStory as any).mockResolvedValue(mockStoryDoc);

      render(
        <ReaderPage
          storyId="story_resp_test_1"
          onExit={vi.fn()}
          onViewTranscript={vi.fn()}
        />
      );

      // Wait for story to load
      await waitFor(() => {
        expect(screen.getAllByText('Chronicles of Seraphina').length).toBeGreaterThan(0);
      });

      // Verify desktop sidebar container exists with appropriate test ID
      const desktopSidebar = screen.getByTestId('reader-desktop-sidebar');
      expect(desktopSidebar).toBeInTheDocument();
      expect(desktopSidebar.className).toContain('hidden lg:flex');

      // Verify hero vitals within sidebar
      expect(screen.getByText('Active Pilgrim')).toBeInTheDocument();
      expect(screen.getByText('Seek the Celestial Shrine')).toBeInTheDocument();
      expect(screen.getAllByText(/Celestial Elixir/i).length).toBeGreaterThan(0);

      // Verify story choices are presented with readable labels
      expect(screen.getByText('पवित्र वेदी की ओर बढ़ो')).toBeInTheDocument();
      expect(screen.getByText('चारों ओर रक्षात्मक सुरक्षा घेरा बनाओ')).toBeInTheDocument();
    });
  });
});
