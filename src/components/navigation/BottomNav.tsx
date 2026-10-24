import React from 'react';
import { Home, BookOpen, PlusCircle, Settings } from 'lucide-react';
import { useI18n } from '../../i18n';

interface BottomNavProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  storyCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentPath,
  onNavigate,
  storyCount = 0
}) => {
  const { t } = useI18n();

  const navItems = [
    {
      id: 'home',
      label: t.navigation.home,
      path: '#/',
      icon: Home
    },
    {
      id: 'library',
      label: t.navigation.library,
      path: '#/library',
      icon: BookOpen,
      badge: storyCount > 0 ? storyCount : undefined
    },
    {
      id: 'create',
      label: t.navigation.create,
      path: '#/create-hero',
      icon: PlusCircle,
      highlight: true
    },
    {
      id: 'settings',
      label: t.navigation.settings,
      path: '#/settings',
      icon: Settings
    }
  ];

  // In Story Reader, bottom navigation can be docked or minimal so it doesn't obstruct reading
  const isReader = currentPath.startsWith('#/reader');
  if (isReader) {
    return null; // The reader has its own sticky action drawer
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-dark-surface/95 backdrop-blur-md border-t border-dark-border/80 safe-area-bottom">
      <div className="max-w-md mx-auto h-16 grid grid-cols-4 items-center px-1">
        {navItems.map((item) => {
          const isActive = currentPath === item.path ||
            (item.path !== '#/' && currentPath.startsWith(item.path));
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.path)}
              className="relative flex flex-col items-center justify-center w-full h-full py-1 transition-colors focus:outline-none group select-none"
              aria-label={item.label}
            >
              <div className="relative flex items-center justify-center w-8 h-8">
                {item.highlight ? (
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                      isActive
                        ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/40 ring-2 ring-brand-primary/50 scale-105'
                        : 'bg-gradient-to-tr from-brand-primary to-indigo-500 text-white shadow-sm shadow-brand-primary/30 group-hover:scale-105 group-active:scale-95'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                ) : (
                  <>
                    <Icon
                      className={`w-5 h-5 transition-transform ${
                        isActive
                          ? 'text-brand-primary scale-110'
                          : 'text-dark-muted group-hover:text-dark-text group-active:scale-95'
                      }`}
                    />
                    {item.badge !== undefined && (
                      <span className="absolute -top-1 -right-1.5 bg-brand-accent text-dark-bg font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center pointer-events-none">
                        {item.badge > 9 ? '9+' : item.badge}
                      </span>
                    )}
                  </>
                )}
              </div>

              <span
                className={`text-[11px] mt-1 tracking-tight transition-colors ${
                  isActive
                    ? 'text-indigo-400 font-semibold'
                    : 'text-dark-muted group-hover:text-dark-text'
                }`}
              >
                {item.label}
              </span>

              {isActive && (
                <span className="absolute bottom-1 w-4 h-0.5 bg-brand-primary rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
