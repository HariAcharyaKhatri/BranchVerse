import React from 'react';
import { SaveStatus } from '../../types/storage';
import { Check, Loader2, AlertCircle } from 'lucide-react';

interface SaveIndicatorProps {
  status: SaveStatus;
  lastSavedAt?: number;
}

export const SaveIndicator: React.FC<SaveIndicatorProps> = ({ status, lastSavedAt }) => {
  if (status === 'saving') {
    return (
      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[11px] text-indigo-400">
        <Loader2 className="w-3 h-3 animate-spin" />
        <span>Saving...</span>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-[11px] text-red-400">
        <AlertCircle className="w-3 h-3" />
        <span>Save failed</span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-400">
      <Check className="w-3 h-3" />
      <span>{lastSavedAt ? 'Saved' : 'Auto-saved'}</span>
    </div>
  );
};
