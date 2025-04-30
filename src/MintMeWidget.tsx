"use client"

import { useState, useEffect } from "react"
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base"
import { CompactTokenForm, type TokenData, type TokenCreationResult } from "./components/compact-token-form"
import { WalletAdapter } from "./components/wallet-adapter"
import { ThemeProvider } from "./styles/ThemeProvider"
import { lightTheme, darkTheme } from "./styles/theme"
import { initPinataService } from "./services/pinata-service"
import "./styles.css"
// Añadir esta importación para depuración en desarrollo
// import { ThemeDebugger } from "./components/theme-debugger"

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

// Componente de carga para SSR con estilos que respetan el tema
const LoadingWidget = ({ className = "", isDark = true }: { className?: string; isDark?: boolean }) => (
  <div className={`mintme-widget ${className}`}>
    <div
      style={{
        padding: "1.5rem",
        maxWidth: "28rem",
        margin: "0 auto",
        backgroundColor: isDark ? "#111827" : "#FFFFFF",
        borderRadius: "0.75rem",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
      }}
    >
      <h2
        style={{
          fontSize: "1.25rem",
          fontWeight: "bold",
          color: isDark ? "#F9FAFB" : "#111827",
          marginBottom: "1rem",
        }}
      >
        MintMe Widget
      </h2>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <button
          style={{
            backgroundColor: "#8B5CF6",
            color: "white",
            padding: "0.5rem 1rem",
            borderRadius: "0.375rem",
            border: "none",
            cursor: "pointer",
          }}
        >
          Cargando...
        </button>
      </div>
      <div
        style={{
          marginTop: "1rem",
          padding: "1rem",
          backgroundColor: isDark ? "#1F2937" : "#F9FAFB",
          borderRadius: "0.5rem",
          border: `1px solid ${isDark ? "#374151" : "#E5E7EB"}`,
        }}
      >
        <h3
          style={{
            fontSize: "1.125rem",
            fontWeight: "500",
            color: isDark ? "#F9FAFB" : "#111827",
          }}
        >
          Wallet Info
        </h3>
        <p
          style={{
            marginTop: "0.5rem",
            fontSize: "0.875rem",
            color: isDark ? "#D1D5DB" : "#4B5563",
          }}
        >
          Cargando componentes de wallet...
        </p>
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

  // Determinar el tema a usar basado en las opciones
  const themeToUse = options?.theme || defaultTheme

  useEffect(() => {
    // Marcar que estamos en el cliente
    setIsClient(true)

    // Inicializar el tema en localStorage si se proporciona explícitamente en options
    if (options?.theme) {
      localStorage.setItem("mintme-widget-theme", options.theme)
      console.log("Setting initial theme in localStorage:", options.theme)
    }

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
  }, [pinataConfig, options?.theme])

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

  // Determinar si el tema por defecto es oscuro
  const isDarkTheme =
    themeToUse === "dark" ||
    (themeToUse === "system" &&
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches)

  // Si no estamos en el cliente o no estamos listos, mostramos el componente de carga
  if (!isClient || !isReady) {
    return <LoadingWidget className={className} isDark={isDarkTheme} />
  }

  // Una vez que estamos en el cliente y listos, renderizamos el componente completo
  return (
    <ThemeProvider 
      defaultTheme={themeToUse} 
      themes={{ light: lightTheme, dark: darkTheme }} 
      forceTheme={options?.theme}
    >
      {/* {process.env.NODE_ENV === "development" && <ThemeDebugger />} */}
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
  )
}

export type { TokenData, TokenCreationResult } from "./components/compact-token-form"
export default MintMeWidget