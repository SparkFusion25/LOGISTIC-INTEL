import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, Edit3, Send, X } from 'lucide-react';
import { ConfidenceEngine } from '@/lib/confidenceEngine';

interface CompanyFeedbackProps {
  companyName: string;
  hsCode: string;
  country: string;
  confidenceScore: number;
  onFeedbackSubmitted?: () => void;
  className?: string;
}

export default function CompanyFeedback({
  companyName,
  hsCode,
  country,
  confidenceScore,
  onFeedbackSubmitted,
  className = ""
}: CompanyFeedbackProps) {
  const [feedbackType, setFeedbackType] = useState<'correct' | 'incorrect' | 'correction' | null>(null);
  const [correctedName, setCorrectedName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleCorrectClick = async () => {
    setIsSubmitting(true);
    try {
      const success = await ConfidenceEngine.submitFeedback(
        companyName,
        null,
        hsCode,
        country,
        confidenceScore,
        'correct'
      );
      
      if (success) {
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          onFeedbackSubmitted?.();
        }, 2000);
      }
    } catch (error) {
      console.error('Feedback submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleIncorrectClick = () => {
    setFeedbackType('incorrect');
  };

  const handleCorrectionSubmit = async () => {
    if (!correctedName.trim()) return;
    
    setIsSubmitting(true);
    try {
      const success = await ConfidenceEngine.submitFeedback(
        companyName,
        correctedName.trim(),
        hsCode,
        country,
        confidenceScore,
        'correction'
      );
      
      if (success) {
        setShowSuccess(true);
        setCorrectedName('');
        setFeedbackType(null);
        setTimeout(() => {
          setShowSuccess(false);
          onFeedbackSubmitted?.();
        }, 2000);
      }
    } catch (error) {
      console.error('Correction submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleIncorrectSubmit = async () => {
    setIsSubmitting(true);
    try {
      const success = await ConfidenceEngine.submitFeedback(
        companyName,
        null,
        hsCode,
        country,
        confidenceScore,
        'incorrect'
      );
      
      if (success) {
        setShowSuccess(true);
        setFeedbackType(null);
        setTimeout(() => {
          setShowSuccess(false);
          onFeedbackSubmitted?.();
        }, 2000);
      }
    } catch (error) {
      console.error('Feedback submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showSuccess) {
    return (
      <div className={`flex items-center space-x-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg ${className}`}>
        <div className="text-green-600 text-sm font-medium">
          ✅ Thank you for your feedback! This helps improve our matching accuracy.
        </div>
      </div>
    );
  }

  return (
    <div className={`border rounded-lg p-3 bg-gray-50 ${className}`}>
      <div className="text-sm font-medium text-gray-700 mb-2">
        Is this the correct company?
      </div>
      
      {feedbackType === null && (
        <div className="flex items-center space-x-2">
          <button
            onClick={handleCorrectClick}
            disabled={isSubmitting}
            className="inline-flex items-center px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded transition-colors disabled:opacity-50"
          >
            <ThumbsUp className="w-3 h-3 mr-1" />
            Yes
          </button>
          
          <button
            onClick={handleIncorrectClick}
            disabled={isSubmitting}
            className="inline-flex items-center px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded transition-colors disabled:opacity-50"
          >
            <ThumbsDown className="w-3 h-3 mr-1" />
            No
          </button>
          
          <button
            onClick={() => setFeedbackType('correction')}
            disabled={isSubmitting}
            className="inline-flex items-center px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded transition-colors disabled:opacity-50"
          >
            <Edit3 className="w-3 h-3 mr-1" />
            Suggest Correction
          </button>
        </div>
      )}

      {feedbackType === 'incorrect' && (
        <div className="space-y-2">
          <div className="text-sm text-gray-600">
            Thank you for reporting this incorrect match. This helps us improve our system.
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleIncorrectSubmit}
              disabled={isSubmitting}
              className="inline-flex items-center px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded transition-colors disabled:opacity-50"
            >
              <Send className="w-3 h-3 mr-1" />
              Submit Feedback
            </button>
            <button
              onClick={() => setFeedbackType(null)}
              className="inline-flex items-center px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white text-xs font-medium rounded transition-colors"
            >
              <X className="w-3 h-3 mr-1" />
              Cancel
            </button>
          </div>
        </div>
      )}

      {feedbackType === 'correction' && (
        <div className="space-y-2">
          <div className="text-sm text-gray-600">
            What is the correct company name?
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={correctedName}
              onChange={(e) => setCorrectedName(e.target.value)}
              placeholder="Enter correct company name..."
              className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={handleCorrectionSubmit}
              disabled={isSubmitting || !correctedName.trim()}
              className="inline-flex items-center px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded transition-colors disabled:opacity-50"
            >
              <Send className="w-3 h-3 mr-1" />
              Submit
            </button>
            <button
              onClick={() => {
                setFeedbackType(null);
                setCorrectedName('');
              }}
              className="inline-flex items-center px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white text-xs font-medium rounded transition-colors"
            >
              <X className="w-3 h-3 mr-1" />
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}