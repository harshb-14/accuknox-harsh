import React from 'react';
import { Shield } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export function Header() {
  const { user, signOut } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Shield className="h-8 w-8 text-blue-600" />
            <span className="ml-2 text-xl font-semibold">Accuknox PM</span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500">All Systems Operational</div>
            {user && (
              <div className="flex items-center space-x-2">
                <img
                  src={user.user_metadata.avatar_url || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e"}
                  alt="Profile"
                  className="h-8 w-8 rounded-full"
                />
                <span className="text-sm font-medium">{user.user_metadata.full_name}</span>
                <button
                  onClick={() => signOut()}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}