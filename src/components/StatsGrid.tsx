import React from 'react';
import { Shield, AlertTriangle, AlertOctagon, Activity } from 'lucide-react';
import { useStats } from '../hooks/useStats';

export function StatsGrid() {
  const { data: stats, isLoading, error } = useStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <p className="text-red-500">Error loading statistics: {error instanceof Error ? error.message : 'Unknown error'}</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <p className="text-gray-500">No statistics available yet. Add some container images to get started.</p>
      </div>
    );
  }

  const statConfigs = [
    {
      key: 'totalImages',
      label: 'Total Images',
      icon: Shield,
      iconColor: 'text-blue-500',
    },
    {
      key: 'criticalIssues',
      label: 'Critical Issues',
      icon: AlertOctagon,
      iconColor: 'text-red-500',
    },
    {
      key: 'highRisk',
      label: 'High Risk',
      icon: AlertTriangle,
      iconColor: 'text-orange-500',
    },
    {
      key: 'scannedToday',
      label: 'Scanned Today',
      icon: Activity,
      iconColor: 'text-green-500',
    },
  ] as const;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statConfigs.map(({ key, label, icon: Icon, iconColor }) => {
        const stat = stats[key];
        return (
          <div key={key} className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-500">{label}</h3>
              <Icon className={`h-5 w-5 ${iconColor}`} />
            </div>
            <p className="mt-2 text-3xl font-semibold text-gray-900">{stat.value}</p>
            <div className={`mt-2 text-sm ${stat.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stat.change >= 0 ? '↑' : '↓'} {Math.abs(stat.change)}% vs {stat.period}
            </div>
          </div>
        );
      })}
    </div>
  );
}