import { ArrowLeft, User, Building2, Mail, Phone, Globe, MapPin, Save, Upload } from 'lucide-react'
import Link from 'next/link'

export default function NewContactPage() {
  return (
    <div className="min-h-full">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Link 
              href="/dashboard/crm" 
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Add New Contact</h1>
              <p className="text-gray-600">Create a new contact in your CRM system</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-sky-50 to-blue-50">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-sky-400 to-blue-500 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Contact Information</h2>
                <p className="text-sm text-gray-600">Fill in the contact details below</p>
              </div>
            </div>
          </div>

          <form className="p-6 space-y-6">
            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none"
                    placeholder="Enter first name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none"
                    placeholder="Enter last name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none"
                      placeholder="contact@company.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="tel"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Company Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company Name *</label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none"
                      placeholder="Company name"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Job Title</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none"
                    placeholder="e.g. Logistics Manager"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company Website</label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="url"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none"
                      placeholder="https://company.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Industry</label>
                  <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none">
                    <option value="">Select industry</option>
                    <option value="logistics">Logistics & Transportation</option>
                    <option value="manufacturing">Manufacturing</option>
                    <option value="retail">Retail</option>
                    <option value="automotive">Automotive</option>
                    <option value="electronics">Electronics</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Location */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Location</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none"
                      placeholder="United States"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none"
                    placeholder="New York"
                  />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
              <textarea
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none"
                placeholder="Add any additional notes about this contact..."
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <button
                type="button"
                className="flex items-center px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Upload className="w-4 h-4 mr-2" />
                Import from CSV
              </button>
              <div className="flex items-center space-x-3">
                <Link
                  href="/dashboard/crm"
                  className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  className="flex items-center px-6 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Contact
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}