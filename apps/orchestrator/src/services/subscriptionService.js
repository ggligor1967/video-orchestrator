import { logger } from '../utils/logger.js';

const PLANS = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    limits: {
      videosPerMonth: 10,
      batchSize: 3,
      aiCredits: 20,
      templates: ['basic'],
      brandKits: 1,
      exportQuality: 'standard',
      watermark: true
    }
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 29,
    limits: {
      videosPerMonth: 100,
      batchSize: 10,
      aiCredits: 500,
      templates: ['basic', 'premium'],
      brandKits: 5,
      exportQuality: 'high',
      watermark: false
    }
  },
  business: {
    id: 'business',
    name: 'Business',
    price: 99,
    limits: {
      videosPerMonth: -1, // unlimited
      batchSize: 50,
      aiCredits: -1,
      templates: ['basic', 'premium', 'exclusive'],
      brandKits: -1,
      exportQuality: 'ultra',
      watermark: false
    }
  }
};

const users = new Map(); // In production: use database

export const subscriptionService = {
  getPlans() {
    return Object.values(PLANS);
  },

  getPlan(planId) {
    return PLANS[planId] || null;
  },

  getUserSubscription(userId) {
    const user = users.get(userId) || {
      userId,
      plan: 'free',
      usage: { videosThisMonth: 0, aiCreditsUsed: 0 },
      periodStart: new Date().toISOString()
    };
    users.set(userId, user);
    return user;
  },

  async checkLimit(userId, resource, amount = 1) {
    const user = this.getUserSubscription(userId);
    const plan = PLANS[user.plan];
    const limit = plan.limits[resource];

    if (limit === -1) return { allowed: true };

    const current = user.usage[`${resource}Used`] || 0;
    const allowed = current + amount <= limit;

    logger.info('Limit check', { userId, resource, current, limit, allowed });

    return {
      allowed,
      current,
      limit,
      remaining: Math.max(0, limit - current)
    };
  },

  async incrementUsage(userId, resource, amount = 1) {
    const user = this.getUserSubscription(userId);
    const key = `${resource}Used`;
    user.usage[key] = (user.usage[key] || 0) + amount;
    users.set(userId, user);

    logger.info('Usage incremented', { userId, resource, amount, total: user.usage[key] });
  },

  async resetMonthlyUsage(userId) {
    const user = this.getUserSubscription(userId);
    user.usage = { videosThisMonth: 0, aiCreditsUsed: 0 };
    user.periodStart = new Date().toISOString();
    users.set(userId, user);
  }
};
