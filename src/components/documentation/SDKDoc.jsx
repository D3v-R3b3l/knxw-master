import React, { useState } from "react";

export default function SDKDoc() {
  const [activeTab, setActiveTab] = useState('javascript');

  return (
    <div className="prose prose-invert max-w-none">
      <h3 className="text-2xl font-bold text-white mb-4">SDK Documentation</h3>
      <p className="text-[#a3a3a3] mb-6">
        Official SDKs for integrating knXw psychographic intelligence into your applications across multiple platforms and languages.
      </p>

      <div className="flex gap-2 mb-6 border-b border-[#262626]">
        {['javascript', 'python', 'go'].map(lang => (
          <button
            key={lang}
            onClick={() => setActiveTab(lang)}
            className={`px-4 py-2 font-semibold text-sm capitalize transition-all ${
              activeTab === lang
                ? 'text-[#00d4ff] border-b-2 border-[#00d4ff]'
                : 'text-[#a3a3a3] hover:text-white'
            }`}
          >
            {lang}
          </button>
        ))}
      </div>

      {activeTab === 'javascript' && (
        <div>
          <h4 className="text-xl font-semibold text-white mb-4">JavaScript SDK</h4>
          
          <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-6 mb-6">
            <h5 className="text-lg font-semibold text-[#00d4ff] mb-3">Installation</h5>
            <pre className="bg-[#0a0a0a] border border-[#262626] rounded p-4 text-sm text-[#10b981] overflow-x-auto">
npm install @knxw/sdk
            </pre>
          </div>

          <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-6 mb-6">
            <h5 className="text-lg font-semibold text-[#00d4ff] mb-3">Quick Start</h5>
            <pre className="bg-[#0a0a0a] border border-[#262626] rounded p-4 text-sm text-[#10b981] overflow-x-auto">
{`import { KnxwClient } from '@knxw/sdk';

const knxw = new KnxwClient({
  apiKey: 'your_api_key_here',
  autoTrack: true
});

knxw.track('button_click', {
  button_id: 'signup_cta'
});

const profile = await knxw.getProfile('user_123');`}
            </pre>
          </div>
        </div>
      )}

      {activeTab === 'python' && (
        <div>
          <h4 className="text-xl font-semibold text-white mb-4">Python SDK</h4>
          
          <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-6 mb-6">
            <h5 className="text-lg font-semibold text-[#00d4ff] mb-3">Installation</h5>
            <pre className="bg-[#0a0a0a] border border-[#262626] rounded p-4 text-sm text-[#10b981] overflow-x-auto">
pip install knxw-sdk
            </pre>
          </div>

          <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-6 mb-6">
            <h5 className="text-lg font-semibold text-[#00d4ff] mb-3">Quick Start</h5>
            <pre className="bg-[#0a0a0a] border border-[#262626] rounded p-4 text-sm text-[#10b981] overflow-x-auto">
{`from knxw import KnxwClient

client = KnxwClient(api_key='your_api_key_here')

client.track(
    user_id='user_123',
    event_type='page_view',
    event_payload={'url': '/dashboard'}
)

profile = client.get_profile('user_123')
print(profile['cognitive_style'])`}
            </pre>
          </div>

          <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-6 mb-6">
            <h5 className="text-lg font-semibold text-[#00d4ff] mb-3">Django Integration</h5>
            <pre className="bg-[#0a0a0a] border border-[#262626] rounded p-4 text-sm text-[#10b981] overflow-x-auto">
{`from knxw import KnxwClient
from django.conf import settings

class KnxwMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
        self.client = KnxwClient(api_key=settings.KNXW_API_KEY)
    
    def __call__(self, request):
        if request.user.is_authenticated:
            self.client.track(
                user_id=str(request.user.id),
                event_type='page_view',
                event_payload={'url': request.path}
            )
        return self.get_response(request)`}
            </pre>
          </div>
        </div>
      )}

      {activeTab === 'go' && (
        <div>
          <h4 className="text-xl font-semibold text-white mb-4">Go SDK</h4>
          
          <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-6 mb-6">
            <h5 className="text-lg font-semibold text-[#00d4ff] mb-3">Installation</h5>
            <pre className="bg-[#0a0a0a] border border-[#262626] rounded p-4 text-sm text-[#10b981] overflow-x-auto">
go get github.com/knxw/knxw-go
            </pre>
          </div>

          <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-6 mb-6">
            <h5 className="text-lg font-semibold text-[#00d4ff] mb-3">Quick Start</h5>
            <pre className="bg-[#0a0a0a] border border-[#262626] rounded p-4 text-sm text-[#10b981] overflow-x-auto">
{`package main

import "github.com/knxw/knxw-go"

func main() {
    client := knxw.NewClient("your_api_key_here")
    
    client.Track(knxw.Event{
        UserID: "user_123",
        EventType: "page_view",
        EventPayload: map[string]interface{}{
            "url": "/dashboard",
        },
    })
    
    profile, _ := client.GetProfile("user_123")
}`}
            </pre>
          </div>

          <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-6 mb-6">
            <h5 className="text-lg font-semibold text-[#00d4ff] mb-3">Gin Framework</h5>
            <pre className="bg-[#0a0a0a] border border-[#262626] rounded p-4 text-sm text-[#10b981] overflow-x-auto">
{`package main

import (
    "github.com/gin-gonic/gin"
    "github.com/knxw/knxw-go"
)

func main() {
    r := gin.Default()
    client := knxw.NewClient("your_api_key")
    
    r.Use(func(c *gin.Context) {
        userID := c.GetString("user_id")
        if userID != "" {
            go client.Track(knxw.Event{
                UserID: userID,
                EventType: "api_request",
            })
        }
        c.Next()
    })
    
    r.Run()
}`}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}