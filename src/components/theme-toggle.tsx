"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "./theme-provider"
import { Button } from "./ui/button"

export function ThemeToggle() {
  const { theme, setTheme, forcedTheme } = useTheme()

  // If we have a theme will be disabled
  const isDisabled = !!forcedTheme

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className={`rounded-full h-8 w-8 p-0 ${isDisabled ? "hidden opacity-50 cursor-not-allowed" : ""}`}
      disabled={isDisabled}
      title={isDisabled ? "Theme is controlled by configuration" : "Toggle theme"}
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
