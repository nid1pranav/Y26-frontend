import React, { useEffect, useState } from 'react';
import { Activity, User, Calendar, Filter } from 'lucide-react';
import { adminAPI, ActivityLog } from '@/api';

const AdminLogs = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const data = await adminAPI.getLogs({ page, limit: 50 });
        setLogs(data.logs);
        setTotalPages(data.pagination.pages);
      } catch (error) {
        console.error('Failed to fetch logs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [page]);

  const getActionIcon = (action: string) => {
    if (action.includes('POST')) return <Activity className="h-4 w-4 text-green-600" />;
    if (action.includes('PUT') || action.includes('PATCH')) return <Activity className="h-4 w-4 text-blue-600" />;
    if (action.includes('DELETE')) return <Activity className="h-4 w-4 text-red-600" />;
    return <Activity className="h-4 w-4 text-gray-600" />;
  };

  const getActionColor = (action: string) => {
    if (action.includes('POST')) return 'text-green-600';
    if (action.includes('PUT') || action.includes('PATCH')) return 'text-blue-600';
    if (action.includes('DELETE')) return 'text-red-600';
    return 'text-gray-600';
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
          <h1 className="text-2xl font-bold text-gray-900">Admin Logs</h1>
          <p className="mt-1 text-sm text-gray-600">
            Monitor system activity and user actions
          </p>
        </div>
        
        <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </button>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {logs.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No logs</h3>
              <p className="mt-1 text-sm text-gray-500">
                No activity logs found.
              </p>
            </div>
          ) : (
            logs.map((log) => (
              <li key={log.id}>
                <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3">
                        {getActionIcon(log.action)}
                        <div>
                          <h3 className={`text-sm font-medium ${getActionColor(log.action)}`}>
                            {log.action}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {log.entity} {log.entityId && `(${log.entityId.substring(0, 8)}...)`}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-2 flex items-center text-sm text-gray-500 space-x-4">
                        {log.user && (
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-1" />
                            <span>{log.user.name} ({log.user.email})</span>
                          </div>
                        )}
                        
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>{new Date(log.createdAt).toLocaleString()}</span>
                        </div>
                        
                        {log.ipAddress && (
                          <span className="text-xs text-gray-400">
                            IP: {log.ipAddress}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Page {page} of {totalPages}
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <button
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
              className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLogs;