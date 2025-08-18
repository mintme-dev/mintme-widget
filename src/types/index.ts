import type React from "react"
import type { WalletAdapterNetwork } from "@solana/wallet-adapter-base"

export interface PinataConfig {
  apiKey: string // JWT token for Pinata
  apiSecret?: string // Optional, for backward compatibility
  gateway?: string // Custom gateway, defaults to "gateway.pinata.cloud"
}

export interface PinataUploadResult {
  url: string // Complete IPFS URL
  id: string // Pinata ID to be able to delete the file
  hash: string // IPFS hash
}

export interface TokenData {
  tokenName: string
  tokenSymbol: string
  decimals: number
  initialSupply: string
  projectWebsite: string
  description: string
  revokeMintAuthority: boolean
  revokeFreezeAuthority: boolean
  imageFile?: File | null
  ipfsImageUrl?: string | null
  ipfsImageId?: string | null // Pinata ID for the image
  ipfsMetadataId?: string | null // Pinata ID for the metadata
}

export interface TokenCreationResult {
  transactionSignature?: string
  tokenAddress?: string
  metadataUri?: string // Metadata URL on IPFS
}

export type Theme = "light" | "dark" | "system"

export interface MintmeWidgetProps {
  onSubmit?: (tokenData: TokenData, result: TokenCreationResult) => void
  onLog?: (message: string) => void // Logger prop
  cluster?: "mainnet-beta" | "testnet" | "devnet"
  endpoint?: string // Custom RPC endpoint
  pinataConfig?: PinataConfig
  partnerWallet?: string
  partnerAmount?: number
  defaultTheme?: Theme
  options?: {
    showCredit?: boolean
  }
  className?: string
}

export interface WalletContextManagerProps {
  children: React.ReactNode
  network?: WalletAdapterNetwork
  endpoint?: string
}

// Re-export Mintme types
// export type { MintmeConfig, MintmeResult, MintmeSDK } from "./mintme"
