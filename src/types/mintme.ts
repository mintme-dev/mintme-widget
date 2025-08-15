import type { Connection, PublicKey, Keypair } from "@solana/web3.js"
import type { BN } from "@coral-xyz/anchor"

// Tipos específicos para la función createToken del SDK Mintme
export interface CreateTokenOptions {
  connection: Connection
  payer: Keypair | any // Wallet conectada o keypair
  name: string
  symbol: string
  uniqueKey: string
  decimals?: number
  initialSupply?: number | string | BN
  uri?: string
  revokeMint?: boolean
  revokeFreeze?: boolean
  partnerWallet?: string | PublicKey
  partnerAmount?: number | string | BN
  programId?: string | PublicKey
  idl?: string | object
  logger?: Function
}

export interface CreateTokenResult {
  success: boolean
  txSignature?: string
  tokenAddress?: string
  error?: string
  // Otros campos que pueda retornar el SDK
}

// Función del SDK (para tipado)
export interface MintmeSDK {
  createToken: (options: CreateTokenOptions) => Promise<CreateTokenResult>
}
