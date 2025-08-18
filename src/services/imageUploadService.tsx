import { PinataSDK } from "pinata"
import type { PinataConfig, PinataUploadResult } from "../types/index"

/**
 * Upload file to IPFS Pinata
 * @param file File to upload
 * @param config Pinata Config (apiKey, gateway).
 * @returns Promise with result (URL, ID, hash).
 * @throws Error if config is not correctly.
 */
export const uploadImageToPinata = async (file: File, config: PinataConfig): Promise<PinataUploadResult> => {
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
      throw new Error("Pinata upload did not return a CID.")
    }

    const url = `https://${config.gateway || "gateway.pinata.cloud"}/ipfs/${uploadResult.cid}`

    return {
      url: url,
      id: uploadResult.id, // ID IPFS to delete if don't do.
      hash: uploadResult.cid, // Hash IPFS
    }
  } catch (error: any) {
    console.error("Error uploading image to Pinata:", error)
    throw new Error(`Failed to upload image: ${error.message || "Unknown error"}`)
  }
}
