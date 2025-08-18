"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import type { ThemeColors } from "../types"
import {
  estimateTokenCreationCost,
  checkWalletBalance,
  formatLamportsToSOL,
  type TransactionCostBreakdown,
} from "../services/transactionCostService"

interface TransactionCostDisplayProps {
  theme: ThemeColors
  partnerAmount?: number
  cluster?: "mainnet-beta" | "testnet" | "devnet"
}

export const TransactionCostDisplay: React.FC<TransactionCostDisplayProps> = ({
  theme,
  partnerAmount = 0,
  cluster = "devnet",
}) => {
  const { connection } = useConnection()
  const { publicKey, connected } = useWallet()
  const [costBreakdown, setCostBreakdown] = useState<TransactionCostBreakdown | null>(null)
  const [walletBalance, setWalletBalance] = useState<{
    balance: number
    balanceSOL: number
    hasEnoughBalance: boolean
    shortfall: number
    shortfallSOL: number
  } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    if (connected && publicKey) {
      loadCostEstimate()
    }
  }, [connected, publicKey, partnerAmount])

  const loadCostEstimate = async () => {
    if (!publicKey) return

    setIsLoading(true)
    try {
      // Calcular costo estimado
      const cost = await estimateTokenCreationCost(connection, partnerAmount)
      setCostBreakdown(cost)

      // Verificar balance de la wallet
      const balance = await checkWalletBalance(connection, publicKey, cost.total)
      setWalletBalance(balance)
    } catch (error) {
      console.error("Error loading cost estimate:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!connected || !costBreakdown) {
    return null
  }

  const containerStyles: React.CSSProperties = {
    backgroundColor: theme.inputBackground,
    border: `1px solid ${theme.inputBorder}`,
    borderRadius: "0.75rem",
    padding: "1rem",
    marginBottom: "1.5rem",
    fontFamily: "system-ui, -apple-system, sans-serif",
  }

  const headerStyles: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "0.75rem",
  }

  const titleStyles: React.CSSProperties = {
    fontSize: "0.875rem",
    fontWeight: "600",
    color: theme.text,
    margin: 0,
  }

  const toggleButtonStyles: React.CSSProperties = {
    background: "none",
    border: "none",
    color: theme.textSecondary,
    cursor: "pointer",
    fontSize: "0.75rem",
    padding: "0.25rem",
    borderRadius: "0.25rem",
    transition: "color 0.2s ease",
  }

  const totalCostStyles: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0.75rem",
    backgroundColor: walletBalance?.hasEnoughBalance ? "#dcfce7" : "#fef2f2",
    border: `1px solid ${walletBalance?.hasEnoughBalance ? "#bbf7d0" : "#fecaca"}`,
    borderRadius: "0.5rem",
    marginBottom: showDetails ? "1rem" : "0",
  }

  const costLabelStyles: React.CSSProperties = {
    fontSize: "0.875rem",
    fontWeight: "500",
    color: walletBalance?.hasEnoughBalance ? "#15803d" : "#dc2626",
  }

  const costValueStyles: React.CSSProperties = {
    fontSize: "0.875rem",
    fontWeight: "600",
    color: walletBalance?.hasEnoughBalance ? "#15803d" : "#dc2626",
    fontFamily: "monospace",
  }

  const detailsStyles: React.CSSProperties = {
    fontSize: "0.75rem",
    color: theme.textSecondary,
    lineHeight: "1.4",
  }

  const detailRowStyles: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "0.5rem",
  }

  const balanceInfoStyles: React.CSSProperties = {
    fontSize: "0.75rem",
    color: theme.textSecondary,
    marginTop: "0.5rem",
    padding: "0.5rem",
    backgroundColor: theme.cardBackground,
    borderRadius: "0.25rem",
  }

  return (
    <div style={containerStyles}>
      <div style={headerStyles}>
        <h3 style={titleStyles}>💰 Transaction Cost</h3>
        <span
          style={toggleButtonStyles}
          onClick={() => setShowDetails(!showDetails)}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = theme.text
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = theme.textSecondary
          }}
        >
          {showDetails ? "Hide Details" : "Show Details"}
        </span>
      </div>

      <div style={totalCostStyles}>
        <span style={costLabelStyles}>Estimated Total Cost:</span>
        <span style={costValueStyles}>{isLoading ? "Calculating..." : `${costBreakdown.totalSOL.toFixed(6)} SOL`}</span>
      </div>

      {showDetails && costBreakdown && (
        <div style={detailsStyles}>
          <div style={detailRowStyles}>
            <span>Mint Token:</span>
            <span>{formatLamportsToSOL(costBreakdown.mintAccountRent+costBreakdown.metadataAccountRent + costBreakdown.tokenAccountRent + costBreakdown.partnerFee)} SOL</span>
          </div>
          <div style={detailRowStyles}>
            <span>Transaction Fees:</span>
            <span>{formatLamportsToSOL(costBreakdown.transactionFees)} SOL</span>
          </div>
        </div>
      )}

      {walletBalance && (
        <div style={balanceInfoStyles}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
            <span>Your Balance:</span>
            <span style={{ fontFamily: "monospace" }}>{walletBalance.balanceSOL.toFixed(6)} SOL</span>
          </div>
          {!walletBalance.hasEnoughBalance && (
            <div style={{ color: "#dc2626", fontSize: "0.75rem" }}>
              ⚠️ Insufficient balance. Need {walletBalance.shortfallSOL.toFixed(6)} SOL more.
              {cluster === "devnet" && (
                <div style={{ marginTop: "0.25rem" }}>
                  Get devnet SOL: <code>solana airdrop 2 {publicKey?.toBase58()}</code>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
