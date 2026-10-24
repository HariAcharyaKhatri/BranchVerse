import { getDB } from './indexedDb';
import { StoryDocument } from '../../types/story';
import { StoryDocumentSchema } from '../validation/storySchema';

export const storyRepository = {
  async saveStory(story: StoryDocument): Promise<void> {
    // Validate schema before persisting
    const validated = StoryDocumentSchema.parse(story);
    const db = await getDB();
    await db.put('stories', validated);
  },

  async getStory(id: string): Promise<StoryDocument | null> {
    try {
      const db = await getDB();
      const story = await db.get('stories', id);
      if (!story) return null;
      return StoryDocumentSchema.parse(story);
    } catch (err) {
      console.error(`Failed to retrieve story with ID "${id}":`, err);
      return null;
    }
  },

  async listStories(): Promise<StoryDocument[]> {
    try {
      const db = await getDB();
      const all = await db.getAllFromIndex('stories', 'by-updatedAt');
      // Sort newest first
      return all.reverse();
    } catch (err) {
      console.error('Failed to list stories:', err);
      return [];
    }
  },

  async deleteStory(id: string): Promise<void> {
    const db = await getDB();
    await db.delete('stories', id);
  },

  async archiveStory(id: string): Promise<void> {
    const db = await getDB();
    const story = await db.get('stories', id);
    if (story) {
      story.status = 'archived';
      story.updatedAt = Date.now();
      await db.put('stories', story);
    }
  },

  async unarchiveStory(id: string): Promise<void> {
    const db = await getDB();
    const story = await db.get('stories', id);
    if (story) {
      story.status = 'active';
      story.updatedAt = Date.now();
      await db.put('stories', story);
    }
  },

  async renameStory(id: string, newTitle: string): Promise<void> {
    const db = await getDB();
    const story = await db.get('stories', id);
    if (story) {
      story.title = newTitle.trim();
      story.updatedAt = Date.now();
      await db.put('stories', story);
    }
  },

  async saveDraft(key: string, data: any): Promise<void> {
    try {
      const db = await getDB();
      await db.put('drafts', {
        key,
        data,
        updatedAt: Date.now()
      });
    } catch (err) {
      console.warn('Failed to save draft:', err);
    }
  },

  async getDraft<T>(key: string): Promise<T | null> {
    try {
      const db = await getDB();
      const draft = await db.get('drafts', key);
      return draft ? (draft.data as T) : null;
    } catch (err) {
      console.warn('Failed to get draft:', err);
      return null;
    }
  },

  async clearDraft(key: string): Promise<void> {
    try {
      const db = await getDB();
      await db.delete('drafts', key);
    } catch (err) {
      console.warn('Failed to clear draft:', err);
    }
  }
};
