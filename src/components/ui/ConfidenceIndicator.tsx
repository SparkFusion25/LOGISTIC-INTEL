import React from 'react';
import { Shield, CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-react';

interface ConfidenceIndicatorProps {
  score: number;
  sources: string[];
  apolloVerified: boolean;
  className?: string;
  showTooltip?: boolean;
}

export default function ConfidenceIndicator({ 
  score, 
  sources, 
  apolloVerified, 
  className = "",
  showTooltip = true 
}: ConfidenceIndicatorProps) {
  
  const getConfidenceLevel = (score: number) => {
    if (score >= 85) return { level: 'high', color: 'text-green-600', bgColor: 'bg-green-100', icon: CheckCircle };
    if (score >= 70) return { level: 'good', color: 'text-blue-600', bgColor: 'bg-blue-100', icon: Shield };
    if (score >= 50) return { level: 'medium', color: 'text-yellow-600', bgColor: 'bg-yellow-100', icon: AlertTriangle };
    return { level: 'low', color: 'text-red-600', bgColor: 'bg-red-100', icon: XCircle };
  };

  const { level, color, bgColor, icon: Icon } = getConfidenceLevel(score);
  
  const formatSources = (sources: string[]) => {
    return sources.join(' + ');
  };

  const getConfidenceDescription = (score: number, level: string) => {
    switch (level) {
      case 'high':
        return 'High confidence match based on multiple verified sources';
      case 'good': 
        return 'Good confidence match with verified data points';
      case 'medium':
        return 'Medium confidence match with some verified sources';
      case 'low':
        return 'Low confidence match - verification recommended';
      default:
        return 'Match confidence unavailable';
    }
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Main confidence badge */}
      <div className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${bgColor} ${color}`}>
        <Icon className="w-3 h-3 mr-1" />
        <span>{score}% confidence</span>
      </div>

      {/* Apollo verification badge */}
      {apolloVerified && (
        <div className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-purple-100 text-purple-700">
          <CheckCircle className="w-3 h-3 mr-1" />
          <span>Apollo Verified ✅</span>
        </div>
      )}

      {/* Tooltip with detailed information */}
      {showTooltip && (
        <div className="group relative">
          <Info className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help" />
          <div className="invisible group-hover:visible absolute z-50 w-80 p-3 mt-1 text-sm bg-gray-900 text-white rounded-lg shadow-lg -left-32">
            <div className="font-semibold mb-2">
              {getConfidenceDescription(score, level)}
            </div>
            <div className="space-y-1">
              <div>
                <span className="font-medium">Sources:</span> {formatSources(sources)}
              </div>
              {apolloVerified && (
                <div className="text-purple-300">
                  ✓ Contact verified via Apollo.io database
                </div>
              )}
            </div>
            <div className="absolute -top-1 left-32 transform rotate-45 w-2 h-2 bg-gray-900"></div>
          </div>
        </div>
      )}
    </div>
  );
}