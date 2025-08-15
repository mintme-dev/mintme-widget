"use client"

import type React from "react"
import { useState } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { useWalletModal } from "@solana/wallet-adapter-react-ui"
import { FormField } from "./FormField"
import { CheckboxField } from "./CheckboxField"
import { ImageUploadField } from "./ImageUploadField"
import { uploadImageToPinata } from "../services/imageUploadService"
import { uploadJsonToPinata } from "../services/metadataUploadService"
import { createIpfsRollbackManager } from "../services/pinataCleanupService"
import type { TokenData, ThemeColors, PinataConfig, TokenCreationResult } from "../types"
import { createTokenWithMintme, validateWalletBalance } from "../services/tokenCreationService"
import { useConnection } from "@solana/wallet-adapter-react"

interface TokenFormProps {
  onSubmit: (data: TokenData, result: TokenCreationResult) => void
  theme: ThemeColors
  pinataConfig?: PinataConfig
  cluster?: "mainnet-beta" | "testnet" | "devnet"
  partnerWallet?: string
  partnerAmount?: number
}

export const TokenForm: React.FC<TokenFormProps> = ({
  onSubmit,
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
    initialSupply: "",
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

    setIsSubmittingForm(true)

    // Crear el manager de rollback para IPFS
    const rollbackManager = createIpfsRollbackManager()

    try {
      let finalIpfsImageUrl = formData.ipfsImageUrl
      let finalIpfsImageId = formData.ipfsImageId

      // 1. Subir imagen a IPFS si hay un archivo seleccionado
      if (formData.imageFile && !finalIpfsImageUrl) {
        if (!pinataConfig?.apiKey) {
          throw new Error("Pinata API Key (JWT) is required for image upload.")
        }

        console.log("📤 Uploading image to IPFS...")
        const imageResult = await uploadImageToPinata(formData.imageFile, pinataConfig)
        finalIpfsImageUrl = imageResult.url
        finalIpfsImageId = imageResult.id
        rollbackManager.imageId = imageResult.id // Registrar ID para posible rollback

        setFormData((prev) => ({
          ...prev,
          ipfsImageUrl: finalIpfsImageUrl,
          ipfsImageId: finalIpfsImageId,
        }))
        console.log("✅ Image uploaded successfully:", finalIpfsImageUrl)
      }

      // 2. Construir el objeto JSON de metadatos
      const metadataJson = {
        name: formData.tokenName,
        symbol: formData.tokenSymbol,
        url: formData.projectWebsite,
        description: formData.description,
        decimals: formData.decimals,
        supply: Number(formData.initialSupply),
        image: finalIpfsImageUrl || "",
      }

      // 3. Subir el JSON de metadatos a Pinata
      if (!pinataConfig?.apiKey) {
        throw new Error("Pinata API Key (JWT) is required for metadata upload.")
      }

      console.log("📤 Uploading metadata to IPFS...")
      const metadataResult = await uploadJsonToPinata(metadataJson, pinataConfig, formData.tokenName)
      rollbackManager.metadataId = metadataResult.id // Registrar ID para posible rollback
      console.log("✅ Metadata uploaded successfully:", metadataResult.url)

      // 4. Validar balance de la wallet
      const hasBalance = await validateWalletBalance(connection, publicKey.toBase58())
      if (!hasBalance) {
        throw new Error("Insufficient SOL balance. Please add more SOL to your wallet.")
      }

      // 5. Crear el token usando el SDK Mintme
      console.log("🪙 Creating token on Solana...")
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
      )

      console.log("🎉 Token created successfully!")

      // 6. Si llegamos aquí, todo salió bien - llamar onSubmit
      onSubmit(
        {
          ...formData,
          ipfsImageUrl: finalIpfsImageUrl,
          ipfsImageId: finalIpfsImageId,
          ipfsMetadataId: metadataResult.id,
        },
        tokenResult,
      )
    } catch (error: any) {
      console.error("❌ Token creation failed:", error)

      // Realizar rollback de archivos IPFS si hay configuración de Pinata
      if (pinataConfig?.apiKey) {
        console.log("🔄 Performing IPFS rollback due to error...")
        try {
          await rollbackManager.cleanup(pinataConfig)
        } catch (cleanupError) {
          console.error("⚠️ Error during IPFS cleanup:", cleanupError)
        }
      }

      // Limpiar URLs e IDs locales también
      setFormData((prev) => ({
        ...prev,
        ipfsImageUrl: null,
        ipfsImageId: null,
        ipfsMetadataId: null,
      }))

      // Mostrar error al usuario
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

      setFormError(userFriendlyError)
    } finally {
      setIsSubmittingForm(false)
    }
  }

  const updateField = (field: keyof TokenData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleImageUpload = (file: File | null, ipfsUrl: string | null) => {
    setFormData((prev) => ({
      ...prev,
      imageFile: file,
    }))
  }

  const isFormValid = () => {
    return (
      formData.tokenName.trim() !== "" &&
      formData.tokenSymbol.trim() !== "" &&
      formData.initialSupply.trim() !== "" &&
      formData.decimals >= 0
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
    marginTop: "2rem",
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
    return "Create Token"
  }

  const getButtonDisabled = () => {
    if (connecting || isSubmittingForm) return true
    if (!connected) return false
    return !isFormValid()
  }

  const buttonStyles: React.CSSProperties = {
    width: "100%",
    padding: "1rem 2rem",
    fontSize: "1.1rem",
    fontWeight: "600",
    backgroundColor: getButtonDisabled() ? theme.textSecondary : theme.buttonPrimary,
    color: theme.buttonText,
    border: "none",
    borderRadius: "0.75rem",
    cursor: getButtonDisabled() ? "not-allowed" : "pointer",
    transition: "background-color 0.2s ease",
    marginTop: "2rem",
    fontFamily: "system-ui, -apple-system, sans-serif",
    opacity: getButtonDisabled() ? 0.6 : 1,
  }

  return (
    <form style={formStyles} onSubmit={handleSubmit}>
      {/* Información de wallet cuando está conectado */}
      {connected && publicKey && (
        <div style={walletInfoStyles}>
          <div style={{ fontSize: "0.875rem", color: theme.text, marginBottom: "0.5rem", fontWeight: "500" }}>
            ✅ Wallet Connected
          </div>
          <div style={walletAddressStyles}>{publicKey.toBase58()}</div>
        </div>
      )}

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
        />
        <FormField
          label="Initial Supply"
          value={formData.initialSupply}
          onChange={(value) => updateField("initialSupply", value)}
          placeholder="1000000000"
          required
          theme={theme}
          tooltip="The total number of tokens to create"
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
        description="Recommended for fixed supply tokens. This prevents creating more tokens in the future."
        theme={theme}
      />

      <CheckboxField
        label="Revoke Freeze Authority"
        checked={formData.revokeFreezeAuthority}
        onChange={(checked) => updateField("revokeFreezeAuthority", checked)}
        description="Recommended for most tokens. This prevents freezing token accounts in the future."
        theme={theme}
      />

      {formError && (
        <div
          style={{
            color: "#ef4444",
            fontSize: "0.875rem",
            marginTop: "1rem",
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

      <button
        type="submit"
        style={buttonStyles}
        disabled={getButtonDisabled()}
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
    </form>
  )
}
