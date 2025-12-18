import { useQuery } from '@tanstack/react-query';
import { userService } from '../services/userService';

/**
 * Hook pour récupérer le profil de l'utilisateur connecté
 */
export const useUserProfile = () => {
  return useQuery({
    queryKey: ['user', 'profile'],
    queryFn: () => userService.getUserProfile(),
    staleTime: 5 * 60 * 1000, // Cache 5 minutes
    gcTime: 10 * 60 * 1000,
    retry: 1,
  });
};

/**
 * Hook pour récupérer les annonces de l'utilisateur
 */
export const useUserAds = () => {
  return useQuery({
    queryKey: ['user', 'ads'],
    queryFn: () => userService.getUserAds(),
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

/**
 * Hook pour récupérer un profil vendeur par slug
 */
export const useSellerProfile = (slug) => {
  return useQuery({
    queryKey: ['seller', slug],
    queryFn: () => userService.getSellerProfile(slug),
    staleTime: 10 * 60 * 1000,
    gcTime: 20 * 60 * 1000,
    enabled: !!slug,
  });
};
