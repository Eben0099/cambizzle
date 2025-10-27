import { createContext, useContext, useReducer, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

// Récupérer l'utilisateur du localStorage au démarrage
const getInitialUser = () => {
  try {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  } catch (error) {
    console.error('Erreur lors de la lecture de l\'utilisateur depuis localStorage:', error);
    return null;
  }
};

const initialState = {
  user: getInitialUser(),
  isAuthenticated: !!getInitialUser() && !!localStorage.getItem('token'),
  isLoading: true,
  error: null
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'LOGIN_SUCCESS':
      // Sauvegarder l'utilisateur dans localStorage
      if (action.payload) {
        localStorage.setItem('user', JSON.stringify(action.payload));
      }
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null
      };
    case 'LOGIN_ERROR':
      // Nettoyer localStorage en cas d'erreur
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload
      };
    case 'LOGOUT':
      // Nettoyer localStorage lors de la déconnexion
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      };
    case 'UPDATE_USER':
      // Mettre à jour l'utilisateur dans localStorage
      const updatedUser = { ...state.user, ...action.payload };
      if (updatedUser) {
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
      return {
        ...state,
        user: updatedUser,
        isAuthenticated: action.payload ? true : state.isAuthenticated
      };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    console.log('🔐 checkAuthStatus - Vérification du statut d\'authentification...');
    const token = localStorage.getItem('token');
    console.log('🔑 Token trouvé:', token ? 'oui' : 'non');

    // Si pas de token, pas besoin de vérifier
    if (!token) {
      console.log('❌ Aucun token, arrêt de la vérification');
      // Nettoyer l'utilisateur si pas de token
      localStorage.removeItem('user');
      dispatch({ type: 'LOGOUT' });
      dispatch({ type: 'SET_LOADING', payload: false });
      return;
    }

    try {
      console.log('📡 Appel API /auth/me pour récupérer l\'utilisateur...');
      const user = await authService.getCurrentUser();
      console.log('✅ Utilisateur récupéré de l\'API:', user);

      // Convertir les données snake_case vers camelCase si nécessaire
      // L'API peut retourner directement les données ou dans une propriété 'data'
      // Parfois data contient {user: {...}}, parfois directement l'utilisateur
      const userData = user.data?.user || user.data || user;

      console.log('📦 Données utilisateur extraites:', userData);
      console.log('🔍 Propriétés disponibles dans userData:', Object.keys(userData));

      const processedUser = {
        idUser: userData.id_user || userData.idUser || userData.id,
        roleId: userData.role_id || userData.roleId,
        slug: userData.slug,
        firstName: userData.first_name || userData.firstName,
        lastName: userData.last_name || userData.lastName,
        email: userData.email,
        phone: userData.phone,
        photoUrl: userData.photo_url || userData.photoUrl,
        isVerified: userData.is_verified || userData.isVerified,
        createdAt: userData.created_at?.date || userData.created_at || userData.createdAt,
        updatedAt: userData.updated_at?.date || userData.updated_at || userData.updatedAt,
        referralCode: userData.referralCode || userData.referral_code,
      };

      console.log('🔄 Données après conversion:', processedUser);
      console.log('🔍 Vérifications individuelles:');
      console.log('- idUser:', processedUser.idUser, '(', typeof processedUser.idUser, ')');
      console.log('- email:', processedUser.email, '(', typeof processedUser.email, ')');
      console.log('- phone:', processedUser.phone, '(', typeof processedUser.phone, ')');

      // Vérifier que les données essentielles sont présentes
      // L'email peut être null, mais le téléphone est obligatoire
      if (!processedUser.idUser || !processedUser.phone) {
        console.error('❌ Données utilisateur incomplètes:', processedUser);
        throw new Error('Données utilisateur invalides reçues de l\'API (idUser ou phone manquant)');
      }

      console.log('🔄 Utilisateur traité pour le contexte:', processedUser);
      dispatch({ type: 'LOGIN_SUCCESS', payload: processedUser });
      console.log('✅ Contexte d\'authentification mis à jour');
    } catch (error) {
      console.error('❌ Erreur lors de la récupération de l\'utilisateur:', error);
      // Token invalide ou expiré - nettoyer complètement
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      dispatch({ type: 'LOGOUT' });
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const login = async (credentials) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await authService.login(credentials);

      // Le token est déjà stocké par authService.login()
      dispatch({ type: 'LOGIN_SUCCESS', payload: response.data.user });
      return { success: true };
    } catch (error) {
      dispatch({ type: 'LOGIN_ERROR', payload: error.message });
      return { success: false, error: error.message };
    }
  };

  const register = async (userData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await authService.register(userData);
      // response.data contient {status, message, data: {user, token}}
      localStorage.setItem('token', response.data.token);
      dispatch({ type: 'LOGIN_SUCCESS', payload: response.data.user });
      return { success: true, data: response.data };
    } catch (error) {
      dispatch({ type: 'LOGIN_ERROR', payload: error.message });
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    dispatch({ type: 'LOGOUT' });
  };

  const updateUser = (userData) => {
    dispatch({ type: 'UPDATE_USER', payload: userData });
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    updateUser,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
