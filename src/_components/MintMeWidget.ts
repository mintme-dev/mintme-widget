import type { WidgetConfig, MintTokenData } from "../types";
import { widgetStyles } from "../styles";
import { WalletService } from "../services/WalletService";
import { TokenService } from "../services/TokenService";
import { ThemeService } from "../services/ThemeService";
import { FormService } from "../services/FormService";
import { UiService } from "../services/UiService";
import { EventService } from "../services/EventService";
import { ImageUploadService } from "../services/ImageUploadService";
import { DragDropService } from "../services/DragDropService";

export class MintMeWidget extends HTMLElement {
  private isReady = false;
  private shadow: ShadowRoot;
  private isDragDropInitialized = false;

  // ✅ Cache de elementos DOM
  private elements: {
    walletStatus?: HTMLElement;
    walletAddress?: HTMLElement;
    walletOptions?: HTMLElement;
    disconnectBtn?: HTMLElement;
    errorMessage?: HTMLElement;
    successMessage?: HTMLElement;
    mintForm?: HTMLFormElement;
    mintBtn?: HTMLButtonElement;
    imageUploadArea?: HTMLElement;
    imagePreview?: HTMLElement;
    themeToggle?: HTMLButtonElement;
  } = {};

  // Services
  private walletService: WalletService;
  private tokenService: TokenService;
  private themeService: ThemeService;
  private formService: FormService;
  private uiService: UiService;
  private eventService: EventService;
  private imageUploadService: ImageUploadService;
  private dragDropService: DragDropService;

  // Image state
  private selectedImage: File | null = null;
  private imagePreview: string | null = null;

  constructor() {
    console.log("🏗️ MintMeWidget constructor called");

    try {
      super();
      this.shadow = this.attachShadow({ mode: "open" });

      // Initialize services
      console.log("🔧 Initializing services...");
      this.eventService = new EventService(this);
      this.uiService = new UiService(this);

      const rpcUrl =
        this.getAttribute("rpc-url") || "https://api.devnet.solana.com";
      this.walletService = new WalletService(this, rpcUrl);

      const apiKey =
        this.getAttribute("pinata-api-key") ||
        import.meta.env.VITE_PINATA_API_KEY;
      const secretKey =
        this.getAttribute("pinata-secret-key") ||
        import.meta.env.VITE_PINATA_SECRET_KEY;
      this.imageUploadService = new ImageUploadService(this, apiKey, secretKey);

      this.dragDropService = new DragDropService(this, {
        acceptedTypes: ["image/png", "image/jpeg", "image/jpg", "image/gif"],
        maxFileSize: 10 * 1024 * 1024,
        multiple: false,
      });

      this.tokenService = new TokenService(this);
      this.formService = new FormService(this);
      this.themeService = new ThemeService(this, {
        theme: "light",
        network: "devnet",
      });

      // Setup internal event listeners
      this.setupInternalEventListeners();

      console.log("✅ MintMeWidget constructor completed");
    } catch (error) {
      console.error("❌ Error in MintMeWidget constructor:", error);
      throw error;
    }
  }

  static get observedAttributes() {
    return [
      "theme",
      "network",
      "rpc-url",
      "pinata-api-key",
      "pinata-secret-key",
      "partner-wallet",
      "partner-amount",
    ];
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    console.log(`🔄 Attribute changed: ${name} = ${newValue}`);
    if (oldValue !== newValue) {
      this.initializeFromAttributes();
      if (name === "theme" && this.isReady) {
        this.updateThemeDisplay();
      }
    }
  }

  connectedCallback() {
    console.log("🔗 connectedCallback called");
    this.renderLoading();
    this.initialize().then(() => {
      this.isReady = true;
      this.renderOnce();
    });
  }

  disconnectedCallback() {
    if (this.elements.imageUploadArea && this.isDragDropInitialized) {
      this.dragDropService.destroyDragDrop(this.elements.imageUploadArea);
      this.isDragDropInitialized = false;
      console.log("🗑️ Drag & Drop cleaned up");
    }

    if (this.walletService.isConnected()) {
      this.walletService.disconnectWallet();
      console.log("🗑️ Wallet disconnected on cleanup");
    }
  }

  private initializeFromAttributes() {
    const config: WidgetConfig = {
      theme:
        (this.getAttribute("theme") as "light" | "dark" | "auto") || "light",
      network:
        (this.getAttribute("network") as "mainnet" | "devnet" | "testnet") ||
        "devnet",
      rpcUrl: this.getAttribute("rpc-url") || undefined,
      pinataApiKey:
        this.getAttribute("pinata-api-key") ||
        import.meta.env.VITE_PINATA_API_KEY ||
        undefined,
      pinataSecretKey:
        this.getAttribute("pinata-secret-key") ||
        import.meta.env.VITE_PINATA_SECRET_KEY ||
        undefined,
    };

    this.themeService.updateConfig(config);
    this.themeService.updateTheme(this);

    if (config.rpcUrl) {
      this.walletService.updateRpcUrl(config.rpcUrl);
    }

    if (config.pinataApiKey && config.pinataSecretKey) {
      this.imageUploadService.updateCredentials(
        config.pinataApiKey,
        config.pinataSecretKey
      );
    }
  }

  private setupInternalEventListeners() {
    // UI State changes
    this.eventService.listen("ui-state-changed", (e: any) => {
      this.updateUIState(e.detail);
    });

    // Form events
    this.eventService.listen("form-success", (e: any) => {
      this.showSuccessMessage(e.detail.message);
      this.resetForm();
      this.clearImage();
    });

    this.eventService.listen("form-error", (e: any) => {
      this.showErrorMessage(e.detail.message);
    });

    // Service events
    this.eventService.listen("loading", (e: any) => {
      this.updateLoadingState(e.detail.isLoading);
    });

    this.eventService.listen("success-message", (e: any) => {
      this.showSuccessMessage(e.detail.message);
    });

    this.eventService.listen("error", (e: any) => {
      this.showErrorMessage(e.detail.message);
    });

    this.eventService.listen("log-message", (e: any) => {
      this.uiService.addLog(e.detail.message);
    });

    // Wallet events
    this.eventService.listen("wallet-connected", (e: any) => {
      this.updateWalletConnectedState(e.detail.publicKey);
      this.uiService.addLog(`Wallet connected: ${e.detail.publicKey}`);
    });

    this.eventService.listen("wallet-disconnected", () => {
      this.updateWalletDisconnectedState();
      this.uiService.addLog("Wallet disconnected");
    });

    // Drag & Drop events
    this.eventService.listen("drag-enter", () => {
      this.elements.imageUploadArea?.classList.add("drag-active");
    });

    this.eventService.listen("drag-leave", () => {
      this.elements.imageUploadArea?.classList.remove("drag-active");
    });

    this.eventService.listen("file-selected", (e: any) => {
      this.handleImageSelected(e.detail.file, e.detail.preview);
    });

    this.eventService.listen("file-dropped", (e: any) => {
      if (e.detail.result.success) {
        this.handleImageSelected(e.detail.result.file, e.detail.result.preview);
      }
    });

    this.eventService.listen("file-error", (e: any) => {
      this.showErrorMessage(e.detail.error);
    });

    // Image upload events
    this.eventService.listen("image-uploaded", (e: any) => {
      this.uiService.addLog(`Image uploaded: ${e.detail.url}`);
    });

    this.eventService.listen("metadata-uploaded", (e: any) => {
      this.uiService.addLog(`Metadata uploaded: ${e.detail.uri}`);
    });

    // ✅ NUEVO: Token creation events
    this.eventService.listen("token-created", (e: any) => {
      this.uiService.addLog(
        `🎉 Token created! Signature: ${e.detail.signature}`
      );
      this.uiService.addLog(`🪙 Token Address: ${e.detail.tokenAddress}`);
    });
  }

  // Métodos de actualización granular (mantenemos los mismos)
  private updateUIState(state: any) {
    this.updateLoadingState(state.isLoading);

    if (state.error) {
      this.showErrorMessage(state.error);
    } else {
      this.hideErrorMessage();
    }

    if (state.success) {
      this.showSuccessMessage(state.success);
    } else {
      this.hideSuccessMessage();
    }
  }

  private updateLoadingState(isLoading: boolean) {
    if (this.elements.mintBtn) {
      this.elements.mintBtn.disabled =
        !this.walletService.isConnected() || isLoading;

      if (isLoading) {
        this.elements.mintBtn.classList.add("btn-loading");
        this.elements.mintBtn.innerHTML =
          '<div class="loading-spinner"></div>Creating Token...';
      } else {
        this.elements.mintBtn.classList.remove("btn-loading");
        this.elements.mintBtn.innerHTML = "Create Token";
      }
    }

    const walletButtons = this.shadow.querySelectorAll(".btn-wallet");
    walletButtons.forEach((btn: any) => {
      btn.disabled = isLoading;
    });

    if (this.elements.disconnectBtn) {
      this.elements.disconnectBtn.disabled = isLoading;
    }
  }

  private updateWalletConnectedState(address: string) {
    if (this.elements.walletStatus) {
      this.elements.walletStatus.className =
        "status-indicator status-connected";
      this.elements.walletStatus.innerHTML = `
        <span class="status-dot"></span>
        Wallet Connected
      `;
    }

    if (this.elements.walletAddress) {
      this.elements.walletAddress.textContent = address;
      this.elements.walletAddress.style.display = "block";
    }

    if (this.elements.walletOptions) {
      this.elements.walletOptions.style.display = "none";
    }
    if (this.elements.disconnectBtn) {
      this.elements.disconnectBtn.style.display = "block";
    }

    if (this.elements.mintBtn) {
      this.elements.mintBtn.disabled = false;
    }
  }

  private updateWalletDisconnectedState() {
    if (this.elements.walletStatus) {
      this.elements.walletStatus.className =
        "status-indicator status-disconnected";
      this.elements.walletStatus.innerHTML = `
        <span class="status-dot"></span>
        Wallet Disconnected
      `;
    }

    if (this.elements.walletAddress) {
      this.elements.walletAddress.style.display = "none";
    }

    if (this.elements.walletOptions) {
      this.elements.walletOptions.style.display = "flex";
    }
    if (this.elements.disconnectBtn) {
      this.elements.disconnectBtn.style.display = "none";
    }

    if (this.elements.mintBtn) {
      this.elements.mintBtn.disabled = true;
    }
  }

  private showErrorMessage(message: string) {
    if (!this.elements.errorMessage) {
      this.elements.errorMessage = document.createElement("div");
      this.elements.errorMessage.className = "message error-message";
      this.elements.successMessage?.parentNode?.insertBefore(
        this.elements.errorMessage,
        this.elements.successMessage
      ) ||
        this.shadow
          .querySelector(".widget-content")
          ?.prepend(this.elements.errorMessage);
    }

    this.elements.errorMessage.textContent = message;
    this.elements.errorMessage.style.display = "block";
    this.hideSuccessMessage();
  }

  private hideErrorMessage() {
    if (this.elements.errorMessage) {
      this.elements.errorMessage.style.display = "none";
    }
  }

  private showSuccessMessage(message: string) {
    if (!this.elements.successMessage) {
      this.elements.successMessage = document.createElement("div");
      this.elements.successMessage.className = "message success-message";
      this.shadow
        .querySelector(".widget-content")
        ?.prepend(this.elements.successMessage);
    }

    this.elements.successMessage.textContent = message;
    this.elements.successMessage.style.display = "block";
    this.hideErrorMessage();
  }

  private hideSuccessMessage() {
    if (this.elements.successMessage) {
      this.elements.successMessage.style.display = "none";
    }
  }

  private updateThemeDisplay() {
    if (this.elements.themeToggle) {
      this.elements.themeToggle.textContent =
        this.themeService.getThemeIcon(this);
    }
  }

  private handleImageSelected(file: File, preview: string) {
    this.selectedImage = file;
    this.imagePreview = preview;
    this.uiService.addLog(
      `Image selected: ${file.name} (${this.formatFileSize(file.size)})`
    );
    this.updateImagePreview();
  }

  private updateImagePreview() {
    if (!this.elements.imageUploadArea) return;

    if (this.imagePreview) {
      this.elements.imageUploadArea.innerHTML = `
        <div class="image-preview-container">
          <img src="${this.imagePreview}" alt="Token preview" class="image-preview" />
          <button type="button" class="remove-image-btn" id="remove-image">×</button>
        </div>
      `;

      const removeBtn =
        this.elements.imageUploadArea.querySelector("#remove-image");
      removeBtn?.addEventListener("click", (e) => {
        e.stopPropagation();
        this.clearImage();
      });
    } else {
      this.elements.imageUploadArea.innerHTML = `
        <input 
          type="file" 
          id="image-input" 
          accept="image/png,image/jpeg,image/gif"
          style="display: none;"
        />
        <svg class="upload-icon" fill="none" stroke="currentColor" viewBox="0 0 48 48">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" />
        </svg>
        <div class="upload-text">Drag and drop an image here, or click to select</div>
        <div class="upload-hint">PNG, JPG or GIF (max 10MB)</div>
      `;

      const fileInput = this.elements.imageUploadArea.querySelector(
        "#image-input"
      ) as HTMLInputElement;
      fileInput?.addEventListener("change", () => {
        const result = this.dragDropService.handleFileInput(fileInput);
        if (result && result.success) {
          this.handleImageSelected(result.file!, result.preview!);
        }
      });
    }
  }

  private clearImage() {
    this.selectedImage = null;
    this.imagePreview = null;
    this.updateImagePreview();
  }

  private resetForm() {
    if (this.elements.mintForm) {
      this.elements.mintForm.reset();
    }
    this.clearImage();
  }

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (
      Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    );
  }

  async initialize() {
    try {
      console.log("⚙️ Initializing widget...");
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("✅ Widget initialized");
    } catch (error) {
      console.error("❌ Error initializing widget:", error);
      this.uiService.setError("Failed to initialize widget");
    }
  }

  renderLoading() {
    this.shadow.innerHTML = `
      <style>${widgetStyles}</style>
      <div class="mintme-widget">
        <div class="loading-container">
          <div class="loading-spinner"></div>
          <div>Loading MintMe Widget...</div>
        </div>
      </div>
    `;
  }

  renderOnce() {
    console.log("🎨 Rendering widget (ONE TIME ONLY)");

    const walletState = this.walletService.getState();
    const availableWallets = this.walletService.getAvailableWallets();

    this.shadow.innerHTML = `
      <style>${widgetStyles}</style>
      <div class="mintme-widget">
        <div class="widget-header">
          <button class="theme-toggle" id="theme-toggle">${this.themeService.getThemeIcon(
            this
          )}</button>
          <h2 class="widget-title">MintMe Widget v2</h2>
          <p class="widget-subtitle">Create your Solana token in minutes</p>
        </div>
        
        <div class="widget-content">
          <!-- Messages (initially hidden) -->
          <div class="message error-message" id="error-message" style="display: none;"></div>
          <div class="message success-message" id="success-message" style="display: none;"></div>

          <!-- Wallet Section -->
          <div class="wallet-section">
            <div class="wallet-status">
              <div class="status-indicator ${
                walletState.connected
                  ? "status-connected"
                  : "status-disconnected"
              }" id="wallet-status">
                <span class="status-dot"></span>
                ${
                  walletState.connected
                    ? "Wallet Connected"
                    : "Wallet Disconnected"
                }
              </div>
            </div>
            <div class="wallet-address" id="wallet-address" style="display: ${
              walletState.connected ? "block" : "none"
            };">
              ${walletState.address}
            </div>
            
            <div class="wallet-options" id="wallet-options" style="display: ${
              walletState.connected ? "none" : "flex"
            };">
              ${availableWallets
                .map(
                  (wallet) => `
                <button 
                  class="btn-wallet ${
                    !wallet.installed ? "wallet-not-installed" : ""
                  }" 
                  data-wallet="${wallet.name}"
                  ${!wallet.installed ? "disabled" : ""}
                >
                  <span class="wallet-icon">${wallet.icon}</span>
                  Connect ${wallet.name}
                  ${
                    !wallet.installed
                      ? '<span class="not-installed-text">(Not Installed)</span>'
                      : ""
                  }
                </button>
              `
                )
                .join("")}
            </div>
            
            <button class="btn btn-secondary btn-full" id="disconnect-btn" style="display: ${
              walletState.connected ? "block" : "none"
            };">
              Disconnect Wallet
            </button>
          </div>

          <!-- Token Creation Form -->
          <form id="mint-form">
            <div class="form-group">
              <label class="form-label" for="token-name">Token Name</label>
              <input 
                class="form-input" 
                type="text" 
                id="token-name" 
                name="name"
                placeholder="My Awesome Token"
                maxlength="32"
                required
              />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="token-symbol">Symbol</label>
                <input 
                  class="form-input" 
                  type="text" 
                  id="token-symbol" 
                  name="symbol"
                  placeholder="MAT"
                  maxlength="10"
                  required
                />
              </div>
              <div class="form-group">
                <label class="form-label" for="token-decimals">Decimals</label>
                <input 
                  class="form-input" 
                  type="number" 
                  id="token-decimals" 
                  name="decimals"
                  value="9"
                  min="0"
                  max="9"
                  required
                />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="token-supply">Initial Supply</label>
              <input 
                class="form-input" 
                type="number" 
                id="token-supply" 
                name="supply"
                placeholder="1000000"
                min="1"
                required
              />
            </div>

            <!-- Image Upload Area -->
            <div class="form-group">
              <label class="form-label">Token Image (Optional)</label>
              <div class="image-upload-area" id="image-upload-area">
                <input 
                  type="file" 
                  id="image-input" 
                  accept="image/png,image/jpeg,image/gif"
                  style="display: none;"
                />
                <svg class="upload-icon" fill="none" stroke="currentColor" viewBox="0 0 48 48">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" />
                </svg>
                <div class="upload-text">Drag and drop an image here, or click to select</div>
                <div class="upload-hint">PNG, JPG or GIF (max 10MB)</div>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="token-description">Description</label>
              <textarea 
                class="form-input form-textarea" 
                id="token-description" 
                name="description"
                placeholder="Describe your token..."
                rows="3"
                maxlength="200"
              ></textarea>
            </div>

            <div class="form-group">
              <label class="form-label" for="token-url">Website URL (Optional)</label>
              <input 
                class="form-input" 
                type="url" 
                id="token-url" 
                name="url"
                placeholder="https://example.com"
              />
            </div>

            <button 
              class="btn btn-full" 
              type="submit"
              id="mint-btn"
              ${!walletState.connected ? "disabled" : ""}
            >
              Create Token
            </button>
          </form>
        </div>
      </div>
    `;

    this.cacheElements();
    this.setupEventListeners();
  }

  private cacheElements() {
    this.elements.walletStatus = this.shadow.getElementById(
      "wallet-status"
    ) as HTMLElement;
    this.elements.walletAddress = this.shadow.getElementById(
      "wallet-address"
    ) as HTMLElement;
    this.elements.walletOptions = this.shadow.getElementById(
      "wallet-options"
    ) as HTMLElement;
    this.elements.disconnectBtn = this.shadow.getElementById(
      "disconnect-btn"
    ) as HTMLButtonElement;
    this.elements.errorMessage = this.shadow.getElementById(
      "error-message"
    ) as HTMLElement;
    this.elements.successMessage = this.shadow.getElementById(
      "success-message"
    ) as HTMLElement;
    this.elements.mintForm = this.shadow.getElementById(
      "mint-form"
    ) as HTMLFormElement;
    this.elements.mintBtn = this.shadow.getElementById(
      "mint-btn"
    ) as HTMLButtonElement;
    this.elements.imageUploadArea = this.shadow.getElementById(
      "image-upload-area"
    ) as HTMLElement;
    this.elements.themeToggle = this.shadow.getElementById(
      "theme-toggle"
    ) as HTMLButtonElement;
  }

  private setupEventListeners() {
    this.elements.themeToggle?.addEventListener("click", () => {
      this.themeService.toggleTheme(this);
      this.updateThemeDisplay();
    });

    const walletButtons = this.shadow.querySelectorAll(".btn-wallet");
    walletButtons.forEach((button) => {
      button.addEventListener("click", async () => {
        const walletName = (button as HTMLElement).dataset.wallet;
        if (walletName) {
          try {
            await this.walletService.connectWallet(walletName);
          } catch (error) {
            console.error("Wallet connection failed:", error);
          }
        }
      });
    });

    this.elements.disconnectBtn?.addEventListener("click", async () => {
      await this.walletService.disconnectWallet();
    });

    if (this.elements.imageUploadArea && !this.isDragDropInitialized) {
      this.dragDropService.initializeDragDrop(this.elements.imageUploadArea);
      this.isDragDropInitialized = true;
      console.log("🎯 Drag & Drop initialized (first time)");

      this.elements.imageUploadArea.addEventListener("click", () => {
        if (!this.imagePreview) {
          const fileInput = this.shadow.getElementById(
            "image-input"
          ) as HTMLInputElement;
          fileInput?.click();
        }
      });
    }

    const fileInput = this.shadow.getElementById(
      "image-input"
    ) as HTMLInputElement;
    fileInput?.addEventListener("change", () => {
      const result = this.dragDropService.handleFileInput(fileInput);
      if (result && result.success) {
        this.handleImageSelected(result.file!, result.preview!);
      }
    });

    this.elements.mintForm?.addEventListener("submit", async (e) => {
      e.preventDefault();
      await this.handleFormSubmit(new FormData(this.elements.mintForm!));
    });
  }

  // ✅ ACTUALIZADO: Usar TokenService real
  private async handleFormSubmit(formData: FormData) {
    try {
      this.uiService.setLoading(true);
      this.uiService.clearMessages();

      const tokenData: MintTokenData = {
        name: formData.get("name") as string,
        symbol: formData.get("symbol") as string,
        description: formData.get("description") as string,
        image: this.selectedImage || undefined,
        decimals: Number.parseInt(formData.get("decimals") as string),
        supply: Number.parseInt(formData.get("supply") as string),
        url: formData.get("url") as string,
        revokeFreeze: true, // Por defecto revocar freeze authority
        revokeMint: false, // Mantener mint authority por defecto
      };

      if (!tokenData.name || !tokenData.symbol) {
        throw new Error("Name and symbol are required");
      }

      // Configuración para el TokenService
      const config = {
        connection:
          this.themeService.getConfig().rpcUrl ||
          "https://api.devnet.solana.com",
        cluster: this.themeService.getConfig().network as
          | "mainnet"
          | "devnet"
          | "testnet",
        partnerWallet: this.getAttribute("partner-wallet") || undefined,
        partnerAmount: Number.parseInt(
          this.getAttribute("partner-amount") || "0"
        ),
      };

      this.uiService.addLog("🚀 Starting token creation process...");

      // ✅ Usar TokenService real que maneja todo el flujo
      const result = await this.tokenService.handleMintToken(
        tokenData,
        this.walletService,
        this.imageUploadService,
        config
      );

      if (result.success) {
        this.uiService.setSuccess(
          `Token "${tokenData.name}" created successfully!`
        );
        this.resetForm();
      } else {
        throw new Error(result.error || "Failed to create token");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create token";
      this.uiService.setError(errorMessage);
      this.uiService.addLog(`❌ Error: ${errorMessage}`);
    } finally {
      this.uiService.setLoading(false);
    }
  }

  // Public API (mantenemos los mismos métodos)
  public getConfig(): WidgetConfig {
    return this.themeService.getConfig();
  }

  public updateConfig(newConfig: Partial<WidgetConfig>) {
    this.themeService.updateConfig(newConfig);
    this.themeService.updateTheme(this);

    if (newConfig.rpcUrl) {
      this.walletService.updateRpcUrl(newConfig.rpcUrl);
    }

    if (newConfig.pinataApiKey && newConfig.pinataSecretKey) {
      this.imageUploadService.updateCredentials(
        newConfig.pinataApiKey,
        newConfig.pinataSecretKey
      );
    }

    if (this.isReady && newConfig.theme) {
      this.updateThemeDisplay();
    }
  }

  public isWalletConnected(): boolean {
    return this.walletService.isConnected();
  }

  public getWalletAddress(): string {
    return this.walletService.getAddress();
  }

  public getAvailableWallets() {
    return this.walletService.getAvailableWallets();
  }

  public hasSelectedImage(): boolean {
    return this.selectedImage !== null;
  }

  public getSelectedImage(): File | null {
    return this.selectedImage;
  }

  public async getWalletBalance(): Promise<number> {
    return this.walletService.getBalance();
  }

  public getWalletConnection() {
    return this.walletService.getConnection();
  }
}
