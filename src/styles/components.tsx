import styled from "styled-components"

// Basic styled components that can be used throughout the application

// Box: Basic container with common style properties
export const Box = styled.div`
  box-sizing: border-box;
`

// Flex: Container with display: flex
export const Flex = styled(Box)`
  display: flex;
`

// Grid: Container with display: grid
export const Grid = styled(Box)`
  display: grid;
`

// Text: Component for text with basic styles
export const Text = styled.p<{
  size?: "xs" | "sm" | "md" | "lg" | "xl"
  weight?: "normal" | "medium" | "semibold" | "bold"
  color?: string
}>`
  margin: 0;
  font-size: ${({ theme, size }) => (size ? theme.fontSizes[size] : theme.fontSizes.md)};
  font-weight: ${({ theme, weight }) => (weight ? theme.fontWeights[weight] : theme.fontWeights.normal)};
  color: ${({ theme, color }) => (color ? theme.colors[color] || color : theme.colors.text)};
`

// Heading: Component for headings
export const Heading = styled.h2<{
  size?: "md" | "lg" | "xl" | "2xl" | "3xl"
  weight?: "normal" | "medium" | "semibold" | "bold"
  color?: string
}>`
  margin: 0;
  font-size: ${({ theme, size }) => (size ? theme.fontSizes[size] : theme.fontSizes["xl"])};
  font-weight: ${({ theme, weight }) => (weight ? theme.fontWeights[weight] : theme.fontWeights.semibold)};
  color: ${({ theme, color }) => (color ? theme.colors[color] || color : theme.colors.text)};
`

// Container: Container with maximum width and centered
export const Container = styled(Box)`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 ${({ theme }) => theme.spacing[4]};
`

// Card: Basic card component
export const Card = styled(Box)`
  background-color: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  overflow: hidden;
`

// Button: Basic styled button
export const Button = styled.button<{
  variant?: "primary" | "secondary" | "outline" | "ghost"
  size?: "sm" | "md" | "lg"
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: ${({ theme }) => theme.radii.md};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  transition: ${({ theme }) => theme.transitions.default};
  cursor: pointer;
  
  ${({ theme, variant, size }) => {
    // Styles by variant
    let variantStyles = ""

    switch (variant) {
      case "primary":
        variantStyles = `
          background-color: ${theme.colors.primary};
          color: white;
          border: none;
          
          &:hover:not(:disabled) {
            background-color: ${theme.colors.primaryHover};
          }
        `
        break
      case "secondary":
        variantStyles = `
          background-color: ${theme.colors.secondary};
          color: white;
          border: none;
          
          &:hover:not(:disabled) {
            background-color: ${theme.colors.secondaryHover};
          }
        `
        break
      case "outline":
        variantStyles = `
          background-color: transparent;
          color: ${theme.colors.primary};
          border: 1px solid ${theme.colors.primary};
          
          &:hover:not(:disabled) {
            background-color: ${theme.colors.primaryLight}20;
          }
        `
        break
      case "ghost":
        variantStyles = `
          background-color: transparent;
          color: ${theme.colors.primary};
          border: none;
          
          &:hover:not(:disabled) {
            background-color: ${theme.colors.primaryLight}10;
          }
        `
        break
      default:
        variantStyles = `
          background-color: ${theme.colors.primary};
          color: white;
          border: none;
          
          &:hover:not(:disabled) {
            background-color: ${theme.colors.primaryHover};
          }
        `
    }

    // Styles by size
    let sizeStyles = ""

    switch (size) {
      case "sm":
        sizeStyles = `
          font-size: ${theme.fontSizes.xs};
          padding: ${theme.spacing[1]} ${theme.spacing[2]};
        `
        break
      case "lg":
        sizeStyles = `
          font-size: ${theme.fontSizes.md};
          padding: ${theme.spacing[3]} ${theme.spacing[6]};
        `
        break
      default:
        sizeStyles = `
          font-size: ${theme.fontSizes.sm};
          padding: ${theme.spacing[2]} ${theme.spacing[4]};
        `
    }

    return variantStyles + sizeStyles
  }}
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`

// Divider: Dividing line
export const Divider = styled.hr`
  border: none;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  margin: ${({ theme }) => theme.spacing[4]} 0;
`

// Badge: Small label
export const Badge = styled.span<{
  variant?: "default" | "primary" | "success" | "warning" | "error"
}>`
  display: inline-flex;
  align-items: center;
  padding: ${({ theme }) => `${theme.spacing[0.5]} ${theme.spacing[2]}`};
  border-radius: ${({ theme }) => theme.radii.full};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  
  ${({ theme, variant }) => {
    switch (variant) {
      case "primary":
        return `
          background-color: ${theme.colors.primary}20;
          color: ${theme.colors.primary};
        `
      case "success":
        return `
          background-color: ${theme.colors.success}20;
          color: ${theme.colors.success};
        `
      case "warning":
        return `
          background-color: ${theme.colors.warning}20;
          color: ${theme.colors.warning};
        `
      case "error":
        return `
          background-color: ${theme.colors.error}20;
          color: ${theme.colors.error};
        `
      default:
        return `
          background-color: ${theme.colors.textMuted}20;
          color: ${theme.colors.textSecondary};
        `
    }
  }}
`

// Spinner
export const Spinner = styled.div`
  border: 2px solid ${({ theme }) => theme.colors.backgroundAlt};
  border-top: 2px solid ${({ theme }) => theme.colors.primary};
  border-radius: 50%;
  width: 1.5rem;
  height: 1.5rem;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`

// Input: Basic input field
export const Input = styled.input`
  width: 100%;
  padding: ${({ theme }) => `${theme.spacing[2]} ${theme.spacing[3]}`};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  background-color: transparent;
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  transition: ${({ theme }) => theme.transitions.default};
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 1px ${({ theme }) => theme.colors.primary};
  }
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.textMuted};
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`

// Label: Label for form fields
export const Label = styled.label`
  display: block;
  margin-bottom: ${({ theme }) => theme.spacing[1]};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
`

// FormGroup: Container for form group
export const FormGroup = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing[4]};
`

// ErrorText: Error text for forms
export const ErrorText = styled.p`
  color: ${({ theme }) => theme.colors.error};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  margin-top: ${({ theme }) => theme.spacing[1]};
  margin-bottom: 0;
`

// HelpText: Help text for forms
export const HelpText = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  margin-top: ${({ theme }) => theme.spacing[1]};
  margin-bottom: 0;
`
