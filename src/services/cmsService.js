import api from '../config/api';
import logger from '../utils/logger';

class CMSService {
    /**
     * Fetch public CMS settings (contact info, social links, FAQs, sections)
     * @returns {Promise<Object>}
     */
    async getSettings() {
        try {
            const response = await api.get('/settings/cms');
            return response.data;
        } catch (error) {
            logger.error('Error fetching CMS settings from /settings/cms:', error);
            throw error;
        }
    }

    /**
     * Fetch a specific CMS page section by type
     * @param {string} pageType - e.g., 'terms', 'about_us', 'safety_tips'
     * @returns {Promise<Object>}
     */
    async getPageSections(pageType) {
        try {
            const response = await api.get('/settings/cms/sections', {
                params: { page_type: pageType }
            });
            return response.data;
        } catch (error) {
            logger.error(`Error fetching CMS sections for ${pageType}:`, error);
            throw error;
        }
    }

    /**
     * Fetch all public FAQs
     * @returns {Promise<Object>}
     */
    async getFaqs() {
        try {
            const response = await api.get('/settings/cms/faqs');
            return response.data;
        } catch (error) {
            logger.error('Error fetching public FAQs:', error);
            throw error;
        }
    }
}

export const cmsService = new CMSService();
export default cmsService;
