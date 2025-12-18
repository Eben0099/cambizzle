import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import { GoogleOAuthProvider } from '@react-oauth/google';
import './index.css'
// Importer la configuration API en premier pour initialiser les intercepteurs axios
import './config/api'
import App from './App.jsx'

// REMPLACEZ PAR VOTRE CLIENT ID GOOGLE
const GOOGLE_CLIENT_ID = "428598840929-uvv36a24eop1ni3incpj5lbs08egafj0.apps.googleusercontent.com";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <App />
      </GoogleOAuthProvider>
    </HelmetProvider>
  </StrictMode>,
)
