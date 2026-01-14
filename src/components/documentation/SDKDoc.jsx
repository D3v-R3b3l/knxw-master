import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Code, Terminal, Zap } from "lucide-react";

export default function SDKDoc() {
  const [activeTab, setActiveTab] = useState('javascript');

  return (
    <div className="prose prose-invert max-w-none">
      <h3 className="text-2xl font-bold text-white mb-4">SDK Documentation</h3>
      <p className="text-[#a3a3a3] mb-6">
        Official SDKs for integrating knXw psychographic intelligence into your applications across multiple platforms and languages.
      </p>

      <div className="flex gap-2 mb-6 border-b border-[#262626] overflow-x-auto">
        {['javascript', 'python', 'go', 'ruby', 'php'].map(lang => (
          <button
            key={lang}
            onClick={() => setActiveTab(lang)}
            className={`px-4 py-2 font-semibold text-sm capitalize transition-all whitespace-nowrap ${
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
          <h4 className="text-xl font-semibold text-white mb-4">JavaScript / Node.js SDK</h4>
          
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
  autoTrack: true // Enable automatic event tracking
});

// Track custom events
knxw.track('button_click', {
  button_id: 'signup_cta',
  page: '/landing'
});

// Get user's psychographic profile
const profile = await knxw.getProfile('user_123');
console.log(profile.cognitive_style); // 'analytical'
console.log(profile.risk_profile);    // 'moderate'

// Get personalized recommendations
const recs = await knxw.getRecommendations('user_123');`}
            </pre>
          </div>

          <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-6 mb-6">
            <h5 className="text-lg font-semibold text-[#00d4ff] mb-3">CRM Integrations</h5>
            <pre className="bg-[#0a0a0a] border border-[#262626] rounded p-4 text-sm text-[#10b981] overflow-x-auto">
{`// Sync profile to HubSpot
await knxw.crm.hubspot.syncProfile('user_123', {
  email: 'user@example.com'
});

// Sync profile to Zoho CRM
await knxw.crm.zoho.syncContact('user_123', {
  email: 'user@example.com',
  module: 'Contacts' // or 'Leads'
});

// Sync profile to Pipedrive
await knxw.crm.pipedrive.syncPerson('user_123', {
  email: 'user@example.com'
});

// Get selling strategy recommendations
const strategy = await knxw.crm.pipedrive.getSellingStrategy('user_123');
console.log(strategy.approach); // 'value_focused'`}
            </pre>
          </div>

          <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-6 mb-6">
            <h5 className="text-lg font-semibold text-[#00d4ff] mb-3">E-commerce Integrations</h5>
            <pre className="bg-[#0a0a0a] border border-[#262626] rounded p-4 text-sm text-[#10b981] overflow-x-auto">
{`// Shopify integration
await knxw.ecommerce.shopify.syncCustomer('user_123', {
  email: 'customer@example.com'
});

const shopifyRecs = await knxw.ecommerce.shopify.getRecommendations('user_123');

// Magento integration
await knxw.ecommerce.magento.syncCustomer('user_123', {
  email: 'customer@example.com'
});

const magentoRecs = await knxw.ecommerce.magento.getRecommendations('user_123');
console.log(magentoRecs.recommendation_strategy);`}
            </pre>
          </div>

          <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-6 mb-6">
            <h5 className="text-lg font-semibold text-[#00d4ff] mb-3">BI Data Export</h5>
            <pre className="bg-[#0a0a0a] border border-[#262626] rounded p-4 text-sm text-[#10b981] overflow-x-auto">
{`// Export data for BI tools
const exportData = await knxw.bi.export({
  platform: 'tableau', // 'powerbi', 'looker', 'generic'
  format: 'csv',       // 'json', 'csv'
  dataSources: ['psychographic_profiles', 'events', 'insights'],
  filters: {
    dateRangeDays: 30,
    includeDemoData: false
  }
});

// Get data schema for BI tool configuration
const schema = await knxw.bi.getSchema();`}
            </pre>
          </div>

          <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-6 mb-6">
            <h5 className="text-lg font-semibold text-[#00d4ff] mb-3">Communication (Twilio)</h5>
            <pre className="bg-[#0a0a0a] border border-[#262626] rounded p-4 text-sm text-[#10b981] overflow-x-auto">
{`// Send personalized SMS based on psychographic profile
await knxw.communications.twilio.sendSms({
  to: '+1234567890',
  message: 'Your personalized offer awaits!',
  userId: 'user_123' // Auto-personalizes based on profile
});

// Send psychographic-aware alert
await knxw.communications.twilio.sendPsychographicAlert({
  to: '+1234567890',
  userId: 'user_123',
  insight: {
    title: 'Engagement Opportunity',
    description: 'User shows high purchase intent'
  }
});`}
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

# Track events
client.track(
    user_id='user_123',
    event_type='page_view',
    event_payload={'url': '/dashboard'}
)

# Get psychographic profile
profile = client.get_profile('user_123')
print(profile['cognitive_style'])  # 'analytical'
print(profile['risk_profile'])     # 'moderate'`}
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

          <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-6 mb-6">
            <h5 className="text-lg font-semibold text-[#00d4ff] mb-3">CRM & E-commerce Integrations</h5>
            <pre className="bg-[#0a0a0a] border border-[#262626] rounded p-4 text-sm text-[#10b981] overflow-x-auto">
{`# Sync to HubSpot
client.crm.hubspot.sync_profile('user_123', email='user@example.com')

# Sync to Zoho CRM
client.crm.zoho.sync_contact('user_123', email='user@example.com')

# Sync to Pipedrive
client.crm.pipedrive.sync_person('user_123', email='user@example.com')

# Shopify integration
client.ecommerce.shopify.sync_customer('user_123', email='customer@example.com')

# Magento integration
client.ecommerce.magento.sync_customer('user_123', email='customer@example.com')

# Get product recommendations
recs = client.ecommerce.shopify.get_recommendations('user_123')
print(recs['recommendation_strategy'])`}
            </pre>
          </div>

          <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-6 mb-6">
            <h5 className="text-lg font-semibold text-[#00d4ff] mb-3">BI Export</h5>
            <pre className="bg-[#0a0a0a] border border-[#262626] rounded p-4 text-sm text-[#10b981] overflow-x-auto">
{`# Export for Tableau
data = client.bi.export(
    platform='tableau',
    format='csv',
    data_sources=['psychographic_profiles', 'events'],
    filters={'date_range_days': 30}
)

# Export for Power BI
data = client.bi.export(
    platform='powerbi',
    format='json',
    data_sources=['psychographic_profiles', 'insights']
)`}
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
    
    // Track events
    client.Track(knxw.Event{
        UserID: "user_123",
        EventType: "page_view",
        EventPayload: map[string]interface{}{
            "url": "/dashboard",
        },
    })
    
    // Get profile
    profile, _ := client.GetProfile("user_123")
    fmt.Println(profile.CognitiveStyle)
}`}
            </pre>
          </div>

          <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-6 mb-6">
            <h5 className="text-lg font-semibold text-[#00d4ff] mb-3">Gin Framework Middleware</h5>
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
                EventPayload: map[string]interface{}{
                    "path": c.Request.URL.Path,
                },
            })
        }
        c.Next()
    })
    
    r.Run()
}`}
            </pre>
          </div>

          <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-6 mb-6">
            <h5 className="text-lg font-semibold text-[#00d4ff] mb-3">CRM Integrations</h5>
            <pre className="bg-[#0a0a0a] border border-[#262626] rounded p-4 text-sm text-[#10b981] overflow-x-auto">
{`// Sync to HubSpot
client.CRM.HubSpot.SyncProfile("user_123", knxw.SyncOptions{
    Email: "user@example.com",
})

// Sync to Pipedrive
client.CRM.Pipedrive.SyncPerson("user_123", knxw.SyncOptions{
    Email: "user@example.com",
})

// Get selling strategy
strategy, _ := client.CRM.Pipedrive.GetSellingStrategy("user_123")`}
            </pre>
          </div>
        </div>
      )}

      {activeTab === 'ruby' && (
        <div>
          <h4 className="text-xl font-semibold text-white mb-4">Ruby SDK</h4>
          
          <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-6 mb-6">
            <h5 className="text-lg font-semibold text-[#00d4ff] mb-3">Installation</h5>
            <pre className="bg-[#0a0a0a] border border-[#262626] rounded p-4 text-sm text-[#10b981] overflow-x-auto">
gem install knxw-sdk
            </pre>
          </div>

          <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-6 mb-6">
            <h5 className="text-lg font-semibold text-[#00d4ff] mb-3">Quick Start</h5>
            <pre className="bg-[#0a0a0a] border border-[#262626] rounded p-4 text-sm text-[#10b981] overflow-x-auto">
{`require 'knxw'

client = Knxw::Client.new(api_key: 'your_api_key_here')

# Track events
client.track(
  user_id: 'user_123',
  event_type: 'page_view',
  event_payload: { url: '/dashboard' }
)

# Get psychographic profile
profile = client.get_profile('user_123')
puts profile[:cognitive_style]  # 'analytical'
puts profile[:risk_profile]     # 'moderate'`}
            </pre>
          </div>

          <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-6 mb-6">
            <h5 className="text-lg font-semibold text-[#00d4ff] mb-3">Rails Integration</h5>
            <pre className="bg-[#0a0a0a] border border-[#262626] rounded p-4 text-sm text-[#10b981] overflow-x-auto">
{`# config/initializers/knxw.rb
Knxw.configure do |config|
  config.api_key = ENV['KNXW_API_KEY']
end

# app/controllers/application_controller.rb
class ApplicationController < ActionController::Base
  after_action :track_page_view
  
  private
  
  def track_page_view
    return unless current_user
    
    Knxw.client.track(
      user_id: current_user.id.to_s,
      event_type: 'page_view',
      event_payload: { url: request.path }
    )
  end
end`}
            </pre>
          </div>
        </div>
      )}

      {activeTab === 'php' && (
        <div>
          <h4 className="text-xl font-semibold text-white mb-4">PHP SDK</h4>
          
          <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-6 mb-6">
            <h5 className="text-lg font-semibold text-[#00d4ff] mb-3">Installation</h5>
            <pre className="bg-[#0a0a0a] border border-[#262626] rounded p-4 text-sm text-[#10b981] overflow-x-auto">
composer require knxw/sdk
            </pre>
          </div>

          <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-6 mb-6">
            <h5 className="text-lg font-semibold text-[#00d4ff] mb-3">Quick Start</h5>
            <pre className="bg-[#0a0a0a] border border-[#262626] rounded p-4 text-sm text-[#10b981] overflow-x-auto">
{`<?php
use Knxw\\Client;

$client = new Client('your_api_key_here');

// Track events
$client->track([
    'user_id' => 'user_123',
    'event_type' => 'page_view',
    'event_payload' => ['url' => '/dashboard']
]);

// Get psychographic profile
$profile = $client->getProfile('user_123');
echo $profile['cognitive_style'];  // 'analytical'
echo $profile['risk_profile'];     // 'moderate'`}
            </pre>
          </div>

          <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-6 mb-6">
            <h5 className="text-lg font-semibold text-[#00d4ff] mb-3">Laravel Integration</h5>
            <pre className="bg-[#0a0a0a] border border-[#262626] rounded p-4 text-sm text-[#10b981] overflow-x-auto">
{`<?php
// config/knxw.php
return [
    'api_key' => env('KNXW_API_KEY'),
];

// app/Http/Middleware/TrackKnxw.php
namespace App\\Http\\Middleware;

use Knxw\\Client;

class TrackKnxw
{
    protected $client;
    
    public function __construct()
    {
        $this->client = new Client(config('knxw.api_key'));
    }
    
    public function handle($request, $next)
    {
        $response = $next($request);
        
        if (auth()->check()) {
            $this->client->track([
                'user_id' => auth()->id(),
                'event_type' => 'page_view',
                'event_payload' => ['url' => $request->path()]
            ]);
        }
        
        return $response;
    }
}`}
            </pre>
          </div>
        </div>
      )}

      {/* Integration Summary */}
      <div className="mt-8 bg-gradient-to-r from-[#00d4ff]/10 to-[#8b5cf6]/10 border border-[#00d4ff]/20 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-[#00d4ff]" />
          Available Integrations
        </h4>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <h5 className="text-sm font-semibold text-[#00d4ff] mb-2">CRM Platforms</h5>
            <ul className="text-sm text-[#a3a3a3] space-y-1">
              <li>• HubSpot</li>
              <li>• Salesforce</li>
              <li>• Zoho CRM</li>
              <li>• Pipedrive</li>
            </ul>
          </div>
          <div>
            <h5 className="text-sm font-semibold text-[#00d4ff] mb-2">E-commerce</h5>
            <ul className="text-sm text-[#a3a3a3] space-y-1">
              <li>• Shopify</li>
              <li>• Magento</li>
              <li>• WooCommerce (coming soon)</li>
            </ul>
          </div>
          <div>
            <h5 className="text-sm font-semibold text-[#00d4ff] mb-2">BI & Communication</h5>
            <ul className="text-sm text-[#a3a3a3] space-y-1">
              <li>• Tableau</li>
              <li>• Power BI</li>
              <li>• Twilio SMS</li>
              <li>• Slack</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}