import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FolderKanban, 
  AlertTriangle, 
  Map as MapIcon, 
  BarChart3,
  ShieldAlert,
  LogOut,
  Menu,
  X,
  FileText
} from 'lucide-react';
import { useAppContext } from '../data/store';
import { Role } from '../types';

export const Layout = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { role, setRole, logout } = useAppContext();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const getNavItems = () => {
    switch(role) {
      case 'Public':
        return [
          { name: 'Public Dashboard', path: '/citizen', icon: LayoutDashboard },
          { name: 'Propose a Project', path: '/citizen/propose', icon: FolderKanban },
        ];
      case 'Contractor':
        return [
          { name: 'My Tenders', path: '/contractor', icon: FolderKanban },
          { name: 'Submit Bills', path: '/contractor/bills', icon: BarChart3 },
        ];
      case 'Authority':
        return [
          { name: 'Tender Assignment', path: '/authority', icon: FolderKanban },
          { name: 'Active Projects', path: '/authority/projects', icon: LayoutDashboard },
          { name: 'Petitions', path: '/authority/petitions', icon: FileText },
        ];
      case 'Admin':
      default:
        return [
          { name: 'Overview', path: '/admin', icon: LayoutDashboard },
          { name: 'Projects', path: '/admin/projects', icon: FolderKanban },
          { name: 'Risk Center', path: '/admin/risk', icon: ShieldAlert },
          { name: 'Map', path: '/admin/map', icon: MapIcon },
          { name: 'Alerts', path: '/admin/alerts', icon: AlertTriangle },
          { name: 'Contractors', path: '/admin/contractors', icon: BarChart3 },
          { name: 'Petitions', path: '/admin/petitions', icon: FileText },
        ];
    }
  };

  const navItems = getNavItems();

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-900 overflow-hidden">
      
      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-gray-900 bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200">
          <div className="flex items-center">
            <ShieldAlert className="w-6 h-6 text-indigo-600 mr-2" />
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-tight">Civic Sentinel</h1>
              <p className="text-[10px] text-gray-500 font-medium tracking-wide">MPLADS Risk Intelligence</p>
            </div>
          </div>
          <button 
            className="lg:hidden text-gray-500 hover:text-gray-900 focus:outline-none"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            // A link is active if it's an exact match OR if it's a parent route (e.g. /admin/projects matches /admin/projects, but not /admin)
            const isActive = pathname === item.path || pathname.startsWith(item.path + '/');
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors ${
                  isActive 
                    ? 'bg-indigo-50 text-indigo-700' 
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Icon className={`mr-3 h-5 w-5 ${isActive ? 'text-indigo-700' : 'text-gray-400'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 shrink-0">
          <div className="flex items-center">
            <button 
              className="lg:hidden mr-4 text-gray-500 hover:text-gray-900 focus:outline-none"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 capitalize truncate">
              {navItems.find(i => pathname === i.path || pathname.startsWith(i.path + '/'))?.name || 'Dashboard'}
            </h2>
          </div>
          
          <div className="flex items-center">
            <div className="flex flex-col text-right mr-2 hidden sm:flex">
              <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wide">Logged in as</span>
              <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full mt-0.5 border border-indigo-100">
                {role === 'Public' ? 'Citizen' : role}
              </span>
            </div>
            
            <button 
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="ml-2 sm:ml-4 p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Main scrollable area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-gray-50/50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
