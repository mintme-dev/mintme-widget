# 🪙 Mintme Widget

A React widget for creating Solana tokens with a simple, intuitive interface. Built for developers who want to integrate token creation functionality into their applications.

<img width="2026" height="1134" alt="mintme-github-banner-min" src="https://github.com/user-attachments/assets/a4422de6-beff-444e-9abf-437960c197de" />


**Powered by [mintme-sdk](https://www.npmjs.com/package/mintme-sdk)** - The most reliable Solana token creation SDK.

## ✨ Features

- 🚀 **Easy Integration** - Drop-in React component
- 🎨 **Customizable Themes** - Light, dark, and system themes
- 🔗 **Custom RPC Support** - Use your own Solana RPC endpoint
- 📁 **IPFS Integration** - Automatic metadata and image upload via Pinata.cloud
- 💰 **Partner Fees** - Optional revenue sharing
- 📱 **Responsive Design** - Works on all screen sizes
- 🔍 **Real-time Logging** - Monitor the token creation process
- ⚡ **Powered by mintme-sdk** - Battle-tested token creation engine

## 🛠️ Built With

This widget is powered by **[mintme-sdk](https://www.npmjs.com/package/mintme-sdk)**, our robust Solana token creation SDK that handles:

- ✅ Token minting with proper authorities
- ✅ Metadata creation and validation
- ✅ Transaction optimization
- ✅ Error handling and retries
- ✅ Multi-network support
- ✅ Partner fee distribution

> **Want more control?** Use [mintme-sdk](https://www.npmjs.com/package/mintme-sdk) directly in your backend or custom applications.

## 📦 Installation

```bash
npm install mintme-widget
```

## 🚀 Quick Start

```tsx
import { MintmeWidget } from 'mintme-widget'

function App() {
  const handleTokenCreation = (tokenData, result) => {
    console.log('Token created:', result.tokenAddress)
    console.log('Transaction:', result.transactionSignature)
  }

  return (
    <MintmeWidget
      cluster="devnet"
      onSubmit={handleTokenCreation}
    />
  )
}
```

## 📋 Props Reference

### Required Props
None! The widget works with default settings.

### Optional Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `cluster` | `"mainnet-beta" \| "testnet" \| "devnet"` | `"devnet"` | Solana network to use |
| `endpoint` | `string` | - | Custom RPC endpoint URL |
| `onSubmit` | `function` | - | Callback when token is created successfully |
| `onLog` | `function` | - | Callback for real-time process logs |
| `defaultTheme` | `"light" \| "dark" \| "system"` | `"dark"` | Widget theme |
| `pinataConfig` | `PinataConfig` | - | IPFS upload configuration |
| `partnerWallet` | `string` | - | Partner wallet address for fees |
| `partnerAmount` | `number` | `0` | Partner fee amount in SOL |
| `options` | `object` | `{}` | Additional widget options |
| `className` | `string` | - | Custom CSS class |

## 🔧 Configuration Examples

### Basic Usage
```tsx
<MintmeWidget
  cluster="devnet"
  onSubmit={(tokenData, result) => {
    alert(`Token created: \${result.tokenAddress}`)
  }}
/>
```

### With Custom RPC
```tsx
<MintmeWidget
  cluster="devnet"
  endpoint="https://your-custom-rpc.com"
  onSubmit={handleTokenCreation}
/>
```

### With IPFS Support
```tsx
<MintmeWidget
  cluster="devnet"
  pinataConfig={{
    apiKey: "your-pinata-jwt-token",
    gateway: "your-custom-gateway.com" // optional
  }}
  onSubmit={handleTokenCreation}
/>
```

### With Partner Fees
```tsx
<MintmeWidget
  cluster="mainnet-beta"
  partnerWallet="YourWalletAddressHere"
  partnerAmount={0.01} // 0.01 SOL fee
  onSubmit={handleTokenCreation}
/>
```

### With Logging
```tsx
<MintmeWidget
  cluster="devnet"
  onLog={(message) => {
    console.log('Widget:', message)
    // Send to your logging service
  }}
  onSubmit={handleTokenCreation}
/>
```

### Complete Configuration
```tsx
<MintmeWidget
  endpoint="https://devnet.helius-rpc.com/?api-key=your-key"
  cluster="devnet"
  pinataConfig={{
    apiKey: "your-pinata-jwt-token",
    gateway: "your-gateway.com"
  }}
  partnerWallet="7viHj1u6aQS9Nmc55FokX3B9NbDJUPwMYQvKgBfWeYXE"
  partnerAmount={0}
  defaultTheme="light"
  options={{
    showCredit: false
  }}
  className="my-custom-styles"
  onSubmit={handleTokenCreation}
  onLog={(message) => console.log('Log:', message)}
/>
```

## 📝 Callback Functions

### onSubmit Callback
Called when a token is successfully created.

```tsx
const handleTokenCreation = (tokenData, result) => {
  // tokenData: Form data entered by user
  console.log('Token Name:', tokenData.tokenName)
  console.log('Symbol:', tokenData.tokenSymbol)
  console.log('Supply:', tokenData.initialSupply)
  
  // result: Blockchain transaction result
  console.log('Token Address:', result.tokenAddress)
  console.log('Transaction:', result.transactionSignature)
  console.log('Metadata URI:', result.metadataUri)
}
```

### onLog Callback
Called during the token creation process for real-time updates.

```tsx
const handleLog = (message) => {
  console.log('Process:', message)
  // Examples of messages:
  // "📤 Uploading image to IPFS..."
  // "✅ Image uploaded successfully"
  // "🪙 Creating token on Solana blockchain..."
  // "🎉 Token created successfully!"
}
```

## 🎨 Theming

The widget supports three theme modes:

- `"light"` - Light theme
- `"dark"` - Dark theme  
- `"system"` - Follows system preference

```tsx
<MintmeWidget defaultTheme="system" />
```

## 🔗 IPFS Configuration

To enable image and metadata uploads, configure Pinata:

1. Get your JWT token from [Pinata](https://pinata.cloud)
2. Optionally set up a custom gateway

```tsx
<MintmeWidget
  pinataConfig={{
    apiKey: "your-jwt-token",
    gateway: "your-gateway.com" // optional
  }}
/>
```

## 💰 Partner Fees

Earn revenue by setting partner fees:

```tsx
<MintmeWidget
  partnerWallet="YourSolanaWalletAddress"
  partnerAmount={0.01} // 0.01 SOL per token creation
/>
```

## 🌐 Network Support

| Network | Cluster Value | Description |
|---------|---------------|-------------|
| Devnet | `"devnet"` | Development network (free SOL) |
| Testnet | `"testnet"` | Testing network |
| Mainnet | `"mainnet-beta"` | Production network |

## 🎯 TypeScript Support

The widget is built with TypeScript and includes full type definitions:

```tsx
import { MintmeWidget, type TokenData, type TokenCreationResult } from 'mintme-widget'

const handleSubmit = (data: TokenData, result: TokenCreationResult) => {
  // Fully typed parameters
}
```

## 🔧 Custom Styling

Add custom styles using the `className` prop:

```tsx
<MintmeWidget className="my-widget-styles" />
```

```css
.my-widget-styles {
  max-width: 800px;
  margin: 2rem auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}
```

## 📱 Responsive Design

The widget is fully responsive and works on:
- 📱 Mobile devices
- 📟 Tablets  
- 💻 Desktop computers

## 🔗 Related Projects

### [mintme-sdk](https://www.npmjs.com/package/mintme-sdk)
The core SDK powering this widget. Perfect for:
- 🏗️ **Backend Integration** - Server-side token creation
- 🔧 **Custom Applications** - Build your own token creation tools
- ⚡ **Advanced Features** - Full control over token parameters
- 🚀 **Production Ready** - Battle-tested and optimized

```bash
npm install mintme-sdk
```

```tsx
import { createToken } from 'mintme-sdk'

const result = await createToken({
  connection,
  payer,
  name: "My Token",
  symbol: "MTK",
  // ... more options
})
```

> **Choose the right tool:** Use the widget for quick UI integration, use the SDK for custom implementations.

## 🆘 Support

- 📧 Email: support@mintme.dev
- 🌐 Website: [mintme.dev](https://mintme.dev)
- 📚 Documentation: [docs.mintme.dev](https://docs.mintme.dev)
- 📦 SDK: [mintme-sdk on npm](https://www.npmjs.com/package/mintme-sdk)

## 📄 License

MIT License - see LICENSE file for details.

---

Made with ❤️ by the Mintme team | Powered by [mintme-sdk](https://www.npmjs.com/package/mintme-sdk)
