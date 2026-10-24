import { StoryDocument } from './story';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export interface StorageQuotaInfo {
  usageBytes: number;
  quotaBytes: number;
  percentageUsed: number;
}

export interface BackupEnvelope {
  app: 'BranchVerse';
  version: number;
  exportedAt: number;
  storyCount: number;
  stories: StoryDocument[];
}

export interface StorageError {
  code: 'QUOTA_EXCEEDED' | 'CORRUPTED_DATA' | 'VERSION_MISMATCH' | 'WRITE_FAILED';
  message: string;
  details?: unknown;
}
