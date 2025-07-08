import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Save, Plus } from 'lucide-react';
import { eventsAPI, usersAPI, categoriesAPI, budgetsAPI, CreateEventRequest, User, BudgetCategory } from '@/api';
import { useApi } from '@/hooks/useApi';
import { useToast } from '@/components/ui/Toast';

const CreateEvent = () => {
  const navigate = useNavigate();
  const { showSuccess } = useToast();
  
  const [formData, setFormData] = useState<CreateEventRequest>({
    title: '',
    type: 'EVENT',
    coordinatorEmail: '',
    description: '',
    dateTime: ''
  });

  const [budgets, setBudgets] = useState<{ categoryId: string; amount: number; sponsorContribution: number; remarks: string }[]>([]);
  const [coordinators, setCoordinators] = useState<User[]>([]);
  const [categories, setCategories] = useState<BudgetCategory[]>([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    description: '',
    order: 0
  });

  const { execute: createEvent, loading: creating } = useApi(eventsAPI.create, {
    showSuccessToast: false,
    showErrorToast: true,
    errorMessage: 'Failed to create event'
  });

  const { execute: createBudgets } = useApi(budgetsAPI.createOrUpdate, {
    showSuccessToast: false,
    showErrorToast: true,
    errorMessage: 'Failed to create budgets'
  });

  const { execute: fetchUsers } = useApi(usersAPI.getAll, {
    showSuccessToast: false,
    showErrorToast: true,
    errorMessage: 'Failed to fetch coordinators'
  });

  const { execute: fetchCategories } = useApi(categoriesAPI.getAll, {
    showSuccessToast: false,
    showErrorToast: true,
    errorMessage: 'Failed to fetch categories'
  });

  const { execute: createCategory, loading: creatingCategory } = useApi(categoriesAPI.create, {
    showSuccessToast: false,
    showErrorToast: true,
    errorMessage: 'Failed to create category'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [users, categoriesData] = await Promise.all([
      fetchUsers(),
      fetchCategories()
    ]);

    if (users) {
      const eventCoordinators = users.filter(user => 
        user.role === 'EVENT_COORDINATOR'
      );
      setCoordinators(eventCoordinators);
    }

    if (categoriesData) {
      setCategories(categoriesData);
      // Initialize budget entries for each category
      setBudgets(categoriesData.map(category => ({
        categoryId: category.id,
        amount: 0,
        sponsorContribution: 0,
        remarks: ''
      })));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const eventData = {
      ...formData,
      dateTime: formData.dateTime || undefined,
      coordinatorEmail: formData.coordinatorEmail || undefined
    };

    const result = await createEvent(eventData);
    if (result) {
      // Create budgets if any amounts are specified
      const validBudgets = budgets.filter(budget => budget.amount > 0);
      if (validBudgets.length > 0) {
        await createBudgets(result.id, { budgets: validBudgets });
      }
      
      showSuccess('Event created successfully', 'Your event has been created and is pending approval.');
      navigate('/event-leads/events');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBudgetChange = (categoryId: string, field: string, value: string) => {
    setBudgets(prev => prev.map(budget => 
      budget.categoryId === categoryId 
        ? { ...budget, [field]: field === 'remarks' ? value : parseFloat(value) || 0 }
        : budget
    ));
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = await createCategory(categoryFormData);
    if (result) {
      showSuccess('Category created successfully');
      setShowCategoryModal(false);
      setCategoryFormData({ name: '', description: '', order: 0 });
      // Refresh categories
      const categoriesData = await fetchCategories();
      if (categoriesData) {
        setCategories(categoriesData);
        // Add new category to budgets
        setBudgets(prev => [...prev, {
          categoryId: result.id,
          amount: 0,
          sponsorContribution: 0,
          remarks: ''
        }]);
      }
    }
  };

  const getTotalBudget = () => {
    return budgets.reduce((sum, budget) => sum + budget.amount, 0);
  };

  const getTotalSponsorAmount = () => {
    return budgets.reduce((sum, budget) => sum + budget.sponsorContribution, 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link
          to="/event-leads/events"
          className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Events
        </Link>
        
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create New Event</h1>
          <p className="mt-1 text-sm text-gray-600">Fill in the details and budget to create a new event</p>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg">
        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          {/* Basic Event Information */}
          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Event Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Event Title *
                </label>
                <input
                  type="text"
                  name="title"
                  id="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter event title"
                />
              </div>

              <div>
                <label htmlFor="coordinatorEmail" className="block text-sm font-medium text-gray-700">
                  Coordinator Email
                </label>
                <select
                  name="coordinatorEmail"
                  id="coordinatorEmail"
                  value={formData.coordinatorEmail}
                  onChange={handleChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">Select a coordinator</option>
                  {coordinators.map((coordinator) => (
                    <option key={coordinator.id} value={coordinator.email}>
                      {coordinator.name} ({coordinator.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="dateTime" className="block text-sm font-medium text-gray-700">
                  Date & Time
                </label>
                <input
                  type="datetime-local"
                  name="dateTime"
                  id="dateTime"
                  value={formData.dateTime}
                  onChange={handleChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  name="description"
                  id="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter event description"
                />
              </div>
            </div>
          </div>

          {/* Budget Planning */}
          <div className="border-b border-gray-200 pb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Budget Planning</h3>
              <button
                type="button"
                onClick={() => setShowCategoryModal(true)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </button>
            </div>
            <div className="space-y-4">
              {categories.map((category) => {
                const budget = budgets.find(b => b.categoryId === category.id);
                return (
                  <div key={category.id} className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">{category.name}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Requested Amount (₹)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={budget?.amount || 0}
                          onChange={(e) => handleBudgetChange(category.id, 'amount', e.target.value)}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Sponsor Contribution (₹)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={budget?.sponsorContribution || 0}
                          onChange={(e) => handleBudgetChange(category.id, 'sponsorContribution', e.target.value)}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Remarks
                        </label>
                        <input
                          type="text"
                          value={budget?.remarks || ''}
                          onChange={(e) => handleBudgetChange(category.id, 'remarks', e.target.value)}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          placeholder="Optional remarks"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Budget Summary */}
            <div className="mt-6 bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Budget Summary</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-blue-700">Total Requested:</span>
                  <span className="font-semibold text-blue-900 ml-2">₹{getTotalBudget().toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-blue-700">Total Sponsor:</span>
                  <span className="font-semibold text-blue-900 ml-2">₹{getTotalSponsorAmount().toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-blue-700">Net Request:</span>
                  <span className="font-semibold text-blue-900 ml-2">₹{(getTotalBudget() - getTotalSponsorAmount()).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Link
              to="/event-leads/events"
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={creating}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {creating ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Create Event
            </button>
          </div>
        </form>
      </div>

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Category</h3>
              
              <form onSubmit={handleCategorySubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name *</label>
                  <input
                    type="text"
                    required
                    value={categoryFormData.name}
                    onChange={(e) => setCategoryFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Enter category name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={categoryFormData.description}
                    onChange={(e) => setCategoryFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    rows={3}
                    placeholder="Enter category description"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Display Order</label>
                  <input
                    type="number"
                    min="0"
                    value={categoryFormData.order}
                    onChange={(e) => setCategoryFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Enter display order"
                  />
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCategoryModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creatingCategory}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {creatingCategory ? 'Creating...' : 'Create Category'}
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

export default CreateEvent;