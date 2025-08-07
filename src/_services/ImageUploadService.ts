export interface PinataUploadResponse {
  IpfsHash: string;
  PinSize: number;
  Timestamp: string;
}

export interface ImageUploadResult {
  success: boolean;
  url?: string;
  hash?: string;
  error?: string;
}

export interface MetadataUploadResult {
  success: boolean;
  uri?: string;
  hash?: string;
  error?: string;
}

export interface TokenMetadata {
  name: string;
  symbol: string;
  description: string;
  image: string;
  external_url?: string;
  attributes: Array<{
    trait_type: string;
    value: string | number;
  }>;
}

export class ImageUploadService {
  private eventTarget: EventTarget;
  private apiKey: string;
  private secretKey: string;
  private baseUrl = "https://api.pinata.cloud";

  constructor(eventTarget: EventTarget, apiKey?: string, secretKey?: string) {
    this.eventTarget = eventTarget;

    // ✅ CORREGIDO: Usar import.meta.env en lugar de process.env
    this.apiKey = apiKey || import.meta.env.VITE_PINATA_API_KEY || "";
    this.secretKey = secretKey || import.meta.env.VITE_PINATA_SECRET_KEY || "";

    if (!this.apiKey || !this.secretKey) {
      console.warn(
        "⚠️ Pinata API credentials not found. Image upload will be simulated."
      );
      console.log(
        "💡 Add VITE_PINATA_API_KEY and VITE_PINATA_SECRET_KEY to your .env file"
      );
    } else {
      console.log("✅ Pinata credentials loaded successfully");
    }
  }

  /**
   * Sube una imagen a IPFS usando Pinata
   */
  async uploadImage(file: File): Promise<ImageUploadResult> {
    try {
      this.addLog(
        `Starting image upload: ${file.name} (${this.formatFileSize(
          file.size
        )})`
      );

      // Validar archivo
      if (!this.isValidImageFile(file)) {
        throw new Error(
          "Invalid image file. Only PNG, JPG, and GIF are supported."
        );
      }

      // Si no hay credenciales, simular upload
      if (!this.apiKey || !this.secretKey) {
        return this.simulateImageUpload(file);
      }

      // Crear FormData para la subida
      const formData = new FormData();
      formData.append("file", file);

      // Metadata para Pinata
      const pinataMetadata = JSON.stringify({
        name: `token-image-${Date.now()}`,
        keyvalues: {
          type: "token-image",
          originalName: file.name,
          uploadedAt: new Date().toISOString(),
        },
      });
      formData.append("pinataMetadata", pinataMetadata);

      // Opciones de Pinata
      const pinataOptions = JSON.stringify({
        cidVersion: 0,
      });
      formData.append("pinataOptions", pinataOptions);

      this.addLog("Uploading to Pinata IPFS...");

      const response = await fetch(`${this.baseUrl}/pinning/pinFileToIPFS`, {
        method: "POST",
        headers: {
          pinata_api_key: this.apiKey,
          pinata_secret_api_key: this.secretKey,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(
          `Pinata upload failed: ${response.status} - ${errorData}`
        );
      }

      const result: PinataUploadResponse = await response.json();
      const imageUrl = `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`;

      this.addLog(`Image uploaded successfully: ${result.IpfsHash}`);
      this.emitEvent("image-uploaded", {
        url: imageUrl,
        hash: result.IpfsHash,
      });

      return {
        success: true,
        url: imageUrl,
        hash: result.IpfsHash,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to upload image";
      this.addLog(`Image upload failed: ${errorMessage}`);
      this.emitEvent("image-upload-error", { error: errorMessage });

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Crea y sube metadata del token a IPFS
   */
  async uploadMetadata(metadata: TokenMetadata): Promise<MetadataUploadResult> {
    try {
      this.addLog("Creating token metadata...");

      // Si no hay credenciales, simular upload
      if (!this.apiKey || !this.secretKey) {
        return this.simulateMetadataUpload(metadata);
      }

      // Preparar metadata para subida
      const pinataMetadata = {
        name: `token-metadata-${metadata.symbol}-${Date.now()}`,
        keyvalues: {
          type: "token-metadata",
          tokenName: metadata.name,
          tokenSymbol: metadata.symbol,
          uploadedAt: new Date().toISOString(),
        },
      };

      const pinataOptions = {
        cidVersion: 0,
      };

      const data = {
        pinataContent: metadata,
        pinataMetadata,
        pinataOptions,
      };

      this.addLog("Uploading metadata to Pinata IPFS...");

      const response = await fetch(`${this.baseUrl}/pinning/pinJSONToIPFS`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          pinata_api_key: this.apiKey,
          pinata_secret_api_key: this.secretKey,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(
          `Metadata upload failed: ${response.status} - ${errorData}`
        );
      }

      const result: PinataUploadResponse = await response.json();
      const metadataUri = `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`;

      this.addLog(`Metadata uploaded successfully: ${result.IpfsHash}`);
      this.emitEvent("metadata-uploaded", {
        uri: metadataUri,
        hash: result.IpfsHash,
      });

      return {
        success: true,
        uri: metadataUri,
        hash: result.IpfsHash,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to upload metadata";
      this.addLog(`Metadata upload failed: ${errorMessage}`);
      this.emitEvent("metadata-upload-error", { error: errorMessage });

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Crea metadata completa del token
   */
  createTokenMetadata(tokenData: {
    name: string;
    symbol: string;
    description: string;
    imageUrl: string;
    externalUrl?: string;
    decimals: number;
    supply: number;
  }): TokenMetadata {
    return {
      name: tokenData.name,
      symbol: tokenData.symbol,
      description: tokenData.description,
      image: tokenData.imageUrl,
      external_url: tokenData.externalUrl || "",
      attributes: [
        {
          trait_type: "Decimals",
          value: tokenData.decimals,
        },
        {
          trait_type: "Supply",
          value: tokenData.supply,
        },
        {
          trait_type: "Created",
          value: new Date().toISOString(),
        },
      ],
    };
  }

  /**
   * Proceso completo: sube imagen y crea metadata
   */
  async uploadImageAndCreateMetadata(
    imageFile: File,
    tokenData: {
      name: string;
      symbol: string;
      description: string;
      externalUrl?: string;
      decimals: number;
      supply: number;
    }
  ): Promise<{
    imageResult: ImageUploadResult;
    metadataResult: MetadataUploadResult;
  }> {
    // Paso 1: Subir imagen
    const imageResult = await this.uploadImage(imageFile);

    if (!imageResult.success) {
      return {
        imageResult,
        metadataResult: { success: false, error: "Image upload failed" },
      };
    }

    // Paso 2: Crear y subir metadata
    const metadata = this.createTokenMetadata({
      ...tokenData,
      imageUrl: imageResult.url!,
    });

    const metadataResult = await this.uploadMetadata(metadata);

    return { imageResult, metadataResult };
  }

  /**
   * Validar si el archivo es una imagen válida
   */
  private isValidImageFile(file: File): boolean {
    const validTypes = ["image/png", "image/jpeg", "image/jpg", "image/gif"];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!validTypes.includes(file.type)) {
      return false;
    }

    if (file.size > maxSize) {
      return false;
    }

    return true;
  }

  /**
   * Formatear tamaño de archivo
   */
  private formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (
      Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    );
  }

  /**
   * Simular subida de imagen (para desarrollo)
   */
  private async simulateImageUpload(file: File): Promise<ImageUploadResult> {
    this.addLog("Simulating image upload (no Pinata credentials)...");
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const mockHash = `Qm${Math.random().toString(36).substring(2, 15)}`;
    const mockUrl = `https://gateway.pinata.cloud/ipfs/${mockHash}`;

    this.addLog(`Simulated image upload: ${mockHash}`);

    return {
      success: true,
      url: mockUrl,
      hash: mockHash,
    };
  }

  /**
   * Simular subida de metadata (para desarrollo)
   */
  private async simulateMetadataUpload(
    metadata: TokenMetadata
  ): Promise<MetadataUploadResult> {
    this.addLog("Simulating metadata upload (no Pinata credentials)...");
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const mockHash = `Qm${Math.random().toString(36).substring(2, 15)}`;
    const mockUri = `https://gateway.pinata.cloud/ipfs/${mockHash}`;

    this.addLog(`Simulated metadata upload: ${mockHash}`);

    return {
      success: true,
      uri: mockUri,
      hash: mockHash,
    };
  }

  /**
   * Actualizar credenciales de Pinata
   */
  updateCredentials(apiKey: string, secretKey: string): void {
    this.apiKey = apiKey;
    this.secretKey = secretKey;
    this.addLog("Pinata credentials updated");
  }

  /**
   * Verificar si las credenciales están configuradas
   */
  hasCredentials(): boolean {
    return !!(this.apiKey && this.secretKey);
  }

  private addLog(message: string): void {
    this.emitEvent("log-message", { message });
  }

  private emitEvent(type: string, detail: any): void {
    this.eventTarget.dispatchEvent(
      new CustomEvent(type, {
        detail,
        bubbles: true,
        composed: true,
      })
    );
  }
}
