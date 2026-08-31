import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Project, Alert, Role } from '../types';
import { mockProjects } from './mockData';
import { calculateRisk } from '../services/riskEngine';

interface AppState {
  role: Role;
  setRole: (role: Role) => void;
  projects: Project[];
  alerts: Alert[];
  updateAlertStatus: (alertId: string, status: Alert['status'], note?: string) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [role, setRole] = useState<Role>('Admin');
  const [projects, setProjects] = useState<Project[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    // 1. Process all projects through the Risk Engine
    const evaluatedProjects = mockProjects.map(p => calculateRisk(p));
    setProjects(evaluatedProjects);

    // 2. Generate Alerts for High and Critical projects (Simulating an Alert daemon)
    const newAlerts: Alert[] = evaluatedProjects
      .filter(p => p.riskCategory === 'Critical' || p.riskCategory === 'High')
      .map((p, index) => ({
        id: `ALT-2026-${(index + 1).toString().padStart(3, '0')}`,
        projectId: p.id,
        project: p,
        date: new Date().toISOString(),
        status: 'Open',
        assignedTo: 'Unassigned',
      }));
    setAlerts(newAlerts);
  }, []);

  const updateAlertStatus = (alertId: string, status: Alert['status'], note?: string) => {
    setAlerts(prev => prev.map(a => {
      if (a.id === alertId) {
        return { ...a, status, reviewNote: note || a.reviewNote };
      }
      return a;
    }));
  };

  return (
    <AppContext.Provider value={{ role, setRole, projects, alerts, updateAlertStatus }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppContext must be used within AppProvider");
  return context;
};
