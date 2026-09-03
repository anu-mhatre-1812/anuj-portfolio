import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import BadgeSection from './components/BadgeSection'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BadgeSection />
  </StrictMode>,
)
