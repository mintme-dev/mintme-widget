"use client"

import type React from "react"
import type { ThemeColors } from "../styles/themes"

interface CheckboxFieldProps {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  description?: string
  theme: ThemeColors
}

export const CheckboxField: React.FC<CheckboxFieldProps> = ({ label, checked, onChange, description, theme }) => {
  const containerStyles: React.CSSProperties = {
    marginBottom: "1.5rem",
  }

  const checkboxContainerStyles: React.CSSProperties = {
    display: "flex",
    alignItems: "flex-start",
    gap: "0.75rem",
    cursor: "pointer",
  }

  const checkboxStyles: React.CSSProperties = {
    width: "20px",
    height: "20px",
    borderRadius: "4px",
    border: `2px solid ${checked ? theme.checkboxBackground : theme.inputBorder}`,
    backgroundColor: checked ? theme.checkboxBackground : "transparent",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginTop: "2px",
    transition: "all 0.2s ease",
  }

  const labelStyles: React.CSSProperties = {
    fontSize: "1rem",
    fontWeight: "500",
    color: theme.text,
    marginBottom: "0.25rem",
    fontFamily: "system-ui, -apple-system, sans-serif",
  }

  const descriptionStyles: React.CSSProperties = {
    fontSize: "0.875rem",
    color: theme.textSecondary,
    lineHeight: "1.4",
    fontFamily: "system-ui, -apple-system, sans-serif",
  }

  return (
    <div style={containerStyles}>
      <div style={checkboxContainerStyles} onClick={() => onChange(!checked)}>
        <div style={checkboxStyles}>
          {checked && (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M10 3L4.5 8.5L2 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>
        <div>
          <div style={labelStyles}>{label}</div>
          {description && <div style={descriptionStyles}>{description}</div>}
        </div>
      </div>
    </div>
  )
}
