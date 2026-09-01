import { Project, RiskFactors, RiskCategory } from '../types';

/**
 * Calculates risk scores based on deterministic rules for the prototype.
 */
export function calculateRisk(project: Project, index: number = 0): Project {
  // Generate pseudo-random modifiers based on index to diversify the dummy data
  const modDelay = Math.sin(index * 111) * 30;
  const modCost = Math.sin(index * 222) * 30;
  const modAnomaly = Math.sin(index * 333) * 40;
  const modActivity = Math.sin(index * 444) * 50;

  const factors: RiskFactors = {
    delay: Math.max(0, Math.min(100, calculateDelayRisk(project) + modDelay)),
    cost: Math.max(0, Math.min(100, calculateCostRisk(project) + modCost)),
    activity: Math.max(0, Math.min(100, calculateActivityRisk(project) + modActivity)),
    financialAnomaly: Math.max(0, Math.min(100, calculateFinancialAnomalyRisk(project) + modAnomaly)),
    duplicate: calculateDuplicateRisk(project),
  };

  // Weighted average for overall score
  let score = 
    factors.delay * 0.3 +
    factors.cost * 0.3 +
    factors.financialAnomaly * 0.2 +
    factors.activity * 0.1 +
    factors.duplicate * 0.1;

  // Add organic variance so scores spread naturally across the spectrum instead of clustering at 60
  const pseudoRandom = Math.sin(index * 9999); // between -1 and 1
  
  // Expand the distribution using a bell-curve like spread without hard caps that create duplicates
  if (pseudoRandom > 0.8) {
    score += pseudoRandom * 25; // 20 to 25
  } else if (pseudoRandom < -0.8) {
    score -= Math.abs(pseudoRandom) * 30; // -24 to -30
  } else {
    score += pseudoRandom * 20; // -16 to +16
  }

  // Soft clamp to prevent exactly 100s
  score = Math.round(score);
  if (score >= 100) score = 99 - Math.abs(Math.sin(index * 123) * 5); // 94-99
  score = Math.max(0, Math.round(score));

  const riskCategory = getRiskCategory(score);
  
  const { evidence, recommendedAction } = generateExplainability(project, factors, riskCategory);

  return {
    ...project,
    riskScore: score,
    riskCategory,
    riskFactors: factors,
    riskEvidence: evidence,
    recommendedAction,
  };
}

function getRiskCategory(score: number): RiskCategory {
  if (score < 25) return 'Safe';
  if (score < 40) return 'Low';
  if (score < 60) return 'Medium';
  if (score < 80) return 'High';
  return 'Critical';
}

function calculateDelayRisk(project: Project): number {
  const now = new Date('2026-09-01T00:00:00Z').getTime(); // Simulated present day
  const start = new Date(project.sanctionDate).getTime();
  const end = new Date(project.expectedCompletionDate).getTime();
  
  const totalDuration = end - start;
  const elapsed = now - start;
  
  if (elapsed <= 0) return 0;
  
  const timeProgress = Math.min(1, elapsed / totalDuration);
  const workProgress = project.progressPercentage / 100;
  
  // If time elapsed is much higher than work progress -> high risk
  if (timeProgress > workProgress + 0.5) return 95;
  if (timeProgress > workProgress + 0.3) return 75;
  if (timeProgress > workProgress + 0.1) return 40;
  
  return 10;
}

function calculateCostRisk(project: Project): number {
  if (project.sanctionedAmount === 0) return 0;
  
  const spendRatio = project.expenditure / project.sanctionedAmount;
  const workProgress = project.progressPercentage / 100;
  
  // If we spent 90% money but only 20% work is done -> high risk
  if (spendRatio > workProgress + 0.6) return 98;
  if (spendRatio > workProgress + 0.4) return 80;
  if (spendRatio > workProgress + 0.2) return 50;
  
  return 15;
}

function calculateActivityRisk(project: Project): number {
  const now = new Date('2026-09-01T00:00:00Z').getTime();
  const lastUpdate = new Date(project.lastUpdateDate).getTime();
  
  const daysSinceUpdate = (now - lastUpdate) / (1000 * 60 * 60 * 24);
  
  if (daysSinceUpdate > 180) return 90;
  if (daysSinceUpdate > 90) return 60;
  if (daysSinceUpdate > 30) return 30;
  
  return 5;
}

function calculateFinancialAnomalyRisk(project: Project): number {
  // Prototype simulation: We flag projects over 50 Lakhs that are "Community Hall" or "Road" with unusually high cost per % progress
  if (project.estimatedCost > 5000000 && project.expenditure > 2000000 && project.progressPercentage < 30) {
     return 85;
  }
  return 20;
}

function calculateDuplicateRisk(project: Project): number {
  // Prototype simulation: Hardcode a specific name condition to demonstrate duplicate detection
  if (project.name.toLowerCase().includes('duplicate') || project.name.toLowerCase().includes('phase 2')) {
    return 80;
  }
  return 10;
}

function generateExplainability(project: Project, factors: RiskFactors, category: RiskCategory) {
  const evidence: string[] = [];
  
  if (factors.delay > 70) {
    evidence.push(`Actual progress (${project.progressPercentage}%) is significantly below expected trajectory based on timeline.`);
  }
  
  if (factors.cost > 70) {
    evidence.push(`Expenditure is unusually high relative to physical progress.`);
  }
  
  if (factors.activity > 70) {
    evidence.push(`No recent progress update detected in the last 6 months.`);
  }
  
  if (factors.financialAnomaly > 70) {
    evidence.push(`Project cost and expenditure pattern deviates from contextual benchmark for similar works.`);
  }
  
  if (factors.duplicate > 70) {
    evidence.push(`Similar project detected nearby or potential duplication of work.`);
  }
  
  if (evidence.length === 0) {
    evidence.push(`Project is proceeding as expected with no significant anomalies.`);
  }

  let recommendedAction = "Continue routine monitoring.";
  
  if (category === 'Critical') {
    recommendedAction = "Immediate field verification required. Suspend further payments until physical progress is verified.";
  } else if (category === 'High') {
    recommendedAction = "Verify current physical progress and expenditure records with implementing agency.";
  } else if (category === 'Medium') {
    recommendedAction = "Request status update from implementing agency.";
  }

  return { evidence, recommendedAction };
}
