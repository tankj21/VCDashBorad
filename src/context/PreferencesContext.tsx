import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

export type Theme = 'dark' | 'light' | 'neon';
export type Currency = 'USD' | 'JPY' | 'EUR';

interface PreferencesContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  exchangeRates: Record<string, number>;
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('theme') as Theme) || 'dark';
  });
  
  const [currency, setCurrency] = useState<Currency>(() => {
    return (localStorage.getItem('currency') as Currency) || 'USD';
  });

  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({
    USD: 1,
    JPY: 150, // Fallback
    EUR: 0.92, // Fallback
  });

  useEffect(() => {
    // Apply theme to document element
    document.documentElement.className = `theme-${theme}`;
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('currency', currency);
  }, [currency]);

  useEffect(() => {
    // Fetch latest exchange rates from a free API
    const fetchRates = async () => {
      try {
        const res = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        const data = await res.json();
        setExchangeRates({
          USD: 1,
          JPY: data.rates.JPY || 150,
          EUR: data.rates.EUR || 0.92,
        });
      } catch (err) {
        console.error('Failed to fetch exchange rates, using fallbacks', err);
      }
    };
    fetchRates();
  }, []);

  return (
    <PreferencesContext.Provider value={{ theme, setTheme, currency, setCurrency, exchangeRates }}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (context === undefined) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return context;
}
