import React, { useEffect, useState } from 'react';
import { Receipt, Calendar, Filter, Download, Eye } from 'lucide-react';
import { expensesAPI, eventsAPI, categoriesAPI, Event, Expense, BudgetCategory } from '@/api';
import { useApi } from '@/hooks/useApi';

const AdminExpenses = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<BudgetCategory[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [filters, setFilters] = useState({
    eventId: '',
    categoryId: '',
    dateFrom: '',
    dateTo: ''
  });

  const { execute: fetchEvents } = useApi(eventsAPI.getAll, {
    showSuccessToast: false,
    showErrorToast: true,
    errorMessage: 'Failed to fetch events'
  });

  const { execute: fetchExpenses } = useApi(expensesAPI.getByEventId, {
    showSuccessToast: false,
    showErrorToast: true,
    errorMessage: 'Failed to fetch expenses'
  });

  const { execute: fetchCategories } = useApi(categoriesAPI.getAll, {
    showSuccessToast: false,
    showErrorToast: true,
    errorMessage: 'Failed to fetch categories'
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedEvent) {
      loadExpenses(selectedEvent.id);
    }
  }, [selectedEvent]);

  const loadData = async () => {
    const [eventsData, categoriesData] = await Promise.all([
      fetchEvents(),
      fetchCategories()
    ]);

    if (eventsData) setEvents(eventsData);
    if (categoriesData) setCategories(categoriesData);
  };

  const loadExpenses = async (eventId: string) => {
    const data = await fetchExpenses(eventId);
    if (data) {
      setExpenses(data);
    }
  };

  const handleEventSelect = (event: Event) => {
    setSelectedEvent(event);
    setFilters(prev => ({ ...prev, eventId: event.id }));
  };

  const downloadTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "EventTitle,CategoryName,ItemName,Quantity,UnitPrice,Amount,Remarks\n" +
      "Sample Event,Equipment,Microphone,2,500,1000,Wireless microphones\n" +
      "Tech Fest,Facilities,Projector,1,2000,2000,HD projector for presentations";
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "expenses_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredExpenses = expenses.filter(expense => {
    if (filters.categoryId && expense.categoryId !== filters.categoryId) return false;
    if (filters.dateFrom && new Date(expense.createdAt) < new Date(filters.dateFrom)) return false;
    if (filters.dateTo && new Date(expense.createdAt) > new Date(filters.dateTo)) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Expense Management</h1>
          <p className="mt-1 text-sm text-gray-600">
            View and manage all event expenses
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
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                          event.status === 'APPROVED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {event.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Expenses List */}
        <div className="lg:col-span-2">
          {selectedEvent ? (
            <div className="space-y-6">
              {/* Event Info */}
              <div className="bg-white shadow rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">{selectedEvent.title}</h3>
                  <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                    selectedEvent.status === 'APPROVED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {selectedEvent.status}
                  </span>
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

              {/* Filters */}
              <div className="bg-white shadow rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <Filter className="h-5 w-5 text-gray-400 mr-2" />
                  <h3 className="text-lg font-medium text-gray-900">Filters</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Category</label>
                    <select
                      value={filters.categoryId}
                      onChange={(e) => setFilters(prev => ({ ...prev, categoryId: e.target.value }))}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <option value="">All Categories</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                      ))}
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

              {/* Expenses Table */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">Expenses</h3>
                    <span className="text-sm text-gray-500">{filteredExpenses.length} items</span>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Item
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Quantity
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Unit Price
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Added By
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredExpenses.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-6 py-12 text-center">
                            <Receipt className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No expenses</h3>
                            <p className="mt-1 text-sm text-gray-500">
                              No expenses found for this event
                            </p>
                          </td>
                        </tr>
                      ) : (
                        filteredExpenses.map((expense) => (
                          <tr key={expense.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{expense.itemName}</div>
                                {expense.remarks && (
                                  <div className="text-sm text-gray-500">{expense.remarks}</div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {expense.category.name}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {expense.quantity}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              ₹{expense.unitPrice.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              ₹{expense.amount.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {expense.addedBy.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {new Date(expense.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white shadow rounded-lg p-12 text-center">
              <Receipt className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Select an event</h3>
              <p className="mt-1 text-sm text-gray-500">
                Choose an event from the list to view its expenses
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminExpenses;