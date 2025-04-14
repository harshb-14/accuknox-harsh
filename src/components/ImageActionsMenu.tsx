import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, Eye, RotateCcw, Trash2 } from 'lucide-react';

interface ImageActionsMenuProps {
  image: {
    id: string;
    name: string;
    status: string;
  };
  onView: () => void;
  onStartScan: () => void;
  onDelete: () => void;
}

export function ImageActionsMenu({ image, onView, onStartScan, onDelete }: ImageActionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef} style={{ zIndex: 50 }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-gray-600 hover:text-gray-900 transition-colors"
      >
        <MoreVertical className="h-5 w-5" />
      </button>

      {isOpen && (
        <div className="fixed transform -translate-x-full mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
          <div className="py-1" role="menu">
            <button
              onClick={() => {
                onView();
                setIsOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
            >
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </button>
            <button
              onClick={() => {
                onStartScan();
                setIsOpen(false);
              }}
              disabled={image.status === 'scanning'}
              className={`w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center ${
                image.status === 'scanning' ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Start Scan
            </button>
            <button
              onClick={() => {
                if (window.confirm(`Are you sure you want to delete ${image.name}?`)) {
                  onDelete();
                  setIsOpen(false);
                }
              }}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}