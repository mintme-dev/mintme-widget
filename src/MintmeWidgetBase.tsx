"use client"

import { useMemo, useState, useEffect } from "react"
import { ConnectionProvider, WalletProvider, useWallet } from "@solana/wallet-adapter-react"
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base"
import { PhantomWalletAdapter, SolflareWalletAdapter, TorusWalletAdapter } from "@solana/wallet-adapter-wallets"
import { WalletModalProvider, WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import { clusterApiUrl, Connection, LAMPORTS_PER_SOL } from "@solana/web3.js"

// Import CSS styles for wallet UI components
import "@solana/wallet-adapter-react-ui/styles.css"

const WalletContent = () => {
  const { publicKey, connected, disconnect } = useWallet()
  const [balance, setBalance] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  // Fetch wallet balance
  const getBalance = async () => {
    if (!publicKey) return

    setLoading(true)
    try {
      const connection = new Connection(clusterApiUrl(WalletAdapterNetwork.Devnet))
      const balance = await connection.getBalance(publicKey)
      setBalance(balance / LAMPORTS_PER_SOL)
    } catch (error) {
      console.error("Error fetching balance:", error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch balance when wallet is connected
  useEffect(() => {
    if (connected && publicKey) {
      getBalance()
    } else {
      setBalance(null)
    }
  }, [connected, publicKey])

  return (
    <div
      style={{
        border: "2px solid #4F46E5",
        padding: "2rem",
        borderRadius: "12px",
        maxWidth: "500px",
        margin: "20px auto",
        textAlign: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "white",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h2 style={{ margin: "0 0 1rem 0", fontSize: "1.5rem" }}>🚀 V3 Mintme Widget</h2>
      <p style={{ margin: "0 0 1.5rem 0", opacity: 0.9 }}>Connect your Solana wallet to get started</p>

      <div style={{ marginBottom: "1.5rem" }}>
        <WalletMultiButton
          style={{
            backgroundColor: "#10B981",
            borderRadius: "8px",
            fontSize: "16px",
            padding: "12px 24px",
          }}
        />
      </div>

      {connected && publicKey ? (
        <div
          style={{
            background: "rgba(255, 255, 255, 0.1)",
            padding: "1.5rem",
            borderRadius: "8px",
            marginTop: "1rem",
          }}
        >
          <div style={{ marginBottom: "1rem" }}>
            <h3 style={{ margin: "0 0 0.5rem 0", color: "#10B981" }}>✅ Wallet Connected</h3>
            <p
              style={{
                fontSize: "0.9rem",
                wordBreak: "break-all",
                background: "rgba(0, 0, 0, 0.2)",
                padding: "0.5rem",
                borderRadius: "4px",
                margin: "0.5rem 0",
              }}
            >
              {publicKey.toBase58()}
            </p>
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <h4 style={{ margin: "0 0 0.5rem 0" }}>Balance:</h4>
            {loading ? (
              <p>Loading...</p>
            ) : (
              <p
                style={{
                  fontSize: "1.2rem",
                  fontWeight: "bold",
                  color: "#10B981",
                }}
              >
                {balance !== null ? `${balance.toFixed(4)} SOL` : "Error loading balance"}
              </p>
            )}
          </div>

          <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
            <button
              onClick={getBalance}
              disabled={loading}
              style={{
                background: "#3B82F6",
                color: "white",
                border: "none",
                padding: "8px 16px",
                borderRadius: "6px",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? "Refreshing..." : "Refresh Balance"}
            </button>

            <button
              onClick={disconnect}
              style={{
                background: "#EF4444",
                color: "white",
                border: "none",
                padding: "8px 16px",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              Disconnect
            </button>
          </div>
        </div>
      ) : (
        <div
          style={{
            background: "rgba(255, 255, 255, 0.1)",
            padding: "1rem",
            borderRadius: "8px",
            marginTop: "1rem",
          }}
        >
          <p style={{ margin: 0, opacity: 0.8 }}>❌ No wallet connected</p>
          <p style={{ margin: "0.5rem 0 0 0", fontSize: "0.9rem", opacity: 0.7 }}>
            Click on "Select Wallet" to connect your Solana wallet
          </p>
        </div>
      )}
    </div>
  )
}

export const MintmeWidget = () => {
  // Network configuration (you can switch to 'mainnet-beta', 'testnet', or 'devnet')
  const network = WalletAdapterNetwork.Devnet
  const endpoint = useMemo(() => clusterApiUrl(network), [network])

  // Supported wallet configuration
  const wallets = useMemo(
    () => [new PhantomWalletAdapter(), new SolflareWalletAdapter({ network }), new TorusWalletAdapter()],
    [network],
  )

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <WalletContent />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}
