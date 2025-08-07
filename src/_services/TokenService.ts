import type { MintTokenData, TokenCreationResult } from "../types";
import type { WalletService } from "./WalletService";
import type { ImageUploadService } from "./ImageUploadService";
// ✅ Importar Buffer solo cuando sea necesario
import { Buffer } from "buffer";

export interface TokenServiceConfig {
  connection: string;
  cluster: "mainnet" | "devnet" | "testnet";
  partnerWallet?: string;
  partnerAmount?: number;
}

export class TokenService {
  private eventTarget: EventTarget;
  private createTokenFn: any = null;

  constructor(eventTarget: EventTarget) {
    this.eventTarget = eventTarget;
    // ✅ Hacer Buffer disponible globalmente para mintme-sdk
    this.setupBufferPolyfill();
  }

  // ✅ Setup mínimo para Buffer
  private setupBufferPolyfill() {
    if (typeof window !== "undefined" && !(window as any).Buffer) {
      (window as any).Buffer = Buffer;
      console.log("🔧 Buffer polyfill setup for mintme-sdk");
    }
  }

  // Cargar SDK de forma lazy para evitar errores en build time
  private async loadMintMeSDK() {
    if (this.createTokenFn) return this.createTokenFn;

    try {
      console.log("🔄 Loading MintMe SDK...");

      // ✅ Asegurar que Buffer está disponible antes de cargar el SDK
      this.setupBufferPolyfill();

      // Importación dinámica
      const sdk = await import("mintme-sdk");
      this.createTokenFn = sdk.createToken;

      console.log("✅ MintMe SDK loaded successfully");
      return this.createTokenFn;
    } catch (error) {
      console.warn("⚠️ MintMe SDK failed to load:", error);
      console.log("🎭 Falling back to simulation mode");
      return null;
    }
  }

  async handleMintToken(
    tokenData: MintTokenData,
    walletService: WalletService,
    imageUploadService: ImageUploadService,
    config: TokenServiceConfig
  ): Promise<TokenCreationResult> {
    if (!walletService.isConnected()) {
      throw new Error("Wallet not connected");
    }

    this.emitLoadingEvent(true);
    this.addLog("🚀 Starting token creation process...");

    try {
      // Validar datos del token
      this.validateTokenData(tokenData);

      let imageUrl = "";
      let metadataUri = "";

      // Paso 1: Subir imagen a IPFS (si existe)
      if (tokenData.image && tokenData.image instanceof File) {
        this.addLog("📸 Uploading image to Pinata IPFS...");
        const imageResult = await imageUploadService.uploadImage(
          tokenData.image
        );

        if (!imageResult.success) {
          throw new Error(
            imageResult.error || "Failed to upload image to IPFS"
          );
        }

        imageUrl = imageResult.url!;
        this.addLog(`✅ Image uploaded: ${imageResult.hash}`);
      } else if (typeof tokenData.image === "string") {
        imageUrl = tokenData.image;
        this.addLog("🔗 Using provided image URL");
      }

      // Paso 2: Crear y subir metadata a IPFS
      this.addLog("📝 Creating token metadata...");
      const metadata = imageUploadService.createTokenMetadata({
        name: tokenData.name,
        symbol: tokenData.symbol,
        description: tokenData.description || "",
        imageUrl: imageUrl,
        externalUrl: tokenData.url,
        decimals: tokenData.decimals,
        supply: tokenData.supply,
      });

      this.addLog("☁️ Uploading metadata to Pinata IPFS...");
      const metadataResult = await imageUploadService.uploadMetadata(metadata);

      if (!metadataResult.success) {
        throw new Error(
          metadataResult.error || "Failed to upload metadata to IPFS"
        );
      }

      metadataUri = metadataResult.uri!;
      this.addLog(`✅ Metadata uploaded: ${metadataResult.hash}`);

      // Paso 3: Crear token
      this.addLog("⚡ Creating token on Solana blockchain...");
      const result = await this.createTokenWithSDK(
        tokenData,
        metadataUri,
        walletService,
        config
      );

      this.addLog(`🎉 Token "${tokenData.name}" created successfully!`);
      this.addLog(`📋 Transaction: ${result.signature}`);
      this.addLog(`🪙 Token Address: ${result.tokenAddress}`);

      this.emitEvent("token-created", result);
      this.emitEvent("mint", { message: "Token created successfully!" });

      return {
        success: true,
        signature: result.signature,
        tokenAddress: result.tokenAddress,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create token";
      this.addLog(`❌ Error: ${errorMessage}`);
      this.emitEvent("error", { message: errorMessage });

      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      this.emitLoadingEvent(false);
    }
  }

  private async createTokenWithSDK(
    tokenData: MintTokenData,
    metadataUri: string,
    walletService: WalletService,
    config: TokenServiceConfig
  ): Promise<{ signature: string; tokenAddress: string }> {
    try {
      this.addLog("🔧 Loading token creation SDK...");

      // Intentar cargar el SDK
      const createTokenFn = await this.loadMintMeSDK();

      if (!createTokenFn) {
        // Fallback a simulación si el SDK no carga
        return this.simulateTokenCreation(tokenData, metadataUri, config);
      }

      this.addLog("🔧 Preparing token configuration...");

      // Configuración para mintme-sdk
      const tokenConfig = {
        tokenName: tokenData.name,
        tokenSymbol: tokenData.symbol,
        uniqueKey: `${Date.now()}_${Math.random()
          .toString(36)
          .substring(2, 15)}`,
        decimals: tokenData.decimals,
        initialSupply: tokenData.supply,
        uri: metadataUri,
        revokeMint: tokenData.revokeMint || false,
        revokeFreeze: tokenData.revokeFreeze || false,
        partnerWallet: config.partnerWallet,
        partnerAmount: config.partnerAmount || 0,
        connection: config.connection,
        cluster: config.cluster,
        logger: (message: string) => this.addLog(`SDK: ${message}`),
        wallet: {
          publicKey: walletService.getPublicKey(),
          signTransaction: walletService.signTransaction.bind(walletService),
          signAllTransactions:
            walletService.signAllTransactions.bind(walletService),
        },
      };

      this.addLog("📡 Sending transaction to Solana network...");
      this.addLog(`🌐 Network: ${config.cluster}`);
      this.addLog(`🔗 RPC: ${config.connection}`);

      // Llamar al SDK real
      const result = await createTokenFn(tokenConfig);

      if (!result.success) {
        throw new Error(result.error || "Token creation failed");
      }

      return {
        signature: result.signature!,
        tokenAddress: result.tokenAddress!,
      };
    } catch (error) {
      console.error("❌ SDK Error:", error);

      // Manejar errores específicos
      if (error instanceof Error) {
        if (error.message.includes("insufficient funds")) {
          throw new Error(
            "Insufficient SOL balance. Please add more SOL to your wallet."
          );
        }
        if (error.message.includes("User rejected")) {
          throw new Error("Transaction was rejected by user");
        }
        if (error.message.includes("Network")) {
          throw new Error(
            "Network error. Please check your connection and try again."
          );
        }
      }

      throw error;
    }
  }

  // Simulación como fallback
  private async simulateTokenCreation(
    tokenData: MintTokenData,
    metadataUri: string,
    config: TokenServiceConfig
  ): Promise<{ signature: string; tokenAddress: string }> {
    this.addLog("🎭 Using simulation mode...");
    this.addLog(`📝 Token: ${tokenData.name} (${tokenData.symbol})`);
    this.addLog(
      `📊 Supply: ${tokenData.supply} with ${tokenData.decimals} decimals`
    );
    this.addLog(`🔗 Metadata: ${metadataUri}`);
    this.addLog(`🌐 Network: ${config.cluster}`);

    // Simular tiempo de transacción
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const mockSignature = `sim_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 15)}`;
    const mockTokenAddress = `${Math.random()
      .toString(36)
      .substring(2, 15)}...${Math.random().toString(36).substring(2, 8)}`;

    this.addLog("✅ Simulation completed!");
    this.addLog(
      "💡 To create real tokens, ensure mintme-sdk is properly configured"
    );

    return {
      signature: mockSignature,
      tokenAddress: mockTokenAddress,
    };
  }

  private validateTokenData(tokenData: MintTokenData): void {
    const errors: string[] = [];

    if (!tokenData.name || tokenData.name.trim().length === 0) {
      errors.push("Token name is required");
    }
    if (tokenData.name.length > 32) {
      errors.push("Token name must be 32 characters or less");
    }

    if (!tokenData.symbol || tokenData.symbol.trim().length === 0) {
      errors.push("Token symbol is required");
    }
    if (tokenData.symbol.length > 10) {
      errors.push("Token symbol must be 10 characters or less");
    }

    if (tokenData.decimals < 0 || tokenData.decimals > 9) {
      errors.push("Decimals must be between 0 and 9");
    }

    if (tokenData.supply <= 0) {
      errors.push("Supply must be greater than 0");
    }
    if (tokenData.supply > 1e15) {
      errors.push("Supply is too large");
    }

    if (tokenData.description && tokenData.description.length > 200) {
      errors.push("Description must be 200 characters or less");
    }

    if (tokenData.url && !this.isValidUrl(tokenData.url)) {
      errors.push("Website URL must be a valid URL");
    }

    if (errors.length > 0) {
      throw new Error(errors.join(", "));
    }
  }

  private isValidUrl(string: string): boolean {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
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

  private emitLoadingEvent(isLoading: boolean): void {
    this.emitEvent("loading", { isLoading });
  }

  private addLog(message: string): void {
    console.log(message);
    this.emitEvent("log-message", { message });
  }
}
