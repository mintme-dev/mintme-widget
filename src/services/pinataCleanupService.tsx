import { PinataSDK } from "pinata"
import type { PinataConfig } from "../types"

/**
 * Elimina un archivo de IPFS usando Pinata por ID
 * @param pinataId ID del archivo en Pinata
 * @param config Configuración de Pinata
 * @returns Promise<boolean> - true si se eliminó correctamente
 */
export const deleteFromPinataById = async (pinataId: string, config: PinataConfig): Promise<boolean> => {
  if (!config.apiKey) {
    console.warn("Pinata API Key not configured, cannot delete IPFS file")
    return false
  }

  try {
    const pinata = new PinataSDK({
      pinataJwt: config.apiKey,
      pinataGateway: config.gateway || "gateway.pinata.cloud",
    })

    // Eliminar el archivo usando el ID de Pinata
    await pinata.files.public.delete([pinataId])
    console.log(`Successfully deleted Pinata file with ID: ${pinataId}`)
    return true
  } catch (error: any) {
    console.error("Error deleting Pinata file:", error)
    return false
  }
}

/**
 * Elimina múltiples archivos de IPFS por sus IDs
 * @param pinataIds Array de IDs de Pinata para eliminar
 * @param config Configuración de Pinata
 * @returns Promise<number> - Número de archivos eliminados exitosamente
 */
export const deleteMultipleFromPinataByIds = async (
  pinataIds: (string | null | undefined)[],
  config: PinataConfig,
): Promise<number> => {
  const validIds = pinataIds.filter((id): id is string => Boolean(id))

  if (validIds.length === 0) {
    return 0
  }

  console.log(`Attempting to delete ${validIds.length} Pinata files...`)

  try {
    const pinata = new PinataSDK({
      pinataJwt: config.apiKey,
      pinataGateway: config.gateway || "gateway.pinata.cloud",
    })

    // Eliminar todos los archivos de una vez
    await pinata.files.public.delete(validIds)
    console.log(`Successfully deleted ${validIds.length} Pinata files`)
    return validIds.length
  } catch (error: any) {
    console.error("Error deleting multiple Pinata files:", error)

    // Si falla el borrado en lote, intentar uno por uno
    let successCount = 0
    for (const id of validIds) {
      const success = await deleteFromPinataById(id, config)
      if (success) successCount++
    }

    console.log(`Successfully deleted ${successCount}/${validIds.length} Pinata files (fallback method)`)
    return successCount
  }
}

/**
 * Interfaz para manejar el rollback de archivos IPFS
 */
export interface IpfsRollbackManager {
  imageId: string | null
  metadataId: string | null
  cleanup: (config: PinataConfig) => Promise<void>
}

/**
 * Crea un manager para manejar el rollback de archivos IPFS usando IDs de Pinata
 * @returns IpfsRollbackManager
 */
export const createIpfsRollbackManager = (): IpfsRollbackManager => {
  let imageId: string | null = null
  let metadataId: string | null = null

  return {
    get imageId() {
      return imageId
    },
    set imageId(id: string | null) {
      imageId = id
    },

    get metadataId() {
      return metadataId
    },
    set metadataId(id: string | null) {
      metadataId = id
    },

    async cleanup(config: PinataConfig) {
      console.log("🧹 Starting IPFS cleanup due to transaction failure...")
      const deletedCount = await deleteMultipleFromPinataByIds([imageId, metadataId], config)

      if (deletedCount > 0) {
        console.log(`✅ Cleaned up ${deletedCount} IPFS files`)
      } else {
        console.log("ℹ️ No IPFS files to clean up")
      }

      // Reset IDs after cleanup
      imageId = null
      metadataId = null
    },
  }
}
