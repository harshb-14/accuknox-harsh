import React, { useState } from 'react';
import { Play, Trash2, Download } from 'lucide-react';
import { useImages } from '../hooks/useImages';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabase';

interface BatchActionsProps {
  selectedImages: string[];
  onClearSelection: () => void;
}

export function BatchActions({ selectedImages, onClearSelection }: BatchActionsProps) {
  const [isExporting, setIsExporting] = useState(false);
  const { startScan, deleteImage } = useImages({
    search: '',
    severity: 'all',
    lastScan: 'all',
  });

  const handleBatchScan = async () => {
    try {
      await Promise.all(
        selectedImages.map(id => startScan.mutateAsync(id))
      );
      toast.success(`Started scanning ${selectedImages.length} images`);
      onClearSelection();
    } catch (error) {
      toast.error('Failed to start batch scan');
    }
  };

  const handleBatchDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedImages.length} images?`)) {
      return;
    }

    try {
      await Promise.all(
        selectedImages.map(id => deleteImage.mutateAsync(id))
      );
      toast.success(`Deleted ${selectedImages.length} images`);
      onClearSelection();
    } catch (error) {
      toast.error('Failed to delete images');
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('container_images')
        .select(`
          name,
          registry_url,
          critical_vulnerabilities,
          high_vulnerabilities,
          medium_vulnerabilities,
          status,
          last_scan,
          scan_history(
            scan_started_at,
            scan_completed_at,
            vulnerabilities_found
          )
        `)
        .in('id', selectedImages)
        .eq('user_id', user.id);

      if (error) throw error;
      if (!data || data.length === 0) throw new Error('No data found for selected images');

      // Format data for CSV
      const csvRows = [
        ['Image Name', 'Registry URL', 'Critical', 'High', 'Medium', 'Status', 'Last Scan', 'Total Scans'],
        ...data.map(image => [
          image.name,
          image.registry_url || '',
          image.critical_vulnerabilities,
          image.high_vulnerabilities,
          image.medium_vulnerabilities,
          image.status,
          image.last_scan || 'Never',
          image.scan_history?.length || 0
        ])
      ];

      // Convert to CSV string
      const csvContent = csvRows
        .map(row => 
          row.map(cell => 
            typeof cell === 'string' && cell.includes(',') 
              ? `"${cell}"` 
              : cell
          ).join(',')
        )
        .join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `vulnerability-report-${new Date().toISOString()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Report exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to export report');
    } finally {
      setIsExporting(false);
    }
  };

  if (selectedImages.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">
            {selectedImages.length} images selected
          </span>
          <button
            onClick={onClearSelection}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Clear selection
          </button>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="h-4 w-4 mr-2" />
            {isExporting ? 'Exporting...' : 'Export Report'}
          </button>
          <button
            onClick={handleBatchScan}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Play className="h-4 w-4 mr-2" />
            Start Batch Scan
          </button>
          <button
            onClick={handleBatchDelete}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Selected
          </button>
        </div>
      </div>
    </div>
  );
}