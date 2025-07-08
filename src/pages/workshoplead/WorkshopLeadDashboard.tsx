import React, { useEffect, useState } from 'react';
import { Plus, Calendar, Clock, CheckCircle, XCircle, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';
import { eventsAPI, Event } from '../../api';
import { useAuth } from '../../context/AuthContext';

const WorkshopLeadDashboard = () => {
  const { user } = useAuth();
  const [workshops, setWorkshops] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkshops = async () => {
      try {
        const data = await eventsAPI.getAll();
        // Filter workshops created by current user
        const userWorkshops = data.filter(event => 
          event.creatorId === user?.id && event.type === 'WORKSHOP'
        );
        setWorkshops(userWorkshops);
      } catch (error) {
        console.error('Failed to fetch workshops:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkshops();
  }, [user]);

  const pendingWorkshops = workshops.filter(workshop => workshop.status === 'PENDING');
  const approvedWorkshops = workshops.filter(workshop => workshop.status === 'APPROVED');
  const rejectedWorkshops = workshops.filter(workshop => workshop.status === 'REJECTED');

  const totalBudget = workshops.reduce((sum, workshop) => {
    return sum + (workshop.budgets?.reduce((budgetSum, budget) => budgetSum + budget.amount, 0) || 0);
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
              Workshop Team Lead Dashboard
            </h1>
            <p className="text-gray-600 text-lg">
              Create and manage workshops, submit budgets for approval
            </p>
          </div>
          <div className="hidden md:block">
            <div className="bg-purple-600 text-white px-6 py-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span className="font-semibold">Workshop Team Lead</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center">
            <Calendar className="h-5 w-5 text-purple-600 mr-2" />
            <span className="text-purple-800 font-medium">Workshop Team Lead Access</span>
          </div>
          <p className="text-purple-700 text-sm mt-1">
            You can create workshops, manage budgets, and track approval status.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">My Workshops</p>
              <p className="text-3xl font-bold text-gray-900">{workshops.length}</p>
              <p className="text-xs text-gray-500 mt-1">Total created</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Approval</p>
              <p className="text-3xl font-bold text-gray-900">{pendingWorkshops.length}</p>
              <p className="text-xs text-gray-500 mt-1">Awaiting review</p>
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
              <p className="text-3xl font-bold text-gray-900">{approvedWorkshops.length}</p>
              <p className="text-xs text-gray-500 mt-1">Ready to execute</p>
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
              <p className="text-sm font-medium text-gray-600">Total Budget</p>
              <p className="text-3xl font-bold text-gray-900">₹{totalBudget.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">Requested amount</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <a
            href="/workshop-leads/workshops/create"
            className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors group"
          >
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
              <Plus className="h-5 w-5 text-purple-600" />
            </div>
            <div className="ml-3">
              <span className="text-purple-700 font-medium">Create New Workshop</span>
              <p className="text-purple-600 text-xs">Start planning your workshop</p>
            </div>
          </a>
          
          <a
            href="/workshop-leads/budgets"
            className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors group"
          >
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <div className="ml-3">
              <span className="text-green-700 font-medium">Manage Budgets</span>
              <p className="text-green-600 text-xs">Plan your finances</p>
            </div>
          </a>
          
          <a
            href="/workshop-leads/workshops"
            className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors group"
          >
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <span className="text-blue-700 font-medium">View All Workshops</span>
              <p className="text-blue-600 text-xs">Manage your workshops</p>
            </div>
          </a>
        </div>
      </div>

      {/* Recent Workshops */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Workshops</h2>
        <div className="space-y-4">
          {workshops.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No workshops yet</h3>
              <p className="text-gray-500 mb-4">Create your first workshop to get started</p>
              <a
                href="/workshop-leads/workshops/create"
                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Workshop
              </a>
            </div>
          ) : (
            workshops.slice(0, 5).map((workshop) => (
              <div key={workshop.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className={`w-3 h-3 rounded-full ${
                    workshop.status === 'PENDING' ? 'bg-yellow-400' :
                    workshop.status === 'APPROVED' ? 'bg-green-400' :
                    'bg-red-400'
                  }`}></div>
                  <div>
                    <h3 className="font-medium text-gray-900">{workshop.title}</h3>
                    <p className="text-sm text-gray-600">{workshop.type} • {workshop.venue || 'Venue TBD'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                    workshop.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                    workshop.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {workshop.status}
                  </span>
                  <a
                    href={`/events/${workshop.id}`}
                    className="text-purple-600 hover:text-purple-800 text-sm font-medium"
                  >
                    View →
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Alerts */}
      {rejectedWorkshops.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center mb-4">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
            <h3 className="text-lg font-semibold text-red-900">Attention Required</h3>
          </div>
          <p className="text-red-700 mb-4">
            You have {rejectedWorkshops.length} rejected workshop{rejectedWorkshops.length > 1 ? 's' : ''} that need your attention.
          </p>
          <a
            href="/workshop-leads/workshops"
            className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Review Workshops
          </a>
        </div>
      )}
    </div>
  );
};

export default WorkshopLeadDashboard;