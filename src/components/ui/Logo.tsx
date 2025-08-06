import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'white' | 'dark';
  showText?: boolean;
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ 
  size = 'md', 
  variant = 'default', 
  showText = true, 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
    xl: 'text-2xl'
  };

  const getColors = () => {
    switch (variant) {
      case 'white':
        return {
          primary: '#FFFFFF',
          secondary: '#F6F8FC',
          accent: '#FF9E00'
        };
      case 'dark':
        return {
          primary: '#1E2A78',
          secondary: '#3AA1FF',
          accent: '#FF9E00'
        };
      default:
        return {
          primary: '#1E2A78',
          secondary: '#3AA1FF',
          accent: '#FF9E00'
        };
    }
  };

  const colors = getColors();

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Logo Icon - Replace this with your actual logo from https://imgur.com/a/318G7xx */}
      <div className={`${sizeClasses[size]} flex-shrink-0`}>
        <svg 
          viewBox="0 0 32 32" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Globe/World Icon */}
          <circle 
            cx="16" 
            cy="16" 
            r="12" 
            stroke={colors.primary} 
            strokeWidth="2" 
            fill="none"
          />
          <path 
            d="M4 16C4 9.4 9.4 4 16 4C22.6 4 28 9.4 28 16C28 22.6 22.6 28 16 28C9.4 28 4 22.6 4 16Z" 
            stroke={colors.primary} 
            strokeWidth="1" 
            fill="none"
          />
          <path 
            d="M16 4V28M4 16H28M8 8C11.5 11.5 20.5 11.5 24 8M8 24C11.5 20.5 20.5 20.5 24 24" 
            stroke={colors.primary} 
            strokeWidth="1" 
            fill="none"
          />
          
          {/* Central accent */}
          <circle cx="16" cy="16" r="3" fill={colors.secondary} />
          <rect x="13" y="13" width="6" height="6" fill={colors.accent} opacity="0.7" rx="1"/>
        </svg>
      </div>

      {/* Logo Text */}
      {showText && (
        <div className="flex flex-col">
          <div className={`${textSizeClasses[size]} font-bold tracking-wide`} style={{ color: colors.primary }}>
            LOGISTIC
          </div>
          <div className={`${textSizeClasses[size]} font-bold tracking-wide`} style={{ color: colors.secondary }}>
            INTEL
          </div>
        </div>
      )}
    </div>
  );
};

export default Logo;