import themeLight from "@/theme/theme.json";
import themeDark from "@/theme/theme-dark.json";

export type Theme = typeof themeLight;
export const theme = themeLight as Theme;
export const themes = { light: themeLight as Theme, dark: themeDark as Theme };
export type ThemeName = keyof typeof themes;

/**
 * Role-keyed CSS variable names. Use via `var(--color-primary)` etc.
 * The actual values are emitted in app/globals.css from theme.json.
 */
export const tokens = {
  color: (role: keyof Theme["colors"]) => `var(--color-${role})`,
  font: (role: keyof Theme["fonts"]) => `var(--font-${role})`,
  radius: (role: keyof Theme["radii"]) => `var(--radius-${role})`,
  space: (role: keyof Theme["spacing"]) => `var(--space-${role})`,
  fontSize: (role: keyof Theme["fontSizes"]) => `var(--text-${role})`,
} as const;
