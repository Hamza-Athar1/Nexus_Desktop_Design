import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

const ThemeContext = createContext({
  palette: null,
  setThemePalette: () => {},
});

export function ThemeProvider({ children }) {
  const { user } = useAuth();
  const [palette, setPalette] = useState(null);

  // Sync palette from AuthContext user object whenever user changes
  useEffect(() => {
    if (user?.palette) {
      setPalette(user.palette);
    } else {
      setPalette(null);
    }
  }, [user]);

  // Apply CSS custom properties whenever palette changes
  useEffect(() => {
    const root = document.documentElement;
    if (palette && palette.colorPrimary) {
      root.style.setProperty('--color-primary', palette.colorPrimary);
      root.style.setProperty('--color-accent', palette.colorAccent);
      root.style.setProperty('--color-shade', palette.colorShade);
      root.style.setProperty('--color-light', palette.colorLight);
    } else {
      root.style.removeProperty('--color-primary');
      root.style.removeProperty('--color-accent');
      root.style.removeProperty('--color-shade');
      root.style.removeProperty('--color-light');
    }
  }, [palette]);

  const setThemePalette = (newPalette) => {
    setPalette(newPalette);
  };

  return (
    <ThemeContext.Provider value={{ palette, setThemePalette }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
