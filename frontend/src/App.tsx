import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useAppContext } from './data/store';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { ProjectDetails } from './pages/ProjectDetails';
import { Alerts } from './pages/Alerts';
import { Projects } from './pages/Projects';
import { MapView } from './pages/Map';
import { RiskCenter } from './pages/RiskCenter';
import { PublicDashboard } from './pages/PublicDashboard';
import { ContractorDashboard } from './pages/ContractorDashboard';
import { AuthorityDashboard } from './pages/AuthorityDashboard';
import { Contractors } from './pages/Contractors';
import { Login } from './pages/Login';

const Analytics = () => <div className="p-4 flex items-center justify-center h-full text-gray-500">Analytics coming soon.</div>;

// Role-based root component
const RootDashboard = () => {
  const { role } = useAppContext();
  switch(role) {
    case 'Public': return <PublicDashboard />;
    case 'Contractor': return <ContractorDashboard />;
    case 'Authority': return <AuthorityDashboard />;
    case 'Admin':
    default: return <Dashboard />;
  }
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAppContext();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAppContext();
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<RootDashboard />} />
        <Route path="projects" element={<Projects />} />
        <Route path="project/:id" element={<ProjectDetails />} />
        <Route path="alerts" element={<Alerts />} />
        <Route path="map" element={<MapView />} />
        <Route path="risk" element={<RiskCenter />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="contractors" element={<Contractors />} />
        <Route path="propose" element={<RootDashboard />} />
        <Route path="bills" element={<RootDashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
