/**
 * Theme Configuration
 * Define all color variables and design tokens for the project
 */

export const theme = {
  colors: {
    // Primary brand color
    primary: "#242F5B", // Deep blue
    primaryLight: "#34427A",
    primaryDark: "#161D3A",

    // Secondary color
    secondary: "#5A6B7C", // Slate gray
    secondaryLight: "#6d7d8d",
    secondaryDark: "#3d4a56",

    // Accent color
    accent: "#EA580E", // Amber orange
    accentLight: "#F07A3A",
    accentDark: "#C2470B",

    // Neutral colors
    white: "#FFFFFF",
    black: "#000000",

    // Background colors
    backgroundLight: "#F5F7FA", // Very light gray
    backgroundDark: "#1F2937", // Dark gray for text

    // Grayscale
    gray50: "#F9FAFB",
    gray100: "#F3F4F6",
    gray200: "#E5E7EB",
    gray300: "#D1D5DB",
    gray400: "#9CA3AF",
    gray500: "#6B7280",
    gray600: "#4B5563",
    gray700: "#374151",
    gray800: "#1F2937",
    gray900: "#111827",

    // Semantic colors
    success: "#10B981", // Green
    error: "#EF4444", // Red
    warning: "#F59E0B", // Amber
    info: "#3B82F6", // Blue
  },

  spacing: {
    xs: "0.5rem",
    sm: "1rem",
    md: "1.5rem",
    lg: "2rem",
    xl: "2.5rem",
    "2xl": "3rem",
    "3xl": "3.5rem",
    "4xl": "4rem",
  },

  borderRadius: {
    none: "0",
    sm: "0.25rem",
    base: "0.375rem",
    md: "0.5rem",
    lg: "0.75rem",
    xl: "1rem",
    "2xl": "1.5rem",
    full: "9999px",
  },

  typography: {
    fontSize: {
      xs: ["0.75rem", { lineHeight: "1rem" }],
      sm: ["0.875rem", { lineHeight: "1.25rem" }],
      base: ["1rem", { lineHeight: "1.5rem" }],
      lg: ["1.125rem", { lineHeight: "1.75rem" }],
      xl: ["1.25rem", { lineHeight: "1.75rem" }],
      "2xl": ["1.5rem", { lineHeight: "2rem" }],
      "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
      "4xl": ["2.25rem", { lineHeight: "2.5rem" }],
      "5xl": ["3rem", { lineHeight: "3.5rem" }],
      "6xl": ["3.75rem", { lineHeight: "1" }],
    },
  },

  shadows: {
    sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    base: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)",
    md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)",
    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)",
    xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
    "2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.15)",
  },

  transitions: {
    fast: "150ms",
    base: "200ms",
    slow: "300ms",
    slower: "500ms",
  },
};

export type Theme = typeof theme;
