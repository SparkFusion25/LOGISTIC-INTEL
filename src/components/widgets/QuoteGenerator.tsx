'use client';

import { useState } from 'react';
import { FileText, Download, Mail, Upload, MapPin, Package, Calendar, DollarSign, Truck, Ship, Plane, Edit3 } from 'lucide-react';

interface QuoteItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface Quote {
  quoteNumber: string;
  date: string;
  validUntil: string;
  customerInfo: {
    companyName: string;
    contactName: string;
    email: string;
    phone: string;
    address: string;
  };
  shipmentDetails: {
    origin: string;
    destination: string;
    mode: 'ocean' | 'air' | 'truck' | 'rail';
    commodity: string;
    weight: string;
    dimensions: string;
    incoterms: string;
  };
  items: QuoteItem[];
  subtotal: number;
  taxes: number;
  total: number;
  notes: string;
  terms: string;
}

export default function QuoteGenerator() {
  const [quote, setQuote] = useState<Quote>({
    quoteNumber: `LI-${Date.now().toString().slice(-6)}`,
    date: new Date().toISOString().split('T')[0],
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    customerInfo: {
      companyName: '',
      contactName: '',
      email: '',
      phone: '',
      address: ''
    },
    shipmentDetails: {
      origin: '',
      destination: '',
      mode: 'ocean',
      commodity: '',
      weight: '',
      dimensions: '',
      incoterms: 'FOB'
    },
    items: [
      { description: 'Ocean Freight', quantity: 1, rate: 0, amount: 0 }
    ],
    subtotal: 0,
    taxes: 0,
    total: 0,
    notes: '',
    terms: 'Payment due within 30 days of invoice date. All rates are subject to change based on final shipment details and carrier surcharges.'
  });

  const [companyInfo, setCompanyInfo] = useState({
    name: 'Logistic Intel',
    address: '123 Trade Center Blvd\nLogistics District, NY 10001',
    phone: '+1 (555) 123-4567',
    email: 'quotes@logisticintel.com',
    website: 'www.logisticintel.com',
    logo: ''
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);

  const handleCustomerChange = (field: keyof typeof quote.customerInfo, value: string) => {
    setQuote(prev => ({
      ...prev,
      customerInfo: { ...prev.customerInfo, [field]: value }
    }));
  };

  const handleShipmentChange = (field: keyof typeof quote.shipmentDetails, value: string) => {
    setQuote(prev => ({
      ...prev,
      shipmentDetails: { ...prev.shipmentDetails, [field]: value }
    }));
  };

  const handleItemChange = (index: number, field: keyof QuoteItem, value: string | number) => {
    const newItems = [...quote.items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Recalculate amount for this item
    if (field === 'quantity' || field === 'rate') {
      newItems[index].amount = newItems[index].quantity * newItems[index].rate;
    }

    // Recalculate totals
    const subtotal = newItems.reduce((sum, item) => sum + item.amount, 0);
    const taxes = subtotal * 0.08; // 8% tax rate
    const total = subtotal + taxes;

    setQuote(prev => ({
      ...prev,
      items: newItems,
      subtotal,
      taxes,
      total
    }));
  };

  const addItem = () => {
    setQuote(prev => ({
      ...prev,
      items: [
        ...prev.items,
        { description: '', quantity: 1, rate: 0, amount: 0 }
      ]
    }));
  };

  const removeItem = (index: number) => {
    if (quote.items.length > 1) {
      const newItems = quote.items.filter((_, i) => i !== index);
      const subtotal = newItems.reduce((sum, item) => sum + item.amount, 0);
      const taxes = subtotal * 0.08;
      const total = subtotal + taxes;

      setQuote(prev => ({
        ...prev,
        items: newItems,
        subtotal,
        taxes,
        total
      }));
    }
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setCompanyInfo(prev => ({
          ...prev,
          logo: e.target?.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const exportToPDF = () => {
    const content = generateQuoteHTML();
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quote-${quote.quoteNumber}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const emailQuote = () => {
    const subject = `Logistics Quote ${quote.quoteNumber} - ${quote.customerInfo.companyName}`;
    const body = `Dear ${quote.customerInfo.contactName},

Please find attached your logistics quote ${quote.quoteNumber} for shipment from ${quote.shipmentDetails.origin} to ${quote.shipmentDetails.destination}.

Quote Summary:
- Mode: ${quote.shipmentDetails.mode.toUpperCase()}
- Commodity: ${quote.shipmentDetails.commodity}
- Total: $${quote.total.toLocaleString()}
- Valid Until: ${quote.validUntil}

If you have any questions or would like to proceed with this shipment, please don't hesitate to contact us.

Best regards,
${companyInfo.name}
${companyInfo.phone}
${companyInfo.email}`;

    const mailtoUrl = `mailto:${quote.customerInfo.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoUrl, '_blank');
  };

  const generateQuoteHTML = () => {
    return `
<!DOCTYPE html>
<html>
<head>
    <title>Quote ${quote.quoteNumber}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; border-bottom: 2px solid #1e40af; padding-bottom: 20px; }
        .logo { max-width: 150px; max-height: 80px; }
        .company-info { text-align: right; }
        .quote-title { text-align: center; margin: 30px 0; }
        .quote-title h1 { color: #1e40af; margin: 0; }
        .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px; }
        .section { background: #f8fafc; padding: 20px; border-radius: 8px; }
        .section h3 { margin-top: 0; color: #1e40af; }
        .items-table { width: 100%; border-collapse: collapse; margin: 30px 0; }
        .items-table th, .items-table td { border: 1px solid #e2e8f0; padding: 12px; text-align: left; }
        .items-table th { background: #1e40af; color: white; }
        .totals { margin-left: auto; width: 300px; margin-top: 20px; }
        .totals table { width: 100%; }
        .totals td { padding: 8px; border-bottom: 1px solid #e2e8f0; }
        .total-row { font-weight: bold; font-size: 1.1em; background: #1e40af; color: white; }
        .notes, .terms { margin-top: 30px; padding: 20px; background: #f8fafc; border-radius: 8px; }
        .footer { margin-top: 50px; text-align: center; color: #64748b; font-size: 0.9em; }
    </style>
</head>
<body>
    <div class="header">
        <div class="company-details">
            ${companyInfo.logo ? `<img src="${companyInfo.logo}" alt="Company Logo" class="logo">` : ''}
            <h2>${companyInfo.name}</h2>
            <p>${companyInfo.address.replace(/\n/g, '<br>')}</p>
            <p>Phone: ${companyInfo.phone}</p>
            <p>Email: ${companyInfo.email}</p>
            <p>Web: ${companyInfo.website}</p>
        </div>
        <div class="company-info">
            <h2>LOGISTICS QUOTE</h2>
            <p><strong>Quote #:</strong> ${quote.quoteNumber}</p>
            <p><strong>Date:</strong> ${new Date(quote.date).toLocaleDateString()}</p>
            <p><strong>Valid Until:</strong> ${new Date(quote.validUntil).toLocaleDateString()}</p>
        </div>
    </div>

    <div class="details-grid">
        <div class="section">
            <h3>Customer Information</h3>
            <p><strong>Company:</strong> ${quote.customerInfo.companyName}</p>
            <p><strong>Contact:</strong> ${quote.customerInfo.contactName}</p>
            <p><strong>Email:</strong> ${quote.customerInfo.email}</p>
            <p><strong>Phone:</strong> ${quote.customerInfo.phone}</p>
            <p><strong>Address:</strong> ${quote.customerInfo.address}</p>
        </div>
        
        <div class="section">
            <h3>Shipment Details</h3>
            <p><strong>Origin:</strong> ${quote.shipmentDetails.origin}</p>
            <p><strong>Destination:</strong> ${quote.shipmentDetails.destination}</p>
            <p><strong>Mode:</strong> ${quote.shipmentDetails.mode.toUpperCase()}</p>
            <p><strong>Commodity:</strong> ${quote.shipmentDetails.commodity}</p>
            <p><strong>Weight:</strong> ${quote.shipmentDetails.weight}</p>
            <p><strong>Dimensions:</strong> ${quote.shipmentDetails.dimensions}</p>
            <p><strong>Incoterms:</strong> ${quote.shipmentDetails.incoterms}</p>
        </div>
    </div>

    <table class="items-table">
        <thead>
            <tr>
                <th>Description</th>
                <th>Quantity</th>
                <th>Rate</th>
                <th>Amount</th>
            </tr>
        </thead>
        <tbody>
            ${quote.items.map(item => `
                <tr>
                    <td>${item.description}</td>
                    <td>${item.quantity}</td>
                    <td>$${item.rate.toLocaleString()}</td>
                    <td>$${item.amount.toLocaleString()}</td>
                </tr>
            `).join('')}
        </tbody>
    </table>

    <div class="totals">
        <table>
            <tr>
                <td>Subtotal:</td>
                <td>$${quote.subtotal.toLocaleString()}</td>
            </tr>
            <tr>
                <td>Taxes (8%):</td>
                <td>$${quote.taxes.toLocaleString()}</td>
            </tr>
            <tr class="total-row">
                <td>TOTAL:</td>
                <td>$${quote.total.toLocaleString()}</td>
            </tr>
        </table>
    </div>

    ${quote.notes ? `
        <div class="notes">
            <h3>Notes</h3>
            <p>${quote.notes}</p>
        </div>
    ` : ''}

    <div class="terms">
        <h3>Terms & Conditions</h3>
        <p>${quote.terms}</p>
    </div>

    <div class="footer">
        <p>This quote is valid until ${new Date(quote.validUntil).toLocaleDateString()}. All rates are subject to change based on final shipment details.</p>
        <p>Thank you for choosing ${companyInfo.name} for your logistics needs.</p>
    </div>
</body>
</html>`;
  };

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'ocean': return Ship;
      case 'air': return Plane;
      case 'truck': return Truck;
      default: return Package;
    }
  };

  const ModeIcon = getModeIcon(quote.shipmentDetails.mode);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <FileText className="w-8 h-8 text-indigo-600" />
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Quote Generator</h2>
          <p className="text-gray-600">Create professional logistics quotes</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Quote Form */}
        <div className="space-y-6">
          {/* Quote Header */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quote Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quote Number</label>
                <input
                  type="text"
                  value={quote.quoteNumber}
                  onChange={(e) => setQuote(prev => ({ ...prev, quoteNumber: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Valid Until</label>
                <input
                  type="date"
                  value={quote.validUntil}
                  onChange={(e) => setQuote(prev => ({ ...prev, validUntil: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Company Name *"
                value={quote.customerInfo.companyName}
                onChange={(e) => handleCustomerChange('companyName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Contact Name"
                  value={quote.customerInfo.contactName}
                  onChange={(e) => handleCustomerChange('contactName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={quote.customerInfo.email}
                  onChange={(e) => handleCustomerChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <input
                type="tel"
                placeholder="Phone"
                value={quote.customerInfo.phone}
                onChange={(e) => handleCustomerChange('phone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <textarea
                placeholder="Address"
                value={quote.customerInfo.address}
                onChange={(e) => handleCustomerChange('address', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Shipment Details */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Shipment Details</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Origin *"
                  value={quote.shipmentDetails.origin}
                  onChange={(e) => handleShipmentChange('origin', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <input
                  type="text"
                  placeholder="Destination *"
                  value={quote.shipmentDetails.destination}
                  onChange={(e) => handleShipmentChange('destination', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              
              <div className="grid grid-cols-4 gap-2">
                {[
                  { value: 'ocean', icon: Ship, label: 'Ocean' },
                  { value: 'air', icon: Plane, label: 'Air' },
                  { value: 'truck', icon: Truck, label: 'Truck' },
                  { value: 'rail', icon: Package, label: 'Rail' }
                ].map(mode => (
                  <button
                    key={mode.value}
                    onClick={() => handleShipmentChange('mode', mode.value)}
                    className={`flex items-center justify-center gap-1 p-2 rounded-lg border transition-colors ${
                      quote.shipmentDetails.mode === mode.value
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <mode.icon className="w-4 h-4" />
                    <span className="text-xs font-medium">{mode.label}</span>
                  </button>
                ))}
              </div>

              <input
                type="text"
                placeholder="Commodity"
                value={quote.shipmentDetails.commodity}
                onChange={(e) => handleShipmentChange('commodity', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              
              <div className="grid grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Weight"
                  value={quote.shipmentDetails.weight}
                  onChange={(e) => handleShipmentChange('weight', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <input
                  type="text"
                  placeholder="Dimensions"
                  value={quote.shipmentDetails.dimensions}
                  onChange={(e) => handleShipmentChange('dimensions', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <select
                  value={quote.shipmentDetails.incoterms}
                  onChange={(e) => handleShipmentChange('incoterms', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="FOB">FOB</option>
                  <option value="CIF">CIF</option>
                  <option value="EXW">EXW</option>
                  <option value="DDP">DDP</option>
                  <option value="DDU">DDU</option>
                </select>
              </div>
            </div>
          </div>

          {/* Quote Items */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Quote Items</h3>
              <button
                onClick={addItem}
                className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Add Item
              </button>
            </div>
            
            <div className="space-y-3">
              {quote.items.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-5">
                    <input
                      type="text"
                      placeholder="Description"
                      value={item.description}
                      onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                      className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 0)}
                      className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      placeholder="Rate"
                      value={item.rate}
                      onChange={(e) => handleItemChange(index, 'rate', parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                    />
                  </div>
                  <div className="col-span-2">
                    <div className="px-2 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">
                      ${item.amount.toLocaleString()}
                    </div>
                  </div>
                  <div className="col-span-1">
                    {quote.items.length > 1 && (
                      <button
                        onClick={() => removeItem(index)}
                        className="w-full px-2 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="mt-4 bg-gray-50 rounded-lg p-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${quote.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxes (8%):</span>
                  <span>${quote.taxes.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-300">
                  <span>Total:</span>
                  <span className="text-indigo-600">${quote.total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes and Terms */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
              <textarea
                value={quote.notes}
                onChange={(e) => setQuote(prev => ({ ...prev, notes: e.target.value }))}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Additional notes or special instructions..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Terms & Conditions</label>
              <textarea
                value={quote.terms}
                onChange={(e) => setQuote(prev => ({ ...prev, terms: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Preview & Actions */}
        <div className="space-y-6">
          {/* Company Branding */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Branding</h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Logo Upload</label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                    id="logo-upload"
                  />
                  <label
                    htmlFor="logo-upload"
                    className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    Choose Logo
                  </label>
                  {companyInfo.logo && (
                    <img src={companyInfo.logo} alt="Logo preview" className="h-8 w-auto" />
                  )}
                </div>
              </div>
              
              <input
                type="text"
                placeholder="Company Name"
                value={companyInfo.name}
                onChange={(e) => setCompanyInfo(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              
              <textarea
                placeholder="Company Address"
                value={companyInfo.address}
                onChange={(e) => setCompanyInfo(prev => ({ ...prev, address: e.target.value }))}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="tel"
                  placeholder="Phone"
                  value={companyInfo.phone}
                  onChange={(e) => setCompanyInfo(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={companyInfo.email}
                  onChange={(e) => setCompanyInfo(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Quote Preview */}
          <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Quote Preview</h3>
              <ModeIcon className="w-6 h-6 text-indigo-600" />
            </div>
            
            <div className="space-y-4 text-sm">
              <div className="flex justify-between pb-2 border-b border-gray-200">
                <span className="font-medium">Quote #{quote.quoteNumber}</span>
                <span>{new Date(quote.date).toLocaleDateString()}</span>
              </div>
              
              <div>
                <div className="font-medium text-gray-900">{quote.customerInfo.companyName}</div>
                <div className="text-gray-600">{quote.customerInfo.contactName}</div>
              </div>
              
              <div className="bg-gray-50 p-3 rounded">
                <div className="font-medium mb-1">
                  {quote.shipmentDetails.origin} → {quote.shipmentDetails.destination}
                </div>
                <div className="text-gray-600">
                  Mode: {quote.shipmentDetails.mode.toUpperCase()} | {quote.shipmentDetails.commodity}
                </div>
              </div>
              
              <div className="space-y-1">
                {quote.items.slice(0, 3).map((item, index) => (
                  <div key={index} className="flex justify-between">
                    <span>{item.description}</span>
                    <span>${item.amount.toLocaleString()}</span>
                  </div>
                ))}
                {quote.items.length > 3 && (
                  <div className="text-gray-500">...and {quote.items.length - 3} more items</div>
                )}
              </div>
              
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                <span>Total:</span>
                <span className="text-indigo-600">${quote.total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={exportToPDF}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
            >
              <Download className="w-5 h-5" />
              Export Quote
            </button>
            
            <button
              onClick={emailQuote}
              disabled={!quote.customerInfo.email}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
            >
              <Mail className="w-5 h-5" />
              Email Quote
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}