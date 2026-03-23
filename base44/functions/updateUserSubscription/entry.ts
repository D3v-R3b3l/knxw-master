import { createClientFromRequest } from 'npm:@base44/sdk@0.7.0';
import Stripe from 'npm:stripe@14.21.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'), {
  apiVersion: '2023-10-16',
});

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  if (!(await base44.auth.isAuthenticated())) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const { action, plan_key, subscription_id } = await req.json();
    const user = await base44.auth.me();

    switch (action) {
      case 'get_current_subscription': {
        // Get current billing subscription
        const billingRecords = await base44.entities.BillingSubscription.filter({
          user_id: user.id
        });

        if (billingRecords.length === 0) {
          return new Response(JSON.stringify({
            status: 'success',
            data: {
              subscription: null,
              plan_key: 'developer',
              status: 'active'
            }
          }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        const billing = billingRecords[0];
        let stripeSubscription = null;

        if (billing.stripe_subscription_id) {
          try {
            stripeSubscription = await stripe.subscriptions.retrieve(billing.stripe_subscription_id);
          } catch (error) {
            console.warn(`Failed to retrieve Stripe subscription ${billing.stripe_subscription_id}:`, error.message);
          }
        }

        return new Response(JSON.stringify({
          status: 'success',
          data: {
            subscription: {
              id: billing.stripe_subscription_id,
              plan_key: billing.plan_key,
              status: billing.status,
              period_start: billing.period_start,
              period_end: billing.period_end,
              usage_this_period: billing.usage_this_period,
              last_invoice_url: billing.last_invoice_url
            },
            stripe_data: stripeSubscription ? {
              current_period_start: new Date(stripeSubscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(stripeSubscription.current_period_end * 1000).toISOString(),
              cancel_at_period_end: stripeSubscription.cancel_at_period_end,
              canceled_at: stripeSubscription.canceled_at ? new Date(stripeSubscription.canceled_at * 1000).toISOString() : null
            } : null
          }
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      case 'change_plan': {
        if (!plan_key) {
          return new Response(JSON.stringify({ 
            error: 'plan_key is required for plan change' 
          }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        // Handle downgrade to developer (free) plan
        if (plan_key === 'developer') {
          const billingRecords = await base44.entities.BillingSubscription.filter({
            user_id: user.id
          });

          if (billingRecords.length > 0) {
            const billing = billingRecords[0];
            
            // Cancel Stripe subscription if exists
            if (billing.stripe_subscription_id) {
              try {
                await stripe.subscriptions.update(billing.stripe_subscription_id, {
                  cancel_at_period_end: true
                });
              } catch (error) {
                console.warn(`Failed to cancel Stripe subscription:`, error.message);
              }
            }

            // Update billing record
            await base44.entities.BillingSubscription.update(billing.id, {
              plan_key: 'developer',
              status: 'canceled'
            });
          }

          // Update user record
          await base44.asServiceRole.entities.User.update(user.id, {
            current_plan_key: 'developer',
            plan_status: 'active',
            subscription_updated_at: new Date().toISOString()
          });

          return new Response(JSON.stringify({
            status: 'success',
            message: 'Successfully downgraded to Developer plan',
            data: { plan_key: 'developer', status: 'active' }
          }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        // For paid plans, create checkout session
        const priceIdMap = {
          growth: Deno.env.get('STRIPE_PRICE_ID_GROWTH'),
          pro: Deno.env.get('STRIPE_PRICE_ID_PRO')
        };

        const priceId = priceIdMap[plan_key];
        if (!priceId) {
          return new Response(JSON.stringify({ 
            error: 'Invalid plan key or price not configured' 
          }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        // Check if user has existing subscription
        const billingRecords = await base44.entities.BillingSubscription.filter({
          user_id: user.id
        });

        let customerId = null;
        if (billingRecords.length > 0 && billingRecords[0].stripe_customer_id) {
          customerId = billingRecords[0].stripe_customer_id;
        }

        // Create checkout session
        const sessionConfig = {
          payment_method_types: ['card'],
          line_items: [{
            price: priceId,
            quantity: 1,
          }],
          mode: 'subscription',
          success_url: `${new URL(req.url).origin}/Dashboard?upgrade=success`,
          cancel_url: `${new URL(req.url).origin}/Profile?upgrade=canceled`,
          metadata: {
            base44_user_id: user.id,
            user_email: user.email,
            plan_key: plan_key
          },
          subscription_data: {
            metadata: {
              base44_user_id: user.id,
              plan_key: plan_key
            }
          }
        };

        if (customerId) {
          sessionConfig.customer = customerId;
        } else {
          sessionConfig.customer_email = user.email;
        }

        const session = await stripe.checkout.sessions.create(sessionConfig);

        return new Response(JSON.stringify({
          status: 'success',
          message: 'Checkout session created',
          data: {
            checkout_url: session.url,
            session_id: session.id
          }
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      case 'cancel_subscription': {
        if (!subscription_id) {
          return new Response(JSON.stringify({ 
            error: 'subscription_id is required for cancellation' 
          }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        // Cancel at period end to allow user to continue using service until billing cycle ends
        const subscription = await stripe.subscriptions.update(subscription_id, {
          cancel_at_period_end: true
        });

        // Update billing record
        const billingRecords = await base44.entities.BillingSubscription.filter({
          user_id: user.id,
          stripe_subscription_id: subscription_id
        });

        if (billingRecords.length > 0) {
          await base44.entities.BillingSubscription.update(billingRecords[0].id, {
            status: 'canceled'
          });
        }

        return new Response(JSON.stringify({
          status: 'success',
          message: 'Subscription will be canceled at the end of the current billing period',
          data: {
            subscription_id: subscription_id,
            cancel_at_period_end: true,
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString()
          }
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      case 'reactivate_subscription': {
        if (!subscription_id) {
          return new Response(JSON.stringify({ 
            error: 'subscription_id is required for reactivation' 
          }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        // Reactivate subscription by removing cancel_at_period_end
        const subscription = await stripe.subscriptions.update(subscription_id, {
          cancel_at_period_end: false
        });

        // Update billing record
        const billingRecords = await base44.entities.BillingSubscription.filter({
          user_id: user.id,
          stripe_subscription_id: subscription_id
        });

        if (billingRecords.length > 0) {
          await base44.entities.BillingSubscription.update(billingRecords[0].id, {
            status: subscription.status
          });
        }

        return new Response(JSON.stringify({
          status: 'success',
          message: 'Subscription reactivated successfully',
          data: {
            subscription_id: subscription_id,
            status: subscription.status,
            cancel_at_period_end: false
          }
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      case 'get_billing_portal': {
        const billingRecords = await base44.entities.BillingSubscription.filter({
          user_id: user.id
        });

        if (billingRecords.length === 0 || !billingRecords[0].stripe_customer_id) {
          return new Response(JSON.stringify({ 
            error: 'No active subscription found' 
          }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        const session = await stripe.billingPortal.sessions.create({
          customer: billingRecords[0].stripe_customer_id,
          return_url: `${new URL(req.url).origin}/Profile`
        });

        return new Response(JSON.stringify({
          status: 'success',
          data: {
            portal_url: session.url
          }
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      default:
        return new Response(JSON.stringify({ 
          error: `Unknown action: ${action}` 
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
    }

  } catch (error) {
    console.error('Subscription update error:', error);
    
    return new Response(JSON.stringify({
      status: 'error',
      message: 'Failed to update subscription',
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});