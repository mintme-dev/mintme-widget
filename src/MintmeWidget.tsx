"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base"
import { useWallet } from "@solana/wallet-adapter-react"
import { TokenForm } from "./components/TokenForm"
import { WalletContextProvider } from "./components/WalletProvider"
import { themes, getInitialTheme, getSystemTheme } from "./styles/themes"
import type { MintmeWidgetProps, TokenData, TokenCreationResult } from "./types/index"
import packageJson from "../package.json"

const injectWalletStyles = () => {
  if (typeof document === "undefined") return

  const styleId = "mintme-wallet-adapter-styles"
  if (document.getElementById(styleId)) return

  const style = document.createElement("style")
  style.id = styleId
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap');
    .wallet-adapter-button {
        background-color: transparent;
        border: none;
        color: #fff;
        cursor: pointer;
        display: flex;
        align-items: center;
        font-family: 'DM Sans', 'Roboto', 'Helvetica Neue', Helvetica, Arial, sans-serif;
        font-size: 16px;
        font-weight: 600;
        height: 48px;
        line-height: 48px;
        padding: 0 24px;
        border-radius: 4px;
    }

    .wallet-adapter-button-trigger {
        background-color: #512da8;
    }

    .wallet-adapter-button:not([disabled]):focus-visible {
        outline-color: white;
    }

    .wallet-adapter-button:not([disabled]):hover {
        background-color: #1a1f2e;
    }

    .wallet-adapter-button[disabled] {
        background: #404144;
        color: #999;
        cursor: not-allowed;
    }

    .wallet-adapter-button-end-icon,
    .wallet-adapter-button-start-icon,
    .wallet-adapter-button-end-icon img,
    .wallet-adapter-button-start-icon img {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
    }

    .wallet-adapter-button-end-icon {
        margin-left: 12px;
    }

    .wallet-adapter-button-start-icon {
        margin-right: 12px;
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
        display: grid;
        grid-template-rows: 1fr;
        grid-row-gap: 10px;
        padding: 10px;
        top: 100%;
        right: 0;
        margin: 0;
        list-style: none;
        background: #2c2d30;
        border-radius: 10px;
        box-shadow: 0px 8px 20px rgba(0, 0, 0, 0.6);
        opacity: 0;
        visibility: hidden;
        transition: opacity 200ms ease, transform 200ms ease, visibility 200ms;
        font-family: 'DM Sans', 'Roboto', 'Helvetica Neue', Helvetica, Arial, sans-serif;
    }

    .wallet-adapter-dropdown-list-active {
        opacity: 1;
        visibility: visible;
        transform: translateY(10px);
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
        padding: 0 20px;
        width: 100%;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 600;
        height: 37px;
        color: #fff;
    }

    .wallet-adapter-dropdown-list-item:not([disabled]):hover {
        background-color: #1a1f2e;
    }

    .wallet-adapter-modal-collapse-button svg {
        align-self: center;
        fill: #999;
    }

    .wallet-adapter-modal-collapse-button.wallet-adapter-modal-collapse-button-active svg {
        transform: rotate(180deg);
        transition: transform ease-in 150ms;
    }

    .wallet-adapter-modal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        opacity: 0;
        transition: opacity linear 150ms;
        background: rgba(0, 0, 0, 0.5);
        z-index: 1040;
        overflow-y: auto;
    }

    .wallet-adapter-modal.wallet-adapter-modal-fade-in {
        opacity: 1;
    }

    .wallet-adapter-modal-button-close {
        display: flex;
        align-items: center;
        justify-content: center;
        position: absolute;
        top: 18px;
        right: 18px;
        padding: 12px;
        cursor: pointer;
        background: #1a1f2e;
        border: none;
        border-radius: 50%;
    }

    .wallet-adapter-modal-button-close:focus-visible {
        outline-color: white;
    }

    .wallet-adapter-modal-button-close svg {
        fill: #777;
        transition: fill 200ms ease 0s;
    }

    .wallet-adapter-modal-button-close:hover svg {
        fill: #fff;
    }

    .wallet-adapter-modal-overlay {
        background: rgba(0, 0, 0, 0.5);
        position: fixed;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
    }

    .wallet-adapter-modal-container {
        display: flex;
        margin: 3rem;
        min-height: calc(100vh - 6rem); /* 100vh - 2 * margin */
        align-items: center;
        justify-content: center;
    }

    @media (max-width: 480px) {
        .wallet-adapter-modal-container {
            margin: 1rem;
            min-height: calc(100vh - 2rem); /* 100vh - 2 * margin */
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
        background: #10141f;
        box-shadow: 0px 8px 20px rgba(0, 0, 0, 0.6);
        font-family: 'DM Sans', 'Roboto', 'Helvetica Neue', Helvetica, Arial, sans-serif;
        flex: 1;
    }

    .wallet-adapter-modal-wrapper .wallet-adapter-button {
        width: 100%;
    }

    .wallet-adapter-modal-title {
        font-weight: 500;
        font-size: 24px;
        line-height: 36px;
        margin: 0;
        padding: 64px 48px 48px 48px;
        text-align: center;
        color: #fff;
    }

    @media (max-width: 374px) {
        .wallet-adapter-modal-title {
            font-size: 18px;
        }
    }

    .wallet-adapter-modal-list {
        margin: 0 0 12px 0;
        padding: 0;
        width: 100%;
        list-style: none;
    }

    .wallet-adapter-modal-list .wallet-adapter-button {
        font-weight: 400;
        border-radius: 0;
        font-size: 18px;
    }

    .wallet-adapter-modal-list .wallet-adapter-button-end-icon,
    .wallet-adapter-modal-list .wallet-adapter-button-start-icon,
    .wallet-adapter-modal-list .wallet-adapter-button-end-icon img,
    .wallet-adapter-modal-list .wallet-adapter-button-start-icon img {
        width: 28px;
        height: 28px;
    }

    .wallet-adapter-modal-list .wallet-adapter-button span {
        margin-left: auto;
        font-size: 14px;
        opacity: .6;
    }

    .wallet-adapter-modal-list-more {
        cursor: pointer;
        border: none;
        padding: 12px 24px 24px 12px;
        align-self: flex-end;
        display: flex;
        align-items: center;
        background-color: transparent;
        color: #fff;
    }

    .wallet-adapter-modal-list-more svg {
        transition: all 0.1s ease;
        fill: rgba(255, 255, 255, 1);
        margin-left: 0.5rem;
    }

    .wallet-adapter-modal-list-more-icon-rotate {
        transform: rotate(180deg);
    }

    .wallet-adapter-modal-middle {
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 0 24px 24px 24px;
        box-sizing: border-box;
    }

    .wallet-adapter-modal-middle-button {
        display: block;
        cursor: pointer;
        margin-top: 48px;
        width: 100%;
        background-color: #512da8;
        padding: 12px;
        font-size: 18px;
        border: none;
        border-radius: 8px;
        color: #fff;
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
    injectWalletStyles()
  }, [])

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
            Powered by Mintme.dev / v{packageJson.version}
          </a>
        </div>
      )}

      <div
        style={{
          position: "absolute",
          bottom: "0.2rem",
          left: "0.2rem",
          fontSize: "0.65rem",
          color: themeColors.textSecondary,
          opacity: 0.4,
          fontFamily: "monospace",
          pointerEvents: "none",
          userSelect: "none",
        }}
      >
        v{packageJson.version}
      </div>

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
