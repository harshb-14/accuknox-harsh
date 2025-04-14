import React from 'react';
import { X, AlertTriangle, AlertOctagon, Activity } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ImageDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  image: {
    id: string;
    name: string;
    registry_url: string | null;
    critical_vulnerabilities: number;
    high_vulnerabilities: number;
    medium_vulnerabilities: number;
    status: string;
    last_scan: string | null;
    scan_history: Array<{
      scan_started_at: string;
      scan_completed_at: string | null;
      vulnerabilities_found: Record<string, any>;
    }>;
  };
}

export function ImageDetailsModal({ isOpen, onClose, image }: ImageDetailsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-xl font-semibold mb-4">Image Details</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Image Name</h3>
              <p className="mt-1 text-lg font-medium">{image.name}</p>
            </div>

            {image.registry_url && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Registry URL</h3>
                <p className="mt-1">{image.registry_url}</p>
              </div>
            )}

            <div>
              <h3 className="text-sm font-medium text-gray-500">Status</h3>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${
                  image.status === 'scanning'
                    ? 'bg-blue-100 text-blue-800'
                    : image.status === 'complete'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {image.status}
              </span>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Last Scan</h3>
              <p className="mt-1">
                {image.last_scan
                  ? formatDistanceToNow(new Date(image.last_scan), { addSuffix: true })
                  : 'Never'}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-500">Vulnerabilities</h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <AlertOctagon className="h-5 w-5 text-red-500 mr-2" />
                  <span className="font-medium text-red-700">Critical</span>
                </div>
                <p className="mt-1 text-2xl font-semibold text-red-900">
                  {image.critical_vulnerabilities}
                </p>
              </div>

              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-orange-500 mr-2" />
                  <span className="font-medium text-orange-700">High</span>
                </div>
                <p className="mt-1 text-2xl font-semibold text-orange-900">
                  {image.high_vulnerabilities}
                </p>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <Activity className="h-5 w-5 text-yellow-500 mr-2" />
                  <span className="font-medium text-yellow-700">Medium</span>
                </div>
                <p className="mt-1 text-2xl font-semibold text-yellow-900">
                  {image.medium_vulnerabilities}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-medium mb-4">Scan History</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Started
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Completed
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Findings
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {image.scan_history?.map((scan, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDistanceToNow(new Date(scan.scan_started_at), { addSuffix: true })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {scan.scan_completed_at
                        ? formatDistanceToNow(new Date(scan.scan_completed_at), { addSuffix: true })
                        : 'In Progress'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {Object.keys(scan.vulnerabilities_found || {}).length
                        ? JSON.stringify(scan.vulnerabilities_found)
                        : 'No findings'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}