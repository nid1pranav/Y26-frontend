import React, { useEffect, useState } from 'react';
import { Plus, MapPin, Edit2, Trash2, Users, Download } from 'lucide-react';
import { venuesAPI, Venue } from '@/api';
import { useApi } from '@/hooks/useApi';
import { useToast } from '@/components/ui/Toast';

interface VenueWithEvents extends Venue {
  events: Array<{
    id: string;
    title: string;
    dateTime: string | null;
    status: string;
  }>;
}

const AdminVenues = () => {
  const [venues, setVenues] = useState<VenueWithEvents[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingVenue, setEditingVenue] = useState<VenueWithEvents | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    capacity: '',
    location: '',
    facilities: ''
  });

  const { showSuccess } = useToast();

  const { execute: fetchVenues, loading } = useApi(venuesAPI.getAll, {
    showSuccessToast: false,
    showErrorToast: true,
    errorMessage: 'Failed to fetch venues'
  });

  const { execute: createVenue, loading: creating } = useApi(venuesAPI.create, {
    showSuccessToast: false,
    showErrorToast: true,
    errorMessage: 'Failed to create venue'
  });

  const { execute: updateVenue, loading: updating } = useApi(venuesAPI.update, {
    showSuccessToast: false,
    showErrorToast: true,
    errorMessage: 'Failed to update venue'
  });

  const { execute: deleteVenue } = useApi(venuesAPI.delete, {
    showSuccessToast: false,
    showErrorToast: true,
    errorMessage: 'Failed to delete venue'
  });

  useEffect(() => {
    loadVenues();
  }, []);

  const loadVenues = async () => {
    const data = await fetchVenues();
    if (data) {
      setVenues(data);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const venueData = {
      ...formData,
      capacity: formData.capacity ? parseInt(formData.capacity) : undefined
    };

    if (editingVenue) {
      const result = await updateVenue(editingVenue.id, venueData);
      if (result) {
        showSuccess('Venue updated successfully');
        loadVenues();
        resetForm();
      }
    } else {
      const result = await createVenue(venueData);
      if (result) {
        showSuccess('Venue created successfully');
        loadVenues();
        resetForm();
      }
    }
  };

  const handleDelete = async (venue: VenueWithEvents) => {
    if (confirm(`Are you sure you want to delete ${venue.name}?`)) {
      const result = await deleteVenue(venue.id);
      if (result) {
        showSuccess('Venue deleted successfully');
        loadVenues();
      }
    }
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', capacity: '', location: '', facilities: '' });
    setEditingVenue(null);
    setShowModal(false);
  };

  const openEditModal = (venue: VenueWithEvents) => {
    setFormData({
      name: venue.name,
      description: venue.description || '',
      capacity: venue.capacity?.toString() || '',
      location: venue.location || '',
      facilities: venue.facilities || ''
    });
    setEditingVenue(venue);
    setShowModal(true);
  };

  if (loading) {
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
          <h1 className="text-2xl font-bold text-gray-900">Venue Management</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage venues and their assignments
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            <Download className="h-4 w-4 mr-2" />
            Bulk Upload
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Venue
          </button>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Venues List</h3>
            <span className="text-sm text-gray-500">{venues.length} total venues</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Venue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Capacity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Events
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {venues.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <MapPin className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No venues</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Get started by adding a new venue.
                    </p>
                  </td>
                </tr>
              ) : (
                venues.map((venue) => (
                  <tr key={venue.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{venue.name}</div>
                        <div className="text-sm text-gray-500">{venue.description}</div>
                        {venue.facilities && (
                          <div className="text-xs text-gray-400 mt-1">Facilities: {venue.facilities}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {venue.location || 'Not specified'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Users className="h-4 w-4 mr-1" />
                        {venue.capacity || 'Not specified'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {venue.events.length} assigned
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => openEditModal(venue)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        
                        <button
                          onClick={() => handleDelete(venue)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Venue Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingVenue ? 'Edit Venue' : 'Add New Venue'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    rows={3}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Capacity</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.capacity}
                    onChange={(e) => setFormData(prev => ({ ...prev, capacity: e.target.value }))}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Facilities</label>
                  <input
                    type="text"
                    value={formData.facilities}
                    onChange={(e) => setFormData(prev => ({ ...prev, facilities: e.target.value }))}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="e.g., AC, Projector, Sound System"
                  />
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
                    disabled={creating || updating}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {creating || updating ? 'Saving...' : (editingVenue ? 'Update' : 'Create')}
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

export default AdminVenues;