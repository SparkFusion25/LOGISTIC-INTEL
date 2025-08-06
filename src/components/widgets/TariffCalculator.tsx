'use client';

import { useState } from 'react';
import { Calculator, FileText, Download, ExternalLink, Truck, Ship, Plane, MapPin, Package, DollarSign } from 'lucide-react';

interface TariffResult {
  hsCode: string;
  description: string;
  dutyRate: string;
  additionalFees: {
    merchandiseProcessingFee: number;
    harborMaintenanceFee: number;
    customsBrokerageFee: number;
  };
  totalDuty: number;
  totalCost: number;
  effectiveRate: string;
  tradeAgreements: string[];
  documentation: string[];
}

export default function TariffCalculator() {
  const [formData, setFormData] = useState({
    hsCode: '',
    description: '',
    origin: '',
    destination: 'United States',
    value: '',
    quantity: '',
    weight: '',
    transportMode: 'ocean'
  });

  const [result, setResult] = useState<TariffResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const calculateTariff = async () => {
    setIsLoading(true);
    
    try {
      // Simulate tariff calculation - in production would use real tariff API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const value = parseFloat(formData.value) || 0;
      const dutyRate = getTariffRate(formData.hsCode, formData.origin);
      const dutyAmount = value * (dutyRate / 100);
      
      const fees = {
        merchandiseProcessingFee: Math.max(value * 0.003464, 27.23), // 0.3464% min $27.23
        harborMaintenanceFee: formData.transportMode === 'ocean' ? value * 0.00125 : 0, // 0.125% for ocean
        customsBrokerageFee: getCustomsBrokerageFee(value)
      };

      const totalFees = Object.values(fees).reduce((sum, fee) => sum + fee, 0);
      const totalCost = value + dutyAmount + totalFees;

      setResult({
        hsCode: formData.hsCode,
        description: getHSDescription(formData.hsCode),
        dutyRate: `${dutyRate}%`,
        additionalFees: fees,
        totalDuty: dutyAmount,
        totalCost,
        effectiveRate: `${((totalCost - value) / value * 100).toFixed(2)}%`,
        tradeAgreements: getTradeAgreements(formData.origin),
        documentation: getRequiredDocs(formData.hsCode)
      });
    } catch (error) {
      console.error('Tariff calculation error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTariffRate = (hsCode: string, origin: string): number => {
    // Simplified tariff logic - in production would use HTS database
    const tariffMap: Record<string, number> = {
      '8471': 0, // Computers - often duty-free
      '8528': 5.0, // Monitors and displays
      '8518': 4.9, // Audio equipment
      '9018': 0, // Medical instruments - often duty-free
      '6203': 16.1, // Men's suits/ensembles
      '6204': 12.8, // Women's suits/ensembles
      '8703': 2.5, // Motor cars
      '7208': 0, // Flat-rolled steel
      '2709': 0, // Petroleum oils
      '8517': 0 // Telecommunications equipment
    };

    const code4 = hsCode.substring(0, 4);
    let rate = tariffMap[code4] || 6.5; // Default rate

    // Apply trade agreement preferences
    if (isNAFTACountry(origin)) {
      rate = 0; // NAFTA/USMCA preference
    } else if (isFTACountry(origin)) {
      rate = rate * 0.5; // 50% reduction for FTA countries
    }

    return rate;
  };

  const getCustomsBrokerageFee = (value: number): number => {
    if (value <= 2000) return 50;
    if (value <= 5000) return 75;
    if (value <= 10000) return 125;
    if (value <= 25000) return 200;
    return 300;
  };

  const getHSDescription = (hsCode: string): string => {
    const descriptions: Record<string, string> = {
      '8471600000': 'Computer processing units and controllers',
      '8528720000': 'LCD monitors and display units',
      '8518300000': 'Audio equipment and headphones',
      '9018390000': 'Medical and surgical instruments',
      '6203420000': 'Men\'s cotton trousers',
      '8703230000': 'Motor cars with spark-ignition engines',
      '7208510000': 'Flat-rolled steel products',
      '2709000000': 'Petroleum oils and oils from bituminous minerals'
    };
    return descriptions[hsCode] || 'Commodity description not found';
  };

  const isNAFTACountry = (country: string): boolean => {
    return ['Canada', 'Mexico'].includes(country);
  };

  const isFTACountry = (country: string): boolean => {
    return ['South Korea', 'Australia', 'Chile', 'Singapore', 'Israel'].includes(country);
  };

  const getTradeAgreements = (origin: string): string[] => {
    const agreements = [];
    if (isNAFTACountry(origin)) agreements.push('USMCA/NAFTA');
    if (isFTACountry(origin)) agreements.push(`US-${origin} FTA`);
    if (['China', 'Russia', 'North Korea', 'Iran'].includes(origin)) {
      agreements.push('Special Trade Restrictions Apply');
    }
    return agreements.length > 0 ? agreements : ['Most Favored Nation (MFN)'];
  };

  const getRequiredDocs = (hsCode: string): string[] => {
    const baseDocs = ['Commercial Invoice', 'Packing List', 'Bill of Lading/Airway Bill'];
    
    if (hsCode.startsWith('9018')) {
      baseDocs.push('FDA Form 2877', 'Medical Device Registration');
    }
    if (hsCode.startsWith('8703')) {
      baseDocs.push('DOT Form HS-7', 'EPA Form 3520-1');
    }
    if (hsCode.startsWith('2709')) {
      baseDocs.push('Pipeline and Hazardous Materials Safety Administration Permit');
    }
    
    return baseDocs;
  };

  const exportToPDF = () => {
    if (!result) return;
    
    // In production, would generate proper PDF
    const content = `
TARIFF CALCULATION REPORT
========================

HS Code: ${result.hsCode}
Description: ${result.description}
Origin: ${formData.origin}
Value: $${parseFloat(formData.value).toLocaleString()}

DUTY CALCULATION:
Duty Rate: ${result.dutyRate}
Duty Amount: $${result.totalDuty.toFixed(2)}

ADDITIONAL FEES:
Merchandise Processing Fee: $${result.additionalFees.merchandiseProcessingFee.toFixed(2)}
Harbor Maintenance Fee: $${result.additionalFees.harborMaintenanceFee.toFixed(2)}
Customs Brokerage Fee: $${result.additionalFees.customsBrokerageFee.toFixed(2)}

TOTAL LANDED COST: $${result.totalCost.toFixed(2)}
Effective Rate: ${result.effectiveRate}

Trade Agreements: ${result.tradeAgreements.join(', ')}

Required Documentation:
${result.documentation.map(doc => `- ${doc}`).join('\n')}
    `;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tariff-calculation-${formData.hsCode}-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <Calculator className="w-8 h-8 text-indigo-600" />
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Tariff Calculator</h2>
          <p className="text-gray-600">Calculate duties, fees, and total landed costs</p>
        </div>
      </div>

      {/* Input Form */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              HS Code *
            </label>
            <input
              type="text"
              value={formData.hsCode}
              onChange={(e) => setFormData(prev => ({ ...prev, hsCode: e.target.value }))}
              placeholder="e.g., 8471600000"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Description
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Brief product description"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Country of Origin *
            </label>
            <select
              value={formData.origin}
              onChange={(e) => setFormData(prev => ({ ...prev, origin: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">Select country...</option>
              <option value="China">China</option>
              <option value="Germany">Germany</option>
              <option value="Japan">Japan</option>
              <option value="South Korea">South Korea</option>
              <option value="Mexico">Mexico</option>
              <option value="Canada">Canada</option>
              <option value="Vietnam">Vietnam</option>
              <option value="Thailand">Thailand</option>
              <option value="India">India</option>
              <option value="Taiwan">Taiwan</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Value (USD) *
            </label>
            <input
              type="number"
              value={formData.value}
              onChange={(e) => setFormData(prev => ({ ...prev, value: e.target.value }))}
              placeholder="100000"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Transport Mode
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'ocean', icon: Ship, label: 'Ocean' },
                { value: 'air', icon: Plane, label: 'Air' },
                { value: 'truck', icon: Truck, label: 'Truck' }
              ].map(mode => (
                <button
                  key={mode.value}
                  onClick={() => setFormData(prev => ({ ...prev, transportMode: mode.value }))}
                  className={`flex items-center justify-center gap-2 p-3 rounded-lg border transition-colors ${
                    formData.transportMode === mode.value
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <mode.icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{mode.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity
              </label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                placeholder="100"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Weight (kg)
              </label>
              <input
                type="number"
                value={formData.weight}
                onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                placeholder="1000"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Calculate Button */}
      <div className="flex justify-center mb-8">
        <button
          onClick={calculateTariff}
          disabled={!formData.hsCode || !formData.origin || !formData.value || isLoading}
          className="flex items-center gap-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Calculating...
            </>
          ) : (
            <>
              <Calculator className="w-5 h-5" />
              Calculate Tariff
            </>
          )}
        </button>
      </div>

      {/* Results */}
      {result && (
        <div className="border-t border-gray-200 pt-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Calculation Results</h3>
            <button
              onClick={exportToPDF}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Cost Breakdown */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Cost Breakdown</h4>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Product Value:</span>
                  <span className="font-medium">${parseFloat(formData.value).toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Duty ({result.dutyRate}):</span>
                  <span className="font-medium">${result.totalDuty.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">MPF:</span>
                  <span className="font-medium">${result.additionalFees.merchandiseProcessingFee.toFixed(2)}</span>
                </div>
                
                {result.additionalFees.harborMaintenanceFee > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">HMF:</span>
                    <span className="font-medium">${result.additionalFees.harborMaintenanceFee.toFixed(2)}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Brokerage Fee:</span>
                  <span className="font-medium">${result.additionalFees.customsBrokerageFee.toFixed(2)}</span>
                </div>
                
                <div className="border-t border-gray-300 pt-3 flex justify-between text-lg font-bold">
                  <span className="text-gray-900">Total Landed Cost:</span>
                  <span className="text-indigo-600">${result.totalCost.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Effective Rate:</span>
                  <span className="font-medium text-red-600">{result.effectiveRate}</span>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Trade Agreements</h4>
                <div className="space-y-2">
                  {result.tradeAgreements.map((agreement, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>{agreement}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Required Documentation</h4>
                <div className="space-y-2">
                  {result.documentation.map((doc, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span>{doc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Disclaimer:</strong> This is an estimate for planning purposes only. 
              Actual duties and fees may vary based on final classification, valuation, and current trade policies. 
              Consult with a licensed customs broker for official determinations.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}