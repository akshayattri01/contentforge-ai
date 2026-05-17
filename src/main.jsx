import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './contentforge_live.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
