import { PinataSDK } from "pinata"
import type { PinataConfig, PinataUploadResult } from "../types"

/**
 * Uploads a JSON object to IPFS using Pinata.
 * @param jsonData The JSON object to upload.
 * @param config Pinata configuration (apiKey, gateway).
 * @param name A name for the JSON file in Pinata.
 * @returns A promise that resolves with the upload result (URL, ID, hash).
 * @throws Error if the Pinata configuration is invalid or if the upload fails.
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
      id: uploadResult.id, // Pinata ID (useful for deletion)
      hash: uploadResult.cid, // IPFS hash
    }
  } catch (error: any) {
    console.error("Error uploading JSON to Pinata:", error)
    throw new Error(`Failed to upload JSON: ${error.message || "Unknown error"}`)
  }
}
