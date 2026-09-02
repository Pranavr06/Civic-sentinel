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
import { Petitions } from './pages/Petitions';
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

const AuthorizedRoute = ({ children, allowedRole, basePath }: { children: React.ReactNode, allowedRole: string, basePath: string }) => {
  const { isAuthenticated, role } = useAppContext();
  
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  
  // Map internal 'Public' role to 'citizen' URL for aesthetic reasons
  const roleRoute = role === 'Public' ? 'citizen' : role.toLowerCase();
  
  if (roleRoute !== allowedRole) {
    return <Navigate to={`/${roleRoute}`} replace />;
  }
  
  return <>{children}</>;
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAppContext();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, role } = useAppContext();
  if (isAuthenticated) {
    const roleRoute = role === 'Public' ? 'citizen' : role.toLowerCase();
    return <Navigate to={`/${roleRoute}`} replace />;
  }
  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Login */}
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      
      {/* Root redirect -> role-specific dashboard */}
      <Route path="/" element={<ProtectedRoute><RootRedirect /></ProtectedRoute>} />

      {/* ADMIN ROUTES */}
      <Route path="/admin" element={<AuthorizedRoute allowedRole="admin" basePath="/admin"><Layout /></AuthorizedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="projects" element={<Projects />} />
        <Route path="project/:id" element={<ProjectDetails />} />
        <Route path="alerts" element={<Alerts />} />
        <Route path="map" element={<MapView />} />
        <Route path="risk" element={<RiskCenter />} />
        <Route path="contractors" element={<Contractors />} />
        <Route path="petitions" element={<Petitions />} />
      </Route>

      {/* AUTHORITY ROUTES */}
      <Route path="/authority" element={<AuthorizedRoute allowedRole="authority" basePath="/authority"><Layout /></AuthorizedRoute>}>
        <Route index element={<AuthorityDashboard />} />
        <Route path="projects" element={<Projects />} />
        <Route path="project/:id" element={<ProjectDetails />} />
        <Route path="petitions" element={<Petitions />} />
      </Route>

      {/* CONTRACTOR ROUTES */}
      <Route path="/contractor" element={<AuthorizedRoute allowedRole="contractor" basePath="/contractor"><Layout /></AuthorizedRoute>}>
        <Route index element={<ContractorDashboard />} />
        <Route path="bills" element={<ContractorDashboard />} />
      </Route>

      {/* CITIZEN (PUBLIC) ROUTES */}
      <Route path="/citizen" element={<AuthorizedRoute allowedRole="citizen" basePath="/citizen"><Layout /></AuthorizedRoute>}>
        <Route index element={<PublicDashboard />} />
        <Route path="propose" element={<PublicDashboard />} />
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const RootRedirect = () => {
  const { role } = useAppContext();
  const roleRoute = role === 'Public' ? 'citizen' : role.toLowerCase();
  return <Navigate to={`/${roleRoute}`} replace />;
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
