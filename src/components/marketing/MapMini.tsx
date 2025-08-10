'use client'

import { useEffect, useRef } from 'react'

export function MapMini() {
  const mapRef = useRef<HTMLDivElement>(null)

  const mockShipmentPaths = [
    { from: [20, 30], to: [80, 40], active: true },
    { from: [10, 60], to: [70, 30], active: false },
    { from: [30, 80], to: [90, 20], active: true },
    { from: [5, 40], to: [60, 70], active: false },
  ]

  const mockPorts = [
    { x: 20, y: 30, name: 'Shanghai', size: 'large' },
    { x: 80, y: 40, name: 'Los Angeles', size: 'large' },
    { x: 10, y: 60, name: 'Rotterdam', size: 'medium' },
    { x: 70, y: 30, name: 'Singapore', size: 'medium' },
    { x: 30, y: 80, name: 'Mumbai', size: 'small' },
    { x: 90, y: 20, name: 'New York', size: 'large' },
    { x: 60, y: 70, name: 'Dubai', size: 'medium' },
  ]

  return (
    <div 
      ref={mapRef}
      className="relative w-full h-96 bg-gradient-to-br from-surface/80 to-bg/80 backdrop-blur-sm rounded-2xl overflow-hidden border border-border/50"
      style={{
        backgroundImage: `
          radial-gradient(circle at 20% 30%, rgba(0, 179, 164, 0.1) 0%, transparent 25%),
          radial-gradient(circle at 80% 40%, rgba(124, 139, 255, 0.1) 0%, transparent 25%),
          radial-gradient(circle at 30% 80%, rgba(0, 179, 164, 0.05) 0%, transparent 30%)
        `
      }}
    >
      {/* World Map Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
          {/* Simplified world continents */}
          <path 
            d="M15,25 Q20,20 30,25 L35,30 Q40,35 35,40 L30,45 Q25,40 20,35 L15,30 Z"
            fill="currentColor"
            className="text-muted/30"
          />
          <path 
            d="M65,20 Q75,15 85,25 L90,35 Q85,45 75,40 L70,30 Q65,25 65,20 Z"
            fill="currentColor"
            className="text-muted/30"
          />
          <path 
            d="M25,60 Q35,55 45,65 L50,75 Q40,80 30,75 L25,65 Z"
            fill="currentColor"
            className="text-muted/30"
          />
        </svg>
      </div>

      {/* Shipping Routes */}
      <svg className="absolute inset-0 w-full h-full">
        {mockShipmentPaths.map((path, index) => (
          <g key={index}>
            {/* Route Line */}
            <line
              x1={`${path.from[0]}%`}
              y1={`${path.from[1]}%`}
              x2={`${path.to[0]}%`}
              y2={`${path.to[1]}%`}
              stroke={path.active ? "#00B3A4" : "#7C8BFF"}
              strokeWidth="2"
              strokeOpacity={path.active ? 0.8 : 0.4}
              strokeDasharray={path.active ? "none" : "4 4"}
              className={path.active ? "animate-pulse" : ""}
            />
            
            {/* Animated Dot */}
            {path.active && (
              <circle r="3" fill="#00B3A4" className="animate-ping">
                <animateMotion
                  dur="4s"
                  repeatCount="indefinite"
                  path={`M ${path.from[0]},${path.from[1]} L ${path.to[0]},${path.to[1]}`}
                />
              </circle>
            )}
          </g>
        ))}
      </svg>

      {/* Port Markers */}
      {mockPorts.map((port, index) => (
        <div
          key={index}
          className={`absolute transform -translate-x-1/2 -translate-y-1/2 ${
            port.size === 'large' 
              ? 'w-4 h-4' 
              : port.size === 'medium' 
              ? 'w-3 h-3' 
              : 'w-2 h-2'
          }`}
          style={{ left: `${port.x}%`, top: `${port.y}%` }}
        >
          <div 
            className={`w-full h-full rounded-full bg-gradient-to-br from-primary to-accent animate-pulse shadow-lg ${
              port.size === 'large' ? 'shadow-primary/50' : 'shadow-primary/30'
            }`}
          />
          
          {/* Port Label */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1">
            <span className="text-xs font-medium text-ink/70 bg-surface/80 backdrop-blur-sm px-2 py-1 rounded-md border border-border/50 whitespace-nowrap">
              {port.name}
            </span>
          </div>
        </div>
      ))}

      {/* Live Data Indicators */}
      <div className="absolute top-4 left-4 space-y-2">
        <div className="flex items-center gap-2 bg-surface/80 backdrop-blur-sm px-3 py-2 rounded-lg border border-border/50">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
          <span className="text-xs font-medium text-ink">2.4M+ Live Routes</span>
        </div>
        <div className="flex items-center gap-2 bg-surface/80 backdrop-blur-sm px-3 py-2 rounded-lg border border-border/50">
          <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
          <span className="text-xs font-medium text-ink">Real-time Updates</span>
        </div>
      </div>

      {/* Performance Stats */}
      <div className="absolute bottom-4 right-4 bg-surface/80 backdrop-blur-sm px-4 py-3 rounded-lg border border-border/50">
        <div className="text-xs text-muted mb-1">Processing Speed</div>
        <div className="text-lg font-bold text-ink">94% Faster</div>
      </div>
    </div>
  )
}