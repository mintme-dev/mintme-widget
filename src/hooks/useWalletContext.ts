"use client"

import { useWallet, useConnection } from "@solana/wallet-adapter-react"

export const useWalletContext = () => {
  try {
    const wallet = useWallet()
    const { connection } = useConnection()
    
    // Verificar si realmente tenemos un contexto válido
    if (wallet && connection) {
      return {
        ...wallet,
        connection,
        hasContext: true,
      }
    }
    
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
  } catch (error) {
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
