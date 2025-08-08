'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Ship, Plane, MapPin, Building2, DollarSign, Package } from 'lucide-react';

interface Shipment {
  company: string;
  origin: string;
  destination: string;
  type: 'ocean' | 'air';
  value?: number;
}

interface ShipmentMapProps {
  shipments: Shipment[];
  filterType: 'all' | 'ocean' | 'air';
  searchQuery: string;
  isLoading: boolean;
}

// Port coordinates database
const PORT_COORDINATES: Record<string, [number, number]> = {
  // Major Asian ports
  'Shanghai': [31.2304, 121.4737],
  'Shenzhen': [22.5431, 114.0579],
  'Singapore': [1.3521, 103.8198],
  'Hong Kong': [22.3193, 114.1694],
  'Busan': [35.1796, 129.0756],
  'Tokyo': [35.6762, 139.6503],
  'Yokohama': [35.4437, 139.6380],
  'Kaohsiung': [22.6273, 120.3014],
  'Ho Chi Minh': [10.8231, 106.6297],
  'Jakarta': [-6.2088, 106.8456],
  'Manila': [14.5995, 120.9842],
  'Mumbai': [19.0760, 72.8777],
  'Chennai': [13.0827, 80.2707],
  'Kolkata': [22.5726, 88.3639],
  'Seoul': [37.5665, 126.9780],
  
  // Major US ports
  'Los Angeles': [34.0522, -118.2437],
  'Long Beach': [33.7701, -118.1937],
  'Oakland': [37.8044, -122.2712],
  'Seattle': [47.6062, -122.3321],
  'Tacoma': [47.2529, -122.4443],
  'New York': [40.7128, -74.0060],
  'Newark': [40.7357, -74.1724],
  'Charleston': [32.7767, -79.9311],
  'Savannah': [32.0835, -81.0998],
  'Houston': [29.7604, -95.3698],
  'Miami': [25.7617, -80.1918],
  'Norfolk': [36.8508, -76.2859],
  'Baltimore': [39.2904, -76.6122],
  'Chicago': [41.8781, -87.6298],
  
  // European ports
  'Rotterdam': [51.9244, 4.4777],
  'Hamburg': [53.5511, 9.9937],
  'Antwerp': [51.2194, 4.4025],
  'Le Havre': [49.4944, 0.1079],
  'Bremen': [53.0793, 8.8017],
  'Felixstowe': [51.9640, 1.3518],
  'London': [51.5074, -0.1278],
  'Barcelona': [41.3851, 2.1734],
  'Valencia': [39.4699, -0.3763],
  
  // Other major ports
  'Dubai': [25.2048, 55.2708],
  'Jeddah': [21.4858, 39.1925],
  'Lagos': [6.5244, 3.3792],
  'Cape Town': [-33.9249, 18.4241],
  'Montreal': [45.5017, -73.5673],
  'Vancouver': [49.2827, -123.1207],
  'Sydney': [-33.8688, 151.2093],
  'Melbourne': [-37.8136, 144.9631],
  'Auckland': [-36.8485, 174.7633]
};

const InteractiveShipmentMap: React.FC<ShipmentMapProps> = ({
  shipments,
  filterType,
  searchQuery,
  isLoading
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // Filter shipments based on type and search
  const filteredShipments = shipments.filter(shipment => {
    const matchesType = filterType === 'all' || shipment.type === filterType;
    const matchesSearch = !searchQuery || 
      shipment.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shipment.origin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shipment.destination.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  // Get coordinates for a port
  const getPortCoordinates = (portName: string): [number, number] | null => {
    // Try exact match first
    if (PORT_COORDINATES[portName]) {
      return PORT_COORDINATES[portName];
    }
    
    // Try partial match
    const fuzzyMatch = Object.keys(PORT_COORDINATES).find(port => 
      port.toLowerCase().includes(portName.toLowerCase()) ||
      portName.toLowerCase().includes(port.toLowerCase())
    );
    
    if (fuzzyMatch && PORT_COORDINATES[fuzzyMatch]) {
      return PORT_COORDINATES[fuzzyMatch];
    }
    
    return null;
  };

  // Initialize map when component mounts
  useEffect(() => {
    let leaflet: any = null;
    let map: any = null;

    const initializeMap = async () => {
      if (typeof window === 'undefined' || !mapRef.current) return;

      try {
        // Dynamically import Leaflet
        const L = await import('leaflet');
        leaflet = L.default;

        // Fix for default markers
        delete (leaflet.Icon.Default.prototype as any)._getIconUrl;
        leaflet.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });

        // Create map instance
        map = leaflet.map(mapRef.current).setView([25, 0], 2);

        // Add OpenStreetMap tiles
        leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 18,
        }).addTo(map);

        setMapInstance(map);
        setIsMapLoaded(true);

      } catch (error) {
        console.error('Failed to load map:', error);
        setIsMapLoaded(false);
      }
    };

    initializeMap();

    // Cleanup
    return () => {
      if (map) {
        map.remove();
      }
    };
  }, []);

  // Update map with shipment data
  useEffect(() => {
    if (!mapInstance || !isMapLoaded || !window.L) return;

    const L = window.L;
    
    // Clear existing layers
    mapInstance.eachLayer((layer: any) => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline) {
        mapInstance.removeLayer(layer);
      }
    });

    // Add shipment routes and markers
    filteredShipments.forEach((shipment, index) => {
      const originCoords = getPortCoordinates(shipment.origin);
      const destCoords = getPortCoordinates(shipment.destination);

      if (originCoords && destCoords) {
        // Create custom icons
        const originIcon = L.divIcon({
          html: `<div class="w-6 h-6 bg-green-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                   <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                     <path d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"/>
                   </svg>
                 </div>`,
          className: 'custom-div-icon',
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        const destIcon = L.divIcon({
          html: `<div class="w-6 h-6 bg-red-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                   <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                     <path d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"/>
                   </svg>
                 </div>`,
          className: 'custom-div-icon',
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        // Add origin marker
        const originMarker = L.marker(originCoords, { icon: originIcon })
          .bindPopup(`
            <div class="p-2">
              <h3 class="font-bold text-sm">${shipment.origin}</h3>
              <p class="text-xs text-gray-600">Origin Port</p>
              <p class="text-xs"><strong>Company:</strong> ${shipment.company}</p>
              <p class="text-xs"><strong>Type:</strong> ${shipment.type.toUpperCase()}</p>
              ${shipment.value ? `<p class="text-xs"><strong>Value:</strong> $${(shipment.value / 1000).toFixed(0)}K</p>` : ''}
            </div>
          `)
          .addTo(mapInstance);

        // Add destination marker
        const destMarker = L.marker(destCoords, { icon: destIcon })
          .bindPopup(`
            <div class="p-2">
              <h3 class="font-bold text-sm">${shipment.destination}</h3>
              <p class="text-xs text-gray-600">Destination Port</p>
              <p class="text-xs"><strong>Company:</strong> ${shipment.company}</p>
              <p class="text-xs"><strong>Type:</strong> ${shipment.type.toUpperCase()}</p>
              ${shipment.value ? `<p class="text-xs"><strong>Value:</strong> $${(shipment.value / 1000).toFixed(0)}K</p>` : ''}
            </div>
          `)
          .addTo(mapInstance);

        // Add route line
        const routeColor = shipment.type === 'air' ? '#0ea5e9' : '#3b82f6';
        const routeLine = L.polyline([originCoords, destCoords], {
          color: routeColor,
          weight: 3,
          opacity: 0.7,
          dashArray: shipment.type === 'air' ? '10, 5' : undefined
        }).addTo(mapInstance);

        // Add click handlers
        routeLine.on('click', () => {
          setSelectedShipment(shipment);
        });

        originMarker.on('click', () => {
          setSelectedShipment(shipment);
        });

        destMarker.on('click', () => {
          setSelectedShipment(shipment);
        });
      }
    });

    // Fit map to show all routes
    if (filteredShipments.length > 0) {
      const bounds = L.latLngBounds([]);
      filteredShipments.forEach(shipment => {
        const originCoords = getPortCoordinates(shipment.origin);
        const destCoords = getPortCoordinates(shipment.destination);
        if (originCoords) bounds.extend(originCoords);
        if (destCoords) bounds.extend(destCoords);
      });
      
      if (bounds.isValid()) {
        mapInstance.fitBounds(bounds, { padding: [20, 20] });
      }
    }

  }, [mapInstance, filteredShipments, isMapLoaded]);

  if (!isMapLoaded) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Interactive Shipment Routes</h3>
        <div className="h-[400px] lg:h-[500px] bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
            <p className="text-gray-600">Loading interactive map...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Load Leaflet CSS */}
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css"
        integrity="sha512-xodZBNTC5n17Xt2atTPuE1HxjVMSvLVW9ocqUKLsCC5CXdbqCmblAshOMAS6/keqq/sMZMZ19scR4PsZChSR7A=="
        crossOrigin=""
      />

      <div className="bg-white rounded-lg shadow-sm p-4 lg:p-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4 gap-4">
          <div>
            <h3 className="text-lg font-semibold">Interactive Shipment Routes</h3>
            <p className="text-sm text-gray-600">
              {filteredShipments.length} routes shown • Click markers and routes for details
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2 text-xs">
            <div className="flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              Origin Ports
            </div>
            <div className="flex items-center gap-1 bg-red-100 text-red-800 px-2 py-1 rounded">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              Destination Ports
            </div>
            <div className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded">
              <div className="w-3 h-0.5 bg-blue-500"></div>
              Ocean Routes
            </div>
            <div className="flex items-center gap-1 bg-sky-100 text-sky-800 px-2 py-1 rounded">
              <div className="w-3 h-0.5 bg-sky-500 border-dashed border-t"></div>
              Air Routes
            </div>
          </div>
        </div>

        <div className="relative">
          <div
            ref={mapRef}
            className="h-[300px] lg:h-[500px] rounded-lg border"
            style={{ minHeight: '300px' }}
          />
          
          {isLoading && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
                <p className="text-gray-600">Updating routes...</p>
              </div>
            </div>
          )}
        </div>

        {/* Route Statistics */}
        <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-blue-600 mb-1">
              <Ship className="w-4 h-4" />
              <span className="text-sm font-medium">Ocean</span>
            </div>
            <p className="text-lg font-bold text-blue-800">
              {filteredShipments.filter(s => s.type === 'ocean').length}
            </p>
          </div>
          
          <div className="bg-sky-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-sky-600 mb-1">
              <Plane className="w-4 h-4" />
              <span className="text-sm font-medium">Air</span>
            </div>
            <p className="text-lg font-bold text-sky-800">
              {filteredShipments.filter(s => s.type === 'air').length}
            </p>
          </div>
          
          <div className="bg-green-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-green-600 mb-1">
              <MapPin className="w-4 h-4" />
              <span className="text-sm font-medium">Ports</span>
            </div>
            <p className="text-lg font-bold text-green-800">
              {new Set([...filteredShipments.map(s => s.origin), ...filteredShipments.map(s => s.destination)]).size}
            </p>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-purple-600 mb-1">
              <Building2 className="w-4 h-4" />
              <span className="text-sm font-medium">Companies</span>
            </div>
            <p className="text-lg font-bold text-purple-800">
              {new Set(filteredShipments.map(s => s.company)).size}
            </p>
          </div>
        </div>
      </div>

      {/* Selected Shipment Modal */}
      {selectedShipment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold">{selectedShipment.company}</h3>
              <button
                onClick={() => setSelectedShipment(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-green-500" />
                <span className="text-sm">
                  <strong>Origin:</strong> {selectedShipment.origin}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-red-500" />
                <span className="text-sm">
                  <strong>Destination:</strong> {selectedShipment.destination}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                {selectedShipment.type === 'ocean' ? 
                  <Ship className="w-4 h-4 text-blue-500" /> : 
                  <Plane className="w-4 h-4 text-sky-500" />
                }
                <span className="text-sm">
                  <strong>Transport:</strong> {selectedShipment.type.toUpperCase()}
                </span>
              </div>
              
              {selectedShipment.value && (
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-500" />
                  <span className="text-sm">
                    <strong>Value:</strong> ${(selectedShipment.value / 1000).toFixed(0)}K
                  </span>
                </div>
              )}
            </div>
            
            <button
              onClick={() => setSelectedShipment(null)}
              className="w-full mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default InteractiveShipmentMap;
