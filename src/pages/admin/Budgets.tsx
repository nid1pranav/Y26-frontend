import React, { useEffect, useState } from 'react';
import { DollarSign, Calendar, CheckCircle, Clock, XCircle, Eye, Filter } from 'lucide-react';
import { eventsAPI, budgetsAPI, Event, Budget } from '@/api';
import { useAuth } from '@/context/AuthContext';
import { useApi } from '@/hooks/useApi';
import { useToast } from '@/components/ui/Toast';

const AdminBudgets = () => {
  const { user } = useAuth();
  const { showSuccess } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalData, setApprovalData] = useState({
    status: 'APPROVED' as 'APPROVED' | 'REJECTED',
    remarks: '',
    budgetAdjustments: [] as any[]
  });

  const { execute: fetchEvents, loading: eventsLoading } = useApi(eventsAPI.getAll, {
    showSuccessToast: false,
    showErrorToast: true,
    errorMessage: 'Failed to fetch events'
  });

  const { execute: fetchBudgets } = useApi(budgetsAPI.getByEventId, {
    showSuccessToast: false,
    showErrorToast: true,
    errorMessage: 'Failed to fetch budgets'
  });

  const { execute: approveBudget, loading: approving } = useApi(budgetsAPI.approve, {
    showSuccessToast: false,
    showErrorToast: true,
    errorMessage: 'Failed to approve budget'
  });

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    const data = await fetchEvents();
    if (data) {
      setEvents(data);
    }
  };

  const loadBudgets = async (eventId: string) => {
    const data = await fetchBudgets(eventId);
    if (data) {
      setBudgets(data);
      setApprovalData(prev => ({
        ...prev,
        budgetAdjustments: data.map(budget => ({
          categoryId: budget.categoryId,
          approvedAmount: budget.approvedAmount || budget.amount,
          sponsorAmount: budget.sponsorAmount || 0
        }))
      }));
    }
  };

  const handleEventSelect = async (event: Event) => {
    setSelectedEvent(event);
    await loadBudgets(event.id);
  };

  const handleApproval = async () => {
    if (!selectedEvent) return;

    const result = await approveBudget(selectedEvent.id, approvalData);
    if (result) {
      showSuccess(
        `Budget ${approvalData.status.toLowerCase()}`,
        `Budget has been ${approvalData.status.toLowerCase()} successfully`
      );
      setShowApprovalModal(false);
      loadEvents();
      setSelectedEvent(null);
      setBudgets([]);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending', icon: Clock },
      APPROVED: { bg: 'bg-green-100', text: 'text-green-800', label: 'Approved', icon: CheckCircle },
      REJECTED: { bg: 'bg-red-100', text: 'text-red-800', label: 'Rejected', icon: XCircle },
      COMPLETED: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Completed', icon: CheckCircle }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${config.bg} ${config.text}`}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </span>
    );
  };

  const getTotalBudget = () => {
    return budgets.reduce((sum, budget) => sum + budget.amount, 0);
  };

  const getTotalApprovedBudget = () => {
    return approvalData.budgetAdjustments.reduce((sum, adj) => sum + adj.approvedAmount, 0);
  };

  if (eventsLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Budget Management</h1>
          <p className="mt-1 text-sm text-gray-600">
            Review and approve event budgets
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Events List */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Events</h3>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {events.length === 0 ? (
                <div className="p-6 text-center">
                  <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No events</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    No events found
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {events.map((event) => (
                    <div
                      key={event.id}
                      onClick={() => handleEventSelect(event)}
                      className={`p-4 cursor-pointer hover:bg-gray-50 ${
                        selectedEvent?.id === event.id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {event.title}
                          </h4>
                          <p className="text-xs text-gray-500">{event.type}</p>
                          <p className="text-xs text-gray-500">
                            Created by {event.creator.name}
                          </p>
                        </div>
                        <div className="ml-2">
                          {getStatusBadge(event.status)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Budget Details */}
        <div className="lg:col-span-2">
          {selectedEvent ? (
            <div className="space-y-6">
              {/* Event Info */}
              <div className="bg-white shadow rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">{selectedEvent.title}</h3>
                  {getStatusBadge(selectedEvent.status)}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Type:</span>
                    <span className="ml-2 text-gray-900">{selectedEvent.type}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Creator:</span>
                    <span className="ml-2 text-gray-900">{selectedEvent.creator.name}</span>
                  </div>
                  {selectedEvent.coordinator && (
                    <div>
                      <span className="text-gray-500">Coordinator:</span>
                      <span className="ml-2 text-gray-900">{selectedEvent.coordinator.name}</span>
                    </div>
                  )}
                  {selectedEvent.dateTime && (
                    <div>
                      <span className="text-gray-500">Date:</span>
                      <span className="ml-2 text-gray-900">
                        {new Date(selectedEvent.dateTime).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Budget Breakdown */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">Budget Breakdown</h3>
                    <div className="text-sm text-gray-500">
                      Total: ₹{getTotalBudget().toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Requested
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Sponsor Amount
                        </th>
                        {selectedEvent.status === 'PENDING' && (
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Approved Amount
                          </th>
                        )}
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Remarks
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {budgets.map((budget, index) => (
                        <tr key={budget.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {budget.category.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ₹{budget.amount.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ₹{budget.sponsorAmount.toLocaleString()}
                          </td>
                          {selectedEvent.status === 'PENDING' && (
                            <td className="px-6 py-4 whitespace-nowrap">
                              <input
                                type="number"
                                min="0"
                                value={approvalData.budgetAdjustments[index]?.approvedAmount || budget.amount}
                                onChange={(e) => {
                                  const newAdjustments = [...approvalData.budgetAdjustments];
                                  newAdjustments[index] = {
                                    ...newAdjustments[index],
                                    approvedAmount: parseFloat(e.target.value) || 0
                                  };
                                  setApprovalData(prev => ({ ...prev, budgetAdjustments: newAdjustments }));
                                }}
                                className="w-24 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                              />
                            </td>
                          )}
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {budget.remarks || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Approval Actions */}
              {selectedEvent.status === 'PENDING' && (
                <div className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Budget Review</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="text-sm text-blue-600">Total Requested</div>
                        <div className="text-xl font-semibold text-blue-900">
                          ₹{getTotalBudget().toLocaleString()}
                        </div>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="text-sm text-green-600">Total Approved</div>
                        <div className="text-xl font-semibold text-green-900">
                          ₹{getTotalApprovedBudget().toLocaleString()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => {
                          setApprovalData(prev => ({ ...prev, status: 'REJECTED' }));
                          setShowApprovalModal(true);
                        }}
                        className="px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
                      >
                        Reject Budget
                      </button>
                      <button
                        onClick={() => {
                          setApprovalData(prev => ({ ...prev, status: 'APPROVED' }));
                          setShowApprovalModal(true);
                        }}
                        className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                      >
                        Approve Budget
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white shadow rounded-lg p-12 text-center">
              <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Select an event</h3>
              <p className="mt-1 text-sm text-gray-500">
                Choose an event from the list to view its budget details
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Approval Modal */}
      {showApprovalModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {approvalData.status === 'APPROVED' ? 'Approve Budget' : 'Reject Budget'}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Remarks *
                  </label>
                  <textarea
                    required
                    value={approvalData.remarks}
                    onChange={(e) => setApprovalData(prev => ({ ...prev, remarks: e.target.value }))}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    rows={4}
                    placeholder="Enter your remarks for this decision..."
                  />
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={() => setShowApprovalModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleApproval}
                    disabled={approving || !approvalData.remarks.trim()}
                    className={`px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md disabled:opacity-50 ${
                      approvalData.status === 'APPROVED' 
                        ? 'bg-green-600 hover:bg-green-700' 
                        : 'bg-red-600 hover:bg-red-700'
                    }`}
                  >
                    {approving ? 'Processing...' : `${approvalData.status === 'APPROVED' ? 'Approve' : 'Reject'} Budget`}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBudgets;