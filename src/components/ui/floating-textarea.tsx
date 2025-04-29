"use client"

import * as React from "react"
import { cn } from "../../lib/utils"

export interface FloatingTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  hint?: string
  maxCount?: number
  showCount?: boolean
}

const FloatingTextarea = React.forwardRef<HTMLTextAreaElement, FloatingTextareaProps>(
  ({ className, label, hint, maxCount, showCount = false, id, required, value, onChange, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false)
    const [hasValue, setHasValue] = React.useState(false)
    const [count, setCount] = React.useState(0)

    React.useEffect(() => {
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

    return (
      <div className="relative">
        <div className="relative">
          <textarea
            id={id}
            ref={ref}
            value={value}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className={cn(
              "block w-full rounded-md border border-input dark:border-gray-700 bg-background dark:bg-gray-800 px-3 py-2 text-xs",
              "transition-all duration-200 ease-in-out",
              "focus:outline-none focus:ring-2 focus:ring-ring dark:focus:ring-purple-900 focus:border-input dark:focus:border-gray-600",
              "placeholder:text-transparent",
              "min-h-[80px] resize-none",
              className,
            )}
            placeholder={label}
            required={required}
            maxLength={maxCount}
            {...props}
          />
          <label
            htmlFor={id}
            className={cn(
              "absolute left-3 text-xs transition-all duration-200 pointer-events-none",
              isFocused || hasValue
                ? "-top-2 text-xs bg-background dark:bg-gray-800 px-1 text-primary dark:text-purple-400"
                : "top-2 text-muted-foreground dark:text-gray-400",
            )}
          >
            {label}
            {required && <span className="text-destructive dark:text-red-400 ml-1">*</span>}
          </label>
        </div>
        <div className="flex justify-between mt-1">
          {hint && <p className="text-xs text-muted-foreground dark:text-gray-400">{hint}</p>}
          {showCount && maxCount && (
            <p className="text-xs text-muted-foreground dark:text-gray-400 ml-auto">
              {count}/{maxCount}
            </p>
          )}
        </div>
      </div>
    )
  },
)

FloatingTextarea.displayName = "FloatingTextarea"

export { FloatingTextarea }
