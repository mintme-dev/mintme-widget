"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"

type Theme = "light" | "dark" | "system"

interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
  forcedTheme?: Theme
}

interface ThemeProviderState {
  theme: Theme
  setTheme: (theme: Theme) => void
  forcedTheme?: Theme
}

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = "light",
  storageKey = "mintme-ui-theme",
  forcedTheme,
  ...props
}: ThemeProviderProps) {
  const [mounted, setMounted] = useState(false)
  const [theme, setTheme] = useState<Theme>(defaultTheme)

  // If there's a forced theme, we use it directly
  const activeTheme = forcedTheme || theme

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !forcedTheme) {
      const storedTheme = localStorage.getItem(storageKey) as Theme
      setTheme(storedTheme || defaultTheme)
    }
  }, [mounted, defaultTheme, storageKey, forcedTheme])

  useEffect(() => {
    if (typeof window !== "undefined") {
      const root = window.document.documentElement

      root.classList.remove("light", "dark")

      if (activeTheme === "system") {
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
        root.classList.add(systemTheme)
        return
      }

      root.classList.add(activeTheme)
    }
  }, [activeTheme])

  const value = {
    theme: activeTheme,
    setTheme: (theme: Theme) => {
      if (forcedTheme) return // Don't allow changes if there's a forced theme

      if (typeof window !== "undefined") {
        localStorage.setItem(storageKey, theme)
      }
      setTheme(theme)
    },
    forcedTheme,
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined) throw new Error("useTheme must be used within a ThemeProvider")

  return context
}