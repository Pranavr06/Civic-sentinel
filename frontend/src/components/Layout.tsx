import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FolderKanban, 
  AlertTriangle, 
  Map as MapIcon, 
  BarChart3,
  ShieldAlert,
  LogOut
} from 'lucide-react';
import { useAppContext } from '../data/store';
import { Role } from '../types';

export const Layout = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { role, setRole, logout } = useAppContext();

  const getNavItems = () => {
    switch(role) {
      case 'Public':
        return [
          { name: 'Public Dashboard', path: '/', icon: LayoutDashboard },
          { name: 'Propose a Project', path: '/propose', icon: FolderKanban },
        ];
      case 'Contractor':
        return [
          { name: 'My Tenders', path: '/', icon: FolderKanban },
          { name: 'Submit Bills', path: '/bills', icon: BarChart3 },
        ];
      case 'Authority':
        return [
          { name: 'Tender Assignment', path: '/', icon: FolderKanban },
          { name: 'Active Projects', path: '/projects', icon: LayoutDashboard },
        ];
      case 'Admin':
      default:
        return [
          { name: 'Overview', path: '/', icon: LayoutDashboard },
          { name: 'Projects', path: '/projects', icon: FolderKanban },
          { name: 'Risk Center', path: '/risk', icon: ShieldAlert },
          { name: 'Map', path: '/map', icon: MapIcon },
          { name: 'Alerts', path: '/alerts', icon: AlertTriangle },
          { name: 'Contractors', path: '/contractors', icon: BarChart3 },
        ];
    }
  };

  const navItems = getNavItems();

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <ShieldAlert className="w-6 h-6 text-indigo-600 mr-2" />
          <div>
            <h1 className="text-lg font-bold text-gray-900 leading-tight">Civic Sentinel</h1>
            <p className="text-xs text-gray-500 font-medium tracking-wide">MPLADS Risk Intelligence</p>
          </div>
        </div>
        
        <nav className="flex-1 py-6 px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path || (item.path !== '/' && pathname.startsWith(item.path));
            return (
              <Link
                key={item.name}
                to={item.path}
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
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
          <h2 className="text-xl font-semibold text-gray-800 capitalize">
            {navItems.find(i => pathname === i.path || (i.path !== '/' && pathname.startsWith(i.path)))?.name || 'Dashboard'}
          </h2>
          
          <div className="flex items-center space-x-4">
            <div className="flex flex-col text-right mr-2">
              <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">Logged in as</span>
              <span className="text-sm font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full mt-1 border border-indigo-100">
                {role === 'Public' ? 'Citizen' : role}
              </span>
            </div>
            
            <button 
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="ml-4 p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Main scrollable area */}
        <main className="flex-1 overflow-y-auto p-8 bg-gray-50/50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
