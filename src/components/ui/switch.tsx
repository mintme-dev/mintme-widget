"use client"

import type React from "react"
import { forwardRef } from "react"
import styled from "styled-components"

// Contenedor principal del switch
const SwitchRoot = styled.button`
  all: unset;
  display: inline-flex;
  align-items: center;
  width: 42px;
  height: 24px;
  background-color: ${({ "data-state": state, theme }) =>
    state === "checked" ? theme.colors.primary : theme.colors.border};
  border-radius: 9999px;
  position: relative;
  box-sizing: border-box;
  cursor: pointer;
  transition: ${({ theme }) => theme.transitions.default};
  
  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.background}, 
                0 0 0 4px ${({ theme }) => theme.colors.primary};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

// Pulgar del switch (la parte que se mueve)
const SwitchThumb = styled.span`
  display: block;
  width: 20px;
  height: 20px;
  background-color: white;
  border-radius: 9999px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 150ms cubic-bezier(0.16, 1, 0.3, 1);
  transform: translateX(${({ "data-state": state }) => (state === "checked" ? "18px" : "2px")});
  will-change: transform;
`

// Radix UI
interface SwitchProps extends React.ComponentPropsWithoutRef<typeof SwitchRoot> {
  checked?: boolean
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
}

// Switch with Radix
export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(
  ({ checked, defaultChecked, onCheckedChange, onChange, ...props }, ref) => {
    // Current state
    const state = checked !== undefined ? (checked ? "checked" : "unchecked") : undefined

    // Change state
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (onChange) onChange(e)
      if (onCheckedChange) onCheckedChange(state !== "checked")
    }

    return (
      <SwitchRoot
        type="button"
        role="switch"
        aria-checked={checked ?? defaultChecked ?? false}
        data-state={state || (defaultChecked ? "checked" : "unchecked")}
        onClick={handleClick}
        ref={ref}
        {...props}
      >
        <SwitchThumb data-state={state || (defaultChecked ? "checked" : "unchecked")} />
      </SwitchRoot>
    )
  },
)

Switch.displayName = "Switch"
