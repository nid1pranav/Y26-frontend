import React, { useEffect, useState } from 'react';
import { MapPin, Calendar, Users, Filter, CheckCircle, Plus, Download, Edit2, Trash2 } from 'lucide-react';
import { venuesAPI, eventsAPI, Event, Venue } from '@/api';
import { useApi } from '@/hooks/useApi';
import { useToast } from '@/components/ui/Toast';

interface EventForAssignment extends Event {
  venue?: Venue;
}

const VenueManagement = () => {
  const [events, setEvents] = useState<EventForAssignment[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<EventForAssignment[]>([]);
  const [showVenueModal, setShowVenueModal] = useState(false);
  const [editingVenue, setEditingVenue] = useState<Venue | null>(null);
  const [venueFormData, setVenueFormData] = useState({
    name: '',
    description: '',
    capacity: '',
    location: '',
    facilities: ''
  });
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    dateFrom: '',
    dateTo: '',
    venueAssigned: ''
  });

  const { showSuccess } = useToast();

  const { execute: fetchEvents, loading: eventsLoading } = useApi(eventsAPI.getAll, {
    showSuccessToast: false,
    showErrorToast: true,
    errorMessage: 'Failed to fetch events'
  });

  const { execute: fetchVenues } = useApi(venuesAPI.getAll, {
    showSuccessToast: false,
    showErrorToast: true,
    errorMessage: 'Failed to fetch venues'
  });

  const { execute: assignVenue } = useApi(venuesAPI.assignVenue, {
    showSuccessToast: false,
    showErrorToast: true,
    errorMessage: 'Failed to assign venue'
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
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [events, filters]);

  const loadData = async () => {
    const [eventsData, venuesData] = await Promise.all([
      fetchEvents(),
      fetchVenues()
    ]);

    if (eventsData) setEvents(eventsData);
    if (venuesData) setVenues(venuesData);
  };

  const applyFilters = () => {
    let filtered = [...events];

    if (filters.status) {
      filtered = filtered.filter(event => event.status === filters.status);
    }

    if (filters.type) {
      filtered = filtered.filter(event => event.type === filters.type);
    }

    if (filters.venueAssigned === 'assigned') {
      filtered = filtered.filter(event => event.venueId);
    } else if (filters.venueAssigned === 'unassigned') {
      filtered = filtered.filter(event => !event.venueId);
    }

    if (filters.dateFrom) {
      filtered = filtered.filter(event => 
        event.dateTime && new Date(event.dateTime) >= new Date(filters.dateFrom)
      );
    }

    if (filters.dateTo) {
      filtered = filtered.filter(event => 
        event.dateTime && new Date(event.dateTime) <= new Date(filters.dateTo)
      );
    }

    setFilteredEvents(filtered);
  };

  const handleAssignVenue = async (eventId: string, venueId: string) => {
    const result = await assignVenue(venueId, eventId);
    if (result) {
      showSuccess('Venue assigned successfully');
      loadData();
    }
  };

  const handleVenueSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const venueData = {
      ...venueFormData,
      capacity: venueFormData.capacity ? parseInt(venueFormData.capacity) : undefined
    };

    if (editingVenue) {
      const result = await updateVenue(editingVenue.id, venueData);
      if (result) {
        showSuccess('Venue updated successfully');
        loadData();
        resetVenueForm();
      }
    } else {
      const result = await createVenue(venueData);
      if (result) {
        showSuccess('Venue created successfully');
        loadData();
        resetVenueForm();
      }
    }
  };

  const handleDeleteVenue = async (venue: Venue) => {
    if (confirm(`Are you sure you want to delete ${venue.name}?`)) {
      const result = await deleteVenue(venue.id);
      if (result) {
        showSuccess('Venue deleted successfully');
        loadData();
      }
    }
  };

  const resetVenueForm = () => {
    setVenueFormData({ name: '', description: '', capacity: '', location: '', facilities: '' });
    setEditingVenue(null);
    setShowVenueModal(false);
  };

  const openEditVenueModal = (venue: Venue) => {
    setVenueFormData({
      name: venue.name,
      description: venue.description || '',
      capacity: venue.capacity?.toString() || '',
      location: venue.location || '',
      facilities: venue.facilities || ''
    });
    setEditingVenue(venue);
    setShowVenueModal(true);
  };

  const downloadTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Name,Description,Capacity,Location,Facilities\n" +
      "Main Auditorium,Large auditorium for events,500,Main Block,AC Projector Sound System\n" +
      "Conference Hall A,Medium conference hall,100,Admin Block,AC Projector WiFi";
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "venues_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
      APPROVED: { bg: 'bg-green-100', text: 'text-green-800', label: 'Approved' },
      REJECTED: { bg: 'bg-red-100', text: 'text-red-800', label: 'Rejected' },
      COMPLETED: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Completed' }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
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
          <h1 className="text-2xl font-bold text-gray-900">Venue Management</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage venues and assign them to approved events and workshops
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
            onClick={() => setShowVenueModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Venue
          </button>
        </div>
      </div>

      {/* Venues List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Venues</h3>
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
              {venues.map((venue) => (
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
                    {venue.events?.length || 0} assigned
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => openEditVenueModal(venue)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      
                      <button
                        onClick={() => handleDeleteVenue(venue)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center mb-4">
          <Filter className="h-5 w-5 text-gray-400 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Event Assignment Filters</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Type</label>
            <select
              value={filters.type}
              onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">All Types</option>
              <option value="EVENT">Event</option>
              <option value="WORKSHOP">Workshop</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Venue Status</label>
            <select
              value={filters.venueAssigned}
              onChange={(e) => setFilters(prev => ({ ...prev, venueAssigned: e.target.value }))}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">All</option>
              <option value="assigned">Venue Assigned</option>
              <option value="unassigned">No Venue</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Date From</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Date To</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        </div>
      </div>

      {/* Events List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Events & Workshops</h3>
            <span className="text-sm text-gray-500">{filteredEvents.length} items</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Event/Workshop
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Venue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assign Venue
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No events found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      No events match the current filters.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredEvents.map((event) => (
                  <tr key={event.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{event.title}</div>
                        <div className="text-sm text-gray-500">{event.description}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        event.type === 'EVENT' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                      }`}>
                        {event.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(event.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {event.dateTime ? (
                        <div>
                          <div>{new Date(event.dateTime).toLocaleDateString()}</div>
                          <div className="text-xs text-gray-500">
                            {new Date(event.dateTime).toLocaleTimeString()}
                          </div>
                        </div>
                      ) : (
                        'TBD'
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {event.venue ? (
                        <div className="flex items-center text-sm text-green-600">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          {event.venue.name}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">Not assigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {event.status === 'APPROVED' && (
                        <select
                          value={event.venueId || ''}
                          onChange={(e) => e.target.value && handleAssignVenue(event.id, e.target.value)}
                          className="text-sm border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Select Venue</option>
                          {venues.map(venue => (
                            <option key={venue.id} value={venue.id}>
                              {venue.name} ({venue.capacity ? `${venue.capacity} capacity` : 'No limit'})
                            </option>
                          ))}
                        </select>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Venue Modal */}
      {showVenueModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingVenue ? 'Edit Venue' : 'Add New Venue'}
              </h3>
              
              <form onSubmit={handleVenueSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name *</label>
                  <input
                    type="text"
                    required
                    value={venueFormData.name}
                    onChange={(e) => setVenueFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={venueFormData.description}
                    onChange={(e) => setVenueFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    rows={3}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Capacity</label>
                  <input
                    type="number"
                    min="1"
                    value={venueFormData.capacity}
                    onChange={(e) => setVenueFormData(prev => ({ ...prev, capacity: e.target.value }))}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Location</label>
                  <input
                    type="text"
                    value={venueFormData.location}
                    onChange={(e) => setVenueFormData(prev => ({ ...prev, location: e.target.value }))}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Facilities</label>
                  <input
                    type="text"
                    value={venueFormData.facilities}
                    onChange={(e) => setVenueFormData(prev => ({ ...prev, facilities: e.target.value }))}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="e.g., AC, Projector, Sound System"
                  />
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={resetVenueForm}
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

export default VenueManagement;