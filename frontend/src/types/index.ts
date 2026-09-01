export type RiskCategory = 'Low' | 'Medium' | 'High' | 'Critical';

export interface Project {
  id: string;
  name: string;
  state: string;
  district: string;
  constituency: string;
  location: string;
  workCategory: string;
  sanctionDate: string; // ISO format
  expectedCompletionDate: string; // ISO format
  estimatedCost: number;
  sanctionedAmount: number;
  expenditure: number;
  progressPercentage: number;
  implementingAgency: string;
  lastUpdateDate: string; // ISO format
  lat: number;
  lng: number;

  // Computed by Risk Engine
  riskScore?: number;
  riskCategory?: RiskCategory;
  riskFactors?: RiskFactors;
  riskEvidence?: string[];
  recommendedAction?: string;

  // Added for Multi-Role Architecture
  contractorId?: string;
  predictedCost?: number; // AI predicted approx cost
  photos?: string[]; // Array of image URLs
  bills?: Bill[]; // Array of submitted bills
}

export interface RiskFactors {
  delay: number;
  cost: number;
  financialAnomaly: number;
  duplicate: number;
  activity: number;
}

export type AlertStatus = 'Open' | 'Under Review' | 'Escalated' | 'Resolved';

export interface Alert {
  id: string;
  projectId: string;
  project: Project;
  date: string;
  status: AlertStatus;
  assignedTo: string;
  reviewNote?: string;
}

export type Role = 'Admin' | 'Authority' | 'Contractor' | 'Public';

export interface Bill {
  id: string;
  amount: number;
  description: string;
  date: string;
}

export interface Contractor {
  id: string;
  name: string;
  rating: number;
  strikes: number;
  isBlocked: boolean;
}

export interface CitizenProposal {
  id: string;
  title: string;
  description: string;
  location: string;
  dateSubmitted: string;
  needScore: number;
  signatures: number;
}
