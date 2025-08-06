import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ResponsiveCardProps {
  title: string;
  value?: string | number;
  description?: string;
  icon?: LucideIcon;
  iconColor?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  children?: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

const ResponsiveCard: React.FC<ResponsiveCardProps> = ({
  title,
  value,
  description,
  icon: Icon,
  iconColor = 'text-indigo-600',
  trend,
  children,
  className = '',
  size = 'md',
  onClick
}) => {
  const sizeClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  const titleSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  const valueSizeClasses = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl'
  };

  return (
    <div 
      className={`
        bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200
        ${onClick ? 'cursor-pointer hover:border-indigo-300' : ''}
        ${sizeClasses[size]}
        ${className}
      `}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold text-gray-900 truncate ${titleSizeClasses[size]}`}>
            {title}
          </h3>
          {description && (
            <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2">
              {description}
            </p>
          )}
        </div>
        
        {Icon && (
          <div className={`flex-shrink-0 ml-3 ${iconColor}`}>
            <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        )}
      </div>

      {/* Value */}
      {value && (
        <div className="mb-3">
          <div className={`font-bold text-gray-900 ${valueSizeClasses[size]}`}>
            {value}
          </div>
        </div>
      )}

      {/* Trend */}
      {trend && (
        <div className="flex items-center gap-1 mb-3">
          <span className={`text-xs sm:text-sm font-medium ${
            trend.isPositive ? 'text-green-600' : 'text-red-600'
          }`}>
            {trend.isPositive ? '↗' : '↘'} {trend.value}
          </span>
          <span className="text-xs text-gray-500">vs last period</span>
        </div>
      )}

      {/* Custom Content */}
      {children && (
        <div className="space-y-3">
          {children}
        </div>
      )}
    </div>
  );
};

export default ResponsiveCard;