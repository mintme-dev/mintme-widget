"use client"

import type React from "react"
import { useState } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { useWalletModal } from "@solana/wallet-adapter-react-ui"
import { FormField } from "./FormField"
import { CheckboxField } from "./CheckboxField"
import { ImageUploadField } from "./ImageUploadField"
import { uploadImageToPinata } from "../services/imageUploadService" // Importación corregida
import { uploadJsonToPinata } from "../services/metadataUploadService" // Nuevo servicio
import type { TokenData, ThemeColors, PinataConfig, TokenCreationResult } from "../types"

interface TokenFormProps {
  onSubmit: (data: TokenData, result: TokenCreationResult) => void
  theme: ThemeColors
  pinataConfig?: PinataConfig
}

export const TokenForm: React.FC<TokenFormProps> = ({ onSubmit, theme, pinataConfig }) => {
  const { connected, connecting, publicKey } = useWallet()
  const { setVisible } = useWalletModal()
  const [formData, setFormData] = useState<TokenData>({
    tokenName: "",
    tokenSymbol: "",
    decimals: 9,
    initialSupply: "",
    projectWebsite: "",
    description: "", // Nuevo campo
    revokeMintAuthority: true,
    revokeFreezeAuthority: true,
    imageFile: null,
    ipfsImageUrl: null, // Se actualizará después de la subida
  })
  const [isSubmittingForm, setIsSubmittingForm] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null) // Limpiar errores previos

    if (!connected) {
      setVisible(true)
      return
    }

    if (!isFormValid()) {
      setFormError("Please fill in all required fields.")
      return
    }

    setIsSubmittingForm(true) // Iniciar estado de envío

    let finalIpfsImageUrl = formData.ipfsImageUrl
    let metadataUri: string | undefined = undefined

    try {
      // 1. Subir imagen a IPFS si hay un archivo seleccionado y no se ha subido aún
      if (formData.imageFile) {
        if (!pinataConfig?.apiKey) {
          throw new Error("Pinata API Key (JWT) is required for image upload.")
        }
        const uploadedImageUrl = await uploadImageToPinata(formData.imageFile, pinataConfig)
        finalIpfsImageUrl = uploadedImageUrl
        // Actualizar el estado local para que ImageUploadField muestre la URL IPFS
        setFormData((prev) => ({ ...prev, ipfsImageUrl: uploadedImageUrl }))
      }

      // 2. Construir el objeto JSON de metadatos
      const metadataJson = {
        name: formData.tokenName,
        symbol: formData.tokenSymbol,
        url: formData.projectWebsite,
        description: formData.description,
        decimals: formData.decimals,
        supply: Number(formData.initialSupply), // Asegurarse de que supply sea un número
        image: finalIpfsImageUrl || "", // Usar la URL de la imagen subida o cadena vacía
      }

      // 3. Subir el JSON de metadatos a Pinata
      if (!pinataConfig?.apiKey) {
        throw new Error("Pinata API Key (JWT) is required for metadata upload.")
      }
      metadataUri = await uploadJsonToPinata(metadataJson, pinataConfig, formData.tokenName)

      // 4. Llamar a la función onSubmit del componente padre
      onSubmit(
        { ...formData, ipfsImageUrl: finalIpfsImageUrl }, // Pasar formData actualizado
        {
          transactionSignature: undefined, // Esto lo llenará el componente padre
          tokenAddress: undefined, // Esto lo llenará el componente padre
          metadataUri: metadataUri, // Pasar el URI de metadatos generado
        },
      )
    } catch (error: any) {
      console.error("Token creation error:", error)
      setFormError(error.message || "Failed to create token. Please try again.")
    } finally {
      setIsSubmittingForm(false) // Finalizar estado de envío
    }
  }

  const updateField = (field: keyof TokenData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleImageUpload = (file: File | null, ipfsUrl: string | null) => {
    // Esta función ahora solo actualiza el archivo local, la subida real ocurre en handleSubmit
    setFormData((prev) => ({
      ...prev,
      imageFile: file,
      // ipfsImageUrl no se actualiza aquí, solo cuando se sube en handleSubmit
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

      {/* Campo para la carga de imagen IPFS (simplificado) */}
      <ImageUploadField
        label="Token Image"
        theme={theme}
        pinataConfig={pinataConfig} // Se pasa para que ImageUploadField pueda acceder a él si lo necesita en el futuro
        onImageUpload={handleImageUpload}
        currentIpfsUrl={formData.ipfsImageUrl || undefined} // Pasa la URL IPFS si ya está disponible
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
        <div style={{ color: "#ef4444", fontSize: "0.875rem", marginTop: "1rem", textAlign: "center" }}>
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
