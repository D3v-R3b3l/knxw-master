import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Make authenticated request to Magento REST API
 */
async function magentoRequest(storeUrl, accessToken, endpoint, method = 'GET', body = null) {
  const url = `${storeUrl}/rest/V1${endpoint}`;
  
  const options = {
    method,
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  const response = await fetch(url, options);
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Magento API error (${response.status}): ${errorText}`);
  }
  
  return response.json();
}

/**
 * Search for customer by email
 */
async function findCustomerByEmail(storeUrl, accessToken, email) {
  const searchCriteria = `searchCriteria[filterGroups][0][filters][0][field]=email&searchCriteria[filterGroups][0][filters][0][value]=${encodeURIComponent(email)}`;
  const result = await magentoRequest(storeUrl, accessToken, `/customers/search?${searchCriteria}`);
  return result.items?.[0] || null;
}

/**
 * Get customer by ID
 */
async function getCustomer(storeUrl, accessToken, customerId) {
  return magentoRequest(storeUrl, accessToken, `/customers/${customerId}`);
}

/**
 * Update customer with psychographic custom attributes
 */
async function updateCustomerAttributes(storeUrl, accessToken, customerId, profile, attributeCodes) {
  const customAttributes = [
    { attribute_code: attributeCodes.risk_profile || 'knxw_risk_profile', value: profile.risk_profile || '' },
    { attribute_code: attributeCodes.cognitive_style || 'knxw_cognitive_style', value: profile.cognitive_style || '' },
    { attribute_code: attributeCodes.emotional_mood || 'knxw_emotional_mood', value: profile.emotional_state?.mood || '' },
    { attribute_code: attributeCodes.motivation || 'knxw_motivation', value: profile.motivation_stack_v2?.[0]?.label || '' },
    { attribute_code: attributeCodes.last_analyzed || 'knxw_last_analyzed', value: profile.last_analyzed || new Date().toISOString() }
  ].filter(attr => attr.value);

  const customer = await getCustomer(storeUrl, accessToken, customerId);
  
  // Merge with existing custom attributes
  const existingAttributes = customer.custom_attributes || [];
  const attributeMap = {};
  
  for (const attr of existingAttributes) {
    attributeMap[attr.attribute_code] = attr.value;
  }
  
  for (const attr of customAttributes) {
    attributeMap[attr.attribute_code] = attr.value;
  }

  const mergedAttributes = Object.entries(attributeMap).map(([code, value]) => ({
    attribute_code: code,
    value
  }));

  return magentoRequest(storeUrl, accessToken, `/customers/${customerId}`, 'PUT', {
    customer: {
      id: customerId,
      email: customer.email,
      firstname: customer.firstname,
      lastname: customer.lastname,
      website_id: customer.website_id,
      custom_attributes: mergedAttributes
    }
  });
}

/**
 * Get customer orders for behavioral analysis
 */
async function getCustomerOrders(storeUrl, accessToken, customerId, limit = 10) {
  const searchCriteria = `searchCriteria[filterGroups][0][filters][0][field]=customer_id&searchCriteria[filterGroups][0][filters][0][value]=${customerId}&searchCriteria[pageSize]=${limit}&searchCriteria[sortOrders][0][field]=created_at&searchCriteria[sortOrders][0][direction]=DESC`;
  const result = await magentoRequest(storeUrl, accessToken, `/orders?${searchCriteria}`);
  return result.items || [];
}

/**
 * Generate product recommendation strategy based on psychographic profile
 */
function generateRecommendationStrategy(profile, purchaseHistory) {
  const baseStrategy = {
    risk_profile: profile.risk_profile,
    cognitive_style: profile.cognitive_style,
    recommendations: []
  };

  // Strategy based on risk profile
  if (profile.risk_profile === 'conservative') {
    baseStrategy.recommendations.push(
      'Highlight product reviews and ratings prominently',
      'Offer money-back guarantees',
      'Show "Best Seller" badges',
      'Emphasize warranty and return policies'
    );
  } else if (profile.risk_profile === 'aggressive') {
    baseStrategy.recommendations.push(
      'Feature new arrivals and exclusive items',
      'Create urgency with limited-time offers',
      'Highlight unique/innovative features',
      'Offer early access to new products'
    );
  }

  // Strategy based on cognitive style
  if (profile.cognitive_style === 'analytical') {
    baseStrategy.recommendations.push(
      'Provide detailed product specifications',
      'Show comparison tables',
      'Include technical documentation'
    );
  } else if (profile.cognitive_style === 'intuitive') {
    baseStrategy.recommendations.push(
      'Use lifestyle imagery',
      'Tell product stories',
      'Emphasize brand values'
    );
  }

  // Purchase pattern insights
  if (purchaseHistory.length > 0) {
    const totalSpent = purchaseHistory.reduce((sum, order) => sum + parseFloat(order.grand_total || 0), 0);
    const avgOrderValue = totalSpent / purchaseHistory.length;
    
    baseStrategy.purchase_insights = {
      total_orders: purchaseHistory.length,
      avg_order_value: avgOrderValue.toFixed(2),
      suggested_price_range: {
        min: (avgOrderValue * 0.5).toFixed(2),
        max: (avgOrderValue * 1.5).toFixed(2)
      }
    };
  }

  return baseStrategy;
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

    // Get Magento config
    const configs = await base44.entities.MagentoIntegrationConfig.filter({ client_app_id });
    if (configs.length === 0) {
      return Response.json({ error: 'Magento integration not configured' }, { status: 400 });
    }

    const config = configs[0];
    if (config.status !== 'active') {
      return Response.json({ error: 'Magento integration is not active' }, { status: 400 });
    }

    const { store_url, access_token, custom_attribute_codes } = config;

    switch (action) {
      case 'validate': {
        try {
          const storeConfig = await magentoRequest(store_url, access_token, '/store/storeConfigs');
          return Response.json({
            status: 'success',
            data: {
              store_name: storeConfig[0]?.base_url,
              locale: storeConfig[0]?.locale,
              currency: storeConfig[0]?.base_currency_code
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
          const customer = await findCustomerByEmail(store_url, access_token, email);
          if (!customer) {
            return Response.json({ error: 'Customer not found in Magento' }, { status: 404 });
          }
          targetCustomerId = customer.id;
        }

        let profile;
        if (user_id) {
          const profiles = await base44.entities.UserPsychographicProfile.filter({ user_id });
          profile = profiles[0];
        }

        if (!profile) {
          return Response.json({ error: 'No psychographic profile found' }, { status: 404 });
        }

        const result = await updateCustomerAttributes(
          store_url, 
          access_token, 
          targetCustomerId, 
          profile,
          custom_attribute_codes || {}
        );

        return Response.json({
          status: 'success',
          message: 'Customer updated with psychographic data',
          data: { customer_id: targetCustomerId }
        });
      }

      case 'get_recommendations': {
        if (!email && !customer_id && !user_id) {
          return Response.json({ error: 'email, customer_id, or user_id is required' }, { status: 400 });
        }

        let targetCustomerId = customer_id;
        
        if (!targetCustomerId && email) {
          const customer = await findCustomerByEmail(store_url, access_token, email);
          if (customer) {
            targetCustomerId = customer.id;
          }
        }

        let profile;
        if (user_id) {
          const profiles = await base44.entities.UserPsychographicProfile.filter({ user_id });
          profile = profiles[0];
        }

        if (!profile) {
          return Response.json({ error: 'No psychographic profile found' }, { status: 404 });
        }

        let purchaseHistory = [];
        if (targetCustomerId) {
          purchaseHistory = await getCustomerOrders(store_url, access_token, targetCustomerId);
        }

        const strategy = generateRecommendationStrategy(profile, purchaseHistory);

        return Response.json({
          status: 'success',
          data: strategy
        });
      }

      case 'batch_sync': {
        // Get all customers (paginated)
        const searchCriteria = 'searchCriteria[pageSize]=50';
        const customersResult = await magentoRequest(store_url, access_token, `/customers/search?${searchCriteria}`);
        const customers = customersResult.items || [];

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
              await updateCustomerAttributes(store_url, access_token, customer.id, profile, custom_attribute_codes || {});
              syncedCount++;
            } catch (error) {
              errorCount++;
              errors.push({ customer_id: customer.id, error: error.message });
            }
          }
        }

        await base44.entities.MagentoIntegrationConfig.update(config.id, {
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

      default:
        return Response.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }

  } catch (error) {
    console.error('Magento sync error:', error);
    return Response.json({ 
      status: 'error', 
      message: 'Failed to process Magento request',
      error: error.message 
    }, { status: 500 });
  }
});