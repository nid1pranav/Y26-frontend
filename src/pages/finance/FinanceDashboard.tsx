import React, { useEffect, useState } from 'react';
import { Clock, CheckCircle, XCircle, DollarSign, Calendar, TrendingUp, AlertTriangle, FileText } from 'lucide-react';
import { eventsAPI, Event } from '../../api';

const FinanceDashboard = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await eventsAPI.getAll();
        setEvents(data);
      } catch (error) {
        console.error('Failed to fetch events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const pendingEvents = events.filter(event => event.status === 'PENDING');
  const approvedEvents = events.filter(event => event.status === 'APPROVED');
  const rejectedEvents = events.filter(event => event.status === 'REJECTED');

  const totalBudget = events.reduce((sum, event) => {
    return sum + (event.budgets?.reduce((budgetSum, budget) => budgetSum + budget.amount, 0) || 0);
  }, 0);

  const approvedBudget = approvedEvents.reduce((sum, event) => {
    return sum + (event.budgets?.reduce((budgetSum, budget) => budgetSum + (budget.approvedAmount || budget.amount), 0) || 0);
  }, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Finance Team Dashboard
            </h1>
            <p className="text-gray-600 text-lg">
              Review and approve event budgets, manage financial operations
            </p>
          </div>
          <div className="hidden md:block">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5" />
                <span className="font-semibold">Finance Team</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <DollarSign className="h-5 w-5 text-green-600 mr-2" />
            <span className="text-green-800 font-medium">Finance Team Access</span>
          </div>
          <p className="text-green-700 text-sm mt-1">
            You can review budgets, approve/reject events, and manage financial categories.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Review</p>
              <p className="text-3xl font-bold text-gray-900">{pendingEvents.length}</p>
              <p className="text-xs text-gray-500 mt-1">Awaiting approval</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-3xl font-bold text-gray-900">{approvedEvents.length}</p>
              <p className="text-xs text-gray-500 mt-1">Events approved</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Rejected</p>
              <p className="text-3xl font-bold text-gray-900">{rejectedEvents.length}</p>
              <p className="text-xs text-gray-500 mt-1">Events rejected</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Approved Budget</p>
              <p className="text-3xl font-bold text-gray-900">₹{approvedBudget.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">Total approved</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Finance Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <a
            href="/budgets"
            className="flex items-center p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors group"
          >
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center group-hover:bg-yellow-200 transition-colors">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div className="ml-3">
              <span className="text-yellow-700 font-medium">Review Pending Budgets</span>
              <p className="text-yellow-600 text-xs">{pendingEvents.length} pending</p>
            </div>
          </a>
          
          <a
            href="/categories"
            className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors group"
          >
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
              <DollarSign className="h-5 w-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <span className="text-blue-700 font-medium">Manage Categories</span>
              <p className="text-blue-600 text-xs">Budget categories</p>
            </div>
          </a>
          
          <a
            href="/reports"
            className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors group"
          >
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
              <FileText className="h-5 w-5 text-purple-600" />
            </div>
            <div className="ml-3">
              <span className="text-purple-700 font-medium">Financial Reports</span>
              <p className="text-purple-600 text-xs">Generate reports</p>
            </div>
          </a>
        </div>
      </div>

      {/* Pending Events */}
      {pendingEvents.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Events Pending Review</h2>
            <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
              {pendingEvents.length} pending
            </span>
          </div>
          <div className="space-y-4">
            {pendingEvents.slice(0, 5).map((event) => (
              <div key={event.id} className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-center space-x-4">
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <div>
                    <h3 className="font-medium text-gray-900">{event.name}</h3>
                    <p className="text-sm text-gray-600">Created by {event.creator.name}</p>
                    <p className="text-xs text-gray-500">{event.type} • {new Date(event.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      ₹{(event.budgets?.reduce((sum, budget) => sum + budget.amount, 0) || 0).toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">Requested budget</p>
                  </div>
                  <a
                    href={`/events/${event.id}`}
                    className="bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-yellow-700 transition-colors"
                  >
                    Review →
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Budget Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Budget Overview</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Requested</span>
              <span className="font-semibold text-gray-900">₹{totalBudget.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Approved</span>
              <span className="font-semibold text-green-600">₹{approvedBudget.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Approval Rate</span>
              <span className="font-semibold text-blue-600">
                {events.length > 0 ? Math.round((approvedEvents.length / events.length) * 100) : 0}%
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {events.slice(0, 4).map((event) => (
              <div key={event.id} className="flex items-center space-x-3">
                <div className={`w-2 h-2 rounded-full ${
                  event.status === 'PENDING' ? 'bg-yellow-400' :
                  event.status === 'APPROVED' ? 'bg-green-400' :
                  'bg-red-400'
                }`}></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{event.name}</p>
                  <p className="text-xs text-gray-500">{new Date(event.updatedAt).toLocaleDateString()}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  event.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                  event.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {event.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Alert for high pending count */}
      {pendingEvents.length > 5 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
          <div className="flex items-center mb-4">
            <AlertTriangle className="h-5 w-5 text-orange-600 mr-2" />
            <h3 className="text-lg font-semibold text-orange-900">High Pending Count</h3>
          </div>
          <p className="text-orange-700 mb-4">
            You have {pendingEvents.length} events pending review. Consider prioritizing budget approvals to avoid delays.
          </p>
          <a
            href="/budgets"
            className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            Review Now
          </a>
        </div>
      )}
    </div>
  );
};

export default FinanceDashboard;