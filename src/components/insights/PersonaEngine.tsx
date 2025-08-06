'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  Building2, 
  Mail, 
  Phone, 
  Globe, 
  Linkedin, 
  RefreshCw, 
  Edit3, 
  Calendar, 
  Search,
  Target,
  MessageCircle,
  TrendingUp,
  Clock,
  Eye,
  ExternalLink,
  Brain,
  Zap,
  Star,
  MapPin,
  Briefcase,
  Users,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Loader
} from 'lucide-react';

interface PersonaData {
  personaSummary: string;
  topChallenges: string[];
  communicationStyle: string;
  smartQuestions: string[];
  buyingLikelihood: number;
  industryVertical: string;
  decisionMakerLevel: 'low' | 'medium' | 'high';
  preferredChannels: string[];
  lastEnriched: string;
}

interface ContactData {
  id: string;
  full_name: string;
  title: string;
  company: string;
  email: string;
  phone?: string;
  linkedin?: string;
  created_at: string;
  domain?: string;
  region?: string;
  department?: string;
  persona?: PersonaData;
}

interface OutreachActivity {
  id: string;
  channel: string;
  action: string;
  timestamp: string;
  details?: string;
}

interface PersonaEngineProps {
  contact: ContactData | null;
  isOpen: boolean;
  onClose: () => void;
  onEnrich?: (contactId: string) => void;
  onGenerateEmail?: (contactId: string) => void;
  onScheduleFollowUp?: (contactId: string) => void;
}

const PersonaEngine: React.FC<PersonaEngineProps> = ({
  contact,
  isOpen,
  onClose,
  onEnrich,
  onGenerateEmail,
  onScheduleFollowUp
}) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'triggers' | 'talking-points' | 'engagement' | 'actions'>('summary');
  const [isEnriching, setIsEnriching] = useState(false);
  const [outreachHistory, setOutreachHistory] = useState<OutreachActivity[]>([]);
  const [companyNews, setCompanyNews] = useState<any[]>([]);
  const [loadingNews, setLoadingNews] = useState(false);

  const tabs = [
    { id: 'summary', label: 'Summary', icon: User },
    { id: 'triggers', label: 'Buyer Triggers', icon: Target },
    { id: 'talking-points', label: 'Talking Points', icon: MessageCircle },
    { id: 'engagement', label: 'Recent Engagement', icon: TrendingUp },
    { id: 'actions', label: 'Suggested Actions', icon: Zap }
  ];

  useEffect(() => {
    if (contact && isOpen) {
      loadContactData();
    }
  }, [contact, isOpen]);

  const loadContactData = async () => {
    if (!contact) return;

    try {
      // Load outreach history
      const response = await fetch(`/api/outreach-history?contactId=${contact.id}`);
      const data = await response.json();
      if (data.success) {
        setOutreachHistory(data.data || []);
      }

      // Load company news if we have a domain
      if (contact.domain || contact.company) {
        setLoadingNews(true);
        try {
          const newsResponse = await fetch(`/api/company-news?domain=${contact.domain || contact.company}`);
          const newsData = await newsResponse.json();
          if (newsData.success) {
            setCompanyNews(newsData.articles || []);
          }
        } catch (error) {
          console.error('Error loading company news:', error);
        } finally {
          setLoadingNews(false);
        }
      }
    } catch (error) {
      console.error('Error loading contact data:', error);
    }
  };

  const handleEnrichment = async () => {
    if (!contact) return;

    setIsEnriching(true);
    try {
      const response = await fetch('/api/persona/enrich', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contactId: contact.id })
      });

      const data = await response.json();
      if (data.success) {
        // Refresh contact data
        onEnrich?.(contact.id);
      }
    } catch (error) {
      console.error('Error enriching contact:', error);
    } finally {
      setIsEnriching(false);
    }
  };

  const getBuyingLikelihoodColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    if (score >= 40) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getDecisionMakerBadge = (level: string) => {
    const configs = {
      high: { color: 'bg-green-100 text-green-800', label: 'High Authority' },
      medium: { color: 'bg-yellow-100 text-yellow-800', label: 'Medium Authority' },
      low: { color: 'bg-gray-100 text-gray-800', label: 'Low Authority' }
    };
    return configs[level as keyof typeof configs] || configs.low;
  };

  const renderSummaryTab = () => (
    <div className="space-y-6">
      {/* Contact Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">{contact?.full_name}</h3>
              <p className="text-indigo-200">{contact?.title}</p>
              <p className="text-indigo-300 text-sm">{contact?.company}</p>
            </div>
          </div>
          
          {contact?.persona && (
            <div className="text-right">
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getBuyingLikelihoodColor(contact.persona.buyingLikelihood)}`}>
                <Target className="w-4 h-4" />
                {contact.persona.buyingLikelihood}% Buy Likelihood
              </div>
              <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium mt-2 ${getDecisionMakerBadge(contact.persona.decisionMakerLevel).color}`}>
                <Star className="w-3 h-3" />
                {getDecisionMakerBadge(contact.persona.decisionMakerLevel).label}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Contact Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Mail className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">Email:</span>
            <span className="font-medium">{contact?.email}</span>
          </div>
          {contact?.phone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">Phone:</span>
              <span className="font-medium">{contact?.phone}</span>
            </div>
          )}
          {contact?.linkedin && (
            <div className="flex items-center gap-2 text-sm">
              <Linkedin className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">LinkedIn:</span>
              <a href={contact.linkedin} target="_blank" rel="noopener noreferrer" className="font-medium text-indigo-600 hover:text-indigo-700">
                View Profile
              </a>
            </div>
          )}
        </div>
        
        <div className="space-y-3">
          {contact?.region && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">Region:</span>
              <span className="font-medium">{contact.region}</span>
            </div>
          )}
          {contact?.department && (
            <div className="flex items-center gap-2 text-sm">
              <Briefcase className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">Department:</span>
              <span className="font-medium">{contact.department}</span>
            </div>
          )}
          {contact?.domain && (
            <div className="flex items-center gap-2 text-sm">
              <Globe className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">Domain:</span>
              <a href={`https://${contact.domain}`} target="_blank" rel="noopener noreferrer" className="font-medium text-indigo-600 hover:text-indigo-700">
                {contact.domain}
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Persona Summary */}
      {contact?.persona ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
            <Brain className="w-4 h-4" />
            AI Persona Summary
          </h4>
          <p className="text-blue-800 text-sm leading-relaxed">
            {contact.persona.personaSummary}
          </p>
          <div className="flex items-center gap-4 mt-3 text-xs text-blue-600">
            <span>Industry: {contact.persona.industryVertical}</span>
            <span>Style: {contact.persona.communicationStyle}</span>
            <span>Last enriched: {new Date(contact.persona.lastEnriched).toLocaleDateString()}</span>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
          <Brain className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600 text-sm">No persona data available</p>
          <button
            onClick={handleEnrichment}
            disabled={isEnriching}
            className="mt-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-lg transition-colors disabled:opacity-50"
          >
            {isEnriching ? (
              <><Loader className="w-4 h-4 animate-spin inline mr-1" /> Enriching...</>
            ) : (
              <><RefreshCw className="w-4 h-4 inline mr-1" /> Enrich Profile</>
            )}
          </button>
        </div>
      )}
    </div>
  );

  const renderTriggersTab = () => (
    <div className="space-y-4">
      <h4 className="font-semibold text-gray-900 flex items-center gap-2">
        <Target className="w-5 h-5 text-indigo-600" />
        Buyer Triggers & Signals
      </h4>
      
      {contact?.persona?.topChallenges ? (
        <div className="space-y-3">
          <div>
            <h5 className="text-sm font-medium text-gray-700 mb-2">Top Business Challenges</h5>
            <div className="space-y-2">
              {contact.persona.topChallenges.map((challenge, index) => (
                <div key={index} className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-red-800">{challenge}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h5 className="text-sm font-medium text-gray-700 mb-2">Preferred Communication Channels</h5>
            <div className="flex flex-wrap gap-2">
              {contact.persona.preferredChannels?.map((channel, index) => (
                <span key={index} className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                  {channel}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h5 className="text-sm font-medium text-gray-700 mb-2">Industry Vertical</h5>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <span className="text-sm text-blue-800">{contact.persona.industryVertical}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <Target className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600">No buyer trigger data available</p>
          <p className="text-gray-500 text-sm">Enrich the profile to see buyer signals</p>
        </div>
      )}
    </div>
  );

  const renderTalkingPointsTab = () => (
    <div className="space-y-4">
      <h4 className="font-semibold text-gray-900 flex items-center gap-2">
        <MessageCircle className="w-5 h-5 text-indigo-600" />
        Smart Talking Points
      </h4>
      
      {contact?.persona?.smartQuestions ? (
        <div className="space-y-4">
          <div>
            <h5 className="text-sm font-medium text-gray-700 mb-3">Recommended Questions</h5>
            <div className="space-y-3">
              {contact.persona.smartQuestions.map((question, index) => (
                <div key={index} className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-6 h-6 bg-green-600 text-white text-xs rounded-full flex items-center justify-center font-medium">
                      {index + 1}
                    </span>
                    <p className="text-sm text-green-800">{question}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h5 className="text-sm font-medium text-gray-700 mb-2">Communication Style</h5>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">{contact.persona.communicationStyle}</p>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <h5 className="text-sm font-medium text-yellow-800 mb-1">💡 Pro Tip</h5>
            <p className="text-sm text-yellow-700">
              Use these questions during discovery calls to uncover pain points and position your solutions effectively.
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600">No talking points available</p>
          <p className="text-gray-500 text-sm">Enrich the profile to get AI-generated conversation starters</p>
        </div>
      )}
    </div>
  );

  const renderEngagementTab = () => (
    <div className="space-y-4">
      <h4 className="font-semibold text-gray-900 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-indigo-600" />
        Recent Engagement Activity
      </h4>
      
      {outreachHistory.length > 0 ? (
        <div className="space-y-3">
          {outreachHistory.slice(0, 10).map((activity) => (
            <div key={activity.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                {activity.channel === 'email' && <Mail className="w-4 h-4 text-indigo-600" />}
                {activity.channel === 'linkedin' && <Linkedin className="w-4 h-4 text-indigo-600" />}
                {activity.channel === 'phone' && <Phone className="w-4 h-4 text-indigo-600" />}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm capitalize">{activity.action}</span>
                  <span className="text-gray-500 text-sm">via {activity.channel}</span>
                </div>
                <p className="text-xs text-gray-500">
                  {new Date(activity.timestamp).toLocaleDateString()} at {new Date(activity.timestamp).toLocaleTimeString()}
                </p>
              </div>
              <CheckCircle className="w-4 h-4 text-green-500" />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600">No recent engagement activity</p>
          <p className="text-gray-500 text-sm">Start engaging with this contact to see activity here</p>
        </div>
      )}

      {/* Company News Section */}
      <div className="border-t pt-4">
        <h5 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
          <Globe className="w-4 h-4" />
          Recent Company News
        </h5>
        {loadingNews ? (
          <div className="text-center py-4">
            <Loader className="w-6 h-6 animate-spin text-indigo-600 mx-auto" />
          </div>
        ) : companyNews.length > 0 ? (
          <div className="space-y-2">
            {companyNews.slice(0, 3).map((article, index) => (
              <div key={index} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <h6 className="text-sm font-medium text-blue-900 mb-1">{article.title}</h6>
                <p className="text-xs text-blue-700 line-clamp-2">{article.description}</p>
                <a href={article.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-700 mt-1 inline-flex items-center gap-1">
                  Read more <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No recent company news found</p>
        )}
      </div>
    </div>
  );

  const renderActionsTab = () => (
    <div className="space-y-4">
      <h4 className="font-semibold text-gray-900 flex items-center gap-2">
        <Zap className="w-5 h-5 text-indigo-600" />
        Suggested Actions
      </h4>
      
      <div className="grid gap-3">
        <button
          onClick={() => onGenerateEmail?.(contact?.id || '')}
          className="flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <Edit3 className="w-5 h-5 text-blue-600" />
            <div>
              <h5 className="font-medium text-blue-900">Generate Custom Email</h5>
              <p className="text-sm text-blue-700">Create personalized outreach based on persona data</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-blue-600" />
        </button>

        <button
          onClick={() => onScheduleFollowUp?.(contact?.id || '')}
          className="flex items-center justify-between p-4 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-green-600" />
            <div>
              <h5 className="font-medium text-green-900">Schedule Follow-Up</h5>
              <p className="text-sm text-green-700">Set up automated follow-up sequence</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-green-600" />
        </button>

        {contact?.linkedin && (
          <a
            href={contact.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-4 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-3">
              <Linkedin className="w-5 h-5 text-purple-600" />
              <div>
                <h5 className="font-medium text-purple-900">Visit LinkedIn Profile</h5>
                <p className="text-sm text-purple-700">View full professional profile</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-purple-600" />
          </a>
        )}

        <button
          onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(contact?.company || '')} news`, '_blank')}
          className="flex items-center justify-between p-4 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-lg transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <Search className="w-5 h-5 text-orange-600" />
            <div>
              <h5 className="font-medium text-orange-900">Google Company News</h5>
              <p className="text-sm text-orange-700">Research latest company updates</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-orange-600" />
        </button>

        <button
          onClick={handleEnrichment}
          disabled={isEnriching}
          className="flex items-center justify-between p-4 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors text-left disabled:opacity-50"
        >
          <div className="flex items-center gap-3">
            <RefreshCw className={`w-5 h-5 text-indigo-600 ${isEnriching ? 'animate-spin' : ''}`} />
            <div>
              <h5 className="font-medium text-indigo-900">Re-enrich Profile</h5>
              <p className="text-sm text-indigo-700">Update persona data with latest information</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-indigo-600" />
        </button>
      </div>
    </div>
  );

  if (!isOpen || !contact) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-end z-50">
      <div className="bg-white h-full w-full max-w-lg shadow-2xl overflow-hidden">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Brain className="w-5 h-5 text-indigo-600" />
              Contact Intelligence
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex overflow-x-auto border-b border-gray-200 bg-white">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-indigo-600 text-indigo-600 bg-indigo-50'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === 'summary' && renderSummaryTab()}
            {activeTab === 'triggers' && renderTriggersTab()}
            {activeTab === 'talking-points' && renderTalkingPointsTab()}
            {activeTab === 'engagement' && renderEngagementTab()}
            {activeTab === 'actions' && renderActionsTab()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonaEngine;