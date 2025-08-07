import type { WalletState } from "../types";
import { type PublicKey, Connection } from "@solana/web3.js";
import type { WalletAdapter } from "@solana/wallet-adapter-base";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  // BackpackWalletAdapter,
  // CoinbaseWalletAdapter,
} from "@solana/wallet-adapter-wallets";

export interface WalletInfo {
  name: string;
  icon: string;
  adapter: WalletAdapter;
  installed: boolean;
}

export class WalletService {
  private state: WalletState = {
    connected: false,
    address: "",
    connecting: false,
    publicKey: null,
    wallet: null,
  };

  private eventTarget: EventTarget;
  private connection: Connection;
  private availableWallets: WalletInfo[] = [];
  private currentAdapter: WalletAdapter | null = null;

  constructor(eventTarget: EventTarget, rpcUrl?: string) {
    this.eventTarget = eventTarget;

    // Configurar conexión RPC
    this.connection = new Connection(
      rpcUrl || "https://api.devnet.solana.com",
      "confirmed"
    );

    // Inicializar wallets disponibles
    this.initializeWallets();

    console.log("🔧 WalletService initialized with real Solana adapters");
  }

  private initializeWallets(): void {
    const walletAdapters = [
      {
        name: "Phantom",
        icon: "👻",
        adapter: new PhantomWalletAdapter(),
      },
      {
        name: "Solflare",
        icon: "🔥",
        adapter: new SolflareWalletAdapter(),
      },
      // {
      //   name: "Backpack",
      //   icon: "🎒",
      //   adapter: new BackpackWalletAdapter(),
      // },
      // {
      //   name: "Coinbase",
      //   icon: "🔵",
      //   adapter: new CoinbaseWalletAdapter(),
      // },
    ];

    this.availableWallets = walletAdapters.map((wallet) => ({
      ...wallet,
      installed: this.isWalletInstalled(wallet.adapter),
    }));

    console.log(
      "🔍 Available wallets:",
      this.availableWallets.map(
        (w) => `${w.name}: ${w.installed ? "✅" : "❌"}`
      )
    );
  }

  private isWalletInstalled(adapter: WalletAdapter): boolean {
    try {
      // Verificar si la wallet está instalada en el navegador
      if (adapter.name === "Phantom") {
        return !!(window as any).phantom?.solana;
      }
      if (adapter.name === "Solflare") {
        return !!(window as any).solflare;
      }
      // if (adapter.name === "Backpack") {
      //   return !!(window as any).backpack;
      // }
      // if (adapter.name === "Coinbase Wallet") {
      //   return !!(window as any).coinbaseSolana;
      // }

      return adapter.readyState === "Installed";
    } catch (error) {
      console.warn(`Error checking ${adapter.name} installation:`, error);
      return false;
    }
  }

  async connectWallet(walletName?: string): Promise<void> {
    if (this.state.connected || this.state.connecting) {
      console.log("⚠️ Wallet already connected or connecting");
      return;
    }

    this.state.connecting = true;
    this.emitLoadingEvent(true);

    try {
      // Si no se especifica wallet, usar la primera disponible
      const targetWallet = walletName
        ? this.availableWallets.find((w) => w.name === walletName)
        : this.availableWallets.find((w) => w.installed);

      if (!targetWallet) {
        throw new Error("No wallet available or specified");
      }

      if (!targetWallet.installed) {
        throw new Error(`${targetWallet.name} wallet is not installed`);
      }

      console.log(`🔗 Connecting to ${targetWallet.name}...`);

      const adapter = targetWallet.adapter;
      this.currentAdapter = adapter;

      // Configurar event listeners del adapter
      this.setupAdapterListeners(adapter);

      // Conectar wallet
      await adapter.connect();

      if (!adapter.publicKey) {
        throw new Error("Failed to get public key from wallet");
      }

      // Actualizar estado
      this.state = {
        connected: true,
        address: adapter.publicKey.toString(),
        connecting: false,
        publicKey: adapter.publicKey,
        wallet: adapter,
      };

      console.log(`✅ ${targetWallet.name} connected:`, this.state.address);

      this.emitEvent("wallet-connected", {
        publicKey: this.state.address,
        walletName: targetWallet.name,
      });
      this.emitSuccessMessage(`${targetWallet.name} connected successfully!`);
    } catch (error) {
      this.state.connecting = false;
      this.currentAdapter = null;

      const errorMessage =
        error instanceof Error ? error.message : "Failed to connect wallet";
      console.error("❌ Wallet connection failed:", errorMessage);

      this.emitEvent("error", { message: errorMessage });
      throw error;
    } finally {
      this.emitLoadingEvent(false);
    }
  }

  private setupAdapterListeners(adapter: WalletAdapter): void {
    // Limpiar listeners anteriores si existen
    if (this.currentAdapter && this.currentAdapter !== adapter) {
      this.cleanupAdapterListeners(this.currentAdapter);
    }

    adapter.on("connect", (publicKey: PublicKey) => {
      console.log("🔗 Wallet adapter connected:", publicKey.toString());
    });

    adapter.on("disconnect", () => {
      console.log("🔌 Wallet adapter disconnected");
      this.handleWalletDisconnect();
    });

    adapter.on("error", (error: any) => {
      console.error("❌ Wallet adapter error:", error);
      this.emitEvent("error", {
        message: error.message || "Wallet error occurred",
      });
    });
  }

  private cleanupAdapterListeners(adapter: WalletAdapter): void {
    try {
      adapter.removeAllListeners();
    } catch (error) {
      console.warn("⚠️ Error cleaning up adapter listeners:", error);
    }
  }

  private handleWalletDisconnect(): void {
    this.state = {
      connected: false,
      address: "",
      connecting: false,
      publicKey: null,
      wallet: null,
    };

    this.emitEvent("wallet-disconnected", {});
    console.log("🔌 Wallet disconnected");
  }

  async disconnectWallet(): Promise<void> {
    if (!this.state.connected || !this.currentAdapter) {
      return;
    }

    try {
      console.log("🔌 Disconnecting wallet...");

      await this.currentAdapter.disconnect();
      this.cleanupAdapterListeners(this.currentAdapter);
      this.currentAdapter = null;

      this.handleWalletDisconnect();
    } catch (error) {
      console.error("❌ Error disconnecting wallet:", error);
      // Forzar desconexión local aunque falle la desconexión del adapter
      this.handleWalletDisconnect();
    }
  }

  getAvailableWallets(): { name: string; icon: string; installed: boolean }[] {
    return this.availableWallets.map((wallet) => ({
      name: wallet.name,
      icon: wallet.icon,
      installed: wallet.installed,
    }));
  }

  getState(): WalletState {
    return { ...this.state };
  }

  isConnected(): boolean {
    return this.state.connected && !!this.state.publicKey;
  }

  getAddress(): string {
    return this.state.address;
  }

  getPublicKey(): PublicKey | null {
    return this.state.publicKey;
  }

  getWallet(): WalletAdapter | null {
    return this.state.wallet;
  }

  getConnection(): Connection {
    return this.connection;
  }

  // Método para firmar transacciones
  async signTransaction(transaction: any): Promise<any> {
    if (!this.state.connected || !this.currentAdapter) {
      throw new Error("Wallet not connected");
    }

    if (!this.currentAdapter.signTransaction) {
      throw new Error("Wallet does not support transaction signing");
    }

    try {
      console.log("✍️ Signing transaction...");
      const signedTransaction = await this.currentAdapter.signTransaction(
        transaction
      );
      console.log("✅ Transaction signed");
      return signedTransaction;
    } catch (error) {
      console.error("❌ Transaction signing failed:", error);
      throw error;
    }
  }

  async signAllTransactions(transactions: any[]): Promise<any[]> {
    if (!this.state.connected || !this.currentAdapter) {
      throw new Error("Wallet not connected");
    }

    if (!this.currentAdapter.signAllTransactions) {
      throw new Error("Wallet does not support multiple transaction signing");
    }

    try {
      console.log(`✍️ Signing ${transactions.length} transactions...`);
      const signedTransactions = await this.currentAdapter.signAllTransactions(
        transactions
      );
      console.log("✅ All transactions signed");
      return signedTransactions;
    } catch (error) {
      console.error("❌ Multiple transaction signing failed:", error);
      throw error;
    }
  }

  async signMessage(message: Uint8Array): Promise<Uint8Array> {
    if (!this.state.connected || !this.currentAdapter) {
      throw new Error("Wallet not connected");
    }

    if (!this.currentAdapter.signMessage) {
      throw new Error("Wallet does not support message signing");
    }

    try {
      console.log("✍️ Signing message...");
      const signature = await this.currentAdapter.signMessage(message);
      console.log("✅ Message signed");
      return signature;
    } catch (error) {
      console.error("❌ Message signing failed:", error);
      throw error;
    }
  }

  // Método para obtener balance
  async getBalance(): Promise<number> {
    if (!this.state.publicKey) {
      throw new Error("Wallet not connected");
    }

    try {
      const balance = await this.connection.getBalance(this.state.publicKey);
      return balance / 1e9; // Convertir lamports a SOL
    } catch (error) {
      console.error("❌ Failed to get balance:", error);
      throw error;
    }
  }

  // Actualizar RPC URL
  updateRpcUrl(rpcUrl: string): void {
    this.connection = new Connection(rpcUrl, "confirmed");
    console.log("🔄 RPC URL updated:", rpcUrl);
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

  private emitSuccessMessage(message: string): void {
    this.emitEvent("success-message", { message });
  }
}
