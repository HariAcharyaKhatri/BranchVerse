import { UserPreferences, DEFAULT_USER_PREFERENCES } from '../../types/preferences';
import { SupportedLanguage } from '../../types/story';

const PREFS_STORAGE_KEY = 'bv_user_preferences';
const STORY_LANG_KEY = 'bv_preferred_story_language';

class PreferencesService {
  private memoryCache: UserPreferences | null = null;
  private listeners = new Set<(prefs: UserPreferences) => void>();

  /**
   * Retrieves user preferences. Reads from localStorage or user-specific storage.
   */
  public getPreferences(userId?: string): UserPreferences {
    try {
      const storageKey = userId ? `${PREFS_STORAGE_KEY}_${userId}` : PREFS_STORAGE_KEY;
      const raw = localStorage.getItem(storageKey) || localStorage.getItem(PREFS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          ...DEFAULT_USER_PREFERENCES,
          ...parsed,
          // Ensure storyLanguage defaults to 'hi' if not explicitly set
          storyLanguage: parsed.storyLanguage || localStorage.getItem(STORY_LANG_KEY) || 'hi',
        };
      }
    } catch (e) {
      console.warn('[PreferencesService] Error reading stored preferences:', e);
    }

    // Default with Hindi for story language
    const explicitStoryLang = this.getStoredStoryLanguage();
    return {
      ...DEFAULT_USER_PREFERENCES,
      storyLanguage: explicitStoryLang || 'hi',
    };
  }

  /**
   * Retrieves the preferred Story Language (defaults strictly to 'hi' Hindi).
   */
  public getStoryLanguage(userId?: string): SupportedLanguage {
    const prefs = this.getPreferences(userId);
    return prefs.storyLanguage || 'hi';
  }

  /**
   * Retrieves the preferred App UI Language (defaults to 'en' English).
   */
  public getAppLanguage(userId?: string): string {
    const prefs = this.getPreferences(userId);
    return prefs.appLanguage || 'en';
  }

  /**
   * Updates only the App UI Language preference.
   */
  public setAppLanguage(lang: any, userId?: string): void {
    this.savePreferences({ appLanguage: lang }, userId);
  }

  /**
   * Updates user preferences (alias for savePreferences).
   */
  public updatePreferences(updates: Partial<UserPreferences>, userId?: string): UserPreferences {
    return this.savePreferences(updates, userId);
  }

  /**
   * Updates only the Story Language preference.
   */
  public setStoryLanguage(lang: SupportedLanguage, userId?: string): void {
    try {
      localStorage.setItem(STORY_LANG_KEY, lang);
    } catch {
      // Ignore storage errors
    }
    this.savePreferences({ storyLanguage: lang }, userId);
  }

  /**
   * Saves and persists updated user preferences.
   */
  public savePreferences(updates: Partial<UserPreferences>, userId?: string): UserPreferences {
    const current = this.getPreferences(userId);
    const updated: UserPreferences = {
      ...current,
      ...updates,
    };

    try {
      const storageKey = userId ? `${PREFS_STORAGE_KEY}_${userId}` : PREFS_STORAGE_KEY;
      localStorage.setItem(storageKey, JSON.stringify(updated));
      localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(updated));

      if (updates.storyLanguage) {
        localStorage.setItem(STORY_LANG_KEY, updates.storyLanguage);
      }
    } catch (e) {
      console.warn('[PreferencesService] Error saving preferences:', e);
    }

    this.memoryCache = updated;
    this.notifyListeners(updated);
    return updated;
  }

  /**
   * Subscribes to preference changes.
   */
  public subscribe(listener: (prefs: UserPreferences) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(prefs: UserPreferences) {
    this.listeners.forEach((l) => {
      try {
        l(prefs);
      } catch (err) {
        console.error('[PreferencesService] Listener error:', err);
      }
    });
  }

  private getStoredStoryLanguage(): SupportedLanguage | null {
    try {
      const saved = localStorage.getItem(STORY_LANG_KEY);
      if (saved && ['en', 'hi', 'es', 'fr', 'ja', 'ko'].includes(saved)) {
        return saved as SupportedLanguage;
      }
    } catch {
      // Ignore
    }
    return null;
  }
}

export const preferencesService = new PreferencesService();
