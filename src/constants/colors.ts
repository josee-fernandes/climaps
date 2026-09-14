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
    background: '#F4F7FB',
    surface: '#FFFFFF',
    text: '#1A2332',
    textSecondary: '#5C6678',
    primary: '#2563EB',
    border: '#D5DEEB',
    error: '#B42318',
    success: '#2F6F4E',
    backgroundElement: '#E8F0FB',
    backgroundSelected: '#D4E4F8',
  },
  dark: {
    background: '#0F141C',
    surface: '#1A2230',
    text: '#E8EEF6',
    textSecondary: '#A3B0C2',
    primary: '#7AA7F5',
    border: '#2A3548',
    error: '#F97066',
    success: '#7BC49A',
    backgroundElement: '#243044',
    backgroundSelected: '#2E4463',
  },
} as const satisfies Record<ResolvedTheme, ColorTokens>;
