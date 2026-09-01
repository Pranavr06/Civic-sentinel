import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppContext } from '../data/store';
import { IndianRupee, Upload, Camera, FileText, CheckCircle2, Clock } from 'lucide-react';

export const ContractorDashboard = () => {
  const { projects, submitBill, uploadPhoto } = useAppContext();
  const location = useLocation();
  const isBillsTab = location.pathname === '/bills';
  
  // For demo purposes, assume we are logged in as Contractor C1
  const contractorId = 'C1';
  
  const myProjects = projects.filter(p => p.contractorId === contractorId);

  const [selectedProject, setSelectedProject] = useState(myProjects[0]?.id || '');
  const [billAmount, setBillAmount] = useState('');
  const [billDesc, setBillDesc] = useState('');
  
  const handleBillSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !billAmount || !billDesc) return;
    submitBill(selectedProject, Number(billAmount), billDesc);
    setBillAmount('');
    setBillDesc('');
    alert('Bill submitted successfully to Authority.');
  };

  const handlePhotoUpload = () => {
    if (!selectedProject) return;
    // Mock image upload
    const mockImage = `https://images.unsplash.com/photo-1541888086225-ee9f39d73289?w=800&q=80`;
    uploadPhoto(selectedProject, mockImage);
    alert('Site photo uploaded and timestamped securely.');
  };

  return (
    <div className="space-y-6">
      <div className="bg-indigo-700 rounded-lg shadow-sm p-6 text-white flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold mb-1">{isBillsTab ? 'Submit Bills & Evidence' : 'Contractor Portal'}</h1>
          <p className="text-indigo-200">Welcome, L&T Infrastructure (ID: {contractorId})</p>
        </div>
        <div className="text-right">
          <p className="text-indigo-200 text-sm">Active Tenders</p>
          <p className="text-3xl font-bold">{myProjects.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: Assigned Tenders (Only visible if NOT on bills tab) */}
        {!isBillsTab && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 col-span-1 lg:col-span-2 max-w-4xl mx-auto w-full">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-gray-500" />
              My Assigned Tenders
            </h2>
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
              {myProjects.map(project => (
                <div 
                  key={project.id} 
                  onClick={() => setSelectedProject(project.id)}
                  className={`border rounded-lg p-4 cursor-pointer transition ${selectedProject === project.id ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:bg-gray-50'}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900 line-clamp-1">{project.name}</h3>
                    {selectedProject === project.id && <CheckCircle2 className="w-5 h-5 text-indigo-600" />}
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>Location: {project.district}</p>
                    <div className="flex justify-between">
                      <span>Sanctioned:</span>
                      <span className="font-medium text-gray-900">₹{project.sanctionedAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Billed so far:</span>
                      <span className="font-medium text-gray-900">₹{project.expenditure.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-gray-100">
                      <span className="text-indigo-600 font-medium">Pending Funds:</span>
                      <span className="text-indigo-700 font-bold">₹{Math.max(0, project.sanctionedAmount - project.expenditure).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
              {myProjects.length === 0 && (
                <p className="text-gray-500 italic">No tenders currently assigned to you.</p>
              )}
            </div>
          </div>
        )}

        {/* Right Column: Actions (Only visible if on bills tab) */}
        {isBillsTab && (
          <div className="space-y-6 col-span-1 lg:col-span-2 max-w-2xl mx-auto w-full">
            
            {/* Bill Submission */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <IndianRupee className="w-5 h-5 mr-2 text-gray-500" />
                Weekly Bill Submission
              </h2>
              <form onSubmit={handleBillSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Project</label>
                  <select 
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                    value={selectedProject} onChange={(e) => setSelectedProject(e.target.value)}
                  >
                    {myProjects.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bill Amount (₹)</label>
                  <input 
                    type="number" required min="1"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    value={billAmount} onChange={(e) => setBillAmount(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Materials / Labor Description</label>
                  <textarea 
                    required rows={3} placeholder="E.g. Cement, Steel, Labor wages for week 12"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    value={billDesc} onChange={(e) => setBillDesc(e.target.value)}
                  ></textarea>
                </div>
                <button type="submit" className="w-full bg-indigo-600 text-white font-medium py-2 rounded-md hover:bg-indigo-700 transition">
                  Submit Bill to Authority
                </button>
              </form>
            </div>

            {/* Photo Upload */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Camera className="w-5 h-5 mr-2 text-gray-500" />
                Site Progress Photos
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Upload geo-tagged infrastructure photos. These will be analyzed by the Civic Sentinel AI to verify physical progress against your bills.
              </p>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
                <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                <button 
                  onClick={handlePhotoUpload}
                  className="bg-white border border-gray-300 text-gray-700 font-medium py-2 px-4 rounded-md hover:bg-gray-50 transition"
                >
                  Simulate Photo Upload
                </button>
                <p className="text-xs text-gray-500 mt-2">Supports JPG, PNG with EXIF data</p>
              </div>
              
              {myProjects.find(p => p.id === selectedProject)?.photos && myProjects.find(p => p.id === selectedProject)!.photos!.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center"><Clock className="w-3 h-3 mr-1" /> Recent Uploads</p>
                  <div className="flex gap-2 overflow-x-auto">
                    {myProjects.find(p => p.id === selectedProject)!.photos!.map((url, idx) => (
                      <img key={idx} src={url} alt="Progress" className="w-20 h-20 object-cover rounded-md border border-gray-200" />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
