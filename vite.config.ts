import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import { federation } from '@module-federation/vite'
import { existsSync, rmSync } from 'node:fs'

// https://vite.dev/config/
// Module Federation remote — exposes App as `esim_mini_app/App`
// Output: dist/remoteEntry.js (consumed by host via `esim_mini_app@http://localhost:5174/remoteEntry.js`)
// Note: index.html is NOT emitted to dist — remote is consumed via remoteEntry.js only.
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    federation({
      name: 'esim_mini_app',
      filename: 'remoteEntry.js',
      exposes: {
        './App': './src/App.tsx',
      },
      shared: {
        react: {
          singleton: true,
          requiredVersion: '^19.2.8',
        },
        'react-dom': {
          singleton: true,
          requiredVersion: '^19.2.8',
        },
        // jsx runtime is auto-shared via react; explicit for MF correctness
        'react/jsx-runtime': {
          singleton: true,
        },
      },
      dts: false,
      // Bundle all CSS with the remote so host gets correct styling without needing tailwind plugin
      bundleAllCSS: true,
    }),
    // Remove index.html from build output — remote should only expose remoteEntry.js + assets.
    // Keeps dev server (pnpm dev) unaffected; only affects `pnpm build` / `pnpm preview` dist.
    {
      name: 'remove-index-html',
      apply: 'build',
      generateBundle(_opts: unknown, bundle: Record<string, unknown>) {
        // Vite/Rolldown emits index.html as a bundle asset — delete before write
        if ('index.html' in bundle) delete bundle['index.html']
      },
      // Fallback for any Vite version that writes index.html outside bundle
      closeBundle() {
        const p = 'dist/index.html'
        if (existsSync(p)) rmSync(p)
      },
    },
  ],
  server: {
    port: 5174,
    origin: 'http://localhost:5174',
    cors: true,
  },
  preview: {
    port: 5174,
    strictPort: true,
  },
  build: {
    target: 'chrome89',
  },
})
