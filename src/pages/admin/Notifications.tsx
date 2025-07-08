import React, { useState } from 'react';
import { Plus, Bell, Send, Download } from 'lucide-react';
import { notificationsAPI } from '@/api';
import { useApi } from '@/hooks/useApi';
import { useToast } from '@/components/ui/Toast';

const AdminNotifications = () => {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'INFO' as 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR',
    targetRole: '',
    sendToAll: false
  });

  const { showSuccess } = useToast();

  const { execute: createNotification, loading: creating } = useApi(notificationsAPI.create, {
    showSuccessToast: false,
    showErrorToast: true,
    errorMessage: 'Failed to create notification'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = await createNotification(formData);
    if (result) {
      showSuccess('Notification sent successfully', `Sent to ${result.count} users`);
      resetForm();
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      message: '',
      type: 'INFO',
      targetRole: '',
      sendToAll: false
    });
    setShowModal(false);
  };

  const roles = [
    { value: 'ADMIN', label: 'Administrators' },
    { value: 'EVENT_TEAM_LEAD', label: 'Event Team Leads' },
    { value: 'WORKSHOP_TEAM_LEAD', label: 'Workshop Team Leads' },
    { value: 'FINANCE_TEAM', label: 'Finance Team' },
    { value: 'FACILITIES_TEAM', label: 'Facilities Team' },
    { value: 'EVENT_COORDINATOR', label: 'Event Coordinators' },
    { value: 'WORKSHOP_COORDINATOR', label: 'Workshop Coordinators' }
  ];

  const downloadTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Title,Message,Type,TargetRole\n" +
      "Sample Title,Sample Message,INFO,EVENT_TEAM_LEAD\n" +
      "Budget Reminder,Please submit your budget,WARNING,EVENT_TEAM_LEAD\n" +
      "System Maintenance,System will be down for maintenance,ERROR,ALL";
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "notification_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications Management</h1>
          <p className="mt-1 text-sm text-gray-600">
            Send notifications to users based on their roles
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={downloadTemplate}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <Download className="h-4 w-4 mr-2" />
            Download Template
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Notification
          </button>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center py-12">
          <Bell className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Notification Center</h3>
          <p className="mt-1 text-sm text-gray-500">
            Create and send notifications to users based on their roles or send to all users.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <Send className="h-4 w-4 mr-2" />
            Send Notification
          </button>
        </div>
      </div>

      {/* Notification Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Create Notification
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Notification title"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Message *</label>
                  <textarea
                    required
                    value={formData.message}
                    onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    rows={4}
                    placeholder="Notification message"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <option value="INFO">Info</option>
                      <option value="SUCCESS">Success</option>
                      <option value="WARNING">Warning</option>
                      <option value="ERROR">Error</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Target Role</label>
                    <select
                      value={formData.targetRole}
                      onChange={(e) => setFormData(prev => ({ ...prev, targetRole: e.target.value }))}
                      disabled={formData.sendToAll}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100"
                    >
                      <option value="">Select Role</option>
                      {roles.map(role => (
                        <option key={role.value} value={role.value}>{role.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="sendToAll"
                    checked={formData.sendToAll}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      sendToAll: e.target.checked,
                      targetRole: e.target.checked ? '' : prev.targetRole
                    }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="sendToAll" className="ml-2 block text-sm text-gray-900">
                    Send to all users (Global notification)
                  </label>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating || (!formData.sendToAll && !formData.targetRole)}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {creating ? 'Sending...' : 'Send Notification'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNotifications;