"use client"

import * as React from "react"
import styled, { css, keyframes } from "styled-components"
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"
import { Check, ChevronRight, Circle } from "lucide-react"

// Animaciones
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`

const fadeOut = keyframes`
  from { opacity: 1; }
  to { opacity: 0; }
`

const zoomIn = keyframes`
  from { transform: scale(0.95); }
  to { transform: scale(1); }
`

const zoomOut = keyframes`
  from { transform: scale(1); }
  to { transform: scale(0.95); }
`

const slideInFromTop = keyframes`
  from { transform: translateY(-2px); }
  to { transform: translateY(0); }
`

const slideInFromRight = keyframes`
  from { transform: translateX(2px); }
  to { transform: translateX(0); }
`

const slideInFromBottom = keyframes`
  from { transform: translateY(2px); }
  to { transform: translateY(0); }
`

const slideInFromLeft = keyframes`
  from { transform: translateX(-2px); }
  to { transform: translateX(0); }
`

// Componentes base
const DropdownMenu = DropdownMenuPrimitive.Root
const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger
const DropdownMenuGroup = DropdownMenuPrimitive.Group
const DropdownMenuPortal = DropdownMenuPrimitive.Portal
const DropdownMenuSub = DropdownMenuPrimitive.Sub
const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup

// Estilos compartidos para contenido
const contentStyles = css`
  z-index: 50;
  min-width: 8rem;
  overflow: hidden;
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.background};
  padding: ${({ theme }) => theme.spacing[1]};
  color: ${({ theme }) => theme.colors.text};
  box-shadow: ${({ theme }) => theme.shadows.md};
  
  &[data-state="open"] {
    animation: ${fadeIn} 200ms ease-out, ${zoomIn} 200ms ease-out;
  }
  
  &[data-state="closed"] {
    animation: ${fadeOut} 200ms ease-in, ${zoomOut} 200ms ease-in;
  }
  
  &[data-side="top"] {
    animation-name: ${fadeIn}, ${zoomIn}, ${slideInFromBottom};
  }
  
  &[data-side="right"] {
    animation-name: ${fadeIn}, ${zoomIn}, ${slideInFromLeft};
  }
  
  &[data-side="bottom"] {
    animation-name: ${fadeIn}, ${zoomIn}, ${slideInFromTop};
  }
  
  &[data-side="left"] {
    animation-name: ${fadeIn}, ${zoomIn}, ${slideInFromRight};
  }
`

// SubTrigger
const StyledSubTrigger = styled(DropdownMenuPrimitive.SubTrigger)<{ inset?: boolean }>`
  display: flex;
  cursor: default;
  user-select: none;
  align-items: center;
  border-radius: ${({ theme }) => theme.radii.sm};
  padding: ${({ theme }) => `${theme.spacing[1.5]} ${theme.spacing[2]}`};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  outline: none;
  transition: background-color 200ms, color 200ms;
  
  ${({ inset }) =>
    inset &&
    `
    padding-left: ${({ theme }) => theme.spacing[8]};
  `}
  
  &:focus, &[data-state="open"] {
    background-color: ${({ theme }) => theme.colors.backgroundAlt};
  }
`

const SubTriggerChevron = styled(ChevronRight)`
  margin-left: auto;
  height: 1rem;
  width: 1rem;
`

// SubContent
const StyledSubContent = styled(DropdownMenuPrimitive.SubContent)`
  ${contentStyles}
`

// Content
const StyledContent = styled(DropdownMenuPrimitive.Content)`
  ${contentStyles}
`

// MenuItem
const StyledMenuItem = styled(DropdownMenuPrimitive.Item)<{ inset?: boolean }>`
  position: relative;
  display: flex;
  cursor: default;
  user-select: none;
  align-items: center;
  border-radius: ${({ theme }) => theme.radii.sm};
  padding: ${({ theme }) => `${theme.spacing[1.5]} ${theme.spacing[2]}`};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  outline: none;
  transition: background-color 200ms, color 200ms;
  
  ${({ inset }) =>
    inset &&
    `
    padding-left: ${({ theme }) => theme.spacing[8]};
  `}
  
  &:focus {
    background-color: ${({ theme }) => theme.colors.backgroundAlt};
    color: ${({ theme }) => theme.colors.text};
  }
  
  &[data-disabled] {
    pointer-events: none;
    opacity: 0.5;
  }
`

// CheckboxItem
const StyledCheckboxItem = styled(DropdownMenuPrimitive.CheckboxItem)`
  position: relative;
  display: flex;
  cursor: default;
  user-select: none;
  align-items: center;
  border-radius: ${({ theme }) => theme.radii.sm};
  padding: ${({ theme }) => `${theme.spacing[1.5]} ${theme.spacing[2]} ${theme.spacing[1.5]} ${theme.spacing[8]}`};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  outline: none;
  transition: background-color 200ms, color 200ms;
  
  &:focus {
    background-color: ${({ theme }) => theme.colors.backgroundAlt};
    color: ${({ theme }) => theme.colors.text};
  }
  
  &[data-disabled] {
    pointer-events: none;
    opacity: 0.5;
  }
`

const CheckboxItemIndicatorWrapper = styled.span`
  position: absolute;
  left: ${({ theme }) => theme.spacing[2]};
  display: flex;
  height: 0.875rem;
  width: 0.875rem;
  align-items: center;
  justify-content: center;
`

const StyledCheck = styled(Check)`
  height: 1rem;
  width: 1rem;
`

// RadioItem
const StyledRadioItem = styled(DropdownMenuPrimitive.RadioItem)`
  position: relative;
  display: flex;
  cursor: default;
  user-select: none;
  align-items: center;
  border-radius: ${({ theme }) => theme.radii.sm};
  padding: ${({ theme }) => `${theme.spacing[1.5]} ${theme.spacing[2]} ${theme.spacing[1.5]} ${theme.spacing[8]}`};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  outline: none;
  transition: background-color 200ms, color 200ms;
  
  &:focus {
    background-color: ${({ theme }) => theme.colors.backgroundAlt};
    color: ${({ theme }) => theme.colors.text};
  }
  
  &[data-disabled] {
    pointer-events: none;
    opacity: 0.5;
  }
`

const RadioItemIndicatorWrapper = styled.span`
  position: absolute;
  left: ${({ theme }) => theme.spacing[2]};
  display: flex;
  height: 0.875rem;
  width: 0.875rem;
  align-items: center;
  justify-content: center;
`

const StyledCircle = styled(Circle)`
  height: 0.5rem;
  width: 0.5rem;
  fill: currentColor;
`

// Label
const StyledLabel = styled(DropdownMenuPrimitive.Label)<{ inset?: boolean }>`
  padding: ${({ theme }) => `${theme.spacing[1.5]} ${theme.spacing[2]}`};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  
  ${({ inset }) =>
    inset &&
    `
    padding-left: ${({ theme }) => theme.spacing[8]};
  `}
`

// Separator
const StyledSeparator = styled(DropdownMenuPrimitive.Separator)`
  margin: ${({ theme }) => `${theme.spacing[1]} -${theme.spacing[1]}`};
  height: 1px;
  background-color: ${({ theme }) => theme.colors.border};
`

// Shortcut
const StyledShortcut = styled.span`
  margin-left: auto;
  font-size: ${({ theme }) => theme.fontSizes.xs};
  letter-spacing: 0.05em;
  opacity: 0.6;
`

// Componentes con forwardRef
const DropdownMenuSubTrigger = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubTrigger> & {
    inset?: boolean
  }
>(({ children, inset, ...props }, ref) => (
  <StyledSubTrigger ref={ref} inset={inset} {...props}>
    {children}
    <SubTriggerChevron />
  </StyledSubTrigger>
))
DropdownMenuSubTrigger.displayName = DropdownMenuPrimitive.SubTrigger.displayName

const DropdownMenuSubContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent>
>(({ ...props }, ref) => <StyledSubContent ref={ref} {...props} />)
DropdownMenuSubContent.displayName = DropdownMenuPrimitive.SubContent.displayName

const DropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(({ sideOffset = 4, ...props }, ref) => (
  <DropdownMenuPrimitive.Portal>
    <StyledContent ref={ref} sideOffset={sideOffset} {...props} />
  </DropdownMenuPrimitive.Portal>
))
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName

const DropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & {
    inset?: boolean
  }
>(({ inset, ...props }, ref) => <StyledMenuItem ref={ref} inset={inset} {...props} />)
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName

const DropdownMenuCheckboxItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.CheckboxItem>
>(({ children, ...props }, ref) => (
  <StyledCheckboxItem ref={ref} {...props}>
    <CheckboxItemIndicatorWrapper>
      <DropdownMenuPrimitive.ItemIndicator>
        <StyledCheck />
      </DropdownMenuPrimitive.ItemIndicator>
    </CheckboxItemIndicatorWrapper>
    {children}
  </StyledCheckboxItem>
))
DropdownMenuCheckboxItem.displayName = DropdownMenuPrimitive.CheckboxItem.displayName

const DropdownMenuRadioItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.RadioItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.RadioItem>
>(({ children, ...props }, ref) => (
  <StyledRadioItem ref={ref} {...props}>
    <RadioItemIndicatorWrapper>
      <DropdownMenuPrimitive.ItemIndicator>
        <StyledCircle />
      </DropdownMenuPrimitive.ItemIndicator>
    </RadioItemIndicatorWrapper>
    {children}
  </StyledRadioItem>
))
DropdownMenuRadioItem.displayName = DropdownMenuPrimitive.RadioItem.displayName

const DropdownMenuLabel = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label> & {
    inset?: boolean
  }
>(({ inset, ...props }, ref) => <StyledLabel ref={ref} inset={inset} {...props} />)
DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName

const DropdownMenuSeparator = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(({ ...props }, ref) => <StyledSeparator ref={ref} {...props} />)
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName

const DropdownMenuShortcut = ({ ...props }: React.HTMLAttributes<HTMLSpanElement>) => {
  return <StyledShortcut {...props} />
}
DropdownMenuShortcut.displayName = "DropdownMenuShortcut"

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
}
