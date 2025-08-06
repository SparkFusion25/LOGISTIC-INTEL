'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Mail, 
  Clock, 
  ArrowDown, 
  Settings, 
  Trash2, 
  Copy, 
  Eye,
  ChevronDown,
  ChevronRight,
  Zap,
  Target,
  Users,
  Calendar,
  Edit3,
  Save,
  X
} from 'lucide-react';

interface FollowUpStep {
  id: string;
  stepNumber: number;
  stepType: 'email' | 'linkedin' | 'wait' | 'condition';
  subjectLine: string;
  emailBody: string;
  delayDays: number;
  delayHours: number;
  triggerCondition: 'no_reply' | 'no_open' | 'clicked' | 'opened' | 'linkedin_viewed';
  ctaText?: string;
  ctaUrl?: string;
  isActive: boolean;
}

interface FollowUpRule {
  id: string;
  triggerType: 'email_opened' | 'email_not_opened' | 'link_clicked' | 'no_reply' | 'linkedin_viewed';
  triggerCondition: {
    days: number;
    operator: 'after' | 'before';
  };
  actionType: 'send_email' | 'send_linkedin' | 'mark_complete' | 'add_to_list';
  actionConfig: any;
  stepOrder: number;
  isActive: boolean;
}

interface FollowUpSequenceBuilderProps {
  campaignId: string;
  onSave?: (steps: FollowUpStep[], rules: FollowUpRule[]) => void;
  className?: string;
}

const FollowUpSequenceBuilder: React.FC<FollowUpSequenceBuilderProps> = ({
  campaignId,
  onSave,
  className = ''
}) => {
  const [steps, setSteps] = useState<FollowUpStep[]>([]);
  const [rules, setRules] = useState<FollowUpRule[]>([]);
  const [editingStep, setEditingStep] = useState<string | null>(null);
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const triggerOptions = [
    { value: 'no_reply', label: 'No Reply', icon: Mail, color: 'text-orange-600' },
    { value: 'no_open', label: 'Email Not Opened', icon: Eye, color: 'text-red-600' },
    { value: 'opened', label: 'Email Opened', icon: Eye, color: 'text-green-600' },
    { value: 'clicked', label: 'Link Clicked', icon: Target, color: 'text-blue-600' },
    { value: 'linkedin_viewed', label: 'LinkedIn Viewed', icon: Users, color: 'text-purple-600' }
  ];

  const stepTypes = [
    { value: 'email', label: 'Send Email', icon: Mail, color: 'bg-blue-500' },
    { value: 'linkedin', label: 'LinkedIn Message', icon: Users, color: 'bg-purple-500' },
    { value: 'wait', label: 'Wait Period', icon: Clock, color: 'bg-gray-500' },
    { value: 'condition', label: 'Conditional Logic', icon: Zap, color: 'bg-yellow-500' }
  ];

  const addNewStep = () => {
    const newStep: FollowUpStep = {
      id: `step-${Date.now()}`,
      stepNumber: steps.length + 1,
      stepType: 'email',
      subjectLine: '',
      emailBody: '',
      delayDays: 3,
      delayHours: 0,
      triggerCondition: 'no_reply',
      isActive: true
    };

    setSteps([...steps, newStep]);
    setEditingStep(newStep.id);
    setExpandedSteps(prev => new Set(prev.add(newStep.id)));
  };

  const updateStep = (stepId: string, updates: Partial<FollowUpStep>) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, ...updates } : step
    ));
  };

  const deleteStep = (stepId: string) => {
    setSteps(prev => prev.filter(step => step.id !== stepId));
    setExpandedSteps(prev => {
      const newSet = new Set(prev);
      newSet.delete(stepId);
      return newSet;
    });
  };

  const duplicateStep = (stepId: string) => {
    const stepToDuplicate = steps.find(step => step.id === stepId);
    if (stepToDuplicate) {
      const newStep: FollowUpStep = {
        ...stepToDuplicate,
        id: `step-${Date.now()}`,
        stepNumber: steps.length + 1,
        subjectLine: `${stepToDuplicate.subjectLine} (Copy)`
      };
      setSteps([...steps, newStep]);
    }
  };

  const toggleStepExpansion = (stepId: string) => {
    setExpandedSteps(prev => {
      const newSet = new Set(prev);
      if (newSet.has(stepId)) {
        newSet.delete(stepId);
      } else {
        newSet.add(stepId);
      }
      return newSet;
    });
  };

  const getTriggerIcon = (trigger: string) => {
    const option = triggerOptions.find(opt => opt.value === trigger);
    return option ? option.icon : Mail;
  };

  const getTriggerColor = (trigger: string) => {
    const option = triggerOptions.find(opt => opt.value === trigger);
    return option ? option.color : 'text-gray-600';
  };

  const getStepTypeConfig = (stepType: string) => {
    return stepTypes.find(type => type.value === stepType) || stepTypes[0];
  };

  const handleSave = () => {
    onSave?.(steps, rules);
  };

  const renderStepEditor = (step: FollowUpStep) => {
    const isExpanded = expandedSteps.has(step.id);
    const isEditing = editingStep === step.id;
    const stepConfig = getStepTypeConfig(step.stepType);
    const TriggerIcon = getTriggerIcon(step.triggerCondition);

    return (
      <div key={step.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
        {/* Step Header */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 ${stepConfig.color} rounded-lg flex items-center justify-center text-white`}>
                <stepConfig.icon className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-gray-900">
                    Step {step.stepNumber}: {stepConfig.label}
                  </h4>
                  {!step.isActive && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      Inactive
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Wait {step.delayDays} day{step.delayDays !== 1 ? 's' : ''}
                    {step.delayHours > 0 && ` ${step.delayHours} hour${step.delayHours !== 1 ? 's' : ''}`}
                  </div>
                  <div className="flex items-center gap-1">
                    <TriggerIcon className={`w-3 h-3 ${getTriggerColor(step.triggerCondition)}`} />
                    {triggerOptions.find(opt => opt.value === step.triggerCondition)?.label}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleStepExpansion(step.id)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
              
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setEditingStep(isEditing ? null : step.id)}
                  className="p-2 text-gray-400 hover:text-indigo-600 rounded-lg hover:bg-gray-100 transition-colors"
                  title="Edit step"
                >
                  {isEditing ? <Save className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                </button>
                
                <button
                  onClick={() => duplicateStep(step.id)}
                  className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-gray-100 transition-colors"
                  title="Duplicate step"
                >
                  <Copy className="w-4 h-4" />
                </button>
                
                <button
                  onClick={() => deleteStep(step.id)}
                  className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100 transition-colors"
                  title="Delete step"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Step Content */}
        {isExpanded && (
          <div className="p-4 space-y-4">
            {/* Step Configuration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Step Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Step Type</label>
                <select
                  value={step.stepType}
                  onChange={(e) => updateStep(step.id, { stepType: e.target.value as any })}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-50"
                >
                  {stepTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              {/* Trigger Condition */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Trigger Condition</label>
                <select
                  value={step.triggerCondition}
                  onChange={(e) => updateStep(step.id, { triggerCondition: e.target.value as any })}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-50"
                >
                  {triggerOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              {/* Delay Days */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Delay (Days)</label>
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={step.delayDays}
                  onChange={(e) => updateStep(step.id, { delayDays: parseInt(e.target.value) || 0 })}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-50"
                />
              </div>

              {/* Delay Hours */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Delay (Hours)</label>
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={step.delayHours}
                  onChange={(e) => updateStep(step.id, { delayHours: parseInt(e.target.value) || 0 })}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-50"
                />
              </div>
            </div>

            {/* Email Content (for email steps) */}
            {step.stepType === 'email' && (
              <div className="space-y-4">
                {/* Subject Line */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject Line</label>
                  <input
                    type="text"
                    value={step.subjectLine}
                    onChange={(e) => updateStep(step.id, { subjectLine: e.target.value })}
                    disabled={!isEditing}
                    placeholder="Enter email subject line..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-50"
                  />
                </div>

                {/* Email Body */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Body</label>
                  <textarea
                    value={step.emailBody}
                    onChange={(e) => updateStep(step.id, { emailBody: e.target.value })}
                    disabled={!isEditing}
                    rows={6}
                    placeholder="Enter email content... Use {{name}}, {{company}}, etc. for personalization"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-50 resize-none"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    Available variables: {{name}}, {{company}}, {{title}}, {{email}}
                  </div>
                </div>

                {/* CTA Configuration */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">CTA Button Text (Optional)</label>
                    <input
                      type="text"
                      value={step.ctaText || ''}
                      onChange={(e) => updateStep(step.id, { ctaText: e.target.value })}
                      disabled={!isEditing}
                      placeholder="e.g., Schedule a Call"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">CTA URL (Optional)</label>
                    <input
                      type="url"
                      value={step.ctaUrl || ''}
                      onChange={(e) => updateStep(step.id, { ctaUrl: e.target.value })}
                      disabled={!isEditing}
                      placeholder="https://calendly.com/your-link"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-50"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step Actions */}
            {isEditing && (
              <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={step.isActive}
                      onChange={(e) => updateStep(step.id, { isActive: e.target.checked })}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    Active
                  </label>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditingStep(null)}
                    className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    <X className="w-4 h-4 mr-1 inline" />
                    Cancel
                  </button>
                  <button
                    onClick={() => setEditingStep(null)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-lg transition-colors"
                  >
                    <Save className="w-4 h-4 mr-1 inline" />
                    Save Step
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Connection Arrow */}
        {steps.findIndex(s => s.id === step.id) < steps.length - 1 && (
          <div className="flex justify-center py-2">
            <ArrowDown className="w-5 h-5 text-gray-400" />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`bg-gray-50 rounded-xl p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Zap className="w-6 h-6 text-indigo-600" />
            Follow-Up Sequence Builder
          </h3>
          <p className="text-gray-600 mt-1">
            Create automated follow-up sequences based on recipient behavior
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPreviewMode(!isPreviewMode)}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Eye className="w-4 h-4" />
            {isPreviewMode ? 'Edit Mode' : 'Preview'}
          </button>
          
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
          >
            <Save className="w-4 h-4" />
            Save Sequence
          </button>
        </div>
      </div>

      {/* Steps Container */}
      <div className="space-y-4">
        {/* Initial Step Indicator */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-semibold">Initial Email</h4>
              <p className="text-indigo-200 text-sm">Campaign starts here - initial outreach email sent</p>
            </div>
          </div>
        </div>

        <div className="flex justify-center py-2">
          <ArrowDown className="w-5 h-5 text-gray-400" />
        </div>

        {/* Follow-Up Steps */}
        {steps.map((step) => renderStepEditor(step))}

        {/* Add New Step Button */}
        <div className="flex justify-center">
          <button
            onClick={addNewStep}
            className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-dashed border-gray-300 hover:border-indigo-400 hover:bg-indigo-50 text-gray-600 hover:text-indigo-600 rounded-xl transition-all duration-200"
          >
            <Plus className="w-5 h-5" />
            Add Follow-Up Step
          </button>
        </div>
      </div>

      {/* Sequence Stats */}
      {steps.length > 0 && (
        <div className="mt-8 p-4 bg-white rounded-xl border border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-3">Sequence Overview</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-indigo-600">{steps.length + 1}</div>
              <div className="text-xs text-gray-500">Total Steps</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{steps.filter(s => s.isActive).length}</div>
              <div className="text-xs text-gray-500">Active Steps</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {Math.max(...steps.map(s => s.delayDays), 0)}
              </div>
              <div className="text-xs text-gray-500">Max Days</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {steps.filter(s => s.stepType === 'email').length}
              </div>
              <div className="text-xs text-gray-500">Email Steps</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FollowUpSequenceBuilder;