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
            
            // Map of Indian states to approximate center coordinates
            const stateCoords: Record<string, [number, number]> = {
              'Andhra Pradesh': [15.9129, 79.7400],
              'Arunachal Pradesh': [28.2180, 94.7278],
              'Assam': [26.2006, 92.9376],
              'Bihar': [25.0961, 85.3131],
              'Chhattisgarh': [21.2787, 81.8661],
              'Goa': [15.2993, 74.1240],
              'Gujarat': [22.2587, 71.1924],
              'Haryana': [29.0588, 76.0856],
              'Himachal Pradesh': [31.1048, 77.1734],
              'Jharkhand': [23.6102, 85.2799],
              'Karnataka': [15.3173, 75.7139],
              'Kerala': [10.8505, 76.2711],
              'Madhya Pradesh': [22.9734, 78.6569],
              'Maharashtra': [19.7515, 75.7139],
              'Manipur': [24.6637, 93.9063],
              'Meghalaya': [25.4670, 91.3662],
              'Mizoram': [23.1645, 92.9376],
              'Nagaland': [26.1584, 94.5624],
              'Odisha': [20.9517, 85.9000],
              'Punjab': [31.1471, 75.3412],
              'Rajasthan': [27.0238, 74.2179],
              'Sikkim': [27.5330, 88.5122],
              'Tamil Nadu': [11.1271, 78.6569],
              'Telangana': [18.1124, 79.0193],
              'Tripura': [23.9408, 91.9882],
              'Uttar Pradesh': [26.8467, 80.9462],
              'Uttarakhand': [30.0668, 79.0193],
              'West Bengal': [22.9868, 87.8550],
              'Andaman And Nicobar Islands': [11.7401, 92.6586],
              'Chandigarh': [30.7333, 76.7794],
              'The Dadra And Nagar Haveli And Daman And Diu': [20.1809, 73.0169],
              'Delhi': [28.7041, 77.1025],
              'Jammu And Kashmir': [33.7782, 76.5762],
              'Ladakh': [34.1526, 77.5771],
              'Lakshadweep': [10.5667, 72.6417],
              'Puducherry': [11.9416, 79.8083]
            };

            const parsedProjects: Project[] = results.data
              .filter((row: any) => row['State'] && row['State'] !== 'Grand Total' && row['State'] !== ' ')
              .map((row: any, index: number) => {
                const allocated = Number(String(row['Allocated AMOUNT ( ₹ )']).replace(/[^0-9.-]+/g, '')) || 0;
                
                // Deterministically seed progress based on the index to keep it consistent on refresh
                const pseudoRandom = (Math.sin(index * 123.456) * 10000) % 100;
                const mockProgress = Math.floor(Math.abs(pseudoRandom));
                const mockExpenditure = (allocated * (mockProgress + 5)) / 100; 
                
                // Base coordinates from the state map, fallback to central India if not found
                const stateName = row['State'].trim();
                const baseCoords = stateCoords[stateName] || [22.5937, 78.9629];

                // Dynamic jitter: large states get a wide spread, small states get a tight spread
                let maxJitter = 1.0; 
                const largeStates = ['Rajasthan', 'Madhya Pradesh', 'Maharashtra', 'Uttar Pradesh', 'Gujarat', 'Karnataka', 'Andhra Pradesh', 'Odisha', 'Chhattisgarh', 'Tamil Nadu', 'Telangana'];
                const smallStates = ['Sikkim', 'Goa', 'Tripura', 'Mizoram', 'Manipur', 'Nagaland', 'Meghalaya', 'Kerala', 'Delhi', 'Chandigarh', 'Puducherry', 'Lakshadweep', 'Andaman And Nicobar Islands'];
                
                if (largeStates.includes(stateName)) {
                  maxJitter = 2.0; // Wide spread for big states (~200km)
                } else if (smallStates.includes(stateName)) {
                  maxJitter = 0.15; // Very tight spread for tiny states (~15km)
                } else {
                  maxJitter = 0.8; // Medium spread for border states like Bihar, WB, Punjab, Uttarakhand
                }

                // Add deterministic jitter based on index so markers in the same state don't perfectly overlap
                const latJitter = (Math.sin(index * 987.654) * maxJitter);
                const lngJitter = (Math.cos(index * 456.789) * maxJitter);

                const lat = baseCoords[0] + latJitter;
                const lng = baseCoords[1] + lngJitter;

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
