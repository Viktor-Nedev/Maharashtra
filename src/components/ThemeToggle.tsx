import { useThemeStore } from '@/lib/themeStore';

/** Light/dark mode switch. Sun ↔ moon, persisted to localStorage. */
export function ThemeToggle({ className = '' }: { className?: string }) {
  const theme = useThemeStore((s) => s.theme);
  const toggle = useThemeStore((s) => s.toggle);

  return (
    <button
      type="button"
      className={`theme-toggle ${className}`}
      onClick={toggle}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      <span className="theme-toggle__icon">{theme === 'dark' ? '☀' : '☾'}</span>
    </button>
  );
}
