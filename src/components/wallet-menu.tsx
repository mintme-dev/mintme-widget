"use client"

import { useState } from "react"
import { Wallet, Copy, LogOut, Check } from "lucide-react"
import { useWalletStatus } from "./wallet-adapter"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import { Button } from "./ui/button"
import { useWallet } from "@solana/wallet-adapter-react"

export function WalletMenu() {
  const { connected, walletAddress } = useWalletStatus()
  const { disconnect } = useWallet()
  const [copied, setCopied] = useState(false)

  // Copy
  const copyToClipboard = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // Disconnect Wallet
  const handleDisconnect = () => {
    disconnect()
  }

  // If it's disconnected return null
  if (!connected || !walletAddress) {
    return null
  }

  // Format Address
  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 p-0">
          <Wallet className="h-5 w-5 text-purple-500 dark:text-purple-400" />
          <span className="sr-only">Wallet menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">Connected Wallet</p>
            <p className="text-xs leading-none text-muted-foreground">{formatAddress(walletAddress)}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={copyToClipboard} className="cursor-pointer">
          {copied ? <Check className="mr-2 h-4 w-4 text-green-500" /> : <Copy className="mr-2 h-4 w-4" />}
          <span>{copied ? "Copied!" : "Copy address"}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDisconnect} className="cursor-pointer text-red-500 dark:text-red-400">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Disconnect</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
