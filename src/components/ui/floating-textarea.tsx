"use client"

import type React from "react"
import { useState, useEffect, forwardRef } from "react"
import styled from "styled-components"

// Wrapper
const TextareaContainer = styled.div`
  position: relative;
  margin-bottom: ${({ theme }) => theme.spacing[1]};
`

// Textarea and label
const TextareaWrapper = styled.div`
  position: relative;
`

// Textarea
const StyledTextarea = styled.textarea<{ hasValue: boolean; error?: boolean }>`
  display: block;
  width: 100%;
  min-height: 80px;
  padding: ${({ theme }) => `${theme.spacing[2]} ${theme.spacing[3]}`};
  border: 1px solid ${({ theme, error }) => (error ? theme.colors.error : theme.colors.border)};
  border-radius: ${({ theme }) => theme.radii.md};
  background-color: ${({ theme }) => theme.colors.background};
  transition: ${({ theme }) => theme.transitions.default};
  outline: none;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text};
  resize: none;
  
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

// Label
const FloatingLabel = styled.label<{ isFocused: boolean; hasValue: boolean; error?: boolean }>`
  position: absolute;
  left: ${({ theme }) => theme.spacing[3]};
  top: ${({ theme }) => theme.spacing[2]};
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

// Hint and counter
const FooterContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: ${({ theme }) => theme.spacing[1]};
`

// Help
const HintText = styled.p<{ error?: boolean }>`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme, error }) => (error ? theme.colors.error : theme.colors.textSecondary)};
  margin: 0;
`

// Count chars
const CountText = styled.p<{ isNearLimit?: boolean; isAtLimit?: boolean }>`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  margin: 0;
  margin-left: auto;
  color: ${({ theme, isNearLimit, isAtLimit }) => {
    if (isAtLimit) return theme.colors.error
    if (isNearLimit) return theme.colors.warning
    return theme.colors.textSecondary
  }};
`

// Required fields
const RequiredAsterisk = styled.span`
  color: ${({ theme }) => theme.colors.error};
  margin-left: ${({ theme }) => theme.spacing[0.5]};
`

export interface FloatingTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  hint?: string
  error?: boolean | string
  maxCount?: number
  showCount?: boolean
}

export const FloatingTextarea = forwardRef<HTMLTextAreaElement, FloatingTextareaProps>(
  (
    { className, label, hint, error = false, maxCount, showCount = false, id, required, value, onChange, ...props },
    ref,
  ) => {
    const [isFocused, setIsFocused] = useState(false)
    const [hasValue, setHasValue] = useState(false)
    const [count, setCount] = useState(0)

    // Update state
    useEffect(() => {
      if (typeof value === "string") {
        setHasValue(value !== "")
        setCount(value.length)
      }
    }, [value])

    const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      setIsFocused(true)
      if (props.onFocus) props.onFocus(e)
    }

    const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      setIsFocused(false)
      if (props.onBlur) props.onBlur(e)
    }

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setHasValue(e.target.value !== "")
      setCount(e.target.value.length)
      if (onChange) onChange(e)
    }

    const errorMessage = typeof error === "string" ? error : ""
    const hasError = error === true || !!errorMessage

    const isNearLimit = maxCount ? count >= maxCount * 0.8 : false
    const isAtLimit = maxCount ? count >= maxCount : false

    return (
      <TextareaContainer className={className}>
        <TextareaWrapper>
          <StyledTextarea
            id={id}
            ref={ref}
            value={value}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            hasValue={hasValue}
            error={hasError}
            placeholder={label}
            required={required}
            maxLength={maxCount}
            {...props}
          />
          <FloatingLabel htmlFor={id} isFocused={isFocused} hasValue={hasValue} error={hasError}>
            {label}
            {required && <RequiredAsterisk>*</RequiredAsterisk>}
          </FloatingLabel>
        </TextareaWrapper>

        {(hint || errorMessage || (showCount && maxCount)) && (
          <FooterContainer>
            {(hint || errorMessage) && <HintText error={hasError}>{errorMessage || hint}</HintText>}
            {showCount && maxCount && (
              <CountText isNearLimit={isNearLimit} isAtLimit={isAtLimit}>
                {count}/{maxCount}
              </CountText>
            )}
          </FooterContainer>
        )}
      </TextareaContainer>
    )
  },
)

FloatingTextarea.displayName = "FloatingTextarea"
