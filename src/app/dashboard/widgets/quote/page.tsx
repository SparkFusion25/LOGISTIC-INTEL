'use client'

import { useState } from 'react'
import { 
  Package, 
  Plane, 
  Ship, 
  Truck, 
  MapPin, 
  Weight, 
  Calculator,
  Download,
  Mail,
  Save,
  Clock,
  DollarSign,
  FileText,
  Globe,
  Calendar
} from 'lucide-react'

interface QuoteRequest {
  mode: 'air' | 'ocean' | 'truck'
  origin: {
    city: string
    country: string
    port?: string
    airport?: string
  }
  destination: {
    city: string
    country: string
    port?: string
    airport?: string
  }
  cargo: {
    weight: number
    volume: number
    pieces: number
    commodity: string
    hsCode?: string
    value?: number
  }
  incoterms: string
  urgency: 'standard' | 'express' | 'economy'
}

interface QuoteResult {
  id: string
  mode: string
  route: string
  carrier: string
  transitTime: string
  cost: {
    base: number
    fuel: number
    handling: number
    documentation: number
    total: number
  }
  validity: string
  features: string[]
}

export default function QuoteGeneratorPage() {
  const [activeMode, setActiveMode] = useState<'air' | 'ocean' | 'truck'>('ocean')
  const [request, setRequest] = useState<QuoteRequest>({
    mode: 'ocean',
    origin: { city: '', country: '', port: '' },
    destination: { city: '', country: '', port: '' },
    cargo: { weight: 0, volume: 0, pieces: 1, commodity: '' },
    incoterms: 'FOB',
    urgency: 'standard'
  })
  const [quotes, setQuotes] = useState<QuoteResult[]>([])
  const [loading, setLoading] = useState(false)
  const [savedTemplates, setSavedTemplates] = useState<string[]>(['EU-US Standard', 'Asia-US Express'])

  // Mock quote results
  const mockQuotes: QuoteResult[] = [
    {
      id: '1',
      mode: 'Ocean',
      route: 'Shanghai → Los Angeles',
      carrier: 'COSCO SHIPPING',
      transitTime: '14-16 days',
      cost: {
        base: 2850,
        fuel: 420,
        handling: 180,
        documentation: 75,
        total: 3525
      },
      validity: '7 days',
      features: ['Container tracking', 'Insurance included', 'Port handling']
    },
    {
      id: '2',
      mode: 'Ocean',
      route: 'Shanghai → Los Angeles',
      carrier: 'Hapag-Lloyd',
      transitTime: '15-17 days',
      cost: {
        base: 2950,
        fuel: 445,
        handling: 200,
        documentation: 85,
        total: 3680
      },
      validity: '5 days',
      features: ['Live tracking', 'Premium service', 'Dedicated support']
    },
    {
      id: '3',
      mode: 'Ocean',
      route: 'Shanghai → Los Angeles',
      carrier: 'MSC',
      transitTime: '16-18 days',
      cost: {
        base: 2750,
        fuel: 385,
        handling: 160,
        documentation: 70,
        total: 3365
      },
      validity: '10 days',
      features: ['Economy option', 'Basic tracking', 'Standard service']
    }
  ]

  const generateQuotes = async () => {
    setLoading(true)
    // Simulate Freightos API call
    setTimeout(() => {
      setQuotes(mockQuotes)
      setLoading(false)
    }, 2000)
  }

  const exportToPDF = (quote: QuoteResult) => {
    // Generate PDF export
    alert(`Exporting quote ${quote.id} to PDF`)
  }

  const exportToHTML = (quote: QuoteResult) => {
    // Generate HTML export
    const htmlContent = `
      <html>
        <head><title>Freight Quote - ${quote.carrier}</title></head>
        <body>
          <h1>Freight Quote</h1>
          <p><strong>Carrier:</strong> ${quote.carrier}</p>
          <p><strong>Route:</strong> ${quote.route}</p>
          <p><strong>Transit Time:</strong> ${quote.transitTime}</p>
          <p><strong>Total Cost:</strong> $${quote.cost.total}</p>
        </body>
      </html>
    `
    const blob = new Blob([htmlContent], { type: 'text/html' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `quote_${quote.id}.html`
    a.click()
  }

  const emailQuote = (quote: QuoteResult) => {
    // Open email with quote details
    const subject = `Freight Quote - ${quote.carrier}`
    const body = `Quote Details:\nCarrier: ${quote.carrier}\nRoute: ${quote.route}\nTotal: $${quote.cost.total}`
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`)
  }

  const saveTemplate = () => {
    const templateName = prompt('Enter template name:')
    if (templateName) {
      setSavedTemplates(prev => [...prev, templateName])
      alert(`Template "${templateName}" saved!`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Quote Generator</h1>
              <p className="text-gray-600">Generate instant quotes for Air, Ocean, and Truck freight shipments</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={saveTemplate}
                className="btn-secondary"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Template
              </button>
              <select className="form-input">
                <option>Select Template</option>
                {savedTemplates.map((template, index) => (
                  <option key={index}>{template}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Mode Selection */}
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-6">
            {[
              { mode: 'ocean' as const, icon: Ship, name: 'Ocean' },
              { mode: 'air' as const, icon: Plane, name: 'Air' },
              { mode: 'truck' as const, icon: Truck, name: 'Truck' }
            ].map(({ mode, icon: Icon, name }) => (
              <button
                key={mode}
                onClick={() => setActiveMode(mode)}
                className={`flex items-center px-4 py-2 rounded-md font-medium transition-colors flex-1 justify-center ${
                  activeMode === mode
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {name}
              </button>
            ))}
          </div>
        </div>

        {/* Quote Form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Shipment Details</h3>
              
              <div className="space-y-6">
                {/* Origin & Destination */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                      <MapPin className="w-4 h-4 mr-2 text-green-600" />
                      Origin
                    </h4>
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="City"
                        className="form-input"
                        value={request.origin.city}
                        onChange={(e) => setRequest(prev => ({
                          ...prev,
                          origin: { ...prev.origin, city: e.target.value }
                        }))}
                      />
                      <input
                        type="text"
                        placeholder="Country"
                        className="form-input"
                        value={request.origin.country}
                        onChange={(e) => setRequest(prev => ({
                          ...prev,
                          origin: { ...prev.origin, country: e.target.value }
                        }))}
                      />
                      {activeMode === 'ocean' && (
                        <input
                          type="text"
                          placeholder="Port"
                          className="form-input"
                          value={request.origin.port || ''}
                          onChange={(e) => setRequest(prev => ({
                            ...prev,
                            origin: { ...prev.origin, port: e.target.value }
                          }))}
                        />
                      )}
                      {activeMode === 'air' && (
                        <input
                          type="text"
                          placeholder="Airport"
                          className="form-input"
                          value={request.origin.airport || ''}
                          onChange={(e) => setRequest(prev => ({
                            ...prev,
                            origin: { ...prev.origin, airport: e.target.value }
                          }))}
                        />
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                      <MapPin className="w-4 h-4 mr-2 text-red-600" />
                      Destination
                    </h4>
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="City"
                        className="form-input"
                        value={request.destination.city}
                        onChange={(e) => setRequest(prev => ({
                          ...prev,
                          destination: { ...prev.destination, city: e.target.value }
                        }))}
                      />
                      <input
                        type="text"
                        placeholder="Country"
                        className="form-input"
                        value={request.destination.country}
                        onChange={(e) => setRequest(prev => ({
                          ...prev,
                          destination: { ...prev.destination, country: e.target.value }
                        }))}
                      />
                      {activeMode === 'ocean' && (
                        <input
                          type="text"
                          placeholder="Port"
                          className="form-input"
                          value={request.destination.port || ''}
                          onChange={(e) => setRequest(prev => ({
                            ...prev,
                            destination: { ...prev.destination, port: e.target.value }
                          }))}
                        />
                      )}
                      {activeMode === 'air' && (
                        <input
                          type="text"
                          placeholder="Airport"
                          className="form-input"
                          value={request.destination.airport || ''}
                          onChange={(e) => setRequest(prev => ({
                            ...prev,
                            destination: { ...prev.destination, airport: e.target.value }
                          }))}
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* Cargo Details */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                    <Package className="w-4 h-4 mr-2 text-blue-600" />
                    Cargo Details
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Weight ({activeMode === 'air' ? 'kg' : 'tons'})
                      </label>
                      <input
                        type="number"
                        className="form-input"
                        value={request.cargo.weight}
                        onChange={(e) => setRequest(prev => ({
                          ...prev,
                          cargo: { ...prev.cargo, weight: parseFloat(e.target.value) || 0 }
                        }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Volume ({activeMode === 'air' ? 'm³' : 'CBM'})
                      </label>
                      <input
                        type="number"
                        className="form-input"
                        value={request.cargo.volume}
                        onChange={(e) => setRequest(prev => ({
                          ...prev,
                          cargo: { ...prev.cargo, volume: parseFloat(e.target.value) || 0 }
                        }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Pieces</label>
                      <input
                        type="number"
                        className="form-input"
                        value={request.cargo.pieces}
                        onChange={(e) => setRequest(prev => ({
                          ...prev,
                          cargo: { ...prev.cargo, pieces: parseInt(e.target.value) || 1 }
                        }))}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Commodity</label>
                      <input
                        type="text"
                        placeholder="e.g. Electronics, Machinery"
                        className="form-input"
                        value={request.cargo.commodity}
                        onChange={(e) => setRequest(prev => ({
                          ...prev,
                          cargo: { ...prev.cargo, commodity: e.target.value }
                        }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">HS Code (optional)</label>
                      <input
                        type="text"
                        placeholder="e.g. 8471.30.01"
                        className="form-input"
                        value={request.cargo.hsCode || ''}
                        onChange={(e) => setRequest(prev => ({
                          ...prev,
                          cargo: { ...prev.cargo, hsCode: e.target.value }
                        }))}
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Incoterms</label>
                    <select
                      className="form-input"
                      value={request.incoterms}
                      onChange={(e) => setRequest(prev => ({ ...prev, incoterms: e.target.value }))}
                    >
                      <option value="FOB">FOB - Free on Board</option>
                      <option value="CIF">CIF - Cost, Insurance & Freight</option>
                      <option value="EXW">EXW - Ex Works</option>
                      <option value="DDP">DDP - Delivered Duty Paid</option>
                      <option value="DAP">DAP - Delivered at Place</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Service Level</label>
                    <select
                      className="form-input"
                      value={request.urgency}
                      onChange={(e) => setRequest(prev => ({ ...prev, urgency: e.target.value as any }))}
                    >
                      <option value="economy">Economy - Lowest cost</option>
                      <option value="standard">Standard - Best value</option>
                      <option value="express">Express - Fastest delivery</option>
                    </select>
                  </div>
                </div>

                {/* Generate Quote Button */}
                <button
                  onClick={generateQuotes}
                  className="btn-primary w-full py-3"
                  disabled={loading || !request.origin.city || !request.destination.city}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Generating Quotes...
                    </>
                  ) : (
                    <>
                      <Calculator className="w-4 h-4 mr-2" />
                      Generate Quotes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Quote Results */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Quote Results</h3>
            
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
              </div>
            ) : quotes.length > 0 ? (
              <div className="space-y-4">
                {quotes.map((quote) => (
                  <div key={quote.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-gray-900">{quote.carrier}</h4>
                        <p className="text-sm text-gray-600">{quote.route}</p>
                      </div>
                      <span className="badge bg-blue-100 text-blue-800">{quote.mode}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 text-gray-400 mr-2" />
                        <span>{quote.transitTime}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                        <span>Valid {quote.validity}</span>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3 mb-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Base Rate:</span>
                        <span>${quote.cost.base}</span>
                      </div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Fuel Surcharge:</span>
                        <span>${quote.cost.fuel}</span>
                      </div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Handling:</span>
                        <span>${quote.cost.handling}</span>
                      </div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Documentation:</span>
                        <span>${quote.cost.documentation}</span>
                      </div>
                      <div className="flex justify-between font-semibold text-lg border-t pt-2">
                        <span>Total:</span>
                        <span className="text-green-600">${quote.cost.total}</span>
                      </div>
                    </div>

                    <div className="mb-3">
                      <p className="text-xs text-gray-600 mb-1">Included Services:</p>
                      <div className="flex flex-wrap gap-1">
                        {quote.features.map((feature, index) => (
                          <span key={index} className="badge bg-green-100 text-green-700 text-xs">
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => exportToPDF(quote)}
                        className="btn-secondary text-xs flex-1"
                      >
                        <FileText className="w-3 h-3 mr-1" />
                        PDF
                      </button>
                      <button
                        onClick={() => exportToHTML(quote)}
                        className="btn-secondary text-xs flex-1"
                      >
                        <Globe className="w-3 h-3 mr-1" />
                        HTML
                      </button>
                      <button
                        onClick={() => emailQuote(quote)}
                        className="btn-primary text-xs flex-1"
                      >
                        <Mail className="w-3 h-3 mr-1" />
                        Email
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calculator className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No quotes yet</h3>
                <p className="text-gray-500">Fill in the shipment details and generate quotes</p>
              </div>
            )}
          </div>
        </div>

        {/* Freightos Integration Notice */}
        <div className="glass-card p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Globe className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Powered by Freightos API</p>
              <p className="text-xs text-gray-600">Real-time rates from global freight carriers</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}