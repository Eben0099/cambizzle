import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  Star,
  MessageCircle,
  User,
  Send
} from 'lucide-react';

import Loader from '../components/ui/Loader';
import Button from '../components/ui/Button';
import { API_BASE_URL } from '../config/api';
import { formatDate } from '../utils/helpers';
import { useAuth } from '../contexts/AuthContext';

export default function AdFeedbacks() {
  const { t } = useTranslation();
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [ad, setAd] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newFeedback, setNewFeedback] = useState('');
  const [rating, setRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [summary, setSummary] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const textareaRef = useRef(null);

  useEffect(() => {
    fetchData();
  }, [slug]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [newFeedback]);

  const submitFeedback = async () => {
    if (!newFeedback.trim() || submitting) return;

    setSubmitting(true);
    setSubmitSuccess(false);

    try {
      const response = await fetch(`${API_BASE_URL}/ads/${ad.id}/feedbacks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          rating: rating,
          content: newFeedback.trim()
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Feedback submitted successfully:', result);

        // Show success message
        setSubmitSuccess(true);
        setTimeout(() => setSubmitSuccess(false), 3000);

        // Clear form
        setNewFeedback('');
        setRating(5);

        // Refresh summary after adding feedback
        try {
          const summaryRes = await fetch(`${API_BASE_URL}/ads/${ad.id}/feedbacks/summary`);
          const summaryData = await summaryRes.json();
          if (summaryData?.status === 'success') {
            setSummary(summaryData.data);
          }
        } catch (error) {
          console.error('Error refreshing summary:', error);
        }

        // Note: New feedback won't appear immediately as it needs admin approval
        // The API returns status: "pending", so we don't add it to the list yet
      } else {
        const errorData = await response.json();
        console.error('Error submitting feedback:', errorData);
        alert(t('adDetail.feedback.submitError'));
      }
    } catch (error) {
      console.error('Error:', error);
      alert(t('adDetail.feedback.networkError'));
    } finally {
      setSubmitting(false);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      console.log('Fetching ad data for slug:', slug);
      console.log('API URL:', `${API_BASE_URL}/ads/${slug}`);

      const adRes = await fetch(`${API_BASE_URL}/ads/${slug}`);
      console.log('Ad response status:', adRes.status);

      if (!adRes.ok) {
        throw new Error(`HTTP ${adRes.status}: ${adRes.statusText}`);
      }

      const adData = await adRes.json();
      console.log('Ad data received:', adData);

      if (adData && adData.id) {  // Check directly if ad exists
        setAd(adData);

        // Fetch feedbacks (don't break if it fails)
        try {
          const fbRes = await fetch(`${API_BASE_URL}/ads/${adData.id}/feedbacks?limit=10&page=1`);
          const fbData = await fbRes.json();
          setFeedbacks(fbData?.data?.items || []);
          setHasMore(fbData?.data?.items?.length === 10); // Assume more if we got the full limit
        } catch (fbError) {
          console.log('Feedbacks API not available, using empty array');
          setFeedbacks([]);
          setHasMore(false);
        }

        // Fetch summary (don't break if it fails)
        try {
          const summaryRes = await fetch(`${API_BASE_URL}/ads/${adData.id}/feedbacks/summary`);
          const summaryData = await summaryRes.json();
          if (summaryData?.status === 'success') {
            setSummary(summaryData.data);
          }
        } catch (summaryError) {
          console.log('Summary API not available, using default');
          setSummary({ averageRating: 0, ratingsCount: 0, distribution: {} });
        }
      } else {
        throw new Error('Ad not found');
      }
    } catch (e) {
      console.log('Ad API error:', e.message);
      console.log('Ad API not available, using mock data');
      // Mock data only if the ad itself is not found
      setAd({ id: 1, title: 'Great product in excellent condition', slug });
      setFeedbacks([
        {
          id: "1",
          adId: "1",
          authorUserId: "13",
          authorName: "Marie Dupont",
          authorPhoto: "uploads/avatars/default-avatar.jpg",
          rating: "5",
          content: 'Excellent product! Very responsive seller, fast and careful shipping. Highly recommend.',
          photos: "[\"uploads\\/ads\\/example1.jpg\"]",
          status: "approved",
          adminNotes: null,
          reviewedBy: "13",
          reviewedAt: "2025-12-18 19:03:26",
          isReported: "0",
          createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
          updatedAt: "2025-12-18 19:03:26"
        },
        {
          id: "2",
          adId: "1",
          authorUserId: "14",
          authorName: "Lucas Martin",
          authorPhoto: null,
          rating: "4",
          content: 'Product matches description. Very good condition. Minor scratch but nothing serious.',
          photos: null,
          status: "approved",
          adminNotes: null,
          reviewedBy: "13",
          reviewedAt: "2025-12-15 10:30:00",
          isReported: "0",
          createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
          updatedAt: "2025-12-15 10:30:00"
        }
      ]);
      // Mock summary data
      setSummary({
        averageRating: 4.5,
        ratingsCount: 2,
        distribution: { "1": 0, "2": 0, "3": 0, "4": 1, "5": 1 }
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader text={t('common.loading')} className="min-h-screen" />;
  }

  if (!ad) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {t('adDetail.feedback.listingNotFound')}
          </h1>
          <Button onClick={() => navigate(-1)}>
            {t('common.back')}
          </Button>
        </div>
      </div>
    );
  }

  const averageRating = summary?.averageRating || 0;
  const ratingsCount = summary?.ratingsCount || 0;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Fixed header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 rounded-full hover:bg-gray-100"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-gray-900 truncate">
              {ad.title}
            </h1>
            <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                <span className="font-medium">{averageRating}</span>
              </div>
              <span>•</span>
              <span>{ratingsCount} {ratingsCount > 1 ? t('adDetail.feedback.reviews') : t('adDetail.feedback.review')}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Feedback list */}
      <main className="flex-1 overflow-y-auto pb-32">
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
          {ratingsCount === 0 ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-200 rounded-full mb-6">
                <MessageCircle className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {t('adDetail.feedback.noReviewsYet')}
              </h3>
              <p className="text-gray-600 max-w-sm mx-auto">
                {t('adDetail.feedback.beFirstToReview')}
              </p>
            </div>
          ) : (
            feedbacks.map((feedback) => (
              <article key={feedback.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    {console.log('Rendering avatar for:', feedback.authorName, 'photo:', feedback.authorPhoto)}
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {feedback.authorPhoto && feedback.authorPhoto !== 'null' && feedback.authorPhoto !== '' ? (
                        <img
                          src={feedback.authorPhoto.startsWith('http') ? feedback.authorPhoto : `https://www.cambizzle.seed-innov.com/${feedback.authorPhoto}`}
                          alt={`${feedback.authorName || 'User'} avatar`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            console.log('Avatar image failed to load:', feedback.authorPhoto);
                            e.target.style.display = 'none';
                            e.target.parentElement.querySelector('.fallback-icon').style.display = 'flex';
                          }}
                          onLoad={() => {
                            console.log('Avatar image loaded successfully:', feedback.authorPhoto);
                          }}
                        />
                      ) : null}
                      <User
                        className="w-6 h-6 text-white fallback-icon"
                        style={{ display: (feedback.authorPhoto && feedback.authorPhoto !== 'null' && feedback.authorPhoto !== '') ? 'none' : 'flex' }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">
                          {feedback.authorName || `User ${feedback.authorUserId}`}
                        </h4>
                        <time className="text-sm text-gray-500">
                          {formatDate(feedback.createdAt)}
                        </time>
                      </div>

                      <div className="flex items-center gap-1 mb-3">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-5 h-5 ${
                              i < parseInt(feedback.rating)
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>

                      <p className="text-gray-800 leading-relaxed">
                        {feedback.content}
                      </p>

                      {/* Photos */}
                      {feedback.photos && feedback.photos !== 'null' && feedback.photos !== '[]' && (
                        <div className="flex gap-2 mt-4 overflow-x-auto">
                          {JSON.parse(feedback.photos).map((photo, index) => (
                            <img
                              key={index}
                              src={photo}
                              alt={`Feedback photo ${index + 1}`}
                              className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </main>

      {/* Fixed writing area at bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          {isAuthenticated ? (
            <div className="space-y-4">
              {/* Success message */}
              {submitSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-green-800 text-sm font-medium">
                    {t('adDetail.feedback.submitSuccess')}
                  </p>
                </div>
              )}

              {/* Star selection */}
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700">{t('adDetail.feedback.yourRating')}</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                    >
                      <Star
                        className={`w-7 h-7 transition-colors ${
                          star <= rating
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Input + bouton */}
              <div className="flex items-end gap-3">
                <div className="flex-1 relative">
                  <textarea
                    ref={textareaRef}
                    value={newFeedback}
                    onChange={(e) => setNewFeedback(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        submitFeedback();
                      }
                    }}
                    placeholder={t('adDetail.feedback.shareExperience')}
                    className="w-full px-4 py-3 pr-12 bg-gray-50 border border-gray-300 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    rows={1}
                    style={{ minHeight: '48px', maxHeight: '120px' }}
                  />
                </div>

                <Button
                  onClick={submitFeedback}
                  disabled={!newFeedback.trim() || submitting}
                  className="mb-1 px-5 py-3 rounded-2xl bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-700 mb-3">
                {t('adDetail.feedback.signInToReview')}
              </p>
              <Button
                onClick={() => navigate('/login')}
                className="bg-blue-500 hover:bg-blue-600"
              >
                {t('adDetail.feedback.signIn')}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}