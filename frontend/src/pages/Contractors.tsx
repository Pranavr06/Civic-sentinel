import React from 'react';
import { useAppContext } from '../data/store';
import { Users, AlertOctagon, TrendingUp, IndianRupee } from 'lucide-react';

export const Contractors = () => {
  const { contractors, projects } = useAppContext();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Contractor Oversight & Fraud Detection</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500 font-medium mb-1">Registered Contractors</p>
          <p className="text-3xl font-bold text-gray-900">{contractors.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500 font-medium mb-1">Active Projects</p>
          <p className="text-3xl font-bold text-gray-900">{projects.filter(p => p.contractorId).length}</p>
        </div>
        <div className="bg-red-50 p-6 rounded-lg shadow-sm border border-red-200">
          <p className="text-sm text-red-600 font-medium mb-1 flex items-center"><AlertOctagon className="w-4 h-4 mr-1"/> Blocked Contractors</p>
          <p className="text-3xl font-bold text-red-700">{contractors.filter(c => c.isBlocked).length}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-bold text-gray-900 flex items-center">
            <Users className="w-5 h-5 mr-2 text-indigo-600" />
            Contractor Directory
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white text-gray-500 text-xs uppercase tracking-wider">
                <th className="p-4 border-b font-medium">Contractor Name</th>
                <th className="p-4 border-b font-medium">Status</th>
                <th className="p-4 border-b font-medium">Rating / Strikes</th>
                <th className="p-4 border-b font-medium">Projects Handled</th>
                <th className="p-4 border-b font-medium">Financial Integrity (AI vs Actual)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {contractors.map(contractor => {
                const contractorProjects = projects.filter(p => p.contractorId === contractor.id);
                
                // Calculate financial totals for this contractor
                let totalPredicted = 0;
                let totalBilled = 0;
                contractorProjects.forEach(p => {
                  totalPredicted += (p.predictedCost || p.sanctionedAmount);
                  totalBilled += p.expenditure;
                });

                const overrun = totalBilled > totalPredicted;
                const overrunPercent = totalPredicted > 0 ? ((totalBilled - totalPredicted) / totalPredicted) * 100 : 0;

                return (
                  <tr key={contractor.id} className={`hover:bg-gray-50 text-sm ${contractor.isBlocked ? 'bg-red-50/30' : ''}`}>
                    <td className="p-4">
                      <p className="font-bold text-gray-900">{contractor.name}</p>
                      <p className="text-xs text-gray-500">ID: {contractor.id}</p>
                    </td>
                    <td className="p-4">
                      {contractor.isBlocked ? (
                        <span className="bg-red-100 text-red-800 text-xs font-bold px-2 py-1 rounded flex items-center w-max">
                          <AlertOctagon className="w-3 h-3 mr-1" /> BLOCKED
                        </span>
                      ) : (
                        <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded">
                          ACTIVE
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <p className="font-medium">★ {contractor.rating.toFixed(1)}</p>
                      <p className={`text-xs mt-1 ${contractor.strikes > 0 ? 'text-orange-600 font-bold' : 'text-gray-500'}`}>
                        Strikes: {contractor.strikes}
                      </p>
                    </td>
                    <td className="p-4 font-medium text-gray-900">
                      {contractorProjects.length} Projects
                    </td>
                    <td className="p-4">
                      {contractorProjects.length > 0 ? (
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-500">AI Est:</span>
                            <span className="font-medium">₹{totalPredicted.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-500">Actual Billed:</span>
                            <span className={`font-medium ${overrun ? 'text-red-600' : 'text-green-600'}`}>
                              ₹{totalBilled.toLocaleString()}
                            </span>
                          </div>
                          {overrun && (
                            <div className="flex items-center text-xs text-red-600 font-bold mt-1">
                              <TrendingUp className="w-3 h-3 mr-1" /> {overrunPercent.toFixed(1)}% Overrun
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400 italic text-xs">No active projects</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
