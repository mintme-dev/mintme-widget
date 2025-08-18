"use client"

import type React from "react"
import { useState, useCallback, useEffect } from "react"
import type { PinataConfig } from "../types"
import type { ThemeColors } from "../styles/themes"

interface ImageUploadFieldProps {
  label: string
  theme: ThemeColors
  pinataConfig?: PinataConfig // Se mantiene para consistencia, aunque no se usa directamente para subir aquí
  onImageUpload: (file: File | null, ipfsUrl: string | null) => void // ipfsUrl será null inicialmente
  currentIpfsUrl?: string // Para previsualizar una URL ya existente
}

export const ImageUploadField: React.FC<ImageUploadFieldProps> = ({ label, theme, onImageUpload, currentIpfsUrl }) => {
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentIpfsUrl || null)
  const [isDragging, setIsDragging] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)

  // Sincronizar previewUrl si currentIpfsUrl cambia desde el exterior (ej. después de una subida exitosa)
  useEffect(() => {
    if (currentIpfsUrl && currentIpfsUrl !== previewUrl) {
      setPreviewUrl(currentIpfsUrl)
      setFile(null) // Si hay una URL IPFS, no hay un archivo local pendiente de subir
    } else if (!currentIpfsUrl && file === null) {
      setPreviewUrl(null) // Si no hay URL ni archivo, no hay preview
    }
  }, [currentIpfsUrl, previewUrl, file])

  const handleFileChange = useCallback(
    (selectedFile: File | null) => {
      setFile(selectedFile)
      if (selectedFile) {
        setPreviewUrl(URL.createObjectURL(selectedFile))
        onImageUpload(selectedFile, null) // Notificar que hay un archivo local, IPFS URL es null por ahora
      } else {
        setPreviewUrl(null)
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
        if (droppedFile.type.startsWith("image/")) {
          handleFileChange(droppedFile)
        } else {
          // Podrías añadir un mensaje de error aquí si lo deseas
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

  const containerStyles: React.CSSProperties = {
    marginBottom: "0.8rem",
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

  const tooltipContainerStyles: React.CSSProperties = {
    position: "relative",
    display: "inline-block",
  }

  const tooltipStyles: React.CSSProperties = {
    position: "absolute",
    bottom: "calc(100% + 8px)",
    left: "50%",
    transform: "translateX(-50%)",
    backgroundColor: theme.cardBackground,
    color: theme.text,
    padding: "0.5rem 0.75rem",
    borderRadius: "0.5rem",
    fontSize: "0.75rem",
    boxShadow: theme.shadow,
    border: `1px solid ${theme.border}`,
    zIndex: 1000,
    opacity: showTooltip ? 1 : 0,
    visibility: showTooltip ? "visible" : "hidden",
    transition: "opacity 0.2s ease, visibility 0.2s ease",
    fontFamily: "system-ui, -apple-system, sans-serif",
    lineHeight: "1.3",
    width: "200px",
    whiteSpace: "normal",
  }

  const tooltipArrowStyles: React.CSSProperties = {
    position: "absolute",
    top: "100%",
    left: "50%",
    transform: "translateX(-50%)",
    width: 0,
    height: 0,
    borderLeft: "6px solid transparent",
    borderRight: "6px solid transparent",
    borderTop: `6px solid ${theme.border}`,
  }

  const tooltipArrowInnerStyles: React.CSSProperties = {
    position: "absolute",
    top: "-7px",
    left: "50%",
    transform: "translateX(-50%)",
    width: 0,
    height: 0,
    borderLeft: "5px solid transparent",
    borderRight: "5px solid transparent",
    borderTop: `5px solid ${theme.cardBackground}`,
  }

  const dropAreaStyles: React.CSSProperties = {
    border: `2px dashed ${isDragging ? theme.buttonPrimary : theme.inputBorder}`,
    borderRadius: "0.5rem",
    padding: "0.3rem",
    textAlign: "center" as const,
    cursor: "pointer",
    backgroundColor: isDragging ? `${theme.buttonPrimary}10` : theme.inputBackground,
    transition: "all 0.2s ease",
    color: theme.textSecondary,
    fontFamily: "system-ui, -apple-system, sans-serif",
    fontSize: "0.875rem",
    minHeight: "140px", // Añadir altura mínima fija
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  }

  const previewImageStyles: React.CSSProperties = {
    maxWidth: "100%",
    maxHeight: "80px", // Reducir un poco para que quepa con el texto
    borderRadius: "0.5rem",
    marginTop: "0.5rem", // Reducir margen
    objectFit: "contain" as const,
  }

  const fileInfoStyles: React.CSSProperties = {
    marginTop: "0.25rem", // Reducir margen
    fontSize: "0.75rem",
    color: theme.textSecondary,
    fontFamily: "system-ui, -apple-system, sans-serif",
  }

  return (
    <div style={containerStyles}>
      <label style={labelStyles}>
        {label}
        <div style={tooltipContainerStyles}>
          <div
            style={{
              width: "13px",
              height: "13px",
              borderRadius: "50%",
              backgroundColor: theme.textSecondary,
              color: theme.background,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "10px",
              fontWeight: "bold",
              cursor: "help",
              transition: "background-color 0.2s ease",
            }}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            i
          </div>
          <div style={tooltipStyles}>
            Upload an image for your token. Supported formats: PNG, JPG, GIF, SVG (max 10MB)
            <div style={tooltipArrowStyles}>
              <div style={tooltipArrowInnerStyles} />
            </div>
          </div>
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
            {!file &&
              currentIpfsUrl && ( // Mostrar URL si no hay archivo local pero sí una URL IPFS
                <div style={fileInfoStyles}>
                  IPFS URL:{" "}
                  <a
                    href={currentIpfsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: theme.buttonPrimary, textDecoration: "underline" }}
                  >
                    {currentIpfsUrl.substring(0, 30)}...
                  </a>
                </div>
              )}
          </div>
        ) : (
          <div>
            <p style={{ margin: "0 0 0.5rem 0" }}>📁 Drag & drop an image here</p>
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
    </div>
  )
}
