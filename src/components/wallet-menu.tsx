"use client"
import { useState } from "react"
import styled from "styled-components"
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

// Componentes estilizados
const WalletButton = styled(Button)`
  border-radius: 9999px;
  height: 2rem;
  width: 2rem;
  padding: 0;
`

const WalletIcon = styled(Wallet)`
  height: 1.25rem;
  width: 1.25rem;
  color: ${({ theme }) => theme.colors.primary};
`

const ScreenReaderOnly = styled.span`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
`

const WalletInfoContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`

const WalletTitle = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  line-height: 1;
  margin: 0;
`

const WalletAddress = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1;
  margin: 0;
`

const MenuItemIcon = styled.span`
  margin-right: 0.5rem;
  display: flex;
  align-items: center;
`

const DisconnectText = styled.span`
  color: ${({ theme }) => theme.colors.error};
`

const CheckIcon = styled(Check)`
  height: 1rem;
  width: 1rem;
  color: ${({ theme }) => theme.colors.success};
`

const CopyIcon = styled(Copy)`
  height: 1rem;
  width: 1rem;
`

const LogOutIcon = styled(LogOut)`
  height: 1rem;
  width: 1rem;
`

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
        <WalletButton variant="ghost">
          <WalletIcon />
          <ScreenReaderOnly>Wallet menu</ScreenReaderOnly>
        </WalletButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" style={{ width: "14rem" }}>
        <DropdownMenuLabel style={{ fontWeight: "normal" }}>
          <WalletInfoContainer>
            <WalletTitle>Connected Wallet</WalletTitle>
            <WalletAddress>{formatAddress(walletAddress)}</WalletAddress>
          </WalletInfoContainer>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={copyToClipboard} style={{ cursor: "pointer" }}>
          <MenuItemIcon>{copied ? <CheckIcon /> : <CopyIcon />}</MenuItemIcon>
          <span>{copied ? "Copied!" : "Copy address"}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDisconnect} style={{ cursor: "pointer" }}>
          <MenuItemIcon>
            <LogOutIcon />
          </MenuItemIcon>
          <DisconnectText>Disconnect</DisconnectText>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
