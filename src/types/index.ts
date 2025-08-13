import type React from "react"
import type { WalletAdapterNetwork } from "@solana/wallet-adapter-base"

export interface PinataConfig {
  apiKey: string // JWT token para Pinata
  apiSecret?: string // Opcional, para compatibilidad con versiones anteriores
  gateway?: string // Gateway personalizado, por defecto "gateway.pinata.cloud"
}

export interface TokenData {
  tokenName: string
  tokenSymbol: string
  decimals: number
  initialSupply: string
  projectWebsite: string
  metadataUrl: string
  revokeMintAuthority: boolean
  revokeFreezeAuthority: boolean
  imageFile?: File | null
  ipfsImageUrl?: string
}

export interface TokenCreationResult {
  transactionSignature?: string
  tokenAddress?: string
  metadataUri?: string // URL de los metadatos en IPFS
}

export type Theme = "light" | "dark" | "system"

export interface MintmeWidgetProps {
  onSubmit?: (tokenData: TokenData, result: TokenCreationResult) => void
  cluster?: "mainnet-beta" | "testnet" | "devnet"
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
