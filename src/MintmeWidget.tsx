"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base"
import { TokenForm } from "./components/TokenForm"
import { ThemeToggle } from "./components/ThemeToggle"
import { WalletContextProvider } from "./components/WalletProvider"
import { themes, getInitialTheme, getSystemTheme } from "./styles/themes"
import type { MintmeWidgetProps, TokenData, TokenCreationResult, Theme } from "./types"

const MintmeWidgetContent: React.FC<MintmeWidgetProps> = ({
  defaultTheme = "dark",
  onSubmit,
  className = "",
  pinataConfig,
  partnerWallet,
  partnerAmount,
  options,
}) => {
  const [currentTheme, setCurrentTheme] = useState<"light" | "dark">(() => getInitialTheme(defaultTheme))

  useEffect(() => {
    if (defaultTheme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
      const handleChange = () => setCurrentTheme(getSystemTheme())
      mediaQuery.addEventListener("change", handleChange)
      return () => mediaQuery.removeEventListener("change", handleChange)
    }
  }, [defaultTheme])

  const themeColors = themes[currentTheme]

  const handleSubmit = (data: TokenData, result: TokenCreationResult) => { // Ahora recibe 'result'
    console.log("Token creation data:", data)
    console.log("Token creation result (including metadataUri):", result)
    // Aquí iría la lógica para crear el token en Solana
    // Por ahora, solo un placeholder para el resultado
    const finalResult: TokenCreationResult = {
      transactionSignature: "mock_tx_signature_123",
      tokenAddress: "mock_token_address_abc",
      metadataUri: result.metadataUri, // Pasa el metadataUri generado
    }
    onSubmit?.(data, finalResult)
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
      <ThemeToggle theme={currentTheme} onThemeChange={setCurrentTheme} themeColors={themeColors} />

      <div style={headerStyles}>
        <h1 style={titleStyles}>Create a Solana Token</h1>
        <p style={subtitleStyles}>Create your custom token on the Solana blockchain with just a few clicks.</p>
      </div>

      <TokenForm onSubmit={handleSubmit} theme={themeColors} pinataConfig={pinataConfig} />
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
  cluster = "devnet",
  ...props
}) => {
  const solanaNetwork = (cluster: string): WalletAdapterNetwork => {
    switch (cluster) {
      case "mainnet-beta":
        return WalletAdapterNetwork.Mainnet
      case "testnet":
        return WalletAdapterNetwork.Testnet
      case "devnet":
        return WalletAdapterNetwork.Devnet
      default:
        return WalletAdapterNetwork.Devnet
    }
  }

  return (
    <WalletContextProvider network={solanaNetwork(cluster)}>
      <MintmeWidgetContent {...props} cluster={cluster} />
    </WalletContextProvider>
  )
}
