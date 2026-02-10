import Stripe from 'stripe';
import { databaseManager } from './databaseManager';

// Initialize Stripe client
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
}

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2026-01-28.clover', // Stripe API version
});

export interface CreateCheckoutSessionParams {
  userId: string;
  userType: 'HEALTHCARE' | 'EMS';
  userEmail: string;
  userName: string;
  planId: string;
  billingCycle: 'MONTHLY' | 'ANNUAL';
}

export interface CheckoutSessionResult {
  sessionId: string;
  url: string;
}

/**
 * Create a Stripe Checkout Session for subscription upgrade
 */
export async function createCheckoutSession(
  params: CreateCheckoutSessionParams
): Promise<CheckoutSessionResult> {
  const { userId, userType, userEmail, userName, planId, billingCycle } = params;

  // Get subscription plan from database
  const prisma = databaseManager.getPrismaClient();
  const plan = await prisma.subscriptionPlan.findUnique({
    where: { id: planId },
  });

  if (!plan) {
    throw new Error(`Subscription plan not found: ${planId}`);
  }

  // Verify plan matches user type
  if (plan.userType !== userType && plan.userType !== 'ALL') {
    throw new Error(`Plan ${planId} is not available for user type ${userType}`);
  }

  // Get user to check trial status
  // For EMS users, userId might be agencyId, so we need to look up by email
  let user: any;
  let actualUserId: string = userId; // Will be updated for EMS users
  
  if (userType === 'HEALTHCARE') {
    user = await prisma.healthcareUser.findUnique({ where: { id: userId } });
  } else if (userType === 'EMS') {
    // For EMS users, the JWT token contains agencyId as id, not user.id
    // We need to find the user by email instead
    if (userEmail) {
      user = await prisma.eMSUser.findFirst({
        where: { 
          email: userEmail,
          isDeleted: false
        }
      });
      if (user) {
        actualUserId = user.id; // Use the actual user ID, not the agencyId
      }
    } else {
      // Fallback: try by ID (might work if it's actually the user ID)
      user = await prisma.eMSUser.findUnique({ where: { id: userId } });
    }
  } else {
    user = await prisma.centerUser.findUnique({ where: { id: userId } });
  }

  if (!user) {
    throw new Error(`User not found: ${userType === 'EMS' && userEmail ? `email: ${userEmail}` : `id: ${userId}`}`);
  }
  
  // Use actualUserId for subsequent operations (important for EMS users)
  const finalUserId = actualUserId;

  // Determine subscription start date
  // If user is in trial, subscription starts after trial ends
  let subscriptionStartDate: number | undefined;
  if (user.subscriptionStatus === 'TRIAL' && user.trialEndDate) {
    subscriptionStartDate = Math.floor(new Date(user.trialEndDate).getTime() / 1000);
  }

  // Calculate price based on billing cycle
  const priceAmount = billingCycle === 'MONTHLY' 
    ? parseFloat(plan.monthlyPrice.toString())
    : plan.annualPrice 
      ? parseFloat(plan.annualPrice.toString())
      : parseFloat(plan.monthlyPrice.toString()) * 12;

  // Create or retrieve Stripe customer
  let customerId: string;
  if (user.stripeCustomerId) {
    customerId = user.stripeCustomerId;
    // Update customer email if changed
    await stripe.customers.update(customerId, {
      email: userEmail,
      name: userName,
    });
  } else {
    const customer = await stripe.customers.create({
      email: userEmail,
      name: userName,
      metadata: {
        userId: finalUserId,
        userType,
      },
    });
    customerId = customer.id;

    // Save Stripe customer ID to user record
    if (userType === 'HEALTHCARE') {
      await prisma.healthcareUser.update({
        where: { id: finalUserId },
        data: { stripeCustomerId: customerId },
      });
    } else if (userType === 'EMS') {
      await prisma.eMSUser.update({
        where: { id: finalUserId },
        data: { stripeCustomerId: customerId },
      });
    } else {
      await prisma.centerUser.update({
        where: { id: finalUserId },
        data: { stripeCustomerId: customerId },
      });
    }
  }

  // Create Stripe Price (if needed) or use existing
  // For simplicity, we'll create a price on-the-fly
  // In production, you might want to pre-create prices in Stripe Dashboard
  const price = await stripe.prices.create({
    unit_amount: Math.round(priceAmount * 100), // Convert to cents
    currency: 'usd',
    recurring: {
      interval: billingCycle === 'MONTHLY' ? 'month' : 'year',
    },
    product_data: {
      name: `${plan.displayName} - ${userType}`,
      metadata: {
        planId: plan.id,
        planName: plan.name,
        planDescription: plan.description,
        userType,
      },
    },
  });

  // Create Checkout Session
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card', 'us_bank_account', 'link'], // Cards, ACH, PayPal via Link
    line_items: [
      {
        price: price.id,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    subscription_data: {
      metadata: {
        userId: finalUserId,
        userType,
        planId: plan.id,
        planName: plan.name,
        billingCycle,
      },
      // Set trial end if user is in trial
      ...(subscriptionStartDate && {
        trial_end: subscriptionStartDate,
      }),
    },
    success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/pricing?canceled=true`,
    metadata: {
      userId: finalUserId,
      userType,
      planId: plan.id,
    },
    allow_promotion_codes: true, // Allow discount codes
  });

  return {
    sessionId: session.id,
    url: session.url || '',
  };
}

/**
 * Retrieve a checkout session by ID
 */
export async function getCheckoutSession(sessionId: string): Promise<Stripe.Checkout.Session> {
  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['subscription', 'customer'],
  });
  return session;
}

/**
 * Cancel a Stripe subscription (cancel at period end)
 */
export async function cancelSubscription(
  subscriptionId: string,
  cancelAtPeriodEnd: boolean = true
): Promise<Stripe.Subscription> {
  if (cancelAtPeriodEnd) {
    // Cancel at period end (user keeps access until period ends)
    return await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });
  } else {
    // Cancel immediately
    return await stripe.subscriptions.cancel(subscriptionId);
  }
}

/**
 * Update payment method for a subscription
 */
export async function updatePaymentMethod(
  customerId: string,
  paymentMethodId: string
): Promise<Stripe.Customer> {
  // Attach payment method to customer
  await stripe.paymentMethods.attach(paymentMethodId, {
    customer: customerId,
  });

  // Set as default payment method
  return await stripe.customers.update(customerId, {
    invoice_settings: {
      default_payment_method: paymentMethodId,
    },
  });
}

export { stripe };
