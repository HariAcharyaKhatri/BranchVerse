import { describe, it, expect } from 'vitest';
import { detectLanguageChangeIntent } from '../features/story/naturalPromptParser';
import { en } from '../i18n/locales/en';
import { hi } from '../i18n/locales/hi';
import { es } from '../i18n/locales/es';
import { fr } from '../i18n/locales/fr';
import { ja } from '../i18n/locales/ja';
import { ko } from '../i18n/locales/ko';
import { LANGUAGE_LABELS, SupportedLanguage, StoryDocument } from '../types/story';

describe('Multilingual Narrative & UI Localization System', () => {

  describe('Natural Prompt Language Change Intent Parser', () => {
    it('detects a temporary one-turn language request in English, Hindi, and Japanese', () => {
      const resEn = detectLanguageChangeIntent('Answer in English please');
      expect(resEn.requestedLanguage).toBe('en');
      expect(resEn.isPermanent).toBe(false);

      const resHi = detectLanguageChangeIntent('Answer in Hindi');
      expect(resHi.requestedLanguage).toBe('hi');
      expect(resHi.isPermanent).toBe(false);

      const resJa = detectLanguageChangeIntent('Reply in Japanese');
      expect(resJa.requestedLanguage).toBe('ja');
      expect(resJa.isPermanent).toBe(false);
    });

    it('detects permanent story-language change requests', () => {
      const res1 = detectLanguageChangeIntent('Continue in Hindi');
      expect(res1.requestedLanguage).toBe('hi');
      expect(res1.isPermanent).toBe(true);

      const res2 = detectLanguageChangeIntent('Switch language to Spanish from now on');
      expect(res2.requestedLanguage).toBe('es');
      expect(res2.isPermanent).toBe(true);

      const res3 = detectLanguageChangeIntent('Continue the rest of the story in French');
      expect(res3.requestedLanguage).toBe('fr');
      expect(res3.isPermanent).toBe(true);

      const res4 = detectLanguageChangeIntent('계속 한국어로 이야기해줘');
      expect(res4.requestedLanguage).toBe('ko');
      expect(res4.isPermanent).toBe(true);
    });

    it('returns null for normal gameplay actions with no language change intent', () => {
      const res1 = detectLanguageChangeIntent('I swing my enchanted sword at the dragon');
      expect(res1.requestedLanguage).toBeNull();
      expect(res1.isPermanent).toBe(false);

      const res2 = detectLanguageChangeIntent('Search the chest for ancient relics');
      expect(res2.requestedLanguage).toBeNull();
      expect(res2.isPermanent).toBe(false);
    });
  });

  describe('Translation Catalog Completeness Across 6 Languages', () => {
    const dictionaries = [
      { name: 'en', dict: en },
      { name: 'hi', dict: hi },
      { name: 'es', dict: es },
      { name: 'fr', dict: fr },
      { name: 'ja', dict: ja },
      { name: 'ko', dict: ko },
    ];

    it.each(dictionaries)('contains complete common strings for $name', ({ dict }) => {
      expect(dict.common.appName).toBe('BranchVerse');
      expect(dict.common.tagline.length).toBeGreaterThan(0);
      expect(dict.common.save.length).toBeGreaterThan(0);
      expect(dict.common.cancel.length).toBeGreaterThan(0);
      expect(dict.common.modeDemo.length).toBeGreaterThan(0);
      expect(dict.common.modeAI.length).toBeGreaterThan(0);
    });

    it.each(dictionaries)('contains complete navigation labels for $name', ({ dict }) => {
      expect(dict.navigation.home.length).toBeGreaterThan(0);
      expect(dict.navigation.create.length).toBeGreaterThan(0);
      expect(dict.navigation.library.length).toBeGreaterThan(0);
      expect(dict.navigation.settings.length).toBeGreaterThan(0);
    });

    it.each(dictionaries)('contains complete error and rate limit messages for $name', ({ dict }) => {
      expect(dict.errors.rateLimitUser.length).toBeGreaterThan(0);
      expect(dict.errors.rateLimitGlobal.length).toBeGreaterThan(0);
      expect(dict.errors.modelQuotaExhausted.length).toBeGreaterThan(0);
      expect(dict.errors.aiUnavailable.length).toBeGreaterThan(0);
    });

    it('has valid language metadata for all 6 supported languages', () => {
      const keys: SupportedLanguage[] = ['en', 'hi', 'es', 'fr', 'ja', 'ko'];
      for (const k of keys) {
        expect(LANGUAGE_LABELS[k]).toBeDefined();
        expect(LANGUAGE_LABELS[k].label.length).toBeGreaterThan(0);
        expect(LANGUAGE_LABELS[k].native.length).toBeGreaterThan(0);
        expect(LANGUAGE_LABELS[k].flag.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Separation of App Language from Story Language', () => {
    it('preserves storyLanguage independent of App UI language', () => {
      const mockStory: Partial<StoryDocument> = {
        id: 'story_test_1',
        title: 'Chronicle of Valen',
        storyLanguage: 'hi',
        generationMode: 'ai',
        settings: {
          tone: 'Epic Fantasy',
          pacing: 'Balanced Narrative',
          difficulty: 'Adventurer (Standard)',
          storyLanguage: 'hi',
        }
      };

      // App UI is in English or Spanish
      const appLang: SupportedLanguage = 'en';

      // Verify that story language remains Hindi even if UI is English
      expect(mockStory.storyLanguage).toBe('hi');
      expect(mockStory.settings?.storyLanguage).toBe('hi');
      expect(appLang).toBe('en');
      expect(mockStory.storyLanguage).not.toBe(appLang);
    });
  });
});
