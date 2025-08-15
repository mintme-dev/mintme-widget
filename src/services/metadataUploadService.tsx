import { PinataSDK } from "pinata"
import type { PinataConfig, PinataUploadResult } from "../types"

/**
 * Sube un objeto JSON a IPFS usando Pinata.
 * @param jsonData El objeto JSON a subir.
 * @param config La configuración de Pinata (apiKey, gateway).
 * @param name Un nombre para el archivo JSON en Pinata.
 * @returns Una promesa que resuelve con el resultado de la subida (URL, ID, hash).
 * @throws Error si la configuración de Pinata es inválida o si la subida falla.
 */
export const uploadJsonToPinata = async (
  jsonData: object,
  config: PinataConfig,
  name: string,
): Promise<PinataUploadResult> => {
  if (!config.apiKey) {
    throw new Error("Pinata API Key (JWT) is not configured.")
  }

  try {
    const pinata = new PinataSDK({
      pinataJwt: config.apiKey,
      pinataGateway: config.gateway || "gateway.pinata.cloud",
    })

    const uploadResult = await pinata.upload.public.json(jsonData, {
      pinataMetadata: {
        name: `${name}_metadata.json`,
      },
    })

    if (!uploadResult || !uploadResult.cid) {
      throw new Error("Pinata JSON upload did not return a CID.")
    }

    const url = `https://${config.gateway || "gateway.pinata.cloud"}/ipfs/${uploadResult.cid}`

    return {
      url: url,
      id: uploadResult.id, // ID de Pinata para poder eliminar
      hash: uploadResult.cid, // Hash IPFS
    }
  } catch (error: any) {
    console.error("Error uploading JSON to Pinata:", error)
    throw new Error(`Failed to upload JSON: ${error.message || "Unknown error"}`)
  }
}
