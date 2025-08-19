"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base"
import { useWallet } from "@solana/wallet-adapter-react"
import { TokenForm } from "./components/TokenForm"
import { WalletContextProvider } from "./components/WalletProvider"
import { themes, getInitialTheme, getSystemTheme } from "./styles/themes"
import type { MintmeWidgetProps, TokenData, TokenCreationResult } from "./types/index"

const injectWalletStyles = () => {
  if (typeof document === "undefined") return

  const styleId = "mintme-wallet-adapter-styles"
  if (document.getElementById(styleId)) return

  const style = document.createElement("style")
  style.id = styleId
  style.textContent = `
    /* Wallet Adapter Modal Styles */
    .wallet-adapter-modal-overlay {
      background: rgba(0, 0, 0, 0.8);
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 1040;
      opacity: 0;
      transition: opacity 0.15s linear;
    }

    .wallet-adapter-modal-overlay.wallet-adapter-modal-fade-in {
      opacity: 1;
    }

    .wallet-adapter-modal {
      display: flex;
      align-items: center;
      justify-content: center;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 1050;
      pointer-events: none;
    }

    .wallet-adapter-modal.wallet-adapter-modal-fade-in {
      pointer-events: auto;
    }

    .wallet-adapter-modal-container {
      display: flex;
      margin: 3rem;
      min-height: calc(100% - 6rem);
      align-items: center;
      justify-content: center;
    }

    @media (max-width: 480px) {
      .wallet-adapter-modal-container {
        margin: 1rem;
        min-height: calc(100% - 2rem);
      }
    }

    .wallet-adapter-modal-wrapper {
      box-sizing: border-box;
      position: relative;
      display: flex;
      align-items: center;
      flex-direction: column;
      z-index: 1050;
      max-width: 400px;
      border-radius: 10px;
      background: #2c2d30;
      box-shadow: 0px 8px 20px rgba(0, 0, 0, 0.6);
      font-family: 'DM Sans', 'Roboto', 'Helvetica Neue', Helvetica, Arial, sans-serif;
      flex: 1;
    }

    .wallet-adapter-modal-wrapper .wallet-adapter-modal-title {
      font-weight: 600;
      font-size: 24px;
      line-height: 36px;
      margin: 0;
      padding: 64px 48px 48px 48px;
      text-align: center;
      color: #ffffff;
    }

    @media (max-width: 374px) {
      .wallet-adapter-modal-wrapper .wallet-adapter-modal-title {
        font-size: 18px;
        line-height: 24px;
        padding: 24px 24px;
      }
    }

    .wallet-adapter-modal-wrapper .wallet-adapter-modal-list {
      margin: 0 0 12px 0;
      padding: 0;
      width: 100%;
      list-style: none;
    }

    .wallet-adapter-modal-wrapper .wallet-adapter-modal-list .wallet-adapter-modal-list-more {
      cursor: pointer;
      border: none;
      padding: 24px;
      width: 100%;
      text-align: center;
      background: #1a1a1a;
      color: #ffffff;
      font-size: 14px;
      font-weight: 400;
      line-height: 20px;
      font-family: inherit;
    }

    .wallet-adapter-modal-wrapper .wallet-adapter-modal-list .wallet-adapter-modal-list-more:hover {
      background: #333333;
    }

    .wallet-adapter-modal-wrapper .wallet-adapter-modal-list li {
      display: flex;
      align-items: center;
      border: none;
      padding: 0;
      width: 100%;
    }

    .wallet-adapter-modal-wrapper .wallet-adapter-modal-list li:not(:last-child) {
      border-bottom: 1px solid #404144;
    }

    .wallet-adapter-modal-wrapper .wallet-adapter-modal-list .wallet-adapter-button {
      border: none;
      width: 100%;
      border-radius: 0;
      font-size: 18px;
      font-weight: 600;
      line-height: 26px;
      padding: 20px 24px;
      text-align: left;
      background: transparent;
      color: #ffffff;
      display: flex;
      align-items: center;
      font-family: inherit;
      cursor: pointer;
    }

    .wallet-adapter-modal-wrapper .wallet-adapter-modal-list .wallet-adapter-button:hover {
      background: #333333;
    }

    .wallet-adapter-modal-wrapper .wallet-adapter-modal-list .wallet-adapter-button-start-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 20px;
      margin-right: 16px;
    }

    .wallet-adapter-modal-wrapper .wallet-adapter-modal-list .wallet-adapter-button-start-icon img {
      height: 28px;
      width: 28px;
    }

    .wallet-adapter-modal-wrapper .wallet-adapter-modal-list .wallet-adapter-button-end-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 24px;
      margin-left: auto;
    }

    .wallet-adapter-modal-wrapper .wallet-adapter-modal-middle {
      width: 100%;
      display: flex;
      align-items: center;
      flex-direction: column;
      padding: 0 24px 24px 24px;
    }

    .wallet-adapter-modal-wrapper .wallet-adapter-modal-middle-button {
      display: block;
      cursor: pointer;
      margin-top: 48px;
      width: 100%;
      background: #512da8;
      color: #ffffff;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      line-height: 20px;
      padding: 12px;
      font-family: inherit;
    }

    .wallet-adapter-modal-wrapper .wallet-adapter-modal-middle-button:hover {
      background: #4527a0;
    }

    .wallet-adapter-button {
      background: #512da8;
      border: none;
      border-radius: 6px;
      color: #ffffff;
      cursor: pointer;
      display: flex;
      align-items: center;
      font-family: 'DM Sans', 'Roboto', 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 16px;
      font-weight: 600;
      height: 50px;
      line-height: 20px;
      padding: 0 20px;
      transition: background-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms, box-shadow 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms, border-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms, color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
    }

    .wallet-adapter-button:disabled {
      background: #404144;
      color: #999999;
      cursor: not-allowed;
    }

    .wallet-adapter-button:not(:disabled):hover {
      background: #4527a0;
    }

    .wallet-adapter-button-trigger {
      background: #512da8;
    }

    .wallet-adapter-button-start-icon,
    .wallet-adapter-button-end-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
    }

    .wallet-adapter-button-start-icon {
      margin-right: 8px;
    }

    .wallet-adapter-button-end-icon {
      margin-left: 8px;
    }

    .wallet-adapter-collapse {
      width: 100%;
    }

    .wallet-adapter-dropdown {
      position: relative;
      display: inline-block;
    }

    .wallet-adapter-dropdown-list {
      position: absolute;
      z-index: 99;
      display: flex;
      flex-direction: column;
      top: 100%;
      right: 0;
      margin: 0;
      padding: 0;
      background: #2c2d30;
      border-radius: 10px;
      box-shadow: 0px 8px 20px rgba(0, 0, 0, 0.6);
      list-style: none;
      width: max-content;
    }

    .wallet-adapter-dropdown-list-active {
      transform: scale(1);
      transition: transform 150ms ease;
    }

    .wallet-adapter-dropdown-list-item {
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
      border: none;
      outline: none;
      cursor: pointer;
      white-space: nowrap;
      box-sizing: border-box;
      padding: 20px 24px;
      width: 100%;
      border-radius: 0;
      font-size: 14px;
      font-weight: 600;
      line-height: 20px;
      color: #ffffff;
      background: transparent;
    }

    .wallet-adapter-dropdown-list-item:not(:last-child) {
      border-bottom: 1px solid #404144;
    }

    .wallet-adapter-dropdown-list-item:hover {
      background: #333333;
    }

    .wallet-adapter-dropdown-list-item:first-child {
      border-radius: 10px 10px 0 0;
    }

    .wallet-adapter-dropdown-list-item:last-child {
      border-radius: 0 0 10px 10px;
    }

    .wallet-adapter-dropdown-list-item:first-child:last-child {
      border-radius: 10px;
    }

    /* Light theme overrides */
    @media (prefers-color-scheme: light) {
      .wallet-adapter-modal-wrapper {
        background: #ffffff;
        box-shadow: 0px 8px 20px rgba(0, 0, 0, 0.1);
      }

      .wallet-adapter-modal-wrapper .wallet-adapter-modal-title {
        color: #000000;
      }

      .wallet-adapter-modal-wrapper .wallet-adapter-modal-list .wallet-adapter-button {
        color: #000000;
      }

      .wallet-adapter-modal-wrapper .wallet-adapter-modal-list li:not(:last-child) {
        border-bottom: 1px solid #e5e5e5;
      }

      .wallet-adapter-modal-wrapper .wallet-adapter-modal-list .wallet-adapter-button:hover {
        background: #f5f5f5;
      }

      .wallet-adapter-dropdown-list {
        background: #ffffff;
        box-shadow: 0px 8px 20px rgba(0, 0, 0, 0.1);
      }

      .wallet-adapter-dropdown-list-item {
        color: #000000;
      }

      .wallet-adapter-dropdown-list-item:not(:last-child) {
        border-bottom: 1px solid #e5e5e5;
      }

      .wallet-adapter-dropdown-list-item:hover {
        background: #f5f5f5;
      }
    }
  `

  document.head.appendChild(style)
}

const MintmeWidgetContent: React.FC<MintmeWidgetProps> = ({
  defaultTheme = "dark",
  onSubmit,
  onLog,
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
    position: "relative",
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
    overflow: "hidden",
  }

  const headerStyles: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "0.4rem",
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
        <h1 style={titleStyles}>Create Solana Token</h1>
        <div style={controlsStyles}>
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
            <div style={{ width: "36px" }}></div>
          )}
        </div>
      </div>

      <TokenForm
        onSubmit={handleSubmit}
        onLog={onLog}
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

export const MintmeWidget: React.FC<MintmeWidgetProps> = ({ cluster = "devnet", endpoint, ...props }) => {
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
    <WalletContextProvider network={solanaNetwork(cluster)} endpoint={endpoint}>
      <MintmeWidgetContent {...props} cluster={cluster} />
    </WalletContextProvider>
  )
}
