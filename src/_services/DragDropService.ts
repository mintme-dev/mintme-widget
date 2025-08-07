export interface DragDropConfig {
  acceptedTypes: string[];
  maxFileSize: number; // en bytes
  multiple: boolean;
}

export interface FileDropResult {
  success: boolean;
  file?: File;
  error?: string;
  preview?: string;
}

export class DragDropService {
  private eventTarget: EventTarget;
  private config: DragDropConfig;
  private isDragging = false;
  private dragCounter = 0;

  constructor(eventTarget: EventTarget, config: Partial<DragDropConfig> = {}) {
    this.eventTarget = eventTarget;
    this.config = {
      acceptedTypes: ["image/png", "image/jpeg", "image/jpg", "image/gif"],
      maxFileSize: 10 * 1024 * 1024, // 10MB
      multiple: false,
      ...config,
    };
  }

  /**
   * Inicializar drag & drop en un elemento
   */
  initializeDragDrop(element: HTMLElement): void {
    // Prevenir comportamiento por defecto del navegador
    this.preventDefaults(element);

    // Configurar event listeners
    this.setupDragEvents(element);

    console.log("🎯 Drag & Drop initialized on element");
  }

  /**
   * Remover event listeners
   */
  destroyDragDrop(element: HTMLElement): void {
    const events = ["dragenter", "dragover", "dragleave", "drop"];
    events.forEach((event) => {
      element.removeEventListener(event, this.handleDragEvent.bind(this));
    });

    console.log("🗑️ Drag & Drop destroyed");
  }

  /**
   * Manejar selección de archivo desde input
   */
  handleFileInput(input: HTMLInputElement): FileDropResult | null {
    const file = input.files?.[0];
    if (!file) return null;

    return this.processFile(file);
  }

  /**
   * Crear preview de imagen
   */
  async createImagePreview(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        resolve(e.target?.result as string);
      };

      reader.onerror = () => {
        reject(new Error("Failed to read file"));
      };

      reader.readAsDataURL(file);
    });
  }

  /**
   * Validar archivo
   */
  private validateFile(file: File): { valid: boolean; error?: string } {
    // Verificar tipo
    if (!this.config.acceptedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `File type not supported. Accepted: ${this.config.acceptedTypes.join(
          ", "
        )}`,
      };
    }

    // Verificar tamaño
    if (file.size > this.config.maxFileSize) {
      const maxSizeMB = this.config.maxFileSize / (1024 * 1024);
      return {
        valid: false,
        error: `File too large. Maximum size: ${maxSizeMB}MB`,
      };
    }

    return { valid: true };
  }

  /**
   * Procesar archivo dropped o seleccionado
   */
  private async processFile(file: File): Promise<FileDropResult> {
    try {
      // Validar archivo
      const validation = this.validateFile(file);
      if (!validation.valid) {
        this.emitEvent("file-error", { error: validation.error });
        return {
          success: false,
          error: validation.error,
        };
      }

      // Crear preview si es imagen
      let preview: string | undefined;
      if (file.type.startsWith("image/")) {
        preview = await this.createImagePreview(file);
      }

      this.emitEvent("file-selected", { file, preview });

      return {
        success: true,
        file,
        preview,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to process file";
      this.emitEvent("file-error", { error: errorMessage });

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Prevenir comportamientos por defecto
   */
  private preventDefaults(element: HTMLElement): void {
    const events = ["dragenter", "dragover", "dragleave", "drop"];

    events.forEach((event) => {
      element.addEventListener(event, (e) => {
        e.preventDefault();
        e.stopPropagation();
      });
    });

    // También prevenir en document para evitar que el navegador abra el archivo
    events.forEach((event) => {
      document.addEventListener(event, (e) => {
        e.preventDefault();
        e.stopPropagation();
      });
    });
  }

  /**
   * Configurar eventos de drag
   */
  private setupDragEvents(element: HTMLElement): void {
    element.addEventListener("dragenter", this.handleDragEnter.bind(this));
    element.addEventListener("dragover", this.handleDragOver.bind(this));
    element.addEventListener("dragleave", this.handleDragLeave.bind(this));
    element.addEventListener("drop", this.handleDrop.bind(this));
  }

  /**
   * Manejar drag enter
   */
  private handleDragEnter(e: DragEvent): void {
    this.dragCounter++;

    if (!this.isDragging) {
      this.isDragging = true;
      this.emitEvent("drag-enter", {});
      console.log("🎯 Drag enter");
    }
  }

  /**
   * Manejar drag over
   */
  private handleDragOver(e: DragEvent): void {
    // Indicar que se puede hacer drop
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = "copy";
    }
  }

  /**
   * Manejar drag leave
   */
  private handleDragLeave(e: DragEvent): void {
    this.dragCounter--;

    if (this.dragCounter === 0) {
      this.isDragging = false;
      this.emitEvent("drag-leave", {});
      console.log("🎯 Drag leave");
    }
  }

  /**
   * Manejar drop
   */
  private async handleDrop(e: DragEvent): void {
    this.dragCounter = 0;
    this.isDragging = false;

    const files = e.dataTransfer?.files;
    if (!files || files.length === 0) {
      this.emitEvent("drag-leave", {});
      return;
    }

    console.log(`🎯 Files dropped: ${files.length}`);

    // Procesar primer archivo (o todos si multiple está habilitado)
    const file = files[0];
    const result = await this.processFile(file);

    this.emitEvent("file-dropped", { result, file });
    this.emitEvent("drag-leave", {});
  }

  /**
   * Manejar evento genérico
   */
  private handleDragEvent(e: DragEvent): void {
    e.preventDefault();
    e.stopPropagation();
  }

  /**
   * Obtener información del estado actual
   */
  getState() {
    return {
      isDragging: this.isDragging,
      config: this.config,
    };
  }

  /**
   * Actualizar configuración
   */
  updateConfig(newConfig: Partial<DragDropConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log("🔧 DragDrop config updated:", this.config);
  }

  /**
   * Emitir evento personalizado
   */
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
