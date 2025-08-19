"use client"

import type React from "react"
import { useState } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { useWalletModal } from "@solana/wallet-adapter-react-ui"
import { FormField } from "./FormField"
import { CheckboxField } from "./CheckboxField"
import { ImageUploadField } from "./ImageUploadField"
import { TransactionOverlay } from "./TransactionOverlay"
import { CostEstimateBadge } from "./CostestimateBadge"
import { uploadImageToPinata } from "../services/imageUploadService"
import { uploadJsonToPinata } from "../services/metadataUploadService"
import { createIpfsRollbackManager } from "../services/pinataCleanupService"
import type { ThemeColors } from "../styles/themes"
import type { TokenData, PinataConfig, TokenCreationResult } from "../types/index"
import { createTokenWithMintme, validateWalletBalance } from "../services/tokenCreationService"
import { useConnection } from "@solana/wallet-adapter-react"

interface TokenFormProps {
  onSubmit: (data: TokenData, result: TokenCreationResult) => void
  onLog?: (message: string) => void // Add this line
  theme: ThemeColors
  pinataConfig?: PinataConfig
  cluster?: "mainnet-beta" | "testnet" | "devnet"
  partnerWallet?: string
  partnerAmount?: number
}

export const TokenForm: React.FC<TokenFormProps> = ({
  onSubmit,
  onLog, // Add this line
  theme,
  pinataConfig,
  cluster,
  partnerWallet,
  partnerAmount,
}) => {
  // Obtener el contexto completo de la wallet
  const walletContext = useWallet()
  const { connected, connecting, publicKey } = walletContext
  const { setVisible } = useWalletModal()
  const [formData, setFormData] = useState<TokenData>({
    tokenName: "",
    tokenSymbol: "",
    decimals: 9,
    initialSupply: "10000000", // Cambiar de "" a "10000000"
    projectWebsite: "",
    description: "",
    revokeMintAuthority: true,
    revokeFreezeAuthority: true,
    imageFile: null,
    ipfsImageUrl: null,
    ipfsImageId: null,
    ipfsMetadataId: null,
  })
  const [isSubmittingForm, setIsSubmittingForm] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const { connection } = useConnection()

  // Agregar estos estados después de los estados existentes:
  const [showOverlay, setShowOverlay] = useState(false)
  const [transactionLogs, setTransactionLogs] = useState<string[]>([])
  const [transactionCompleted, setTransactionCompleted] = useState(false)
  const [transactionResult, setTransactionResult] = useState<TokenCreationResult | null>(null)
  const [transactionError, setTransactionError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!connected) {
      setVisible(true)
      return
    }

    if (!isFormValid()) {
      setFormError("Please fill in all required fields.")
      return
    }

    // Mostrar overlay y resetear estados
    setShowOverlay(true)
    setTransactionLogs([])
    setTransactionCompleted(false)
    setTransactionResult(null)
    setTransactionError(null)
    setIsSubmittingForm(true)

    // Rollback to IPFS to prevent no minted data
    const rollbackManager = createIpfsRollbackManager()

    try {
      let finalIpfsImageUrl = formData.ipfsImageUrl
      let finalIpfsImageId = formData.ipfsImageId

      // 1. Upload if have a file
      if (formData.imageFile && !finalIpfsImageUrl) {
        if (!pinataConfig?.apiKey) {
          throw new Error("Pinata API Key (JWT) is required for image upload.")
        }

        handleLog("📤 Uploading image to IPFS...")
        const imageResult = await uploadImageToPinata(formData.imageFile, pinataConfig)
        finalIpfsImageUrl = imageResult.url
        finalIpfsImageId = imageResult.id
        rollbackManager.imageId = imageResult.id

        setFormData((prev:any) => ({
          ...prev,
          ipfsImageUrl: finalIpfsImageUrl,
          ipfsImageId: finalIpfsImageId,
        }))
        handleLog("✅ Image uploaded successfully")
      }

      // 2. Make JSON metadata
      const metadataJson = {
        name: formData.tokenName,
        symbol: formData.tokenSymbol,
        url: formData.projectWebsite,
        description: formData.description,
        decimals: formData.decimals,
        supply: Number(formData.initialSupply),
        image: finalIpfsImageUrl || "",
      }

      // 3. Upload JSON
      if (!pinataConfig?.apiKey) {
        throw new Error("Pinata API Key (JWT) is required for metadata upload.")
      }

      handleLog("📤 Uploading metadata to IPFS...")
      const metadataResult = await uploadJsonToPinata(metadataJson, pinataConfig, formData.tokenName)
      rollbackManager.metadataId = metadataResult.id
      handleLog("✅ Metadata uploaded successfully")

      // 4. Check wallet balance
      handleLog("💰 Validating wallet balance...")
      if (!publicKey) {
        throw new Error("Wallet public key is not available")
      }
      const hasBalance = await validateWalletBalance(connection, publicKey.toBase58())
      if (!hasBalance) {
        throw new Error("Insufficient SOL balance. Please add more SOL to your wallet.")
      }
      handleLog("✅ Wallet balance validated")

      // 5. Mint Token
      handleLog("🪙 Creating token on Solana blockchain...")
      const tokenResult = await createTokenWithMintme(
        {
          ...formData,
          ipfsImageUrl: finalIpfsImageUrl,
          ipfsImageId: finalIpfsImageId,
          ipfsMetadataId: metadataResult.id,
        },
        metadataResult.url,
        walletContext,
        connection,
        cluster || "devnet",
        partnerWallet,
        partnerAmount,
        handleLog, // Callbacks to logs
      )

      handleLog("🎉 Token created successfully!")

      // Add information Logger
      if (tokenResult.tokenAddress) {
        handleLog(`Token Contract Address (CA): ${tokenResult.tokenAddress}`)
      }
      if (tokenResult.transactionSignature) {
        handleLog(`Transaction Signature: ${tokenResult.transactionSignature}`)
      }

      // Finish
      setTransactionCompleted(true)
      setTransactionResult(tokenResult)

      // 6. Call Onsubmit
      setTimeout(() => {
        onSubmit(
          {
            ...formData,
            ipfsImageUrl: finalIpfsImageUrl,
            ipfsImageId: finalIpfsImageId,
            ipfsMetadataId: metadataResult.id,
          },
          tokenResult,
        )
      }, 1000)
    } catch (error: any) {
      console.error("❌ Token creation failed:", error)
      handleLog(`❌ Error: ${error.message}`)

      // Do Rollback IPFS
      if (pinataConfig?.apiKey) {
        handleLog("🔄 Performing IPFS rollback due to error...")
        try {
          await rollbackManager.cleanup(pinataConfig)
          handleLog("✅ IPFS cleanup completed")
        } catch (cleanupError) {
          console.error("⚠️ Error during IPFS cleanup:", cleanupError)
          handleLog("⚠️ Error during IPFS cleanup")
        }
      }

      // CLean Data
      setFormData((prev:any) => ({
        ...prev,
        ipfsImageUrl: null,
        ipfsImageId: null,
        ipfsMetadataId: null,
      }))

      // Show errors
      let userFriendlyError = "Failed to create token. Please try again."

      if (error.message?.includes("User rejected")) {
        userFriendlyError = "Transaction was cancelled by user."
      } else if (error.message?.includes("insufficient funds")) {
        userFriendlyError = "Insufficient SOL balance to create token."
      } else if (error.message?.includes("blockhash")) {
        userFriendlyError = "Network error. Please try again in a few moments."
      } else if (error.message) {
        userFriendlyError = error.message
      }

      setTransactionError(userFriendlyError)
    } finally {
      setIsSubmittingForm(false)
    }
  }

  const updateField = (field: keyof TokenData, value: any) => {
    setFormData((prev:any) => ({ ...prev, [field]: value }))
  }

  const handleImageUpload = (file: File | null, ipfsUrl: string | null) => {
    setFormData((prev:any) => ({
      ...prev,
      imageFile: file,
    }))
  }

  const isFormValid = () => {
    return (
      formData.tokenName.trim() !== "" &&
      formData.tokenSymbol.trim() !== "" &&
      formData.initialSupply.trim() !== "" &&
      formData.decimals >= 0 &&
      formData.decimals <= 9
    )
  }

  const formStyles: React.CSSProperties = {
    width: "100%",
  }

  const fieldsRowStyles: React.CSSProperties = {
    display: "flex",
    gap: "1rem",
    flexWrap: "wrap" as const,
  }

  const sectionTitleStyles: React.CSSProperties = {
    fontSize: "1rem",
    fontWeight: "600",
    color: theme.text,
    marginBottom: "1rem",
    marginTop: "1.5rem", // Reduced from 2rem
    fontFamily: "system-ui, -apple-system, sans-serif",
  }

  const walletInfoStyles: React.CSSProperties = {
    backgroundColor: theme.inputBackground,
    border: `1px solid ${theme.inputBorder}`,
    borderRadius: "0.5rem",
    padding: "1rem",
    marginBottom: "1.5rem",
    display: connected ? "block" : "none",
  }

  const walletAddressStyles: React.CSSProperties = {
    fontSize: "0.875rem",
    color: theme.textSecondary,
    wordBreak: "break-all" as const,
    fontFamily: "monospace",
  }

  const getButtonText = () => {
    if (connecting) return "Connecting..."
    if (isSubmittingForm) return "Creating Token..."
    if (!connected) return "Connect Wallet"
    if (!isFormValid()) return "Complete Required Fields"
    return "Create Token"
  }

  const getButtonDisabled = () => {
    if (connecting || isSubmittingForm) return true
    if (!connected) return false
    return !isFormValid()
  }

  const getTooltipMessage = () => {
    if (connecting || isSubmittingForm) return ""
    if (!connected) return "Please connect your wallet first"

    const missingFields = []
    if (!formData.tokenName.trim()) missingFields.push("Token Name")
    if (!formData.tokenSymbol.trim()) missingFields.push("Token Symbol")
    if (!formData.initialSupply.trim()) missingFields.push("Initial Supply")
    if (formData.decimals < 0 || formData.decimals > 9) missingFields.push("Valid Decimals")

    if (missingFields.length > 0) {
      return `Missing required fields: ${missingFields.join(", ")}`
    }

    return ""
  }

  const buttonStyles: React.CSSProperties = {
    width: "100%",
    padding: "0.6rem 0.6rem",
    fontSize: "0.8rem",
    fontWeight: "600",
    backgroundColor: getButtonDisabled() ? theme.textSecondary : theme.buttonPrimary,
    color: theme.buttonText,
    border: "none",
    borderRadius: "0.75rem",
    cursor: getButtonDisabled() ? "not-allowed" : "pointer",
    transition: "background-color 0.2s ease",
    marginTop: "0.2rem",
    fontFamily: "system-ui, -apple-system, sans-serif",
    opacity: getButtonDisabled() ? 0.6 : 1,
  }

  // Crear función para manejar logs:
  const handleLog = (message: string) => {
    const timestampedMessage = `${new Date().toLocaleTimeString()}: ${message}`
    setTransactionLogs((prev) => [...prev, timestampedMessage])

    // Also call the external logger if provided
    onLog?.(message)
  }

  // Crear función para cerrar el overlay:
  const handleCloseOverlay = () => {
    setShowOverlay(false)
    setTransactionLogs([])
    setTransactionCompleted(false)
    setTransactionResult(null)
    setTransactionError(null)
  }

  return (
    <form style={formStyles} onSubmit={handleSubmit}>
      {/* Show Cost Estimate */}
      <div style={{ height: "1.25rem", marginBottom: "0.5rem" }}>
        {connected && <CostEstimateBadge theme={theme} partnerAmount={partnerAmount} cluster={cluster} />}
      </div>

      <div style={fieldsRowStyles}>
        <FormField
          label="Token Name"
          value={formData.tokenName}
          onChange={(value) => updateField("tokenName", value)}
          placeholder="My Token"
          required
          theme={theme}
          tooltip="The display name of your token"
        />
        <FormField
          label="Token Symbol"
          value={formData.tokenSymbol}
          onChange={(value) => updateField("tokenSymbol", value.toUpperCase())}
          placeholder="MTK"
          required
          theme={theme}
          tooltip="A short identifier for your token (usually 3-5 characters)"
        />
      </div>

      <div style={fieldsRowStyles}>
        <FormField
          label="Decimals"
          type="number"
          value={formData.decimals}
          onChange={(value) => updateField("decimals", Number.parseInt(value) || 0)}
          placeholder="9"
          required
          theme={theme}
          tooltip="Number of decimal places (9 is standard for most tokens)"
          min={0}
          max={9}
        />
        <FormField
          label="Initial Supply"
          value={formData.initialSupply}
          onChange={(value) => updateField("initialSupply", value)}
          placeholder="10000000"
          required
          theme={theme}
          tooltip="The total number of tokens to create (max: 18,446,744,073,709,551,615)"
        />
      </div>

      <FormField
        label="Project Website"
        type="url"
        value={formData.projectWebsite}
        onChange={(value) => updateField("projectWebsite", value)}
        placeholder="https://myproject.com"
        theme={theme}
        tooltip="Your project's official website"
        fullWidth
      />

      <FormField
        label="Description"
        value={formData.description}
        onChange={(value) => updateField("description", value)}
        placeholder="A brief description of your token"
        theme={theme}
        tooltip="A short description of your token's purpose or utility"
        fullWidth
      />

      <ImageUploadField
        label="Token Image"
        theme={theme}
        pinataConfig={pinataConfig}
        onImageUpload={handleImageUpload}
        currentIpfsUrl={formData.ipfsImageUrl || undefined}
      />

      <div style={sectionTitleStyles}>Token Authorities</div>

      <CheckboxField
        label="Revoke Mint Authority"
        checked={formData.revokeMintAuthority}
        onChange={(checked) => updateField("revokeMintAuthority", checked)}
        tooltip="Recommended for fixed supply tokens. This prevents creating more tokens in the future."
        theme={theme}
      />

      <CheckboxField
        label="Revoke Freeze Authority"
        checked={formData.revokeFreezeAuthority}
        onChange={(checked) => updateField("revokeFreezeAuthority", checked)}
        tooltip="Recommended for most tokens. This prevents freezing token accounts in the future."
        theme={theme}
      />

      {formError && (
        <div
          style={{
            color: "#ef4444",
            fontSize: "0.875rem",
            marginTop: "1rem",
            marginBottom: "1rem",
            textAlign: "center",
            padding: "0.75rem",
            backgroundColor: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: "0.5rem",
          }}
        >
          {formError}
        </div>
      )}

      <div style={{ position: "relative", width: "100%" }}>
        <button
          type="submit"
          style={buttonStyles}
          disabled={getButtonDisabled()}
          title={getTooltipMessage()}
          onMouseEnter={(e) => {
            if (!getButtonDisabled()) {
              e.currentTarget.style.backgroundColor = theme.buttonPrimaryHover
            }
          }}
          onMouseLeave={(e) => {
            if (!getButtonDisabled()) {
              e.currentTarget.style.backgroundColor = theme.buttonPrimary
            }
          }}
        >
          {getButtonText()}
        </button>

        {/* Tooltip */}
        {getButtonDisabled() && getTooltipMessage() && (
          <div
            style={{
              position: "absolute",
              bottom: "calc(100% + 8px)",
              left: "50%",
              transform: "translateX(-50%)",
              backgroundColor: theme.cardBackground,
              border: `1px solid ${theme.border}`,
              borderRadius: "0.5rem",
              padding: "0.5rem 0.75rem",
              fontSize: "0.75rem",
              color: theme.textSecondary,
              boxShadow: theme.shadow,
              whiteSpace: "nowrap",
              zIndex: 1000,
              opacity: 0.95,
            }}
          >
            {getTooltipMessage()}
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: "50%",
                transform: "translateX(-50%)",
                width: 0,
                height: 0,
                borderLeft: "6px solid transparent",
                borderRight: "6px solid transparent",
                borderTop: `6px solid ${theme.border}`,
              }}
            />
          </div>
        )}
      </div>

      {/* Add component TransactionOverlay*/}
      <TransactionOverlay
        isVisible={showOverlay}
        theme={theme}
        logs={transactionLogs}
        isCompleted={transactionCompleted}
        result={transactionResult}
        error={transactionError}
        cluster={cluster || "devnet"}
        onClose={handleCloseOverlay}
      />
    </form>
  )
}
