'use client';

import { useState, useEffect } from 'react';
import { Globe, ExternalLink, Clock, TrendingUp, RefreshCw, AlertCircle } from 'lucide-react';

interface NewsArticle {
  title: string;
  description: string;
  url: string;
  imageUrl?: string;
  publishedAt: string;
  source: {
    name: string;
    url?: string;
  };
}

export default function TradeNewsFeed() {
  const [newsItems, setNewsItems] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(3);

  useEffect(() => {
    fetchTradeNews();
  }, []);

  const fetchTradeNews = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/news/trade?limit=6');
      const data = await response.json();

      if (data.success) {
        setNewsItems(data.articles);
      } else {
        setError('Unable to load trade intelligence feed');
      }
    } catch (err) {
      setError('Trade news temporarily unavailable');
      console.error('Trade news fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return '1 day ago';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getSourceBadgeColor = (sourceName: string) => {
    const colors: { [key: string]: string } = {
      'FreightWaves': 'bg-blue-100 text-blue-800',
      'Reuters': 'bg-red-100 text-red-800',
      'Bloomberg': 'bg-indigo-100 text-indigo-800',
      'Journal of Commerce': 'bg-green-100 text-green-800',
      'Supply Chain Dive': 'bg-purple-100 text-purple-800',
      'Maritime Executive': 'bg-orange-100 text-orange-800'
    };
    return colors[sourceName] || 'bg-gray-100 text-gray-800';
  };

  const loadMore = () => {
    setVisibleCount(prev => Math.min(prev + 3, newsItems.length));
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <span className="ml-3 text-gray-600">Loading global trade intelligence...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="flex items-center justify-center text-gray-500">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span>{error}</span>
          <button 
            onClick={fetchTradeNews}
            className="ml-4 text-indigo-600 hover:text-indigo-700 font-medium"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-100 p-2 rounded-lg">
              <Globe className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Global Trade Intelligence</h3>
              <p className="text-sm text-gray-600">Real-time insights from industry leaders</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <TrendingUp className="w-4 h-4" />
              <span>Live Feed</span>
            </div>
            <button
              onClick={fetchTradeNews}
              className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
              title="Refresh feed"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* News Grid */}
      <div className="p-6">
        {newsItems.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Globe className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No trade intelligence available at this time</p>
          </div>
        ) : (
          <>
            <div className="grid lg:grid-cols-2 gap-6">
              {newsItems.slice(0, visibleCount).map((item, index) => (
                <article
                  key={`${item.url}-${index}`}
                  className="group cursor-pointer bg-gray-50 rounded-lg border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all duration-200"
                >
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-6"
                  >
                    <div className="flex gap-4">
                      {/* Thumbnail */}
                      <div className="flex-shrink-0">
                        <div className="w-24 h-24 bg-gray-200 rounded-lg overflow-hidden">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.nextElementSibling?.classList.remove('hidden');
                              }}
                            />
                          ) : null}
                          <div className={`w-full h-full flex items-center justify-center ${item.imageUrl ? 'hidden' : ''}`}>
                            <Globe className="w-8 h-8 text-gray-400" />
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h4 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-indigo-700 transition-colors">
                            {item.title}
                          </h4>
                          <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-indigo-600 flex-shrink-0 mt-1" />
                        </div>

                        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                          {item.description}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSourceBadgeColor(item.source.name)}`}>
                              {item.source.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Clock className="w-3 h-3" />
                            {formatDate(item.publishedAt)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </a>
                </article>
              ))}
            </div>

            {/* Load More Button */}
            {visibleCount < newsItems.length && (
              <div className="mt-8 text-center">
                <button
                  onClick={loadMore}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
                >
                  <TrendingUp className="w-4 h-4" />
                  Load More Intelligence
                </button>
              </div>
            )}

            {/* Footer */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Sources: FreightWaves, Reuters, Bloomberg, JOC, Supply Chain Dive</span>
                <span>Updated {formatDate(new Date().toISOString())}</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}