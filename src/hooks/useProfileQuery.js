import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';
import { API_BASE_URL } from '../config/api';
import storageService from '../services/storageService';

/**
 * Hook pour récupérer les annonces de l'utilisateur
 */
export const useUserAds = (userId) => {
  return useQuery({
    queryKey: ['user-ads', userId],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/ads/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${storageService.getToken()}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          return { ads: [] };
        }
        throw new Error('Failed to fetch user ads');
      }

      const data = await response.json();
      return data;
    },
    staleTime: 2 * 60 * 1000, // Cache 2 minutes
    gcTime: 5 * 60 * 1000,
    enabled: !!userId,
    retry: 1,
  });
};

/**
 * Hook pour récupérer le profil vendeur
 */
export const useSellerProfile = (userId) => {
  return useQuery({
    queryKey: ['seller-profile', userId],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/seller-profiles/me`, {
        headers: {
          'Authorization': `Bearer ${storageService.getToken()}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null; // Pas de profil vendeur
        }
        throw new Error('Failed to fetch seller profile');
      }

      const data = await response.json();
      return data.sellerProfile || data.data || null;
    },
    staleTime: 5 * 60 * 1000, // Cache 5 minutes
    gcTime: 10 * 60 * 1000,
    enabled: !!userId,
    retry: 1,
  });
};

/**
 * Hook complet pour le profil avec cache
 */
export const useProfileQuery = () => {
  const { user: authUser, updateUser: updateAuthUser } = useAuth();
  const queryClient = useQueryClient();

  // Mapper les données utilisateur
  const user = authUser ? {
    idUser: authUser.idUser || authUser.id,
    roleId: authUser.roleId || authUser.role_id,
    slug: authUser.slug,
    firstName: authUser.firstName || authUser.first_name,
    lastName: authUser.lastName || authUser.last_name,
    email: authUser.email,
    phone: authUser.phone,
    photoUrl: authUser.photoUrl || authUser.photo_url,
    isVerified: authUser.isVerified || authUser.is_verified,
    createdAt: authUser.createdAt || authUser.created_at,
    updatedAt: authUser.updatedAt || authUser.updated_at,
    referralCode: authUser.referralCode || authUser.referral_code,
  } : null;

  const userId = user?.idUser;

  // Récupérer les annonces de l'utilisateur
  const { data: adsData, isLoading: adsLoading } = useUserAds(userId);
  
  // Récupérer le profil vendeur
  const { data: sellerProfile, isLoading: sellerLoading } = useSellerProfile(userId);

  // Mutation pour mettre à jour le profil utilisateur
  const updateUserMutation = useMutation({
    mutationFn: (userData) => authService.updateUserProfile(userData),
    onSuccess: (data) => {
      // Invalider les requêtes liées au profil
      queryClient.invalidateQueries({ queryKey: ['user-ads', userId] });
      // Mettre à jour le contexte Auth
      if (updateAuthUser) {
        updateAuthUser(data.user || data.data?.user);
      }
    },
  });

  // Mutation pour mettre à jour le profil vendeur
  const updateSellerMutation = useMutation({
    mutationFn: (sellerData) => authService.updateSellerProfile(sellerData),
    onSuccess: () => {
      // Invalider le profil vendeur
      queryClient.invalidateQueries({ queryKey: ['seller-profile', userId] });
    },
  });

  // Mutation pour supprimer une annonce
  const deleteAdMutation = useMutation({
    mutationFn: async (adSlug) => {
      const response = await fetch(`${API_BASE_URL}/ads/${adSlug}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${storageService.getToken()}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete ad');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalider les annonces utilisateur
      queryClient.invalidateQueries({ queryKey: ['user-ads', userId] });
    },
  });

  return {
    user,
    sellerProfile,
    userAds: adsData?.ads || [],
    isLoading: adsLoading || sellerLoading,
    updateUser: updateUserMutation.mutate,
    updateSellerProfile: updateSellerMutation.mutate,
    deleteAd: deleteAdMutation.mutate,
    reloadUserData: () => {
      queryClient.invalidateQueries({ queryKey: ['user-ads', userId] });
      queryClient.invalidateQueries({ queryKey: ['seller-profile', userId] });
    }
  };
};
