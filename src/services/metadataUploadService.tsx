import { PinataSDK } from "pinata"
import type { PinataConfig } from "../types"

/**
 * Sube un objeto JSON a IPFS usando Pinata.
 * @param jsonData El objeto JSON a subir.
 * @param config La configuración de Pinata (apiKey, gateway).
 * @param name Un nombre para el archivo JSON en Pinata.
 * @returns Una promesa que resuelve con la URL IPFS del JSON subido.
 * @throws Error si la configuración de Pinata es inválida o si la subida falla.
 */
export const uploadJsonToPinata = async (
  jsonData: object,
  config: PinataConfig,
  name: string,
): Promise<string> => {
  if (!config.apiKey) {
    throw new Error("Pinata API Key (JWT) is not configured.")
  }

  try {
    const pinata = new PinataSDK({
      pinataJwt: config.apiKey,
      pinataGateway: config.gateway || "gateway.pinata.cloud",
    })

    const uploadResult = await pinata.upload.public.json(jsonData)

    if (!uploadResult || !uploadResult.cid) {
      throw new Error("Pinata JSON upload did not return an IPFS hash.")
    }

    return `https://${config.gateway || "gateway.pinata.cloud"}/ipfs/${uploadResult.cid}`
  } catch (error: any) {
    console.error("Error uploading JSON to Pinata:", error)
    throw new Error(`Failed to upload JSON: ${error.message || "Unknown error"}`)
  }
}
