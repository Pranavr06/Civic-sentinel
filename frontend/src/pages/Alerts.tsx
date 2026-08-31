import React, { useState } from 'react';
import { useAppContext } from '../data/store';
import { Card, Badge } from '../components/ui';
import { AlertTriangle, CheckCircle, Clock, ArrowRight, UserCheck, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';

export const Alerts = () => {
  const { alerts, role, updateAlertStatus } = useAppContext();
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);
  const [reviewNote, setReviewNote] = useState('');

  const selectedAlert = alerts.find(a => a.id === selectedAlertId);

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Open': return 'bg-rose-100 text-rose-800';
      case 'Under Review': return 'bg-amber-100 text-amber-800';
      case 'Escalated': return 'bg-purple-100 text-purple-800';
      case 'Resolved': return 'bg-emerald-100 text-emerald-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAction = (status: any) => {
    if (selectedAlertId) {
      updateAlertStatus(selectedAlertId, status, reviewNote);
      setReviewNote('');
      setSelectedAlertId(null); // Deselect after action
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Alerts List */}
      <div className="lg:col-span-1 space-y-4">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Alert Inbox</h2>
        <div className="space-y-3">
          {alerts.map(alert => (
            <div 
              key={alert.id}
              onClick={() => setSelectedAlertId(alert.id)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedAlertId === alert.id ? 'border-indigo-500 ring-1 ring-indigo-500 bg-indigo-50/30' : 'border-gray-200 bg-white hover:border-indigo-300'}`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${getStatusColor(alert.status)}`}>
                  {alert.status}
                </span>
                <span className="text-xs text-gray-500 font-medium">{format(new Date(alert.date), 'MMM dd')}</span>
              </div>
              <h3 className="text-sm font-bold text-gray-900 mb-1">{alert.project.name}</h3>
              <p className="text-xs text-gray-600 line-clamp-2">Risk Score: {alert.project.riskScore}</p>
            </div>
          ))}
          {alerts.length === 0 && <p className="text-sm text-gray-500">No alerts found.</p>}
        </div>
      </div>

      {/* Review Panel */}
      <div className="lg:col-span-2">
        {selectedAlert ? (
          <Card className="flex flex-col h-full">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">{selectedAlert.project.name}</h2>
                  <p className="text-sm text-gray-500">Alert ID: {selectedAlert.id} | Project ID: {selectedAlert.projectId}</p>
                </div>
                <Badge variant={selectedAlert.project.riskCategory === 'Critical' ? 'danger' : 'warning'} className="text-sm px-3 py-1 font-bold">
                  {selectedAlert.project.riskCategory} Risk ({selectedAlert.project.riskScore})
                </Badge>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm mt-4">
                <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3 flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-1 text-rose-500" /> Primary Risk Reasons
                </h4>
                <ul className="list-disc pl-5 space-y-1 text-sm text-gray-800">
                  {selectedAlert.project.riskEvidence?.slice(0, 3).map((ev, i) => (
                    <li key={i}>{ev}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="p-6 flex-1 flex flex-col">
              <h3 className="text-base font-bold text-gray-900 mb-4 border-b pb-2">Human Review Workflow</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Status</label>
                <span className={`inline-block text-sm font-bold px-3 py-1 rounded-full ${getStatusColor(selectedAlert.status)}`}>
                  {selectedAlert.status}
                </span>
              </div>

              {selectedAlert.reviewNote && (
                <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Previous Note</label>
                  <p className="text-sm text-gray-800">{selectedAlert.reviewNote}</p>
                </div>
              )}

              <div className="flex-1 mt-auto">
                <label className="block text-sm font-medium text-gray-700 mb-2">Add Investigation Note / Feedback</label>
                <textarea 
                  rows={4} 
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3 text-sm border bg-white"
                  placeholder="Enter details of field verification or explanation..."
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                />

                <div className="mt-6 flex flex-wrap gap-3">
                  <button onClick={() => handleAction('Under Review')} className="bg-amber-100 hover:bg-amber-200 text-amber-800 px-4 py-2 rounded-md text-sm font-bold transition-colors">
                    Mark Under Review
                  </button>
                  <button onClick={() => handleAction('Escalated')} className="bg-purple-100 hover:bg-purple-200 text-purple-800 px-4 py-2 rounded-md text-sm font-bold transition-colors">
                    Escalate to Higher Authority
                  </button>
                  <button onClick={() => handleAction('Resolved')} className="bg-emerald-100 hover:bg-emerald-200 text-emerald-800 px-4 py-2 rounded-md text-sm font-bold transition-colors ml-auto">
                    Resolve (Valid/False Positive)
                  </button>
                </div>
                
                <div className="mt-4 p-3 bg-indigo-50 text-indigo-800 rounded text-xs font-medium border border-indigo-100">
                  <span className="font-bold">Prototype Note:</span> Submitting feedback simulates the continuous learning loop, helping improve the risk engine's accuracy in future evaluations.
                </div>
              </div>
            </div>
          </Card>
        ) : (
          <div className="h-full flex items-center justify-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
            <div className="text-center">
              <MessageSquare className="mx-auto h-12 w-12 text-gray-300" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No alert selected</h3>
              <p className="mt-1 text-sm text-gray-500">Select an alert from the inbox to review and take action.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
