import React from 'react';
import { MintMeWidget } from "../src"
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base"

function App() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">MintMe Widget Example</h1>
      <MintMeWidget network={WalletAdapterNetwork.Devnet} />
    </div>
  )
}

export default App
