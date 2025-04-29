// src/shims/solana-web3.ts
import * as web3 from '@solana/web3.js';

// Re-exportar todo el módulo
export * from '@solana/web3.js';

// También proporcionar un export por defecto para compatibilidad
export default web3;