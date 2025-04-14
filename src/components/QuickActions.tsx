import React, { useState } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import { useImages } from '../hooks/useImages';
import { AddImageModal } from './AddImageModal';

export function QuickActions() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { refreshImages } = useImages({
    search: '',
    severity: 'all',
    lastScan: 'all'
  });

  return (
    <>
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
          <div className="flex gap-4">
            <button
              onClick={() => refreshImages()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Image
            </button>
          </div>
        </div>
      </div>

      <AddImageModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </>
  );
}