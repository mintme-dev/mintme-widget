"use client"

import type React from "react"
import { useState, useCallback } from "react"
import type { PinataConfig } from "../types"
import type { ThemeColors } from "../styles/themes"

interface ImageUploadFieldProps {
  label: string
  theme: ThemeColors
  pinataConfig?: PinataConfig
  onImageUpload: (file: File | null, ipfsUrl: string | null) => void
  currentIpfsUrl?: string
}

export const ImageUploadField: React.FC<ImageUploadFieldProps> = ({
  label,
  theme,
  pinataConfig,
  onImageUpload,
  currentIpfsUrl,
}) => {
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentIpfsUrl || null)
  const [isDragging, setIsDragging] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleFileChange = useCallback(
    (selectedFile: File | null) => {
      setFile(selectedFile)
      if (selectedFile) {
        setPreviewUrl(URL.createObjectURL(selectedFile))
        setUploadStatus("idle")
        setErrorMessage(null)
        onImageUpload(selectedFile, null) // Notificar que hay un archivo local, IPFS URL es null por ahora
      } else {
        setPreviewUrl(null)
        setUploadStatus("idle")
        setErrorMessage(null)
        onImageUpload(null, null)
      }
    },
    [onImageUpload],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setIsDragging(false)
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        const droppedFile = e.dataTransfer.files[0]
        // Validar que sea una imagen
        if (droppedFile.type.startsWith('image/')) {
          handleFileChange(droppedFile)
        } else {
          setErrorMessage("Please select a valid image file.")
        }
      }
    },
    [handleFileChange],
  )

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleUpload = useCallback(async () => {
    if (!file) {
      setErrorMessage("Please select an image first.")
      return
    }
    if (!pinataConfig?.apiKey || !pinataConfig?.apiSecret) {
      setErrorMessage("Pinata API keys are not configured.")
      return
    }

    setUploadStatus("uploading")
    setErrorMessage(null)

    try {
      // Usar el SDK de Pinata en lugar de fetch directo
      const { PinataSDK } = await import("pinata")
      
      const pinata = new PinataSDK({
        pinataJwt: pinataConfig.apiKey, // Asumiendo que usaremos JWT
        pinataGateway: "gateway.pinata.cloud" // Gateway por defecto
      })

      const upload = await pinata.upload.file(file)
      const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${upload.IpfsHash}`
      
      setPreviewUrl(ipfsUrl)
      setUploadStatus("success")
      onImageUpload(file, ipfsUrl) // Notificar la URL IPFS
    } catch (error: any) {
      setUploadStatus("error")
      setErrorMessage(error.message || "An unknown error occurred during upload.")
      onImageUpload(file, null) // Notificar que falló la carga IPFS
      console.error("Pinata upload error:", error)
    }
  }, [file, pinataConfig, onImageUpload])

  const containerStyles: React.CSSProperties = {
    marginBottom: "1.5rem",
    width: "100%",
  }

  const labelStyles: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    marginBottom: "0.5rem",
    fontSize: "0.875rem",
    fontWeight: "500",
    color: theme.text,
    fontFamily: "system-ui, -apple-system, sans-serif",
  }

  const dropAreaStyles: React.CSSProperties = {
    border: `2px dashed ${isDragging ? theme.buttonPrimary : theme.inputBorder}`,
    borderRadius: "0.5rem",
    padding: "2rem",
    textAlign: "center" as const,
    cursor: "pointer",
    backgroundColor: isDragging ? `${theme.buttonPrimary}10` : theme.inputBackground,
    transition: "all 0.2s ease",
    color: theme.textSecondary,
    fontFamily: "system-ui, -apple-system, sans-serif",
    fontSize: "0.875rem",
  }

  const previewImageStyles: React.CSSProperties = {
    maxWidth: "100%",
    maxHeight: "200px",
    borderRadius: "0.5rem",
    marginTop: "1rem",
    objectFit: "contain" as const,
  }

  const uploadButtonStyles: React.CSSProperties = {
    marginTop: "1rem",
    padding: "0.75rem 1.5rem",
    fontSize: "0.875rem",
    fontWeight: "600",
    backgroundColor: uploadStatus === "uploading" ? theme.textSecondary : theme.buttonPrimary,
    color: theme.buttonText,
    border: "none",
    borderRadius: "0.5rem",
    cursor: uploadStatus === "uploading" ? "not-allowed" : "pointer",
    opacity: uploadStatus === "uploading" ? 0.6 : 1,
    transition: "background-color 0.2s ease",
    fontFamily: "system-ui, -apple-system, sans-serif",
  }

  const statusMessageStyles: React.CSSProperties = {
    marginTop: "0.5rem",
    fontSize: "0.75rem",
    color:
      uploadStatus === "success"
        ? "#22c55e"
        : uploadStatus === "error"
        ? "#ef4444"
        : theme.textSecondary,
    fontFamily: "system-ui, -apple-system, sans-serif",
  }

  const fileInfoStyles: React.CSSProperties = {
    marginTop: "0.5rem",
    fontSize: "0.75rem",
    color: theme.textSecondary,
    fontFamily: "system-ui, -apple-system, sans-serif",
  }

  return (
    <div style={containerStyles}>
      <label style={labelStyles}>
        {label}
        <div style={{
          width: "16px",
          height: "16px",
          borderRadius: "50%",
          backgroundColor: theme.textSecondary,
          color: theme.background,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "12px",
          fontWeight: "bold",
          cursor: "help",
        }} title="Upload an image for your token. Supported formats: PNG, JPG, GIF, SVG">
          i
        </div>
      </label>
      
      <div
        style={dropAreaStyles}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => document.getElementById("fileInput")?.click()}
      >
        {previewUrl ? (
          <div>
            <img src={previewUrl || "/placeholder.svg"} alt="Token Image Preview" style={previewImageStyles} />
            {file && (
              <div style={fileInfoStyles}>
                {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </div>
            )}
          </div>
        ) : (
          <div>
            <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📁</div>
            <p style={{ margin: "0 0 0.5rem 0" }}>Drag & drop an image here</p>
            <p style={{ margin: "0", fontSize: "0.75rem", opacity: 0.7 }}>or click to select</p>
            <p style={{ margin: "0.5rem 0 0 0", fontSize: "0.75rem", opacity: 0.7 }}>
              Supported: PNG, JPG, GIF, SVG (max 10MB)
            </p>
          </div>
        )}
        <input
          id="fileInput"
          type="file"
          accept="image/*"
          onChange={(e) => handleFileChange(e.target.files ? e.target.files[0] : null)}
          style={{ display: "none" }}
        />
      </div>
      
      {file && uploadStatus !== "success" && (
        <div style={{ textAlign: "center", marginTop: "1rem" }}>
          <button
            style={uploadButtonStyles}
            onClick={handleUpload}
            disabled={uploadStatus === "uploading"}
            onMouseEnter={(e) => {
              if (uploadStatus !== "uploading") {
                e.currentTarget.style.backgroundColor = theme.buttonPrimaryHover
              }
            }}
            onMouseLeave={(e) => {
              if (uploadStatus !== "uploading") {
                e.currentTarget.style.backgroundColor = theme.buttonPrimary
              }
            }}
          >
            {uploadStatus === "uploading" ? "Uploading to IPFS..." : "Upload to IPFS"}
          </button>
        </div>
      )}
      
      {uploadStatus !== "idle" && (
        <div style={{ textAlign: "center" }}>
          <p style={statusMessageStyles}>
            {uploadStatus === "success" && "✅ Upload successful! Image available on IPFS"}
            {uploadStatus === "uploading" && "⏳ Uploading to IPFS..."}
            {uploadStatus === "error" && `❌ Error: ${errorMessage}`}
          </p>
        </div>
      )}
    </div>
  )
}
