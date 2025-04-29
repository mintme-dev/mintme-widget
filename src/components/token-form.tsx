"use client"

import type React from "react"

import { useState, useRef, type ChangeEvent } from "react"
import { Info, Upload, X } from "lucide-react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Textarea } from "./ui/textarea"
import { Switch } from "./ui/switch"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card"

// Constants for Solana token limitations
const MAX_NAME_LENGTH = 32
const MAX_SYMBOL_LENGTH = 10
const MIN_DECIMALS = 0
const MAX_DECIMALS = 9
const MAX_SUPPLY = 18446744073709551615 // u64 max value

interface TokenFormProps {
  onSubmit: (tokenData: TokenData) => void
  className?: string
}

export interface TokenData {
  name: string
  symbol: string
  decimals: number
  supply: number
  image: File | null
  description: string
  url: string
  revokeFreeze: boolean
  revokeMint: boolean
}

export function TokenForm({ onSubmit, className = "" }: TokenFormProps) {
  const [tokenData, setTokenData] = useState<TokenData>({
    name: "",
    symbol: "",
    decimals: 9,
    supply: 1000000000,
    image: null,
    description: "",
    url: "",
    revokeFreeze: false,
    revokeMint: false,
  })

  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    // Apply validation based on field
    if (name === "name" && value.length > MAX_NAME_LENGTH) return
    if (name === "symbol" && value.length > MAX_SYMBOL_LENGTH) return
    if (name === "decimals") {
      const decimalValue = Number.parseInt(value)
      if (isNaN(decimalValue) || decimalValue < MIN_DECIMALS || decimalValue > MAX_DECIMALS) return
    }
    if (name === "supply") {
      const supplyValue = Number(value)
      if (isNaN(supplyValue) || supplyValue <= 0 || supplyValue > MAX_SUPPLY) return
    }
    if (name === "description" && value.length > 200) return

    setTokenData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setTokenData((prev) => ({ ...prev, [name]: checked }))
  }

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    if (!file) return

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    setTokenData((prev) => ({ ...prev, image: file }))
  }

  const handleImageDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0] || null
    if (!file) return

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    setTokenData((prev) => ({ ...prev, image: file }))
  }

  const removeImage = () => {
    setImagePreview(null)
    setTokenData((prev) => ({ ...prev, image: null }))
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(tokenData)
  }

  return (
    <Card className={`w-full max-w-3xl mx-auto bg-white shadow-lg ${className}`}>
      <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 border-b">
        <CardTitle className="text-2xl font-bold text-center text-gray-800">Create Your Token Normal</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Name
                </Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-purple-400 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="w-60">Token name (max {MAX_NAME_LENGTH} characters)</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Input
                id="name"
                name="name"
                value={tokenData.name}
                onChange={handleInputChange}
                placeholder="My Token"
                maxLength={MAX_NAME_LENGTH}
                className="border-purple-100 focus:border-purple-300"
                required
              />
              <p className="text-xs text-right text-gray-500">
                {tokenData.name.length}/{MAX_NAME_LENGTH}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="symbol" className="text-sm font-medium">
                  Symbol
                </Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-purple-400 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="w-60">Token symbol (max {MAX_SYMBOL_LENGTH} characters)</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Input
                id="symbol"
                name="symbol"
                value={tokenData.symbol}
                onChange={handleInputChange}
                placeholder="TKN"
                maxLength={MAX_SYMBOL_LENGTH}
                className="border-purple-100 focus:border-purple-300"
                required
              />
              <p className="text-xs text-right text-gray-500">
                {tokenData.symbol.length}/{MAX_SYMBOL_LENGTH}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="decimals" className="text-sm font-medium">
                  Decimals
                </Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-purple-400 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="w-60">Number of decimal places (0-9)</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Input
                id="decimals"
                name="decimals"
                type="number"
                value={tokenData.decimals}
                onChange={handleInputChange}
                min={MIN_DECIMALS}
                max={MAX_DECIMALS}
                className="border-purple-100 focus:border-purple-300"
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="supply" className="text-sm font-medium">
                  Supply
                </Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-purple-400 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="w-60">Total token supply (max {MAX_SUPPLY.toLocaleString()})</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Input
                id="supply"
                name="supply"
                type="number"
                value={tokenData.supply}
                onChange={handleInputChange}
                min={1}
                max={MAX_SUPPLY}
                className="border-purple-100 focus:border-purple-300"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="image" className="text-sm font-medium">
                Token Image
              </Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-purple-400 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="w-60">Upload a PNG, JPG or GIF image for your token</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <div
              className="border-2 border-dashed border-purple-100 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-purple-300 transition-colors"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleImageDrop}
            >
              <input
                ref={fileInputRef}
                id="image"
                name="image"
                type="file"
                accept="image/png,image/jpeg,image/gif"
                onChange={handleImageUpload}
                className="hidden"
              />

              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview || "/placeholder.svg"}
                    alt="Token preview"
                    className="w-32 h-32 object-contain rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeImage()
                    }}
                    className="absolute -top-2 -right-2 bg-red-100 rounded-full p-1 text-red-500 hover:bg-red-200"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="h-10 w-10 text-purple-300 mb-2" />
                  <p className="text-sm text-gray-500 text-center">Drag and drop an image here, or click to select</p>
                  <p className="text-xs text-gray-400 mt-1">PNG, JPG or GIF</p>
                </>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="url" className="text-sm font-medium">
                URL
              </Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-purple-400 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="w-60">Website URL for your token (optional)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Input
              id="url"
              name="url"
              value={tokenData.url}
              onChange={handleInputChange}
              placeholder="https://example.com"
              className="border-purple-100 focus:border-purple-300"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Description
              </Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-purple-400 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="w-60">Description of your token (max 200 characters)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Textarea
              id="description"
              name="description"
              value={tokenData.description}
              onChange={handleInputChange}
              placeholder="Describe your token..."
              maxLength={200}
              className="border-purple-100 focus:border-purple-300 min-h-24"
            />
            <p className="text-xs text-right text-gray-500">{tokenData.description.length}/200</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="flex items-center justify-between space-x-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="revokeFreeze" className="text-sm font-medium cursor-pointer">
                  Revoke Freeze Authority
                </Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-purple-400 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="w-60">Permanently revoke the ability to freeze token accounts</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Switch
                id="revokeFreeze"
                checked={tokenData.revokeFreeze}
                onCheckedChange={(checked) => handleSwitchChange("revokeFreeze", checked)}
              />
            </div>

            <div className="flex items-center justify-between space-x-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="revokeMint" className="text-sm font-medium cursor-pointer">
                  Revoke Mint Authority
                </Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-purple-400 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="w-60">Permanently revoke the ability to mint more tokens</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Switch
                id="revokeMint"
                checked={tokenData.revokeMint}
                onCheckedChange={(checked) => handleSwitchChange("revokeMint", checked)}
              />
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-center border-t bg-gradient-to-r from-purple-50 to-blue-50 py-4">
          <Button
            type="submit"
            className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white px-8 py-2 rounded-lg transition-all"
          >
            Select Wallet
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
