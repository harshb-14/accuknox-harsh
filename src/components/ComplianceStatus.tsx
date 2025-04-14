import React from 'react';
import { Shield, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export function ComplianceStatus() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['compliance-status'],
    queryFn: async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('User not authenticated');

      const { data: images, error: imagesError } = await supabase
        .from('container_images')
        .select('critical_vulnerabilities, high_vulnerabilities, medium_vulnerabilities')
        .eq('user_id', user.id);

      if (imagesError) throw imagesError;

      const totalImages = images.length;
      const criticalImages = images.filter(img => img.critical_vulnerabilities > 0).length;
      const highImages = images.filter(img => img.high_vulnerabilities > 0).length;

      // Calculate compliance scores
      const securityScore = Math.max(0, 100 - (criticalImages * 15 + highImages * 5));
      const complianceLevel = securityScore >= 90 ? 'Compliant' : 
                            securityScore >= 70 ? 'At Risk' : 'Non-Compliant';

      return {
        securityScore,
        complianceLevel,
        totalImages,
        criticalImages,
        highImages,
      };
    },
    refetchInterval: 60000, // 1 minute
  });

  if (isLoading) {
    return (
      <div className="animate-pulse bg-white rounded-lg shadow-sm p-6">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <p className="text-red-500">Error loading compliance status</p>
      </div>
    );
  }

  const { securityScore, complianceLevel, totalImages, criticalImages, highImages } = data;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Compliance Status</h2>
        <Shield className="h-6 w-6 text-blue-600" />
      </div>

      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-500">Security Score</span>
            <span className={`text-lg font-semibold ${
              securityScore >= 90 ? 'text-green-600' :
              securityScore >= 70 ? 'text-orange-600' :
              'text-red-600'
            }`}>
              {securityScore}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${
                securityScore >= 90 ? 'bg-green-600' :
                securityScore >= 70 ? 'bg-orange-600' :
                'bg-red-600'
              }`}
              style={{ width: `${securityScore}%` }}
            ></div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {complianceLevel === 'Compliant' ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : complianceLevel === 'At Risk' ? (
            <AlertTriangle className="h-5 w-5 text-orange-500" />
          ) : (
            <XCircle className="h-5 w-5 text-red-500" />
          )}
          <span className={`font-medium ${
            complianceLevel === 'Compliant' ? 'text-green-700' :
            complianceLevel === 'At Risk' ? 'text-orange-700' :
            'text-red-700'
          }`}>
            {complianceLevel}
          </span>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Total Images</span>
            <span className="font-medium">{totalImages}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Images with Critical Vulnerabilities</span>
            <span className="font-medium text-red-600">{criticalImages}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Images with High Vulnerabilities</span>
            <span className="font-medium text-orange-600">{highImages}</span>
          </div>
        </div>

        {complianceLevel !== 'Compliant' && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-sm font-medium text-blue-800 mb-2">Recommendations</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              {criticalImages > 0 && (
                <li>• Address critical vulnerabilities in {criticalImages} images</li>
              )}
              {highImages > 0 && (
                <li>• Resolve high-risk issues in {highImages} images</li>
              )}
              <li>• Regular scanning of all container images</li>
              <li>• Implement image signing and verification</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}