/**
 * Tema de React Native Paper
 * Colores consistentes con el frontend web
 */
import { MD3LightTheme } from 'react-native-paper';
import type { MD3Theme } from 'react-native-paper';

// Paleta de colores (igual que el frontend)
export const colors = {
  primary: '#0A2463',      // Azul principal
  secondary: '#F97316',    // Naranja (Secundario)
  dark: '#282525',         // Gris oscuro
  lightBg: '#FFFFFF',      // Blanco
  grayBg: '#F3F6F4',       // Gris sutil para backgrounds
  error: '#d32f2f',
  warning: '#ed6c02',
  info: '#0288d1',
  success: '#2e7d32',
};

// Función helper para oscurecer un color (igual que frontend)
const darkenColor = (color: string, amount: number = 0.1): string => {
  const num = parseInt(color.replace('#', ''), 16);
  const r = Math.max(0, Math.floor((num >> 16) * (1 - amount)));
  const g = Math.max(0, Math.floor(((num >> 8) & 0x00FF) * (1 - amount)));
  const b = Math.max(0, Math.floor((num & 0x0000FF) * (1 - amount)));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
};

// Tema claro (usaremos este por ahora)
// Crear una copia del tema base y solo modificar los colores necesarios
export const lightTheme: MD3Theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary,
    onPrimary: colors.lightBg,
    primaryContainer: darkenColor(colors.primary, 0.1),
    onPrimaryContainer: colors.primary,
    secondary: colors.secondary,
    onSecondary: colors.dark,
    secondaryContainer: darkenColor(colors.secondary, 0.1),
    onSecondaryContainer: colors.secondary,
    tertiary: colors.secondary,
    onTertiary: colors.dark,
    error: colors.error,
    onError: colors.lightBg,
    errorContainer: '#ffebee',
    onErrorContainer: colors.error,
    background: colors.grayBg,
    onBackground: colors.dark,
    surface: colors.lightBg,
    onSurface: colors.dark,
    surfaceVariant: colors.grayBg,
    onSurfaceVariant: '#6b7280',
    outline: '#9ca3af',
    outlineVariant: '#d1d5db',
    shadow: 'rgba(0, 0, 0, 0.2)',
    scrim: 'rgba(0, 0, 0, 0.5)',
    inverseSurface: colors.dark,
    inverseOnSurface: colors.lightBg,
    inversePrimary: colors.primary,
  },
};

