import React, { useEffect, useState } from 'react';
import { FileText, Download, Calendar, DollarSign, TrendingUp, BarChart3, Filter } from 'lucide-react';
import { reportsAPI, eventsAPI, Event, FinancialReport, SummaryReport } from '@/api';
import { useApi } from '@/hooks/useApi';

const AdminReports = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [financialReport, setFinancialReport] = useState<FinancialReport | null>(null);
  const [summaryReports, setSummaryReports] = useState<SummaryReport[]>([]);
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    status: '',
    type: ''
  });

  const { execute: fetchEvents } = useApi(eventsAPI.getAll, {
    showSuccessToast: false,
    showErrorToast: true,
    errorMessage: 'Failed to fetch events'
  });

  const { execute: fetchFinancialReport } = useApi(reportsAPI.getEventFinancialReport, {
    showSuccessToast: false,
    showErrorToast: true,
    errorMessage: 'Failed to fetch financial report'
  });

  const { execute: fetchSummaryReport } = useApi(reportsAPI.getSummaryReport, {
    showSuccessToast: false,
    showErrorToast: true,
    errorMessage: 'Failed to fetch summary report'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [eventsData, summaryData] = await Promise.all([
      fetchEvents(),
      fetchSummaryReport()
    ]);

    if (eventsData) setEvents(eventsData);
    if (summaryData) setSummaryReports(summaryData);
  };

  const handleEventSelect = async (event: Event) => {
    setSelectedEvent(event);
    const reportData = await fetchFinancialReport(event.id);
    if (reportData) {
      setFinancialReport(reportData);
    }
  };

  const downloadEventReport = (event: Event, format: 'pdf' | 'csv') => {
    if (format === 'csv') {
      const csvContent = "data:text/csv;charset=utf-8," + 
        "Event,Category,Item,Quantity,UnitPrice,Amount,AddedBy,Date\n" +
        (financialReport?.expenses.map(expense => 
          `"${event.name}","${expense.category}","${expense.itemName}",${expense.quantity},${expense.unitPrice},${expense.amount},"${expense.addedBy}","${expense.createdAt}"`
        ).join('\n') || '');
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `${event.name}_financial_report.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const downloadSummaryReport = (format: 'pdf' | 'csv') => {
    if (format === 'csv') {
      const csvContent = "data:text/csv;charset=utf-8," + 
        "Event,Type,Status,TotalBudget,ApprovedBudget,TotalExpenses,SponsorContribution\n" +
        summaryReports.map(report => 
          `"${report.name}","${report.type}","${report.status}",${report.totalBudget},${report.totalApprovedBudget},${report.totalExpenses},${report.totalSponsorContribution}`
        ).join('\n');
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "financial_summary_report.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const filteredEvents = events.filter(event => {
    if (filters.status && event.status !== filters.status) return false;
    if (filters.type && event.type !== filters.type) return false;
    if (filters.dateFrom && event.dateTime && new Date(event.dateTime) < new Date(filters.dateFrom)) return false;
    if (filters.dateTo && event.dateTime && new Date(event.dateTime) > new Date(filters.dateTo)) return false;
    return true;
  });

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Financial Reports</h1>
          <p className="mt-1 text-sm text-gray-600">
            Generate and download comprehensive financial reports
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => downloadSummaryReport('csv')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <Download className="h-4 w-4 mr-2" />
            Download Summary
          </button>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Events</p>
              <p className="text-2xl font-semibold text-gray-900">{summaryReports.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Budget</p>
              <p className="text-2xl font-semibold text-gray-900">
                ₹{summaryReports.reduce((sum, report) => sum + report.totalApprovedBudget, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Expenses</p>
              <p className="text-2xl font-semibold text-gray-900">
                ₹{summaryReports.reduce((sum, report) => sum + report.totalExpenses, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BarChart3 className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Remaining Budget</p>
              <p className="text-2xl font-semibold text-gray-900">
                ₹{summaryReports.reduce((sum, report) => sum + (report.totalApprovedBudget - report.totalExpenses), 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Events List */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Events</h3>
            </div>

            {/* Filters */}
            <div className="p-4 border-b border-gray-200">
              <div className="space-y-3">
                <div>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full text-sm border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Status</option>
                    <option value="PENDING">Pending</option>
                    <option value="APPROVED">Approved</option>
                    <option value="REJECTED">Rejected</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>
                
                <div>
                  <select
                    value={filters.type}
                    onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full text-sm border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Types</option>
                    <option value="EVENT">Event</option>
                    <option value="WORKSHOP">Workshop</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {filteredEvents.length === 0 ? (
                <div className="p-6 text-center">
                  <FileText className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No events</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    No events match the current filters
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {filteredEvents.map((event) => (
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
                            {event.name}
                          </h4>
                          <p className="text-xs text-gray-500">{event.type}</p>
                          <p className="text-xs text-gray-500">
                            {event.dateTime ? new Date(event.dateTime).toLocaleDateString() : 'TBD'}
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

        {/* Report Details */}
        <div className="lg:col-span-2">
          {selectedEvent && financialReport ? (
            <div className="space-y-6">
              {/* Event Info */}
              <div className="bg-white shadow rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">{selectedEvent.name}</h3>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => downloadEventReport(selectedEvent, 'csv')}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      CSV
                    </button>
                    {getStatusBadge(selectedEvent.status)}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Type:</span>
                    <span className="ml-2 text-gray-900">{selectedEvent.type}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Creator:</span>
                    <span className="ml-2 text-gray-900">{financialReport.event.creator.name}</span>
                  </div>
                  {financialReport.event.coordinator && (
                    <div>
                      <span className="text-gray-500">Coordinator:</span>
                      <span className="ml-2 text-gray-900">{financialReport.event.coordinator.name}</span>
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

              {/* Financial Summary */}
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Financial Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-sm text-blue-600">Total Budget</div>
                    <div className="text-xl font-semibold text-blue-900">
                      ₹{financialReport.summary.totalBudget.toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-sm text-green-600">Approved Budget</div>
                    <div className="text-xl font-semibold text-green-900">
                      ₹{financialReport.summary.totalApprovedBudget.toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <div className="text-sm text-red-600">Total Expenses</div>
                    <div className="text-xl font-semibold text-red-900">
                      ₹{financialReport.summary.totalExpenses.toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="text-sm text-purple-600">Remaining</div>
                    <div className="text-xl font-semibold text-purple-900">
                      ₹{(financialReport.summary.totalApprovedBudget - financialReport.summary.totalExpenses).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Budget Breakdown */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Budget Breakdown</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Budget Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Approved Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Sponsor Contribution
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {financialReport.budgets.map((budget, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {budget.category}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ₹{budget.budgetAmount.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ₹{(budget.approvedAmount || budget.budgetAmount).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ₹{budget.sponsorContribution.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Expenses List */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Expenses</h3>
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
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {financialReport.expenses.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-12 text-center">
                            <FileText className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No expenses</h3>
                            <p className="mt-1 text-sm text-gray-500">
                              No expenses recorded for this event
                            </p>
                          </td>
                        </tr>
                      ) : (
                        financialReport.expenses.map((expense, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {expense.itemName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {expense.category}
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
                              {expense.addedBy}
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
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Select an event</h3>
              <p className="mt-1 text-sm text-gray-500">
                Choose an event from the list to view its financial report
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Summary Report Table */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">All Events Summary</h3>
            <button
              onClick={() => downloadSummaryReport('csv')}
              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Event
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Budget
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Approved Budget
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Expenses
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Remaining
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {summaryReports.map((report) => (
                <tr key={report.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {report.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      report.type === 'EVENT' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                    }`}>
                      {report.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(report.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₹{report.totalBudget.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₹{report.totalApprovedBudget.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₹{report.totalExpenses.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <span className={`${
                      (report.totalApprovedBudget - report.totalExpenses) >= 0 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      ₹{(report.totalApprovedBudget - report.totalExpenses).toLocaleString()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminReports;