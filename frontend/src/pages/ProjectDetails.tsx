import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppContext } from '../data/store';
import { Card, Badge } from '../components/ui';
import { ArrowLeft, AlertTriangle, Info, MapPin, Calendar, IndianRupee, Activity, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { RiskCategory } from '../types';

export const ProjectDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { projects } = useAppContext();
  const project = projects.find(p => p.id === id);

  if (!project) {
    return <div>Project not found</div>;
  }

  const getBadgeVariant = (category?: RiskCategory) => {
    switch(category) {
      case 'Critical': return 'danger';
      case 'High': return 'warning';
      case 'Medium': return 'warning'; // or default
      case 'Low': return 'success';
      default: return 'default';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-rose-600';
    if (score >= 60) return 'text-orange-500';
    if (score >= 40) return 'text-amber-500';
    return 'text-emerald-600';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      <div>
        <Link to="/projects" className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center mb-4">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Projects
        </Link>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
            <p className="text-gray-500 text-sm mt-1">{project.id} | {project.implementingAgency}</p>
          </div>
          <Badge variant={getBadgeVariant(project.riskCategory)} className="text-sm px-3 py-1 uppercase tracking-wider font-bold shadow-sm">
            {project.riskCategory} RISK
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="md:col-span-2 space-y-6">
          {/* Explainable AI Section */}
          <Card className={`p-6 border-l-4 ${project.riskCategory === 'Critical' ? 'border-l-rose-500 bg-rose-50/20' : project.riskCategory === 'High' ? 'border-l-orange-500 bg-orange-50/20' : 'border-l-gray-300'}`}>
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <AlertTriangle className={`w-5 h-5 mr-2 ${getScoreColor(project.riskScore || 0)}`} />
              Why is this project flagged?
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">Evidence / Risk Signals</h3>
                <ul className="list-disc pl-5 space-y-2 text-sm text-gray-800">
                  {project.riskEvidence?.map((evidence, idx) => (
                    <li key={idx}>{evidence}</li>
                  ))}
                </ul>
              </div>
              
              <div className="pt-4 border-t border-gray-200/50">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">Recommended Action</h3>
                <p className="text-sm font-medium text-gray-900 bg-white p-3 rounded border border-gray-200">
                  {project.recommendedAction}
                </p>
              </div>

              <div className="pt-4 flex justify-end">
                <Link to="/alerts" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium shadow-sm transition-colors">
                  Take Action in Alert Center
                </Link>
              </div>
            </div>
          </Card>

          {/* Project Details */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Project Overview</h2>
            <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
              <div>
                <span className="text-gray-500 flex items-center mb-1"><MapPin className="w-4 h-4 mr-1" /> Location</span>
                <span className="font-medium">{project.location}, {project.district}, {project.state}</span>
              </div>
              <div>
                <span className="text-gray-500 flex items-center mb-1"><FileText className="w-4 h-4 mr-1" /> Category</span>
                <span className="font-medium">{project.workCategory}</span>
              </div>
              <div>
                <span className="text-gray-500 flex items-center mb-1"><Calendar className="w-4 h-4 mr-1" /> Timeline</span>
                <span className="font-medium">
                  {format(new Date(project.sanctionDate), 'MMM yyyy')} - {format(new Date(project.expectedCompletionDate), 'MMM yyyy')}
                </span>
              </div>
              <div>
                <span className="text-gray-500 flex items-center mb-1"><Activity className="w-4 h-4 mr-1" /> Progress</span>
                <div className="flex items-center">
                  <span className="font-medium mr-2">{project.progressPercentage}%</span>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${project.progressPercentage}%` }}></div>
                  </div>
                </div>
              </div>
              <div>
                <span className="text-gray-500 flex items-center mb-1"><IndianRupee className="w-4 h-4 mr-1" /> Financials</span>
                <div className="font-medium flex justify-between">
                  <span>Sanctioned: ₹{(project.sanctionedAmount/100000).toFixed(2)}L</span>
                </div>
                <div className="font-medium flex justify-between mt-1 text-gray-600">
                  <span>Spent: ₹{(project.expenditure/100000).toFixed(2)}L</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar - Score Breakdown */}
        <div className="space-y-6">
          <Card className="p-6 text-center">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Overall Risk Score</h3>
            <div className={`text-6xl font-bold tracking-tighter ${getScoreColor(project.riskScore || 0)}`}>
              {project.riskScore}
              <span className="text-2xl text-gray-400 font-normal">/100</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">Calculated by Civic Sentinel AI</p>
          </Card>

          <Card className="p-6">
            <h3 className="text-sm font-semibold text-gray-900 border-b pb-2 mb-4">Risk Breakdown</h3>
            <div className="space-y-4">
              <ScoreRow label="Delay Risk" score={project.riskFactors?.delay || 0} />
              <ScoreRow label="Cost Risk" score={project.riskFactors?.cost || 0} />
              <ScoreRow label="Financial Anomaly" score={project.riskFactors?.financialAnomaly || 0} />
              <ScoreRow label="Duplicate Risk" score={project.riskFactors?.duplicate || 0} />
              <ScoreRow label="Activity Risk" score={project.riskFactors?.activity || 0} />
            </div>
          </Card>

          <Card className="p-4 bg-blue-50 border-blue-200">
            <div className="flex">
              <Info className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0" />
              <p className="text-xs text-blue-800">
                <strong>Important:</strong> These risk scores are generated by the prototype risk engine. They act as early warning signals and do not constitute proof of fraud or mismanagement. Human verification is required.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

const ScoreRow = ({ label, score }: { label: string, score: number }) => {
  const getBarColor = (s: number) => {
    if (s >= 70) return 'bg-rose-500';
    if (s >= 50) return 'bg-orange-400';
    if (s >= 30) return 'bg-amber-400';
    return 'bg-emerald-400';
  };

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-600 font-medium">{label}</span>
        <span className="font-bold text-gray-900">{score}</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-1.5">
        <div className={`h-1.5 rounded-full ${getBarColor(score)}`} style={{ width: `${score}%` }}></div>
      </div>
    </div>
  );
}
