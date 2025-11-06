import { subscriptionService } from '../services/subscriptionService.js';
import { logger } from '../utils/logger.js';

export const requirePlan = (minPlan) => {
  const planHierarchy = { free: 0, pro: 1, business: 2 };

  return async (req, res, next) => {
    const userId = req.headers['x-user-id'] || 'default-user';
    const user = subscriptionService.getUserSubscription(userId);
    const userLevel = planHierarchy[user.plan] || 0;
    const requiredLevel = planHierarchy[minPlan] || 0;

    if (userLevel < requiredLevel) {
      logger.warn('Plan upgrade required', { userId, userPlan: user.plan, required: minPlan });
      return res.status(403).json({
        success: false,
        error: {
          code: 'PLAN_UPGRADE_REQUIRED',
          message: `This feature requires ${minPlan} plan or higher`,
          currentPlan: user.plan,
          requiredPlan: minPlan
        }
      });
    }

    req.userId = userId;
    req.userPlan = user.plan;
    next();
  };
};

export const checkLimit = (resource) => {
  return async (req, res, next) => {
    const userId = req.headers['x-user-id'] || 'default-user';
    const amount = req.body.amount || 1;

    const check = await subscriptionService.checkLimit(userId, resource, amount);

    if (!check.allowed) {
      logger.warn('Usage limit exceeded', { userId, resource, ...check });
      return res.status(429).json({
        success: false,
        error: {
          code: 'LIMIT_EXCEEDED',
          message: `${resource} limit exceeded`,
          current: check.current,
          limit: check.limit,
          remaining: check.remaining
        }
      });
    }

    req.userId = userId;
    next();
  };
};
