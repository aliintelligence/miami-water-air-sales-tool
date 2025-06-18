// src/components/QuotesHistory.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../utils/i18n';
import { QuoteService } from '../services/quoteService';
import LoadingSpinner from './common/LoadingSpinner';

export default function QuotesHistory() {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const { t } = useTranslation();
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadQuotes();
  }, [user, isAdmin, filter]);

  const loadQuotes = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Build filter based on selected status
      const filterParams = filter === 'all' ? {} : { status: { eq: filter.toUpperCase() } };
      
      const quotesData = await QuoteService.listQuotes(user.id, isAdmin, filterParams);
      setQuotes(quotesData);
      
    } catch (err) {
      console.error('Error loading quotes:', err);
      setError('Failed to load quotes');
    } finally {
      setLoading(false);
    }
  };

  // Filter quotes based on search term
  const filteredQuotes = quotes.filter(quote => {
    const searchLower = searchTerm.toLowerCase();
    return (
      quote.customerInfo.firstName.toLowerCase().includes(searchLower) ||
      quote.customerInfo.lastName.toLowerCase().includes(searchLower) ||
      quote.customerInfo.email.toLowerCase().includes(searchLower) ||
      quote.id.toLowerCase().includes(searchLower)
    );
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'SIGNED':
        return 'bg-green-100 text-green-800';
      case 'SENT':
        return 'bg-yellow-100 text-yellow-800';
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="large" message="Loading quotes..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{t('quotes.title', 'Quotes History')}</h1>
        <p className="text-gray-600 mt-2">
          {isAdmin ? t('quotes.adminSubtitle', 'All company quotes') : t('quotes.repSubtitle', 'Your sales quotes')}
        </p>
      </div>

      {/* Filters and Search */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            {t('quotes.filterAll', 'All')}
          </button>
          <button
            onClick={() => setFilter('draft')}
            className={`px-4 py-2 rounded-lg ${filter === 'draft' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            {t('quotes.filterDraft', 'Draft')}
          </button>
          <button
            onClick={() => setFilter('sent')}
            className={`px-4 py-2 rounded-lg ${filter === 'sent' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            {t('quotes.filterSent', 'Sent')}
          </button>
          <button
            onClick={() => setFilter('signed')}
            className={`px-4 py-2 rounded-lg ${filter === 'signed' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            {t('quotes.filterSigned', 'Signed')}
          </button>
        </div>
        
        <div className="flex-1">
          <input
            type="text"
            placeholder={t('quotes.searchPlaceholder', 'Search by name, email, or ID...')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Quotes Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('quotes.customer', 'Customer')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('quotes.date', 'Date')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('quotes.total', 'Total')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('quotes.status', 'Status')}
                </th>
                {isAdmin && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('quotes.salesRep', 'Sales Rep')}
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('quotes.actions', 'Actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredQuotes.length > 0 ? (
                filteredQuotes.map(quote => (
                  <tr key={quote.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {quote.customerInfo.firstName} {quote.customerInfo.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{quote.customerInfo.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(quote.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${(quote.discountedPrice || quote.totalPrice).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(quote.status)}`}>
                        {quote.status}
                      </span>
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {quote.salesRepId}
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => navigate(`/quote/${quote.id}`)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          {t('quotes.view', 'View')}
                        </button>
                        {quote.documentUrl && (
                          <a
                            href={quote.documentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-green-600 hover:text-green-900"
                          >
                            {t('quotes.document', 'Document')}
                          </a>
                        )}
                        {quote.status === 'DRAFT' && (
                          <button
                            onClick={() => navigate(`/quote/${quote.id}/edit`)}
                            className="text-yellow-600 hover:text-yellow-900"
                          >
                            {t('quotes.edit', 'Edit')}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={isAdmin ? 6 : 5} className="px-6 py-8 text-center text-gray-500">
                    <p>{t('quotes.noQuotesFound', 'No quotes found')}</p>
                    <button
                      onClick={() => navigate('/new-quote')}
                      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      {t('quotes.createNew', 'Create New Quote')}
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}