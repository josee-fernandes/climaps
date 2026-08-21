export type ResolvedTheme = 'light' | 'dark';

export type ColorTokens = {
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  primary: string;
  border: string;
  error: string;
  success: string;
  backgroundElement: string;
  backgroundSelected: string;
};

export const Colors = {
  light: {
    background: '#F4F8F4',
    surface: '#FFFFFF',
    text: '#1C2B21',
    textSecondary: '#5C6B60',
    primary: '#2F6F4E',
    border: '#D7E3D9',
    error: '#B42318',
    success: '#2F6F4E',
    backgroundElement: '#E7F0E8',
    backgroundSelected: '#D3E6D7',
  },
  dark: {
    background: '#0F1612',
    surface: '#1A2420',
    text: '#EAF2EC',
    textSecondary: '#A3B5A9',
    primary: '#7BC49A',
    border: '#2C3A33',
    error: '#F97066',
    success: '#7BC49A',
    backgroundElement: '#24302A',
    backgroundSelected: '#31463C',
  },
} as const satisfies Record<ResolvedTheme, ColorTokens>;
