import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import 'bootstrap/dist/css/bootstrap.min.css';
import '@flaticon/flaticon-uicons/css/all/all.css';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthProvider.jsx';
import { LanguageProvider } from './context/LanguageProvider.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  </StrictMode>
)
