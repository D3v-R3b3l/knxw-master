import React, { useState, useEffect } from 'react';
import { EngagementTemplate } from '@/entities/all';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, X, MessageSquare, Palette, Sparkles } from 'lucide-react';

export default function EngagementTemplateBuilder({ template, clientApp, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'checkin',
    content: {
      title: '',
      message: '',
      questions: [],
      buttons: [],
      style: {
        theme: 'dark',
        position: 'bottom-right',
        auto_dismiss_seconds: null
      }
    },
    personalization: {
      use_psychographic_data: false,
      dynamic_fields: []
    }
  });

  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name || '',
        type: template.type || 'checkin',
        content: template.content || {
          title: '',
          message: '',
          questions: [],
          buttons: [],
          style: {
            theme: 'dark',
            position: 'bottom-right',
            auto_dismiss_seconds: null
          }
        },
        personalization: template.personalization || {
          use_psychographic_data: false,
          dynamic_fields: []
        }
      });
    }
  }, [template]);

  const handleSave = async () => {
    const templateData = {
      ...formData,
      client_app_id: clientApp.id,
      owner_id: clientApp.owner_id
    };

    try {
      if (template) {
        await EngagementTemplate.update(template.id, templateData);
      } else {
        await EngagementTemplate.create(templateData);
      }
      onSave();
    } catch (error) {
      console.error('Error saving template:', error);
    }
  };

  const addQuestion = () => {
    setFormData(prev => ({
      ...prev,
      content: {
        ...prev.content,
        questions: [...prev.content.questions, '']
      }
    }));
  };

  const removeQuestion = (index) => {
    setFormData(prev => ({
      ...prev,
      content: {
        ...prev.content,
        questions: prev.content.questions.filter((_, i) => i !== index)
      }
    }));
  };

  const updateQuestion = (index, value) => {
    setFormData(prev => ({
      ...prev,
      content: {
        ...prev.content,
        questions: prev.content.questions.map((q, i) => i === index ? value : q)
      }
    }));
  };

  const addButton = () => {
    setFormData(prev => ({
      ...prev,
      content: {
        ...prev.content,
        buttons: [
          ...prev.content.buttons,
          { text: '', action: 'dismiss', action_value: '' }
        ]
      }
    }));
  };

  const removeButton = (index) => {
    setFormData(prev => ({
      ...prev,
      content: {
        ...prev.content,
        buttons: prev.content.buttons.filter((_, i) => i !== index)
      }
    }));
  };

  const updateButton = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      content: {
        ...prev.content,
        buttons: prev.content.buttons.map((button, i) =>
          i === index ? { ...button, [field]: value } : button
        )
      }
    }));
  };

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <Card className="bg-[#1a1a1a] border-[#262626]">
        <CardHeader className="pb-4">
          <CardTitle className="text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#fbbf24]" />
            Template Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#a3a3a3] mb-2">Template Name</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Welcome Checkin, Exit Intent Modal"
                className="bg-[#0a0a0a] border-[#262626] text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#a3a3a3] mb-2">Engagement Type</label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger className="bg-[#0a0a0a] border-[#262626]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#111111] border-[#262626]">
                  <SelectItem value="checkin">Check-in Widget</SelectItem>
                  <SelectItem value="tooltip">Tooltip</SelectItem>
                  <SelectItem value="modal">Modal Dialog</SelectItem>
                  <SelectItem value="notification">Notification</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Configuration */}
      <Card className="bg-[#1a1a1a] border-[#262626]">
        <CardHeader className="pb-4">
          <CardTitle className="text-white">Content & Messaging</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="content" className="space-y-4">
            <TabsList className="bg-[#0a0a0a] border border-[#262626]">
              <TabsTrigger value="content" className="data-[state=active]:bg-[#fbbf24] data-[state=active]:text-[#0a0a0a]">
                <MessageSquare className="w-4 h-4 mr-2" />
                Content
              </TabsTrigger>
              <TabsTrigger value="style" className="data-[state=active]:bg-[#fbbf24] data-[state=active]:text-[#0a0a0a]">
                <Palette className="w-4 h-4 mr-2" />
                Style
              </TabsTrigger>
              <TabsTrigger value="personalization" className="data-[state=active]:bg-[#fbbf24] data-[state=active]:text-[#0a0a0a]">
                <Sparkles className="w-4 h-4 mr-2" />
                Personalization
              </TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#a3a3a3] mb-2">Title</label>
                <Input
                  value={formData.content.title}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    content: { ...prev.content, title: e.target.value }
                  }))}
                  placeholder="e.g., Quick Question, Welcome!, How are you feeling?"
                  className="bg-[#0a0a0a] border-[#262626] text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#a3a3a3] mb-2">Message</label>
                <Textarea
                  value={formData.content.message}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    content: { ...prev.content, message: e.target.value }
                  }))}
                  placeholder="Main message content that will be displayed to users"
                  className="bg-[#0a0a0a] border-[#262626] text-white h-20"
                />
              </div>

              {formData.type === 'checkin' && (
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="block text-sm font-medium text-[#a3a3a3]">Questions</label>
                    <Button
                      size="sm"
                      onClick={addQuestion}
                      className="bg-[#fbbf24] hover:bg-[#f59e0b] text-[#0a0a0a]"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add Question
                    </Button>
                  </div>
                  {formData.content.questions.map((question, index) => (
                    <div key={index} className="flex items-center gap-3 mb-2">
                      <Input
                        value={question}
                        onChange={(e) => updateQuestion(index, e.target.value)}
                        placeholder={`Question ${index + 1}`}
                        className="flex-1 bg-[#0a0a0a] border-[#262626] text-white"
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => removeQuestion(index)}
                        className="text-[#ef4444] hover:bg-[#ef4444]/10"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {(formData.type === 'modal' || formData.type === 'notification') && (
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="block text-sm font-medium text-[#a3a3a3]">Action Buttons</label>
                    <Button
                      size="sm"
                      onClick={addButton}
                      className="bg-[#fbbf24] hover:bg-[#f59e0b] text-[#0a0a0a]"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add Button
                    </Button>
                  </div>
                  {formData.content.buttons.map((button, index) => (
                    <div key={index} className="flex items-center gap-3 mb-2">
                      <Input
                        value={button.text}
                        onChange={(e) => updateButton(index, 'text', e.target.value)}
                        placeholder="Button text"
                        className="flex-1 bg-[#0a0a0a] border-[#262626] text-white"
                      />
                      <Select
                        value={button.action}
                        onValueChange={(value) => updateButton(index, 'action', value)}
                      >
                        <SelectTrigger className="w-32 bg-[#0a0a0a] border-[#262626]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#111111] border-[#262626]">
                          <SelectItem value="dismiss">Dismiss</SelectItem>
                          <SelectItem value="redirect">Redirect</SelectItem>
                          <SelectItem value="track_event">Track Event</SelectItem>
                        </SelectContent>
                      </Select>
                      {button.action !== 'dismiss' && (
                        <Input
                          value={button.action_value}
                          onChange={(e) => updateButton(index, 'action_value', e.target.value)}
                          placeholder={button.action === 'redirect' ? 'URL' : 'Event name'}
                          className="w-32 bg-[#0a0a0a] border-[#262626] text-white"
                        />
                      )}
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => removeButton(index)}
                        className="text-[#ef4444] hover:bg-[#ef4444]/10"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="style" className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#a3a3a3] mb-2">Theme</label>
                  <Select
                    value={formData.content.style.theme}
                    onValueChange={(value) => setFormData(prev => ({
                      ...prev,
                      content: {
                        ...prev.content,
                        style: { ...prev.content.style, theme: value }
                      }
                    }))}
                  >
                    <SelectTrigger className="bg-[#0a0a0a] border-[#262626]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#111111] border-[#262626]">
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="brand">Brand</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#a3a3a3] mb-2">Position</label>
                  <Select
                    value={formData.content.style.position}
                    onValueChange={(value) => setFormData(prev => ({
                      ...prev,
                      content: {
                        ...prev.content,
                        style: { ...prev.content.style, position: value }
                      }
                    }))}
                  >
                    <SelectTrigger className="bg-[#0a0a0a] border-[#262626]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#111111] border-[#262626]">
                      <SelectItem value="bottom-right">Bottom Right</SelectItem>
                      <SelectItem value="bottom-left">Bottom Left</SelectItem>
                      <SelectItem value="center">Center</SelectItem>
                      <SelectItem value="top-center">Top Center</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#a3a3a3] mb-2">Auto Dismiss (seconds)</label>
                  <Input
                    type="number"
                    value={formData.content.style.auto_dismiss_seconds || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      content: {
                        ...prev.content,
                        style: {
                          ...prev.content.style,
                          auto_dismiss_seconds: e.target.value ? parseInt(e.target.value) : null
                        }
                      }
                    }))}
                    placeholder="Optional"
                    className="bg-[#0a0a0a] border-[#262626] text-white"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="personalization" className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-[#0a0a0a] border border-[#262626]">
                <div>
                  <h4 className="font-semibold text-white">AI Personalization</h4>
                  <p className="text-sm text-[#a3a3a3]">
                    Use psychographic data to personalize content for each user
                  </p>
                </div>
                <Switch
                  checked={formData.personalization.use_psychographic_data}
                  onCheckedChange={(checked) => setFormData(prev => ({
                    ...prev,
                    personalization: {
                      ...prev.personalization,
                      use_psychographic_data: checked
                    }
                  }))}
                />
              </div>

              {formData.personalization.use_psychographic_data && (
                <div className="p-4 rounded-lg bg-[#00d4ff]/10 border border-[#00d4ff]/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-[#00d4ff]" />
                    <p className="text-sm font-medium text-[#00d4ff]">AI Personalization Enabled</p>
                  </div>
                  <p className="text-xs text-[#a3a3a3]">
                    The content will be automatically personalized based on the user's psychographic profile,
                    emotional state, and recent behavior patterns.
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card className="bg-[#1a1a1a] border-[#262626]">
        <CardHeader className="pb-4">
          <CardTitle className="text-white">Preview</CardTitle>
          <p className="text-sm text-[#a3a3a3]">This is how your engagement will appear to users</p>
        </CardHeader>
        <CardContent>
          <div className="p-6 rounded-lg bg-[#0a0a0a] border border-[#262626] min-h-[200px] flex items-center justify-center">
            <div className="w-full max-w-xs bg-gradient-to-br from-[#1a1a1a] to-[#111111] border border-[#262626] rounded-xl p-4 text-white text-center">
              <h3 className="font-bold mb-2">{formData.content.title || 'Template Title'}</h3>
              <p className="text-sm text-[#a3a3a3] mb-3">
                {formData.content.message || 'Template message content will appear here'}
              </p>
              {formData.type === 'checkin' && formData.content.questions.length > 0 && (
                <div className="space-y-2">
                  {formData.content.questions.slice(0, 2).map((question, index) => (
                    <div key={index} className="p-2 rounded bg-[#262626] text-xs">
                      {question || `Question ${index + 1}`}
                    </div>
                  ))}
                  {formData.content.questions.length > 2 && (
                    <div className="text-xs text-[#a3a3a3]">
                      +{formData.content.questions.length - 2} more questions
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onCancel} className="border-[#262626] hover:border-[#a3a3a3]">
          Cancel
        </Button>
        <Button 
          onClick={handleSave}
          className="bg-[#fbbf24] hover:bg-[#f59e0b] text-[#0a0a0a]"
          disabled={!formData.name || !formData.content.title}
        >
          {template ? 'Update Template' : 'Create Template'}
        </Button>
      </div>
    </div>
  );
}