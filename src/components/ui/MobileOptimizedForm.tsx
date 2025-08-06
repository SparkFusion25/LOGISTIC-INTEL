'use client';

import React, { useState } from 'react';
import { ChevronDown, Search, Filter, X } from 'lucide-react';

interface FormField {
  id: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'number';
  placeholder?: string;
  options?: { value: string; label: string; }[];
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  mobileHidden?: boolean;
}

interface MobileOptimizedFormProps {
  fields: FormField[];
  onSubmit?: () => void;
  submitLabel?: string;
  showAdvanced?: boolean;
  onToggleAdvanced?: () => void;
  className?: string;
  loading?: boolean;
}

const MobileOptimizedForm: React.FC<MobileOptimizedFormProps> = ({
  fields,
  onSubmit,
  submitLabel = 'Search',
  showAdvanced = false,
  onToggleAdvanced,
  className = '',
  loading = false
}) => {
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const primaryFields = fields.filter(field => !field.mobileHidden);
  const advancedFields = fields.filter(field => field.mobileHidden);

  const renderField = (field: FormField, isMobile = false) => {
    const inputClasses = `
      w-full px-4 py-3 border border-gray-300 rounded-lg 
      focus:ring-2 focus:ring-indigo-500 focus:border-transparent 
      transition-colors text-base
      ${isMobile ? 'text-16' : ''}
    `;

    switch (field.type) {
      case 'select':
        return (
          <div key={field.id} className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="relative">
              <select
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
                className={`${inputClasses} appearance-none pr-12`}
                required={field.required}
              >
                <option value="">{field.placeholder || `Select ${field.label}`}</option>
                {field.options?.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>
        );

      case 'date':
        return (
          <div key={field.id}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="date"
              value={field.value}
              onChange={(e) => field.onChange(e.target.value)}
              className={inputClasses}
              required={field.required}
            />
          </div>
        );

      case 'number':
        return (
          <div key={field.id}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="number"
              value={field.value}
              onChange={(e) => field.onChange(e.target.value)}
              placeholder={field.placeholder}
              className={inputClasses}
              required={field.required}
            />
          </div>
        );

      default:
        return (
          <div key={field.id}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="text"
              value={field.value}
              onChange={(e) => field.onChange(e.target.value)}
              placeholder={field.placeholder}
              className={inputClasses}
              required={field.required}
            />
          </div>
        );
    }
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}>
      {/* Mobile Header */}
      <div className="lg:hidden p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Search Filters</h3>
          <button
            onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
          >
            <Filter className="w-4 h-4" />
            {isMobileFiltersOpen ? 'Hide' : 'Show'} Filters
          </button>
        </div>
      </div>

      {/* Desktop Form */}
      <div className="hidden lg:block p-6">
        <form onSubmit={(e) => { e.preventDefault(); onSubmit?.(); }}>
          {/* Primary Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
            {primaryFields.map(field => renderField(field))}
          </div>

          {/* Advanced Fields Toggle */}
          {advancedFields.length > 0 && (
            <div className="mb-6">
              <button
                type="button"
                onClick={onToggleAdvanced}
                className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                <ChevronDown className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
                {showAdvanced ? 'Hide' : 'Show'} Advanced Filters
              </button>
            </div>
          )}

          {/* Advanced Fields */}
          {showAdvanced && advancedFields.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
              {advancedFields.map(field => renderField(field))}
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-lg font-medium transition-colors"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Searching...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  {submitLabel}
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Mobile Form */}
      <div className={`lg:hidden ${isMobileFiltersOpen ? 'block' : 'hidden'}`}>
        <form onSubmit={(e) => { e.preventDefault(); onSubmit?.(); }} className="p-4 space-y-4">
          {/* All Fields in Mobile */}
          {fields.map(field => renderField(field, true))}

          {/* Mobile Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-lg font-medium transition-colors text-base"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Searching...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  {submitLabel}
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Mobile Quick Search (Always Visible) */}
      <div className="lg:hidden p-4">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Quick search..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-base"
            />
          </div>
          <button
            onClick={onSubmit}
            disabled={loading}
            className="px-4 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-lg transition-colors"
          >
            <Search className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileOptimizedForm;