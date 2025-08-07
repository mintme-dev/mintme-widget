import React from "react";

export interface TokenFormData {
  tokenName: string
  tokenSymbol: string
  decimals: number
  initialSupply: string
  projectWebsite: string
  metadataUrl: string
  revokeMintAuthority: boolean
  revokeFreezeAuthority: boolean
}

export type Theme = "light" | "dark"

export interface MintmeWidgetProps {
  theme?: Theme
  onSubmit?: (data: TokenFormData) => void
  className?: string
}

export interface WalletContextManagerProps {
  children: React.ReactNode
  network?: "mainnet-beta" | "testnet" | "devnet"
  endpoint?: string
}
