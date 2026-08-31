import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './data/store';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { ProjectDetails } from './pages/ProjectDetails';
import { Alerts } from './pages/Alerts';

import { Projects } from './pages/Projects';
import { MapView } from './pages/Map';

const Analytics = () => <div className="p-4 flex items-center justify-center h-full text-gray-500">Analytics coming soon.</div>;

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="projects" element={<Projects />} />
            <Route path="project/:id" element={<ProjectDetails />} />
            <Route path="alerts" element={<Alerts />} />
            <Route path="map" element={<MapView />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
