import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Calendar, Users, MapPin, Clock, Eye } from 'lucide-react';
import { eventsAPI, Event } from '@/api';
import { useAuth } from '@/context/AuthContext';
import { useApi } from '@/hooks/useApi';

const EventLeadEvents = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  
  const { execute: fetchEvents, loading } = useApi(eventsAPI.getAll, {
    showSuccessToast: false,
    showErrorToast: true,
    errorMessage: 'Failed to fetch events'
  });

  useEffect(() => {
    const loadEvents = async () => {
      const data = await fetchEvents();
      if (data) {
        // Filter events created by current user and type EVENT
        const userEvents = data.filter(event => 
          event.creator.id === user?.id && event.type === 'EVENT'
        );
        setEvents(userEvents);
      }
    };

    loadEvents();
  }, [user]);

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
          <h1 className="text-2xl font-bold text-gray-900">My Events</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your events and their financial planning
          </p>
        </div>
        
        <Link
          to="/event-leads/events/create"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Event
        </Link>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {events.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No events</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating a new event.
              </p>
              <Link
                to="/event-leads/events/create"
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Event
              </Link>
            </div>
          ) : (
            events.map((event) => (
              <li key={event.id}>
                <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-medium text-gray-900 truncate">
                          {event.name}
                        </h3>
                        {getStatusBadge(event.status)}
                      </div>
                      
                      <div className="mt-2 flex items-center text-sm text-gray-500 space-x-4">
                        {event.coordinator && (
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            <span>Coordinated by {event.coordinator.name}</span>
                          </div>
                        )}
                        
                        {event.venue && (
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            <span>{event.venue}</span>
                          </div>
                        )}
                        
                        {event.dateTime && (
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            <span>{new Date(event.dateTime).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                      
                      {event.description && (
                        <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                          {event.description}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/events/${event.id}`}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Link>
                    </div>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
};

export default EventLeadEvents;