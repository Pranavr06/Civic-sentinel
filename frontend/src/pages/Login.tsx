import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, LogIn } from 'lucide-react';
import { useAppContext } from '../data/store';
import { Role } from '../types';

export const Login = () => {
  const { login, role: currentRole } = useAppContext();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<Role>(currentRole || 'Admin');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login(selectedRole);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center shadow-lg">
            <ShieldAlert className="w-8 h-8 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 leading-tight">
          Civic Sentinel
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 font-medium">
          AI-Powered Risk Intelligence Platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-xl sm:px-10 border border-gray-100">
          
          <div className="bg-indigo-50 border-l-4 border-indigo-600 p-4 mb-6 rounded-r-md">
            <p className="text-sm text-indigo-700 font-medium">
              <strong>Note for SIH Judges:</strong> This is a prototype deployment. Please select a user persona below to explore the platform. Passwords are disabled for this demo.
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                Select Persona / Role
              </label>
              <div className="mt-1">
                <select
                  id="role"
                  name="role"
                  className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm font-medium text-gray-900 bg-gray-50"
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as Role)}
                >
                  <option value="Admin">System Admin (Full Overview)</option>
                  <option value="Authority">Govt Authority (MPLADS Monitor)</option>
                  <option value="Contractor">Contractor (Submit Bills)</option>
                  <option value="Public">Citizen (View & Propose)</option>
                </select>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                <LogIn className="w-5 h-5 mr-2" />
                Access Prototype
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
