import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import storageService from './storageService';

class ReportService {
  setAuthHeader() {
    const token = storageService.getToken();
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }

  /**
   * Create a new report
   * @param {Object} data - Report data
   * @param {number} data.reported_ad_id - ID of the reported ad
   * @param {string} data.report_type - Type of report (fraud, inappropriate, spam, counterfeit, prohibited, other)
   * @param {string} data.report_reason - Reason for the report
   * @param {string} [data.description] - Additional description
   * @returns {Promise<Object>}
   */
  async createReport(data) {
    try {
      this.setAuthHeader();
      const response = await axios.post(`${API_BASE_URL}/reports`, data);
      return response.data;
    } catch (error) {
      const errorData = error.response?.data;
      const err = new Error(errorData?.message || 'Failed to create report');
      err.code = errorData?.code;
      throw err;
    }
  }

  /**
   * Get all reports (Admin only)
   * @param {Object} [params] - Query parameters
   * @param {string} [params.status] - Filter by status (pending, resolved, dismissed)
   * @param {string} [params.report_type] - Filter by report type
   * @param {number} [params.limit] - Limit results
   * @param {number} [params.offset] - Offset for pagination
   * @returns {Promise<Object>}
   */
  async getReports(params = {}) {
    try {
      this.setAuthHeader();
      const response = await axios.get(`${API_BASE_URL}/reports`, { params });
      return response.data;
    } catch (error) {
      const errorData = error.response?.data;
      const err = new Error(errorData?.message || 'Failed to fetch reports');
      err.code = errorData?.code;
      throw err;
    }
  }

  /**
   * Get pending reports (Admin only)
   * @returns {Promise<Object>}
   */
  async getPendingReports() {
    try {
      this.setAuthHeader();
      const response = await axios.get(`${API_BASE_URL}/reports/admin/pending`);
      return response.data;
    } catch (error) {
      const errorData = error.response?.data;
      const err = new Error(errorData?.message || 'Failed to fetch pending reports');
      err.code = errorData?.code;
      throw err;
    }
  }

  /**
   * Get report by ID
   * @param {number} id - Report ID
   * @returns {Promise<Object>}
   */
  async getReport(id) {
    try {
      this.setAuthHeader();
      const response = await axios.get(`${API_BASE_URL}/reports/${id}`);
      return response.data;
    } catch (error) {
      const errorData = error.response?.data;
      const err = new Error(errorData?.message || 'Failed to fetch report');
      err.code = errorData?.code;
      throw err;
    }
  }

  /**
   * Resolve a report (Admin only)
   * @param {number} id - Report ID
   * @param {string} notes - Admin notes
   * @returns {Promise<Object>}
   */
  async resolveReport(id, notes) {
    try {
      this.setAuthHeader();
      const response = await axios.put(`${API_BASE_URL}/reports/${id}/resolve`, { notes });
      return response.data;
    } catch (error) {
      const errorData = error.response?.data;
      const err = new Error(errorData?.message || 'Failed to resolve report');
      err.code = errorData?.code;
      throw err;
    }
  }

  /**
   * Dismiss a report (Admin only)
   * @param {number} id - Report ID
   * @param {string} notes - Admin notes
   * @returns {Promise<Object>}
   */
  async dismissReport(id, notes) {
    try {
      this.setAuthHeader();
      const response = await axios.put(`${API_BASE_URL}/reports/${id}/dismiss`, { notes });
      return response.data;
    } catch (error) {
      const errorData = error.response?.data;
      const err = new Error(errorData?.message || 'Failed to dismiss report');
      err.code = errorData?.code;
      throw err;
    }
  }

  /**
   * Get report statistics (Admin only)
   * @returns {Promise<Object>}
   */
  async getStats() {
    try {
      this.setAuthHeader();
      const response = await axios.get(`${API_BASE_URL}/reports/stats`);
      return response.data;
    } catch (error) {
      const errorData = error.response?.data;
      const err = new Error(errorData?.message || 'Failed to fetch report statistics');
      err.code = errorData?.code;
      throw err;
    }
  }
}

export const reportService = new ReportService();
export default reportService;
