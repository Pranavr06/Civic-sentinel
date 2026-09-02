import React, { useState } from 'react';
import { useAppContext } from '../data/store';
import { FolderKanban, Users, CheckCircle, FileText } from 'lucide-react';
import { format } from 'date-fns';

export const AuthorityDashboard = () => {
  const { projects, contractors, assignTender, proposals } = useAppContext();
  
  // Find projects that don't have a contractor assigned yet
  const unassignedProjects = projects.filter(p => !p.contractorId).slice(0, 50); // Limit for demo
  
  const [selectedContractor, setSelectedContractor] = useState<Record<string, string>>({});

  const handleAssign = (projectId: string) => {
    const cId = selectedContractor[projectId];
    if (cId) {
      assignTender(projectId, cId);
      alert(`Tender assigned successfully.`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Authority Tender Management</h1>
        <p className="text-gray-600">Assign sanctioned MPLADS projects to verified contractors.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
            <h2 className="text-lg font-bold text-gray-900 flex items-center">
              <FolderKanban className="w-5 h-5 mr-2 text-indigo-600" />
              Pending Tender Assignments
            </h2>
            <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-3 py-1 rounded-full">
              {unassignedProjects.length} Pending
            </span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white text-gray-500 text-xs uppercase tracking-wider">
                  <th className="p-4 border-b font-medium">Project Details</th>
                  <th className="p-4 border-b font-medium">Budget</th>
                  <th className="p-4 border-b font-medium">Timeline</th>
                  <th className="p-4 border-b font-medium">Assign Contractor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {unassignedProjects.map(project => (
                  <tr key={project.id} className="hover:bg-gray-50 text-sm">
                    <td className="p-4">
                      <p className="font-bold text-gray-900 mb-1">{project.name}</p>
                      <p className="text-xs text-gray-500">{project.district}, {project.state}</p>
                    </td>
                    <td className="p-4">
                      <p className="font-medium text-gray-900">₹{project.sanctionedAmount.toLocaleString()}</p>
                      <p className="text-xs text-indigo-600 mt-1">AI Est: ₹{project.predictedCost?.toLocaleString()}</p>
                    </td>
                    <td className="p-4 text-gray-500">
                      <p>Start: {format(new Date(project.sanctionDate), 'MMM yyyy')}</p>
                      <p>End: {format(new Date(project.expectedCompletionDate), 'MMM yyyy')}</p>
                    </td>
                    <td className="p-4">
                      <div className="flex space-x-2">
                        <select 
                          className="border border-gray-300 rounded text-sm p-1.5 flex-1 focus:ring-indigo-500 focus:border-indigo-500"
                          value={selectedContractor[project.id] || ''}
                          onChange={(e) => setSelectedContractor({...selectedContractor, [project.id]: e.target.value})}
                        >
                          <option value="">Select Contractor...</option>
                          {contractors.map(c => (
                            <option key={c.id} value={c.id} disabled={c.isBlocked}>
                              {c.name} {c.isBlocked ? '(BLOCKED)' : `(★ ${c.rating})`}
                            </option>
                          ))}
                        </select>
                        <button 
                          onClick={() => handleAssign(project.id)}
                          disabled={!selectedContractor[project.id]}
                          className="bg-indigo-600 text-white px-3 py-1.5 rounded hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                        >
                          Assign
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {unassignedProjects.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-gray-500 flex flex-col items-center">
                      <CheckCircle className="w-12 h-12 text-green-400 mb-3" />
                      <p className="text-lg font-medium text-gray-900">All caught up!</p>
                      <p>There are no pending tender assignments.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Citizen Petitions Section */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
            <h2 className="text-lg font-bold text-gray-900 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-indigo-600" />
              High-Priority Citizen Petitions
            </h2>
            <span className="text-sm text-gray-500 font-medium">For Sanction Consideration</span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-white">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Petition Details</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">AI Need Score</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Signatures</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {[...proposals].sort((a, b) => b.needScore - a.needScore).slice(0, 5).map(proposal => (
                  <tr key={proposal.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div className="text-sm font-bold text-gray-900">{proposal.title}</div>
                      <div className="text-xs text-gray-500 truncate max-w-[200px]">{proposal.description}</div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500">
                      {proposal.location}
                    </td>
                    <td className="px-4 py-4">
                      <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-2 py-1 rounded">
                        {proposal.needScore}/100
                      </span>
                    </td>
                    <td className="px-4 py-4 font-bold text-gray-900">
                      {proposal.signatures}
                    </td>
                  </tr>
                ))}
                {proposals.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                      No citizen petitions currently active.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="bg-indigo-50 p-3 border-t border-indigo-100 rounded-b-lg">
            <p className="text-xs text-indigo-800 font-medium text-center">
              <span className="font-bold">Note:</span> The priority list will be displayed according to the AI analysis of the requirement of that project in that area.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
