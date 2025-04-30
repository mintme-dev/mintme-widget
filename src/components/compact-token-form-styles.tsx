import styled from "styled-components"
import { Button } from "./ui/button"
import { Label } from "./ui/label"
import { Upload, Loader2, Info } from "lucide-react"

// Styled Components
export const FormContainer = styled.div`
  width: 100%;
  max-width: 28rem;
  margin: 0 auto;
  background-color: ${({ theme }) => theme.colors.background};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  border-radius: ${({ theme }) => theme.radii.lg};
  overflow: hidden;
  position: relative;
`

export const FormHeader = styled.div`
  background-color: ${({ theme }) => theme.colors.backgroundAlt};
  padding: ${({ theme }) => theme.spacing[1]} ${({ theme }) => theme.spacing[4]};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  justify-content: space-between;
  align-items: center;
`

export const FormContent = styled.form`
  padding: ${({ theme }) => theme.spacing[4]};
  padding-bottom: ${({ theme }) => theme.spacing[9]};
`

export const FormSection = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing[4]};
`

export const WalletStatusContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.backgroundAlt};
  padding: ${({ theme }) => theme.spacing[2]};
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`

export const WalletStatusFlex = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`

export const ConnectedStatus = styled.span`
  display: flex;
  align-items: center;
  color: ${({ theme }) => theme.colors.success};
`

export const DisconnectedStatus = styled.span`
  display: flex;
  align-items: center;
  color: ${({ theme }) => theme.colors.warning};
`

export const WalletAddress = styled.span`
  color: ${({ theme }) => theme.colors.textSecondary};
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: monospace;
`

export const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: ${({ theme }) => theme.spacing[3]};
`

export const ImageUploadContainer = styled.div`
  border: 1px dashed ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: ${({ theme }) => theme.spacing[4]};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: ${({ theme }) => theme.transitions.default};
  
  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
  }
`

export const ImagePreviewContainer = styled.div`
  position: relative;
`

export const ImagePreview = styled.img`
  width: 4rem;
  height: 4rem;
  object-fit: contain;
  border-radius: ${({ theme }) => theme.radii.md};
`

export const RemoveImageButton = styled.button`
  position: absolute;
  top: -0.5rem;
  right: -0.5rem;
  background-color: ${({ theme }) => theme.colors.error};
  color: white;
  border-radius: 50%;
  padding: ${({ theme }) => theme.spacing[1]};
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.error};
    opacity: 0.9;
  }
`

export const UploadIcon = styled(Upload)`
  height: 2rem;
  width: 2rem;
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: ${({ theme }) => theme.spacing[1]};
`

export const UploadText = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  text-align: center;
  margin: 0;
`

export const UploadHint = styled.p`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  margin-top: ${({ theme }) => theme.spacing[0.5]};
  margin-bottom: 0;
`

export const AuthorityToggleContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: ${({ theme }) => theme.spacing[3]};
  padding-top: ${({ theme }) => theme.spacing[1]};
`

export const AuthorityToggleItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`

export const AuthorityLabel = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[1]};
`

export const LabelText = styled(Label)`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textSecondary};
  cursor: pointer;
`

export const InfoIcon = styled(Info)`
  height: 0.875rem;
  width: 0.875rem;
  color: ${({ theme }) => theme.colors.primary};
  cursor: help;
`

export const EstimatedFee = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-top: ${({ theme }) => theme.spacing[2]};
`

export const StatusIndicator = styled.div<{ status?: string }>`
  display: flex;
  align-items: center;
  margin-top: ${({ theme }) => theme.spacing[2]};
  
  ${({ status, theme }) => {
    switch (status) {
      case "uploading_image":
        return `color: ${theme.colors.warning};`
      case "creating_token":
        return `color: ${theme.colors.info};`
      case "success":
        return `color: ${theme.colors.success};`
      case "error":
        return `color: ${theme.colors.error};`
      default:
        return ""
    }
  }}
`

export const SubmitButtonContainer = styled.div`
  margin-top: ${({ theme }) => theme.spacing[5]};
  display: flex;
  justify-content: center;
`

export const SubmitButton = styled(Button)`
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  padding: ${({ theme }) => theme.spacing[1.5]} ${({ theme }) => theme.spacing[6]};
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  transition: ${({ theme }) => theme.transitions.default};
  
  &:hover:not(:disabled) {
    background-color: ${({ theme }) => theme.colors.primaryHover};
  }
  
  &:disabled {
    background-color: ${({ theme }) => theme.colors.primaryLight};
    opacity: 0.7;
  }
`

export const LoaderIcon = styled(Loader2)`
  height: 0.875rem;
  width: 0.875rem;
  margin-right: ${({ theme }) => theme.spacing[1.5]};
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`

export const LogsOverlay = styled.div`
  position: absolute;
  inset: 0;
  background-color: ${({ theme }) => theme.colors.background};
  opacity: 0.95;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing[4]};
`

export const LogsContainer = styled.div`
  width: 100%;
  max-width: 28rem;
  padding: ${({ theme }) => theme.spacing[4]};
  border-radius: ${({ theme }) => theme.radii.lg};
`

export const LogsHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing[3]};
`

export const LogsTitle = styled.h3`
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
`

export const CloseButton = styled.button`
  color: ${({ theme }) => theme.colors.textSecondary};
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    color: ${({ theme }) => theme.colors.text};
  }
`

export const LogsContent = styled.div`
  height: 12rem;
  overflow-y: auto;
  background-color: ${({ theme }) => theme.colors.backgroundAlt};
  padding: ${({ theme }) => theme.spacing[3]};
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: ${({ theme }) => theme.fontSizes.xs};
`

export const LogEntry = styled.div`
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: ${({ theme }) => theme.spacing[1]};
  font-family: monospace;
`

export const LogTimestamp = styled.span`
  color: ${({ theme }) => theme.colors.primary};
  margin-right: ${({ theme }) => theme.spacing[2]};
`

export const SuccessResult = styled.div`
  margin-top: ${({ theme }) => theme.spacing[4]};
  padding-top: ${({ theme }) => theme.spacing[3]};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`

export const SuccessHeader = styled.div`
  display: flex;
  align-items: center;
  color: ${({ theme }) => theme.colors.success};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`

export const ExplorerButton = styled(Button)`
  margin-top: ${({ theme }) => theme.spacing[2]};
  width: 100%;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  border: 1px solid ${({ theme }) => theme.colors.primaryLight};
  color: ${({ theme }) => theme.colors.primary};
  background-color: transparent;
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryLight};
  }
`

export const LogsFooter = styled.div`
  margin-top: ${({ theme }) => theme.spacing[4]};
  display: flex;
  justify-content: flex-end;
`

export const CreditBadge = styled.a`
  position: absolute;
  bottom: ${({ theme }) => theme.spacing[2]};
  right: ${({ theme }) => theme.spacing[2]};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[1]};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  background: linear-gradient(to right, 
    ${({ theme }) => `${theme.colors.primary}10`}, 
    ${({ theme }) => `${theme.colors.primaryHover}10`}
  );
  padding: ${({ theme }) => theme.spacing[1]} ${({ theme }) => theme.spacing[2]};
  border-radius: ${({ theme }) => theme.radii.full};
  color: ${({ theme }) => theme.colors.primary};
  transition: ${({ theme }) => theme.transitions.default};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  text-decoration: none;
  
  &:hover {
    background: linear-gradient(to right, 
      ${({ theme }) => `${theme.colors.primary}20`}, 
      ${({ theme }) => `${theme.colors.primaryHover}20`}
    );
  }
`
