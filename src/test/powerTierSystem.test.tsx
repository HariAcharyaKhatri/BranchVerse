import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import {
  ALL_POWER_TIERS,
  getPowerTier,
  getPowerForTier,
  getTierProgress
} from '../features/character/tierSystem';
import { TierBadge } from '../components/character/TierBadge';
import { TierSelectorModal } from '../components/character/TierSelectorModal';
import {
  createInitialReincarnationSession,
  buildReincarnationLaunchPackage,
  updateProfileFieldManually
} from '../features/reincarnation/reincarnationEngine';

describe('BranchVerse — RPG Tier Ranking System (E to SSS & God Tier)', () => {
  describe('1. Tier Hierarchy & Mapping Logic', () => {
    it('defines 9 complete tiers ending with God Tier', () => {
      expect(ALL_POWER_TIERS.length).toBe(9);
      const codes = ALL_POWER_TIERS.map(t => t.code);
      expect(codes).toEqual(['E', 'D', 'C', 'B', 'A', 'S', 'SS', 'SSS', 'GOD']);
    });

    it('correctly maps power levels 1 through 100 to appropriate tiers', () => {
      // Tier E (1-19)
      expect(getPowerTier(1).code).toBe('E');
      expect(getPowerTier(15).code).toBe('E');
      expect(getPowerTier(19).code).toBe('E');

      // Tier D (20-34)
      expect(getPowerTier(20).code).toBe('D');
      expect(getPowerTier(34).code).toBe('D');

      // Tier C (35-44) - Previous default level 35
      expect(getPowerTier(35).code).toBe('C');
      expect(getPowerTier(35).name).toBe('Tier C');
      expect(getPowerTier(44).code).toBe('C');

      // Tier B (45-59) - Current default level 45
      expect(getPowerTier(45).code).toBe('B');
      expect(getPowerTier(45).name).toBe('Tier B');
      expect(getPowerTier(59).code).toBe('B');

      // Tier A (60-74)
      expect(getPowerTier(60).code).toBe('A');

      // Tier S (75-84)
      expect(getPowerTier(80).code).toBe('S');

      // Tier SS (85-92)
      expect(getPowerTier(90).code).toBe('SS');

      // Tier SSS (93-98)
      expect(getPowerTier(95).code).toBe('SSS');
      expect(getPowerTier(95).name).toBe('Tier SSS');

      // God Tier (99-100+)
      expect(getPowerTier(99).code).toBe('GOD');
      expect(getPowerTier(100).code).toBe('GOD');
      expect(getPowerTier(100).name).toBe('God Tier');
      expect(getPowerTier(100).isGodTier).toBe(true);
    });

    it('handles string tier codes gracefully', () => {
      expect(getPowerTier('E').code).toBe('E');
      expect(getPowerTier('SSS').code).toBe('SSS');
      expect(getPowerTier('GOD').code).toBe('GOD');
      expect(getPowerTier('god').code).toBe('GOD');
      expect(getPowerTier(undefined).code).toBe('B'); // Safe fallback
    });

    it('provides accurate tier progression and ascension paths', () => {
      const eProgress = getTierProgress(10);
      expect(eProgress.currentTier.code).toBe('E');
      expect(eProgress.nextTier?.code).toBe('D');

      const bProgress = getTierProgress(45);
      expect(bProgress.currentTier.code).toBe('B');
      expect(bProgress.nextTier?.code).toBe('A');

      const sssProgress = getTierProgress(95);
      expect(sssProgress.currentTier.code).toBe('SSS');
      expect(sssProgress.nextTier?.code).toBe('GOD');

      const godProgress = getTierProgress(100);
      expect(godProgress.currentTier.code).toBe('GOD');
      expect(godProgress.nextTier).toBeNull();
      expect(godProgress.percent).toBe(100);
    });

    it('retrieves default power level for selected tier code', () => {
      expect(getPowerForTier('E')).toBe(15);
      expect(getPowerForTier('C')).toBe(40);
      expect(getPowerForTier('B')).toBe(45);
      expect(getPowerForTier('SSS')).toBe(96);
      expect(getPowerForTier('GOD')).toBe(100);
    });
  });

  describe('2. TierBadge Component', () => {
    it('renders pill variant with correct rank title and label', () => {
      render(<TierBadge tier="SSS" variant="pill" showTitle={true} />);
      expect(screen.getByText('Tier SSS')).toBeDefined();
      expect(screen.getByText('Supreme')).toBeDefined();
    });

    it('renders badge variant with God Tier glow and styling', () => {
      render(<TierBadge tier={100} variant="badge" showTitle={true} />);
      expect(screen.getByText('God Tier')).toBeDefined();
      expect(screen.getByText('• Divine Omnipotent')).toBeDefined();
    });

    it('triggers onClick handler when interactive', () => {
      const handleClick = vi.fn();
      render(<TierBadge tier="A" onClick={handleClick} />);
      const badge = screen.getByText('Tier A');
      fireEvent.click(badge);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('3. TierSelectorModal Component', () => {
    it('renders all 9 tiers for selection from E to God Tier', () => {
      render(
        <TierSelectorModal
          isOpen={true}
          onClose={vi.fn()}
          selectedTier="B"
          onSelectTier={vi.fn()}
        />
      );

      expect(screen.getByText('Soul Power Tier Selection')).toBeDefined();
      expect(screen.getByText('Tier E')).toBeDefined();
      expect(screen.getByText('Tier D')).toBeDefined();
      expect(screen.getByText('Tier C')).toBeDefined();
      expect(screen.getByText('Tier B')).toBeDefined();
      expect(screen.getByText('Tier A')).toBeDefined();
      expect(screen.getByText('Tier S')).toBeDefined();
      expect(screen.getByText('Tier SS')).toBeDefined();
      expect(screen.getByText('Tier SSS')).toBeDefined();
      expect(screen.getByText('God Tier')).toBeDefined();
    });

    it('calls onSelectTier and passes chosen tier info upon click', () => {
      const handleSelect = vi.fn();
      render(
        <TierSelectorModal
          isOpen={true}
          onClose={vi.fn()}
          selectedTier="B"
          onSelectTier={handleSelect}
        />
      );

      // Select God Tier
      const godTierButton = screen.getByText('God Tier').closest('button');
      expect(godTierButton).toBeDefined();
      fireEvent.click(godTierButton!);

      expect(handleSelect).toHaveBeenCalledTimes(1);
      expect(handleSelect.mock.calls[0][0].code).toBe('GOD');
      expect(handleSelect.mock.calls[0][0].defaultPower).toBe(100);
    });
  });

  describe('4. Isekai Reincarnation Profile Tier Integration', () => {
    it('initializes session profile with default Tier B (powerLevel 45)', () => {
      const session = createInitialReincarnationSession();
      expect(session.profile.abilities.powerTier?.value).toBe('B');

      const pkg = buildReincarnationLaunchPackage(session);
      expect(pkg.hero.powerLevel).toBe(45);
      expect(pkg.hero.tier).toBe('B');
    });

    it('updates soul power tier to God Tier and propagates to launch package', () => {
      let session = createInitialReincarnationSession();
      session = updateProfileFieldManually(session, 'abilities', 'powerTier', 'GOD');
      expect(session.profile.abilities.powerTier?.value).toBe('GOD');

      const pkg = buildReincarnationLaunchPackage(session);
      expect(pkg.hero.powerLevel).toBe(100);
      expect(pkg.hero.tier).toBe('GOD');
    });

    it('updates soul power tier to Tier SSS (96 power)', () => {
      let session = createInitialReincarnationSession();
      session = updateProfileFieldManually(session, 'abilities', 'powerTier', 'SSS');
      expect(session.profile.abilities.powerTier?.value).toBe('SSS');

      const pkg = buildReincarnationLaunchPackage(session);
      expect(pkg.hero.powerLevel).toBe(96);
      expect(pkg.hero.tier).toBe('SSS');
    });
  });
});
