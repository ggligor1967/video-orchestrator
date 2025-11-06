export const createSubscriptionController = ({ subscriptionService, logger }) => ({
  async getPlans(req, res) {
    try {
      const plans = subscriptionService.getPlans();
      res.json({ success: true, data: { plans } });
    } catch (error) {
      logger.error('Failed to get plans', { error: error.message });
      res.status(500).json({ success: false, error: { message: error.message } });
    }
  },

  async getCurrentSubscription(req, res) {
    try {
      const userId = req.headers['x-user-id'] || 'default-user';
      const subscription = subscriptionService.getUserSubscription(userId);
      const plan = subscriptionService.getPlan(subscription.plan);

      res.json({
        success: true,
        data: {
          subscription: {
            ...subscription,
            planDetails: plan
          }
        }
      });
    } catch (error) {
      logger.error('Failed to get subscription', { error: error.message });
      res.status(500).json({ success: false, error: { message: error.message } });
    }
  },

  async getUsage(req, res) {
    try {
      const userId = req.headers['x-user-id'] || 'default-user';
      const subscription = subscriptionService.getUserSubscription(userId);
      const plan = subscriptionService.getPlan(subscription.plan);

      const usage = {
        videosThisMonth: {
          used: subscription.usage.videosThisMonth || 0,
          limit: plan.limits.videosPerMonth,
          remaining: plan.limits.videosPerMonth === -1 ? -1 : 
            Math.max(0, plan.limits.videosPerMonth - (subscription.usage.videosThisMonth || 0))
        },
        aiCredits: {
          used: subscription.usage.aiCreditsUsed || 0,
          limit: plan.limits.aiCredits,
          remaining: plan.limits.aiCredits === -1 ? -1 :
            Math.max(0, plan.limits.aiCredits - (subscription.usage.aiCreditsUsed || 0))
        }
      };

      res.json({ success: true, data: { usage } });
    } catch (error) {
      logger.error('Failed to get usage', { error: error.message });
      res.status(500).json({ success: false, error: { message: error.message } });
    }
  },

  async upgradePlan(req, res) {
    try {
      const userId = req.headers['x-user-id'] || 'default-user';
      const { planId } = req.body;

      const plan = subscriptionService.getPlan(planId);
      if (!plan) {
        return res.status(404).json({
          success: false,
          error: { message: 'Plan not found' }
        });
      }

      const user = subscriptionService.getUserSubscription(userId);
      user.plan = planId;
      await subscriptionService.resetMonthlyUsage(userId);

      logger.info('Plan upgraded', { userId, newPlan: planId });

      res.json({
        success: true,
        data: {
          subscription: user,
          planDetails: plan
        }
      });
    } catch (error) {
      logger.error('Failed to upgrade plan', { error: error.message });
      res.status(500).json({ success: false, error: { message: error.message } });
    }
  }
});
