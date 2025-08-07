import type React from "react"
import type { WalletAdapterNetwork } from "@solana/wallet-adapter-base"

export interface PinataConfig {
  apiKey: string
  apiSecret: string
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
  imageFile?: File | null // Nuevo campo para el archivo de imagen
  ipfsImageUrl?: string // Nuevo campo para la URL IPFS de la imagen
}

export interface TokenCreationResult {
  transactionSignature?: string
  tokenAddress?: string
  // Puedes añadir más campos aquí según lo que devuelva la creación del token
}

export type Theme = "light" | "dark" | "system"

export interface MintmeWidgetProps {
  onSubmit?: (tokenData: TokenData, result: TokenCreationResult) => void
  cluster?: "mainnet-beta" | "testnet" | "devnet"
  pinataConfig?: PinataConfig // Usamos la interfaz PinataConfig
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
