import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Add standalone body class when not embedded in host (host has __ESEWA_HOST__ flag)
if (typeof document !== 'undefined') {
  const isEmbedded =
    typeof window !== 'undefined' &&
    !!((window as unknown as Record<string, unknown>).__ESEWA_HOST__ ||
      (window as unknown as Record<string, unknown>).__ESEWA_HOST_BRIDGE_INSTALLED__)
  if (!isEmbedded) document.body.classList.add('esim-standalone')
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
