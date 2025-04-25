import { useCallback, useEffect, useState } from 'react';

export type Appearance = 'light' | 'dark' | 'system';

const prefersDark = () => false; // Always return false to force light mode

const setCookie = (name: string, value: string, days = 365) => {
    if (typeof document === 'undefined') {
        return;
    }

    const maxAge = days * 24 * 60 * 60;
    document.cookie = `${name}=${value};path=/;max-age=${maxAge};SameSite=Lax`;
};

const applyTheme = (appearance: Appearance) => {
    // Always force light mode
    document.documentElement.classList.remove('dark');
};

const mediaQuery = () => {
    if (typeof window === 'undefined') {
        return null;
    }

    return window.matchMedia('(prefers-color-scheme: dark)');
};

const handleSystemThemeChange = () => {
    // No-op since we're always in light mode
};

export function initializeTheme() {
    // Always initialize to light mode
    localStorage.setItem('appearance', 'light');
    applyTheme('light');
}

export function useAppearance() {
    const [appearance, setAppearance] = useState<Appearance>('light');

    const updateAppearance = useCallback((mode: Appearance) => {
        // Always force light mode
        setAppearance('light');
        localStorage.setItem('appearance', 'light');
        setCookie('appearance', 'light');
        applyTheme('light');
    }, []);

    useEffect(() => {
        updateAppearance('light');
        return () => mediaQuery()?.removeEventListener('change', handleSystemThemeChange);
    }, [updateAppearance]);

    return { appearance, updateAppearance } as const;
}
