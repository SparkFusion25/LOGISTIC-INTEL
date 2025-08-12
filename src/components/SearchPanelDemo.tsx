if (result.success) {
        addNotification('Insight email sent successfully!', 'success');
      } else {
        addNotification(result.message || 'Failed to send email', 'error');
      }
    } catch (error) {
      console.error('Email error:', error);
      addNotification('Failed to send email', 'error');
    } finally {
      setOperationLoading(prev => ({ ...prev, [opKey]: false }));
    }
  };

  const toggleCompanyExpansion = (companyName: string, section = '') => {
    const key = companyName + section;
    const newExpanded = new Set(expandedCompanies);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedCompanies(newExpanded);
  };

  const mapShipments = companies.flatMap(company => 
    company.shipments?.map(s => ({
      company: company.company_name,
      origin: s.port_of_lading || s.port_of_loading,
      destination: s.port_of_discharge,
      type: s.shipment_type || 'ocean',
      value: s.value_usd
    })) || []
  );

  const getConfidenceColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getModeColor = (mode: 'ocean' | 'air' | 'mixed' | undefined) => {
    if (!mode) return 'bg-gray-100 text-gray-800';
    if (mode === 'ocean') return 'bg-blue-100 text-blue-800';
    if (mode === 'air') return 'bg-sky-100 text-sky-800';
    return 'bg-purple-100 text-purple-800';
  };

  const getPlanFeatures = () => {
    const features: Record<'trial' | 'starter' | 'pro' | 'enterprise', {
      maxSearches: number;
      hasContacts: boolean;
      hasEmail: boolean;
      hasMap: boolean;
    }> = {
      trial: { maxSearches: 10, hasContacts: false, hasEmail: false, hasMap: false },
      starter: { maxSearches: 100, hasContacts: false, hasEmail: false, hasMap: true },
      pro: { maxSearches: 1000, hasContacts: true, hasEmail: true, hasMap: true },
      enterprise: { maxSearches: Infinity, hasContacts: true, hasEmail: true, hasMap: true }
    };
    return features[userPlan] || features.trial;
  };

  const planFeatures = getPlanFeatures();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Company Detail Modal */}
      <CompanyDetailModal
        company={selectedCompany}
        isOpen={isCompanyModalOpen}
        onClose={() => setIsCompanyModalOpen(false)}
        onAddToCRM={handleAddToCRM}
        onSendEmail={handleSendInsight}
        userPlan={userPlan}
        isAddingToCRM={operationLoading[`crm_${selectedCompany?.company_name}`] || false}
        isSendingEmail={operationLoading[`email_${selectedCompany?.company_name}`] || false}
      />

      {/* Mobile Navigation */}
      <div className="lg:hidden bg-white shadow-sm p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Globe className="w-5 h-5 text-indigo-600" />
            Trade Intelligence
          </h1>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-gray-600"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
        
        {mobileMenuOpen && (
          <div className="mt-4 space-y-4 border-t pt-4">
            <div className="flex gap-2">
              {['cards', 'map', 'table'].map(mode => (
                <button
                  key={mode}
                  onClick={() => {
                    if (mode === 'map' && !planFeatures.hasMap) {
                      addNotification('Map view requires Pro plan or higher', 'error');
                      return;
                    }
                    setViewMode(mode);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex-1 p-2 rounded text-sm ${viewMode === mode ? 'bg-indigo-100 text-indigo-600' : 'text-gray-500 bg-gray-100'}`}
                  disabled={mode === 'map' && !planFeatures.hasMap}
                >
                  {mode === 'cards' && <><Building2 className="w-4 h-4 mx-auto mb-1" />Cards</>}
                  {mode === 'map' && (
                    <>
                      <MapPin className="w-4 h-4 mx-auto mb-1" />
                      Map {!planFeatures.hasMap && <Lock className="w-3 h-3 inline ml-1" />}
                    </>
                  )}
                  {mode === 'table' && <><BarChart3 className="w-4 h-4 mx-auto mb-1" />Table</>}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto p-4 space-y-6">
        
        {/* Desktop Header */}
        <div className="hidden lg:block bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Globe className="w-6 h-6 text-indigo-600" />
                Global Trade Intelligence Platform
              </h1>
              <p className="text-gray-600 mt-1">
                Search shipments, analyze trends, and connect with decision makers
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm">
                <span className="text-gray-500">Plan: </span>
                <span className="font-semibold text-indigo-600">{userPlan.toUpperCase()}</span>
              </span>
              <div className="flex gap-2">
                {['cards', 'map', 'table'].map(mode => (
                  <button
                    key={mode}
                    onClick={() => {
                      if (mode === 'map' && !planFeatures.hasMap) {
                        addNotification('Map view requires Pro plan or higher', 'error');
                        return;
                      }
                      setViewMode(mode);
                    }}
                    className={`p-2 rounded ${viewMode === mode ? 'bg-indigo-100 text-indigo-600' : 'text-gray-500'}`}
                    disabled={mode === 'map' && !planFeatures.hasMap}
                  >
                    {mode === 'cards' && <Building2 className="w-5 h-5" />}
                    {mode === 'map' && (
                      <div className="relative">
                        <MapPin className="w-5 h-5" />
                        {!planFeatures.hasMap && <Lock className="w-3 h-3 absolute -top-1 -right-1" />}
                      </div>
                    )}
                    {mode === 'table' && <BarChart3 className="w-5 h-5" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Search Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 lg:p-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
              <input
                type="text"
                placeholder="Company name..."
                value={searchFilters.company}
                onChange={(e) => setSearchFilters({...searchFilters, company: e.target.value})}
                className="px-3 py-2 lg:px-4 lg:py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm lg:text-base"
              />
              <input
                type="text"
                placeholder="Origin country..."
                value={searchFilters.originCountry}
                onChange={(e) => setSearchFilters({...searchFilters, originCountry: e.target.value})}
                className="px-3 py-2 lg:px-4 lg:py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm lg:text-base"
              />
              <input
                type="text"
                placeholder="Destination country..."
                value={searchFilters.destinationCountry}
                onChange={(e) => setSearchFilters({...searchFilters, destinationCountry: e.target.value})}
                className="px-3 py-2 lg:px-4 lg:py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm lg:text-base"
              />
              <input
                type="text"
                placeholder="HS Code or commodity..."
                value={searchFilters.commodity}
                onChange={(e) => setSearchFilters({...searchFilters, commodity: e.target.value})}
                className="px-3 py-2 lg:px-4 lg:py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm lg:text-base"
              />
            </div>
            
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <div className="flex flex-wrap gap-2">
                {['all', 'ocean', 'air'].map(mode => (
                  <button
                    key={mode}
                    onClick={() => setFilterMode(mode)}
                    className={`px-3 py-2 lg:px-4 lg:py-2 rounded-lg font-medium text-sm lg:text-base ${
                      filterMode === mode ? 'bg-indigo-600 text-white' : 'bg-gray-100'
                    }`}
                  >
                    {mode === 'all' && 'All Modes'}
                    {mode === 'ocean' && (
                      <span className="flex items-center gap-2">
                        <Ship className="w-4 h-4" />
                        Ocean
                      </span>
                    )}
                    {mode === 'air' && (
                      <span className="flex items-center gap-2">
                        <Plane className="w-4 h-4" />
                        Air
                      </span>
                    )}
                  </button>
                ))}
              </div>
              
              <button
                onClick={handleSearch}
                disabled={loading}
                className="px-4 py-2 lg:px-6 lg:py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2 text-sm lg:text-base"
              >
                {loading ? (
                  <>
                    <Loader className="w-4 h-4 lg:w-5 lg:h-5 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 lg:w-5 lg:h-5" />
                    Search
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Notifications */}
        {notifications.length > 0 && (
          <div className="fixed top-4 right-4 z-40 space-y-2">
            {notifications.map(notification => (
              <div
                key={notification.id}
                className={`p-3 rounded-lg shadow-lg flex items-center gap-2 ${
                  notification.type === 'success' ? 'bg-green-100 text-green-800' :
                  notification.type === 'error' ? 'bg-red-100 text-red-800' :
                  'bg-blue-100 text-blue-800'
                }`}
              >
                {notification.type === 'success' && <CheckCircle className="w-4 h-4" />}
                {notification.type === 'error' && <AlertCircle className="w-4 h-4" />}
                {notification.type === 'info' && <Eye className="w-4 h-4" />}
                <span className="text-sm">{notification.message}</span>
              </div>
            ))}
          </div>
        )}

        {/* Map View */}
        {viewMode === 'map' && planFeatures.hasMap && (
          <div className="bg-white rounded-lg shadow-sm p-4 lg:p-6">
            <h3 className="text-lg font-semibold mb-4">Interactive Shipment Routes</h3>
            <div className="h-[300px] lg:h-[500px] bg-slate-900 rounded-lg relative overflow-hidden">
              <div className="absolute inset-0 opacity-20">
                <div className="grid grid-cols-8 lg:grid-cols-12 gap-2 lg:gap-4 p-4">
                  {[...Array(32)].map((_, i) => (
                    <div key={i} className="w-1 h-1 lg:w-2 lg:h-2 bg-indigo-500 rounded-full animate-pulse" />
                  ))}
                </div>
              </div>
              
              <svg className="absolute inset-0 w-full h-full">
                {mapShipments.slice(0, 10).map((shipment, idx) => {
                  const startX = 10 + (idx * 15) % 80;
                  const startY = 20 + (idx * 10) % 40;
                  const endX = 20 + ((idx + 1) * 20) % 70;
                  const endY = 60 + (idx * 5) % 30;
                  
                  return (
                    <g key={idx}>
                      <path
                        d={`M ${startX}% ${startY}% Q 50% 50% ${endX}% ${endY}%`}
                        fill="none"
                        stroke={shipment.type === 'air' ? '#0ea5e9' : '#3b82f6'}
                        strokeWidth="2"
                        opacity="0.6"
                      />
                      <circle cx={`${startX}%`} cy={`${startY}%`} r="3" fill="#10b981" />
                      <circle cx={`${endX}%`} cy={`${endY}%`} r="3" fill="#f59e0b" />
                    </g>
                  );
                })}
              </svg>
              
              <div className="absolute bottom-4 left-4 bg-white/90 rounded-lg p-3">
                <h4 className="font-semibold text-sm mb-2">Active Routes</h4>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span>Origin Ports</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                    <span>Destination Ports</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Cards View */}
        {viewMode === 'cards' && (
          <div className="space-y-4">
            {!hasSearched && companies.length === 0 ? (
              <div className="text-center py-16 lg:py-24 text-gray-400">
                <Search className="w-12 h-12 lg:w-16 lg:h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg lg:text-xl">Start your search above to find companies</p>
                <p className="text-sm lg:text-base mt-2">Or browse recent trade activity below</p>
              </div>
            ) : loading ? (
              <div className="text-center py-16 lg:py-24">
                <Loader className="w-8 h-8 lg:w-12 lg:h-12 mx-auto mb-4 animate-spin text-indigo-600" />
                <p className="text-gray-600">Searching trade database...</p>
              </div>
            ) : companies.length === 0 ? (
              <div className="text-center py-16 lg:py-24 text-gray-400">
                <AlertCircle className="w-12 h-12 lg:w-16 lg:h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg lg:text-xl">No results found</p>
                <p className="text-sm lg:text-base mt-2">Try adjusting your search criteria or check spelling</p>
              </div>
            ) : (
              companies.map(company => (
                <div 
                  key={company.company_name} 
                  className="bg-white rounded-lg shadow-sm border cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleCompanyClick(company)}
                >
                  <div className="p-4 lg:p-6">
                    {/* Company Header */}
                    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4 mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg lg:text-xl font-bold text-gray-900 flex items-center gap-2">
                          <Building2 className="w-4 h-4 lg:w-5 lg:h-5" />
                          {company.company_name}
                          {company.is_in_crm && (
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                              ✓ In CRM
                            </span>
                          )}
                        </h3>
                        <div className="flex items-center gap-2">
                          <div className="w-12 lg:w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className="h-2 rounded-full bg-green-500"
                              style={{ width: `${company.confidence_score || 0}%` }}
                            />
                          </div>
                          <span className="text-xs">{company.confidence_score || 0}%</span>
                        </div>
                      </td>
                      <td className="px-3 py-4 lg:px-6" onClick={(e) => e.stopPropagation()}>
                        <div className="flex flex-col lg:flex-row gap-1 lg:gap-2">
                          <button 
                            onClick={() => handleAddToCRM(company)}
                            disabled={company.is_in_crm}
                            className="text-indigo-600 hover:text-indigo-700 text-xs font-medium disabled:opacity-50"
                          >
                            {company.is_in_crm ? 'In CRM' : 'Add CRM'}
                          </button>
                          <button 
                            onClick={() => handleSendInsight(company)}
                            disabled={!planFeatures.hasEmail || !company.is_in_crm}
                            className="text-green-600 hover:text-green-700 text-xs font-medium disabled:opacity-50"
                          >
                            Send
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPanelDemo; flex-wrap items-center gap-2 lg:gap-3 mt-2">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getModeColor(company.shipment_mode)}`}>
                            {company.shipment_mode === 'ocean' && <Ship className="w-3 h-3" />}
                            {company.shipment_mode === 'air' && <Plane className="w-3 h-3" />}
                            {company.shipment_mode === 'mixed' && <Globe className="w-3 h-3" />}
                            {company.shipment_mode?.toUpperCase() || 'UNKNOWN'}
                          </span>
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(company.confidence_score || 0)}`}>
                            <TrendingUp className="w-3 h-3" />
                            {company.confidence_score || 0}% Confidence
                          </span>
                          <span className="text-xs text-gray-500">
                            Click to view details & trends
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-2" onClick={(e) => e.stopPropagation()}>
                        <button 
                          onClick={() => handleAddToCRM(company)}
                          disabled={operationLoading[`crm_${company.company_name}`] || company.is_in_crm}
                          className="px-3 py-2 lg:px-4 lg:py-2 bg-indigo-600 text-white text-xs lg:text-sm rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          {operationLoading[`crm_${company.company_name}`] ? (
                            <Loader className="w-3 h-3 lg:w-4 lg:h-4 animate-spin" />
                          ) : (
                            <Plus className="w-3 h-3 lg:w-4 lg:h-4" />
                          )}
                          {company.is_in_crm ? 'Added to CRM' : 'Add to CRM'}
                        </button>
                        <button 
                          onClick={() => handleSendInsight(company)}
                          disabled={!planFeatures.hasEmail || operationLoading[`email_${company.company_name}`] || !company.is_in_crm}
                          className="px-3 py-2 lg:px-4 lg:py-2 bg-green-600 text-white text-xs lg:text-sm rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          {operationLoading[`email_${company.company_name}`] ? (
                            <Loader className="w-3 h-3 lg:w-4 lg:h-4 animate-spin" />
                          ) : (
                            <>
                              <Send className="w-3 h-3 lg:w-4 lg:h-4" />
                              {(!planFeatures.hasEmail || !company.is_in_crm) && <Lock className="w-3 h-3" />}
                            </>
                          )}
                          Send Insight
                        </button>
                      </div>
                    </div>
                    
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-4">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-gray-600 mb-1">
                          <Package className="w-3 h-3 lg:w-4 lg:h-4" />
                          <span className="text-xs lg:text-sm">Shipments</span>
                        </div>
                        <p className="text-lg lg:text-xl font-bold">{company.total_shipments || 0}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-gray-600 mb-1">
                          <DollarSign className="w-3 h-3 lg:w-4 lg:h-4" />
                          <span className="text-xs lg:text-sm">Value</span>
                        </div>
                        <p className="text-lg lg:text-xl font-bold">${((company.total_value_usd || 0) / 1000000).toFixed(1)}M</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-gray-600 mb-1">
                          <Activity className="w-3 h-3 lg:w-4 lg:h-4" />
                          <span className="text-xs lg:text-sm">Weight</span>
                        </div>
                        <p className="text-lg lg:text-xl font-bold">{((company.total_weight_kg || 0) / 1000).toFixed(0)}T</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-gray-600 mb-1">
                          <Calendar className="w-3 h-3 lg:w-4 lg:h-4" />
                          <span className="text-xs lg:text-sm">Latest</span>
                        </div>
                        <p className="text-xs lg:text-sm font-medium">{company.last_arrival || 'N/A'}</p>
                      </div>
                    </div>
                    
                    {/* Quick Shipments Preview */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                        <Ship className="w-4 h-4 text-indigo-600" />
                        Recent Shipments ({company.shipments?.length || 0})
                      </h4>
                      {company.shipments && company.shipments.length > 0 ? (
                        <div className="space-y-2">
                          {company.shipments.slice(0, 3).map((shipment, idx) => (
                            <div key={idx} className="flex justify-between items-center text-sm bg-white rounded p-2">
                              <div className="flex items-center gap-2">
                                {shipment.shipment_type === 'air' ? (
                                  <Plane className="w-3 h-3 text-blue-500" />
                                ) : (
                                  <Ship className="w-3 h-3 text-teal-500" />
                                )}
                                <span className="font-mono text-xs">{shipment.bol_number || 'N/A'}</span>
                              </div>
                              <div className="text-right">
                                <div className="font-medium text-green-600">
                                  ${((shipment.value_usd || 0) / 1000).toFixed(0)}K
                                </div>
                                <div className="text-xs text-gray-500">{shipment.arrival_date}</div>
                              </div>
                            </div>
                          ))}
                          {company.shipments.length > 3 && (
                            <p className="text-xs text-gray-500 text-center pt-2">
                              +{company.shipments.length - 3} more shipments - Click to view all
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">No recent shipments available</p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Table View */}
        {viewMode === 'table' && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-3 py-3 lg:px-6 text-left text-xs font-medium text-gray-700">Company</th>
                    <th className="px-3 py-3 lg:px-6 text-left text-xs font-medium text-gray-700">Mode</th>
                    <th className="px-3 py-3 lg:px-6 text-left text-xs font-medium text-gray-700">Shipments</th>
                    <th className="px-3 py-3 lg:px-6 text-left text-xs font-medium text-gray-700">Value</th>
                    <th className="px-3 py-3 lg:px-6 text-left text-xs font-medium text-gray-700 hidden lg:table-cell">Weight</th>
                    <th className="px-3 py-3 lg:px-6 text-left text-xs font-medium text-gray-700 hidden lg:table-cell">Confidence</th>
                    <th className="px-3 py-3 lg:px-6 text-left text-xs font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {companies.map(company => (
                    <tr 
                      key={company.company_name} 
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleCompanyClick(company)}
                    >
                      <td className="px-3 py-4 lg:px-6">
                        <div className="flex items-center">
                          <Building2 className="w-3 h-3 lg:w-4 lg:h-4 text-gray-400 mr-2" />
                          <span className="font-medium text-xs lg:text-sm truncate max-w-[120px] lg:max-w-none">
                            {company.company_name}
                          </span>
                          {company.is_in_crm && (
                            <span className="ml-2 bg-green-100 text-green-800 px-1 py-0.5 rounded text-xs">
                              CRM
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-4 lg:px-6">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getModeColor(company.shipment_mode)}`}>
                          {company.shipment_mode?.toUpperCase() || 'UNKNOWN'}
                        </span>
                      </td>
                      <td className="px-3 py-4 lg:px-6 text-xs lg:text-sm">{company.total_shipments || 0}</td>
                      <td className="px-3 py-4 lg:px-6 text-xs lg:text-sm font-medium text-green-600">
                        ${((company.total_value_usd || 0) / 1000000).toFixed(1)}M
                      </td>
                      <td className="px-3 py-4 lg:px-6 text-xs lg:text-sm hidden lg:table-cell">
                        {((company.total_weight_kg || 0) / 1000).toFixed(0)}T
                      </td>
                      <td className="px-3 py-4 lg:px-6 hidden lg:table-cell">
                        <div className="flex'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, TrendingUp, Ship, Plane, Globe, Building2, 
  Package, MapPin, Calendar, DollarSign, Users, Plus, Lock,
  ChevronDown, ChevronUp, Mail, Phone, BarChart3, Activity, Send,
  Menu, X, Eye, AlertCircle, CheckCircle, Loader, LineChart,
  TrendingDown, Zap, Clock, Target
} from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface ShipmentDetail {
  id?: string;
  bol_number: string | null;
  arrival_date: string;
  vessel_name: string | null;
  gross_weight_kg?: number;
  weight_kg?: number;
  value_usd: number;
  port_of_loading: string | null;
  port_of_lading: string | null;
  port_of_discharge: string | null;
  hs_code: string | null;
  shipment_type: 'ocean' | 'air';
  goods_description?: string | null;
  departure_date?: string | null;
  unified_id?: string;
  origin_country?: string;
  destination_country?: string;
}

interface Contact {
  id?: string;
  full_name: string;
  email: string;
  title: string;
  phone?: string;
  linkedin_url?: string;
  company_id?: string;
  is_enriched?: boolean;
}

interface SeasonalTrend {
  month: string;
  shipments: number;
  value_usd: number;
  weight_kg: number;
  season: 'high' | 'medium' | 'low';
}

interface Company {
  id?: string;
  company_name: string;
  shipment_mode: 'ocean' | 'air' | 'mixed' | undefined;
  total_shipments: number;
  total_weight_kg: number;
  total_value_usd: number;
  confidence_score: number;
  first_arrival: string;
  last_arrival: string;
  shipments: ShipmentDetail[];
  contacts?: Contact[];
  seasonal_trends?: SeasonalTrend[];
  primary_commodities?: string[];
  top_routes?: Array<{origin: string, destination: string, frequency: number}>;
  is_in_crm?: boolean;
  crm_added_date?: string;
}

interface CompanyModalProps {
  company: Company | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCRM: (company: Company) => void;
  onSendEmail: (company: Company) => void;
  userPlan: string;
  isAddingToCRM: boolean;
  isSendingEmail: boolean;
}

const CompanyDetailModal: React.FC<CompanyModalProps> = ({
  company,
  isOpen,
  onClose,
  onAddToCRM,
  onSendEmail,
  userPlan,
  isAddingToCRM,
  isSendingEmail
}) => {
  const [selectedTrendPeriod, setSelectedTrendPeriod] = useState<'3m' | '6m' | '12m'>('12m');
  
  if (!isOpen || !company) return null;

  const hasAccess = userPlan === 'pro' || userPlan === 'enterprise';
  const canViewContacts = hasAccess && company.is_in_crm;

  const generateSeasonalData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.map(month => ({
      month,
      shipments: Math.floor(Math.random() * 50) + 5,
      value_usd: Math.floor(Math.random() * 5000000) + 500000,
      weight_kg: Math.floor(Math.random() * 100000) + 10000,
      season: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low' as 'high' | 'medium' | 'low'
    }));
  };

  const seasonalData = company.seasonal_trends || generateSeasonalData();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-indigo-50 to-blue-50">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <Building2 className="w-6 h-6 text-indigo-600" />
              {company.company_name}
            </h2>
            <div className="flex items-center gap-3 mt-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                company.shipment_mode === 'ocean' ? 'bg-blue-100 text-blue-800' :
                company.shipment_mode === 'air' ? 'bg-sky-100 text-sky-800' :
                'bg-purple-100 text-purple-800'
              }`}>
                {company.shipment_mode?.toUpperCase() || 'MIXED'}
              </span>
              <span className="text-sm text-gray-600">
                Confidence: {company.confidence_score || 0}%
              </span>
              {company.is_in_crm && (
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                  ✓ In CRM
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => onAddToCRM(company)}
              disabled={isAddingToCRM || company.is_in_crm}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
            >
              {isAddingToCRM ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              {company.is_in_crm ? 'Added to CRM' : 'Add to CRM'}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-blue-600 mb-2">
                <Package className="w-4 h-4" />
                <span className="text-sm font-medium">Total Shipments</span>
              </div>
              <p className="text-2xl font-bold text-blue-900">{company.total_shipments || 0}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-600 mb-2">
                <DollarSign className="w-4 h-4" />
                <span className="text-sm font-medium">Total Value</span>
              </div>
              <p className="text-2xl font-bold text-green-900">
                ${((company.total_value_usd || 0) / 1000000).toFixed(1)}M
              </p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-purple-600 mb-2">
                <Activity className="w-4 h-4" />
                <span className="text-sm font-medium">Total Weight</span>
              </div>
              <p className="text-2xl font-bold text-purple-900">
                {((company.total_weight_kg || 0) / 1000).toFixed(0)}T
              </p>
            </div>
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-orange-600 mb-2">
                <Calendar className="w-4 h-4" />
                <span className="text-sm font-medium">Latest Activity</span>
              </div>
              <p className="text-sm font-bold text-orange-900">{company.last_arrival || 'N/A'}</p>
            </div>
          </div>

          {/* Seasonal Trends */}
          <div className="bg-gray-50 rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
                Seasonal Shipping Trends
              </h3>
              <div className="flex gap-2">
                {['3m', '6m', '12m'].map(period => (
                  <button
                    key={period}
                    onClick={() => setSelectedTrendPeriod(period as '3m' | '6m' | '12m')}
                    className={`px-3 py-1 rounded-lg text-sm font-medium ${
                      selectedTrendPeriod === period
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {period.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-12 gap-2 mb-4">
              {seasonalData.map((data, idx) => (
                <div key={idx} className="text-center">
                  <div
                    className={`h-20 rounded-lg mb-2 flex items-end justify-center text-white text-xs font-bold ${
                      data.season === 'high' ? 'bg-green-500' :
                      data.season === 'medium' ? 'bg-yellow-500' : 'bg-red-400'
                    }`}
                    style={{
                      height: `${Math.max(20, (data.shipments / 50) * 80)}px`
                    }}
                  >
                    {data.shipments}
                  </div>
                  <div className="text-xs text-gray-600">{data.month}</div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>High Volume</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span>Medium Volume</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                <span>Low Volume</span>
              </div>
            </div>

            {/* Trend Insights */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4 border">
                <div className="flex items-center gap-2 text-green-600 mb-2">
                  <Zap className="w-4 h-4" />
                  <span className="font-medium">Peak Season</span>
                </div>
                <p className="text-sm text-gray-600">
                  Highest activity in {seasonalData.reduce((max, curr) => max.shipments > curr.shipments ? max : curr).month}
                </p>
              </div>
              <div className="bg-white rounded-lg p-4 border">
                <div className="flex items-center gap-2 text-blue-600 mb-2">
                  <Clock className="w-4 h-4" />
                  <span className="font-medium">Low Season</span>
                </div>
                <p className="text-sm text-gray-600">
                  Lowest activity in {seasonalData.reduce((min, curr) => min.shipments < curr.shipments ? min : curr).month}
                </p>
              </div>
              <div className="bg-white rounded-lg p-4 border">
                <div className="flex items-center gap-2 text-purple-600 mb-2">
                  <Target className="w-4 h-4" />
                  <span className="font-medium">Opportunity</span>
                </div>
                <p className="text-sm text-gray-600">
                  Best outreach timing for maximum engagement
                </p>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-indigo-600" />
              Contact Information
            </h3>
            
            {!hasAccess ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                <Lock className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                <h4 className="font-medium text-yellow-800 mb-1">Premium Feature</h4>
                <p className="text-sm text-yellow-700">
                  Upgrade to Pro or Enterprise to access contact details and enrichment
                </p>
              </div>
            ) : !canViewContacts ? (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <Building2 className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <h4 className="font-medium text-blue-800 mb-1">Add to CRM First</h4>
                <p className="text-sm text-blue-700 mb-3">
                  Add this company to your CRM to unlock enriched contact details
                </p>
                <button
                  onClick={() => onAddToCRM(company)}
                  disabled={isAddingToCRM}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 mx-auto"
                >
                  {isAddingToCRM ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  Add to CRM & Enrich
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {company.contacts && company.contacts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {company.contacts.map((contact, idx) => (
                      <div key={idx} className="bg-white rounded-lg p-4 border">
                        <h4 className="font-semibold text-gray-900">{contact.full_name}</h4>
                        <p className="text-sm text-gray-600 mb-2">{contact.title}</p>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="w-4 h-4 text-indigo-600" />
                            <span>{contact.email}</span>
                          </div>
                          {contact.phone && (
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="w-4 h-4 text-green-600" />
                              <span>{contact.phone}</span>
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => onSendEmail(company)}
                          disabled={isSendingEmail}
                          className="mt-3 w-full px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {isSendingEmail ? (
                            <Loader className="w-4 h-4 animate-spin" />
                          ) : (
                            <Send className="w-4 h-4" />
                          )}
                          Send Insight Email
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                    <Users className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                    <h4 className="font-medium text-yellow-800 mb-1">Contacts Being Enriched</h4>
                    <p className="text-sm text-yellow-700">
                      Contact enrichment is in progress. Check back in a few minutes.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Recent Shipments */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <Ship className="w-5 h-5 text-indigo-600" />
              Recent Shipments
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-gray-600 border-b">
                    <th className="pb-3">BOL Number</th>
                    <th className="pb-3">Date</th>
                    <th className="pb-3">Route</th>
                    <th className="pb-3">Value</th>
                    <th className="pb-3">HS Code</th>
                  </tr>
                </thead>
                <tbody>
                  {company.shipments?.slice(0, 10).map((shipment, idx) => (
                    <tr key={idx} className="border-b text-sm">
                      <td className="py-3 font-mono text-xs">{shipment.bol_number || 'N/A'}</td>
                      <td className="py-3">{shipment.arrival_date}</td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          {shipment.shipment_type === 'air' ? (
                            <Plane className="w-3 h-3 text-blue-500" />
                          ) : (
                            <Ship className="w-3 h-3 text-teal-500" />
                          )}
                          {shipment.port_of_loading || shipment.port_of_lading} → {shipment.port_of_discharge}
                        </div>
                      </td>
                      <td className="py-3 font-medium text-green-600">
                        ${((shipment.value_usd || 0) / 1000).toFixed(0)}K
                      </td>
                      <td className="py-3 text-xs font-mono">{shipment.hs_code || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {company.shipments && company.shipments.length > 10 && (
                <p className="text-sm text-gray-500 mt-3 text-center">
                  Showing 10 of {company.shipments.length} shipments
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SearchPanelDemo = () => {
  const [viewMode, setViewMode] = useState('cards');
  const [filterMode, setFilterMode] = useState('all');
  const [expandedCompanies, setExpandedCompanies] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [userPlan, setUserPlan] = useState<'trial' | 'starter' | 'pro' | 'enterprise'>('pro');
  const [hasSearched, setHasSearched] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [operationLoading, setOperationLoading] = useState<Record<string, boolean>>({});
  const [notifications, setNotifications] = useState<Array<{id: number, message: string, type: 'info' | 'success' | 'error'}>>([]);
  
  // Company modal state
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  
  const supabase = createClientComponentClient();

  // Company and search state
  const [companies, setCompanies] = useState<Company[]>([]);
  const [searchFilters, setSearchFilters] = useState({
    company: '',
    originCountry: '',
    destinationCountry: '',
    commodity: '',
    hsCode: '',
    portOfLoading: '',
    portOfDischarge: ''
  });

  // Load user plan on mount
  useEffect(() => {
    async function loadUserPlan() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const response = await fetch('/api/me/plan');
          if (response.ok) {
            const planData = await response.json();
            setUserPlan(planData.plan || 'pro');
          } else {
            setUserPlan('pro');
          }
        } else {
          setUserPlan('pro');
        }
      } catch (error) {
        console.error('Failed to load user plan:', error);
        setUserPlan('pro');
      }
    }
    loadUserPlan();
  }, []);

  // Add notification helper
  const addNotification = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  // Enhanced search with better data fetching
  const handleSearch = async () => {
    setLoading(true);
    setHasSearched(true);
    try {
      // Build search parameters
      const params = new URLSearchParams();
      
      // Add all non-empty filters
      if (searchFilters.company) params.append('company', searchFilters.company);
      if (searchFilters.originCountry) params.append('origin_country', searchFilters.originCountry);
      if (searchFilters.destinationCountry) params.append('destination_country', searchFilters.destinationCountry);
      if (searchFilters.commodity) params.append('commodity', searchFilters.commodity);
      if (searchFilters.hsCode) params.append('hs_code', searchFilters.hsCode);
      if (filterMode !== 'all') params.append('mode', filterMode);
      
      console.log('Search params:', params.toString());
      
      const response = await fetch(`/api/search/unified?${params.toString()}`);
      const data = await response.json();
      
      console.log('Search response:', data);
      
      if (data.success) {
        // Process and enrich the company data
        const enrichedCompanies = await Promise.all(
          (data.data || []).map(async (company: any) => {
            // Check if company is already in CRM
            try {
              const crmResponse = await fetch(`/api/crm/contacts/check?company_name=${encodeURIComponent(company.company_name)}`);
              const crmData = await crmResponse.json();
              company.is_in_crm = crmData.exists;
              company.crm_added_date = crmData.added_date;
              
              // If in CRM, fetch contacts
              if (company.is_in_crm) {
                const contactsResponse = await fetch(`/api/crm/contacts?company_name=${encodeURIComponent(company.company_name)}`);
                const contactsData = await contactsResponse.json();
                company.contacts = contactsData.contacts || [];
              }
            } catch (error) {
              console.error('Error checking CRM status:', error);
              company.is_in_crm = false;
            }
            
            return company;
          })
        );
        
        setCompanies(enrichedCompanies);
        addNotification(`Found ${enrichedCompanies.length} companies matching your search`, 'success');
      } else {
        setCompanies([]);
        addNotification(data.error || 'No companies found for your search criteria', 'error');
      }
    } catch (error) {
      console.error('Search error:', error);
      setCompanies([]);
      addNotification('Search failed. Please try again or contact support.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Load default data on component mount
  useEffect(() => {
    const loadDefaultData = async () => {
      try {
        const response = await fetch('/api/search/unified?limit=10');
        const data = await response.json();
        
        if (data.success && data.data?.length > 0) {
          setCompanies(data.data);
          addNotification(`Loaded ${data.data.length} recent companies`, 'info');
        }
      } catch (error) {
        console.error('Failed to load default data:', error);
      }
    };
    
    loadDefaultData();
  }, []);

  // Open company detail modal
  const handleCompanyClick = (company: Company) => {
    setSelectedCompany(company);
    setIsCompanyModalOpen(true);
  };

  // Handle add to CRM with real API
  const handleAddToCRM = async (company: Company) => {
    const opKey = `crm_${company.company_name}`;
    setOperationLoading(prev => ({ ...prev, [opKey]: true }));
    
    try {
      const response = await fetch('/api/crm/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_name: company.company_name,
          source: 'Trade Search',
          metadata: {
            total_shipments: company.total_shipments || 0,
            total_value_usd: company.total_value_usd || 0,
            shipment_mode: company.shipment_mode || 'unknown'
          }
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Update company state
        company.is_in_crm = true;
        company.crm_added_date = new Date().toISOString();
        
        // Update companies list
        setCompanies(prev => prev.map(c => 
          c.company_name === company.company_name ? { ...c, is_in_crm: true } : c
        ));
        
        addNotification(`${company.company_name} added to CRM successfully!`, 'success');
        
        // Trigger Apollo enrichment for Pro/Enterprise users
        if (userPlan === 'pro' || userPlan === 'enterprise') {
          try {
            const enrichResponse = await fetch('/api/enrichment/apollo', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ companyName: company.company_name })
            });
            
            if (enrichResponse.ok) {
              addNotification('Contact enrichment started - contacts will appear shortly', 'info');
            }
          } catch (enrichError) {
            console.error('Enrichment error:', enrichError);
          }
        }
      } else {
        addNotification(result.error || 'Failed to add to CRM', 'error');
      }
    } catch (error) {
      console.error('CRM error:', error);
      addNotification('Failed to add to CRM', 'error');
    } finally {
      setOperationLoading(prev => ({ ...prev, [opKey]: false }));
    }
  };

  // Handle send insight email with real API
  const handleSendInsight = async (company: Company) => {
    const opKey = `email_${company.company_name}`;
    setOperationLoading(prev => ({ ...prev, [opKey]: true }));
    
    try {
      // Check if we have contacts
      const contactEmail = company.contacts?.[0]?.email;
      if (!contactEmail) {
        addNotification('No contact email available. Add to CRM first to enrich contacts.', 'error');
        return;
      }

      const subject = `Trade Intelligence Insights for ${company.company_name}`;
      const body = `Hello,

We've identified significant trade activity for ${company.company_name}:

📊 Trade Summary:
• Total Shipments: ${company.total_shipments || 0}
• Total Value: $${((company.total_value_usd || 0) / 1000000).toFixed(1)}M
• Primary Mode: ${company.shipment_mode?.toUpperCase() || 'UNKNOWN'}
• Latest Activity: ${company.last_arrival || 'N/A'}

Our platform shows strong growth potential for logistics partnerships. Would you be interested in a brief discussion about optimizing your supply chain operations?

Best regards,
Trade Intelligence Team`;

      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: contactEmail,
          subject,
          body
        })
      });
      
      const result = await response.json();
