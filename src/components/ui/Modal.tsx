import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxWidth = 'md'
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

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-xl'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className={`relative w-full ${maxWidthClasses[maxWidth]} bg-dark-surface border border-dark-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90dvh] z-10 animate-in zoom-in-95 duration-200`}>
        {title && (
          <div className="flex items-center justify-between px-5 py-4 border-b border-dark-border/60">
            <h3 className="font-semibold text-base sm:text-lg text-dark-text tracking-tight">{title}</h3>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-dark-muted hover:text-dark-text hover:bg-dark-elevated transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        <div className="p-5 overflow-y-auto overscroll-contain flex-1">
          {children}
        </div>
        {footer && (
          <div className="px-5 py-3.5 border-t border-dark-border/60 bg-dark-surface/90 flex justify-end gap-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
