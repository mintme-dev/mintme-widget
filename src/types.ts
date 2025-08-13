import type { PublicKey } from "@solana/web3.js";
import type { WalletAdapter } from "@solana/wallet-adapter-base";

export interface PinataConfig {
  apiKey: string // JWT token para Pinata
  apiSecret?: string // Opcional, para compatibilidad con versiones anteriores
  gateway?: string // Gateway personalizado, por defecto "gateway.pinata.cloud"
}

export interface MintTokenData {
  name: string;
  symbol: string;
  description: string;
  image?: string | File;
  decimals: number;
  supply: number;
  url?: string;
  revokeFreeze?: boolean;
  revokeMint?: boolean;
}

export interface WidgetConfig {
  theme: "light" | "dark" | "auto";
  network: "mainnet" | "devnet" | "testnet";
  rpcUrl?: string;
  pinataApiKey?: string;
  pinataSecretKey?: string;
}

export interface WidgetEvents {
  "wallet-connected": { publicKey: string };
  "wallet-disconnected": {};
  "token-created": { signature: string; tokenAddress: string };
  mint: { message: string };
  error: { message: string; code?: string };
  loading: { isLoading: boolean };
  "theme-changed": { theme: string };
  "log-message": { message: string };
}

export type WidgetEventType = keyof WidgetEvents;

export interface WalletState {
  connected: boolean;
  address: string;
  connecting: boolean;
  publicKey: PublicKey | null;
  wallet: WalletAdapter | null;
}

export interface TokenCreationResult {
  success: boolean;
  signature?: string;
  tokenAddress?: string;
  error?: string;
}

// Enums para estados
export enum FormStatus {
  IDLE = "idle",
  UPLOADING_IMAGE = "uploading_image",
  CREATING_TOKEN = "creating_token",
  SUCCESS = "success",
  ERROR = "error",
}

// Constantes de validación
export const MAX_NAME_LENGTH = 32;
export const MAX_SYMBOL_LENGTH = 10;
export const MIN_DECIMALS = 0;
export const MAX_DECIMALS = 9;
export const MAX_SUPPLY = 1e15;

export interface LogEntry {
  timestamp: string;
  message: string;
}
