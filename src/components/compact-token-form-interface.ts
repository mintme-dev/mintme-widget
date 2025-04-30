// Constants for Solana token limitations
export const MAX_NAME_LENGTH = 32;
export const MAX_SYMBOL_LENGTH = 10;
export const MIN_DECIMALS = 0;
export const MAX_DECIMALS = 9;
export const MAX_SUPPLY = 18446744073709551615; // u64 max value

export interface TokenFormProps {
  onSubmit?: (tokenData: TokenData, result: TokenCreationResult) => void;
  className?: string;
  connection?: string;
  cluster?: "mainnet" | "devnet" | "testnet";
  partnerWallet?: string;
  partnerAmount?: number;
  showCredit?: boolean;
  theme?: any;
}

export interface TokenData {
  name: string;
  symbol: string;
  decimals: number;
  supply: number;
  image: File | null;
  description: string;
  url: string;
  revokeFreeze: boolean;
  revokeMint: boolean;
}

export interface TokenCreationResult {
  success: boolean;
  txSignature?: string;
  error?: string;
  tokenAddress?: string;
}

export enum FormStatus {
  IDLE = "idle",
  UPLOADING_IMAGE = "uploading_image",
  CREATING_TOKEN = "creating_token",
  SUCCESS = "success",
  ERROR = "error",
}

// Interface for log entries
export interface LogEntry {
  timestamp: string;
  message: string;
}

// Enhanced URL validation function that allows typing
export const isValidUrl = (url: string): boolean => {
  if (!url) return true; // Empty URL is valid (not required)

  // If the user is typing, allow the input
  if (url.length < 8) return true; // Allow typing at least "http://"

  // Only validate URLs that seem complete
  if (url.includes(".")) {
    try {
      // Try to create a URL object to validate
      const urlObj = new URL(url);
      // Verify that the protocol is http or https
      return urlObj.protocol === "http:" || urlObj.protocol === "https:";
    } catch (e) {
      return false;
    }
  }

  return true; // Allow typing while there's no dot (incomplete domain)
};
