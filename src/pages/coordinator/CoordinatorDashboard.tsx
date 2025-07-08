import React, { useEffect, useState } from 'react';
import { Calendar, FileText, TrendingUp, DollarSign, Receipt, Download, Eye } from 'lucide-react';
import { eventsAPI, reportsAPI, Event, FinancialReport } from '../../api';

const CoordinatorDashboard = () => {
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

  const approvedEvents = events.filter(event => event.status === 'APPROVED');
  const totalBudget = events.reduce((sum, event) => {
    return sum + (event.budgets?.reduce((budgetSum, budget) => budgetSum + (budget.approvedAmount || budget.amount), 0) || 0);
  }, 0);

  const totalExpenses = events.reduce((sum, event) => {
    return sum + (event.expenses?.reduce((expenseSum, expense) => expenseSum + expense.amount, 0) || 0);
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
              Event Coordinator Dashboard
            </h1>
            <p className="text-gray-600 text-lg">
              Monitor event finances and download detailed reports
            </p>
          </div>
          <div className="hidden md:block">
            <div className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white px-6 py-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span className="font-semibold">Event Coordinator</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 bg-indigo-50 border border-indigo-200 rounded-lg p-4">
          <div className="flex items-center">
            <FileText className="h-5 w-5 text-indigo-600 mr-2" />
            <span className="text-indigo-800 font-medium">Event Coordinator Access</span>
          </div>
          <p className="text-indigo-700 text-sm mt-1">
            You have read-only access to view expense summaries and download reports for your assigned events.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">My Events</p>
              <p className="text-3xl font-bold text-gray-900">{events.length}</p>
              <p className="text-xs text-gray-500 mt-1">Assigned to me</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Approved Events</p>
              <p className="text-3xl font-bold text-gray-900">{approvedEvents.length}</p>
              <p className="text-xs text-gray-500 mt-1">Ready for execution</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Budget</p>
              <p className="text-3xl font-bold text-gray-900">₹{totalBudget.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">Approved amount</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <Receipt className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Expenses</p>
              <p className="text-3xl font-bold text-gray-900">₹{totalExpenses.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">Amount spent</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <a
            href="/events"
            className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors group"
          >
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
              <Eye className="h-5 w-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <span className="text-blue-700 font-medium">View Events</span>
              <p className="text-blue-600 text-xs">Check event details</p>
            </div>
          </a>
          
          <a
            href="/reports"
            className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors group"
          >
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
              <FileText className="h-5 w-5 text-green-600" />
            </div>
            <div className="ml-3">
              <span className="text-green-700 font-medium">Financial Reports</span>
              <p className="text-green-600 text-xs">Generate reports</p>
            </div>
          </a>
          
          <button className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors group">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
              <Download className="h-5 w-5 text-purple-600" />
            </div>
            <div className="ml-3">
              <span className="text-purple-700 font-medium">Download Reports</span>
              <p className="text-purple-600 text-xs">Export as PDF</p>
            </div>
          </button>
        </div>
      </div>

      {/* My Events */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">My Events</h2>
        <div className="space-y-4">
          {events.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No events assigned</h3>
              <p className="text-gray-500">Events will appear here when you're assigned as a coordinator</p>
            </div>
          ) : (
            events.map((event) => {
              const eventBudget = event.budgets?.reduce((sum, budget) => sum + (budget.approvedAmount || budget.amount), 0) || 0;
              const eventExpenses = event.expenses?.reduce((sum, expense) => sum + expense.amount, 0) || 0;
              const remaining = eventBudget - eventExpenses;
              const usagePercentage = eventBudget > 0 ? (eventExpenses / eventBudget) * 100 : 0;

              return (
                <div key={event.id} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{event.name}</h3>
                      <p className="text-sm text-gray-600">{event.type} • Created by {event.creator.name}</p>
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full mt-2 ${
                        event.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        event.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {event.status}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <a
                        href={`/events/${event.id}`}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                      >
                        View Details
                      </a>
                      <button className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors">
                        Download Report
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Budget</p>
                      <p className="text-lg font-semibold text-gray-900">₹{eventBudget.toLocaleString()}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Spent</p>
                      <p className="text-lg font-semibold text-red-600">₹{eventExpenses.toLocaleString()}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Remaining</p>
                      <p className="text-lg font-semibold text-green-600">₹{remaining.toLocaleString()}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Usage</p>
                      <p className="text-lg font-semibold text-blue-600">{usagePercentage.toFixed(1)}%</p>
                    </div>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        usagePercentage > 90 ? 'bg-red-500' :
                        usagePercentage > 75 ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                    ></div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Budget Utilization Summary */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Budget Utilization Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Total Allocated</h3>
            <p className="text-2xl font-bold text-blue-600">₹{totalBudget.toLocaleString()}</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Receipt className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Total Spent</h3>
            <p className="text-2xl font-bold text-red-600">₹{totalExpenses.toLocaleString()}</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Remaining</h3>
            <p className="text-2xl font-bold text-green-600">₹{(totalBudget - totalExpenses).toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoordinatorDashboard;