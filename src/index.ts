// Exportar componente principal
import { MintMeWidget } from "./MintMeWidget"

// Exportar tipos desde MintMeWidget
export type { MintMeWidgetProps, TokenData, TokenCreationResult } from "./MintMeWidget"

// Exportar sistema de temas
export { ThemeProvider, useTheme } from "./styles/ThemeProvider"
export { lightTheme, darkTheme } from "./styles/theme"
export type { Theme, ThemeColors } from "./styles/theme"

// Exportar componentes principales
export { MintMeWidget }
export { CompactTokenForm } from "./components/compact-token-form"

// Exportación por defecto
export default MintMeWidget
