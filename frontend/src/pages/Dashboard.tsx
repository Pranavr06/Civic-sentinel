import React from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../data/store';
import { Card, Badge } from '../components/ui';
import { AlertTriangle, ShieldCheck, ShieldAlert, Activity, ArrowRight } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

export const Dashboard = () => {
  const { projects, alerts } = useAppContext();

  const total = projects.length;
  const low = projects.filter(p => p.riskCategory === 'Low').length;
  const medium = projects.filter(p => p.riskCategory === 'Medium').length;
  const high = projects.filter(p => p.riskCategory === 'High').length;
  const critical = projects.filter(p => p.riskCategory === 'Critical').length;

  const pieData = [
    { name: 'Low', value: low, color: '#10b981' },
    { name: 'Medium', value: medium, color: '#f59e0b' },
    { name: 'High', value: high, color: '#f97316' },
    { name: 'Critical', value: critical, color: '#ef4444' },
  ];

  const recentAlerts = alerts.slice(0, 5);
  const criticalProjects = projects.filter(p => p.riskCategory === 'Critical');

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="p-5 flex flex-col justify-center">
          <div className="text-gray-500 text-sm font-medium mb-1">Total Projects</div>
          <div className="text-3xl font-bold text-gray-900">{total}</div>
        </Card>
        <Card className="p-5 flex flex-col justify-center border-l-4 border-l-emerald-500">
          <div className="flex items-center text-emerald-600 text-sm font-medium mb-1">
            <ShieldCheck className="w-4 h-4 mr-1" /> Low Risk
          </div>
          <div className="text-3xl font-bold text-gray-900">{low}</div>
        </Card>
        <Card className="p-5 flex flex-col justify-center border-l-4 border-l-amber-500">
          <div className="flex items-center text-amber-600 text-sm font-medium mb-1">
            <Activity className="w-4 h-4 mr-1" /> Medium Risk
          </div>
          <div className="text-3xl font-bold text-gray-900">{medium}</div>
        </Card>
        <Card className="p-5 flex flex-col justify-center border-l-4 border-l-orange-500">
          <div className="flex items-center text-orange-600 text-sm font-medium mb-1">
            <AlertTriangle className="w-4 h-4 mr-1" /> High Risk
          </div>
          <div className="text-3xl font-bold text-gray-900">{high}</div>
        </Card>
        <Card className="p-5 flex flex-col justify-center border-l-4 border-l-rose-500 bg-rose-50/30">
          <div className="flex items-center text-rose-600 text-sm font-medium mb-1">
            <ShieldAlert className="w-4 h-4 mr-1" /> Critical Risk
          </div>
          <div className="text-3xl font-bold text-rose-700">{critical}</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Charts */}
        <Card className="p-5 col-span-1">
          <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wider">Risk Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center space-x-4 text-xs mt-2">
            {pieData.map(d => (
              <div key={d.name} className="flex items-center">
                <span className="w-3 h-3 rounded-full mr-1" style={{ backgroundColor: d.color }}></span>
                {d.name}
              </div>
            ))}
          </div>
        </Card>

        {/* High Risk Table */}
        <Card className="p-0 col-span-2 flex flex-col">
          <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Critical Projects Attention Required</h3>
            <Link to="/projects" className="text-indigo-600 text-sm font-medium hover:text-indigo-800 flex items-center">
              View All <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                <tr>
                  <th className="px-6 py-3 text-left font-medium">Project</th>
                  <th className="px-6 py-3 text-left font-medium">Location</th>
                  <th className="px-6 py-3 text-left font-medium">Score</th>
                  <th className="px-6 py-3 text-left font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {criticalProjects.map(project => (
                  <tr key={project.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{project.name}</div>
                      <div className="text-xs text-gray-500">{project.id}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {project.location}, {project.district}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="danger" className="text-sm font-bold px-2 py-1">
                        {project.riskScore}/100
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      <Link to={`/project/${project.id}`} className="text-indigo-600 hover:text-indigo-900">
                        Investigate
                      </Link>
                    </td>
                  </tr>
                ))}
                {criticalProjects.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                      No critical projects found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
