import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';
import { API_BASE_URL } from '../config/api';

export const useProfile = () => {
  const { user: authUser, updateUser: updateAuthUser } = useAuth();
  const [user, setUser] = useState(null);
  const [sellerProfile, setSellerProfile] = useState(null);
  const [userAds, setUserAds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('🔄 useProfile useEffect déclenché');
    console.log('👤 authUser reçu:', authUser);

    const loadUserData = async () => {
      if (!authUser) {
        console.log('❌ Aucun authUser, arrêt du chargement');
        setIsLoading(false);
        return;
      }

      console.log('✅ authUser présent, début du chargement des données');
      setIsLoading(true);
      try {
        // Utiliser les données de l'utilisateur authentifié
        console.log('👤 Chargement profil pour utilisateur:', authUser);
        // Mapping explicite pour inclure referralCode
        const mappedUser = {
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
        };
        setUser(mappedUser);

        // Charger les annonces de l'utilisateur depuis l'API
        try {
          const userId = authUser.idUser || authUser.id;
          console.log('🔍 Chargement annonces pour userId:', userId);

          const adsResponse = await fetch(`${API_BASE_URL}/ads/user/${userId}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            }
          });

          if (adsResponse.ok) {
            const adsData = await adsResponse.json();
            console.log('✅ Annonces chargées:', adsData.ads?.length || 0, 'annonces');
            setUserAds(adsData.ads || []);
          } else if (adsResponse.status === 401) {
            // Token invalide - laisser le contexte d'auth gérer ça
            console.warn('Token invalide lors du chargement des annonces');
            setUserAds([]);
          }
        } catch (adsError) {
          console.error('Erreur lors du chargement des annonces:', adsError);
          console.warn('⚠️ Endpoint annonces probablement non implémenté côté backend');
          // Pour l'instant, utiliser des données mockées ou laisser vide
          setUserAds([]);
        }



        // Charger le profil vendeur de l'utilisateur depuis l'API
        try {
          console.log('🏪 Chargement profil vendeur...');
          const sellerResponse = await fetch(`${API_BASE_URL}/seller-profiles/me`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            }
          });

          if (sellerResponse.ok) {
            const sellerData = await sellerResponse.json();
            console.log('✅ Profil vendeur chargé:', sellerData.data);
            console.log('🔍 Type de opening_hours:', typeof sellerData.data.opening_hours, sellerData.data.opening_hours);
            console.log('🔍 Type de delivery_options:', typeof sellerData.data.delivery_options, sellerData.data.delivery_options);

            // Convertir les données snake_case vers camelCase et parser JSON
            const processedSellerProfile = {
              id: sellerData.data.id,
              userId: sellerData.data.user_id,
              businessName: sellerData.data.business_name,
              businessDescription: sellerData.data.business_description,
              businessAddress: sellerData.data.business_address,
              businessPhone: sellerData.data.business_phone,
              businessEmail: sellerData.data.business_email,
              openingHours: typeof sellerData.data.opening_hours === 'string'
                ? JSON.parse(sellerData.data.opening_hours)
                : sellerData.data.opening_hours || {},
              deliveryOptions: typeof sellerData.data.delivery_options === 'string'
                ? JSON.parse(sellerData.data.delivery_options)
                : sellerData.data.delivery_options || {},
              websiteUrl: sellerData.data.website_url,
              facebookUrl: sellerData.data.facebook_url,
              instagramUrl: sellerData.data.instagram_url,
              logoUrl: sellerData.data.logo_url,
              isVerified: sellerData.data.is_verified,
              verificationStatus: sellerData.data.verification_status,
              rejectionReason: sellerData.data.rejection_reason,
              verifiedAt: sellerData.data.verified_at,
              isActive: sellerData.data.is_active,
              createdAt: sellerData.data.created_at?.date || sellerData.data.created_at,
              updatedAt: sellerData.data.updated_at?.date || sellerData.data.updated_at
            };

            setSellerProfile(processedSellerProfile);
          } else if (sellerResponse.status === 404) {
            // L'utilisateur n'a pas de profil vendeur
            console.log('ℹ️ Aucun profil vendeur trouvé pour cet utilisateur');
            setSellerProfile(null);
          } else if (sellerResponse.status === 401) {
            console.warn('Token invalide lors du chargement du profil vendeur');
            setSellerProfile(null);
          } else {
            console.warn('⚠️ Erreur lors du chargement du profil vendeur (status:', sellerResponse.status, ')');
            setSellerProfile(null);
          }
        } catch (sellerError) {
          console.error('Erreur lors du chargement du profil vendeur:', sellerError);
          console.warn('⚠️ Endpoint profil vendeur probablement non accessible');
          setSellerProfile(null);
        }

      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setIsLoading(false);
        console.log('🏁 Chargement des données terminé, isLoading = false');
      }
    };

    loadUserData();
  }, [authUser]);

  const updateUser = async (userData) => {
    try {
      console.log('👤 Mise à jour profil utilisateur:', userData);

      // Détecter si c'est un FormData ou un objet JSON
      const isFormData = userData instanceof FormData;
      let apiDataToSend;

      if (isFormData) {
        console.log('📋 Type: FormData - Envoi direct au service');
        // Pour FormData, envoyer directement (ProfileSettings a déjà préparé le FormData)
        apiDataToSend = userData;
      } else {
        console.log('📋 Type: JSON - Conversion des données');

        // Les données arrivent déjà en snake_case depuis ProfileSettings
        apiDataToSend = {
          first_name: userData.first_name || userData.firstName,
          last_name: userData.last_name || userData.lastName,
          email: userData.email,
          slug: userData.slug,
          ...(userData.photo_url && { photo_url: userData.photo_url })
        };

        // Ne pas envoyer le téléphone s'il n'a pas changé (évite l'erreur "déjà utilisé")
        if (userData.phone && userData.phone !== user?.phone) {
          apiDataToSend.phone = userData.phone;
        }

        console.log('📡 Données envoyées à l\'API:', apiDataToSend);
      }

      // Mettre à jour via l'API
      const updatedUserResponse = await authService.updateUserProfile(apiDataToSend);

      // Convertir la réponse snake_case vers camelCase
      const apiData = updatedUserResponse.data;
      const processedUser = {
        idUser: apiData.id_user || apiData.id || apiData.idUser,
        roleId: apiData.role_id || apiData.roleId,
        slug: apiData.slug,
        firstName: apiData.first_name || apiData.firstName,
        lastName: apiData.last_name || apiData.lastName,
        email: apiData.email,
        phone: apiData.phone,
        photoUrl: apiData.photo_url || apiData.photoUrl,
        isVerified: apiData.is_verified || apiData.isVerified,
        createdAt: apiData.created_at?.date || apiData.created_at || apiData.createdAt,
        updatedAt: apiData.updated_at?.date || apiData.updated_at || apiData.updatedAt
      };

      // Mettre à jour l'état local
      setUser(prev => ({ ...prev, ...processedUser }));

      // Mettre à jour aussi dans le contexte d'authentification
      updateAuthUser(processedUser);
      return { success: true, user: processedUser };
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      throw error;
    }
  };

  const updateSellerProfile = async (sellerData) => {
    try {
      console.log('🔄 Mise à jour profil vendeur:', sellerData);

      // Convertir les données camelCase vers snake_case pour l'API
      const apiData = {
        business_name: sellerData.businessName,
        business_description: sellerData.businessDescription,
        business_address: sellerData.businessAddress,
        business_phone: sellerData.businessPhone,
        business_email: sellerData.businessEmail,
        opening_hours: JSON.stringify(sellerData.openingHours),
        delivery_options: JSON.stringify(sellerData.deliveryOptions),
        website_url: sellerData.websiteUrl,
        facebook_url: sellerData.facebookUrl,
        instagram_url: sellerData.instagramUrl
      };

      console.log('📡 Données envoyées à l\'API:', apiData);

      // Appeler l'API pour mettre à jour
      const updatedProfile = await authService.updateSellerProfile(apiData);

      // Convertir la réponse en camelCase et mettre à jour l'état local
      const processedProfile = {
        id: updatedProfile.data.id,
        userId: updatedProfile.data.user_id,
        businessName: updatedProfile.data.business_name,
        businessDescription: updatedProfile.data.business_description,
        businessAddress: updatedProfile.data.business_address,
        businessPhone: updatedProfile.data.business_phone,
        businessEmail: updatedProfile.data.business_email,
        openingHours: typeof updatedProfile.data.opening_hours === 'string'
          ? JSON.parse(updatedProfile.data.opening_hours)
          : updatedProfile.data.opening_hours || {},
        deliveryOptions: typeof updatedProfile.data.delivery_options === 'string'
          ? JSON.parse(updatedProfile.data.delivery_options)
          : updatedProfile.data.delivery_options || {},
        websiteUrl: updatedProfile.data.website_url,
        facebookUrl: updatedProfile.data.facebook_url,
        instagramUrl: updatedProfile.data.instagram_url,
        logoUrl: updatedProfile.data.logo_url,
        isVerified: updatedProfile.data.is_verified,
        verificationStatus: updatedProfile.data.verification_status,
        rejectionReason: updatedProfile.data.rejection_reason,
        verifiedAt: updatedProfile.data.verified_at,
        isActive: updatedProfile.data.is_active,
        createdAt: updatedProfile.data.created_at?.date || updatedProfile.data.created_at,
        updatedAt: updatedProfile.data.updated_at?.date || updatedProfile.data.updated_at
      };

      setSellerProfile(processedProfile);
      console.log('✅ Profil vendeur mis à jour avec succès');

      return { success: true };
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil vendeur:', error);
      throw error;
    }
  };

  const deleteAd = async (adId) => {
    try {
  const response = await fetch(`${API_BASE_URL}/ads/${adId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Supprimer l'annonce de l'état local
        setUserAds(prev => prev.filter(ad => ad.id !== adId));
        return { success: true };
      } else {
        throw new Error('Erreur lors de la suppression de l\'annonce');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'annonce:', error);
      throw error;
    }
  };

  return {
    user,
    sellerProfile,
    userAds,
    isLoading,
    updateUser,
    updateSellerProfile,
    deleteAd,
  };
};