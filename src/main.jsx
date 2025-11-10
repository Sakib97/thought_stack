import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import 'bootstrap/dist/css/bootstrap.min.css';
import '@flaticon/flaticon-uicons/css/all/all.css';
import "@fortawesome/fontawesome-free/css/all.min.css";
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthProvider.jsx';
import { LanguageProvider } from './context/LanguageProvider.jsx';
import CustomQueryClientProvider from './context/QueryClientProvider.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <CustomQueryClientProvider>
      <LanguageProvider>
        <AuthProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </AuthProvider>
      </LanguageProvider>
    </CustomQueryClientProvider>
  </StrictMode>
)
