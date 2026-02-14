import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import storageService from './storageService';

/**
 * Notification Service
 * Handles user notification preferences (WhatsApp notifications)
 */
class NotificationService {
  constructor() {
    this.token = storageService.getToken();
  }

  setAuthHeader() {
    const currentToken = storageService.getToken();
    if (currentToken) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${currentToken}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }

  /**
   * Get user notification preferences
   * @returns {Promise<{success: boolean, data: {whatsapp_notifications_enabled: boolean}}>}
   */
  async getNotificationPreferences() {
    try {
      this.token = storageService.getToken();
      if (!this.token) {
        throw new Error('Token not found');
      }
      this.setAuthHeader();

      const response = await axios.get(`${API_BASE_URL}/users/me/notifications`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch notification preferences');
    }
  }

  /**
   * Update user notification preferences
   * @param {boolean} enabled - Whether WhatsApp notifications are enabled
   * @returns {Promise<{success: boolean, message: string, data: {whatsapp_notifications_enabled: boolean}}>}
   */
  async updateNotificationPreferences(enabled) {
    try {
      this.token = storageService.getToken();
      if (!this.token) {
        throw new Error('Token not found');
      }
      this.setAuthHeader();

      const response = await axios.put(`${API_BASE_URL}/users/me/notifications`, {
        whatsapp_notifications_enabled: enabled
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update notification preferences');
    }
  }
}

export const notificationService = new NotificationService();
export default notificationService;
