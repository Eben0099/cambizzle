// src/pages/admin/Feedbacks.jsx

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Loader from "../../components/ui/Loader";
import { API_BASE_URL } from "../../config/api";
import storageService from "../../services/storageService";
import { useToast } from "../../components/toast/useToast";

export default function Feedbacks() {
  const { t } = useTranslation();
  const { showToast } = useToast();

  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    ad_title: '',
    author_name: '',
    page: 1,
    limit: 20
  });
  const [allFeedbacks, setAllFeedbacks] = useState([]); // Store all feedbacks for local filtering

  useEffect(() => {
    fetchFeedbacks();
  }, [filters]);

  const fetchFeedbacks = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = storageService.getToken();
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.ad_title) params.append('ad_title', filters.ad_title);
      params.append('page', filters.page.toString());
      params.append('limit', filters.limit.toString());

      const res = await fetch(`${API_BASE_URL}/admin/feedbacks/pending?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      if (json.status === "success") {
        setAllFeedbacks(json.data.items);
        setFeedbacks(json.data.items); // Initially show all
      } else {
        showToast({ type: "error", message: json.message ?? t('admin.feedbacks.failedToLoad') });
      }
    } catch (e) {
      showToast({ type: "error", message: e.message ?? t('admin.feedbacks.networkError') });
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // Apply local filtering
  useEffect(() => {
    let filtered = allFeedbacks;

    if (filters.status) {
      filtered = filtered.filter(fb => fb.status === filters.status);
    }

    if (filters.ad_title) {
      filtered = filtered.filter(fb => 
        fb.adTitle?.toLowerCase().includes(filters.ad_title.toLowerCase())
      );
    }

    if (filters.author_name) {
      filtered = filtered.filter(fb => 
        (fb.authorName ?? fb.authorUserId)?.toString().toLowerCase().includes(filters.author_name.toLowerCase())
      );
    }

    setFeedbacks(filtered);
  }, [filters, allFeedbacks]);

  const handleAction = async (feedbackId, action) => {
    try {
      const token = storageService.getToken();
      const res = await fetch(`${API_BASE_URL}/admin/feedbacks/${feedbackId}/${action}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const json = await res.json();
      if (json.status === "success") {
        showToast({
          type: "success",
          message: action === 'approve' ? t('admin.feedbacks.feedbackApproved') : t('admin.feedbacks.feedbackRejected')
        });
        fetchFeedbacks(); // Refresh the list
      } else {
        showToast({
          type: "error",
          message: json.message ?? (action === 'approve' ? t('admin.feedbacks.failedToApprove') : t('admin.feedbacks.failedToReject'))
        });
      }
    } catch (e) {
      showToast({ type: "error", message: e.message ?? t('admin.feedbacks.networkError') });
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold mb-6">{t('admin.feedbacks.title')}</h1>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-4">
        <select
          name="status"
          value={filters.status}
          onChange={handleFilterChange}
          className="px-3 py-2 border rounded"
        >
          <option value="">{t('admin.feedbacks.allStatuses')}</option>
          <option value="pending">{t('admin.feedbacks.pending')}</option>
          <option value="approved">{t('admin.feedbacks.approved')}</option>
          <option value="rejected">{t('admin.feedbacks.rejected')}</option>
        </select>

        <input
          type="text"
          name="ad_title"
          placeholder={t('admin.feedbacks.searchByAdTitle')}
          value={filters.ad_title}
          onChange={handleFilterChange}
          className="px-3 py-2 border rounded"
          style={{ minWidth: 200 }}
        />

        <input
          type="text"
          name="author_name"
          placeholder={t('admin.feedbacks.searchByAuthorName')}
          value={filters.author_name}
          onChange={handleFilterChange}
          className="px-3 py-2 border rounded"
          style={{ minWidth: 200 }}
        />
      </div>

      {loading && <Loader text={t('admin.feedbacks.loading')} />}
      {error && <p className="text-red-600 text-center">{error}</p>}
      
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="text-left py-2 px-3">{t('admin.feedbacks.adTitle')}</th>
              <th className="text-left py-2 px-3">{t('admin.feedbacks.authorName')}</th>
              <th className="text-left py-2 px-3">{t('admin.feedbacks.rating')}</th>
              <th className="text-left py-2 px-3">{t('admin.feedbacks.comment')}</th>
              <th className="text-left py-2 px-3">{t('admin.feedbacks.status')}</th>
              <th className="text-left py-2 px-3">{t('admin.feedbacks.date')}</th>
              <th className="text-left py-2 px-3">{t('admin.feedbacks.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {feedbacks.length > 0 ? feedbacks.map((fb) => (
              <tr key={fb.id} className="border-b hover:bg-gray-50">
                <td className="py-2 px-3">{fb.adTitle ?? "-"}</td>
                <td className="py-2 px-3">{fb.authorName ?? fb.authorUserId ?? "-"}</td>
                <td className="py-2 px-3">{fb.rating}</td>
                <td className="py-2 px-3">{fb.content}</td>
                <td className="py-2 px-3">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                      fb.status === "approved"
                        ? "bg-green-100 text-green-800"
                        : fb.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : fb.status === "rejected"
                        ? "bg-red-100 text-red-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {fb.status}
                  </span>
                </td>
                <td className="py-2 px-3">{fb.createdAt}</td>
                <td className="py-2 px-3">
                  {fb.status === "pending" && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAction(fb.id, 'approve')}
                        className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                      >
                        {t('admin.feedbacks.approve')}
                      </button>
                      <button
                        onClick={() => handleAction(fb.id, 'reject')}
                        className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                      >
                        {t('admin.feedbacks.reject')}
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            )) : (
              <tr><td colSpan={7} className="p-4 text-gray-500 text-center">{t('admin.feedbacks.noFeedbackFound')}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
