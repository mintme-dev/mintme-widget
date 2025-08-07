import type { WidgetConfig } from "../types";

export class ThemeService {
  private eventTarget: EventTarget;
  private config: WidgetConfig;

  constructor(eventTarget: EventTarget, config: WidgetConfig) {
    this.eventTarget = eventTarget;
    this.config = config;
  }

  updateTheme(element: HTMLElement): void {
    if (this.config.theme === "auto") {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      element.setAttribute("theme", prefersDark ? "dark" : "light");
    } else {
      element.setAttribute("theme", this.config.theme);
    }

    this.emitEvent("theme-changed", { theme: element.getAttribute("theme") });
  }

  toggleTheme(element: HTMLElement): void {
    const currentTheme = element.getAttribute("theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    this.config.theme = newTheme;
    this.updateTheme(element);
  }

  getThemeIcon(element: HTMLElement): string {
    return element.getAttribute("theme") === "dark" ? "☀️" : "🌙";
  }

  updateConfig(newConfig: Partial<WidgetConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  getConfig(): WidgetConfig {
    return { ...this.config };
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
