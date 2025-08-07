"use client"

import type React from "react"
import type { Theme, ThemeColors } from "../styles/themes"

interface ThemeToggleProps {
  theme: Theme
  onThemeChange: (theme: Theme) => void
  themeColors: ThemeColors
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ theme, onThemeChange, themeColors }) => {
  const toggleStyles: React.CSSProperties = {
    position: "absolute",
    top: "1rem",
    right: "1rem",
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    border: `1px solid ${themeColors.border}`,
    backgroundColor: themeColors.cardBackground,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
    transition: "all 0.2s ease",
    zIndex: 10,
  }

  return (
    <button
      style={toggleStyles}
      onClick={() => onThemeChange(theme === "light" ? "dark" : "light")}
      title={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = themeColors.inputBackground
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = themeColors.cardBackground
      }}
    >
      {theme === "light" ? "🌙" : "☀️"}
    </button>
  )
}
