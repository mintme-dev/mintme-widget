import type { Connection, PublicKey, Keypair } from "@solana/web3.js"
// import type { BN } from "@coral-xyz/anchor"

// Types to function createToken SDK Mintme
export interface CreateTokenOptions {
  connection: Connection
  payer: Keypair | any // Wallet or keypair
  name: string
  symbol: string
  uniqueKey: string
  decimals?: number
  initialSupply?: number | string // | BN
  uri?: string
  revokeMint?: boolean
  revokeFreeze?: boolean
  partnerWallet?: string | PublicKey
  partnerAmount?: number | string // | BN
  programId?: string | PublicKey
  idl?: string | object
  logger?: Function
}

export interface CreateTokenResult {
  success: boolean
  txSignature?: string
  mint?: string
  error?: string
}

export interface MintmeSDK {
  createToken: (options: CreateTokenOptions) => Promise<CreateTokenResult>
}
