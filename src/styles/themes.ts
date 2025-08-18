import type { Theme } from "../types/index"

export const themes = {
  light: {
    background: "#ffffff",
    cardBackground: "#f8fafc",
    border: "#e2e8f0",
    text: "#1a202c",
    textSecondary: "#4a5568",
    inputBackground: "#ffffff",
    inputBorder: "#d1d5db",
    inputText: "#374151",
    inputPlaceholder: "#9ca3af",
    buttonPrimary: "#8b5cf6",
    buttonPrimaryHover: "#7c3aed",
    buttonText: "#ffffff",
    checkboxBackground: "#8b5cf6",
    shadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
  },
  dark: {
    background: "#0f172a",
    cardBackground: "#1e293b",
    border: "#334155",
    text: "#f1f5f9",
    textSecondary: "#cbd5e1",
    inputBackground: "#334155",
    inputBorder: "#475569",
    inputText: "#f1f5f9",
    inputPlaceholder: "#94a3b8",
    buttonPrimary: "#8b5cf6",
    buttonPrimaryHover: "#7c3aed",
    buttonText: "#ffffff",
    checkboxBackground: "#8b5cf6",
    shadow: "0 4px 6px -1px rgba(0, 0, 0, 0.3)",
  },
}

export type ThemeColors = typeof themes.light

export const getSystemTheme = (): "light" | "dark" => {
  if (typeof window !== "undefined" && window.matchMedia) {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
  }
  return "dark" // Default a dark si no se puede detectar
}

export const getInitialTheme = (defaultTheme: Theme): "light" | "dark" => {
  if (defaultTheme === "system") {
    return getSystemTheme()
  }
  return defaultTheme
}
