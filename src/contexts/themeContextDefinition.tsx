import { createContext } from 'react';

export type ThemeType = 'light' | 'dark';

export interface ThemeContextType {
  theme: ThemeType;
  toggleTheme: () => void;
}

// Create and export the context
export const ThemeContext = createContext<ThemeContextType | undefined>(
  undefined
);
