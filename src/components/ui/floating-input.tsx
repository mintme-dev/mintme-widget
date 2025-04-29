"use client"

import * as React from "react"
import { cn } from "../../lib/utils"

export interface FloatingInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  hint?: string
  error?: boolean
}

const FloatingInput = React.forwardRef<HTMLInputElement, FloatingInputProps>(
  ({ className, label, hint, error = false, id, type, required, value, onChange, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false)
    const [hasValue, setHasValue] = React.useState(false)

    React.useEffect(() => {
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

    return (
      <div className="relative">
        <div className="relative">
          <input
            id={id}
            type={type}
            ref={ref}
            value={value}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className={cn(
              "block w-full rounded-md border bg-background dark:bg-gray-800 px-3 py-2 text-xs",
              "transition-all duration-200 ease-in-out",
              "focus:outline-none focus:ring-2 focus:border-input",
              "placeholder:text-transparent",
              error
                ? "border-red-300 dark:border-red-700 focus:ring-red-200 dark:focus:ring-red-900 focus:border-red-300 dark:focus:border-red-700"
                : "border-input dark:border-gray-700 focus:ring-ring dark:focus:ring-purple-900",
              className,
            )}
            placeholder={label}
            required={required}
            {...props}
          />
          <label
            htmlFor={id}
            className={cn(
              "absolute left-3 text-xs transition-all duration-200 pointer-events-none",
              isFocused || hasValue
                ? "-top-2 text-xs bg-background dark:bg-gray-800 px-1"
                : "top-2 text-muted-foreground dark:text-gray-400",
              error
                ? isFocused || hasValue
                  ? "text-red-500 dark:text-red-400"
                  : "text-red-400 dark:text-red-500"
                : isFocused || hasValue
                  ? "text-primary dark:text-purple-400"
                  : "",
            )}
          >
            {label}
            {required && <span className="text-destructive dark:text-red-400 ml-1">*</span>}
          </label>
        </div>
        {hint && (
          <p
            className={cn(
              "mt-1 text-xs",
              error ? "text-red-500 dark:text-red-400" : "text-muted-foreground dark:text-gray-400",
            )}
          >
            {hint}
          </p>
        )}
      </div>
    )
  },
)

FloatingInput.displayName = "FloatingInput"

export { FloatingInput }
