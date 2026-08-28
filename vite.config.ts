import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import { federation } from '@module-federation/vite'
import { existsSync, rmSync } from 'node:fs'

export default defineConfig({
  plugins: [
    react({
      jsxRuntime: "automatic"
    }),
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
      },
      dts: false,
      bundleAllCSS: true,
    }),
    {
      name: 'remove-index-html',
      apply: 'build',
      generateBundle(_opts: unknown, bundle: Record<string, unknown>) {
        if ('index.html' in bundle) delete bundle['index.html']
      },
      closeBundle() {
        const p = 'dist/index.html'
        if (existsSync(p)) rmSync(p)
      },
    },
  ],
  server: {
    host: "0.0.0.0",
    cors: true,
    headers: { "Access-Control-Allow-Origin": "*" },
  },
  build: {
    target: 'chrome89',
    manifest:'manifest.json',
    outDir: 'dist',
    cssCodeSplit: true,
  },
})
