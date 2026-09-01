import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Project, Alert, Role, Contractor, CitizenProposal, Bill } from '../types';
import { calculateRisk } from '../services/riskEngine';
import Papa from 'papaparse';

interface AppState {
  role: Role;
  setRole: (role: Role) => void;
  projects: Project[];
  alerts: Alert[];
  contractors: Contractor[];
  proposals: CitizenProposal[];
  updateAlertStatus: (alertId: string, status: Alert['status'], note?: string) => void;
  loadCsvData: (file: File) => void;
  addProposal: (proposal: Omit<CitizenProposal, 'id' | 'dateSubmitted' | 'needScore' | 'signatures'>) => void;
  upvoteProposal: (proposalId: string) => void;
  assignTender: (projectId: string, contractorId: string) => void;
  submitBill: (projectId: string, amount: number, description: string) => void;
  uploadPhoto: (projectId: string, photoUrl: string) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [role, setRole] = useState<Role>('Admin');
  const [projects, setProjects] = useState<Project[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [proposals, setProposals] = useState<CitizenProposal[]>([]);

  useEffect(() => {
    // Generate some mock contractors
    const mockContractors: Contractor[] = [
      { id: 'C1', name: 'L&T Infrastructure', rating: 4.8, strikes: 0, isBlocked: false },
      { id: 'C2', name: 'GMR Group', rating: 4.5, strikes: 1, isBlocked: false },
      { id: 'C3', name: 'Reliance Infra', rating: 4.2, strikes: 0, isBlocked: false },
      { id: 'C4', name: 'Shady Builders LLC', rating: 2.1, strikes: 3, isBlocked: true },
      { id: 'C5', name: 'Local Dev Corp', rating: 3.9, strikes: 0, isBlocked: false },
    ];
    setContractors(mockContractors);

    // Generate some mock proposals
    const mockProposals: CitizenProposal[] = [
      { id: 'P1', title: 'New Primary School', description: 'Our village needs a proper school building.', location: 'Rural District', dateSubmitted: new Date().toISOString(), needScore: 85, signatures: 142 },
      { id: 'P2', title: 'Road Repair', description: 'Main connecting road is full of potholes.', location: 'City Center', dateSubmitted: new Date().toISOString(), needScore: 60, signatures: 45 },
    ];
    setProposals(mockProposals);

    // Automatically load both LS and RS datasets on startup
    const loadDefaultDataset = async () => {
      try {
        const fetchParseCsv = (url: string) => {
          return new Promise<any[]>((resolve, reject) => {
            fetch(url)
              .then(res => {
                if (!res.ok) throw new Error(`Network response was not ok for ${url}`);
                return res.text();
              })
              .then(csvText => {
                Papa.parse(csvText, {
                  header: true,
                  skipEmptyLines: true,
                  complete: (results) => resolve(results.data),
                  error: (err: any) => reject(err)
                });
              })
              .catch(err => reject(err));
          });
        };

        const [lsData, rsData] = await Promise.all([
          fetchParseCsv('/Allocated Limit for Honble LS MPs.csv').catch(() => []),
          fetchParseCsv('/Allocated Limit for Honble RS MPs.csv').catch(() => [])
        ]);

        const combinedData = [...lsData, ...rsData];

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

        const parsedProjects: Project[] = combinedData
          .filter((row: any) => row['State'] && row['State'] !== 'Grand Total' && row['State'] !== ' ')
          .map((row: any, index: number) => {
            let allocated = Number(String(row['Allocated AMOUNT ( ₹ )']).replace(/[^0-9.-]+/g, '')) || 0;
            // The dataset has 14.7 Cr for all MPs which is their total fund. We divide by a random factor to simulate individual projects (e.g. 1/4th to 1/15th of the total fund)
            const projectFraction = 4 + (Math.abs(Math.sin(index * 777)) * 11);
            allocated = Math.floor(allocated / projectFraction);
            
            const mpName = row["Hon'ble Members of Parliaments"] || row["Hon'ble Members of Parliament"] || 'Unknown MP';
            const constituency = row['Constituency'] || `${row['State']} (Rajya Sabha - ${row['Elected/Nominated'] || 'Elected'})`;

            const pseudoRandom = (Math.sin(index * 123.456) * 10000) % 100;
            const mockProgress = Math.floor(Math.abs(pseudoRandom));
            
            // The AI predicted cost is roughly the allocated amount, but sometimes actual expenditure exceeds it
            const predictedCost = allocated;
            const mockExpenditure = (allocated * (mockProgress + 5)) / 100; 
            
            const stateName = row['State'].trim();
            const baseCoords = stateCoords[stateName] || [22.5937, 78.9629];

            let latJitterMax = 0.8;
            let lngJitterMax = 0.8; 
            
            const largeInlandStates = ['Rajasthan', 'Madhya Pradesh', 'Uttar Pradesh', 'Chhattisgarh', 'Telangana'];
            const largeCoastalStates = ['Maharashtra', 'Gujarat', 'Karnataka', 'Andhra Pradesh', 'Odisha', 'Tamil Nadu'];
            const smallStates = ['Sikkim', 'Goa', 'Tripura', 'Mizoram', 'Manipur', 'Nagaland', 'Meghalaya', 'Kerala', 'Delhi', 'Chandigarh', 'Puducherry', 'Lakshadweep', 'Andaman And Nicobar Islands'];
            
            if (largeInlandStates.includes(stateName)) {
              latJitterMax = 1.8; 
              lngJitterMax = 1.8;
            } else if (largeCoastalStates.includes(stateName)) {
              latJitterMax = 1.5;
              lngJitterMax = 0.6; 
            } else if (smallStates.includes(stateName)) {
              latJitterMax = 0.15; 
              lngJitterMax = 0.15;
            }

            const latJitter = (Math.sin(index * 987.654) * latJitterMax);
            const lngJitter = (Math.cos(index * 456.789) * lngJitterMax);

            const lat = baseCoords[0] + latJitter;
            const lng = baseCoords[1] + lngJitter;

            // Randomly assign some projects to contractors for demo purposes
            const cId = index % 5 === 0 ? mockContractors[index % mockContractors.length].id : undefined;

            return {
              id: `MPLADS-${row['State'].substring(0,2).toUpperCase()}-${index.toString().padStart(4, '0')}`,
              name: `MPLADS Fund - ${mpName}`,
              state: row['State'],
              district: constituency,
              constituency: constituency,
              location: 'Multiple Locations',
              workCategory: 'Constituency Development',
              sanctionDate: new Date('2023-04-01T00:00:00Z').toISOString(),
              expectedCompletionDate: new Date('2025-03-31T00:00:00Z').toISOString(),
              estimatedCost: allocated,
              sanctionedAmount: allocated,
              predictedCost: predictedCost,
              expenditure: Math.max(0, mockExpenditure),
              progressPercentage: Math.min(100, Math.max(0, mockProgress)),
              implementingAgency: `District Authority - ${row['State']}`,
              lastUpdateDate: new Date('2024-05-01T00:00:00Z').toISOString(),
              lat: lat,
              lng: lng,
              contractorId: cId,
              bills: [],
              photos: []
            };
        });

        const evaluatedProjects = parsedProjects.map((p, idx) => calculateRisk(p, idx));
        setProjects(evaluatedProjects);

        const newAlerts: Alert[] = evaluatedProjects
          .filter(p => p.riskCategory === 'Critical' || p.riskCategory === 'High')
          .sort((a, b) => (b.riskScore || 0) - (a.riskScore || 0))
          .slice(0, 20) 
          .map((p, index) => ({
            id: `ALT-CSV-${(index + 1).toString().padStart(3, '0')}`,
            projectId: p.id,
            project: p,
            date: new Date().toISOString(),
            status: 'Open',
            assignedTo: 'Unassigned',
          }));
        setAlerts(newAlerts);
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
    // Keeping for manual upload if needed
  };

  const addProposal = (proposalData: Omit<CitizenProposal, 'id' | 'dateSubmitted' | 'needScore' | 'signatures'>) => {
    const newProposal: CitizenProposal = {
      ...proposalData,
      id: `PROP-${Date.now()}`,
      dateSubmitted: new Date().toISOString(),
      needScore: 50,
      signatures: 1
    };
    setProposals(prev => [newProposal, ...prev]);
  };

  const upvoteProposal = (proposalId: string) => {
    setProposals(prev => prev.map(p => {
      if (p.id === proposalId) {
        return { ...p, signatures: p.signatures + 1, needScore: Math.min(100, p.needScore + 2) };
      }
      return p;
    }));
  };

  const assignTender = (projectId: string, contractorId: string) => {
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        return { ...p, contractorId };
      }
      return p;
    }));
  };

  const submitBill = (projectId: string, amount: number, description: string) => {
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        const newBill: Bill = { id: `B-${Date.now()}`, amount, description, date: new Date().toISOString() };
        const newExpenditure = p.expenditure + amount;
        
        // Re-evaluate risk with new expenditure
        const updatedProject = calculateRisk({ ...p, expenditure: newExpenditure, bills: [...(p.bills || []), newBill] });
        
        // Block contractor if they exceed predicted cost significantly multiple times
        if (updatedProject.expenditure > (updatedProject.predictedCost || 0) * 1.2) {
           setContractors(cPrev => cPrev.map(c => {
             if (c.id === updatedProject.contractorId) {
               const newStrikes = c.strikes + 1;
               return { ...c, strikes: newStrikes, isBlocked: newStrikes >= 3 };
             }
             return c;
           }));
        }

        return updatedProject;
      }
      return p;
    }));
  };

  const uploadPhoto = (projectId: string, photoUrl: string) => {
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        return { ...p, photos: [...(p.photos || []), photoUrl] };
      }
      return p;
    }));
  };

  return (
    <AppContext.Provider value={{ 
      role, setRole, projects, alerts, contractors, proposals, 
      updateAlertStatus, loadCsvData, addProposal, upvoteProposal, assignTender, submitBill, uploadPhoto 
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppContext must be used within AppProvider");
  return context;
};
