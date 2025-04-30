// @ts-nocheck
// src/services/client-service.ts
import * as web3 from "@solana/web3.js";
import { useState, useEffect } from "react";
import * as tokenService from "./token-service";
import type {
  TokenData,
  TokenCreationResult,
} from "../components/compact-token-form";

interface TokenCreationConfig {
  tokenData: TokenData;
  metadataUri: string;
  wallet: any;
  connection: string;
  cluster: "mainnet" | "devnet" | "testnet";
  onLog?: (log: string) => void;
  partnerWallet?: string;
  partnerAmount?: number;
}

export function useClientServices() {
  const estimateTokenCreationFee = async (
    connection: string
  ): Promise<number> => {
    try {
      return await tokenService.estimateTokenCreationFee(connection);
    } catch (error) {
      console.error("Error estimating fee:", error);
      return 1; // Show error
    }
  };

  const createToken = async (
    params: TokenCreationConfig
  ): Promise<TokenCreationResult> => {
    try {
      return await tokenService.createToken(params);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error("Error creating token:", errorMessage);

      return {
        success: false,
        error: errorMessage,
      };
    }
  };

  return {
    estimateTokenCreationFee,
    createToken,
  };
}
