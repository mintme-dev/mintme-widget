import { PinataSDK } from "pinata"
import type { PinataConfig } from "../types"

/**
 * Sube un archivo de imagen a IPFS usando Pinata.
 * @param file El archivo de imagen a subir.
 * @param config La configuración de Pinata (apiKey, apiSecret, gateway).
 * @returns Una promesa que resuelve con la URL IPFS del archivo subido.
 * @throws Error si la configuración de Pinata es inválida o si la subida falla.
 */
export const uploadImageToPinata = async (file: File, config: PinataConfig): Promise<string> => {
  if (!config.apiKey) {
    throw new Error("Pinata API Key (JWT) is not configured.")
  }

  try {
    const pinata = new PinataSDK({
      pinataJwt: config.apiKey,
      pinataGateway: config.gateway || "gateway.pinata.cloud",
    })

    const uploadResult = await pinata.upload.public.file(file)

    if (!uploadResult || !uploadResult.cid) {
      throw new Error("Pinata upload did not return an IPFS hash.")
    }

    return `https://${config.gateway || "gateway.pinata.cloud"}/ipfs/${uploadResult.cid}`
  } catch (error: any) {
    console.error("Error uploading image to Pinata:", error)
    throw new Error(`Failed to upload image: ${error.message || "Unknown error"}`)
  }
}
