"use client"

import type React from "react"
import { useMemo, type ReactNode } from "react"
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react"
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base"
import { PhantomWalletAdapter, SolflareWalletAdapter, TorusWalletAdapter } from "@solana/wallet-adapter-wallets"
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui"
import { clusterApiUrl } from "@solana/web3.js"

// Importa los estilos CSS para los componentes de UI de la wallet
import "@solana/wallet-adapter-react-ui/styles.css"

interface WalletContextProviderProps {
  children: ReactNode
  network?: WalletAdapterNetwork
  endpoint?: string
}

export const WalletContextProvider: React.FC<WalletContextProviderProps> = ({
  children,
  network = WalletAdapterNetwork.Devnet,
  endpoint,
}) => {
  const walletEndpoint = endpoint || clusterApiUrl(network)

  const wallets = useMemo(
    () => [new PhantomWalletAdapter(), new SolflareWalletAdapter({ network }), new TorusWalletAdapter()],
    [network],
  )

  return (
    <ConnectionProvider endpoint={walletEndpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}
