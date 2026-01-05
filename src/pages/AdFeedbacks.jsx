import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  Star,
  MessageCircle,
  User,
  Send,
  AlertCircle,
  Clock,
  ThumbsUp
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
  const scrollRef = useRef(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const isOwner = isAuthenticated && user && ad && (
    String(user.idUser) === String(ad.userId) ||
    String(user.idUser) === String(ad.userDetails?.idUser)
  );

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

    const token = localStorage.getItem('token');
    const bodyData = {
      rating: rating,
      content: newFeedback.trim()
    };

    try {
      const response = await fetch(`${API_BASE_URL}/ads/${ad.id}/feedbacks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(bodyData)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Feedback submitted successfully:', result);
        setTimeout(() => setSubmitSuccess(false), 3000);

        setNewFeedback('');
        setRating(5);

        try {
          const summaryRes = await fetch(`${API_BASE_URL}/ads/${ad.id}/feedbacks/summary`);
          const summaryData = await summaryRes.json();
          // Also handle potential wrapping here
          const summary = summaryData?.data || summaryData;
          if (summary) {
            setSummary(summary);
          }
        } catch (error) {
          console.error('Error refreshing summary:', error);
        }
      } else {
        const errorData = await response.json();
        console.error('Full error response:', errorData);
        console.error('Error submitting feedback details:', errorData);

        // Handle 422 Already Reviewed
        if (response.status === 422) {
          setErrorMessage(t('adDetail.feedback.alreadyReviewed'));
          return;
        }

        // Try to find a specific validation message
        let msg = errorData.message || errorData.error || t('adDetail.feedback.submitError');
        if (errorData.messages) {
          const firstErr = Object.values(errorData.messages)[0];
          if (firstErr) msg = Array.isArray(firstErr) ? firstErr[0] : firstErr;
        }
        setErrorMessage(msg);
      }
    } catch (error) {
      console.error('Network error:', error);
      setErrorMessage(t('adDetail.feedback.networkError'));
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

      const resData = await adRes.json();
      console.log('Ad data raw response:', resData);

      // Robust data extraction (handle wrapped or direct response)
      const adData = resData?.data || resData;
      const adFullData = adData?.ad || adData; // Some APIs wrap it in { data: { ad: ... } }

      const realId = adFullData?.id || adFullData?.id_ad || adFullData?.idAd;

      if (realId) {
        console.log('Ad identified with ID:', realId);
        setAd({ ...adFullData, id: realId });

        // Fetch feedbacks (don't break if it fails)
        try {
          const fbRes = await fetch(`${API_BASE_URL}/ads/${realId}/feedbacks?limit=10&page=1`);
          const fbDataRaw = await fbRes.json();
          const fbData = fbDataRaw?.data || fbDataRaw;
          setFeedbacks(fbData?.items || fbData || []);
          setHasMore((fbData?.items?.length || fbData?.length) === 10);
        } catch (fbError) {
          console.error('Feedbacks API error:', fbError);
          setFeedbacks([]);
          setHasMore(false);
        }

        // Fetch summary (don't break if it fails)
        try {
          const summaryRes = await fetch(`${API_BASE_URL}/ads/${realId}/feedbacks/summary`);
          const summaryData = await summaryRes.json();
          const summary = summaryData?.data || summaryData;
          if (summary) {
            setSummary(summary);
          }
        } catch (summaryError) {
          console.log('Summary API error:', summaryError);
          setSummary({ averageRating: 0, ratingsCount: 0, distribution: {} });
        }
      } else {
        throw new Error('Ad ID not found in response');
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
      <main className="flex-1 overflow-y-auto bg-white">
        <div className="max-w-4xl mx-auto px-4 py-8">

          {/* Ratings Summary Section */}
          <section className="mb-10 bg-gray-50 rounded-3xl p-6 sm:p-8 border border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="text-center md:text-left space-y-2">
                <h2 className="text-4xl font-black text-gray-900">{averageRating.toFixed(1)}</h2>
                <div className="flex justify-center md:justify-start gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-6 h-6 ${i < Math.round(averageRating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                <p className="text-gray-600 font-medium">
                  {ratingsCount} {ratingsCount > 1 ? t('adDetail.feedback.reviews') : t('adDetail.feedback.review')}
                </p>
              </div>

              <div className="space-y-3">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = summary?.distribution?.[star] || 0;
                  const percentage = ratingsCount > 0 ? (count / ratingsCount) * 100 : 0;
                  return (
                    <div key={star} className="flex items-center gap-4 group">
                      <span className="text-sm font-bold text-gray-700 w-3">{star}</span>
                      <div className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#D6BA69] transition-all duration-500 ease-out rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-gray-500 w-8">{Math.round(percentage)}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          <div className="space-y-8">
            <h3 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-4">
              {t('adDetail.feedback.allReviews')}
            </h3>

            {ratingsCount === 0 ? (
              <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full shadow-sm mb-6">
                  <MessageCircle className="w-10 h-10 text-gray-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {t('adDetail.feedback.noReviewsYet')}
                </h3>
                <p className="text-gray-500 max-w-xs mx-auto">
                  {t('adDetail.feedback.beFirstToReview')}
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {feedbacks.map((feedback) => (
                  <article
                    key={feedback.id}
                    className="p-6 transition-all border-b border-gray-100 last:border-0"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#D6BA69] to-[#C5A952] flex items-center justify-center flex-shrink-0 overflow-hidden ring-2 ring-white shadow-sm">
                        {feedback.authorPhoto && feedback.authorPhoto !== 'null' && feedback.authorPhoto !== '' ? (
                          <img
                            src={feedback.authorPhoto.startsWith('http') ? feedback.authorPhoto : `https://www.cambizzle.seed-innov.com/${feedback.authorPhoto}`}
                            alt={feedback.authorName}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.parentElement.querySelector('.fallback-icon').style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <User
                          className="w-6 h-6 text-white fallback-icon"
                          style={{ display: (feedback.authorPhoto && feedback.authorPhoto !== 'null' && feedback.authorPhoto !== '') ? 'none' : 'flex' }}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <h4 className="font-bold text-gray-900 truncate">
                            {feedback.authorName || `User ${feedback.authorUserId}`}
                          </h4>
                          <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold text-gray-400">
                            <Clock className="w-3 h-3" />
                            {formatDate(feedback.createdAt)}
                          </span>
                        </div>

                        <div className="flex items-center gap-0.5 mb-3">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${i < parseInt(feedback.rating)
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-200'
                                }`}
                            />
                          ))}
                        </div>

                        <p className="text-gray-700 leading-relaxed text-sm">
                          {feedback.content}
                        </p>

                        {feedback.photos && feedback.photos !== 'null' && feedback.photos !== '[]' && (
                          <div className="flex gap-2 mt-4 overflow-x-auto pb-2 -mx-1 px-1">
                            {JSON.parse(feedback.photos).map((photo, index) => (
                              <img
                                key={index}
                                src={photo}
                                alt={`Feedback ${index}`}
                                className="w-24 h-24 object-cover rounded-xl flex-shrink-0 shadow-sm border border-gray-100 ring-1 ring-black/5"
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Adaptive input area */}
      <div className="sticky bottom-0 bg-white border-t border-gray-100 shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.05)] pb-safe">
        <div className="max-w-4xl mx-auto px-4 py-4 sm:py-6">
          {isAuthenticated ? (
            isOwner ? (
              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                <p className="text-amber-800 text-sm font-semibold">
                  {t('adDetail.feedback.ownerWarning')}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Error/Success messages */}
                {errorMessage && (
                  <div className="bg-red-50 border border-red-100 rounded-xl p-3 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
                    <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                    <p className="text-red-700 text-xs font-bold">{errorMessage}</p>
                  </div>
                )}
                {submitSuccess && (
                  <div className="bg-green-50 border border-green-100 rounded-xl p-3 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
                    <ThumbsUp className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <p className="text-green-700 text-xs font-bold">
                      {t('adDetail.feedback.submitSuccess')}
                    </p>
                  </div>
                )}

                {/* Star selection */}
                {!submitSuccess && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-gray-400 uppercase tracking-widest">{t('adDetail.feedback.yourRating')}</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setRating(star)}
                          className="p-1 hover:scale-110 transition-transform"
                        >
                          <Star
                            className={`w-7 h-7 transition-colors ${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-200'
                              }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input + button */}
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
                      className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-[24px] resize-none focus:outline-none focus:ring-2 focus:ring-[#D6BA69] focus:bg-white transition-all shadow-inner text-sm leading-relaxed"
                      rows={1}
                      style={{ minHeight: '52px', maxHeight: '150px' }}
                    />
                  </div>

                  <Button
                    onClick={submitFeedback}
                    disabled={!newFeedback.trim() || submitting}
                    className="h-[52px] w-[52px] flex items-center justify-center rounded-full bg-[#D6BA69] hover:bg-[#C5A952] disabled:opacity-30 disabled:grayscale transition-all shadow-lg shadow-[#D6BA69]/20"
                  >
                    {submitting ? (
                      <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                    ) : (
                      <Send className="w-5 h-5 text-black" />
                    )}
                  </Button>
                </div>
              </div>
            )
          ) : (
            <div className="text-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <p className="text-gray-600 text-sm font-medium mb-3">
                {t('adDetail.feedback.signInToReview')}
              </p>
              <Button
                onClick={() => navigate('/login')}
                className="bg-[#D6BA69] hover:bg-[#C5A952] text-black font-bold text-sm px-8 rounded-xl"
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