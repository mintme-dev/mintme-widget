import { useMemo, useState, useEffect } from "react"
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base"
import { ConnectionProvider, WalletProvider, useWallet } from "@solana/wallet-adapter-react"
import { WalletModalProvider, WalletMultiButton, useWalletModal } from "@solana/wallet-adapter-react-ui"
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  TorusWalletAdapter,
  LedgerWalletAdapter,
  // SlopeWalletAdapter,
} from "@solana/wallet-adapter-wallets"
import { clusterApiUrl, PublicKey } from "@solana/web3.js"

// Import wallet adapter styles
import "@solana/wallet-adapter-react-ui/styles.css"

interface WalletAdapterProps {
  children: React.ReactNode
  network?: WalletAdapterNetwork
  endpoint?: string
}

export function WalletAdapter({ children, network = WalletAdapterNetwork.Mainnet, endpoint }: WalletAdapterProps) {
  const [isMounted, setIsMounted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Verificar que estamos en el cliente
  useEffect(() => {
    setIsMounted(true)

    // Verificar que las bibliotecas de Solana estén disponibles
    try {
      // Intentar acceder a PublicKey para verificar que la biblioteca está cargada
      // Usamos la importación directa en lugar de require
      new PublicKey("11111111111111111111111111111111")
    } catch (err) {
      console.error("Error loading Solana libraries:", err)
      setError("Failed to load Solana libraries. Please try again later.")
    }
  }, [])

  // You can provide a custom endpoint or use the Solana provided one
  const rpcEndpoint = useMemo(() => {
    try {
      return endpoint || clusterApiUrl(network)
    } catch (err) {
      console.error("Error getting RPC endpoint:", err)
      setError("Failed to get RPC endpoint. Please try again later.")
      return "https://api.mainnet-beta.solana.com" // Fallback
    }
  }, [network, endpoint])

  // Initialize wallet adapters
  const wallets = useMemo(() => {
    try {
      return [
        new PhantomWalletAdapter(),
        new SolflareWalletAdapter(),
        new TorusWalletAdapter(),
        new LedgerWalletAdapter(),
        // new SlopeWalletAdapter(),
      ]
    } catch (err) {
      console.error("Error initializing wallet adapters:", err)
      setError("Failed to initialize wallet adapters. Please try again later.")
      return []
    }
  }, [])

  // Si no estamos en el cliente o hay un error, mostrar un mensaje
  if (!isMounted) {
    return null // No renderizar nada hasta que estemos en el cliente
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-500 rounded-md">
        <p>{error}</p>
      </div>
    )
  }

  // Envolver todo en un try-catch para capturar errores de renderizado
  try {
    return (
      <ConnectionProvider endpoint={rpcEndpoint}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>{children}</WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    )
  } catch (err) {
    console.error("Error rendering wallet components:", err)
    return (
      <div className="p-4 bg-red-50 text-red-500 rounded-md">
        <p>Failed to render wallet components. Please try again later.</p>
      </div>
    )
  }
}

export function WalletConnectButton({ className = "" }: { className?: string }) {
  try {
    return <WalletMultiButton className={`wallet-adapter-button ${className}`} />
  } catch (err) {
    console.error("Error rendering WalletConnectButton:", err)
    return (
      <button className={`bg-purple-500 text-white px-4 py-2 rounded ${className}`} disabled>
        Connect Wallet (Error)
      </button>
    )
  }
}

export function useWalletStatus() {
  const {
    publicKey,
    connected,
    connecting,
    disconnecting,
    wallet: walletAdapter,
    signTransaction,
    signAllTransactions,
  } = useWallet()
  const { setVisible } = useWalletModal()
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (publicKey) {
      try {
        setWalletAddress(publicKey.toBase58())
      } catch (err) {
        console.error("Error converting publicKey to base58:", err)
        setError("Error converting public key to base58")
        setWalletAddress(null)
      }
    } else {
      setWalletAddress(null)
    }
  }, [publicKey])

  // Create a wallet object with the correct structure expected by the SDK
  const wallet = useMemo(() => {
    if (!publicKey) return null

    try {
      return {
        publicKey,
        signTransaction,
        signAllTransactions,
      }
    } catch (err) {
      console.error("Error creating wallet object:", err)
      setError("Error creating wallet object")
      return null
    }
  }, [publicKey, signTransaction, signAllTransactions])

  // Function to open the wallet modal
  const openWalletModal = () => {
    try {
      setVisible(true)
    } catch (err) {
      console.error("Error opening wallet modal:", err)
      setError("Error opening wallet modal")
    }
  }

  return {
    publicKey,
    connected,
    connecting,
    disconnecting,
    walletAdapter, // The original adapter
    wallet, // The correctly structured wallet object
    walletAddress,
    openWalletModal, // New function to open the modal
    error,
  }
}