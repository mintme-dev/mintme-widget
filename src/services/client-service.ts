// src/services/client-service.ts
import { useState, useEffect } from 'react';
import type { TokenData, TokenCreationResult } from "../components/compact-token-form";

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
  const [isLoaded, setIsLoaded] = useState(false);
  const [tokenService, setTokenService] = useState<any>(null);

  useEffect(() => {
    // Cargar dinámicamente el servicio de token
    const loadTokenService = async () => {
      try {
        // Importación dinámica del servicio
        const service = await import('./token-service');
        setTokenService(service);
        setIsLoaded(true);
      } catch (error) {
        console.error("Error loading token service:", error);
      }
    };

    loadTokenService();
  }, []);

  const estimateTokenCreationFee = async (connection: string): Promise<number> => {
    if (!isLoaded || !tokenService) {
      console.warn("Token service not loaded yet");
      return 1; // Valor por defecto
    }
    
    try {
      return await tokenService.estimateTokenCreationFee(connection);
    } catch (error) {
      console.error("Error estimating fee:", error);
      return 1; // Valor por defecto en caso de error
    }
  };

  const createToken = async (params: TokenCreationConfig): Promise<TokenCreationResult> => {
    if (!isLoaded || !tokenService) {
      return {
        success: false,
        error: "Token service not loaded yet"
      };
    }
    
    try {
      return await tokenService.createToken(params);
    } catch (error) {
      console.error("Error creating token:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error creating token"
      };
    }
  };

  return {
    estimateTokenCreationFee,
    createToken,
    isLoaded
  };
}