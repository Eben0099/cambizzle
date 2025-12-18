import axios from 'axios';
import { API_BASE_URL } from '../config/api';

class BoostService {
  setAuthHeader() {
    const currentToken = localStorage.getItem('token');
    if (currentToken) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${currentToken}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }

  /**
   * Get available promotion packs
   * @returns {Promise<Object>}
   */
  async getPromotionPacks() {
    try {
      this.setAuthHeader();
      const response = await axios.get(`${API_BASE_URL}/promotion-packs`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Error fetching promotion packs';
      throw new Error(errorMessage);
    }
  }

  /**
   * Boost an existing ad
   * @param {string} adSlug - The slug of the ad to boost
   * @param {Object} boostData - { user_id, pack_id, phone, payment_method }
   * @returns {Promise<Object>}
   */
  async boostExistingAd(adSlug, boostData) {
    try {
      this.setAuthHeader();
      const response = await axios.post(`${API_BASE_URL}/boost/boost-existing-ad/${adSlug}`, boostData);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Error boosting ad';
      throw new Error(errorMessage);
    }
  }

  /**
   * Check payment status
   * @param {string} paymentId - The payment ID to check
   * @returns {Promise<Object>}
   */
  async checkPaymentStatus(paymentId) {
    try {
      this.setAuthHeader();
      const response = await axios.get(`${API_BASE_URL}/boost/check-payment/${paymentId}`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Error checking payment status';
      throw new Error(errorMessage);
    }
  }

  /**
   * Poll payment status with automatic retry
   * @param {string} paymentId - The payment ID to poll
   * @param {Function} onStatusChange - Callback for status changes
   * @param {number} maxDuration - Maximum polling duration in milliseconds (default: 5 minutes)
   * @returns {Promise<Object>}
   */
  async pollPaymentStatus(paymentId, onStatusChange, maxDuration = 5 * 60 * 1000) {
    const startTime = Date.now();
    const pollInterval = 5000; // 5 seconds

    return new Promise((resolve, reject) => {
      const poll = async () => {
        try {
          // Check if timeout exceeded
          if (Date.now() - startTime > maxDuration) {
            clearInterval(intervalId);
            reject(new Error('Payment verification timeout. Please check your payment status manually.'));
            return;
          }

          const result = await this.checkPaymentStatus(paymentId);
          
          // Call status change callback
          if (onStatusChange) {
            onStatusChange(result);
          }

          // Check if payment completed
          if (result.status === 'paid' || result.data?.status === 'paid') {
            clearInterval(intervalId);
            resolve(result);
          } else if (result.status === 'failed' || result.data?.status === 'failed') {
            clearInterval(intervalId);
            reject(new Error(result.message || 'Payment failed'));
          }
        } catch (error) {

          // Continue polling on error (network issues, etc)
        }
      };

      // Start polling
      const intervalId = setInterval(poll, pollInterval);
      // Initial check
      poll();
    });
  }
}

export default new BoostService();
