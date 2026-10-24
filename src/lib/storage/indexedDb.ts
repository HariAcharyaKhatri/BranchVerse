import { openDB, IDBPDatabase } from 'idb';
import { StoryDocument } from '../../types/story';

const DB_NAME = 'branchverse_db';
const DB_VERSION = 1;

export interface BranchVerseDBSchema {
  stories: {
    key: string;
    value: StoryDocument;
    indexes: {
      'by-updatedAt': number;
      'by-status': string;
    };
  };
  drafts: {
    key: string;
    value: {
      key: string;
      data: any;
      updatedAt: number;
    };
  };
}

let dbPromise: Promise<IDBPDatabase<BranchVerseDBSchema>> | null = null;

export function getDB(): Promise<IDBPDatabase<BranchVerseDBSchema>> {
  if (!dbPromise) {
    dbPromise = openDB<BranchVerseDBSchema>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        if (oldVersion < 1) {
          // Stories store
          const storyStore = db.createObjectStore('stories', { keyPath: 'id' });
          storyStore.createIndex('by-updatedAt', 'updatedAt');
          storyStore.createIndex('by-status', 'status');

          // Drafts store
          db.createObjectStore('drafts', { keyPath: 'key' });
        }
      },
      blocked() {
        console.warn('BranchVerse DB upgrade blocked: please close other open tabs of this app.');
      },
      blocking() {
        console.warn('BranchVerse DB blocking another connection: closing.');
        if (dbPromise) {
          dbPromise.then(db => db.close());
          dbPromise = null;
        }
      },
      terminated() {
        console.error('BranchVerse DB connection unexpectedly terminated.');
        dbPromise = null;
      }
    });
  }
  return dbPromise;
}
