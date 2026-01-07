import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Edit, Check, X, AlertCircle, MessageSquare, 
  ThumbsUp, ThumbsDown, Send, History
} from 'lucide-react';
import { toast } from 'sonner';

const CORRECTABLE_FIELDS = [
  { id: 'risk_profile', label: 'Risk Profile', options: ['conservative', 'moderate', 'aggressive'] },
  { id: 'cognitive_style', label: 'Cognitive Style', options: ['analytical', 'intuitive', 'systematic', 'creative'] },
  { id: 'communication_style', label: 'Communication Style', options: ['analytical', 'expressive', 'amiable', 'driver'] },
  { id: 'top_motivation', label: 'Primary Motivation', options: ['achievement', 'growth', 'security', 'connection', 'autonomy', 'status'] }
];

export default function ProfileCorrectionForm({ 
  dataProfile, 
  psychographicProfile,
  onSubmitCorrection 
}) {
  const [selectedField, setSelectedField] = useState('');
  const [correctedValue, setCorrectedValue] = useState('');
  const [explanation, setExplanation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const existingCorrections = dataProfile?.user_corrections || [];

  const handleSubmit = async () => {
    if (!selectedField || !correctedValue) {
      toast.error('Please select a field and provide a correction');
      return;
    }

    setIsSubmitting(true);
    
    const correction = {
      field: selectedField,
      ai_inference: getCurrentValue(selectedField),
      user_correction: correctedValue,
      explanation,
      corrected_at: new Date().toISOString()
    };

    try {
      await onSubmitCorrection(correction);
      toast.success('Correction submitted! We\'ll review and update your profile.');
      setSelectedField('');
      setCorrectedValue('');
      setExplanation('');
    } catch (error) {
      toast.error('Failed to submit correction');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCurrentValue = (field) => {
    switch (field) {
      case 'risk_profile':
        return psychographicProfile?.risk_profile || 'unknown';
      case 'cognitive_style':
        return psychographicProfile?.cognitive_style || 'unknown';
      case 'communication_style':
        return dataProfile?.visible_profile?.communication_style || 'unknown';
      case 'top_motivation':
        return psychographicProfile?.motivation_stack_v2?.[0]?.label || 'unknown';
      default:
        return 'unknown';
    }
  };

  const selectedFieldConfig = CORRECTABLE_FIELDS.find(f => f.id === selectedField);

  return (
    <Card className="bg-[#111] border-[#262626]">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Edit className="w-5 h-5 text-[#f59e0b]" />
          Correct Your Profile
        </CardTitle>
        <p className="text-sm text-[#a3a3a3]">
          Think our AI got something wrong? Help us understand you better.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Field Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-white">What would you like to correct?</label>
          <Select value={selectedField} onValueChange={setSelectedField}>
            <SelectTrigger className="bg-[#1a1a1a] border-[#333] text-white">
              <SelectValue placeholder="Select a field to correct" />
            </SelectTrigger>
            <SelectContent>
              {CORRECTABLE_FIELDS.map((field) => (
                <SelectItem key={field.id} value={field.id}>
                  <div className="flex items-center justify-between w-full">
                    <span>{field.label}</span>
                    <Badge className="ml-2 bg-[#262626] text-[#a3a3a3] text-xs">
                      Current: {getCurrentValue(field.id)}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Current vs Corrected */}
        {selectedField && (
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-[#1a1a1a] border border-[#333]">
              <div className="flex items-center gap-2 mb-2">
                <ThumbsDown className="w-4 h-4 text-red-400" />
                <span className="text-xs text-[#6b7280]">AI Inference</span>
              </div>
              <Badge className="bg-red-500/20 text-red-400 capitalize">
                {getCurrentValue(selectedField)}
              </Badge>
            </div>
            
            <div className="p-4 rounded-lg bg-[#1a1a1a] border border-[#00d4ff]/30">
              <div className="flex items-center gap-2 mb-2">
                <ThumbsUp className="w-4 h-4 text-green-400" />
                <span className="text-xs text-[#6b7280]">Your Correction</span>
              </div>
              <Select value={correctedValue} onValueChange={setCorrectedValue}>
                <SelectTrigger className="bg-[#262626] border-[#333] text-white h-8">
                  <SelectValue placeholder="Select correct value" />
                </SelectTrigger>
                <SelectContent>
                  {selectedFieldConfig?.options.map((option) => (
                    <SelectItem key={option} value={option}>
                      <span className="capitalize">{option}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Explanation */}
        {selectedField && correctedValue && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#a3a3a3]" />
              Why do you think this is more accurate? (optional)
            </label>
            <Textarea
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="Help us understand why the AI inference was incorrect..."
              className="bg-[#1a1a1a] border-[#333] text-white min-h-[80px]"
            />
          </div>
        )}

        {/* Submit */}
        <Button
          onClick={handleSubmit}
          disabled={!selectedField || !correctedValue || isSubmitting}
          className="w-full bg-[#00d4ff] hover:bg-[#0ea5e9] text-black"
        >
          {isSubmitting ? (
            <>Processing...</>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Submit Correction
            </>
          )}
        </Button>

        {/* Info Box */}
        <div className="p-4 rounded-lg bg-[#1a1a1a] border border-[#262626]">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-[#f59e0b] flex-shrink-0 mt-0.5" />
            <div className="text-sm text-[#a3a3a3]">
              <p className="mb-2">Your corrections help improve our AI:</p>
              <ul className="space-y-1 text-xs">
                <li>• Corrections are reviewed and applied within 24 hours</li>
                <li>• They directly influence future personalization</li>
                <li>• Your feedback trains our models to be more accurate</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Correction History */}
        {existingCorrections.length > 0 && (
          <div>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-2 text-sm text-[#00d4ff] hover:text-[#0ea5e9] transition-colors"
            >
              <History className="w-4 h-4" />
              {showHistory ? 'Hide' : 'View'} Correction History ({existingCorrections.length})
            </button>

            {showHistory && (
              <div className="mt-4 space-y-3">
                {existingCorrections.map((correction, i) => (
                  <div key={i} className="p-3 rounded-lg bg-[#1a1a1a] border border-[#262626]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-white capitalize">
                        {correction.field.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-[#6b7280]">
                        {new Date(correction.corrected_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Badge className="bg-red-500/20 text-red-400">{correction.ai_inference}</Badge>
                      <span className="text-[#6b7280]">→</span>
                      <Badge className="bg-green-500/20 text-green-400">{correction.user_correction}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}