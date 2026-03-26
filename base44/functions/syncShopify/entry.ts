import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const SHOPIFY_API_VERSION = '2024-01';

/**
 * Make authenticated request to Shopify Admin API
 */
async function shopifyRequest(shopDomain, accessToken, endpoint, method = 'GET', body = null) {
  const url = `https://${shopDomain}/admin/api/${SHOPIFY_API_VERSION}${endpoint}`;
  
  const options = {
    method,
    headers: {
      'X-Shopify-Access-Token': accessToken,
      'Content-Type': 'application/json'
    }
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  const response = await fetch(url, options);
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Shopify API error (${response.status}): ${errorText}`);
  }
  
  return response.json();
}

/**
 * Sync psychographic profile to Shopify customer metafields
 */
async function syncProfileToCustomer(shopDomain, accessToken, customerId, profile, namespace = 'knxw') {
  const metafields = [
    { namespace, key: 'risk_profile', value: profile.risk_profile || 'unknown', type: 'single_line_text_field' },
    { namespace, key: 'cognitive_style', value: profile.cognitive_style || 'unknown', type: 'single_line_text_field' },
    { namespace, key: 'emotional_mood', value: profile.emotional_state?.mood || 'neutral', type: 'single_line_text_field' },
    { namespace, key: 'motivation_primary', value: profile.motivation_stack_v2?.[0]?.label || 'unknown', type: 'single_line_text_field' },
    { namespace, key: 'openness', value: String(Math.round((profile.personality_traits?.openness || 0) * 100)), type: 'number_integer' },
    { namespace, key: 'conscientiousness', value: String(Math.round((profile.personality_traits?.conscientiousness || 0) * 100)), type: 'number_integer' },
    { namespace, key: 'extraversion', value: String(Math.round((profile.personality_traits?.extraversion || 0) * 100)), type: 'number_integer' },
    { namespace, key: 'last_analyzed', value: profile.last_analyzed || new Date().toISOString(), type: 'single_line_text_field' }
  ];
  
  const results = [];
  
  for (const mf of metafields) {
    try {
      const result = await shopifyRequest(shopDomain, accessToken, `/customers/${customerId}/metafields.json`, 'POST', {
        metafield: mf
      });
      results.push({ key: mf.key, success: true, id: result.metafield?.id });
    } catch (error) {
      // Try updating if exists
      try {
        const existing = await shopifyRequest(shopDomain, accessToken, `/customers/${customerId}/metafields.json?namespace=${namespace}&key=${mf.key}`);
        if (existing.metafields?.length > 0) {
          await shopifyRequest(shopDomain, accessToken, `/metafields/${existing.metafields[0].id}.json`, 'PUT', {
            metafield: { ...mf, id: existing.metafields[0].id }
          });
          results.push({ key: mf.key, success: true, updated: true });
        }
      } catch (updateError) {
        results.push({ key: mf.key, success: false, error: error.message });
      }
    }
  }
  
  return results;
}

/**
 * Find Shopify customer by email
 */
async function findCustomerByEmail(shopDomain, accessToken, email) {
  const result = await shopifyRequest(shopDomain, accessToken, `/customers/search.json?query=email:${encodeURIComponent(email)}`);
  return result.customers?.[0] || null;
}

/**
 * Get all customers for batch sync
 */
async function getCustomers(shopDomain, accessToken, limit = 50, sinceId = null) {
  let endpoint = `/customers.json?limit=${limit}`;
  if (sinceId) {
    endpoint += `&since_id=${sinceId}`;
  }
  const result = await shopifyRequest(shopDomain, accessToken, endpoint);
  return result.customers || [];
}

/**
 * Get recent orders for behavioral analysis
 */
async function getRecentOrders(shopDomain, accessToken, customerId, limit = 10) {
  const result = await shopifyRequest(shopDomain, accessToken, `/customers/${customerId}/orders.json?limit=${limit}&status=any`);
  return result.orders || [];
}

/**
 * Generate product recommendations based on psychographic profile
 */
function generateRecommendationStrategy(profile) {
  const strategies = {
    conservative: {
      approach: 'value_focused',
      messaging: 'Highlight reliability, reviews, and guarantees',
      discount_sensitivity: 'high',
      urgency_response: 'low'
    },
    moderate: {
      approach: 'balanced',
      messaging: 'Balance features with social proof',
      discount_sensitivity: 'medium',
      urgency_response: 'medium'
    },
    aggressive: {
      approach: 'novelty_focused',
      messaging: 'Emphasize exclusivity and innovation',
      discount_sensitivity: 'low',
      urgency_response: 'high'
    }
  };
  
  return strategies[profile.risk_profile] || strategies.moderate;
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  if (!(await base44.auth.isAuthenticated())) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const { action, client_app_id, email, user_id, customer_id } = await req.json();

    if (!client_app_id) {
      return Response.json({ error: 'client_app_id is required' }, { status: 400 });
    }

    // Get Shopify config
    const configs = await base44.entities.ShopifyIntegrationConfig.filter({ client_app_id });
    if (configs.length === 0) {
      return Response.json({ error: 'Shopify integration not configured' }, { status: 400 });
    }

    const config = configs[0];
    if (config.status !== 'active') {
      return Response.json({ error: 'Shopify integration is not active' }, { status: 400 });
    }

    const { shop_domain, access_token, metafield_namespace } = config;

    switch (action) {
      case 'validate': {
        try {
          const shop = await shopifyRequest(shop_domain, access_token, '/shop.json');
          return Response.json({
            status: 'success',
            data: {
              shop_name: shop.shop?.name,
              domain: shop.shop?.domain,
              plan: shop.shop?.plan_name,
              currency: shop.shop?.currency
            }
          });
        } catch (error) {
          return Response.json({ status: 'error', error: error.message }, { status: 400 });
        }
      }

      case 'sync_profile': {
        if (!email && !customer_id) {
          return Response.json({ error: 'email or customer_id is required' }, { status: 400 });
        }

        let targetCustomerId = customer_id;
        
        if (!targetCustomerId && email) {
          const customer = await findCustomerByEmail(shop_domain, access_token, email);
          if (!customer) {
            return Response.json({ error: 'Customer not found in Shopify' }, { status: 404 });
          }
          targetCustomerId = customer.id;
        }

        // Get psychographic profile
        let profile;
        if (user_id) {
          const profiles = await base44.entities.UserPsychographicProfile.filter({ user_id });
          profile = profiles[0];
        } else {
          const profiles = await base44.entities.UserPsychographicProfile.filter({}, '-last_analyzed', 1);
          profile = profiles[0];
        }

        if (!profile) {
          return Response.json({ error: 'No psychographic profile found' }, { status: 404 });
        }

        const syncResults = await syncProfileToCustomer(
          shop_domain, 
          access_token, 
          targetCustomerId, 
          profile,
          metafield_namespace || 'knxw'
        );

        return Response.json({
          status: 'success',
          message: 'Profile synced to Shopify customer',
          data: {
            customer_id: targetCustomerId,
            metafields_synced: syncResults.filter(r => r.success).length,
            results: syncResults
          }
        });
      }

      case 'batch_sync': {
        const customers = await getCustomers(shop_domain, access_token, 50);
        const profiles = await base44.entities.UserPsychographicProfile.filter({}, '-last_analyzed', 100);
        
        // Create email-to-profile map
        const profileMap = new Map();
        for (const p of profiles) {
          if (p.user_id) {
            profileMap.set(p.user_id.toLowerCase(), p);
          }
        }

        let syncedCount = 0;
        let errorCount = 0;
        const errors = [];

        for (const customer of customers) {
          const customerEmail = customer.email?.toLowerCase();
          const profile = profileMap.get(customerEmail);
          
          if (profile) {
            try {
              await syncProfileToCustomer(shop_domain, access_token, customer.id, profile, metafield_namespace || 'knxw');
              syncedCount++;
            } catch (error) {
              errorCount++;
              errors.push({ customer_id: customer.id, error: error.message });
            }
          }
        }

        // Update last sync
        await base44.entities.ShopifyIntegrationConfig.update(config.id, {
          last_sync: new Date().toISOString()
        });

        return Response.json({
          status: 'success',
          message: 'Batch sync completed',
          data: {
            customers_processed: customers.length,
            synced_count: syncedCount,
            error_count: errorCount,
            errors: errors.slice(0, 10)
          }
        });
      }

      case 'get_recommendations': {
        if (!email && !customer_id && !user_id) {
          return Response.json({ error: 'email, customer_id, or user_id is required' }, { status: 400 });
        }

        let profile;
        if (user_id) {
          const profiles = await base44.entities.UserPsychographicProfile.filter({ user_id });
          profile = profiles[0];
        }

        if (!profile) {
          return Response.json({ error: 'No psychographic profile found' }, { status: 404 });
        }

        const strategy = generateRecommendationStrategy(profile);

        return Response.json({
          status: 'success',
          data: {
            psychographic_summary: {
              risk_profile: profile.risk_profile,
              cognitive_style: profile.cognitive_style,
              primary_motivation: profile.motivation_stack_v2?.[0]?.label
            },
            recommendation_strategy: strategy
          }
        });
      }

      case 'analyze_customer': {
        if (!customer_id) {
          return Response.json({ error: 'customer_id is required' }, { status: 400 });
        }

        const orders = await getRecentOrders(shop_domain, access_token, customer_id);
        
        // Analyze purchase patterns
        const totalSpent = orders.reduce((sum, o) => sum + parseFloat(o.total_price || 0), 0);
        const avgOrderValue = orders.length > 0 ? totalSpent / orders.length : 0;
        const orderFrequency = orders.length;

        return Response.json({
          status: 'success',
          data: {
            customer_id,
            purchase_analysis: {
              total_orders: orderFrequency,
              total_spent: totalSpent.toFixed(2),
              avg_order_value: avgOrderValue.toFixed(2),
              currency: orders[0]?.currency || 'USD'
            }
          }
        });
      }

      default:
        return Response.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }

  } catch (error) {
    console.error('Shopify sync error:', error);
    return Response.json({ 
      status: 'error', 
      message: 'Failed to process Shopify request',
      error: error.message 
    }, { status: 500 });
  }
});