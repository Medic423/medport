import { databaseManager } from './databaseManager';
import { stripe } from './paymentService';

export interface SubscriptionUpdateParams {
  userId: string;
  userType: 'HEALTHCARE' | 'EMS' | 'ADMIN' | 'USER';
  subscriptionId: string;
  planId: string;
  status: 'ACTIVE' | 'TRIAL' | 'EXPIRED' | 'CANCELLED' | 'PAST_DUE';
  subscriptionStartDate?: Date;
  subscriptionEndDate?: Date;
  nextBillingDate?: Date;
  gracePeriodEndDate?: Date;
}

/**
 * Update user subscription status in database
 */
export async function updateUserSubscription(
  params: SubscriptionUpdateParams
): Promise<void> {
  const {
    userId,
    userType,
    subscriptionId,
    planId,
    status,
    subscriptionStartDate,
    subscriptionEndDate,
    nextBillingDate,
    gracePeriodEndDate,
  } = params;

  const prisma = databaseManager.getPrismaClient();

  const updateData: any = {
    stripeSubscriptionId: subscriptionId,
    subscriptionPlanId: planId,
    subscriptionStatus: status,
  };

  if (subscriptionStartDate) {
    updateData.subscriptionStartDate = subscriptionStartDate;
  }
  if (subscriptionEndDate) {
    updateData.subscriptionEndDate = subscriptionEndDate;
  }
  if (nextBillingDate) {
    // Store next billing date in a custom field or calculate from subscriptionEndDate
    // For now, we'll use subscriptionEndDate as next billing date
    updateData.subscriptionEndDate = nextBillingDate;
  }
  if (gracePeriodEndDate) {
    updateData.gracePeriodEndDate = gracePeriodEndDate;
  }

  // Update based on user type
  if (userType === 'HEALTHCARE') {
    await prisma.healthcareUser.update({
      where: { id: userId },
      data: updateData,
    });
  } else if (userType === 'EMS') {
    await prisma.eMSUser.update({
      where: { id: userId },
      data: updateData,
    });
  } else {
    await prisma.centerUser.update({
      where: { id: userId },
      data: updateData,
    });
  }
}

/**
 * Handle successful payment and activate subscription
 */
export async function activateSubscription(
  userId: string,
  userType: 'HEALTHCARE' | 'EMS' | 'ADMIN' | 'USER',
  stripeSubscriptionId: string,
  planId: string
): Promise<void> {
  const prisma = databaseManager.getPrismaClient();

  // Get subscription from Stripe
  const subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);

  // Get plan from database
  const plan = await prisma.subscriptionPlan.findUnique({
    where: { id: planId },
  });

  if (!plan) {
    throw new Error(`Plan not found: ${planId}`);
  }

  // Get user to check trial status
  let user: any;
  if (userType === 'HEALTHCARE') {
    user = await prisma.healthcareUser.findUnique({ where: { id: userId } });
  } else if (userType === 'EMS') {
    user = await prisma.eMSUser.findUnique({ where: { id: userId } });
  } else {
    user = await prisma.centerUser.findUnique({ where: { id: userId } });
  }

  if (!user) {
    throw new Error(`User not found: ${userId}`);
  }

  // Determine subscription start date
  // If user was in trial, subscription starts after trial ends
  let subscriptionStartDate: Date;
  if (user.subscriptionStatus === 'TRIAL' && user.trialEndDate) {
    subscriptionStartDate = new Date(user.trialEndDate);
  } else {
    subscriptionStartDate = new Date(); // Start immediately
  }

  // Calculate subscription end date based on billing cycle
  const billingCycle = subscription.items.data[0]?.price.recurring?.interval || 'month';
  const subscriptionEndDate = new Date(subscriptionStartDate);
  if (billingCycle === 'year') {
    subscriptionEndDate.setFullYear(subscriptionEndDate.getFullYear() + 1);
  } else {
    subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1);
  }

  // Update user subscription
  await updateUserSubscription({
    userId,
    userType,
    subscriptionId: stripeSubscriptionId,
    planId,
    status: 'ACTIVE',
    subscriptionStartDate,
    subscriptionEndDate,
    nextBillingDate: subscriptionEndDate,
  });
}

/**
 * Handle subscription renewal
 */
export async function renewSubscription(
  stripeSubscriptionId: string
): Promise<void> {
  const prisma = databaseManager.getPrismaClient();

  // Get subscription from Stripe
  const subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);

  // Find user by Stripe subscription ID
  let user: any = null;
  let userType: 'HEALTHCARE' | 'EMS' | 'ADMIN' | 'USER' = 'ADMIN';

  // Search in all user tables
  const healthcareUser = await prisma.healthcareUser.findFirst({
    where: { stripeSubscriptionId },
  });
  if (healthcareUser) {
    user = healthcareUser;
    userType = 'HEALTHCARE';
  } else {
    const emsUser = await prisma.eMSUser.findFirst({
      where: { stripeSubscriptionId },
    });
    if (emsUser) {
      user = emsUser;
      userType = 'EMS';
    } else {
      const centerUser = await prisma.centerUser.findFirst({
        where: { stripeSubscriptionId },
      });
      if (centerUser) {
        user = centerUser;
        userType = 'ADMIN';
      }
    }
  }

  if (!user) {
    throw new Error(`User not found for subscription: ${stripeSubscriptionId}`);
  }

  // Calculate new subscription end date
  const currentEndDate = user.subscriptionEndDate 
    ? new Date(user.subscriptionEndDate)
    : new Date();
  
  const billingCycle = subscription.items.data[0]?.price.recurring?.interval || 'month';
  const newEndDate = new Date(currentEndDate);
  if (billingCycle === 'year') {
    newEndDate.setFullYear(newEndDate.getFullYear() + 1);
  } else {
    newEndDate.setMonth(newEndDate.getMonth() + 1);
  }

  // Update subscription end date
  await updateUserSubscription({
    userId: user.id,
    userType,
    subscriptionId: stripeSubscriptionId,
    planId: user.subscriptionPlanId || '',
    status: 'ACTIVE',
    subscriptionEndDate: newEndDate,
    nextBillingDate: newEndDate,
  });
}

/**
 * Handle payment failure and start grace period
 */
export async function handlePaymentFailure(
  stripeSubscriptionId: string
): Promise<void> {
  const prisma = databaseManager.getPrismaClient();

  // Find user by Stripe subscription ID
  let user: any = null;
  let userType: 'HEALTHCARE' | 'EMS' | 'ADMIN' | 'USER' = 'ADMIN';

  const healthcareUser = await prisma.healthcareUser.findFirst({
    where: { stripeSubscriptionId },
  });
  if (healthcareUser) {
    user = healthcareUser;
    userType = 'HEALTHCARE';
  } else {
    const emsUser = await prisma.eMSUser.findFirst({
      where: { stripeSubscriptionId },
    });
    if (emsUser) {
      user = emsUser;
      userType = 'EMS';
    } else {
      const centerUser = await prisma.centerUser.findFirst({
        where: { stripeSubscriptionId },
      });
      if (centerUser) {
        user = centerUser;
        userType = 'ADMIN';
      }
    }
  }

  if (!user) {
    throw new Error(`User not found for subscription: ${stripeSubscriptionId}`);
  }

  // Start 7-day grace period
  const gracePeriodEndDate = new Date();
  gracePeriodEndDate.setDate(gracePeriodEndDate.getDate() + 7);

  await updateUserSubscription({
    userId: user.id,
    userType,
    subscriptionId: stripeSubscriptionId,
    planId: user.subscriptionPlanId || '',
    status: 'PAST_DUE',
    gracePeriodEndDate,
  });
}

/**
 * Handle subscription cancellation
 */
export async function cancelUserSubscription(
  stripeSubscriptionId: string,
  cancelAtPeriodEnd: boolean = true
): Promise<void> {
  const prisma = databaseManager.getPrismaClient();

  // Find user by Stripe subscription ID
  let user: any = null;
  let userType: 'HEALTHCARE' | 'EMS' | 'ADMIN' | 'USER' = 'ADMIN';

  const healthcareUser = await prisma.healthcareUser.findFirst({
    where: { stripeSubscriptionId },
  });
  if (healthcareUser) {
    user = healthcareUser;
    userType = 'HEALTHCARE';
  } else {
    const emsUser = await prisma.eMSUser.findFirst({
      where: { stripeSubscriptionId },
    });
    if (emsUser) {
      user = emsUser;
      userType = 'EMS';
    } else {
      const centerUser = await prisma.centerUser.findFirst({
        where: { stripeSubscriptionId },
      });
      if (centerUser) {
        user = centerUser;
        userType = 'ADMIN';
      }
    }
  }

  if (!user) {
    throw new Error(`User not found for subscription: ${stripeSubscriptionId}`);
  }

  if (cancelAtPeriodEnd) {
    // Cancel at period end - user keeps access until subscriptionEndDate
    await updateUserSubscription({
      userId: user.id,
      userType,
      subscriptionId: stripeSubscriptionId,
      planId: user.subscriptionPlanId || '',
      status: 'CANCELLED',
      subscriptionEndDate: user.subscriptionEndDate || new Date(),
    });
  } else {
    // Cancel immediately
    await updateUserSubscription({
      userId: user.id,
      userType,
      subscriptionId: stripeSubscriptionId,
      planId: user.subscriptionPlanId || '',
      status: 'CANCELLED',
      subscriptionEndDate: new Date(), // Access ends now
    });
  }
}

/**
 * Check if subscription is in grace period
 */
export async function isInGracePeriod(userId: string, userType: string): Promise<boolean> {
  const prisma = databaseManager.getPrismaClient();

  let user: any;
  if (userType === 'HEALTHCARE') {
    user = await prisma.healthcareUser.findUnique({ where: { id: userId } });
  } else if (userType === 'EMS') {
    user = await prisma.eMSUser.findUnique({ where: { id: userId } });
  } else {
    user = await prisma.centerUser.findUnique({ where: { id: userId } });
  }

  if (!user || !user.gracePeriodEndDate) {
    return false;
  }

  const now = new Date();
  const graceEnd = new Date(user.gracePeriodEndDate);
  return now <= graceEnd;
}
