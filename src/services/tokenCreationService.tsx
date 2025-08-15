import type { Connection } from "@solana/web3.js"
import type { WalletContextState } from "@solana/wallet-adapter-react"
import type { TokenData, TokenCreationResult } from "../types"
import type { CreateTokenOptions, CreateTokenResult } from "../types/mintme"

/**
 * Crea un objeto payer compatible con el SDK Mintme desde una wallet conectada
 * @param walletContext Contexto de wallet del hook useWallet()
 * @returns Objeto payer compatible con el SDK
 */
const getPayerFromWallet = (walletContext: WalletContextState) => {
  if (!walletContext.connected || !walletContext.publicKey || !walletContext.wallet?.adapter) {
    throw new Error("Wallet is not connected or adapter is not available")
  }

  // Verificar que el adaptador tenga los métodos necesarios
  if (!walletContext.wallet.adapter.signTransaction) {
    throw new Error("Wallet adapter does not support signing transactions")
  }

  // Crear objeto payer compatible con el SDK
  const payer = {
    publicKey: walletContext.publicKey,
    signTransaction: walletContext.wallet.adapter.signTransaction.bind(walletContext.wallet.adapter),
    signAllTransactions: walletContext.wallet.adapter.signAllTransactions?.bind(walletContext.wallet.adapter),
  }

  return payer
}

/**
 * Crea un token usando la función createToken del SDK Mintme
 * @param tokenData Datos del token desde el formulario
 * @param metadataUri URI de los metadatos en IPFS
 * @param walletContext Contexto de wallet del hook useWallet()
 * @param connection Conexión a Solana
 * @param cluster Red de Solana
 * @param partnerWallet Wallet del partner (opcional)
 * @param partnerAmount Cantidad de comisión (opcional)
 * @returns Resultado de la creación del token
 */
export const createTokenWithMintme = async (
  tokenData: TokenData,
  metadataUri: string,
  walletContext: WalletContextState,
  connection: Connection,
  cluster: "devnet" | "testnet" | "mainnet-beta",
  partnerWallet?: string,
  partnerAmount?: number,
): Promise<TokenCreationResult> => {
  // Validar que la wallet esté conectada
  if (!walletContext.connected || !walletContext.publicKey) {
    throw new Error("Wallet is not connected")
  }

  try {
    // Crear el objeto payer compatible con el SDK
    const payer = getPayerFromWallet(walletContext)

    // Importar la función createToken dinámicamente
    const { createToken } = await import("mintme-sdk")

    // Preparar las opciones para createToken
    const createTokenOptions: CreateTokenOptions = {
      connection: connection,
      payer: payer, // Usar el payer compatible
      name: tokenData.tokenName,
      symbol: tokenData.tokenSymbol,
      uniqueKey: Date.now().toString(), // Generar clave única con timestamp
      decimals: tokenData.decimals,
      initialSupply: Number(tokenData.initialSupply), // Convertir string a number
      uri: metadataUri,
      revokeMint: tokenData.revokeMintAuthority,
      revokeFreeze: tokenData.revokeFreezeAuthority,
      partnerWallet: partnerWallet,
      partnerAmount: partnerAmount || 0,
      logger: (message: string) => console.log(`[Mintme SDK]: ${message}`), // Logger personalizado
    }

    console.log("Creating token with Mintme SDK createToken function:", {
      ...createTokenOptions,
      payer: walletContext.publicKey.toBase58(), // Solo mostrar la dirección pública en el log
    })

    // Llamar a la función createToken del SDK
    const result: CreateTokenResult = await createToken(createTokenOptions)

    if (result.success && result.txSignature) {
      console.log("Token created successfully:", result)

      return {
        transactionSignature: result.txSignature,
        tokenAddress: result.tokenAddress, // Si el SDK lo proporciona
        metadataUri: metadataUri,
      }
    } else {
      throw new Error(result.error || "Token creation failed")
    }
  } catch (error: any) {
    console.error("Error creating token with Mintme SDK:", error)

    // Mejorar el manejo de errores específicos
    if (error.message?.includes("insufficient funds")) {
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
 * Valida que la wallet tenga suficiente balance para crear un token
 * @param connection Conexión a Solana
 * @param walletPublicKey Clave pública de la wallet
 * @param estimatedCost Costo estimado en lamports (opcional)
 * @returns true si tiene suficiente balance
 */
export const validateWalletBalance = async (
  connection: Connection,
  walletPublicKey: string,
  estimatedCost = 5000000, // ~0.005 SOL por defecto
): Promise<boolean> => {
  try {
    const balance = await connection.getBalance(new (await import("@solana/web3.js")).PublicKey(walletPublicKey))
    return balance >= estimatedCost
  } catch (error) {
    console.warn("Could not validate wallet balance:", error)
    return true // Asumir que tiene balance si no se puede verificar
  }
}
