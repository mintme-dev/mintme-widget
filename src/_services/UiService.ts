export interface UIState {
  isLoading: boolean;
  error: string;
  success: string;
  logs: string[];
}

export class UiService {
  private state: UIState = {
    isLoading: false,
    error: "",
    success: "",
    logs: [],
  };

  private eventTarget: EventTarget;

  constructor(eventTarget: EventTarget) {
    this.eventTarget = eventTarget;
  }

  setLoading(loading: boolean): void {
    this.state.isLoading = loading;
    this.emitStateChange();
  }

  setError(message: string, autoHide = true): void {
    this.state.error = message;
    this.state.success = "";
    this.emitStateChange();

    if (autoHide) {
      setTimeout(() => {
        this.clearError();
      }, 5000);
    }
  }

  setSuccess(message: string, autoHide = true): void {
    this.state.success = message;
    this.state.error = "";
    this.emitStateChange();

    if (autoHide) {
      setTimeout(() => {
        this.clearSuccess();
      }, 5000);
    }
  }

  addLog(message: string): void {
    const timestamp = new Date().toLocaleTimeString();
    this.state.logs.push(`[${timestamp}] ${message}`);
    this.emitEvent("log-added", { message, timestamp });
  }

  clearMessages(): void {
    this.state.error = "";
    this.state.success = "";
    this.emitStateChange();
  }

  clearError(): void {
    this.state.error = "";
    this.emitStateChange();
  }

  clearSuccess(): void {
    this.state.success = "";
    this.emitStateChange();
  }

  clearLogs(): void {
    this.state.logs = [];
    this.emitEvent("logs-cleared", {});
  }

  getState(): UIState {
    return { ...this.state };
  }

  isLoading(): boolean {
    return this.state.isLoading;
  }

  hasError(): boolean {
    return this.state.error.length > 0;
  }

  hasSuccess(): boolean {
    return this.state.success.length > 0;
  }

  private emitStateChange(): void {
    this.emitEvent("ui-state-changed", this.getState());
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
