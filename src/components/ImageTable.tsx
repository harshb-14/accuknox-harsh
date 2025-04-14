import React, { useState } from 'react';
import { Eye, RotateCcw, Shield, Download, Calendar, Search } from 'lucide-react';
import { useImages } from '../hooks/useImages';
import { formatDistanceToNow } from 'date-fns';
import { ImageDetailsModal } from './ImageDetailsModal';
import { ImageActionsMenu } from './ImageActionsMenu';

interface ImageTableProps {
  selectedImages: string[];
  onSelectionChange: (ids: string[]) => void;
}

export function ImageTable({ selectedImages, onSelectionChange }: ImageTableProps) {
  const [filters, setFilters] = useState({
    search: '',
    severity: 'all',
    lastScan: 'all',
    sortBy: 'updated_at',
    sortOrder: 'desc' as 'asc' | 'desc',
  });

  const [selectedImage, setSelectedImage] = useState<any>(null);
  const { images, isLoading, error, startScan, deleteImage } = useImages(filters);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      onSelectionChange(images.map(img => img.id));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectImage = (id: string) => {
    if (selectedImages.includes(id)) {
      onSelectionChange(selectedImages.filter(i => i !== id));
    } else {
      onSelectionChange([...selectedImages, id]);
    }
  };

  const handleSort = (field: string) => {
    setFilters(prev => ({
      ...prev,
      sortBy: field,
      sortOrder: prev.sortBy === field && prev.sortOrder === 'desc' ? 'asc' : 'desc',
    }));
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="text-center text-red-600">
          <p>Error loading images: {error instanceof Error ? error.message : 'Unknown error'}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Container Images</h2>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search images..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>
            <select
              className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filters.severity}
              onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
            </select>
            <select
              className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filters.lastScan}
              onChange={(e) => setFilters({ ...filters, lastScan: e.target.value })}
            >
              <option value="all">All Scans</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto relative">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedImages.length === images.length}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('name')}>
                  Image Name
                  {filters.sortBy === 'name' && (
                    <span className="ml-1">{filters.sortOrder === 'desc' ? '↓' : '↑'}</span>
                  )}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('critical_vulnerabilities')}>
                  Critical
                  {filters.sortBy === 'critical_vulnerabilities' && (
                    <span className="ml-1">{filters.sortOrder === 'desc' ? '↓' : '↑'}</span>
                  )}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('high_vulnerabilities')}>
                  High
                  {filters.sortBy === 'high_vulnerabilities' && (
                    <span className="ml-1">{filters.sortOrder === 'desc' ? '↓' : '↑'}</span>
                  )}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('medium_vulnerabilities')}>
                  Medium
                  {filters.sortBy === 'medium_vulnerabilities' && (
                    <span className="ml-1">{filters.sortOrder === 'desc' ? '↓' : '↑'}</span>
                  )}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('last_scan')}>
                  Last Scan
                  {filters.sortBy === 'last_scan' && (
                    <span className="ml-1">{filters.sortOrder === 'desc' ? '↓' : '↑'}</span>
                  )}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {images.map((image) => (
                <tr key={image.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedImages.includes(image.id)}
                      onChange={() => handleSelectImage(image.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Shield className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-900">{image.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      {image.critical_vulnerabilities}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                      {image.high_vulnerabilities}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      {image.medium_vulnerabilities}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      {image.last_scan ? formatDistanceToNow(new Date(image.last_scan), { addSuffix: true }) : 'Never'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        image.status === 'scanning'
                          ? 'bg-blue-100 text-blue-800'
                          : image.status === 'complete'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {image.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSelectedImage(image)}
                        className="text-gray-600 hover:text-gray-900 transition-colors"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => startScan.mutate(image.id)}
                        disabled={image.status === 'scanning'}
                        className="text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50"
                      >
                        <RotateCcw className="h-5 w-5" />
                      </button>
                      {/* <ImageActionsMenu
                        image={image}
                        onView={() => setSelectedImage(image)}
                        onStartScan={() => startScan.mutate(image.id)}
                        onDelete={() => deleteImage.mutate(image.id)}
                      /> */}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedImage && (
        <ImageDetailsModal
          isOpen={!!selectedImage}
          onClose={() => setSelectedImage(null)}
          image={selectedImage}
        />
      )}
    </>
  );
}