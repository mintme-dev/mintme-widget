"use client"

import type React from "react"
import { useState } from "react"
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
  min?: number
  max?: number
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
  min,
  max,
}) => {
  const [showTooltip, setShowTooltip] = useState(false)

  const fieldStyles: React.CSSProperties = {
    marginBottom: "0.5rem",
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

  const tooltipContainerStyles: React.CSSProperties = {
    position: "relative",
    display: "inline-block",
  }

  const tooltipStyles: React.CSSProperties = {
    position: "absolute",
    bottom: "calc(100% + 8px)",
    left: "50%",
    transform: "translateX(-50%)",
    backgroundColor: theme.cardBackground,
    color: theme.text,
    padding: "0.5rem 0.75rem",
    borderRadius: "0.5rem",
    fontSize: "0.75rem",
    whiteSpace: "nowrap",
    boxShadow: theme.shadow,
    border: `1px solid ${theme.border}`,
    zIndex: 1000,
    opacity: showTooltip ? 1 : 0,
    visibility: showTooltip ? "visible" : "hidden",
    transition: "opacity 0.2s ease, visibility 0.2s ease",
    fontFamily: "system-ui, -apple-system, sans-serif",
    lineHeight: "1.3",
    maxWidth: "200px",
  }

  const tooltipArrowStyles: React.CSSProperties = {
    position: "absolute",
    top: "100%",
    left: "50%",
    transform: "translateX(-50%)",
    width: 0,
    height: 0,
    borderLeft: "6px solid transparent",
    borderRight: "6px solid transparent",
    borderTop: `6px solid ${theme.border}`,
  }

  const tooltipArrowInnerStyles: React.CSSProperties = {
    position: "absolute",
    top: "-7px",
    left: "50%",
    transform: "translateX(-50%)",
    width: 0,
    height: 0,
    borderLeft: "5px solid transparent",
    borderRight: "5px solid transparent",
    borderTop: `5px solid ${theme.cardBackground}`,
  }

  const handleChange = (newValue: string) => {
    if (type === "url" && newValue && !newValue.startsWith("http://") && !newValue.startsWith("https://")) {
      onChange(`https://${newValue}`)
    } else {
      onChange(newValue)
    }
  }

  return (
    <div style={fieldStyles}>
      <label style={labelStyles}>
        {label}
        {required && <span style={{ color: "#ef4444" }}>*</span>}
        {tooltip && (
          <div style={tooltipContainerStyles}>
            <div
              style={{
                width: "13px",
                height: "13px",
                borderRadius: "50%",
                backgroundColor: theme.textSecondary,
                color: theme.background,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "10px",
                fontWeight: "bold",
                cursor: "help",
                transition: "background-color 0.2s ease",
              }}
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
            >
              i
            </div>
            <div style={tooltipStyles}>
              {tooltip}
              <div style={tooltipArrowStyles}>
                <div style={tooltipArrowInnerStyles} />
              </div>
            </div>
          </div>
        )}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        style={inputStyles}
        max={max || (type === "number" ? "18446744073709551615" : undefined)}
        min={min}
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
