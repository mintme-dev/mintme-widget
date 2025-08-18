"use client"

import type React from "react"
import type { ThemeColors, TokenCreationResult } from "../types"

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
    backgroundColor: theme.cardBackground, // Usar tema dinámico
    borderRadius: "1rem",
    padding: "1.5rem",
    width: "100%",
    maxHeight: "70vh",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    boxShadow: theme.shadow,
    border: `1px solid ${theme.border}`, // Usar borde del tema
  }

  const headerStyles: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "1.5rem",
    paddingBottom: "1rem",
    borderBottom: `1px solid ${theme.border}`, // Usar borde del tema
  }

  const titleStyles: React.CSSProperties = {
    fontSize: "1rem",
    fontWeight: "700",
    color: theme.text, // Usar color de texto del tema
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
    color: theme.textSecondary, // Usar color secundario del tema
    padding: "0.25rem",
    borderRadius: "0.25rem",
    display: isCompleted || error ? "block" : "none",
    transition: "color 0.2s ease",
  }

  const logsContainerStyles: React.CSSProperties = {
    flex: 1,
    overflowY: "auto",
    marginBottom: "1.5rem",
    backgroundColor: theme.inputBackground, // Usar fondo de input del tema
    border: `1px solid ${theme.inputBorder}`, // Usar borde de input del tema
    borderRadius: "0.75rem",
    padding: "1rem",
    fontFamily: "system-ui, -apple-system, sans-serif",
    fontSize: "0.675rem",
    lineHeight: "1.4",
    maxHeight: "150px",
    color: theme.inputText, // Usar color de texto de input del tema
  }

  const logItemStyles: React.CSSProperties = {
    marginBottom: "0.5rem",
    color: theme.inputText, // Usar color de texto del tema
    wordBreak: "break-word",
  }

  const loadingStyles: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    color: theme.textSecondary, // Usar color secundario del tema
    fontSize: "0.875rem",
    marginTop: "1rem",
    justifyContent: "center",
  }

  const successContainerStyles: React.CSSProperties = {
    backgroundColor: "#dcfce7", // Mantener verde claro para éxito
    border: "1px solid #bbf7d0",
    borderRadius: "0.75rem",
    padding: "1rem",
    marginTop: "0rem",
  }

  const errorContainerStyles: React.CSSProperties = {
    backgroundColor: "#fef2f2", // Mantener rojo claro para error
    border: "1px solid #fecaca",
    borderRadius: "0.75rem",
    padding: "1rem",
    marginTop: "0rem",
  }

  const successTitleStyles: React.CSSProperties = {
    color: "#15803d", // Mantener verde para texto de éxito
    fontWeight: "600",
    marginBottom: "1.5rem",
    fontSize: "1rem",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  }

  const labelStyles: React.CSSProperties = {
    color: "#15803d", // Mantener verde para labels de éxito
    fontWeight: "500",
    marginBottom: "0.5rem",
    fontSize: "0.875rem",
  }

  const addressBoxStyles: React.CSSProperties = {
    fontFamily: "monospace",
    fontSize: "0.875rem",
    backgroundColor: theme.inputBackground, // Usar fondo de input del tema
    padding: "0.75rem",
    borderRadius: "0.5rem",
    border: `1px solid ${theme.inputBorder}`, // Usar borde de input del tema
    wordBreak: "break-all",
    margin: "0.5rem 0 1.5rem 0",
    color: theme.inputText, // Usar color de texto de input del tema
    lineHeight: "1.4",
  }

  const buttonsContainerStyles: React.CSSProperties = {
    display: "flex",
    gap: "0.75rem",
    marginTop: "1rem",
  }

  const buttonStyles: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.75rem 1.25rem",
    backgroundColor: theme.buttonPrimary, // Usar color de botón del tema
    color: theme.buttonText, // Usar color de texto de botón del tema
    textDecoration: "none",
    borderRadius: "0.5rem",
    fontSize: "0.675rem",
    fontWeight: "500",
    transition: "background-color 0.2s ease",
    border: "none",
    cursor: "pointer",
    fontFamily: "system-ui, -apple-system, sans-serif",
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
          <button
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
          </button>
        </div>

        <div style={logsContainerStyles}>
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
			<>
				<div style={buttonsContainerStyles}>
					{result.transactionSignature && (
						<a
						href={getExplorerUrl(result.transactionSignature, "tx")}
						target="_blank"
						rel="noopener noreferrer"
						style={buttonStyles}
						onMouseEnter={(e) => {
							e.currentTarget.style.backgroundColor = theme.buttonPrimaryHover
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.backgroundColor = theme.buttonPrimary
						}}
						>
						🔍 View Transaction
						</a>
					)}

					{result.tokenAddress && (
						<a
						href={getExplorerUrl(result.tokenAddress, "token")}
						target="_blank"
						rel="noopener noreferrer"
						style={buttonStyles}
						onMouseEnter={(e) => {
							e.currentTarget.style.backgroundColor = theme.buttonPrimaryHover
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.backgroundColor = theme.buttonPrimary
						}}
						>
						🪙 View Token
						</a>
					)}
					</div>
		  	</>
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
