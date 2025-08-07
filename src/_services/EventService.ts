import type { WidgetEvents, WidgetEventType } from "../types";

export class EventService {
  private eventTarget: EventTarget;

  constructor(eventTarget: EventTarget) {
    this.eventTarget = eventTarget;
  }

  emit<T extends WidgetEventType>(type: T, detail: WidgetEvents[T]): void {
    this.eventTarget.dispatchEvent(
      new CustomEvent(type, {
        detail,
        bubbles: true,
        composed: true,
      })
    );
  }

  emitCustom(type: string, detail: any): void {
    this.eventTarget.dispatchEvent(
      new CustomEvent(type, {
        detail,
        bubbles: true,
        composed: true,
      })
    );
  }

  listen(type: string, callback: (event: CustomEvent) => void): void {
    this.eventTarget.addEventListener(type, callback as EventListener);
  }

  unlisten(type: string, callback: (event: CustomEvent) => void): void {
    this.eventTarget.removeEventListener(type, callback as EventListener);
  }

  // Métodos de conveniencia para eventos comunes
  emitLoading(isLoading: boolean): void {
    this.emit("loading", { isLoading });
  }

  emitError(message: string, code?: string): void {
    this.emit("error", { message, code });
  }

  emitWalletConnected(publicKey: string): void {
    this.emit("wallet-connected", { publicKey });
  }

  emitWalletDisconnected(): void {
    this.emit("wallet-disconnected", {});
  }

  emitTokenCreated(signature: string, tokenAddress: string): void {
    this.emit("token-created", { signature, tokenAddress });
  }

  emitMint(message: string): void {
    this.emit("mint", { message });
  }
}
