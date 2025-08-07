"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base"
import { TokenForm } from "./components/TokenForm"
import { ThemeToggle } from "./components/ThemeToggle"
import { WalletContextProvider } from "./components/WalletProvider"
import { themes, getInitialTheme, getSystemTheme } from "./styles/themes"
import type { MintmeWidgetProps, TokenData, Theme } from "./types"

const MintmeWidgetContent: React.FC<MintmeWidgetProps> = ({
  defaultTheme = "dark", // Usamos defaultTheme
  onSubmit,
  className = "",
  pinataConfig, // Añadido
  partnerWallet, // Añadido
  partnerAmount, // Añadido
  options, // Añadido
}) => {
  const [currentTheme, setCurrentTheme] = useState<"light" | "dark">(() => getInitialTheme(defaultTheme))

  // Efecto para actualizar el tema si la preferencia del sistema cambia
  useEffect(() => {
    if (defaultTheme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
      const handleChange = () => setCurrentTheme(getSystemTheme())
      mediaQuery.addEventListener("change", handleChange)
      return () => mediaQuery.removeEventListener("change", handleChange)
    }
  }, [defaultTheme])

  const themeColors = themes[currentTheme]

  const handleSubmit = (data: TokenData) => {
    console.log("Token creation data:", data)
    // Aquí iría la lógica para crear el token en Solana
    // Por ahora, solo un placeholder para el resultado
    const result: TokenCreationResult = {
      transactionSignature: "mock_tx_signature_123",
      tokenAddress: "mock_token_address_abc",
    }
    onSubmit?.(data, result)
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
    marginBottom: "1rem",
    textAlign: "center" as const,
  }

  const titleStyles: React.CSSProperties = {
    fontSize: "1rem",
    fontWeight: "700",
    color: themeColors.text,
    marginBottom: "0.5rem",
    fontFamily: "system-ui, -apple-system, sans-serif",
  }

  const subtitleStyles: React.CSSProperties = {
    fontSize: "0.8rem",
    color: themeColors.textSecondary,
    lineHeight: "1",
    fontFamily: "system-ui, -apple-system, sans-serif",
  }

  return (
    <div className={`mintme-widget ${className}`} style={widgetStyles}>
      <ThemeToggle theme={currentTheme} onThemeChange={setCurrentTheme} themeColors={themeColors} />

      <div style={headerStyles}>
        <h1 style={titleStyles}>Create a Solana Token</h1>
        <p style={subtitleStyles}>Create your custom token on the Solana blockchain with just a few clicks.</p>
      </div>

      <TokenForm onSubmit={handleSubmit} theme={themeColors} />
      {options?.showCredit && (
        <div style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.8rem", color: themeColors.textSecondary }}>
          <a
            href="https://mintme.dev/?utm_source=widget&utm_medium=widget&utm_campaign=widget"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: themeColors.textSecondary, textDecoration: "none" }}
          >
            Powered by Mintme.dev
          </a>
        </div>
      )}
    </div>
  )
}

export const MintmeWidget: React.FC<MintmeWidgetProps> = ({
  cluster = "devnet", // Default a devnet si no se especifica
  ...props
}) => {
  // Mapear el string 'cluster' a WalletAdapterNetwork
  const solanaNetwork = (cluster: string): WalletAdapterNetwork => {
    switch (cluster) {
      case "mainnet-beta":
        return WalletAdapterNetwork.Mainnet
      case "testnet":
        return WalletAdapterNetwork.Testnet
      case "devnet":
        return WalletAdapterNetwork.Devnet
      default:
        return WalletAdapterNetwork.Devnet // Default a Devnet si no es reconocido
    }
  }

  return (
    <WalletContextProvider network={solanaNetwork(cluster)}>
      <MintmeWidgetContent {...props} cluster={cluster} />
    </WalletContextProvider>
  )
}
