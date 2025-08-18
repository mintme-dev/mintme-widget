import type { Connection, PublicKey } from "@solana/web3.js"

export interface TransactionCostBreakdown {
  mintAccountRent: number // Rent for the mint account
  metadataAccountRent: number // Rent for the metadata account
  tokenAccountRent: number // Rent for the token account
  transactionFees: number // Transaction fees
  partnerFee: number // Partner commission
  total: number // Total in lamports
  totalSOL: number // Total in SOL
}

/**
 * Estimates the cost of creating a token
 * @param connection Solana connection
 * @param partnerAmount Partner commission in SOL
 * @returns Estimated cost breakdown
 */
export const estimateTokenCreationCost = async (
  connection: Connection,
  partnerAmount = 0,
): Promise<TransactionCostBreakdown> => {
  try {
    // Get minimum rent exemption for different account types
    const mintAccountSize = 82 // Standard mint account size
    const metadataAccountSize = 1600 // Approximate metadata size (may vary)
    const tokenAccountSize = 165 // Standard token account size

    // Calculate rent for each account
    const mintAccountRent = (await connection.getMinimumBalanceForRentExemption(mintAccountSize)) * 1.5
    const metadataAccountRent = (await connection.getMinimumBalanceForRentExemption(metadataAccountSize)) * 1.5
    const tokenAccountRent = (await connection.getMinimumBalanceForRentExemption(tokenAccountSize)) * 1.5

    const transactionFees = 8000 // Base fee for the transaction

    const partnerFee = partnerAmount * 1_000_000_000 // 1 SOL = 1B lamports

    const total = (mintAccountRent + metadataAccountRent + tokenAccountRent + transactionFees + partnerFee)
    const totalSOL = total / 1_000_000_000

    return {
      mintAccountRent,
      metadataAccountRent,
      tokenAccountRent,
      transactionFees,
      partnerFee,
      total,
      totalSOL,
    }
  } catch (error) {
    console.error("Error estimating transaction cost:", error)

    // Default values if estimation fails
    const defaultTotal = 15_000_000 // ~0.015 SOL as a conservative estimate
    return {
      mintAccountRent: 1_461_600, // ~0.0014 SOL
      metadataAccountRent: 5_616_720, // ~0.0056 SOL
      tokenAccountRent: 2_039_280, // ~0.002 SOL
      transactionFees: 5_000,
      partnerFee: partnerAmount * 1_000_000_000,
      total: defaultTotal + partnerAmount * 1_000_000_000,
      totalSOL: (defaultTotal + partnerAmount * 1_000_000_000) / 1_000_000_000,
    }
  }
}

/**
 * Formats lamports into SOL with proper decimals
 * @param lamports Amount in lamports
 * @returns Formatted string in SOL
 */
export const formatLamportsToSOL = (lamports: number): string => {
  const sol = lamports / 1_000_000_000
  return sol.toFixed(6) // 6 decimals for precision
}

/**
 * Checks if a wallet has enough balance for the transaction
 * @param connection Solana connection
 * @param walletPublicKey Wallet public key
 * @param estimatedCost Estimated cost in lamports
 * @returns Balance information
 */
export const checkWalletBalance = async (
  connection: Connection,
  walletPublicKey: PublicKey,
  estimatedCost: number,
): Promise<{
  balance: number
  balanceSOL: number
  hasEnoughBalance: boolean
  shortfall: number
  shortfallSOL: number
}> => {
  try {
    const balance = await connection.getBalance(walletPublicKey)
    const balanceSOL = balance / 1_000_000_000
    const hasEnoughBalance = balance >= estimatedCost
    const shortfall = hasEnoughBalance ? 0 : estimatedCost - balance
    const shortfallSOL = shortfall / 1_000_000_000

    return {
      balance,
      balanceSOL,
      hasEnoughBalance,
      shortfall,
      shortfallSOL,
    }
  } catch (error) {
    console.error("Error checking wallet balance:", error)
    return {
      balance: 0,
      balanceSOL: 0,
      hasEnoughBalance: false,
      shortfall: estimatedCost,
      shortfallSOL: estimatedCost / 1_000_000_000,
    }
  }
}
