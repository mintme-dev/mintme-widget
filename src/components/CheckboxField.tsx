"use client"

import type React from "react"
import { useState } from "react"
import type { ThemeColors } from "../styles/themes"

interface CheckboxFieldProps {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  tooltip?: string
  theme: ThemeColors
}

export const CheckboxField: React.FC<CheckboxFieldProps> = ({ label, checked, onChange, tooltip, theme }) => {
  const [showTooltip, setShowTooltip] = useState(false)

  const containerStyles: React.CSSProperties = {
    marginBottom: "1rem",
  }

  const checkboxContainerStyles: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    cursor: "pointer",
  }

  const checkboxStyles: React.CSSProperties = {
    width: "16px",
    height: "16px",
    borderRadius: "4px",
    border: `2px solid ${checked ? theme.checkboxBackground : theme.inputBorder}`,
    backgroundColor: checked ? theme.checkboxBackground : "transparent",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    transition: "all 0.2s ease",
  }

  const labelStyles: React.CSSProperties = {
    fontSize: "0.8rem",
    fontWeight: "500",
    color: theme.text,
    fontFamily: "system-ui, -apple-system, sans-serif",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
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
    boxShadow: theme.shadow,
    border: `1px solid ${theme.border}`,
    zIndex: 1000,
    opacity: showTooltip ? 1 : 0,
    visibility: showTooltip ? "visible" : "hidden",
    transition: "opacity 0.2s ease, visibility 0.2s ease",
    fontFamily: "system-ui, -apple-system, sans-serif",
    lineHeight: "1.3",
    width: "200px",
    whiteSpace: "normal",
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
        <div style={labelStyles}>
          {label}
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
        </div>
      </div>
    </div>
  )
}
