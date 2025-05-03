import axios from "axios";

interface PinataConfig {
  apiKey: string;
  apiSecret: string;
}

export class PinataService {
  private apiKey: string;
  private apiSecret: string;
  private baseUrl = "https://api.pinata.cloud";

  constructor(config: PinataConfig) {
    this.apiKey = config.apiKey;
    this.apiSecret = config.apiSecret;
  }

  async uploadImage(file: File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post(
        `${this.baseUrl}/pinning/pinFileToIPFS`,
        formData,
        {
          headers: {
            "Content-Type": `multipart/form-data;`,
            pinata_api_key: this.apiKey,
            pinata_secret_api_key: this.apiSecret,
          },
        }
      );

      if (response.data.IpfsHash) {
        ipfs.mintme.dev;
        return `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;
      }

      throw new Error("Failed to get IPFS hash from Pinata");
    } catch (error) {
      console.error("Error uploading to Pinata:", error);
      throw error;
    }
  }

  async uploadMetadata(metadata: any): Promise<string> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/pinning/pinJSONToIPFS`,
        metadata,
        {
          headers: {
            pinata_api_key: this.apiKey,
            pinata_secret_api_key: this.apiSecret,
          },
        }
      );

      if (response.data.IpfsHash) {
        return `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;
      }

      throw new Error("Failed to get IPFS hash from Pinata");
    } catch (error) {
      console.error("Error uploading metadata to Pinata:", error);
      throw error;
    }
  }
}

// Create a singleton instance
let pinataService: PinataService | null = null;

export function initPinataService(config: PinataConfig): PinataService {
  pinataService = new PinataService(config);
  return pinataService;
}

export function getPinataService(): PinataService {
  if (!pinataService) {
    throw new Error(
      "Pinata service not initialized. Call initPinataService first."
    );
  }
  return pinataService;
}
