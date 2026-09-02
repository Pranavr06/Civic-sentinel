import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppContext } from '../data/store';
import { IndianRupee, Upload, Camera, FileText, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

export const ContractorDashboard = () => {
  const { projects, submitBill, uploadPhoto } = useAppContext();
  const location = useLocation();
  const isBillsTab = location.pathname.endsWith('/bills');
  
  // For demo purposes, assume we are logged in as Contractor C1
  const contractorId = 'C1';
  
  const myProjects = projects.filter(p => p.contractorId === contractorId);

  const [selectedProject, setSelectedProject] = useState(myProjects[0]?.id || '');
  const [billAmount, setBillAmount] = useState('');
  const [billDesc, setBillDesc] = useState('');
  const [showAiAnalysis, setShowAiAnalysis] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadedBillAmount, setUploadedBillAmount] = useState<number | string>(500000);
  
  const handleBillSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !billAmount || !billDesc) return;
    submitBill(selectedProject, Number(billAmount), billDesc);
    setBillAmount('');
    setBillDesc('');
    alert('Bill submitted successfully to Authority.');
  };

  const runAiAnalysis = (amount: number) => {
    setUploadedBillAmount(amount);
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setShowAiAnalysis(true);
    }, 2500); // simulate 2.5s AI scanning time
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !billAmount) return;
    runAiAnalysis(Number(billAmount));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // For demo, pretend the uploaded file had exactly ₹5,00,000 in it
      runAiAnalysis(500000);
    }
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
                Smart Bill Submission (AI Parsed)
              </h2>
              
              {!showAiAnalysis && !isAnalyzing ? (
                <div className="space-y-4">
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
                  
                  <label className="block border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 transition relative">
                    <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept=".pdf,image/*" onChange={handleFileUpload} />
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm font-medium text-gray-700 mb-1">Upload Bill (PDF or Image)</p>
                    <p className="text-xs text-gray-500">The AI will automatically extract and analyze the contents.</p>
                  </label>

                  <div className="relative flex py-5 items-center">
                      <div className="flex-grow border-t border-gray-300"></div>
                      <span className="flex-shrink-0 mx-4 text-gray-400 text-xs uppercase">Or enter manually</span>
                      <div className="flex-grow border-t border-gray-300"></div>
                  </div>

                  <form onSubmit={handleManualSubmit} className="space-y-4">
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
                      Analyze & Submit Bill
                    </button>
                  </form>
                </div>
              ) : isAnalyzing ? (
                <div className="py-12 flex flex-col items-center justify-center space-y-4">
                  <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                  <p className="text-gray-600 font-medium animate-pulse">Extracting contents & running AI Analysis...</p>
                </div>
              ) : (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="bg-slate-900 rounded-lg p-5 text-gray-300 font-mono text-sm space-y-4 shadow-inner">
                    <div className="flex items-center text-emerald-400 mb-2">
                      <CheckCircle2 className="w-4 h-4 mr-2" /> AI Document Parsing Complete
                    </div>
                    
                    <div>
                      <p className="text-white font-bold mb-1">Step 1 — AI calculates quantity</p>
                      <p>Road volume: <span className="text-white">100 × 3 × 0.15 = 45 m³</span></p>
                      <p className="text-xs text-gray-400 mt-1">AI verified 45 m³ of concrete is required.</p>
                    </div>
                    
                    <div>
                      <p className="text-white font-bold mb-1">Step 2 — AI gets the rate</p>
                      <p>Concrete rate = ₹5,000/m³</p>
                      <p>Cost: <span className="text-white">45 × 5,000 = 2,25,000</span></p>
                    </div>

                    <div>
                      <p className="text-white font-bold mb-1">Step 3 — AI adds other work</p>
                      <div className="grid grid-cols-2 gap-2 mt-2 pl-2 border-l-2 border-gray-700">
                        <span>Earthwork</span><span>₹50,000</span>
                        <span>WMM</span><span>₹75,000</span>
                        <span>Concrete</span><span>₹2,25,000</span>
                        <span>Other work</span><span>₹30,000</span>
                        <span className="text-white font-bold border-t border-gray-700 pt-2 mt-1">AI Estimate</span>
                        <span className="text-white font-bold border-t border-gray-700 pt-2 mt-1">₹3,80,000</span>
                      </div>
                    </div>
                    
                    <div className="bg-gray-800 p-4 rounded-md mt-4 border border-gray-700">
                      <p className="text-white font-bold mb-2">Step 4 — Compare with uploaded bill</p>
                      <p className="mb-1">Submitted Bill: <span className={Number(uploadedBillAmount) > 380000 ? "text-red-400 font-bold" : "text-emerald-400 font-bold"}>₹{Number(uploadedBillAmount).toLocaleString('en-IN')}</span></p>
                      <p className="mb-2">AI Expected Cost: <span className="text-emerald-400 font-bold">≈₹3,80,000</span></p>
                      <p className="text-xs">Difference: {Number(uploadedBillAmount).toLocaleString('en-IN')} - 3,80,000 = {Math.abs(Number(uploadedBillAmount) - 380000).toLocaleString('en-IN')}</p>
                      
                      {Number(uploadedBillAmount) > 380000 ? (
                        <div className="bg-amber-900/50 border border-amber-700/50 text-amber-200 p-3 rounded mt-3 flex items-start">
                          <AlertTriangle className="w-5 h-5 mr-2 shrink-0 text-amber-500" />
                          <div>
                            <p className="font-bold mb-1">Estimate is about {(((Number(uploadedBillAmount) - 380000) / 380000) * 100).toFixed(1)}% higher than the AI baseline.</p>
                            <p className="text-xs opacity-90">The system has flagged this bill for manual verification by the authority.</p>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-emerald-900/50 border border-emerald-700/50 text-emerald-200 p-3 rounded mt-3 flex items-start">
                          <CheckCircle2 className="w-5 h-5 mr-2 shrink-0 text-emerald-500" />
                          <div>
                            <p className="font-bold mb-1">Estimate aligns with AI baseline.</p>
                            <p className="text-xs opacity-90">This bill will be fast-tracked for approval.</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex space-x-3">
                    <button onClick={() => setShowAiAnalysis(false)} className="flex-1 bg-white border border-gray-300 text-gray-700 font-medium py-2 rounded-md hover:bg-gray-50 transition">
                      Cancel
                    </button>
                    <button 
                      onClick={() => {
                        submitBill(selectedProject, Number(uploadedBillAmount), billDesc || "AI Parsed Bill Submission");
                        setShowAiAnalysis(false);
                        alert('Bill submitted successfully.');
                      }} 
                      className="flex-1 bg-indigo-600 text-white font-medium py-2 rounded-md hover:bg-indigo-700 transition"
                    >
                      Confirm & Submit
                    </button>
                  </div>
                </div>
              )}
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
