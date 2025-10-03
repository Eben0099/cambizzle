import { createContext, useContext, useReducer } from 'react';
import { adsService } from '../services/adsService';

const AdsContext = createContext();

const initialState = {
  ads: [],
  currentAd: null,
  searchResults: [],
  filters: {
    category: '',
    priceMin: '',
    priceMax: '',
    location: '',
    type: '',
    condition: ''
  },
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 20
  },
  isLoading: false,
  error: null
};

const adsReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    case 'SET_ADS':
      return { ...state, ads: action.payload, isLoading: false };
    case 'SET_SEARCH_RESULTS':
      return { ...state, searchResults: action.payload, isLoading: false };
    case 'SET_CURRENT_AD':
      return { ...state, currentAd: action.payload, isLoading: false };
    case 'ADD_AD':
      return { ...state, ads: [action.payload, ...state.ads] };
    case 'UPDATE_AD':
      return {
        ...state,
        ads: state.ads.map(ad => 
          ad.id === action.payload.id ? action.payload : ad
        ),
        currentAd: state.currentAd?.id === action.payload.id ? action.payload : state.currentAd
      };
    case 'DELETE_AD':
      return {
        ...state,
        ads: state.ads.filter(ad => ad.id !== action.payload),
        currentAd: state.currentAd?.id === action.payload ? null : state.currentAd
      };
    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } };
    case 'CLEAR_FILTERS':
      return { ...state, filters: initialState.filters };
    case 'SET_PAGINATION':
      return { ...state, pagination: { ...state.pagination, ...action.payload } };
    default:
      return state;
  }
};

export const AdsProvider = ({ children }) => {
  const [state, dispatch] = useReducer(adsReducer, initialState);

  const setLoading = (loading) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  };

  const setError = (error) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const fetchAds = async (page = 1, filters = {}) => {
    try {
      setLoading(true);
      const response = await adsService.getAds({ page, ...filters });
      dispatch({ type: 'SET_ADS', payload: response.data });
      dispatch({ type: 'SET_PAGINATION', payload: response.pagination });
    } catch (error) {
      setError(error.message);
    }
  };

  const searchAds = async (query, filters = {}) => {
    try {
      setLoading(true);
      const response = await adsService.searchAds(query, filters);
      dispatch({ type: 'SET_SEARCH_RESULTS', payload: response.data });
      dispatch({ type: 'SET_PAGINATION', payload: response.pagination });
    } catch (error) {
      setError(error.message);
    }
  };

  const getAdById = async (id) => {
    try {
      setLoading(true);
      const ad = await adsService.getAdById(id);
      dispatch({ type: 'SET_CURRENT_AD', payload: ad });
      return ad;
    } catch (error) {
      setError(error.message);
      return null;
    }
  };

  const createAd = async (adData) => {
    try {
      setLoading(true);
      const newAd = await adsService.createAd(adData);
      dispatch({ type: 'ADD_AD', payload: newAd });
      return { success: true, ad: newAd };
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    }
  };

  const updateAd = async (id, adData) => {
    try {
      setLoading(true);
      const updatedAd = await adsService.updateAd(id, adData);
      dispatch({ type: 'UPDATE_AD', payload: updatedAd });
      return { success: true, ad: updatedAd };
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    }
  };

  const deleteAd = async (id) => {
    try {
      setLoading(true);
      await adsService.deleteAd(id);
      dispatch({ type: 'DELETE_AD', payload: id });
      return { success: true };
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    }
  };

  const setFilters = (filters) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  };

  const clearFilters = () => {
    dispatch({ type: 'CLEAR_FILTERS' });
  };

  const reportAd = async (adId, reason, description) => {
    try {
      await adsService.reportAd(adId, reason, description);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const favoriteAd = async (adId) => {
    try {
      await adsService.favoriteAd(adId);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const unfavoriteAd = async (adId) => {
    try {
      await adsService.unfavoriteAd(adId);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const value = {
    ...state,
    fetchAds,
    searchAds,
    getAdById,
    createAd,
    updateAd,
    deleteAd,
    setFilters,
    clearFilters,
    reportAd,
    favoriteAd,
    unfavoriteAd,
    clearError
  };

  return (
    <AdsContext.Provider value={value}>
      {children}
    </AdsContext.Provider>
  );
};

export const useAds = () => {
  const context = useContext(AdsContext);
  if (!context) {
    throw new Error('useAds must be used within an AdsProvider');
  }
  return context;
};
