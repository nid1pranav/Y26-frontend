import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Calendar, 
  DollarSign, 
  Receipt, 
  Package, 
  Users, 
  Settings, 
  FileText,
  BarChart3,
  Shield,
  Building,
  User,
  Bell,
  MapPin
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const Sidebar = () => {
  const { user } = useAuth();

  const getMenuItems = () => {
    const baseItems = [
      { icon: Home, label: 'Dashboard', path: '/' },
    ];

    if (user?.role === 'ADMIN') {
      return [
        ...baseItems,
        { icon: Users, label: 'Users', path: '/admin/users' },
        { icon: Calendar, label: 'Events', path: '/admin/events' },
        { icon: Calendar, label: 'Workshops', path: '/admin/workshops' },
        { icon: DollarSign, label: 'Budgets', path: '/admin/budgets' },
        { icon: Receipt, label: 'Expenses', path: '/admin/expenses' },
        { icon: Package, label: 'Product Catalog', path: '/admin/products' },
        { icon: Settings, label: 'Budget Categories', path: '/admin/categories' },
        { icon: MapPin, label: 'Venues', path: '/admin/venues' },
        { icon: FileText, label: 'Reports', path: '/admin/reports' },
        { icon: Bell, label: 'Notifications', path: '/admin/notifications' },
        { icon: Shield, label: 'Admin Logs', path: '/admin/logs' },
        { icon: User, label: 'Profile', path: '/profile' },
      ];
    }

    if (user?.role === 'FINANCE_TEAM') {
      return [
        ...baseItems,
        { icon: Calendar, label: 'Events/Workshops', path: '/finance/events' },
        { icon: DollarSign, label: 'Budget Review', path: '/finance/budgets' },
        { icon: Receipt, label: 'Expenses', path: '/finance/expenses' },
        { icon: Package, label: 'Product Catalog', path: '/finance/products' },
        { icon: Settings, label: 'Budget Categories', path: '/finance/categories' },
        { icon: FileText, label: 'Reports', path: '/finance/reports' },
        { icon: Bell, label: 'Notifications', path: '/notifications' },
        { icon: User, label: 'Profile', path: '/profile' },
      ];
    }

    if (user?.role === 'EVENT_TEAM_LEAD') {
      return [
        ...baseItems,
        { icon: Calendar, label: 'My Events', path: '/event-leads/events' },
        { icon: DollarSign, label: 'Budget Planning', path: '/event-leads/budgets' },
        { icon: Receipt, label: 'Expense Tracking', path: '/event-leads/expenses' },
        { icon: Bell, label: 'Notifications', path: '/notifications' },
        { icon: User, label: 'Profile', path: '/profile' },
      ];
    }

    if (user?.role === 'WORKSHOP_TEAM_LEAD') {
      return [
        ...baseItems,
        { icon: Calendar, label: 'My Workshops', path: '/workshop-leads/workshops' },
        { icon: DollarSign, label: 'Budget Planning', path: '/workshop-leads/budgets' },
        { icon: Receipt, label: 'Expense Tracking', path: '/workshop-leads/expenses' },
        { icon: Bell, label: 'Notifications', path: '/notifications' },
        { icon: User, label: 'Profile', path: '/profile' },
      ];
    }

    if (user?.role === 'FACILITIES_TEAM') {
      return [
        ...baseItems,
        { icon: Calendar, label: 'Approved Events', path: '/facilities/events' },
        { icon: Receipt, label: 'Add Expenses', path: '/facilities/expenses' },
        { icon: Package, label: 'Product Catalog', path: '/facilities/products' },
        { icon: MapPin, label: 'Venue Management', path: '/facilities/venues' },
        { icon: Bell, label: 'Notifications', path: '/notifications' },
        { icon: User, label: 'Profile', path: '/profile' },
      ];
    }

    if (user?.role === 'EVENT_COORDINATOR' || user?.role === 'WORKSHOP_COORDINATOR') {
      return [
        ...baseItems,
        { icon: Calendar, label: 'My Events/Workshops', path: '/coordinator/events' },
        { icon: BarChart3, label: 'Expense Summary', path: '/coordinator/reports' },
        { icon: Bell, label: 'Notifications', path: '/notifications' },
        { icon: User, label: 'Profile', path: '/profile' },
      ];
    }

    return baseItems;
  };

  const menuItems = getMenuItems();

  return (
    <div className="w-64 bg-white shadow-lg min-h-screen border-r border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <Building className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Yugam Finance</h1>
            <p className="text-xs text-gray-500">Financial Management Portal</p>
          </div>
        </div>
      </div>
      
      <nav className="mt-6">
        <div className="px-3">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 mb-1 text-sm font-medium rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-500'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-gray-50">
        <div className="text-center">
          <p className="text-xs text-gray-500">Yugam 2025</p>
          <p className="text-xs text-gray-400">Kumaraguru College of Technology</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;