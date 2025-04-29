import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import dts from "vite-plugin-dts"
import { resolve } from "path"
import tailwindcss from "tailwindcss"
import autoprefixer from "autoprefixer"

export default defineConfig({
  plugins: [
    react(),
    dts({
      insertTypesEntry: true,
    }),
  ],
  css: {
    postcss: {
      plugins: [tailwindcss, autoprefixer],
    },
  },
  resolve: {
    alias: {
      // '@solana/web3.js': resolve(__dirname, 'node_modules/@solana/web3.js/lib/index.browser.esm.js')
    }
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis'
      }
    },
    include: [
      '@solana/web3.js',
      '@solana/wallet-adapter-react',
      '@solana/wallet-adapter-base'
    ]
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true
    },
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "MintMeWidget",
      fileName: (format) => `mintme-widget.${format}.js`,
    },
    rollupOptions: {
      external: [
        "react",
        "react-dom",
        "react/jsx-runtime"
      ],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
          "react/jsx-runtime": "jsxRuntime"
        },
        preserveModules: true
      },
    },
  },
})