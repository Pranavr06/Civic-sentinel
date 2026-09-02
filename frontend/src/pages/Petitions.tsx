import React from 'react';
import { useAppContext } from '../data/store';
import { Card } from '../components/ui';
import { FileText, MapPin, ThumbsUp } from 'lucide-react';
import { format } from 'date-fns';

export const Petitions = () => {
  const { proposals } = useAppContext();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <FileText className="w-8 h-8 mr-3 text-indigo-600" />
            Citizen Petitions Hub
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Review and prioritize community infrastructure requests flagged by the AI risk engine.
          </p>
        </div>
      </div>

      <Card className="p-6">
        <div className="mb-4 border-b border-gray-100 pb-4">
          <h2 className="text-lg font-bold mb-2">All Active Petitions</h2>
          <div className="bg-indigo-50 p-3 rounded-md border border-indigo-100 inline-block w-full">
            <p className="text-sm text-indigo-800 font-medium">
              <span className="font-bold">AI Prioritization Note:</span> The priority list is automatically sorted and displayed according to the Civic Sentinel AI's analysis of the infrastructure requirements for that specific area based on public demand and risk factors.
            </p>
          </div>
        </div>
        <div className="space-y-4">
          {[...proposals].sort((a, b) => b.needScore - a.needScore).map(proposal => (
            <div key={proposal.id} className="border border-gray-200 rounded-lg p-5 flex flex-col sm:flex-row gap-4 bg-white">
              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-gray-900 text-lg">{proposal.title}</h4>
                  <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-2 py-1 rounded">Need Score: {proposal.needScore}/100</span>
                </div>
                <p className="text-sm text-gray-500 mb-3 flex items-center">
                  <MapPin className="w-4 h-4 mr-1 text-gray-400" /> {proposal.location} • Submitted {format(new Date(proposal.dateSubmitted), 'MMM d, yyyy')}
                </p>
                <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded-md border border-gray-100">{proposal.description}</p>
              </div>
              <div className="flex flex-col items-center justify-center border-t sm:border-t-0 sm:border-l border-gray-200 pt-4 sm:pt-0 sm:pl-6 min-w-[140px]">
                <div className="text-3xl font-bold text-gray-900 mb-1">{proposal.signatures}</div>
                <div className="text-xs text-gray-500 uppercase tracking-wide mb-3">Total Signatures</div>
                <button className="flex items-center px-4 py-2 bg-indigo-50 border border-indigo-200 rounded-md text-sm font-bold text-indigo-700 hover:bg-indigo-100 transition">
                  <ThumbsUp className="w-4 h-4 mr-2" />
                  Consider Project
                </button>
              </div>
            </div>
          ))}
          
          {proposals.length === 0 && (
            <div className="p-10 text-center border-2 border-dashed border-gray-200 rounded-lg">
              <p className="text-gray-500">No active petitions currently exist.</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
