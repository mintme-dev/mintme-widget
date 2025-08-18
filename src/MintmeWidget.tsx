"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base"
import { useWallet } from "@solana/wallet-adapter-react"
import { TokenForm } from "./components/TokenForm"
import { WalletContextProvider } from "./components/WalletProvider"
import { themes, getInitialTheme, getSystemTheme } from "./styles/themes"
import type { MintmeWidgetProps, TokenData, TokenCreationResult } from "./types"

const MintmeWidgetContent: React.FC<MintmeWidgetProps> = ({
  defaultTheme = "dark",
  onSubmit,
  className = "",
  pinataConfig,
  partnerWallet,
  partnerAmount,
  options,
  cluster,
}) => {
  const [currentTheme, setCurrentTheme] = useState<"light" | "dark">(() => getInitialTheme(defaultTheme))
  const { connected, publicKey, disconnect } = useWallet()
  const [showWalletTooltip, setShowWalletTooltip] = useState(false)

  useEffect(() => {
    if (defaultTheme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
      const handleChange = () => setCurrentTheme(getSystemTheme())
      mediaQuery.addEventListener("change", handleChange)
      return () => mediaQuery.removeEventListener("change", handleChange)
    }
  }, [defaultTheme])

  const themeColors = themes[currentTheme]

  const handleSubmit = (data: TokenData, result: TokenCreationResult) => {
    console.log("Token creation data:", data)
    console.log("Token creation result:", result)
    onSubmit?.(data, result)
  }

  const formatWalletAddress = (address: string) => {
    return `${address.slice(0, 4)}....${address.slice(-4)}`
  }

  const handleDisconnect = async () => {
    try {
      await disconnect()
      setShowWalletTooltip(false)
    } catch (error) {
      console.error("Error disconnecting wallet:", error)
    }
  }

  const widgetStyles: React.CSSProperties = {
    position: "relative", // Añadir esta línea
    maxWidth: "600px",
    margin: "0 auto",
    padding: "1rem",
    backgroundColor: themeColors.background,
    border: `1px solid ${themeColors.border}`,
    borderRadius: "1rem",
    boxShadow: themeColors.shadow,
    fontFamily: "system-ui, -apple-system, sans-serif",
    color: themeColors.text,
    transition: "all 0.3s ease",
    overflow: "hidden", // Añadir para que el overlay no se salga
  }

  const headerStyles: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "2rem",
    position: "relative",
  }

  const titleStyles: React.CSSProperties = {
    fontSize: "1.1rem",
    fontWeight: "700",
    color: themeColors.text,
    margin: "0",
    textAlign: "center" as const,
    flex: 1,
    fontFamily: "system-ui, -apple-system, sans-serif",
  }

  const controlsStyles: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  }

  const iconButtonStyles: React.CSSProperties = {
    width: "36px",
    height: "36px",
    borderRadius: "0.4rem",
    border: `1px solid ${themeColors.border}`,
    backgroundColor: themeColors.cardBackground,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "16px",
    transition: "all 0.2s ease",
    position: "relative",
  }

  const walletButtonStyles: React.CSSProperties = {
    ...iconButtonStyles,
    width: "auto",
    minWidth: "36px",
    padding: "0 0.75rem",
    fontSize: "12px",
    fontWeight: "600",
    backgroundColor: connected ? themeColors.buttonPrimary : themeColors.cardBackground,
    color: connected ? themeColors.buttonText : themeColors.text,
    border: `1px solid ${connected ? themeColors.buttonPrimary : themeColors.border}`,
  }

  const tooltipStyles: React.CSSProperties = {
    position: "absolute",
    top: "calc(100% + 8px)",
    right: "0",
    backgroundColor: themeColors.cardBackground,
    border: `1px solid ${themeColors.border}`,
    borderRadius: "0.5rem",
    padding: "0.75rem",
    boxShadow: themeColors.shadow,
    zIndex: 1000,
    minWidth: "200px",
    fontSize: "0.875rem",
  }

  const tooltipAddressStyles: React.CSSProperties = {
    fontFamily: "monospace",
    fontSize: "0.75rem",
    color: themeColors.textSecondary,
    wordBreak: "break-all" as const,
    marginBottom: "0.5rem",
  }

  const disconnectButtonStyles: React.CSSProperties = {
    width: "100%",
    padding: "0.5rem",
    fontSize: "0.75rem",
    backgroundColor: "#ef4444",
    color: "white",
    border: "none",
    borderRadius: "0.25rem",
    cursor: "pointer",
    transition: "background-color 0.2s ease",
  }

  return (
    <div className={`mintme-widget ${className}`} style={widgetStyles}>
      <div style={headerStyles}>
        <div style={{ width: "36px" }}></div> {/* Spacer for centering */}
        <h1 style={titleStyles}>Create Solana Token</h1>
        <div style={controlsStyles}>
          {/* Theme Toggle */}
          <button
            style={iconButtonStyles}
            onClick={() => setCurrentTheme(currentTheme === "light" ? "dark" : "light")}
            title={`Switch to ${currentTheme === "light" ? "dark" : "light"} theme`}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = themeColors.inputBackground
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = themeColors.cardBackground
            }}
          >
            {currentTheme === "light" ? "🌙" : "☀️"}
          </button>

          {/* Wallet Info */}
          {connected && publicKey ? (
            <div style={{ position: "relative" }}>
              <button
                className="opacity-100"
                style={walletButtonStyles}
                onClick={() => setShowWalletTooltip(!showWalletTooltip)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = themeColors.buttonPrimaryHover
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = themeColors.buttonPrimary
                }}
              >
                {formatWalletAddress(publicKey.toBase58())}
              </button>

              {showWalletTooltip && (
                <div style={tooltipStyles}>
                  <div style={{ marginBottom: "0.5rem", fontWeight: "600" }}>Connected Wallet</div>
                  <div style={tooltipAddressStyles}>{publicKey.toBase58()}</div>
                  <button
                    style={disconnectButtonStyles}
                    onClick={handleDisconnect}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#dc2626"
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "#ef4444"
                    }}
                  >
                    Disconnect
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ width: "36px" }}></div> // Spacer when not connected
          )}
        </div>
      </div>

      <TokenForm
        onSubmit={handleSubmit}
        theme={themeColors}
        pinataConfig={pinataConfig}
        cluster={cluster}
        partnerWallet={partnerWallet}
        partnerAmount={partnerAmount}
      />

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

      {/* Click outside to close tooltip */}
      {showWalletTooltip && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999,
          }}
          onClick={() => setShowWalletTooltip(false)}
        />
      )}
    </div>
  )
}

export const MintmeWidget: React.FC<MintmeWidgetProps> = ({ cluster = "devnet", ...props }) => {
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
