import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useImages } from '../hooks/useImages';

interface AddImageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddImageModal({ isOpen, onClose }: AddImageModalProps) {
  const [imageName, setImageName] = useState('');
  const [registryUrl, setRegistryUrl] = useState('');
  const { addImage, isAddingImage } = useImages({
    search: '',
    severity: 'all',
    lastScan: 'all',
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addImage.mutateAsync({
        name: imageName,
        registry_url: registryUrl || null,
      });
      onClose();
      setImageName('');
      setRegistryUrl('');
    } catch (error) {
      // Error handling is managed by the mutation
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>
        
        <h2 className="text-xl font-semibold mb-4">Add New Container Image</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="imageName" className="block text-sm font-medium text-gray-700 mb-1">
              Image Name*
            </label>
            <input
              id="imageName"
              type="text"
              required
              placeholder="e.g., nginx:latest"
              value={imageName}
              onChange={(e) => setImageName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isAddingImage}
            />
          </div>

          <div>
            <label htmlFor="registryUrl" className="block text-sm font-medium text-gray-700 mb-1">
              Registry URL (optional)
            </label>
            <input
              id="registryUrl"
              type="text"
              placeholder="e.g., registry.hub.docker.com"
              value={registryUrl}
              onChange={(e) => setRegistryUrl(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isAddingImage}
            />
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={isAddingImage}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isAddingImage || !imageName.trim()}
              className={`px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                isAddingImage || !imageName.trim() ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isAddingImage ? 'Adding...' : 'Add Image'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}