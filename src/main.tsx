import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import './index.css'

import App from '@/app.tsx'
import { TooltipProvider } from '@/shared/components/ui/tooltip'
import { ThemeContextProvider } from '@/shared/providers'

const rootElement = document.getElementById('root')

if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <TooltipProvider>
        <ThemeContextProvider>
          <App />
        </ThemeContextProvider>
      </TooltipProvider>
    </StrictMode>,
  )
}
