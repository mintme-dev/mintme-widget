import type { MintTokenData } from "../types";

export class FormService {
  private eventTarget: EventTarget;

  constructor(eventTarget: EventTarget) {
    this.eventTarget = eventTarget;
  }

  extractFormData(formData: FormData): MintTokenData {
    return {
      name: formData.get("name") as string,
      symbol: formData.get("symbol") as string,
      description: formData.get("description") as string,
      image: (formData.get("image") as string) || undefined,
      decimals: Number.parseInt(formData.get("decimals") as string),
      supply: Number.parseInt(formData.get("supply") as string),
    };
  }

  async handleFormSubmit(
    formData: FormData,
    tokenService: any,
    walletAddress: string
  ): Promise<boolean> {
    try {
      const tokenData = this.extractFormData(formData);

      // Validar datos antes de enviar
      this.validateFormData(tokenData);

      const result = await tokenService.handleMintToken(
        tokenData,
        walletAddress
      );

      if (result.success) {
        this.emitEvent("form-success", {
          message: `Token "${tokenData.name}" created successfully!`,
          tokenData,
          result,
        });
        return true;
      } else {
        this.emitEvent("form-error", { message: result.error });
        return false;
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Form submission failed";
      this.emitEvent("form-error", { message: errorMessage });
      return false;
    }
  }

  validateFormData(tokenData: MintTokenData): void {
    const errors: string[] = [];

    if (!tokenData.name?.trim()) {
      errors.push("Token name is required");
    } else if (tokenData.name.length > 32) {
      errors.push("Token name must be 32 characters or less");
    }

    if (!tokenData.symbol?.trim()) {
      errors.push("Token symbol is required");
    } else if (tokenData.symbol.length > 10) {
      errors.push("Token symbol must be 10 characters or less");
    }

    if (tokenData.decimals < 0 || tokenData.decimals > 9) {
      errors.push("Decimals must be between 0 and 9");
    }

    if (tokenData.supply <= 0) {
      errors.push("Supply must be greater than 0");
    } else if (tokenData.supply > 1e15) {
      errors.push("Supply is too large");
    }

    if (tokenData.description && tokenData.description.length > 200) {
      errors.push("Description must be 200 characters or less");
    }

    if (tokenData.image && !this.isValidUrl(tokenData.image)) {
      errors.push("Image must be a valid URL");
    }

    if (errors.length > 0) {
      throw new Error(errors.join(", "));
    }
  }

  resetForm(shadowRoot: ShadowRoot): void {
    const form = shadowRoot.getElementById("mint-form") as HTMLFormElement;
    if (form) {
      form.reset();
    }
  }

  private isValidUrl(string: string): boolean {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  }

  private emitEvent(type: string, detail: any): void {
    this.eventTarget.dispatchEvent(
      new CustomEvent(type, {
        detail,
        bubbles: true,
        composed: true,
      })
    );
  }
}
