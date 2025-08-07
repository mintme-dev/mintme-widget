"use client"

import type React from "react"
import { useState } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { useWalletModal } from "@solana/wallet-adapter-react-ui"
import { FormField } from "./FormField"
import { CheckboxField } from "./CheckboxField"
import { ImageUploadField } from "./ImageUploadField" // Importar el nuevo componente
import type { TokenFormData, ThemeColors, PinataConfig } from "../types"

interface TokenFormProps {
  onSubmit: (data: TokenFormData) => void
  theme: ThemeColors
  pinataConfig?: PinataConfig // Recibir pinataConfig
}

export const TokenForm: React.FC<TokenFormProps> = ({ onSubmit, theme, pinataConfig }) => {
  const { connected, connecting, publicKey } = useWallet()
  const { setVisible } = useWalletModal()
  const [formData, setFormData] = useState<TokenFormData>({
    tokenName: "",
    tokenSymbol: "",
    decimals: 9,
    initialSupply: "",
    projectWebsite: "",
    metadataUrl: "",
    revokeMintAuthority: true,
    revokeFreezeAuthority: true,
    imageFile: null, // Inicializar nuevo campo
    ipfsImageUrl: null, // Inicializar nuevo campo
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!connected) {
      setVisible(true)
      return
    }
    
    onSubmit(formData)
  }

  const updateField = (field: keyof TokenFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleImageUpload = (file: File | null, ipfsUrl: string | null) => {
    setFormData((prev) => ({
      ...prev,
      imageFile: file,
      ipfsImageUrl: ipfsUrl,
    }))
  }

  const isFormValid = () => {
    return (
      formData.tokenName.trim() !== "" &&
      formData.tokenSymbol.trim() !== "" &&
      formData.initialSupply.trim() !== "" &&
      formData.decimals >= 0
      // Opcional: Puedes añadir validación para ipfsImageUrl si es requerido
      // && formData.ipfsImageUrl !== null
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
    if (!connected) return "Connect Wallet"
    return "Create Token"
  }

  const getButtonDisabled = () => {
    if (connecting) return true
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

      {/* Nuevo campo para la carga de imagen IPFS */}
      <ImageUploadField
        label="Token Image"
        theme={theme}
        pinataConfig={pinataConfig}
        onImageUpload={handleImageUpload}
        currentIpfsUrl={formData.ipfsImageUrl || undefined}
      />

      <FormField
        label="Metadata URL"
        type="url"
        value={formData.metadataUrl}
        onChange={(value) => updateField("metadataUrl", value)}
        placeholder="https://ipfs.mintme.dev/metadata.json"
        theme={theme}
        tooltip="URL to your token's metadata JSON file"
        fullWidth
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
