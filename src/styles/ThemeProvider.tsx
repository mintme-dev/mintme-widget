"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { ThemeProvider as StyledThemeProvider } from "styled-components"
import { lightTheme, darkTheme, type Theme } from "./theme"

// Define the type for custom themes
export interface Themes {
  light: Theme
  dark: Theme
}

// Define the type for the theme context
interface ThemeContextType {
  themeMode: "light" | "dark"
  toggleTheme: () => void
  setThemeMode: (mode: "light" | "dark") => void
  theme: Theme
}

// Create the theme context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

// Key for localStorage
const THEME_STORAGE_KEY = "mintme-widget-theme"

// Props for ThemeProvider
interface ThemeProviderProps {
  children: ReactNode
  defaultTheme?: "light" | "dark" | "system"
  themes?: Themes
  forceTheme?: "light" | "dark" // New prop to force a specific theme
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ 
  children, 
  defaultTheme = "dark", 
  themes,
  forceTheme 
}) => {
  // State for theme mode
  const [themeMode, setThemeMode] = useState<"light" | "dark">(defaultTheme === "light" ? "light" : "dark")

  // Effect to initialize the theme correctly
  useEffect(() => {
    // If forceTheme is provided, we use it directly
    if (forceTheme) {
      console.log("Forcing theme to:", forceTheme)
      setThemeMode(forceTheme)
      return
    }

    // @to-do add persistence
    // const savedTheme = false; // localStorage.getItem(THEME_STORAGE_KEY)
    // if (savedTheme === "light" || savedTheme === "dark") {
    //   console.log("Loading theme from localStorage:", savedTheme)
    //   setThemeMode(savedTheme)
    // } else if (defaultTheme === "system") {
    //   const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    //   const systemTheme = prefersDark ? "dark" : "light"
    //   console.log("Using system preference:", systemTheme)
    //   setThemeMode(systemTheme)
    // } else {
    //   console.log("Using default theme:", defaultTheme)
    //   setThemeMode(defaultTheme === "light" ? "light" : "dark")
    // }
  }, [defaultTheme, forceTheme]) // Runs when defaultTheme or forceTheme changes

  // Determine the current theme based on mode and custom themes
  const theme = themeMode === "light" ? themes?.light || lightTheme : themes?.dark || darkTheme

  // Function to toggle between themes
  const toggleTheme = () => {
    // If there's a forceTheme, we don't allow changing the theme
    if (forceTheme) {
      console.log("Theme is forced to:", forceTheme, "- cannot toggle")
      return
    }

    const newTheme = themeMode === "light" ? "dark" : "light"
    console.log("Toggling theme from", themeMode, "to", newTheme)
    setThemeMode(newTheme)
    localStorage.setItem(THEME_STORAGE_KEY, newTheme)
  }

  // Function to set a specific theme
  const setThemeModeHandler = (mode: "light" | "dark") => {
    // If there's a forceTheme, we don't allow changing the theme
    if (forceTheme) {
      console.log("Theme is forced to:", forceTheme, "- cannot change")
      return
    }

    console.log("Setting theme mode to", mode)
    setThemeMode(mode)
    localStorage.setItem(THEME_STORAGE_KEY, mode)
  }

  // Context value
  const contextValue = {
    themeMode,
    toggleTheme,
    setThemeMode: setThemeModeHandler,
    theme,
  }

  return (
    <ThemeContext.Provider value={contextValue}>
      <StyledThemeProvider theme={theme}>{children}</StyledThemeProvider>
    </ThemeContext.Provider>
  )
}

// Custom hook to use the theme
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}