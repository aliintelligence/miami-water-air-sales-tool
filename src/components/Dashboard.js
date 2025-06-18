// src/components/Dashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../utils/i18n';
import { QuoteService } from '../services/quoteService';
import LoadingSpinner from './common/LoadingSpinner';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);
  const [recentQuotes, setRecentQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, [user, isAdmin]);

  const loadDashboardData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Get quote statistics
      const quoteStats = await QuoteService.getQuoteStats(user.id, isAdmin);
      setStats(quoteStats);
      
      // Get recent quotes
      const quotes = await QuoteService.listQuotes(user.id, isAdmin, {
        limit: 5,
        order: 'DESC'
      });
      setRecentQuotes(quotes);
      
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="large" message="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {t('dashboard.welcome', { name: user?.firstName || user?.email }, 'Welcome {{name}}')}
        </h1>
        <p className="text-gray-600 mt-2">
          {isAdmin ? t('dashboard.adminSubtitle', 'Admin Dashboard') : t('dashboard.repSubtitle', 'Sales Dashboard')}
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <button
          onClick={() => navigate('/new-quote')}
          className="p-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <h3 className="text-xl font-bold mb-2">{t('dashboard.newQuote', 'Create New Quote')}</h3>
          <p>{t('dashboard.newQuoteDesc', 'Start a new sales quote')}</p>
        </button>
        
        <button
          onClick={() => navigate('/equipment')}
          className="p-6 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          <h3 className="text-xl font-bold mb-2">{t('dashboard.viewEquipment', 'Equipment Catalog')}</h3>
          <p>{t('dashboard.viewEquipmentDesc', 'Browse available products')}</p>
        </button>
        
        {isAdmin && (
          <button
            onClick={() => navigate('/admin')}
            className="p-6 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition"
          >
            <h3 className="text-xl font-bold mb-2">{t('dashboard.adminPanel', 'Admin Panel')}</h3>
            <p>{t('dashboard.adminPanelDesc', 'Manage system settings')}</p>
          </button>
        )}
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              {t('dashboard.totalQuotes', 'Total Quotes')}
            </h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">{stats.total}</p>
            <p className="mt-1 text-sm text-gray-600">
              {t('dashboard.thisMonth', { count: stats.thisMonth }, '{{count}} this month')}
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              {t('dashboard.pendingQuotes', 'Pending')}
            </h3>
            <p className="mt-2 text-3xl font-bold text-yellow-600">{stats.sent}</p>
            <p className="mt-1 text-sm text-gray-600">
              {t('dashboard.awaitingSignature', 'Awaiting signature')}
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              {t('dashboard.signedQuotes', 'Signed')}
            </h3>
            <p className="mt-2 text-3xl font-bold text-green-600">{stats.signed}</p>
            <p className="mt-1 text-sm text-gray-600">
              {t('dashboard.completed', 'Completed')}
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              {t('dashboard.totalValue', 'Total Value')}
            </h3>
            <p className="mt-2 text-3xl font-bold text-blue-600">
              ${stats.totalValue.toLocaleString()}
            </p>
            <p className="mt-1 text-sm text-gray-600">
              {t('dashboard.averageValue', { amount: stats.averageValue }, 'Avg: ${{amount}}')}
            </p>
          </div>
        </div>
      )}

      {/* Recent Quotes */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            {t('dashboard.recentQuotes', 'Recent Quotes')}
          </h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {recentQuotes.length > 0 ? (
            recentQuotes.map(quote => (
              <div key={quote.id} className="px-6 py-4 hover:bg-gray-50 cursor-pointer">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {quote.customerInfo.firstName} {quote.customerInfo.lastName}
                    </p>
                    <p className="text-sm text-gray-500">{quote.customerInfo.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      ${(quote.discountedPrice || quote.totalPrice).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(quote.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      quote.status === 'SIGNED' ? 'bg-green-100 text-green-800' :
                      quote.status === 'SENT' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {quote.status}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="px-6 py-8 text-center text-gray-500">
              <p>{t('dashboard.noQuotes', 'No quotes yet')}</p>
              <button
                onClick={() => navigate('/new-quote')}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {t('dashboard.createFirst', 'Create your first quote')}
              </button>
            </div>
          )}
        </div>
        
        {recentQuotes.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <button
              onClick={() => navigate('/quotes')}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              {t('dashboard.viewAll', 'View all quotes')} →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}