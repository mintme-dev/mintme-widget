"use client"

import { useWallet, useConnection } from "@solana/wallet-adapter-react"

export const useWalletContext = () => {
  try {
    const wallet = useWallet()
    const { connection } = useConnection()
    return {
      ...wallet,
      connection,
      hasContext: true,
    }
  } catch {
    return {
      publicKey: null,
      connected: false,
      connecting: false,
      disconnecting: false,
      wallet: null,
      connection: null,
      hasContext: false,
      connect: () => {},
      disconnect: () => {},
      select: () => {},
    }
  }
}
