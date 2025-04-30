"use client"

import type React from "react"
import styled from "styled-components"
import { Moon, Sun } from 'lucide-react'
import { useTheme } from "../styles/ThemeProvider"

// Estilizamos el botón con styled-components en lugar de usar clases de Tailwind
const ToggleButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.textSecondary};
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing[1]};
  border-radius: ${({ theme }) => theme.radii.full};
  transition: ${({ theme }) => theme.transitions.default};
  width: 2rem;
  height: 2rem;
  position: relative;
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.backgroundAlt};
    color: ${({ theme }) => theme.colors.text};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

// Estilizamos los iconos
const SunIcon = styled(Sun)<{ isVisible: boolean }>`
  height: 1rem;
  width: 1rem;
  transition: all 0.2s ease;
  opacity: ${({ isVisible }) => (isVisible ? 1 : 0)};
  transform: ${({ isVisible }) => (isVisible ? 'rotate(0) scale(1)' : 'rotate(-90deg) scale(0)')};
  position: ${({ isVisible }) => (isVisible ? 'static' : 'absolute')};
`

const MoonIcon = styled(Moon)<{ isVisible: boolean }>`
  height: 1rem;
  width: 1rem;
  transition: all 0.2s ease;
  opacity: ${({ isVisible }) => (isVisible ? 1 : 0)};
  transform: ${({ isVisible }) => (isVisible ? 'rotate(0) scale(1)' : 'rotate(90deg) scale(0)')};
  position: ${({ isVisible }) => (!isVisible ? 'absolute' : 'static')};
`

export const ThemeToggle: React.FC = () => {
  const { themeMode, toggleTheme } = useTheme()
  
  // use themeMode to determine Icon
  const isDarkMode = themeMode === "dark"

  return (
    <ToggleButton onClick={toggleTheme} aria-label="Toggle theme">
      <SunIcon isVisible={!isDarkMode} />
      <MoonIcon isVisible={isDarkMode} />
      <span className="sr-only">Toggle theme</span>
    </ToggleButton>
  )
}