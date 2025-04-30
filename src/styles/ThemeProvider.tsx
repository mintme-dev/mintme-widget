"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { ThemeProvider as StyledThemeProvider } from "styled-components"
import { lightTheme, darkTheme, type Theme } from "./theme"

// Definir el tipo para los temas personalizados
export interface Themes {
  light: Theme
  dark: Theme
}

// Definir el tipo para el contexto del tema
interface ThemeContextType {
  themeMode: "light" | "dark"
  toggleTheme: () => void
  setThemeMode: (mode: "light" | "dark") => void
  theme: Theme
}

// Crear el contexto del tema
const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

// Clave para localStorage
const THEME_STORAGE_KEY = "mintme-widget-theme"

// Props para el ThemeProvider
interface ThemeProviderProps {
  children: ReactNode
  defaultTheme?: "light" | "dark" | "system"
  themes?: Themes
  forceTheme?: "light" | "dark" // Nueva prop para forzar un tema específico
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ 
  children, 
  defaultTheme = "dark", 
  themes,
  forceTheme 
}) => {
  // Estado para el modo del tema
  const [themeMode, setThemeMode] = useState<"light" | "dark">(defaultTheme === "light" ? "light" : "dark")

  // Efecto para inicializar el tema correctamente
  useEffect(() => {
    // Si se proporciona forceTheme, lo usamos directamente
    if (forceTheme) {
      console.log("Forcing theme to:", forceTheme)
      setThemeMode(forceTheme)
      return
    }

    // @to-do add persistense
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
  }, [defaultTheme, forceTheme]) // Se ejecuta cuando cambia defaultTheme o forceTheme

  // Determinar el tema actual basado en el modo y los temas personalizados
  const theme = themeMode === "light" ? themes?.light || lightTheme : themes?.dark || darkTheme

  // Función para alternar entre temas
  const toggleTheme = () => {
    // Si hay un forceTheme, no permitimos cambiar el tema
    if (forceTheme) {
      console.log("Theme is forced to:", forceTheme, "- cannot toggle")
      return
    }

    const newTheme = themeMode === "light" ? "dark" : "light"
    console.log("Toggling theme from", themeMode, "to", newTheme)
    setThemeMode(newTheme)
    localStorage.setItem(THEME_STORAGE_KEY, newTheme)
  }

  // Función para establecer un tema específico
  const setThemeModeHandler = (mode: "light" | "dark") => {
    // Si hay un forceTheme, no permitimos cambiar el tema
    if (forceTheme) {
      console.log("Theme is forced to:", forceTheme, "- cannot change")
      return
    }

    console.log("Setting theme mode to", mode)
    setThemeMode(mode)
    localStorage.setItem(THEME_STORAGE_KEY, mode)
  }

  // Valor del contexto
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

// Hook personalizado para usar el tema
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}