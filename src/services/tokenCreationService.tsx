import type { Connection } from "@solana/web3.js"
import type { WalletContextState } from "@solana/wallet-adapter-react"
import type { TokenData, TokenCreationResult } from "../types/index"
import type { CreateTokenOptions, CreateTokenResult } from "../types/mintme"
import { createToken } from "mintme-sdk"

type LogCallback = (message: string) => void

/**
 * Creates a payer object compatible with Mintme SDK from a connected wallet
 * @param walletContext Wallet context from useWallet() hook
 * @returns Payer object compatible with SDK
 */
const getPayerFromWallet = (walletContext: WalletContextState) => {
  if (!walletContext.connected || !walletContext.publicKey || !walletContext.wallet?.adapter) {
    throw new Error("Wallet is not connected or adapter is not available")
  }

  // Verify that the adapter has the necessary methods
  if (!walletContext.signTransaction) {
    throw new Error("Wallet adapter does not support signing transactions")
  }

  // Create payer object compatible with SDK
  const payer = {
    publicKey: walletContext.publicKey,
    signTransaction: walletContext.signTransaction.bind(walletContext.wallet.adapter),
    signAllTransactions: walletContext.signAllTransactions?.bind(walletContext.wallet.adapter),
  }

  return payer
}

/**
 * Converts initial supply considering decimals
 * @param initialSupply Initial supply as string
 * @param decimals Number of decimals
 * @returns Supply in smallest unit
 */
const convertInitialSupply = (initialSupply: string, decimals: number): string => {
  try {
    // Remove commas and spaces from input
    const cleanSupply = initialSupply.replace(/[,\s]/g, "")

    // Validate that it's a valid number
    if (!/^\d+(\.\d+)?$/.test(cleanSupply)) {
      throw new Error("Invalid supply format")
    }

    const supplyNumber = Number.parseFloat(cleanSupply)

    // Validate that it's not negative or zero
    if (supplyNumber <= 0) {
      throw new Error("Supply must be greater than 0")
    }

    // Validate that it doesn't exceed JavaScript's safe number maximum
    if (supplyNumber > Number.MAX_SAFE_INTEGER) {
      throw new Error("Supply is too large")
    }

    // Convert to smallest unit (multiply by 10^decimals)
    const multiplier = Math.pow(10, decimals)
    const finalSupply = Math.floor(supplyNumber * multiplier)

    return finalSupply.toString()
  } catch (error) {
    console.error("Error converting initial supply:", error)
    throw new Error(`Invalid initial supply: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

/**
 * Creates a token using the createToken function from Mintme SDK
 * @param tokenData Token data from form
 * @param metadataUri Metadata URI on IPFS
 * @param walletContext Wallet context from useWallet() hook
 * @param connection Solana connection
 * @param cluster Solana network
 * @param partnerWallet Partner wallet (optional)
 * @param partnerAmount Commission amount (optional)
 * @param onLog Callback for logs (optional)
 * @returns Token creation result
 */
export const createTokenWithMintme = async (
  tokenData: TokenData,
  metadataUri: string,
  walletContext: WalletContextState,
  connection: Connection,
  cluster: "devnet" | "testnet" | "mainnet-beta",
  partnerWallet?: string,
  partnerAmount?: number,
  onLog?: LogCallback,
): Promise<TokenCreationResult> => {
  // Validate that wallet is connected
  if (!walletContext.connected || !walletContext.publicKey) {
    throw new Error("Wallet is not connected")
  }

  try {
    // Create payer object compatible with SDK
    const payer = getPayerFromWallet(walletContext)

    // Import createToken function dynamically
    // const { createToken } = await import("mintme-sdk")

    // Convert initial supply considering decimals
    const convertedSupply = convertInitialSupply(tokenData.initialSupply, tokenData.decimals)

    onLog?.(`Converting supply: ${tokenData.initialSupply} tokens = ${convertedSupply} base units`)

    // Prepare options for createToken
    const createTokenOptions: CreateTokenOptions = {
      connection: connection,
      payer: payer,
      name: tokenData.tokenName,
      symbol: tokenData.tokenSymbol,
      uniqueKey: Date.now().toString(),
      decimals: tokenData.decimals,
      initialSupply: convertedSupply, // Use converted supply as string
      uri: metadataUri,
      revokeMint: tokenData.revokeMintAuthority,
      revokeFreeze: tokenData.revokeFreezeAuthority,
      partnerWallet: partnerWallet,
      partnerAmount: partnerAmount ? partnerAmount * 1_000_000_000 : 0,
      logger: (message: string) => {
        console.log(`[Mintme SDK]: ${message}`)
        onLog?.(message) // Send log to callback
      },
    }

    console.log("Creating token with Mintme SDK createToken function:", {
      ...createTokenOptions,
      payer: walletContext.publicKey.toBase58(), // Only show public address in log
      initialSupply: `${tokenData.initialSupply} (${convertedSupply} base units)`,
    })

    // Call createToken function from SDK
    const result: CreateTokenResult = await createToken(createTokenOptions)

    if (result.success && result.txSignature) {
      console.log("Token created successfully:", result)

      return {
        transactionSignature: result.txSignature,
        tokenAddress: result.mint,
        metadataUri: metadataUri,
      }
    } else {
      throw new Error(result.error || "Token creation failed")
    }
  } catch (error: any) {
    console.error("Error creating token with Mintme SDK:", error)

    // Improve specific error handling
    if (error.message?.includes("Invalid initial supply")) {
      throw new Error(
        `Invalid initial supply: ${error.message}. Please check that your supply value is valid and not too large.`,
      )
    } else if (error.message?.includes("insufficient funds")) {
      throw new Error("Insufficient SOL balance to create token. Please add more SOL to your wallet.")
    } else if (error.message?.includes("blockhash")) {
      throw new Error("Network error. Please try again in a few moments.")
    } else if (error.message?.includes("signature")) {
      throw new Error("Transaction was not signed. Please try again.")
    } else if (error.message?.includes("Wallet adapter does not support")) {
      throw new Error("Your wallet does not support the required signing methods. Please try a different wallet.")
    } else {
      throw new Error(`Failed to create token: ${error.message || "Unknown error"}`)
    }
  }
}

/**
 * Validates that wallet has sufficient balance to create a token
 * @param connection Solana connection
 * @param walletPublicKey Wallet public key
 * @param estimatedCost Estimated cost in lamports (optional)
 * @returns true if has sufficient balance
 */
export const validateWalletBalance = async (
  connection: Connection,
  walletPublicKey: string,
  estimatedCost = 5000000, // ~0.005 SOL by default
): Promise<boolean> => {
  try {
    const balance = await connection.getBalance(new (await import("@solana/web3.js")).PublicKey(walletPublicKey))
    return balance >= estimatedCost
  } catch (error) {
    console.warn("Could not validate wallet balance:", error)
    return true // Assume has balance if can't verify
  }
}
