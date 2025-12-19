import { useState, useEffect } from 'react';
import favoriteService from '../services/favoriteService';
import logger from '../utils/logger';

export const useFavoriteStatus = (adId) => {
    const [isFavorite, setIsFavorite] = useState(false);
    const [loading, setLoading] = useState(true);

    const checkStatus = async () => {
        try {
            const status = await favoriteService.checkFavoriteStatus(adId);
            setIsFavorite(status);
        } catch (error) {
            logger.error("Error checking favorite status:", error);
            // If unauthorized, treat as not favorite
            if (error.response?.status === 401) {
                setIsFavorite(false);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkStatus();
    }, [adId]);

    return { isFavorite, loading, refreshStatus: checkStatus };
};