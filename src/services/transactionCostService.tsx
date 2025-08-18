import type { Connection, PublicKey } from "@solana/web3.js"

export interface TransactionCostBreakdown {
  mintAccountRent: number // Rent para la cuenta del mint
  metadataAccountRent: number // Rent para la cuenta de metadata
  tokenAccountRent: number // Rent para la cuenta de tokens
  transactionFees: number // Fees de transacción
  partnerFee: number // Comisión del partner
  total: number // Total en lamports
  totalSOL: number // Total en SOL
}

/**
 * Calcula el costo estimado de crear un token
 * @param connection Conexión a Solana
 * @param partnerAmount Cantidad de comisión del partner en SOL
 * @returns Desglose de costos estimados
 */
export const estimateTokenCreationCost = async (
  connection: Connection,
  partnerAmount = 0,
): Promise<TransactionCostBreakdown> => {
  try {
    // Obtener el rent mínimo para diferentes tipos de cuentas
    const mintAccountSize = 82 // Tamaño estándar de una cuenta mint
    const metadataAccountSize = 1600 // Tamaño aproximado de metadata (puede variar)
    const tokenAccountSize = 165 // Tamaño estándar de una cuenta de tokens

    // Calcular rent para cada cuenta
    const mintAccountRent = (await connection.getMinimumBalanceForRentExemption(mintAccountSize))*1.5
    const metadataAccountRent = (await connection.getMinimumBalanceForRentExemption(metadataAccountSize))*1.5
    const tokenAccountRent = (await connection.getMinimumBalanceForRentExemption(tokenAccountSize))*1.5

    const transactionFees = 8000 // Base fee para la transacción

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

    // Valores por defecto si no se puede calcular
    const defaultTotal = 15_000_000 // ~0.015 SOL como estimación conservadora
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
 * Formatea un número de lamports a SOL con decimales apropiados
 * @param lamports Cantidad en lamports
 * @returns String formateado en SOL
 */
export const formatLamportsToSOL = (lamports: number): string => {
  const sol = lamports / 1_000_000_000
  return sol.toFixed(6) // 6 decimales para precisión
}

/**
 * Verifica si una wallet tiene suficiente balance para la transacción
 * @param connection Conexión a Solana
 * @param walletPublicKey Clave pública de la wallet
 * @param estimatedCost Costo estimado en lamports
 * @returns Información sobre el balance
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
