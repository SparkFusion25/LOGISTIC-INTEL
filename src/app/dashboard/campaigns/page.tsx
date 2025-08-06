'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Target, Play, BarChart3, Mail, Linkedin, Zap } from 'lucide-react';
import { toast } from 'react-hot-toast';

type CampaignStep = {
  id: number;
  channel: 'Email' | 'LinkedIn' | 'PhantomBuster';
  delay: number;
  message: string;
};

export default function CampaignBuilder() {
  const [campaignName, setCampaignName] = useState('');
  const [tradeLane, setTradeLane] = useState('');
  const [industry, setIndustry] = useState('');
  const [steps, setSteps] = useState<CampaignStep[]>([
    { id: 1, channel: 'Email', delay: 0, message: '' },
  ]);

  const handleAddStep = () => {
    setSteps(prev => [
      ...prev,
      {
        id: prev.length + 1,
        channel: 'Email',
        delay: 2,
        message: '',
      },
    ]);
  };

  const handleUpdateStep = (index: number, field: keyof CampaignStep, value: any) => {
    const updatedSteps = [...steps];
    (updatedSteps[index] as any)[field] = value;
    setSteps(updatedSteps);
  };

  const handleRemoveStep = (index: number) => {
    setSteps(prev => prev.filter((_, i) => i !== index));
  };

  const handleLaunchCampaign = async () => {
    if (!campaignName || !tradeLane || !industry) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      // Simulate API call to create campaign
      const campaignData = {
        name: campaignName,
        tradelane: tradeLane,
        industry,
        steps: steps.map(step => ({
          channel: step.channel,
          delay: step.delay,
          message: step.message,
        })),
        created_at: new Date().toISOString(),
      };

      // Mock API call - replace with actual Supabase call
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast.success('Campaign launched successfully! 🚀');
      
      // Reset form
      setCampaignName('');
      setTradeLane('');
      setIndustry('');
      setSteps([{ id: 1, channel: 'Email', delay: 0, message: '' }]);
      
    } catch (error) {
      toast.error('Failed to create campaign');
      console.error(error);
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'Email': return <Mail className="w-4 h-4" />;
      case 'LinkedIn': return <Linkedin className="w-4 h-4" />;
      case 'PhantomBuster': return <Zap className="w-4 h-4" />;
      default: return <Mail className="w-4 h-4" />;
    }
  };

  const getChannelColor = (channel: string) => {
    switch (channel) {
      case 'Email': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'LinkedIn': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'PhantomBuster': return 'text-orange-600 bg-orange-50 border-orange-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <Target className="w-8 h-8 text-indigo-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Campaign Builder</h1>
            <p className="text-gray-600 mt-1">Create intelligent outreach campaigns for international trade prospects</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Campaign Configuration */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
            Campaign Configuration
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Name *</label>
              <input
                type="text"
                placeholder="Enter campaign name..."
                value={campaignName}
                onChange={e => setCampaignName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trade Lane *</label>
              <input
                type="text"
                placeholder="e.g., China → USA"
                value={tradeLane}
                onChange={e => setTradeLane(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Industry *</label>
              <select
                value={industry}
                onChange={e => setIndustry(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">Select Industry</option>
                {['Automotive', 'Pharmaceutical', 'Aerospace', 'Industrial Machinery', 'Consumer Goods', 'Electronics', 'Apparel & Textiles', 'Chemical', 'Food & Beverage'].map(item => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Campaign Steps */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Play className="w-5 h-5 text-indigo-600" />
              Campaign Sequence ({steps.length} steps)
            </h3>
            <button
              onClick={handleAddStep}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Step
            </button>
          </div>

          <div className="space-y-6">
            {steps.map((step, i) => (
              <div key={step.id} className="relative">
                {/* Step Connector Line */}
                {i > 0 && (
                  <div className="absolute -top-3 left-6 w-0.5 h-3 bg-gray-300"></div>
                )}
                
                <div className="glass-card border border-gray-200 p-6 rounded-lg relative">
                  {/* Step Number & Remove Button */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${getChannelColor(step.channel)}`}>
                        {getChannelIcon(step.channel)}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">Step {i + 1}</h4>
                        <p className="text-sm text-gray-600">{step.channel} Outreach</p>
                      </div>
                    </div>
                    
                    {steps.length > 1 && (
                      <button
                        onClick={() => handleRemoveStep(i)}
                        className="text-red-500 hover:text-red-700 p-1 rounded transition-colors"
                        title="Remove step"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Step Configuration */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Channel</label>
                      <select
                        value={step.channel}
                        onChange={e => handleUpdateStep(i, 'channel', e.target.value as any)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      >
                        <option value="Email">📧 Email</option>
                        <option value="LinkedIn">💼 LinkedIn</option>
                        <option value="PhantomBuster">⚡ PhantomBuster</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Delay (days)</label>
                      <input
                        type="number"
                        placeholder="0"
                        value={step.delay}
                        onChange={e => handleUpdateStep(i, 'delay', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        min="0"
                        max="30"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Wait Time</label>
                      <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm text-gray-600">
                        {step.delay === 0 ? 'Immediate' : `${step.delay} day${step.delay > 1 ? 's' : ''} after previous step`}
                      </div>
                    </div>
                  </div>

                  {/* Message Content */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Message Content for {step.channel}
                    </label>
                    <textarea
                      placeholder={`Enter your ${step.channel.toLowerCase()} message here...`}
                      value={step.message}
                      onChange={e => handleUpdateStep(i, 'message', e.target.value)}
                      rows={5}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      You can use variables like {`{{firstName}}, {{company}}, {{industry}}`}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Launch Campaign */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Ready to Launch?</h3>
              <p className="text-gray-600 text-sm mt-1">
                Review your campaign configuration and sequence before launching
              </p>
            </div>
            
            <button
              onClick={handleLaunchCampaign}
              disabled={!campaignName || !tradeLane || !industry}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors"
            >
              🚀 Launch Campaign
            </button>
          </div>
        </div>

        {/* Campaign Preview */}
        {campaignName && tradeLane && industry && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-indigo-900 mb-3">Campaign Preview</h3>
            <div className="space-y-2 text-sm">
              <p><span className="font-medium text-indigo-800">Name:</span> {campaignName}</p>
              <p><span className="font-medium text-indigo-800">Trade Lane:</span> {tradeLane}</p>
              <p><span className="font-medium text-indigo-800">Industry:</span> {industry}</p>
              <p><span className="font-medium text-indigo-800">Sequence:</span> {steps.length} steps configured</p>
              <p><span className="font-medium text-indigo-800">Total Duration:</span> {steps.reduce((sum, step) => sum + step.delay, 0)} days</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}