"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import type { ThemeColors } from "../styles"
import { estimateTokenCreationCost } from "../services/transactionCostService"
import { CostEstimateOverlay } from "./CostEstimateOverlay"

interface CostEstimateBadgeProps {
  theme: ThemeColors
  partnerAmount?: number
  cluster?: "mainnet-beta" | "testnet" | "devnet"
}

export const CostEstimateBadge: React.FC<CostEstimateBadgeProps> = ({
  theme,
  partnerAmount = 0,
  cluster = "devnet",
}) => {
  const { connection } = useConnection()
  const { publicKey, connected } = useWallet()
  const [estimatedCost, setEstimatedCost] = useState<number | null>(null)
  const [showOverlay, setShowOverlay] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (connected && publicKey) {
      loadEstimate()
    }
  }, [connected, publicKey, partnerAmount])

  const loadEstimate = async () => {
    setIsLoading(true)
    try {
      const cost = await estimateTokenCreationCost(connection, partnerAmount)
      setEstimatedCost(cost.totalSOL)
    } catch (error) {
      console.error("Error loading cost estimate:", error)
      setEstimatedCost(null)
    } finally {
      setIsLoading(false)
    }
  }

  if (!connected || estimatedCost === null) {
    return null
  }

  const badgeStyles: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    fontSize: "0.75rem",
    color: theme.textSecondary,
    marginBottom: "0.5rem",
    fontFamily: "system-ui, -apple-system, sans-serif",
  }

  const detailsLinkStyles: React.CSSProperties = {
    color: theme.buttonPrimary,
    cursor: "pointer",
    textDecoration: "underline",
    transition: "color 0.2s ease",
  }

  return (
    <>
      <div style={badgeStyles}>
        <span>Est. cost: ~{isLoading ? "..." : estimatedCost.toFixed(3)} SOL</span>
        <span
          style={detailsLinkStyles}
          onClick={() => setShowOverlay(true)}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = theme.buttonPrimaryHover
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = theme.buttonPrimary
          }}
        >
          (details)
        </span>
      </div>

      <CostEstimateOverlay
        isVisible={showOverlay}
        theme={theme}
        partnerAmount={partnerAmount}
        cluster={cluster}
        onClose={() => setShowOverlay(false)}
      />
    </>
  )
}
