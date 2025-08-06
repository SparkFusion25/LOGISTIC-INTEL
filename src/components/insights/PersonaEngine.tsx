'use client';

import React, { useState, useEffect } from 'react';
import { 
  User, Brain, Target, TrendingUp, MapPin, Building2, 
  MessageCircle, Clock, Zap, Download, Save, RefreshCw,
  Lightbulb, Star, ArrowRight, CheckCircle, AlertCircle
} from 'lucide-react';

interface PersonaProfile {
  id: string;
  name: string;
  industry: string;
  tradeLane: {
    origin: string;
    destination: string;
  };
  demographics: {
    jobTitle: string;
    companySize: string;
    experience: string;
    decisionLevel: string;
  };
  painPoints: string[];
  motivations: string[];
  communicationStyle: 'formal' | 'casual' | 'technical' | 'relationship-focused';
  buyingStage: 'cold' | 'warm' | 'hot';
  preferredChannels: string[];
  keyMessages: string[];
  objections: string[];
  successMetrics: string[];
  confidence: number;
  generatedAt: string;
  basedOnContacts: number;
}

interface PersonaEngineProps {
  contactId?: string;
  industry?: string;
  tradeLane?: string;
  className?: string;
  onPersonaGenerated?: (persona: PersonaProfile) => void;
}

export default function PersonaEngine({ 
  contactId, 
  industry, 
  tradeLane, 
  className = '',
  onPersonaGenerated 
}: PersonaEngineProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPersona, setGeneratedPersona] = useState<PersonaProfile | null>(null);
  const [savedPersonas, setSavedPersonas] = useState<PersonaProfile[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [customInputs, setCustomInputs] = useState({
    industry: industry || '',
    tradeLane: tradeLane || '',
    companySize: '',
    geography: ''
  });

  // Mock persona templates
  const personaTemplates = [
    {
      id: 'electronics_importer',
      name: 'Electronics Importer - China to USA',
      industry: 'Electronics',
      description: 'Tech companies importing consumer electronics from China'
    },
    {
      id: 'automotive_buyer',
      name: 'Automotive Parts Buyer - Korea to Mexico',
      industry: 'Automotive',
      description: 'Auto manufacturers sourcing parts from South Korea'
    },
    {
      id: 'pharma_logistics',
      name: 'Pharmaceutical Logistics Manager',
      industry: 'Pharmaceutical',
      description: 'Cold chain and compliance-focused logistics professionals'
    },
    {
      id: 'fashion_sourcing',
      name: 'Fashion Sourcing Director',
      industry: 'Apparel',
      description: 'Fashion brands sourcing from Asia-Pacific'
    }
  ];

  useEffect(() => {
    loadSavedPersonas();
  }, []);

  const loadSavedPersonas = async () => {
    // Simulate loading saved personas from Supabase
    const mockSavedPersonas: PersonaProfile[] = [
      {
        id: 'persona_001',
        name: 'Tech Hardware Procurement Manager',
        industry: 'Electronics',
        tradeLane: { origin: 'China', destination: 'USA' },
        demographics: {
          jobTitle: 'Procurement Manager / Supply Chain Director',
          companySize: '100-1000 employees',
          experience: '5-10 years',
          decisionLevel: 'Primary decision maker'
        },
        painPoints: [
          'Rising shipping costs from China',
          'Unpredictable transit times',
          'Complex customs procedures',
          'Lack of shipment visibility'
        ],
        motivations: [
          'Cost reduction (20-30% savings target)',
          'Improved reliability and predictability',
          'Streamlined documentation',
          'Better supplier relationships'
        ],
        communicationStyle: 'technical',
        buyingStage: 'warm',
        preferredChannels: ['Email', 'LinkedIn', 'Industry events'],
        keyMessages: [
          'Proven 25% cost reduction for similar companies',
          'Advanced tracking and visibility platform',
          'Expertise in China-USA electronics trade',
          'Dedicated account management'
        ],
        objections: [
          'Current provider relationships',
          'Concerns about service transition',
          'Budget approval cycles',
          'Risk of supply chain disruption'
        ],
        successMetrics: [
          'Cost per container reduction',
          'On-time delivery improvement',
          'Documentation accuracy',
          'Customer satisfaction scores'
        ],
        confidence: 92,
        generatedAt: '2024-01-15T10:30:00Z',
        basedOnContacts: 45
      }
    ];
    
    setSavedPersonas(mockSavedPersonas);
  };

  const generatePersona = async () => {
    setIsGenerating(true);
    
    try {
      // Simulate AI generation delay
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Mock AI-generated persona based on inputs
      const newPersona: PersonaProfile = {
        id: `persona_${Date.now()}`,
        name: generatePersonaName(),
        industry: customInputs.industry || 'Electronics',
        tradeLane: {
          origin: customInputs.tradeLane.split(' → ')[0] || 'China',
          destination: customInputs.tradeLane.split(' → ')[1] || 'USA'
        },
        demographics: {
          jobTitle: generateJobTitle(),
          companySize: customInputs.companySize || '100-500 employees',
          experience: '5-10 years',
          decisionLevel: 'Primary decision maker'
        },
        painPoints: generatePainPoints(),
        motivations: generateMotivations(),
        communicationStyle: 'technical',
        buyingStage: 'warm',
        preferredChannels: ['Email', 'LinkedIn'],
        keyMessages: generateKeyMessages(),
        objections: generateObjections(),
        successMetrics: generateSuccessMetrics(),
        confidence: Math.floor(Math.random() * 20 + 80), // 80-100%
        generatedAt: new Date().toISOString(),
        basedOnContacts: Math.floor(Math.random() * 50 + 10) // 10-60 contacts
      };
      
      setGeneratedPersona(newPersona);
      onPersonaGenerated?.(newPersona);
      
    } catch (error) {
      console.error('Error generating persona:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const savePersona = async () => {
    if (!generatedPersona) return;
    
    try {
      // Simulate saving to Supabase
      setSavedPersonas(prev => [generatedPersona, ...prev]);
      
      // Show success feedback
      alert('Persona saved successfully!');
      
    } catch (error) {
      console.error('Error saving persona:', error);
    }
  };

  const exportToCampaign = () => {
    if (!generatedPersona) return;
    
    // Export persona data to campaign builder
    const campaignData = {
      targetPersona: generatedPersona.name,
      industry: generatedPersona.industry,
      tradeLane: `${generatedPersona.tradeLane.origin} → ${generatedPersona.tradeLane.destination}`,
      keyMessages: generatedPersona.keyMessages,
      communicationStyle: generatedPersona.communicationStyle
    };
    
    // In a real implementation, this would navigate to campaign builder with pre-filled data
    console.log('Exporting to campaign builder:', campaignData);
    alert('Persona exported to Campaign Builder!');
  };

  // Helper functions for generating persona content
  const generatePersonaName = () => {
    const titles = [
      'Supply Chain Procurement Manager',
      'International Trade Director',
      'Logistics Operations Manager',
      'Global Sourcing Specialist',
      'Import/Export Coordinator'
    ];
    return titles[Math.floor(Math.random() * titles.length)];
  };

  const generateJobTitle = () => {
    const titles = [
      'Procurement Manager',
      'Supply Chain Director',
      'Logistics Manager',
      'Import Specialist',
      'Global Trade Manager'
    ];
    return titles[Math.floor(Math.random() * titles.length)];
  };

  const generatePainPoints = () => [
    'Rising freight costs impacting margins',
    'Inconsistent transit times affecting inventory',
    'Complex documentation and compliance requirements',
    'Limited shipment visibility and tracking',
    'Difficulty finding reliable logistics partners'
  ];

  const generateMotivations = () => [
    'Reduce logistics costs by 15-25%',
    'Improve supply chain reliability',
    'Streamline documentation processes',
    'Enhance shipment visibility',
    'Build strategic logistics partnerships'
  ];

  const generateKeyMessages = () => [
    'Proven track record of 20-30% cost savings',
    'Advanced tracking and visibility technology',
    'Expert knowledge of trade regulations',
    'Dedicated customer success team',
    'Flexible service options'
  ];

  const generateObjections = () => [
    'Satisfaction with current provider',
    'Concerns about service transition',
    'Budget constraints and approval processes',
    'Risk aversion for supply chain changes',
    'Long-term contract commitments'
  ];

  const generateSuccessMetrics = () => [
    'Cost per shipment reduction',
    'On-time delivery performance',
    'Documentation accuracy rate',
    'Customer satisfaction scores',
    'Time to resolution for issues'
  ];

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600 bg-green-100';
    if (confidence >= 75) return 'text-blue-600 bg-blue-100';
    if (confidence >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getBuyingStageColor = (stage: string) => {
    switch (stage) {
      case 'hot': return 'text-red-600 bg-red-100';
      case 'warm': return 'text-orange-600 bg-orange-100';
      case 'cold': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-semibold text-gray-900">AI Persona Engine</h3>
            <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-xs font-medium">
              Powered by AI
            </span>
          </div>
          
          {generatedPersona && (
            <div className="flex items-center gap-2">
              <button
                onClick={savePersona}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-md flex items-center gap-2 text-sm transition-colors"
              >
                <Save className="w-4 h-4" />
                Save
              </button>
              <button
                onClick={exportToCampaign}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded-md flex items-center gap-2 text-sm transition-colors"
              >
                <Download className="w-4 h-4" />
                Export to Campaign
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="p-6">
        {/* Generation Form */}
        <div className="mb-8">
          <h4 className="font-medium text-gray-900 mb-4">Generate New Persona</h4>
          
          {/* Quick Templates */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Quick Templates</label>
            <div className="grid md:grid-cols-2 gap-3">
              {personaTemplates.map((template) => (
                <div
                  key={template.id}
                  onClick={() => {
                    setSelectedTemplate(template.id);
                    setCustomInputs({
                      industry: template.industry,
                      tradeLane: '',
                      companySize: '',
                      geography: ''
                    });
                  }}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedTemplate === template.id
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <h5 className="font-medium text-gray-900 text-sm">{template.name}</h5>
                  <p className="text-gray-600 text-xs mt-1">{template.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Custom Inputs */}
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
              <input
                type="text"
                value={customInputs.industry}
                onChange={(e) => setCustomInputs(prev => ({ ...prev, industry: e.target.value }))}
                placeholder="e.g., Electronics, Automotive"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trade Lane</label>
              <input
                type="text"
                value={customInputs.tradeLane}
                onChange={(e) => setCustomInputs(prev => ({ ...prev, tradeLane: e.target.value }))}
                placeholder="e.g., China → USA"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Size</label>
              <select
                value={customInputs.companySize}
                onChange={(e) => setCustomInputs(prev => ({ ...prev, companySize: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              >
                <option value="">Select size</option>
                <option value="1-50 employees">Startup (1-50)</option>
                <option value="50-200 employees">Small (50-200)</option>
                <option value="200-1000 employees">Medium (200-1K)</option>
                <option value="1000+ employees">Enterprise (1K+)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Geography Focus</label>
              <input
                type="text"
                value={customInputs.geography}
                onChange={(e) => setCustomInputs(prev => ({ ...prev, geography: e.target.value }))}
                placeholder="e.g., North America, Asia-Pacific"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>
          </div>

          <button
            onClick={generatePersona}
            disabled={isGenerating || !customInputs.industry}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-2 rounded-md flex items-center gap-2 transition-colors"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Generating Persona...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                Generate AI Persona
              </>
            )}
          </button>
        </div>

        {/* Generated Persona Display */}
        {generatedPersona && (
          <div className="border border-gray-200 rounded-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">{generatedPersona.name}</h4>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Building2 className="w-4 h-4" />
                    {generatedPersona.industry}
                    <MapPin className="w-4 h-4 ml-2" />
                    {generatedPersona.tradeLane.origin} → {generatedPersona.tradeLane.destination}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${getConfidenceColor(generatedPersona.confidence)}`}>
                  {generatedPersona.confidence}% Confidence
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${getBuyingStageColor(generatedPersona.buyingStage)}`}>
                  {generatedPersona.buyingStage.toUpperCase()}
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Demographics */}
              <div>
                <h5 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <Target className="w-4 h-4 text-indigo-600" />
                  Demographics
                </h5>
                <div className="space-y-2 text-sm">
                  <div><span className="text-gray-600">Job Title:</span> <span className="font-medium">{generatedPersona.demographics.jobTitle}</span></div>
                  <div><span className="text-gray-600">Company Size:</span> <span className="font-medium">{generatedPersona.demographics.companySize}</span></div>
                  <div><span className="text-gray-600">Experience:</span> <span className="font-medium">{generatedPersona.demographics.experience}</span></div>
                  <div><span className="text-gray-600">Decision Level:</span> <span className="font-medium">{generatedPersona.demographics.decisionLevel}</span></div>
                </div>
              </div>

              {/* Communication */}
              <div>
                <h5 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-indigo-600" />
                  Communication
                </h5>
                <div className="space-y-2 text-sm">
                  <div><span className="text-gray-600">Style:</span> <span className="font-medium capitalize">{generatedPersona.communicationStyle}</span></div>
                  <div><span className="text-gray-600">Channels:</span> <span className="font-medium">{generatedPersona.preferredChannels.join(', ')}</span></div>
                  <div><span className="text-gray-600">Based on:</span> <span className="font-medium">{generatedPersona.basedOnContacts} contacts</span></div>
                </div>
              </div>
            </div>

            {/* Pain Points */}
            <div className="mt-6">
              <h5 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600" />
                Pain Points
              </h5>
              <div className="grid md:grid-cols-2 gap-2">
                {generatedPersona.painPoints.map((point, index) => (
                  <div key={index} className="flex items-start gap-2 text-sm">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700">{point}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Motivations */}
            <div className="mt-6">
              <h5 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Star className="w-4 h-4 text-green-600" />
                Motivations
              </h5>
              <div className="grid md:grid-cols-2 gap-2">
                {generatedPersona.motivations.map((motivation, index) => (
                  <div key={index} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{motivation}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Messages */}
            <div className="mt-6">
              <h5 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-yellow-600" />
                Key Messages
              </h5>
              <div className="space-y-2">
                {generatedPersona.keyMessages.map((message, index) => (
                  <div key={index} className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                    <div className="flex items-start gap-2">
                      <ArrowRight className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{message}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Saved Personas */}
        <div>
          <h4 className="font-medium text-gray-900 mb-4">Saved Personas ({savedPersonas.length})</h4>
          
          {savedPersonas.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <User className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p>No saved personas yet. Generate your first AI persona above.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {savedPersonas.map((persona) => (
                <div key={persona.id} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-gray-600" />
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-900">{persona.name}</h5>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>{persona.industry}</span>
                          <span>{persona.tradeLane.origin} → {persona.tradeLane.destination}</span>
                          <span className={`px-2 py-1 rounded-full text-xs ${getBuyingStageColor(persona.buyingStage)}`}>
                            {persona.buyingStage.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${getConfidenceColor(persona.confidence)}`}>
                        {persona.confidence}%
                      </span>
                      <button
                        onClick={() => setGeneratedPersona(persona)}
                        className="text-indigo-600 hover:text-indigo-700 text-sm"
                      >
                        View
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}