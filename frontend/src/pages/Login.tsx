import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, LogIn, ArrowRight, ShieldCheck, Activity, BrainCircuit } from 'lucide-react';
import { useAppContext } from '../data/store';
import { Role } from '../types';

export const Login = () => {
  const { login, role: currentRole } = useAppContext();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<Role>('Admin');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login(selectedRole);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans">
      
      {/* Left side: Premium Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-indigo-900 relative overflow-hidden flex-col justify-between p-12">
        {/* Abstract background graphics */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
        <div className="absolute top-1/4 -right-24 w-96 h-96 bg-fuchsia-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-24 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-4000"></div>

        <div className="relative z-10">
          <div className="flex items-center text-white mb-12">
            <ShieldAlert className="w-10 h-10 mr-3 text-indigo-400" />
            <span className="text-2xl font-bold tracking-tight">Civic Sentinel</span>
          </div>
          
          <h1 className="text-5xl font-extrabold text-white leading-tight mb-6">
            AI-Powered Risk Intelligence for Public Infrastructure
          </h1>
          <p className="text-lg text-indigo-200 max-w-xl leading-relaxed">
            Protecting public funds, accelerating development, and ensuring total transparency through autonomous monitoring and predictive analytics.
          </p>
        </div>

        <div className="relative z-10 space-y-6">
          <div className="flex items-center text-indigo-100">
            <div className="w-12 h-12 rounded-lg bg-indigo-800/50 border border-indigo-700 flex items-center justify-center mr-4 backdrop-blur-sm">
              <BrainCircuit className="w-6 h-6 text-indigo-300" />
            </div>
            <div>
              <h3 className="font-bold text-white">Predictive AI Engine</h3>
              <p className="text-sm text-indigo-300">Identifies delays before they happen</p>
            </div>
          </div>
          <div className="flex items-center text-indigo-100">
            <div className="w-12 h-12 rounded-lg bg-indigo-800/50 border border-indigo-700 flex items-center justify-center mr-4 backdrop-blur-sm">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-bold text-white">Automated Compliance</h3>
              <p className="text-sm text-indigo-300">Stops financial anomalies instantly</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side: Login Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24 bg-white relative">
        <div className="mx-auto w-full max-w-md">
          
          {/* Mobile logo (hidden on large screens) */}
          <div className="flex items-center text-indigo-900 mb-8 lg:hidden justify-center">
            <ShieldAlert className="w-10 h-10 mr-3 text-indigo-600" />
            <span className="text-3xl font-extrabold tracking-tight">Civic Sentinel</span>
          </div>

          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Welcome to the Prototype</h2>
            <p className="text-gray-500">Smart India Hackathon 2026</p>
          </div>
          
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 p-5 mb-8 rounded-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 opacity-10">
              <Activity className="w-16 h-16" />
            </div>
            <h3 className="text-sm font-bold text-indigo-900 mb-1 flex items-center">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
              Live Demo Environment
            </h3>
            <p className="text-sm text-indigo-700 leading-relaxed">
              Passwords are disabled for the judging process. Please select a user persona below to explore the platform's capabilities from different perspectives.
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label htmlFor="role" className="block text-sm font-bold text-gray-700 mb-2">
                Select Access Role
              </label>
              <div className="relative">
                <select
                  id="role"
                  name="role"
                  className="appearance-none block w-full px-4 py-4 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent sm:text-sm font-semibold text-gray-900 bg-white hover:border-gray-400 transition-colors cursor-pointer transition-shadow"
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as Role)}
                >
                  <option value="Admin">System Administrator (Full Risk Overview)</option>
                  <option value="Authority">Govt Authority (MPLADS Monitor)</option>
                  <option value="Contractor">Contractor Portal (Submit Bills)</option>
                  <option value="Public">Citizen Portal (View & Propose)</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="group w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-xl shadow-md text-base font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 transform hover:-translate-y-0.5"
            >
              Access Platform
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
          
          <div className="mt-12 text-center text-xs text-gray-400 font-medium">
            <p>Designed for Smart India Hackathon • Civic Sentinel © 2026</p>
          </div>
        </div>
      </div>
    </div>
  );
};
