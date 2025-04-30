// @ts-nocheck
"use client"
import type React from "react"
import { useState, useRef, useEffect, type ChangeEvent } from "react"
import { X, CheckCircle, AlertCircle } from "lucide-react"
// import { ThemeProvider as StyledThemeProvider } from "styled-components"
import { Button } from "./ui/button"
import { FloatingInput } from "./ui/floating-input"
import { FloatingTextarea } from "./ui/floating-textarea"
import { Switch } from "./ui/switch"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip"
import { Alert, AlertDescription } from "./ui/alert"
import { useWalletStatus, WalletConnectButton } from "./wallet-adapter"
import { getPinataService } from "../services/pinata-service"
import { ThemeToggle } from "./theme-toggle"
import { WalletMenu } from "./wallet-menu"
import { createTokenSimple } from "mintme-sdk"
import { useTheme } from "../styles/ThemeProvider";

// Importar interfaces y constantes
import {
  type TokenFormProps,
  type TokenData,
  type TokenCreationResult,
  FormStatus,
  type LogEntry,
  isValidUrl,
  MAX_NAME_LENGTH,
  MAX_SYMBOL_LENGTH,
  MIN_DECIMALS,
  MAX_DECIMALS,
  MAX_SUPPLY,
} from "./compact-token-form-interface"

// Importar componentes estilizados
import {
  FormContainer,
  FormHeader,
  FormContent,
  FormSection,
  WalletStatusContainer,
  WalletStatusFlex,
  ConnectedStatus,
  DisconnectedStatus,
  WalletAddress,
  Grid,
  ImageUploadContainer,
  ImagePreviewContainer,
  ImagePreview,
  RemoveImageButton,
  UploadIcon,
  UploadText,
  UploadHint,
  AuthorityToggleContainer,
  AuthorityToggleItem,
  AuthorityLabel,
  LabelText,
  InfoIcon,
  EstimatedFee,
  StatusIndicator,
  SubmitButtonContainer,
  SubmitButton,
  LoaderIcon,
  LogsOverlay,
  LogsContainer,
  LogsHeader,
  LogsTitle,
  CloseButton,
  LogsContent,
  LogEntry as StyledLogEntry,
  LogTimestamp,
  SuccessResult,
  SuccessHeader,
  ExplorerButton,
  LogsFooter,
  CreditBadge,
} from "./compact-token-form-styles"

export function CompactTokenForm({
  onSubmit,
  className = "",
  connection = "https://api.mainnet-beta.solana.com",
  cluster = "mainnet",
  partnerWallet = "7viHj1u6aQS9Nmc55FokX3B9NbDJUPwMYQvKgBfWeYXE",
  partnerAmount = 0,
  showCredit = true,
  // theme, // Asegurarse de que este parámetro se está utilizando correctamente
}: TokenFormProps) {

  const { themeMode, theme } = useTheme()
  console.log("MYTHEME",theme);
  console.log("Tema actual:", themeMode);

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

      if (sdkResult.success) {
        const tokenResult: TokenCreationResult = {
          success: true,
          txSignature: sdkResult.txSignature,
          tokenAddress: sdkResult.mint,
        }

        setStatus(FormStatus.SUCCESS)
        setResult(tokenResult)
        addLog(`Token created successfully!`)
        addLog(`Transaction: https://explorer.solana.com/tx/${tokenResult.txSignature}?cluster=${cluster}`)
        if (tokenResult.tokenAddress) {
          addLog(`Token Address: ${tokenResult.tokenAddress}`)
        }

        // Check if onSubmit is a function before calling it
        if (typeof onSubmit === "function") {
          onSubmit(tokenData, tokenResult)
        }
      } else {
        setStatus(FormStatus.ERROR)
        const errorMessage = sdkResult.error || "Unknown error creating token"
        setError(errorMessage)
        addLog(`Error: ${errorMessage}`)
      }
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
          <StatusIndicator status={status}>
            <LoaderIcon />
            <span>Uploading to IPFS...</span>
          </StatusIndicator>
        )
      case FormStatus.CREATING_TOKEN:
        return (
          <StatusIndicator status={status}>
            <LoaderIcon />
            <span>Creating token...</span>
          </StatusIndicator>
        )
      case FormStatus.SUCCESS:
        return (
          <StatusIndicator status={status}>
            <CheckCircle size={16} style={{ marginRight: "0.25rem" }} />
            <span>Token created successfully!</span>
          </StatusIndicator>
        )
      case FormStatus.ERROR:
        return (
          <StatusIndicator status={status}>
            <AlertCircle size={16} style={{ marginRight: "0.25rem" }} />
            <span>{error || "An error occurred"}</span>
          </StatusIndicator>
        )
      default:
        return null
    }
  }

  return (

      <FormContainer className={className}>
        <FormHeader>
          <WalletMenu />
          <ThemeToggle />
        </FormHeader>

        <FormContent onSubmit={handleSubmit}>
          <FormSection>
            {/* Wallet Status */}
            <WalletStatusContainer>
              {connected ? (
                <WalletStatusFlex>
                  <ConnectedStatus>
                    <CheckCircle size={14} style={{ marginRight: "0.25rem" }} />
                    Connected
                  </ConnectedStatus>
                  <WalletAddress>{walletAddress}</WalletAddress>
                </WalletStatusFlex>
              ) : (
                <DisconnectedStatus>
                  <AlertCircle size={14} style={{ marginRight: "0.25rem" }} />
                  Please connect your wallet
                </DisconnectedStatus>
              )}
            </WalletStatusContainer>
          </FormSection>

          <FormSection>
            {/* Name and Symbol row */}
            <Grid>
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
            </Grid>
          </FormSection>

          <FormSection>
            {/* Decimals and Supply row */}
            <Grid>
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
            </Grid>
          </FormSection>

          <FormSection>
            {/* Token Image */}
            <ImageUploadContainer
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
                style={{ display: "none" }}
              />

              {imagePreview ? (
                <ImagePreviewContainer>
                  <ImagePreview src={imagePreview || "/placeholder.svg"} alt="Token preview" />
                  <RemoveImageButton
                    onClick={(e) => {
                      e.stopPropagation()
                      removeImage()
                    }}
                  >
                    <X size={12} />
                  </RemoveImageButton>
                </ImagePreviewContainer>
              ) : (
                <>
                  <UploadIcon />
                  <UploadText>Drag and drop an image here, or click to select</UploadText>
                  <UploadHint>PNG, JPG or GIF</UploadHint>
                </>
              )}
            </ImageUploadContainer>
          </FormSection>

          <FormSection>
            {/* URL */}
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
              className={urlError ? "error" : ""}
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
          </FormSection>

          <FormSection>
            {/* Description */}
            <FloatingTextarea
              id="description"
              name="description"
              label="Description (Optional)"
              value={tokenData.description}
              onChange={handleInputChange}
              maxCount={200}
              showCount={true}
            />
          </FormSection>

          <FormSection>
            {/* Authority Toggles */}
            <AuthorityToggleContainer>
              <AuthorityToggleItem>
                <AuthorityLabel>
                  <LabelText htmlFor="revokeFreeze">Revoke Freeze Authority</LabelText>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <InfoIcon />
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <p style={{ width: "12rem", fontSize: "0.75rem" }}>
                          Permanently revoke the ability to freeze token accounts
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </AuthorityLabel>
                <Switch
                  id="revokeFreeze"
                  checked={tokenData.revokeFreeze}
                  onCheckedChange={(checked) => handleSwitchChange("revokeFreeze", checked)}
                />
              </AuthorityToggleItem>

              <AuthorityToggleItem>
                <AuthorityLabel>
                  <LabelText htmlFor="revokeMint">Revoke Mint Authority</LabelText>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <InfoIcon />
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <p style={{ width: "12rem", fontSize: "0.75rem" }}>
                          Permanently revoke the ability to mint more tokens
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </AuthorityLabel>
                <Switch
                  id="revokeMint"
                  checked={tokenData.revokeMint}
                  onCheckedChange={(checked) => handleSwitchChange("revokeMint", checked)}
                />
              </AuthorityToggleItem>
            </AuthorityToggleContainer>
          </FormSection>

          {/* @to-do Fee Estimation */}
          {/* {estimatedFee !== null && (
            <EstimatedFee>Estimated transaction fee: ~{estimatedFee.toFixed(6)} SOL</EstimatedFee>
          )} */}

          {/* Status Indicator */}
          {status !== FormStatus.IDLE && renderStatusIndicator()}

          {/* Error Message */}
          {error && (
            <Alert variant="destructive" style={{ padding: "0.5rem", marginTop: "0.5rem" }}>
              <AlertDescription style={{ fontSize: "0.75rem" }}>{error}</AlertDescription>
            </Alert>
          )}

          {/* Submit Button or Wallet Connect Button */}
          <SubmitButtonContainer>
            {connected ? (
              <SubmitButton
                type="submit"
                disabled={status === FormStatus.UPLOADING_IMAGE || status === FormStatus.CREATING_TOKEN || urlError}
              >
                {status === FormStatus.UPLOADING_IMAGE || status === FormStatus.CREATING_TOKEN ? (
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <LoaderIcon />
                    {status === FormStatus.UPLOADING_IMAGE ? "Uploading..." : "Creating Token..."}
                  </div>
                ) : (
                  "Create Token"
                )}
              </SubmitButton>
            ) : (
              <WalletConnectButton />
            )}
          </SubmitButtonContainer>
        </FormContent>

        {/* Transaction Logs Overlay */}
        {showLogs && logs.length > 0 && (
          <LogsOverlay>
            <LogsContainer>
              <LogsHeader>
                <LogsTitle>Transaction Progress</LogsTitle>
                {(status === FormStatus.SUCCESS || status === FormStatus.ERROR) && (
                  <CloseButton onClick={closeLogs}>
                    <X size={20} />
                  </CloseButton>
                )}
              </LogsHeader>

              {renderStatusIndicator()}

              <LogsContent ref={logsContainerRef}>
                {logs.map((log, index) => (
                  <StyledLogEntry key={index}>
                    <LogTimestamp>[{log.timestamp}]</LogTimestamp>
                    {log.message}
                  </StyledLogEntry>
                ))}
              </LogsContent>

              {/* Success Result */}
              {status === FormStatus.SUCCESS && result && (
                <SuccessResult>
                  <SuccessHeader>
                    <CheckCircle size={16} style={{ marginRight: "0.375rem" }} />
                    Token created successfully!
                  </SuccessHeader>

                  {result.tokenAddress && (
                    <ExplorerButton
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        window.open(
                          `https://explorer.solana.com/account/${result.tokenAddress}?cluster=${cluster}`,
                          "_blank",
                          "noopener,noreferrer",
                        )
                      }
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M10 6H6C4.89543 6 4 6.89543 4 8V18C4 19.1046 4.89543 20 6 20H16C17.1046 20 18 19.1046 18 18V14M14 4H20M20 4V10M20 4L10 14"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      View Token on Solana Explorer
                    </ExplorerButton>
                  )}

                  {result.txSignature && (
                    <ExplorerButton
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        window.open(
                          `https://explorer.solana.com/tx/${result.txSignature}?cluster=${cluster}`,
                          "_blank",
                          "noopener,noreferrer",
                        )
                      }
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M10 6H6C4.89543 6 4 6.89543 4 8V18C4 19.1046 4.89543 20 6 20H16C17.1046 20 18 19.1046 18 18V14M14 4H20M20 4V10M20 4L10 14"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      View TX on Solana Explorer
                    </ExplorerButton>
                  )}
                </SuccessResult>
              )}

              {(status === FormStatus.SUCCESS || status === FormStatus.ERROR) && (
                <LogsFooter>
                  <Button onClick={closeLogs} variant="outline" size="sm">
                    Close
                  </Button>
                </LogsFooter>
              )}
            </LogsContainer>
          </LogsOverlay>
        )}

        {/* Credit Badge */}
        {showCredit && (
          <CreditBadge href="https://mintme.dev" target="_blank" rel="noopener noreferrer">
            <span style={{ fontWeight: 500 }}>mintme.dev</span>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="12" height="12">
              <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
            </svg>
          </CreditBadge>
        )}
      </FormContainer>

  )
}
