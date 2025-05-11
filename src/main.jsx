import { StrictMode } from 'react'
import { BrowserRouter } from 'react-router-dom';  // ✅ import BrowserRouter
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App';
// import App from './CafeBilling.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
  <BrowserRouter>
    <App />
  </BrowserRouter>
  </StrictMode>,
)
