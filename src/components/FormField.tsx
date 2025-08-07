"use client"

import type React from "react"
import type { ThemeColors } from "../styles/themes"

interface FormFieldProps {
  label: string
  type?: "text" | "number" | "url"
  value: string | number
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
  theme: ThemeColors
  tooltip?: string
  fullWidth?: boolean
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
  theme,
  tooltip,
  fullWidth = false,
}) => {
  const fieldStyles: React.CSSProperties = {
    marginBottom: "1rem",
    width: fullWidth ? "100%" : "calc(50% - 0.5rem)",
  }

  const labelStyles: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    marginBottom: "0.4rem",
    fontSize: "0.8rem",
    fontWeight: "500",
    color: theme.text,
    fontFamily: "system-ui, -apple-system, sans-serif",
  }

  const inputStyles: React.CSSProperties = {
    width: "100%",
    padding: "0.375rem 0.6rem",
    fontSize: "0.8rem",
    backgroundColor: theme.inputBackground,
    border: `1px solid ${theme.inputBorder}`,
    borderRadius: "0.5rem",
    color: theme.inputText,
    outline: "none",
    transition: "border-color 0.2s ease",
    fontFamily: "system-ui, -apple-system, sans-serif",
    boxSizing: "border-box" as const,
  }

  const tooltipStyles: React.CSSProperties = {
    width: "16px",
    height: "16px",
    borderRadius: "50%",
    backgroundColor: theme.textSecondary,
    color: theme.background,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    fontWeight: "bold",
    cursor: "help",
  }

  return (
    <div style={fieldStyles}>
      <label style={labelStyles}>
        {label}
        {required && <span style={{ color: "#ef4444" }}>*</span>}
        {tooltip && (
          <div style={tooltipStyles} title={tooltip}>
            i
          </div>
        )}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={inputStyles}
        onFocus={(e) => {
          e.target.style.borderColor = theme.buttonPrimary
        }}
        onBlur={(e) => {
          e.target.style.borderColor = theme.inputBorder
        }}
      />
    </div>
  )
}
