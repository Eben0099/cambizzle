import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import { GoogleOAuthProvider } from '@react-oauth/google';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import './index.css'
// Importer la configuration API en premier pour initialiser les intercepteurs axios
import api from './config/api'
// Initialiser i18n pour les traductions
import './i18n'
import App from './App.jsx'

// Google Client ID from environment variables
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// Configuration React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes par défaut
      gcTime: 1000 * 60 * 10, // Garde les données 10 minutes
      retry: (failureCount, error) => {
        // Retry une fois sur erreur 403 (peut être un problème de cache/session)
        if (error?.response?.status === 403) return failureCount < 1;
        // Pas de retry sur 401 (non autorisé)
        if (error?.response?.status === 401) return false;
        // Retry 2 fois pour les autres erreurs
        return failureCount < 2;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: true, // Refetch quand l'utilisateur revient sur l'onglet
    },
  },
});

// ==================== Heartbeat Cloudflare ====================
// Ping le serveur toutes les 15 minutes pour garder la session Cloudflare active
const HEARTBEAT_INTERVAL = 15 * 60 * 1000; // 15 minutes

const sendHeartbeat = () => {
  // Requête légère pour maintenir la session Cloudflare
  api.get('/categories')
    .catch(() => {
      // Silencieux - le heartbeat est juste pour garder la session active
    });
};

// Démarrer le heartbeat
let heartbeatTimer = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL);

// Pause le heartbeat quand l'onglet est caché, reprend quand visible
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    // Envoyer un heartbeat immédiatement au retour
    sendHeartbeat();
    // Redémarrer le timer
    clearInterval(heartbeatTimer);
    heartbeatTimer = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL);
  } else {
    // Pause le heartbeat quand l'onglet est caché
    clearInterval(heartbeatTimer);
  }
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
