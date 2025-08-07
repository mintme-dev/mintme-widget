## Proyecto WEB /Users/apple/mintme.dev/mintme-web-vite -> npm run dev
## Proyecto Widget npm run dev
Cómo probarlo localmente con npm link y desarrollo reactivo:

````md
# v3 - Mintme Widget

## Descripción

`v3` es un widget React modular para conectar wallets en Solana.  
Se puede usar como paquete npm o integrarse fácilmente en proyectos React/Vite.

---

## Instalación local para desarrollo

Sigue estos pasos para probar el widget en modo desarrollo reactivo sin publicar en npm.

### 1. Clona o prepara el paquete `v3`

```bash
cd ~/proyectos/v3
npm install
````

### 2. Linkea globalmente el paquete

```bash
npm link
```

### 3. Corre el build en modo watch para desarrollo reactivo

```bash
npm run dev
```

Esto compilará el paquete y actualizará automáticamente la carpeta `dist` al guardar cambios.

### 4. En tu proyecto React/Vite que consumirá `v3`

```bash
cd ~/proyectos/mi-app-react
npm install
npm link v3
```

### 5. Importa y usa el widget en tu proyecto React

```tsx
import React from 'react'
import { MintmeWidget } from 'v3'

function App() {
  return (
    <div>
      <h1>Mi App con v3 Widget</h1>
      <MintmeWidget />
    </div>
  )
}

export default App
```

### 6. Corre tu proyecto React/Vite normalmente

```bash
npm run dev
```

Ahora cada vez que guardes cambios en `v3`, el build se actualizará automáticamente y tu app reflejará los cambios sin necesidad de reinstalar o rebuild.

---

## Desvincular el link cuando termines

```bash
cd ~/proyectos/mi-app-react
npm unlink v3
npm uninstall v3
```

---

## Estructura de carpetas recomendada

```
v3/
├── src/
│   ├── index.ts
│   └── MintmeWidget.tsx
├── dist/
├── package.json
├── tsconfig.json
├── vite.config.ts
├── README.md
```

---

## Scripts disponibles

* `npm run dev`: Ejecuta `vite build --watch` para rebuild automático.
* `npm run build`: Ejecuta build completo (TypeScript + Vite).

---

Si tienes dudas o quieres mejoras, ¡avísame!
