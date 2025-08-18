"use client"

import type React from "react"
import { useRef, useEffect, useState } from "react"
import type { ThemeColors } from "../styles/themes"
import type { TokenCreationResult } from "../types/index"

interface TransactionOverlayProps {
  isVisible: boolean
  theme: ThemeColors
  logs: string[]
  isCompleted: boolean
  result?: TokenCreationResult | null
  error?: string | null
  cluster: "mainnet-beta" | "testnet" | "devnet"
  onClose: () => void
}

export const TransactionOverlay: React.FC<TransactionOverlayProps> = ({
  isVisible,
  theme,
  logs,
  isCompleted,
  result,
  error,
  cluster,
  onClose,
}) => {
  const logsContainerRef = useRef<HTMLDivElement>(null)
  const [copiedItem, setCopiedItem] = useState<string | null>(null)

  // Auto-scroll hacia abajo cuando se agreguen nuevos logs
  useEffect(() => {
    if (logsContainerRef.current) {
      logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight
    }
  }, [logs])

  if (!isVisible) return null

  const getExplorerUrl = (signature: string, type: "tx" | "token" = "tx") => {
    const baseUrl = "https://explorer.solana.com"
    const clusterParam = cluster === "mainnet-beta" ? "" : `?cluster=${cluster}`

    if (type === "tx") {
      return `${baseUrl}/tx/${signature}${clusterParam}`
    } else {
      return `${baseUrl}/address/${signature}${clusterParam}`
    }
  }

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedItem(type)
      setTimeout(() => setCopiedItem(null), 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
    }
  }

  const overlayStyles: React.CSSProperties = {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: "0.7rem",
    borderRadius: "1rem",
  }

  const modalStyles: React.CSSProperties = {
    backgroundColor: theme.cardBackground,
    borderRadius: "1rem",
    padding: "1.5rem",
    width: "100%",
    maxHeight: "70vh",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    boxShadow: theme.shadow,
    border: `1px solid ${theme.border}`,
  }

  const headerStyles: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "1.5rem",
    paddingBottom: "1rem",
    borderBottom: `1px solid ${theme.border}`,
  }

  const titleStyles: React.CSSProperties = {
    fontSize: "1rem",
    fontWeight: "700",
    color: theme.text,
    margin: 0,
    fontFamily: "system-ui, -apple-system, sans-serif",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  }

  const closeButtonStyles: React.CSSProperties = {
    background: "none",
    border: "none",
    fontSize: "1.5rem",
    cursor: "pointer",
    color: theme.textSecondary,
    padding: "0.25rem",
    borderRadius: "0.25rem",
    display: isCompleted || error ? "block" : "none",
    transition: "color 0.2s ease",
  }

  const logsContainerStyles: React.CSSProperties = {
    flex: 1,
    overflowY: "auto",
    marginBottom: "1.5rem",
    backgroundColor: theme.inputBackground,
    border: `1px solid ${theme.inputBorder}`,
    borderRadius: "0.75rem",
    padding: "1rem",
    fontFamily: "system-ui, -apple-system, sans-serif",
    fontSize: "0.675rem",
    lineHeight: "1.4",
    maxHeight: "150px",
    color: theme.inputText,
  }

  const logItemStyles: React.CSSProperties = {
    marginBottom: "0.5rem",
    color: theme.inputText,
    wordBreak: "break-word",
  }

  const loadingStyles: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    color: theme.textSecondary,
    fontSize: "0.875rem",
    marginTop: "1rem",
    justifyContent: "center",
  }

  const errorContainerStyles: React.CSSProperties = {
    backgroundColor: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: "0.75rem",
    padding: "1rem",
    marginTop: "0rem",
  }

  const successActionsStyles: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
    marginTop: "1rem",
  }

  const actionRowStyles: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    justifyContent: "center",
  }

  const primaryButtonStyles: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    padding: "0.75rem 1.5rem",
    backgroundColor: theme.buttonPrimary,
    color: theme.buttonText,
    textDecoration: "none",
    borderRadius: "0.5rem",
    fontSize: "0.875rem",
    fontWeight: "600",
    transition: "background-color 0.2s ease",
    border: "none",
    cursor: "pointer",
    fontFamily: "system-ui, -apple-system, sans-serif",
    minWidth: "140px",
  }

  const copyButtonStyles: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.25rem",
    padding: "0.5rem",
    backgroundColor: theme.inputBackground,
    color: theme.textSecondary,
    border: `1px solid ${theme.inputBorder}`,
    borderRadius: "0.375rem",
    fontSize: "0.75rem",
    fontWeight: "500",
    transition: "all 0.2s ease",
    cursor: "pointer",
    fontFamily: "system-ui, -apple-system, sans-serif",
    width: "60px",
  }

  const getCopyButtonContent = (type: string) => {
    if (copiedItem === type) {
      return (
        <>
          <span style={{ color: "#10b981" }}>✓</span>
          <span style={{ color: "#10b981", fontSize: "0.7rem" }}>Done</span>
        </>
      )
    }
    return (
      <>
        <span>📋</span>
        <span>Copy</span>
      </>
    )
  }

  return (
    <div style={overlayStyles}>
      <div style={modalStyles}>
        <div style={headerStyles}>
          <h2 style={titleStyles}>
            {error ? (
              <>❌ Transaction Failed</>
            ) : isCompleted ? (
              <>🎉 Token Created Successfully!</>
            ) : (
              <>🔄 Creating Token...</>
            )}
          </h2>
          <span
            style={closeButtonStyles}
            onClick={onClose}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = theme.text
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = theme.textSecondary
            }}
          >
            ✕
          </span>
        </div>

        <div style={logsContainerStyles} ref={logsContainerRef}>
          {logs.map((log, index) => (
            <div key={index} style={logItemStyles}>
              {log}
            </div>
          ))}
          {logs.length === 0 && !error && (
            <div style={{ color: theme.textSecondary, fontStyle: "italic" }}>Initializing transaction...</div>
          )}
        </div>

        {!isCompleted && !error && (
          <div style={loadingStyles}>
            <div
              style={{
                width: "20px",
                height: "20px",
                border: `2px solid ${theme.textSecondary}`,
                borderTop: `2px solid ${theme.buttonPrimary}`,
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
              }}
            />
            Processing transaction...
          </div>
        )}

        {error && (
          <div style={errorContainerStyles}>
            <div style={{ color: "#dc2626", fontWeight: "600", marginBottom: "0.5rem" }}>Error Details:</div>
            <div style={{ color: "#7f1d1d", fontSize: "0.875rem" }}>{error}</div>
          </div>
        )}

        {isCompleted && result && !error && (
          <div style={successActionsStyles}>
            {/* Transaction Row */}
            {result.transactionSignature && (
              <div style={actionRowStyles}>
                <a
                  href={getExplorerUrl(result.transactionSignature, "tx")}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={primaryButtonStyles}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = theme.buttonPrimaryHover
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = theme.buttonPrimary
                  }}
                >
                  🔍 View Transaction
                </a>
                <span
                  style={copyButtonStyles}
                  onClick={() => copyToClipboard(result.transactionSignature!, "tx")}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = theme.cardBackground
                    e.currentTarget.style.borderColor = theme.buttonPrimary
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = theme.inputBackground
                    e.currentTarget.style.borderColor = theme.inputBorder
                  }}
                >
                  {getCopyButtonContent("tx")}
                </span>
              </div>
            )}

            {/* Token Row */}
            {result.tokenAddress && (
              <div style={actionRowStyles}>
                <a
                  href={getExplorerUrl(result.tokenAddress, "token")}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={primaryButtonStyles}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = theme.buttonPrimaryHover
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = theme.buttonPrimary
                  }}
                >
                  🪙 View Token
                </a>
                <span
                  style={copyButtonStyles}
                  onClick={() => copyToClipboard(result.tokenAddress!, "token")}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = theme.cardBackground
                    e.currentTarget.style.borderColor = theme.buttonPrimary
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = theme.inputBackground
                    e.currentTarget.style.borderColor = theme.inputBorder
                  }}
                >
                  {getCopyButtonContent("token")}
                </span>
              </div>
            )}
          </div>
        )}

        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    </div>
  )
}
