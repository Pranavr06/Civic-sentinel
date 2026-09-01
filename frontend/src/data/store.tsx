import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Project, Alert, Role } from '../types';
import { mockProjects } from './mockData';
import { calculateRisk } from '../services/riskEngine';
import Papa from 'papaparse';

interface AppState {
  role: Role;
  setRole: (role: Role) => void;
  projects: Project[];
  alerts: Alert[];
  updateAlertStatus: (alertId: string, status: Alert['status'], note?: string) => void;
  loadCsvData: (file: File) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [role, setRole] = useState<Role>('Admin');
  const [projects, setProjects] = useState<Project[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    // Automatically load the eSAKSHI MP Allocation dataset on startup
    const loadDefaultDataset = async () => {
      try {
        const response = await fetch('/Allocated Limit for Honble MPs.csv');
        if (!response.ok) throw new Error('Network response was not ok');
        const csvText = await response.text();

        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const isMpAllocation = results.meta.fields?.includes("Hon'ble Members of Parliaments");
            
            const parsedProjects: Project[] = results.data
              .filter((row: any) => row['State'] && row['State'] !== 'Grand Total' && row['State'] !== ' ')
              .map((row: any, index: number) => {
                const allocated = Number(String(row['Allocated AMOUNT ( ₹ )']).replace(/[^0-9.-]+/g, '')) || 0;
                
                // Deterministically seed progress based on the index to keep it consistent on refresh
                // This ensures the demo stays exactly the same during presentations
                const pseudoRandom = (Math.sin(index * 123.456) * 10000) % 100;
                const mockProgress = Math.floor(Math.abs(pseudoRandom));
                const mockExpenditure = (allocated * (mockProgress + 5)) / 100; // slightly higher expenditure than progress to create some risk
                
                // Base coordinates in India
                const lat = 22.5937 + (Math.sin(index) * 8);
                const lng = 78.9629 + (Math.cos(index) * 8);

                return {
                  id: `MPLADS-${row['State'].substring(0,2).toUpperCase()}-${index.toString().padStart(3, '0')}`,
                  name: `MPLADS Fund - ${row['Constituency']}`,
                  state: row['State'],
                  district: row['Constituency'],
                  constituency: row['Constituency'],
                  location: 'Multiple Locations',
                  workCategory: 'Constituency Development',
                  sanctionDate: new Date('2023-04-01T00:00:00Z').toISOString(),
                  expectedCompletionDate: new Date('2025-03-31T00:00:00Z').toISOString(),
                  estimatedCost: allocated,
                  sanctionedAmount: allocated,
                  expenditure: Math.max(0, mockExpenditure),
                  progressPercentage: Math.min(100, Math.max(0, mockProgress)),
                  implementingAgency: `District Authority - ${row['Constituency']}`,
                  lastUpdateDate: new Date('2024-05-01T00:00:00Z').toISOString(), // Old update date to trigger some activity risk
                  lat: lat,
                  lng: lng,
                };
            });

            // Run through risk engine
            const evaluatedProjects = parsedProjects.map(p => calculateRisk(p));
            setProjects(evaluatedProjects);

            // Regenerate alerts
            const newAlerts: Alert[] = evaluatedProjects
              .filter(p => p.riskCategory === 'Critical' || p.riskCategory === 'High')
              .slice(0, 15) // Only keep top 15 alerts so the inbox isn't overwhelming
              .map((p, index) => ({
                id: `ALT-CSV-${(index + 1).toString().padStart(3, '0')}`,
                projectId: p.id,
                project: p,
                date: new Date().toISOString(),
                status: 'Open',
                assignedTo: 'Unassigned',
              }));
            setAlerts(newAlerts);
          }
        });
      } catch (error) {
        console.error("Failed to load default dataset:", error);
      }
    };

    loadDefaultDataset();
  }, []);

  const updateAlertStatus = (alertId: string, status: Alert['status'], note?: string) => {
    setAlerts(prev => prev.map(a => {
      if (a.id === alertId) {
        return { ...a, status, reviewNote: note || a.reviewNote };
      }
      return a;
    }));
  };

  const loadCsvData = (file: File) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        // Check if this is the MP Allocation dataset format
        const isMpAllocation = results.meta.fields?.includes("Hon'ble Members of Parliaments");

        const parsedProjects: Project[] = results.data
          .filter((row: any) => row['State'] && row['State'] !== 'Grand Total' && row['State'] !== ' ')
          .map((row: any, index: number) => {
          if (isMpAllocation) {
            // Adapt the MP-level dataset into project-level data for the prototype
            const allocated = Number(String(row['Allocated AMOUNT ( ₹ )']).replace(/[^0-9.-]+/g, '')) || 0;
            // Generate some realistic mock progress for the demo
            const mockProgress = Math.floor(Math.random() * 100);
            const mockExpenditure = (allocated * (mockProgress + (Math.random() * 20 - 10))) / 100;

            return {
              id: `MPLADS-${row['State'].substring(0,2).toUpperCase()}-${index}`,
              name: `MPLADS Fund - ${row['Constituency']}`,
              state: row['State'],
              district: row['Constituency'], // Fallback to constituency
              constituency: row['Constituency'],
              location: 'Multiple Locations',
              workCategory: 'Constituency Development',
              sanctionDate: new Date('2023-04-01T00:00:00Z').toISOString(),
              expectedCompletionDate: new Date('2025-03-31T00:00:00Z').toISOString(),
              estimatedCost: allocated,
              sanctionedAmount: allocated,
              expenditure: Math.max(0, mockExpenditure),
              progressPercentage: Math.min(100, Math.max(0, mockProgress)),
              implementingAgency: `District Authority - ${row['Constituency']}`,
              lastUpdateDate: new Date().toISOString(),
              lat: 20.5937 + (Math.random() * 10 - 5), // Rough India bounding box randomization
              lng: 78.9629 + (Math.random() * 10 - 5),
            };
          }

          // Fallback to the original standard template
          return {
            id: row['Project ID'] || `CSV-${Math.random().toString(36).substr(2, 9)}`,
            name: row['Project Name'] || 'Unknown Project',
            state: row['State'] || 'Unknown',
            district: row['District'] || 'Unknown',
            constituency: row['Constituency'] || 'Unknown',
            location: row['Location'] || 'Unknown',
            workCategory: row['Work Category'] || 'Unknown',
            sanctionDate: row['Sanction Date'] ? new Date(row['Sanction Date']).toISOString() : new Date().toISOString(),
            expectedCompletionDate: row['Expected Completion Date'] ? new Date(row['Expected Completion Date']).toISOString() : new Date().toISOString(),
            estimatedCost: Number(row['Estimated Cost']) || 0,
            sanctionedAmount: Number(row['Sanctioned Amount']) || 0,
            expenditure: Number(row['Expenditure']) || 0,
            progressPercentage: Number(row['Progress Percentage']) || 0,
            implementingAgency: row['Implementing Agency'] || 'Unknown',
            lastUpdateDate: row['Last Update Date'] ? new Date(row['Last Update Date']).toISOString() : new Date().toISOString(),
            lat: Number(row['Latitude']) || 20.5937,
            lng: Number(row['Longitude']) || 78.9629,
          };
        });

        // Run through risk engine
        const evaluatedProjects = parsedProjects.map(p => calculateRisk(p));
        setProjects(evaluatedProjects);

        // Regenerate alerts
        const newAlerts: Alert[] = evaluatedProjects
          .filter(p => p.riskCategory === 'Critical' || p.riskCategory === 'High')
          .map((p, index) => ({
            id: `ALT-CSV-${(index + 1).toString().padStart(3, '0')}`,
            projectId: p.id,
            project: p,
            date: new Date().toISOString(),
            status: 'Open',
            assignedTo: 'Unassigned',
          }));
        setAlerts(newAlerts);
      }
    });
  };

  return (
    <AppContext.Provider value={{ role, setRole, projects, alerts, updateAlertStatus, loadCsvData }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppContext must be used within AppProvider");
  return context;
};
