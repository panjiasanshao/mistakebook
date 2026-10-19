// 主题 hook：5 套配色，localStorage 持久化
import { useCallback, useEffect, useState } from 'react';
import { THEMES, type ThemeKey, type ThemePreset } from '../types/mistake';

const STORAGE_KEY = 'mistakebook-theme';

function loadStored(): ThemeKey {
  try {
    const v = localStorage.getItem(STORAGE_KEY) as ThemeKey | null;
    if (v && THEMES.some((t) => t.key === v)) return v;
  } catch { /* ignore */ }
  return 'indigo';
}

function applyTheme(theme: ThemePreset) {
  const root = document.documentElement;
  root.style.setProperty('--app-primary', theme.primary);
  root.style.setProperty('--app-primary-dark', theme.primaryDark);
  root.style.setProperty('--app-primary-light', theme.primaryLight);
  root.style.setProperty('--app-primary-text', theme.primaryText);
}

export function useTheme() {
  const [key, setKey] = useState<ThemeKey>(loadStored);
  const theme = THEMES.find((t) => t.key === key) ?? THEMES[0];

  useEffect(() => { applyTheme(theme); }, [theme]);

  const change = useCallback((k: ThemeKey) => {
    setKey(k);
    try { localStorage.setItem(STORAGE_KEY, k); } catch { /* ignore */ }
  }, []);

  return { key, theme, themes: THEMES, change };
}
