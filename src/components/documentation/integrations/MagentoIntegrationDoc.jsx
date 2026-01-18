import React from "react";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";

export default function MagentoIntegrationDoc() {
  return (
    <div className="prose prose-invert max-w-none">
      <h3 className="text-2xl font-bold text-white mb-4">Magento Integration</h3>
      <p className="text-[#a3a3a3] mb-6">
        Enhance your Magento e-commerce store with psychographic customer insights and personalized product recommendations.
      </p>

      <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-6 mb-6">
        <h4 className="text-lg font-semibold text-[#00d4ff] mb-3">Overview</h4>
        <p className="text-[#a3a3a3] mb-4">
          The Magento integration syncs psychographic profiles to customer records and generates AI-powered product 
          recommendation strategies based on each customer's cognitive style, purchase history, and behavioral patterns.
        </p>
        <div className="flex flex-wrap gap-2">
          <Badge className="bg-[#10b981]/20 text-[#10b981] border-[#10b981]/30">REST API</Badge>
          <Badge className="bg-[#8b5cf6]/20 text-[#8b5cf6] border-[#8b5cf6]/30">Customer Attributes</Badge>
          <Badge className="bg-[#f59e0b]/20 text-[#f59e0b] border-[#f59e0b]/30">Smart Recommendations</Badge>
        </div>
      </div>

      <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-6 mb-6">
        <h4 className="text-lg font-semibold text-[#00d4ff] mb-3">Setup Requirements</h4>
        <ol className="list-decimal list-inside text-[#a3a3a3] space-y-2">
          <li>Log in to your Magento Admin Panel</li>
          <li>Navigate to System → Extensions → Integrations</li>
          <li>Click "Add New Integration"</li>
          <li>Configure API Resources with required permissions</li>
          <li>Activate the integration and copy the Access Token</li>
          <li>Enter your store URL and token in the knXw integration panel</li>
        </ol>
        <a 
          href="https://developer.adobe.com/commerce/webapi/rest/tutorials/prerequisites/" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="inline-flex items-center text-[#00d4ff] hover:underline mt-4"
        >
          Magento REST API Documentation <ExternalLink className="w-4 h-4 ml-1" />
        </a>
      </div>

      <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-6 mb-6">
        <h4 className="text-lg font-semibold text-[#00d4ff] mb-3">Required API Permissions</h4>
        <ul className="text-[#a3a3a3] space-y-1">
          <li>• <code className="bg-[#0a0a0a] px-2 py-1 rounded">Magento_Customer::customer</code> - Read/Write customer data</li>
          <li>• <code className="bg-[#0a0a0a] px-2 py-1 rounded">Magento_Sales::sales</code> - Read order history</li>
          <li>• <code className="bg-[#0a0a0a] px-2 py-1 rounded">Magento_Catalog::catalog</code> - Read product data (for recommendations)</li>
        </ul>
      </div>

      <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-6 mb-6">
        <h4 className="text-lg font-semibold text-[#00d4ff] mb-3">Customer Attributes Created</h4>
        <p className="text-[#a3a3a3] mb-3">
          The integration creates custom customer attributes to store psychographic data:
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h5 className="font-medium text-white mb-2">Profile Attributes</h5>
            <ul className="text-sm text-[#a3a3a3] space-y-1">
              <li>• knxw_risk_profile</li>
              <li>• knxw_cognitive_style</li>
              <li>• knxw_emotional_mood</li>
              <li>• knxw_motivation</li>
            </ul>
          </div>
          <div>
            <h5 className="font-medium text-white mb-2">Analytics Attributes</h5>
            <ul className="text-sm text-[#a3a3a3] space-y-1">
              <li>• knxw_last_analyzed</li>
              <li>• knxw_recommendation_strategy</li>
              <li>• knxw_preferred_categories</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-6 mb-6">
        <h4 className="text-lg font-semibold text-[#00d4ff] mb-3">Recommendation Strategies</h4>
        <p className="text-[#a3a3a3] mb-4">
          Based on psychographic analysis and purchase history, the integration generates personalized recommendation strategies:
        </p>
        <pre className="bg-[#0a0a0a] border border-[#262626] rounded p-4 text-sm text-[#10b981] overflow-x-auto">
{`// Get AI-generated recommendations
const recs = await knxw.ecommerce.magento.getRecommendations('customer_123');

// Response example:
{
  "strategy": "value_conscious_explorer",
  "approach": {
    "primary": "Highlight value and quality",
    "secondary": "Showcase new arrivals in preferred categories"
  },
  "product_preferences": {
    "categories": ["electronics", "home-office"],
    "price_sensitivity": "moderate",
    "brand_loyalty": "low"
  },
  "messaging": {
    "tone": "informative",
    "emphasis": ["specifications", "reviews", "comparisons"]
  },
  "timing": {
    "optimal_email_day": "Tuesday",
    "optimal_email_time": "10:00 AM"
  }
}`}
        </pre>
      </div>

      <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-6 mb-6">
        <h4 className="text-lg font-semibold text-[#00d4ff] mb-3">API Usage</h4>
        <pre className="bg-[#0a0a0a] border border-[#262626] rounded p-4 text-sm text-[#10b981] overflow-x-auto">
{`// Sync customer profile
await knxw.ecommerce.magento.syncCustomer('user_123', {
  email: 'customer@example.com'
});

// Get personalized recommendations
const recs = await knxw.ecommerce.magento.getRecommendations('user_123');

// Batch sync all customers
await knxw.ecommerce.magento.batchSync({ limit: 100 });

// Validate connection
const status = await knxw.ecommerce.magento.validateConnection();`}
        </pre>
      </div>

      <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-6">
        <h4 className="text-lg font-semibold text-[#00d4ff] mb-3">Use Cases</h4>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 bg-[#0a0a0a] border border-[#262626] rounded-lg">
            <h5 className="font-medium text-white mb-2">Personalized Email Campaigns</h5>
            <p className="text-sm text-[#a3a3a3]">
              Use psychographic data to segment customers and craft messaging that resonates with their cognitive style.
            </p>
          </div>
          <div className="p-4 bg-[#0a0a0a] border border-[#262626] rounded-lg">
            <h5 className="font-medium text-white mb-2">Dynamic Product Recommendations</h5>
            <p className="text-sm text-[#a3a3a3]">
              Display products based on psychological preferences, not just purchase history.
            </p>
          </div>
          <div className="p-4 bg-[#0a0a0a] border border-[#262626] rounded-lg">
            <h5 className="font-medium text-white mb-2">Cart Abandonment Recovery</h5>
            <p className="text-sm text-[#a3a3a3]">
              Tailor recovery messaging based on customer's risk profile and motivations.
            </p>
          </div>
          <div className="p-4 bg-[#0a0a0a] border border-[#262626] rounded-lg">
            <h5 className="font-medium text-white mb-2">Loyalty Program Optimization</h5>
            <p className="text-sm text-[#a3a3a3]">
              Design rewards that align with individual customer motivations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}