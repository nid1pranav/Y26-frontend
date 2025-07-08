import React, { useEffect, useState } from 'react';
import { Package, Receipt, Calendar, TrendingUp, Plus, DollarSign, CheckCircle, Clock } from 'lucide-react';
import { eventsAPI, expensesAPI, Event, Expense } from '../../api';

const FacilitiesDashboard = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [recentExpenses, setRecentExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const eventsData = await eventsAPI.getAll();
        const approvedEvents = eventsData.filter(event => event.status === 'APPROVED');
        setEvents(approvedEvents);

        // Fetch recent expenses for approved events
        if (approvedEvents.length > 0) {
          const expensesPromises = approvedEvents.slice(0, 3).map(event => 
            expensesAPI.getByEventId(event.id)
          );
          const expensesResults = await Promise.all(expensesPromises);
          const allExpenses = expensesResults.flat().sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setRecentExpenses(allExpenses.slice(0, 10));
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const totalExpenses = recentExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalApprovedBudget = events.reduce((sum, event) => {
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
              Facilities Team Dashboard
            </h1>
            <p className="text-gray-600 text-lg">
              Manage expenses for approved events and maintain product catalog
            </p>
          </div>
          <div className="hidden md:block">
            <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-6 py-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <Package className="h-5 w-5" />
                <span className="font-semibold">Facilities Team</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center">
            <Package className="h-5 w-5 text-purple-600 mr-2" />
            <span className="text-purple-800 font-medium">Facilities Team Access</span>
          </div>
          <p className="text-purple-700 text-sm mt-1">
            You can add expenses to approved events and manage the product catalog.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Approved Events</p>
              <p className="text-3xl font-bold text-gray-900">{events.length}</p>
              <p className="text-xs text-gray-500 mt-1">Ready for expenses</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Available Budget</p>
              <p className="text-3xl font-bold text-gray-900">₹{totalApprovedBudget.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">Total approved</p>
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

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Remaining Budget</p>
              <p className="text-3xl font-bold text-gray-900">₹{(totalApprovedBudget - totalExpenses).toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">Available to spend</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <a
            href="/expenses"
            className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors group"
          >
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
              <Plus className="h-5 w-5 text-green-600" />
            </div>
            <div className="ml-3">
              <span className="text-green-700 font-medium">Add Expense</span>
              <p className="text-green-600 text-xs">Record new expense</p>
            </div>
          </a>
          
          <a
            href="/products"
            className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors group"
          >
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
              <Package className="h-5 w-5 text-purple-600" />
            </div>
            <div className="ml-3">
              <span className="text-purple-700 font-medium">Product Catalog</span>
              <p className="text-purple-600 text-xs">Manage products</p>
            </div>
          </a>
          
          <a
            href="/events"
            className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors group"
          >
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <span className="text-blue-700 font-medium">View Events</span>
              <p className="text-blue-600 text-xs">Browse approved events</p>
            </div>
          </a>
        </div>
      </div>

      {/* Approved Events */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Approved Events</h2>
        <div className="space-y-4">
          {events.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No approved events</h3>
              <p className="text-gray-500">Events will appear here once approved by the finance team</p>
            </div>
          ) : (
            events.slice(0, 5).map((event) => {
              const eventBudget = event.budgets?.reduce((sum, budget) => sum + (budget.approvedAmount || budget.amount), 0) || 0;
              return (
                <div key={event.id} className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center space-x-4">
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    <div>
                      <h3 className="font-medium text-gray-900">{event.name}</h3>
                      <p className="text-sm text-gray-600">{event.type} • Created by {event.creator.name}</p>
                      {event.coordinator && (
                        <p className="text-xs text-gray-500">Coordinator: {event.coordinator.name}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">₹{eventBudget.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">Approved budget</p>
                    </div>
                    <a
                      href={`/events/${event.id}`}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                    >
                      Manage →
                    </a>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Recent Expenses */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Expenses</h2>
        <div className="space-y-4">
          {recentExpenses.length === 0 ? (
            <div className="text-center py-8">
              <Receipt className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No expenses recorded</h3>
              <p className="text-gray-500">Start adding expenses to approved events</p>
            </div>
          ) : (
            recentExpenses.slice(0, 5).map((expense) => (
              <div key={expense.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Receipt className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{expense.itemName}</h3>
                    <p className="text-sm text-gray-600">{expense.category.name} • Qty: {expense.quantity}</p>
                    <p className="text-xs text-gray-500">Added by {expense.addedBy.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-gray-900">₹{expense.amount.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">{new Date(expense.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default FacilitiesDashboard;