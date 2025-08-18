import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import path from "path"
import dts from "vite-plugin-dts"

export default defineConfig({
  plugins: [
    react(),
    dts({
      // tsConfigFilePath: "tsconfig.json",
      insertTypesEntry: true, // opcional: intenta añadir entry en package.json
    }),
  ],
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      name: "MintmeWidget",
      formats: ["es", "cjs"],
      fileName: (format) => `index.${format === "es" ? "mjs" : "js"}`,
    },
    rollupOptions: {
      // Asegúrate de listar TODO lo que provenga de React y runtime de JSX
      external: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
        "styled-components"
      ],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
          "react/jsx-runtime": "jsxRuntime",
          "react/jsx-dev-runtime": "jsxDevRuntime",
          "styled-components": "styled"
        },
      },
    },
  },
})
