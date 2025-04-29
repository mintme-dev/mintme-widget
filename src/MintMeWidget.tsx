// @ts-nocheck
"use client"

import { useState, useEffect } from "react"
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base"
import { CompactTokenForm, type TokenData, type TokenCreationResult } from "./components/compact-token-form"
import { WalletAdapter } from "./components/wallet-adapter"
import { ThemeProvider } from "./components/theme-provider"
import { initPinataService } from "./services/pinata-service"
import "./styles.css"

export interface MintMeWidgetProps {
  onSubmit?: (tokenData: TokenData, result: TokenCreationResult) => void
  className?: string
  connection?: string
  network?: WalletAdapterNetwork
  cluster?: "mainnet" | "devnet" | "testnet"
  pinataConfig?: {
    apiKey: string
    apiSecret: string
  }
  partnerWallet?: string
  partnerAmount?: number
  defaultTheme?: "light" | "dark" | "system"
  options?: {
    theme?: "light" | "dark"
    showCredit?: boolean
  }
}

// Componente de carga para SSR
const LoadingWidget = ({ className = "" }: { className?: string }) => (
  <div className={`mintme-widget ${className}`}>
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md">
      <h2 className="text-xl font-bold text-gray-800 mb-4">MintMe Widget</h2>
      <div className="flex justify-center">
        <button className="wallet-button bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded">
          Cargando...
        </button>
      </div>
      <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Wallet Info</h3>
        <p className="mt-2 text-sm text-gray-600">Cargando componentes de wallet...</p>
      </div>
    </div>
  </div>
)

// Componente principal
export const MintMeWidget = ({
  onSubmit,
  className = "",
  connection = "https://api.mainnet-beta.solana.com",
  network,
  cluster = "mainnet",
  pinataConfig = {
    apiKey: "",
    apiSecret: "",
  },
  partnerWallet,
  partnerAmount,
  defaultTheme = "light",
  options = { showCredit: true },
}: MintMeWidgetProps) => {
  const [isClient, setIsClient] = useState(false)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    // Marcar que estamos en el cliente
    setIsClient(true)

    // Initialize Pinata service
    if (pinataConfig.apiKey && pinataConfig.apiSecret) {
      try {
        initPinataService(pinataConfig)
      } catch (error) {
        console.error("Failed to initialize Pinata service:", error)
      }
    }

    // Pequeño retraso para asegurar que todos los componentes estén cargados
    const timer = setTimeout(() => {
      setIsReady(true)
    }, 100)

    return () => clearTimeout(timer)
  }, [pinataConfig.apiKey, pinataConfig.apiSecret])

  // Mapping cluster to network if network is not provided
  const getWalletAdapterNetwork = () => {
    if (network) return network
    
    switch (cluster) {
      case "mainnet":
        return WalletAdapterNetwork.Mainnet
      case "devnet":
        return WalletAdapterNetwork.Devnet
      case "testnet":
        return WalletAdapterNetwork.Testnet
      default:
        return WalletAdapterNetwork.Mainnet
    }
  }

  const handleSubmit = (tokenData: TokenData, result: TokenCreationResult) => {
    if (typeof onSubmit === "function") {
      onSubmit(tokenData, result)
    } else {
      console.log("Token data submitted:", tokenData)
      console.log("Token creation result:", result)
    }
  }

  // Si no estamos en el cliente o no estamos listos, mostramos el componente de carga
  if (!isClient || !isReady) {
    return <LoadingWidget className={className} />
  }

  // Una vez que estamos en el cliente y listos, renderizamos el componente completo
  return (
	// <>xxx</>
    <ThemeProvider defaultTheme={defaultTheme} forcedTheme={options?.theme}>
		<span>xxx RI</span>
		<WalletAdapter network={getWalletAdapterNetwork()} endpoint={connection}>
			<CompactTokenForm
				onSubmit={handleSubmit}
				connection={connection}
				cluster={cluster}
				partnerWallet={partnerWallet}
				partnerAmount={partnerAmount}
				showCredit={options?.showCredit}
			/>
		</WalletAdapter> 
    </ThemeProvider>
        // <div className={`mintme-widget font-sans ${className}`}>
        // </div>
  )
}

export type { TokenData, TokenCreationResult } from "./components/compact-token-form"
export default MintMeWidget