"use client"

import type React from "react"
import { useState } from "react"
import { TokenForm } from "./components/TokenForm"
import { ThemeToggle } from "./components/ThemeToggle"
import { WalletContextProvider } from "./components/WalletProvider"
import { useWalletContext } from "./hooks/useWalletContext"
import { themes } from "./styles/themes"
import type { MintmeWidgetProps, TokenFormData, Theme } from "./types"

const MintmeWidgetContent: React.FC<MintmeWidgetProps> = ({
  theme: initialTheme = "dark",
  onSubmit,
  className = "",
}) => {
  const [theme, setTheme] = useState<Theme>(initialTheme)
  const themeColors = themes[theme]

  const handleSubmit = (data: TokenFormData) => {
    console.log("Token creation data:", data)
    onSubmit?.(data)
  }

  const widgetStyles: React.CSSProperties = {
    position: "relative",
    maxWidth: "600px",
    margin: "0 auto",
    padding: "2rem",
    backgroundColor: themeColors.background,
    border: `1px solid ${themeColors.border}`,
    borderRadius: "1rem",
    boxShadow: themeColors.shadow,
    fontFamily: "system-ui, -apple-system, sans-serif",
    color: themeColors.text,
    transition: "all 0.3s ease",
  }

  const headerStyles: React.CSSProperties = {
    marginBottom: "2rem",
    textAlign: "center" as const,
  }

  const titleStyles: React.CSSProperties = {
    fontSize: "2rem",
    fontWeight: "700",
    color: themeColors.text,
    marginBottom: "0.5rem",
    fontFamily: "system-ui, -apple-system, sans-serif",
  }

  const subtitleStyles: React.CSSProperties = {
    fontSize: "1.1rem",
    color: themeColors.textSecondary,
    lineHeight: "1.5",
    fontFamily: "system-ui, -apple-system, sans-serif",
  }

  return (
    <div className={`mintme-widget ${className}`} style={widgetStyles}>
      <ThemeToggle theme={theme} onThemeChange={setTheme} themeColors={themeColors} />

      <div style={headerStyles}>
        <h1 style={titleStyles}>Create a Solana Token</h1>
        <p style={subtitleStyles}>Create your custom token on the Solana blockchain with just a few clicks.</p>
      </div>

      <TokenForm onSubmit={handleSubmit} theme={themeColors} />
    </div>
  )
}

// Componente que maneja si ya existe contexto de wallet o no
const WalletContextManager: React.FC<MintmeWidgetProps & { network?: "mainnet-beta" | "testnet" | "devnet"; endpoint?: string }> = ({ 
  network = "devnet", 
  endpoint,
  ...props 
}) => {
  const existingContext = useWalletContext()

  // Si ya existe un contexto de wallet, usar el existente
  if (existingContext.hasContext) {
    return <MintmeWidgetContent {...props} />
  }

  // Si no existe contexto, crear uno nuevo
  return (
    <WalletContextProvider network={network as any} endpoint={endpoint}>
      <MintmeWidgetContent {...props} />
    </WalletContextProvider>
  )
}

export const MintmeWidget: React.FC<MintmeWidgetProps & { network?: "mainnet-beta" | "testnet" | "devnet"; endpoint?: string }> = (props) => {
  return <WalletContextManager {...props} />
}
