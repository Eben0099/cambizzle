import { useState, useEffect } from 'react';
import { Loader, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import boostService from '../services/boostService';

/**
 * Test page for Step 1: List promotion packs
 * This page tests the GET /api/promotion-packs endpoint
 */
const TestPromotionPacks = () => {
  const [packs, setPacks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [rawResponse, setRawResponse] = useState(null);

  const fetchPacks = async () => {
    setLoading(true);
    setError(null);
    setRawResponse(null);
    
    try {
      console.log('=== TEST STEP 1: Fetching Promotion Packs ===');
      console.log('Endpoint: GET /api/promotion-packs');
      console.log('Headers: Authorization Bearer token from localStorage');
      
      const response = await boostService.getPromotionPacks();
      
      console.log('Raw Response:', response);
      setRawResponse(JSON.stringify(response, null, 2));
      
      // Try different response structures
      const extractedPacks = response.data || response.packs || response || [];
      console.log('Extracted Packs:', extractedPacks);
      
      if (Array.isArray(extractedPacks)) {
        setPacks(extractedPacks);
        console.log(`✅ Successfully loaded ${extractedPacks.length} pack(s)`);
      } else {
        throw new Error('Response is not an array');
      }
      
    } catch (err) {
      console.error('❌ Error:', err);
      setError(err.message || 'Failed to fetch promotion packs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPacks();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Test: Promotion Packs (Step 1)
          </h1>
          <p className="text-gray-600 mb-4">
            Testing: GET /api/promotion-packs
          </p>
          
          <button
            onClick={fetchPacks}
            disabled={loading}
            className="bg-[#D6BA69] hover:bg-[#C5A952] text-black px-4 py-2 rounded-lg disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Reload Packs'}
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <Loader className="w-8 h-8 text-[#D6BA69] animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading promotion packs...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-start">
              <AlertCircle className="w-6 h-6 text-red-500 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-red-800 font-semibold mb-2">Error</h3>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Success State */}
        {!loading && !error && packs.length > 0 && (
          <>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                <p className="text-green-800 font-semibold">
                  Successfully loaded {packs.length} promotion pack(s)
                </p>
              </div>
            </div>

            {/* Display Packs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              {packs.map((pack) => (
                <div
                  key={pack.id}
                  className="bg-white rounded-lg shadow-sm border-2 border-gray-200 p-6 hover:border-[#D6BA69] transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{pack.name}</h3>
                      <p className="text-sm text-gray-500">ID: {pack.id}</p>
                      <p className="text-sm text-gray-500">Type: {pack.type || 'boost'}</p>
                    </div>
                    <span className="text-2xl font-bold text-[#D6BA69]">
                      {pack.price} FCFA
                    </span>
                  </div>

                  {pack.description && (
                    <p className="text-gray-600 mb-4">{pack.description}</p>
                  )}

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-gray-700">
                      <Clock className="w-4 h-4 mr-2 text-[#D6BA69]" />
                      <span className="font-medium">Duration: {pack.duration_days} days</span>
                    </div>
                    
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-2 ${pack.is_active ? 'bg-green-500' : 'bg-red-500'}`} />
                      <span className="text-gray-700">
                        Status: {pack.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    {pack.features && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="font-semibold text-gray-700 mb-2">Features:</p>
                        <ul className="space-y-1">
                          {pack.features.split(',').map((feature, idx) => (
                            <li key={idx} className="flex items-start text-gray-600">
                              <CheckCircle className="w-4 h-4 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                              <span>{feature.trim()}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Raw Data (collapsible) */}
                  <details className="mt-4 pt-4 border-t border-gray-200">
                    <summary className="text-sm text-gray-600 cursor-pointer hover:text-gray-900">
                      View Raw Data
                    </summary>
                    <pre className="mt-2 text-xs bg-gray-100 p-3 rounded overflow-x-auto">
                      {JSON.stringify(pack, null, 2)}
                    </pre>
                  </details>
                </div>
              ))}
            </div>
          </>
        )}

        {/* No Packs */}
        {!loading && !error && packs.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No promotion packs available</p>
          </div>
        )}

        {/* Raw Response Debug */}
        {rawResponse && (
          <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Raw API Response</h3>
            <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm">
              {rawResponse}
            </pre>
          </div>
        )}

        {/* Console Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
          <h3 className="text-blue-900 font-semibold mb-2">📋 Debug Instructions</h3>
          <p className="text-blue-800 text-sm mb-2">
            Open the browser console (F12) to see detailed logs of the API request and response.
          </p>
          <p className="text-blue-700 text-sm">
            Expected structure: Array of objects with id, name, duration_days, price, type, is_active
          </p>
        </div>
      </div>
    </div>
  );
};

export default TestPromotionPacks;
