// @ts-nocheck
"use client"
import * as web3 from '@solana/web3.js'; // Importación correcta
import type React from "react"
import { useState, useRef, useEffect, type ChangeEvent } from "react"
import { Info, Upload, X, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "./ui/button"
import { FloatingInput } from "./ui/floating-input"
import { FloatingTextarea } from "./ui/floating-textarea"
import { Label } from "./ui/label"
import { Switch } from "./ui/switch"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip"
import { Alert, AlertDescription } from "./ui/alert"
import { useWalletStatus, WalletConnectButton } from "./wallet-adapter"
import { getPinataService } from "../services/pinata-service"
import { ThemeToggle } from "./theme-toggle"
import { WalletMenu } from "./wallet-menu"
import { createTokenSimple } from "mintme-sdk"

// Constants for Solana token limitations
const MAX_NAME_LENGTH = 32
const MAX_SYMBOL_LENGTH = 10
const MIN_DECIMALS = 0
const MAX_DECIMALS = 9
const MAX_SUPPLY = 18446744073709551615 // u64 max value

// Enhanced URL validation function that allows typing
const isValidUrl = (url: string): boolean => {
  if (!url) return true // Empty URL is valid (not required)

  // If the user is typing, allow the input
  if (url.length < 8) return true // Allow typing at least "http://"

  // Only validate URLs that seem complete
  if (url.includes(".")) {
    try {
      // Try to create a URL object to validate
      const urlObj = new URL(url)
      // Verify that the protocol is http or https
      return urlObj.protocol === "http:" || urlObj.protocol === "https:"
    } catch (e) {
      return false
    }
  }

  return true // Allow typing while there's no dot (incomplete domain)
}

interface TokenFormProps {
  onSubmit?: (tokenData: TokenData, result: TokenCreationResult) => void
  className?: string
  connection?: string
  cluster?: "mainnet" | "devnet" | "testnet"
  partnerWallet?: string
  partnerAmount?: number
  showCredit?: boolean
}

export interface TokenData {
  name: string
  symbol: string
  decimals: number
  supply: number
  image: File | null
  description: string
  url: string
  revokeFreeze: boolean
  revokeMint: boolean
}

export interface TokenCreationResult {
  success: boolean
  txSignature?: string
  error?: string
  tokenAddress?: string
}

enum FormStatus {
  IDLE = "idle",
  UPLOADING_IMAGE = "uploading_image",
  CREATING_TOKEN = "creating_token",
  SUCCESS = "success",
  ERROR = "error",
}

// Interface for log entries
interface LogEntry {
  timestamp: string
  message: string
}

export function CompactTokenForm({
  onSubmit,
  className = "",
  connection = "https://api.mainnet-beta.solana.com",
  cluster = "mainnet",
  partnerWallet = "7viHj1u6aQS9Nmc55FokX3B9NbDJUPwMYQvKgBfWeYXE",
  partnerAmount = 0,
  showCredit = true,
}: TokenFormProps) {
  const [tokenData, setTokenData] = useState<TokenData>({
    name: "",
    symbol: "",
    decimals: 9,
    supply: 1000000000,
    image: null,
    description: "",
    url: "",
    revokeFreeze: false,
    revokeMint: false,
  })

  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [status, setStatus] = useState<FormStatus>(FormStatus.IDLE)
  const [error, setError] = useState<string | null>(null)
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [result, setResult] = useState<TokenCreationResult | null>(null)
  const [estimatedFee, setEstimatedFee] = useState<number | null>(1) // Default estimated fee
  const [showLogs, setShowLogs] = useState<boolean>(false)
  const [urlError, setUrlError] = useState<boolean>(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const logsContainerRef = useRef<HTMLDivElement>(null)
  const { connected, wallet, walletAddress } = useWalletStatus()

  // Effect to keep scroll at the bottom when new logs are added
  useEffect(() => {
    if (logsContainerRef.current) {
      logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight
    }
  }, [logs])

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    // Apply validation based on field
    if (name === "name" && value.length > MAX_NAME_LENGTH) return
    if (name === "symbol" && value.length > MAX_SYMBOL_LENGTH) return
    if (name === "decimals") {
      const decimalValue = Number.parseInt(value)
      if (isNaN(decimalValue) || decimalValue < MIN_DECIMALS || decimalValue > MAX_DECIMALS) return
    }
    if (name === "supply") {
      const supplyValue = Number(value)
      if (isNaN(supplyValue) || supplyValue <= 0 || supplyValue > MAX_SUPPLY) return
    }
    if (name === "description" && value.length > 200) return

    // Update URL error state
    if (name === "url") {
      setUrlError(value !== "" && !isValidUrl(value))
    }

    setTokenData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setTokenData((prev) => ({ ...prev, [name]: checked }))
  }

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    if (!file) return

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    setTokenData((prev) => ({ ...prev, image: file }))
  }

  const handleImageDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0] || null
    if (!file) return

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    setTokenData((prev) => ({ ...prev, image: file }))
  }

  const removeImage = () => {
    setImagePreview(null)
    setTokenData((prev) => ({ ...prev, image: null }))
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const addLog = (log: string) => {
    const now = new Date()
    const timestamp = `${now.toLocaleTimeString("en-US", { hour12: false })}:${now.getMilliseconds().toString().padStart(3, "0")}`
    setLogs((prev) => [...prev, { timestamp, message: log }])
    setShowLogs(true)
  }

  const closeLogs = () => {
    setShowLogs(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // If not connected, do nothing as the button will be WalletConnectButton
    if (!connected) {
      return
    }

    // Check for validation errors
    if (urlError) {
      setError("Please fix the URL format before submitting")
      setStatus(FormStatus.ERROR)
      return
    }

    setShowLogs(true)

    if (!wallet) {
      setError("Please connect your wallet first")
      setStatus(FormStatus.ERROR)
      return
    }

    try {
      setStatus(FormStatus.UPLOADING_IMAGE)
      setError(null)
      setLogs([])

      // Upload image to IPFS if available
      let imageUrl = ""
      if (tokenData.image) {
        addLog("Uploading image to IPFS...")
        const pinataService = getPinataService()
        imageUrl = await pinataService.uploadImage(tokenData.image)
        addLog(`Image uploaded: ${imageUrl}`)
      }

      // Create metadata JSON
      const metadata = {
        name: tokenData.name,
        symbol: tokenData.symbol,
        description: tokenData.description,
        image: imageUrl,
        external_url: tokenData.url,
        attributes: [
          {
            trait_type: "Decimals",
            value: tokenData.decimals,
          },
          {
            trait_type: "Supply",
            value: tokenData.supply,
          },
        ],
      }

      // Upload metadata to IPFS
      addLog("Uploading token metadata to IPFS...")
      const pinataService = getPinataService()
      const metadataUri = await pinataService.uploadMetadata(metadata)
      addLog(`Metadata uploaded: ${metadataUri}`)

      // Create token
      setStatus(FormStatus.CREATING_TOKEN)
      addLog("Creating token on Solana blockchain...")

      // Direct integration with mintme-sdk
      const tokenConfig = {
        tokenName: tokenData.name,
        tokenSymbol: tokenData.symbol,
        uniqueKey: Date.now().toString(),
        decimals: Number.parseInt(tokenData.decimals.toString()),
        initialSupply: Number.parseInt(tokenData.supply.toString()),
        uri: metadataUri,
        revokeMint: tokenData.revokeMint,
        revokeFreeze: tokenData.revokeFreeze,
        partnerWallet: partnerWallet,
        partnerAmount: partnerAmount,
        connection: connection,
        cluster: cluster,
        logger: addLog,
        wallet: {
          publicKey: wallet.publicKey,
          signTransaction: wallet.signTransaction,
          signAllTransactions: wallet.signAllTransactions,
        },
      }

      addLog("Sending transaction to Solana network...")
      const sdkResult = await createTokenSimple(tokenConfig)

      // if (sdkResult.success) {
      //   const tokenResult: TokenCreationResult = {
      //     success: true,
      //     txSignature: sdkResult.txSignature,
      //     tokenAddress: sdkResult.mint,
      //   }

      //   setStatus(FormStatus.SUCCESS)
      //   setResult(tokenResult)
      //   addLog(`Token created successfully!`)
      //   addLog(`Transaction: https://explorer.solana.com/tx/${tokenResult.txSignature}?cluster=${cluster}`)
      //   if (tokenResult.tokenAddress) {
      //     addLog(`Token Address: ${tokenResult.tokenAddress}`)
      //   }

      //   // Check if onSubmit is a function before calling it
      //   if (typeof onSubmit === "function") {
      //     onSubmit(tokenData, tokenResult)
      //   }
      // } else {
      //   setStatus(FormStatus.ERROR)
      //   const errorMessage = sdkResult.error || "Unknown error creating token"
      //   setError(errorMessage)
      //   addLog(`Error: ${errorMessage}`)
      // }
    } catch (error) {
      setStatus(FormStatus.ERROR)
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      setError(errorMessage)
      addLog(`Error: ${errorMessage}`)
    }
  }

  const renderStatusIndicator = () => {
    switch (status) {
      case FormStatus.UPLOADING_IMAGE:
        return (
          <div className="flex items-center text-amber-500 dark:text-amber-400 text-sm">
            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            <span>Uploading to IPFS...</span>
          </div>
        )
      case FormStatus.CREATING_TOKEN:
        return (
          <div className="flex items-center text-blue-500 dark:text-blue-400 text-sm">
            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            <span>Creating token...</span>
          </div>
        )
      case FormStatus.SUCCESS:
        return (
          <div className="flex items-center text-green-500 dark:text-green-400 text-sm">
            <CheckCircle className="h-4 w-4 mr-1" />
            <span>Token created successfully!</span>
          </div>
        )
      case FormStatus.ERROR:
        return (
          <div className="flex items-center text-red-500 dark:text-red-400 text-sm hidden">
            <AlertCircle className="h-4 w-4 mr-1" />
            <span>{error || "An error occurred"}</span>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div
      className={`w-full max-w-md mx-auto bg-background dark:bg-gray-900 shadow-sm rounded-lg overflow-hidden relative ${className}`}
    >
      <div className="bg-gray-50 dark:bg-gray-800 py-1 px-4 border-b dark:border-gray-700 flex justify-between items-center">
        <div>
          <WalletMenu />
        </div>
        <ThemeToggle />
      </div>

      <form onSubmit={handleSubmit} className="p-4 pb-9">
        <div className="space-y-4">
          {/* Wallet Status */}
          <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded-md text-sm">
            {connected ? (
              <div className="flex items-center justify-between">
                <span className="text-green-600 dark:text-green-400 flex items-center">
                  <CheckCircle className="h-3.5 w-3.5 mr-1" />
                  Connected
                </span>
                <span className="text-gray-500 dark:text-gray-400 truncate max-w-[200px] font-mono">
                  {walletAddress}
                </span>
              </div>
            ) : (
              <div className="text-amber-600 dark:text-amber-400 flex items-center">
                <AlertCircle className="h-3.5 w-3.5 mr-1" />
                Please connect your wallet
              </div>
            )}
          </div>

          {/* Name and Symbol row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <FloatingInput
                id="name"
                name="name"
                label="Name"
                value={tokenData.name}
                onChange={handleInputChange}
                maxLength={MAX_NAME_LENGTH}
                required
                hint={`${tokenData.name.length}/${MAX_NAME_LENGTH}`}
              />
            </div>

            <div>
              <FloatingInput
                id="symbol"
                name="symbol"
                label="Symbol"
                value={tokenData.symbol}
                onChange={handleInputChange}
                maxLength={MAX_SYMBOL_LENGTH}
                required
                hint={`${tokenData.symbol.length}/${MAX_SYMBOL_LENGTH}`}
              />
            </div>
          </div>

          {/* Decimals and Supply row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <FloatingInput
                id="decimals"
                name="decimals"
                label="Decimals"
                type="number"
                value={tokenData.decimals.toString()}
                onChange={handleInputChange}
                min={MIN_DECIMALS}
                max={MAX_DECIMALS}
                required
              />
            </div>

            <div>
              <FloatingInput
                id="supply"
                name="supply"
                label="Supply"
                type="number"
                value={tokenData.supply.toString()}
                onChange={handleInputChange}
                min={1}
                max={MAX_SUPPLY}
                required
              />
            </div>
          </div>

          {/* Token Image */}
          <div className="space-y-1">
            <div
              className="border border-dashed border-gray-200 dark:border-gray-700 rounded-md p-4 flex flex-col items-center justify-center cursor-pointer hover:border-purple-300 dark:hover:border-purple-600 transition-colors"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleImageDrop}
            >
              <input
                ref={fileInputRef}
                id="image"
                name="image"
                type="file"
                accept="image/png,image/jpeg,image/gif"
                onChange={handleImageUpload}
                className="hidden"
              />

              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview || "/placeholder.svg"}
                    alt="Token preview"
                    className="w-16 h-16 object-contain rounded-md"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeImage()
                    }}
                    className="absolute -top-2 -right-2 bg-red-100 dark:bg-red-900 rounded-full p-1 text-red-500 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="h-8 w-8 text-purple-300 dark:text-purple-500 mb-1" />
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    Drag and drop an image here, or click to select
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">PNG, JPG or GIF</p>
                </>
              )}
            </div>
          </div>

          {/* URL */}
          <div>
            <FloatingInput
              id="url"
              name="url"
              label="URL (Optional)"
              value={tokenData.url}
              onChange={handleInputChange}
              hint={
                urlError
                  ? "Please enter a valid URL (e.g., https://example.com)"
                  : "Website URL for your token (optional)"
              }
              className={urlError ? "border-red-300 dark:border-red-700" : ""}
              onBlur={() => {
                // If there's a URL and it doesn't start with http:// or https://
                if (tokenData.url && !tokenData.url.match(/^https?:\/\//)) {
                  // Automatically add https://
                  const updatedUrl = `https://${tokenData.url}`
                  setTokenData((prev) => ({ ...prev, url: updatedUrl }))

                  // Validate the updated URL
                  setUrlError(!isValidUrl(updatedUrl))
                } else if (tokenData.url) {
                  // Validate normally if it already has the prefix
                  setUrlError(!isValidUrl(tokenData.url))
                }
              }}
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <FloatingTextarea
              id="description"
              name="description"
              label="Description (Optional)"
              value={tokenData.description}
              onChange={handleInputChange}
              maxCount={200}
              showCount={true}
            />
          </div>

          {/* Authority Toggles */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Label htmlFor="revokeFreeze" className="text-xs cursor-pointer">
                  Revoke Freeze Authority
                </Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-3.5 w-3.5 text-purple-400 dark:text-purple-300 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p className="w-48 text-xs">Permanently revoke the ability to freeze token accounts</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Switch
                id="revokeFreeze"
                checked={tokenData.revokeFreeze}
                onCheckedChange={(checked) => handleSwitchChange("revokeFreeze", checked)}
                className="scale-75 data-[state=checked]:bg-purple-500"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Label htmlFor="revokeMint" className="text-xs cursor-pointer">
                  Revoke Mint Authority
                </Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-3.5 w-3.5 text-purple-400 dark:text-purple-300 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p className="w-48 text-xs">Permanently revoke the ability to mint more tokens</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Switch
                id="revokeMint"
                checked={tokenData.revokeMint}
                onCheckedChange={(checked) => handleSwitchChange("revokeMint", checked)}
                className="scale-75 data-[state=checked]:bg-purple-500"
              />
            </div>
          </div>

          {/* Fee Estimation */}
          {estimatedFee !== null && (
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Estimated transaction fee: ~{estimatedFee.toFixed(6)} SOL
            </div>
          )}

          {/* Status Indicator */}
          {status !== FormStatus.IDLE && <div className="mt-2">{renderStatusIndicator()}</div>}

          {/* Error Message */}
          {error && (
            <Alert variant="destructive" className="py-2 dark:bg-red-900 dark:text-red-100">
              <AlertDescription className="text-xs">{error}</AlertDescription>
            </Alert>
          )}
        </div>

        {/* Submit Button or Wallet Connect Button */}
        <div className="mt-5 flex justify-center">
          {connected ? (
            <Button
              type="submit"
              disabled={status === FormStatus.UPLOADING_IMAGE || status === FormStatus.CREATING_TOKEN || urlError}
              className="bg-purple-500 hover:bg-purple-600 dark:bg-purple-600 dark:hover:bg-purple-700 text-white px-6 py-1.5 rounded-md text-sm transition-colors disabled:bg-purple-300 dark:disabled:bg-purple-800"
            >
              {status === FormStatus.UPLOADING_IMAGE || status === FormStatus.CREATING_TOKEN ? (
                <div className="flex items-center">
                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  {status === FormStatus.UPLOADING_IMAGE ? "Uploading..." : "Creating Token..."}
                </div>
              ) : (
                "Create Token"
              )}
            </Button>
          ) : (
            <WalletConnectButton className="bg-purple-500 hover:bg-purple-600 dark:bg-purple-600 dark:hover:bg-purple-700 text-white px-6 py-1.5 rounded-md text-sm transition-colors" />
          )}
        </div>
      </form>
      {/* Transaction Logs Overlay (inside the form container) */}
      {showLogs && logs.length > 0 && (
        <div className="absolute inset-0 bg-white dark:bg-gray-900 bg-opacity-95 dark:bg-opacity-95 z-10 flex items-center justify-center p-4">
          <div className="w-full max-w-md p-4 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-gray-800 dark:text-gray-200">Transaction Progress</h3>
              {(status === FormStatus.SUCCESS || status === FormStatus.ERROR) && (
                <button
                  onClick={closeLogs}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
            <div className="mb-3">{renderStatusIndicator()}</div>
            <div
              ref={logsContainerRef}
              className="h-48 overflow-y-auto bg-gray-50 dark:bg-gray-800 p-3 rounded-md text-xs"
            >
              {logs.map((log, index) => (
                <div key={index} className="text-gray-600 dark:text-gray-300 mb-1 font-mono">
                  <span className="text-purple-500 dark:text-purple-400 mr-2">[{log.timestamp}]</span>
                  {log.message}
                </div>
              ))}
            </div>

            {/* Success Result */}
            {status === FormStatus.SUCCESS && result && (
              <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                <div className="text-black-600 dark:text-green-400 font-medium text-sm flex items-center">
                  <CheckCircle className="h-4 w-4 mr-1.5" />
                  Token created successfully!
                </div>
                {result.tokenAddress && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 flex w-full items-center gap-2 border-purple-200 text-purple-500 hover:bg-purple-50 dark:border-purple-800 dark:text-purple-400 dark:hover:bg-purple-900/30"
                    onClick={() =>
                      window.open(
                        `https://explorer.solana.com/account/${result.tokenAddress}?cluster=${cluster}`,
                        "_blank",
                        "noopener,noreferrer",
                      )
                    }
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="mr-1"
                    >
                      <path
                        d="M10 6H6C4.89543 6 4 6.89543 4 8V18C4 19.1046 4.89543 20 6 20H16C17.1046 20 18 19.1046 18 18V14M14 4H20M20 4V10M20 4L10 14"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    View Token on Solana Explorer
                  </Button>
                )}
                {result.txSignature && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 flex w-full items-center gap-2 border-purple-200 text-purple-500 hover:bg-purple-50 dark:border-purple-800 dark:text-purple-400 dark:hover:bg-purple-900/30"
                    onClick={() =>
                      window.open(
                        `https://explorer.solana.com/tx/${result.txSignature}?cluster=${cluster}`,
                        "_blank",
                        "noopener,noreferrer",
                      )
                    }
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="mr-1"
                    >
                      <path
                        d="M10 6H6C4.89543 6 4 6.89543 4 8V18C4 19.1046 4.89543 20 6 20H16C17.1046 20 18 19.1046 18 18V14M14 4H20M20 4V10M20 4L10 14"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    View TX on Solana Explorer
                  </Button>
                )}
              </div>
            )}

            {(status === FormStatus.SUCCESS || status === FormStatus.ERROR) && (
              <div className="mt-4 flex justify-end">
                <Button
                  onClick={closeLogs}
                  variant="outline"
                  size="sm"
                  className="dark:border-gray-700 dark:text-gray-300"
                >
                  Close
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Conditional rendering of the credit badge */}
      {showCredit && (
        <a
          href="https://mintme.dev"
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-2 right-2 flex items-center gap-1 text-xs bg-gradient-to-r from-purple-500/10 to-purple-600/10 dark:from-purple-500/20 dark:to-purple-600/20 px-2 py-1 rounded-full text-purple-600 dark:text-purple-400 hover:from-purple-500/20 hover:to-purple-600/20 dark:hover:from-purple-500/30 dark:hover:to-purple-600/30 transition-all duration-300 shadow-sm"
        >
          <span className="font-medium">mintme.dev</span>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
            <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
          </svg>
        </a>
      )}
    </div>
  )
}
