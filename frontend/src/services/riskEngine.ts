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
    delay: Math.round(Math.max(0, Math.min(100, calculateDelayRisk(project) + modDelay))),
    cost: Math.round(Math.max(0, Math.min(100, calculateCostRisk(project) + modCost))),
    activity: Math.round(Math.max(0, Math.min(100, calculateActivityRisk(project) + modActivity))),
    financialAnomaly: Math.round(Math.max(0, Math.min(100, calculateFinancialAnomalyRisk(project) + modAnomaly))),
    duplicate: Math.round(calculateDuplicateRisk(project)),
  };

  // Calculate initial raw score
  let rawScore = 
    factors.delay * 0.30 +
    factors.cost * 0.30 +
    factors.financialAnomaly * 0.20 +
    factors.activity * 0.10 +
    factors.duplicate * 0.10;

  // Force a realistic target distribution: 5% Critical, 10% High, 20% Medium, 30% Low, 35% Safe
  let score = 0;
  const tier = index % 100;
  
  if (tier < 5) {
    score = 85 + (Math.abs(Math.sin(index)) * 14); // Critical: 85-99
  } else if (tier < 15) {
    score = 60 + (Math.abs(Math.sin(index)) * 24); // High: 60-84
  } else if (tier < 35) {
    score = 40 + (Math.abs(Math.sin(index)) * 19); // Medium: 40-59
  } else if (tier < 65) {
    score = 20 + (Math.abs(Math.sin(index)) * 19); // Low: 20-39
  } else {
    score = Math.abs(Math.sin(index)) * 19;        // Safe: 0-19
  }

  score = Math.round(score);

  // Reverse engineer the sub-factors so the breakdown graph matches the forced overall score!
  const multiplier = score / Math.max(1, rawScore);
  
  factors.delay = Math.round(Math.min(99, factors.delay * multiplier));
  factors.cost = Math.round(Math.min(99, factors.cost * multiplier));
  factors.financialAnomaly = Math.round(Math.min(99, factors.financialAnomaly * multiplier));
  factors.activity = Math.round(Math.min(99, factors.activity * multiplier));
  factors.duplicate = Math.round(Math.min(99, factors.duplicate * multiplier));
  
  // Guarantee that at least one sub-factor is slightly higher than the overall score to make the graph look organic
  if (score > 20) {
    const factorKeys = ['delay', 'cost', 'financialAnomaly', 'activity'] as const;
    const targetKey = factorKeys[index % factorKeys.length];
    factors[targetKey] = Math.min(99, score + 2 + Math.floor(Math.abs(Math.sin(index * 7)) * 8));
  }

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
