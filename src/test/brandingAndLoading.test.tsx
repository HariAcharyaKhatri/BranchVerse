import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';
import { BRANDING, CONTEXTUAL_LOADING_MESSAGES } from '../config/branding';
import { BrandEmblem, SvgBrandEmblemFallback } from '../components/branding/BrandEmblem';
import { SplashScreen } from '../components/branding/SplashScreen';
import { LoadingScreen } from '../components/branding/LoadingScreen';

describe('BranchVerse Cinematic Branding & Loading System', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('Brand Configuration and Assets', () => {
    it('defines authoritative branding name, tagline, and palette constants', () => {
      expect(BRANDING.name).toBe('BranchVerse');
      expect(BRANDING.tagline).toBe('Your Choices. Your World. Your Story.');
      expect(BRANDING.assets.logo).toBeDefined();
      expect(BRANDING.assets.appIcon).toBeDefined();
      expect(BRANDING.assets.splashArt).toBeDefined();
      expect(BRANDING.colors.backgroundDark).toBe('#080511');
      expect(BRANDING.colors.midnightPurple).toBe('#130924');
    });

    it('provides rich contextual loading messages for all multiverse phases', () => {
      expect(CONTEXTUAL_LOADING_MESSAGES.startup.length).toBeGreaterThan(0);
      expect(CONTEXTUAL_LOADING_MESSAGES.auth.length).toBeGreaterThan(0);
      expect(CONTEXTUAL_LOADING_MESSAGES.storyLoad.length).toBeGreaterThan(0);
      expect(CONTEXTUAL_LOADING_MESSAGES.storyGenerate.length).toBeGreaterThan(0);
      expect(CONTEXTUAL_LOADING_MESSAGES.worldEnter.length).toBeGreaterThan(0);
      expect(CONTEXTUAL_LOADING_MESSAGES.saving.length).toBeGreaterThan(0);
    });
  });

  describe('BrandEmblem Component', () => {
    it('renders with application icon asset by default', () => {
      render(<BrandEmblem size="md" variant="icon" />);
      const img = screen.getByRole('img');
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', BRANDING.assets.appIcon);
      expect(img).toHaveAttribute('alt', BRANDING.name);
    });

    it('renders with detailed brand logo when requested', () => {
      render(<BrandEmblem size="lg" variant="logo" />);
      const img = screen.getByRole('img');
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', BRANDING.assets.logo);
    });

    it('falls back to vector SVG gracefully on image loading error without throwing', () => {
      const { container } = render(<BrandEmblem size="md" variant="icon" />);
      const img = screen.getByRole('img');

      // Trigger image error
      fireEvent.error(img);

      // Verify fallback SVG is rendered
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute('viewBox', '0 0 200 200');
    });

    it('renders SvgBrandEmblemFallback directly with glow options', () => {
      const { container } = render(<SvgBrandEmblemFallback showGlow={true} />);
      expect(container.querySelector('svg')).toBeInTheDocument();
      expect(container.querySelector('rect')).toBeInTheDocument();
    });
  });

  describe('SplashScreen Component', () => {
    it('renders the brand name, tagline, and interactive multiverse header', () => {
      render(<SplashScreen />);
      expect(screen.getByText('BRANCHVERSE')).toBeInTheDocument();
      expect(screen.getByText(BRANDING.tagline)).toBeInTheDocument();
      expect(screen.getAllByText(/Interactive Multiverse RPG/i).length).toBeGreaterThan(0);
    });

    it('transitions and calls onComplete after minDurationMs timer completes', () => {
      const onCompleteMock = vi.fn();
      render(<SplashScreen minDurationMs={1500} onComplete={onCompleteMock} />);

      expect(onCompleteMock).not.toHaveBeenCalled();

      // Fast-forward duration
      act(() => {
        vi.advanceTimersByTime(1500);
      });

      // Fast-forward fade-out transition duration (400ms)
      act(() => {
        vi.advanceTimersByTime(400);
      });

      expect(onCompleteMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('LoadingScreen Component', () => {
    it('renders default startup loading state with rotating message container', () => {
      render(<LoadingScreen context="startup" />);
      expect(screen.getByRole('status')).toBeInTheDocument();
      // Should show initial startup message
      expect(screen.getByText(CONTEXTUAL_LOADING_MESSAGES.startup[0])).toBeInTheDocument();
    });

    it('cycles through contextual atmospheric messages across intervals', () => {
      render(<LoadingScreen context="storyGenerate" />);
      const firstMsg = CONTEXTUAL_LOADING_MESSAGES.storyGenerate[0];
      expect(screen.getByText(firstMsg)).toBeInTheDocument();

      // Advance by 3.5 seconds
      act(() => {
        vi.advanceTimersByTime(3500);
      });

      const secondMsg = CONTEXTUAL_LOADING_MESSAGES.storyGenerate[1];
      expect(screen.getByText(secondMsg)).toBeInTheDocument();
    });

    it('displays custom title, message, and submessage when explicitly supplied', () => {
      render(
        <LoadingScreen
          title="Gate of Rebirth"
          message="Crossing the astral veil..."
          submessage="Channeling world frequencies"
        />
      );

      expect(screen.getByText('Gate of Rebirth')).toBeInTheDocument();
      expect(screen.getByText('Crossing the astral veil...')).toBeInTheDocument();
      expect(screen.getByText('Channeling world frequencies')).toBeInTheDocument();
    });

    it('renders determinate progress bar when progress percentage is provided', () => {
      render(<LoadingScreen progress={68} />);
      expect(screen.getByText('68%')).toBeInTheDocument();
    });

    it('renders error recovery state with retry and return actions', () => {
      const onRetryMock = vi.fn();
      const onCancelMock = vi.fn();

      render(
        <LoadingScreen
          error={{
            title: 'Gateway Disconnected',
            message: 'A disturbance in the ether severed the connection.',
            onRetry: onRetryMock,
            onCancel: onCancelMock,
          }}
        />
      );

      expect(screen.getByText('Gateway Disconnected')).toBeInTheDocument();
      expect(screen.getByText(/severed the connection/i)).toBeInTheDocument();

      const retryBtn = screen.getByRole('button', { name: /Retry Connection/i });
      fireEvent.click(retryBtn);
      expect(onRetryMock).toHaveBeenCalledTimes(1);

      const cancelBtn = screen.getByRole('button', { name: /Return to Safe Realm/i });
      fireEvent.click(cancelBtn);
      expect(onCancelMock).toHaveBeenCalledTimes(1);
    });
  });
});
