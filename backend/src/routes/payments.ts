import express from 'express';
import { authenticateToken, AuthenticatedRequest } from '../middleware/authenticateAdmin';
import { createCheckoutSession, getCheckoutSession, cancelSubscription, updatePaymentMethod } from '../services/paymentService';
import { activateSubscription, renewSubscription, handlePaymentFailure, cancelUserSubscription } from '../services/subscriptionService';
import { databaseManager } from '../services/databaseManager';
import { stripe } from '../services/paymentService';
import Stripe from 'stripe';

const router = express.Router();

/**
 * POST /api/payments/create-checkout-session
 * Create Stripe Checkout Session for subscription upgrade
 */
router.post('/create-checkout-session', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    const { planId, billingCycle } = req.body;

    if (!planId || !billingCycle) {
      return res.status(400).json({
        success: false,
        error: 'planId and billingCycle are required',
      });
    }

    if (billingCycle !== 'MONTHLY' && billingCycle !== 'ANNUAL') {
      return res.status(400).json({
        success: false,
        error: 'billingCycle must be MONTHLY or ANNUAL',
      });
    }

    // Get user email and name
    const userEmail = req.user.email || '';
    const userName = req.user.name || '';
    
    // For EMS users, req.user.id is the agencyId, not the user ID
    // We'll use email to look up the actual user in paymentService
    const userId = req.user.id; // This is agencyId for EMS, user.id for others

    // Create checkout session
    const session = await createCheckoutSession({
      userId: userId, // Will be used for non-EMS users, email used for EMS
      userType: req.user.userType as 'HEALTHCARE' | 'EMS',
      userEmail,
      userName,
      planId,
      billingCycle: billingCycle as 'MONTHLY' | 'ANNUAL',
    });

    res.json({
      success: true,
      sessionId: session.sessionId,
      url: session.url,
    });
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create checkout session',
    });
  }
});

/**
 * GET /api/payments/subscription-status
 * Get current subscription payment status
 */
router.get('/subscription-status', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    const prisma = databaseManager.getPrismaClient();
    let user: any;

    if (req.user.userType === 'HEALTHCARE') {
      user = await prisma.healthcareUser.findUnique({ where: { id: req.user.id } });
    } else if (req.user.userType === 'EMS') {
      user = await prisma.eMSUser.findUnique({ where: { id: req.user.id } });
    } else {
      user = await prisma.centerUser.findUnique({ where: { id: req.user.id } });
    }

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Get Stripe subscription if exists
    let stripeSubscription: Stripe.Subscription | null = null;
    if (user.stripeSubscriptionId) {
      try {
        stripeSubscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
      } catch (error) {
        console.error('Error retrieving Stripe subscription:', error);
      }
    }

    res.json({
      success: true,
      subscription: {
        status: user.subscriptionStatus,
        planId: user.subscriptionPlanId,
        stripeSubscriptionId: user.stripeSubscriptionId,
        stripeCustomerId: user.stripeCustomerId,
        subscriptionStartDate: user.subscriptionStartDate?.toISOString(),
        subscriptionEndDate: user.subscriptionEndDate?.toISOString(),
        gracePeriodEndDate: user.gracePeriodEndDate?.toISOString(),
        stripeStatus: stripeSubscription?.status,
        cancelAtPeriodEnd: stripeSubscription?.cancel_at_period_end,
      },
    });
  } catch (error: any) {
    console.error('Error fetching subscription status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch subscription status',
    });
  }
});

/**
 * POST /api/payments/cancel-subscription
 * Cancel subscription (cancel at period end by default)
 */
router.post('/cancel-subscription', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    const { cancelImmediately } = req.body;
    const cancelAtPeriodEnd = !cancelImmediately;

    const prisma = databaseManager.getPrismaClient();
    let user: any;

    if (req.user.userType === 'HEALTHCARE') {
      user = await prisma.healthcareUser.findUnique({ where: { id: req.user.id } });
    } else if (req.user.userType === 'EMS') {
      user = await prisma.eMSUser.findUnique({ where: { id: req.user.id } });
    } else {
      user = await prisma.centerUser.findUnique({ where: { id: req.user.id } });
    }

    if (!user || !user.stripeSubscriptionId) {
      return res.status(400).json({
        success: false,
        error: 'No active subscription found',
      });
    }

    // Cancel in Stripe
    await cancelSubscription(user.stripeSubscriptionId, cancelAtPeriodEnd);

    // Update in database
    await cancelUserSubscription(user.stripeSubscriptionId, cancelAtPeriodEnd);

    res.json({
      success: true,
      message: cancelAtPeriodEnd
        ? 'Subscription will be cancelled at the end of the current billing period'
        : 'Subscription cancelled immediately',
    });
  } catch (error: any) {
    console.error('Error cancelling subscription:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to cancel subscription',
    });
  }
});

/**
 * POST /api/payments/webhook
 * Handle Stripe webhook events
 */
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  if (!webhookSecret) {
    console.warn('STRIPE_WEBHOOK_SECRET not set - webhook verification skipped');
    // In development, allow webhooks without verification
    // In production, this should be required
  }

  const sig = req.headers['stripe-signature'];
  let event: Stripe.Event;

  try {
    if (webhookSecret && sig) {
      // Verify webhook signature
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } else {
      // Development mode - parse event without verification
      event = JSON.parse(req.body.toString());
    }
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const subscriptionId = session.subscription as string;
        const metadata = session.metadata;

        if (metadata && metadata.userId && metadata.planId && subscriptionId) {
          await activateSubscription(
            metadata.userId,
            metadata.userType as 'HEALTHCARE' | 'EMS',
            subscriptionId,
            metadata.planId
          );
        }
        break;
      }

      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription;
        // Subscription created - already handled by checkout.session.completed
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        // Handle subscription updates (plan changes, etc.)
        // For now, we'll handle renewals via invoice.payment_succeeded
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await cancelUserSubscription(subscription.id, false); // Already cancelled in Stripe
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        // subscription can be a string (ID) or Subscription object
        // Use type assertion to access subscription property safely
        const invoiceWithSubscription = invoice as any;
        const subscriptionId = invoiceWithSubscription.subscription 
          ? (typeof invoiceWithSubscription.subscription === 'string' 
              ? invoiceWithSubscription.subscription 
              : invoiceWithSubscription.subscription?.id)
          : null;

        if (subscriptionId) {
          // Check if this is a renewal (not initial payment)
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          if (subscription.status === 'active') {
            await renewSubscription(subscriptionId);
          }
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        // subscription can be a string (ID) or Subscription object
        // Use type assertion to access subscription property safely
        const invoiceWithSubscription = invoice as any;
        const subscriptionId = invoiceWithSubscription.subscription 
          ? (typeof invoiceWithSubscription.subscription === 'string' 
              ? invoiceWithSubscription.subscription 
              : invoiceWithSubscription.subscription?.id)
          : null;

        if (subscriptionId) {
          await handlePaymentFailure(subscriptionId);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error: any) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

export default router;
