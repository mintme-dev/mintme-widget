// Define los tipos para nuestro sistema de temas
export interface ThemeColors {
	primary: string
	primaryHover: string
	primaryLight: string
	secondary: string
	secondaryHover: string
	background: string
	backgroundAlt: string
	text: string
	textSecondary: string
	textMuted: string
	border: string
	success: string
	warning: string
	error: string
	info: string
  }
  
  export interface ThemeSpacing {
	[key: string]: string
	0: string
	0.5: string
	1: string
	1.5: string
	2: string
	3: string
	4: string
	5: string
	6: string
	8: string
	9: string
	10: string
	12: string
	16: string
	20: string
  }
  
  export interface ThemeRadii {
	none: string
	sm: string
	md: string
	lg: string
	xl: string
	full: string
  }
  
  export interface ThemeShadows {
	none: string
	sm: string
	md: string
	lg: string
	xl: string
  }
  
  export interface ThemeFontSizes {
	xs: string
	sm: string
	md: string
	lg: string
	xl: string
	"2xl": string
	"3xl": string
  }
  
  export interface ThemeFontWeights {
	normal: number
	medium: number
	semibold: number
	bold: number
  }
  
  export interface ThemeTransitions {
	default: string
	slow: string
	fast: string
  }
  
  export interface Theme {
	colors: ThemeColors
	spacing: ThemeSpacing
	radii: ThemeRadii
	shadows: ThemeShadows
	fontSizes: ThemeFontSizes
	fontWeights: ThemeFontWeights
	transitions: ThemeTransitions
  }
  
  // Tema claro
  export const lightTheme: Theme = {
	colors: {
	  primary: "#8B5CF6", // Violeta
	  primaryHover: "#7C3AED",
	  primaryLight: "#C4B5FD",
	  secondary: "#4F46E5", // Indigo
	  secondaryHover: "#4338CA",
	  background: "#FFFFFF",
	  backgroundAlt: "#F9FAFB",
	  text: "#111827",
	  textSecondary: "#4B5563",
	  textMuted: "#9CA3AF",
	  border: "#E5E7EB",
	  success: "#10B981",
	  warning: "#F59E0B",
	  error: "#EF4444",
	  info: "#3B82F6",
	},
	spacing: {
	  0: "0",
	  0.5: "0.125rem",
	  1: "0.25rem",
	  1.5: "0.375rem",
	  2: "0.5rem",
	  3: "0.75rem",
	  4: "1rem",
	  5: "1.25rem",
	  6: "1.5rem",
	  8: "2rem",
	  9: "2.25rem",
	  10: "2.5rem",
	  12: "3rem",
	  16: "4rem",
	  20: "5rem",
	},
	radii: {
	  none: "0",
	  sm: "0.125rem",
	  md: "0.375rem",
	  lg: "0.5rem",
	  xl: "0.75rem",
	  full: "9999px",
	},
	shadows: {
	  none: "none",
	  sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
	  md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
	  lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
	  xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
	},
	fontSizes: {
	  xs: "0.75rem",
	  sm: "0.875rem",
	  md: "1rem",
	  lg: "1.125rem",
	  xl: "1.25rem",
	  "2xl": "1.5rem",
	  "3xl": "1.875rem",
	},
	fontWeights: {
	  normal: 400,
	  medium: 500,
	  semibold: 600,
	  bold: 700,
	},
	transitions: {
	  default: "all 0.2s ease-in-out",
	  slow: "all 0.3s ease-in-out",
	  fast: "all 0.1s ease-in-out",
	},
  }
  
  // Tema oscuro
  export const darkTheme: Theme = {
	colors: {
	  primary: "#A78BFA", // Violeta más claro para mejor contraste en modo oscuro
	  primaryHover: "#8B5CF6",
	  primaryLight: "#4C1D95",
	  secondary: "#818CF8", // Indigo más claro
	  secondaryHover: "#6366F1",
	  background: "#111827",
	  backgroundAlt: "#1F2937",
	  text: "#F9FAFB",
	  textSecondary: "#D1D5DB",
	  textMuted: "#9CA3AF",
	  border: "#374151",
	  success: "#34D399",
	  warning: "#FBBF24",
	  error: "#F87171",
	  info: "#60A5FA",
	},
	spacing: lightTheme.spacing,
	radii: lightTheme.radii,
	shadows: {
	  none: "none",
	  sm: "0 1px 2px 0 rgba(0, 0, 0, 0.3)",
	  md: "0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)",
	  lg: "0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)",
	  xl: "0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)",
	},
	fontSizes: lightTheme.fontSizes,
	fontWeights: lightTheme.fontWeights,
	transitions: lightTheme.transitions,
  }
  
  // Tema por defecto
  export const defaultTheme = darkTheme
  