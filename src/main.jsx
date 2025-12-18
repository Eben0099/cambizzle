import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import { GoogleOAuthProvider } from '@react-oauth/google';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import './index.css'
// Importer la configuration API en premier pour initialiser les intercepteurs axios
import './config/api'
import App from './App.jsx'

// REMPLACEZ PAR VOTRE CLIENT ID GOOGLE
const GOOGLE_CLIENT_ID = "428598840929-uvv36a24eop1ni3incpj5lbs08egafj0.apps.googleusercontent.com";

// Configuration React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes par défaut
      gcTime: 1000 * 60 * 10, // Garde les données 10 minutes
      retry: 1,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </GoogleOAuthProvider>
    </HelmetProvider>
  </StrictMode>,
)
