import React, { useState } from 'react';
import { useAppContext } from '../data/store';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, AlertTriangle, Activity, TrendingUp, Search } from 'lucide-react';

export const RiskCenter = () => {
  const { projects, role } = useAppContext();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  // Get only risky projects and sort by score descending
  const riskyProjects = projects
    .filter(p => (p.riskScore || 0) > 30)
    .sort((a, b) => (b.riskScore || 0) - (a.riskScore || 0))
    .filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.district.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const getPrimaryRiskFactor = (project: any) => {
    if (!project.riskFactors) return 'N/A';
    const factors = project.riskFactors as Record<string, number>;
    let maxFactor = '';
    let maxValue = -1;
    Object.entries(factors).forEach(([key, value]) => {
      if (value > maxValue) {
        maxValue = value;
        maxFactor = key;
      }
    });
    return maxValue > 50 ? maxFactor.replace(/([A-Z])/g, ' $1').trim().toUpperCase() : 'N/A';
  };

  const criticalCount = projects.filter(p => p.riskCategory === 'Critical').length;
  const highCount = projects.filter(p => p.riskCategory === 'High').length;
  const mediumCount = projects.filter(p => p.riskCategory === 'Medium').length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Risk Intelligence Center</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-red-500">
          <div className="flex items-center">
            <ShieldAlert className="w-8 h-8 text-red-500 mr-3" />
            <div>
              <p className="text-sm text-gray-500 font-medium">Critical Risk Projects</p>
              <p className="text-2xl font-bold text-gray-900">{criticalCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-orange-500">
          <div className="flex items-center">
            <AlertTriangle className="w-8 h-8 text-orange-500 mr-3" />
            <div>
              <p className="text-sm text-gray-500 font-medium">High Risk Projects</p>
              <p className="text-2xl font-bold text-gray-900">{highCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-yellow-500">
          <div className="flex items-center">
            <Activity className="w-8 h-8 text-yellow-500 mr-3" />
            <div>
              <p className="text-sm text-gray-500 font-medium">Elevated Risk (Monitor)</p>
              <p className="text-2xl font-bold text-gray-900">{mediumCount}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Active Risk Directory</h2>
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search risky projects..." 
              className="pl-10 pr-4 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-700 text-sm">
                <th className="p-4 border-b">Project Name</th>
                <th className="p-4 border-b">Location</th>
                <th className="p-4 border-b">Risk Score</th>
                <th className="p-4 border-b">Primary Risk Factor</th>
                <th className="p-4 border-b">Status</th>
                <th className="p-4 border-b">Action</th>
              </tr>
            </thead>
            <tbody>
              {riskyProjects.map((project) => (
                <tr key={project.id} className="hover:bg-gray-50 border-b last:border-0 text-sm">
                  <td className="p-4 font-medium text-gray-900">{project.name}</td>
                  <td className="p-4 text-gray-600">{project.district}, {project.state}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full font-medium ${
                      project.riskCategory === 'Critical' ? 'bg-red-100 text-red-800' : 
                      project.riskCategory === 'High' ? 'bg-orange-100 text-orange-800' : 
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {project.riskScore}/100
                    </span>
                  </td>
                  <td className="p-4 text-gray-600 font-medium">
                    {getPrimaryRiskFactor(project)}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center text-gray-500">
                      <TrendingUp className="w-4 h-4 mr-1 text-red-500" /> Active Alert
                    </div>
                  </td>
                  <td className="p-4">
                    <button 
                      onClick={() => navigate(`/${role === 'Public' ? 'citizen' : role.toLowerCase()}/project/${project.id}`)}
                      className="text-indigo-600 hover:text-indigo-900 font-medium"
                    >
                      Investigate &rarr;
                    </button>
                  </td>
                </tr>
              ))}
              {riskyProjects.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    No risky projects found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
