import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-lg mx-auto bg-dark-surface border-t border-x border-dark-border rounded-t-3xl shadow-2xl overflow-hidden max-h-[85dvh] flex flex-col z-10 animate-in slide-in-from-bottom duration-300">
        {/* Grab bar */}
        <div className="w-full pt-3 pb-1 flex justify-center cursor-grab active:cursor-grabbing" onClick={onClose}>
          <div className="w-12 h-1.5 bg-dark-border rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-dark-border/60">
          <div>
            {title && <h3 className="font-semibold text-lg text-dark-text tracking-tight">{title}</h3>}
            {subtitle && <p className="text-xs text-dark-muted mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-dark-muted hover:text-dark-text hover:bg-dark-elevated transition-colors"
            aria-label="Close bottom sheet"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto overscroll-contain flex-1 safe-area-bottom">
          {children}
        </div>
      </div>
    </div>
  );
};
