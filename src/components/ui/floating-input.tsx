"use client"

import type React from "react"
import { useState, useEffect, forwardRef } from "react"
import styled from "styled-components"

// Main Wrapper
const InputContainer = styled.div`
  position: relative;
  margin-bottom: ${({ theme }) => theme.spacing[1]};
`

// Wrapper Input and Label
const InputWrapper = styled.div`
  position: relative;
`

// Input estilizado
const StyledInput = styled.input<{ hasValue: boolean; error?: boolean }>`
  display: block;
  width: 100%;
  padding: ${({ theme }) => `${theme.spacing[2]} ${theme.spacing[3]}`};
  border: 1px solid ${({ theme, error }) => (error ? theme.colors.error : theme.colors.border)};
  border-radius: ${({ theme }) => theme.radii.md};
  background-color: ${({ theme }) => theme.colors.background};
  transition: ${({ theme }) => theme.transitions.default};
  outline: none;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text};
  
  &::placeholder {
    color: transparent;
  }
  
  &:focus {
    border-color: ${({ theme, error }) => (error ? theme.colors.error : theme.colors.primary)};
    box-shadow: 0 0 0 1px ${({ theme, error }) => (error ? theme.colors.error : theme.colors.primary)};
  }
  
  &:focus + label, 
  ${({ hasValue }) =>
    hasValue &&
    `
    + label {
      transform: translateY(-50%) translateX(-10%) scale(0.8);
      background-color: ${({ theme }) => theme.colors.background};
      padding: 0 ${({ theme }) => theme.spacing[1]};
    }
  `}
`

// Label flotante
const FloatingLabel = styled.label<{ isFocused: boolean; hasValue: boolean; error?: boolean }>`
  position: absolute;
  left: ${({ theme }) => theme.spacing[3]};
  top: 50%;
  transform: translateY(-50%);
  color: ${({ theme, isFocused, error }) => {
    if (error) return theme.colors.error
    if (isFocused) return theme.colors.primary
    return theme.colors.textSecondary
  }};
  pointer-events: none;
  transition: ${({ theme }) => theme.transitions.default};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  transform-origin: left top;
  
  ${({ isFocused, hasValue, theme }) =>
    (isFocused || hasValue) &&
    `
    transform: translateY(-50%) translateX(-10%) scale(0.8);
    top: 0;
    background-color: ${theme.colors.background};
    padding: 0 ${theme.spacing[1]};
  `}
`

// Texto de ayuda
const HintText = styled.p<{ error?: boolean }>`
  margin-top: ${({ theme }) => theme.spacing[1]};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme, error }) => (error ? theme.colors.error : theme.colors.textSecondary)};
  text-align: right;
`

// Asterisco para campos requeridos
const RequiredAsterisk = styled.span`
  color: ${({ theme }) => theme.colors.error};
  margin-left: ${({ theme }) => theme.spacing[0.5]};
`

export interface FloatingInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  hint?: string
  error?: boolean | string
}

export const FloatingInput = forwardRef<HTMLInputElement, FloatingInputProps>(
  ({ className, label, hint, error = false, id, type, required, value, onChange, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false)
    const [hasValue, setHasValue] = useState(false)

    // Actualizar el estado hasValue cuando cambia el valor
    useEffect(() => {
      setHasValue(value !== undefined && value !== "")
    }, [value])

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true)
      if (props.onFocus) props.onFocus(e)
    }

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false)
      if (props.onBlur) props.onBlur(e)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(e.target.value !== "")
      if (onChange) onChange(e)
    }

    // Determinar si hay un mensaje de error
    const errorMessage = typeof error === "string" ? error : ""
    const hasError = error === true || !!errorMessage

    return (
      <InputContainer className={className}>
        <InputWrapper>
          <StyledInput
            id={id}
            type={type}
            ref={ref}
            value={value}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            hasValue={hasValue}
            error={hasError}
            placeholder={label}
            required={required}
            {...props}
          />
          <FloatingLabel htmlFor={id} isFocused={isFocused} hasValue={hasValue} error={hasError}>
            {label}
            {required && <RequiredAsterisk>*</RequiredAsterisk>}
          </FloatingLabel>
        </InputWrapper>
        {(hint || errorMessage) && <HintText error={hasError}>{errorMessage || hint}</HintText>}
      </InputContainer>
    )
  },
)

FloatingInput.displayName = "FloatingInput"
