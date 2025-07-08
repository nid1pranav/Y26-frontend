import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Calendar, Users, MapPin, Clock, Eye } from 'lucide-react';
import { eventsAPI, Event } from '@/api';
import { useAuth } from '@/context/AuthContext';
import { useApi } from '@/hooks/useApi';

const WorkshopLeadWorkshops = () => {
  const { user } = useAuth();
  const [workshops, setWorkshops] = useState<Event[]>([]);
  
  const { execute: fetchEvents, loading } = useApi(eventsAPI.getAll, {
    showSuccessToast: false,
    showErrorToast: true,
    errorMessage: 'Failed to fetch workshops'
  });

  useEffect(() => {
    const loadWorkshops = async () => {
      const data = await fetchEvents();
      if (data) {
        // Filter workshops created by current user and type WORKSHOP
        const userWorkshops = data.filter(event => 
          event.creator.id === user?.id && event.type === 'WORKSHOP'
        );
        setWorkshops(userWorkshops);
      }
    };

    loadWorkshops();
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
          <h1 className="text-2xl font-bold text-gray-900">My Workshops</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your workshops and their financial planning
          </p>
        </div>
        
        <Link
          to="/workshop-leads/workshops/create"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Workshop
        </Link>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {workshops.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No workshops</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating a new workshop.
              </p>
              <Link
                to="/workshop-leads/workshops/create"
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Workshop
              </Link>
            </div>
          ) : (
            workshops.map((workshop) => (
              <li key={workshop.id}>
                <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-medium text-gray-900 truncate">
                          {workshop.name}
                        </h3>
                        {getStatusBadge(workshop.status)}
                      </div>
                      
                      <div className="mt-2 flex items-center text-sm text-gray-500 space-x-4">
                        {workshop.coordinator && (
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            <span>Coordinated by {workshop.coordinator.name}</span>
                          </div>
                        )}
                        
                        {workshop.venue && (
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            <span>{workshop.venue}</span>
                          </div>
                        )}
                        
                        {workshop.dateTime && (
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            <span>{new Date(workshop.dateTime).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                      
                      {workshop.description && (
                        <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                          {workshop.description}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/events/${workshop.id}`}
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

export default WorkshopLeadWorkshops;