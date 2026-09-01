import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppContext } from '../data/store';
import { FileText, ThumbsUp, Search, Calendar, MapPin, IndianRupee } from 'lucide-react';
import { format } from 'date-fns';

export const PublicDashboard = () => {
  const { projects, proposals, addProposal, upvoteProposal } = useAppContext();
  const location = useLocation();
  const isProposeTab = location.pathname === '/propose';
  
  const [searchTerm, setSearchTerm] = useState('');
  
  // Proposal form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loc, setLoc] = useState('');

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.district.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 50); // Limit for performance

  const handleProposalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !loc) return;
    
    addProposal({ title, description, location: loc });
    setTitle('');
    setDescription('');
    setLoc('');
    alert('Proposal submitted successfully!');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200 bg-gray-50 p-6 text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
            {isProposeTab ? 'Citizen Petitions & Proposals' : 'Public Transparency Portal'}
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {isProposeTab 
              ? 'Propose new infrastructure needs directly to the government and upvote community petitions.'
              : 'View MPLADS fund allocations in your constituency and track project progress transparently.'}
          </p>
        </div>

        <div className="p-6">
          {!isProposeTab && (
            <div className="space-y-4">
              <div className="relative mb-6">
                <Search className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search by constituency, MP name, or project..." 
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProjects.map(project => (
                  <div key={project.id} className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow bg-white">
                    <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">{project.name}</h3>
                    
                    <div className="space-y-2 mb-4 text-sm text-gray-600">
                      <div className="flex items-start">
                        <MapPin className="w-4 h-4 mr-2 mt-0.5 text-gray-400" />
                        <span>{project.district}, {project.state}</span>
                      </div>
                      <div className="flex items-center">
                        <IndianRupee className="w-4 h-4 mr-2 text-gray-400" />
                        <span>Sanctioned: ₹{project.sanctionedAmount.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                        <span>Completion: {format(new Date(project.expectedCompletionDate), 'MMM yyyy')}</span>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="flex justify-between text-xs font-medium mb-1">
                        <span className="text-gray-500">Physical Progress</span>
                        <span className={project.progressPercentage < 30 ? 'text-red-600' : 'text-green-600'}>
                          {project.progressPercentage}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${project.progressPercentage < 30 ? 'bg-red-500' : 'bg-green-500'}`}
                          style={{ width: `${project.progressPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {isProposeTab && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1 border-r border-gray-200 pr-6">
                <h3 className="font-bold text-lg mb-4">Submit a Proposal</h3>
                <form onSubmit={handleProposalSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Project Title</label>
                    <input 
                      type="text" required
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                      value={title} onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location/Constituency</label>
                    <input 
                      type="text" required
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                      value={loc} onChange={(e) => setLoc(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reason / Description</label>
                    <textarea 
                      required rows={4}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                      value={description} onChange={(e) => setDescription(e.target.value)}
                    ></textarea>
                  </div>
                  <button type="submit" className="w-full bg-indigo-600 text-white font-medium py-2 rounded-md hover:bg-indigo-700 transition">
                    Submit Proposal
                  </button>
                </form>
              </div>
              
              <div className="lg:col-span-2 space-y-4">
                <h3 className="font-bold text-lg mb-4 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-indigo-600" />
                  Active Citizen Petitions
                </h3>
                
                {proposals.sort((a, b) => b.needScore - a.needScore).map(proposal => (
                  <div key={proposal.id} className="border border-gray-200 rounded-lg p-5 flex flex-col sm:flex-row gap-4 bg-white">
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-gray-900 text-lg">{proposal.title}</h4>
                        <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-2 py-1 rounded">Need Score: {proposal.needScore}/100</span>
                      </div>
                      <p className="text-sm text-gray-500 mb-3 flex items-center">
                        <MapPin className="w-3 h-3 mr-1" /> {proposal.location} • Submitted {format(new Date(proposal.dateSubmitted), 'MMM d, yyyy')}
                      </p>
                      <p className="text-gray-700 text-sm">{proposal.description}</p>
                    </div>
                    <div className="flex flex-col items-center justify-center border-t sm:border-t-0 sm:border-l border-gray-200 pt-4 sm:pt-0 sm:pl-6 min-w-[120px]">
                      <div className="text-3xl font-bold text-gray-900 mb-1">{proposal.signatures}</div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide mb-3">Signatures</div>
                      <button 
                        onClick={() => upvoteProposal(proposal.id)}
                        className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 transition text-indigo-600"
                      >
                        <ThumbsUp className="w-4 h-4 mr-2" />
                        Sign
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
