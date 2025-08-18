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

interface CostEstimateOverlayProps {
  isVisible: boolean
  theme: ThemeColors
  partnerAmount?: number
  cluster?: "mainnet-beta" | "testnet" | "devnet"
  onClose: () => void
}

export const CostEstimateOverlay: React.FC<CostEstimateOverlayProps> = ({
  isVisible,
  theme,
  partnerAmount = 0,
  cluster = "devnet",
  onClose,
}) => {
  const { connection } = useConnection()
  const { publicKey } = useWallet()
  const [costBreakdown, setCostBreakdown] = useState<TransactionCostBreakdown | null>(null)
  const [walletBalance, setWalletBalance] = useState<{
    balance: number
    balanceSOL: number
    hasEnoughBalance: boolean
    shortfall: number
    shortfallSOL: number
  } | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isVisible && publicKey) {
      loadCostEstimate()
    }
  }, [isVisible, publicKey, partnerAmount])

  const loadCostEstimate = async () => {
    if (!publicKey) return

    setIsLoading(true)
    try {
      const cost = await estimateTokenCreationCost(connection, partnerAmount)
      setCostBreakdown(cost)

      const balance = await checkWalletBalance(connection, publicKey, cost.total)
      setWalletBalance(balance)
    } catch (error) {
      console.error("Error loading cost estimate:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isVisible) return null

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
    padding: "1rem",
    borderRadius: "1rem",
  }

  const modalStyles: React.CSSProperties = {
    backgroundColor: theme.cardBackground,
    borderRadius: "1rem",
    padding: "1.5rem",
    width: "100%",
    maxWidth: "400px",
    border: `1px solid ${theme.border}`,
    boxShadow: theme.shadow,
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
    fontSize: "1.1rem",
    fontWeight: "700",
    color: theme.text,
    margin: 0,
    fontFamily: "system-ui, -apple-system, sans-serif",
  }

  const closeButtonStyles: React.CSSProperties = {
    background: "none",
    border: "none",
    fontSize: "1.5rem",
    cursor: "pointer",
    color: theme.textSecondary,
    padding: "0.25rem",
    borderRadius: "0.25rem",
    transition: "color 0.2s ease",
  }

  const detailRowStyles: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "0.75rem",
    fontSize: "0.875rem",
    color: theme.text,
  }

  const totalRowStyles: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "1rem",
    paddingTop: "1rem",
    borderTop: `1px solid ${theme.border}`,
    fontSize: "1rem",
    fontWeight: "600",
    color: theme.text,
  }

  const balanceInfoStyles: React.CSSProperties = {
    fontSize: "0.875rem",
    color: theme.textSecondary,
    marginTop: "1rem",
    padding: "0.75rem",
    backgroundColor: theme.inputBackground,
    borderRadius: "0.5rem",
    border: `1px solid ${theme.inputBorder}`,
  }

  return (
    <div style={overlayStyles}>
      <div style={modalStyles}>
        <div style={headerStyles}>
          <h3 style={titleStyles}>💰 Transaction Cost Estimate</h3>
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

        {isLoading ? (
          <div style={{ textAlign: "center", padding: "2rem", color: theme.textSecondary }}>Calculating costs...</div>
        ) : costBreakdown ? (
          <>
            <div style={detailRowStyles}>
              <span>Token Creation:</span>
              <span style={{ fontFamily: "monospace" }}>
                {formatLamportsToSOL(
                  costBreakdown.mintAccountRent + costBreakdown.metadataAccountRent + costBreakdown.tokenAccountRent + costBreakdown.partnerFee,
                )}{" "}
                SOL
              </span>
            </div>

            <div style={detailRowStyles}>
              <span>Transaction Fees:</span>
              <span style={{ fontFamily: "monospace" }}>{formatLamportsToSOL(costBreakdown.transactionFees)} SOL</span>
            </div>

            <div style={totalRowStyles}>
              <span>Total Estimated Cost:</span>
              <span style={{ fontFamily: "monospace" }}>{costBreakdown.totalSOL.toFixed(6)} SOL</span>
            </div>

            {walletBalance && (
              <div style={balanceInfoStyles}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                  <span>Your Balance:</span>
                  <span style={{ fontFamily: "monospace" }}>{walletBalance.balanceSOL.toFixed(6)} SOL</span>
                </div>
                {!walletBalance.hasEnoughBalance && (
                  <div style={{ color: "#dc2626", fontSize: "0.875rem", marginTop: "0.5rem" }}>
                    ⚠️ Insufficient balance. Need {walletBalance.shortfallSOL.toFixed(6)} SOL more.
                    {cluster === "devnet" && (
                      <div style={{ marginTop: "0.5rem", fontSize: "0.75rem" }}>
                        Get devnet SOL: <code>solana airdrop 2</code>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <div style={{ textAlign: "center", padding: "2rem", color: theme.textSecondary }}>
            Unable to calculate costs
          </div>
        )}
      </div>
    </div>
  )
}
