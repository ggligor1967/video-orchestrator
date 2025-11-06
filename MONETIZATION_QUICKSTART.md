# 💰 Monetization Quick Start Guide

**5-Minute Setup for Freemium & Marketplace**

---

## 🚀 Already Implemented

✅ **Subscription Service** - 3 tiers (Free, Pro, Business)  
✅ **Usage Tracking** - Videos/month, AI credits, batch size  
✅ **Marketplace Service** - Buy/sell templates  
✅ **Rating System** - 5-star reviews  
✅ **API Endpoints** - `/subscription/*`, `/marketplace/*`  
✅ **Middleware** - Plan requirements, usage limits  

---

## 📋 Quick Test

### 1. Check Available Plans
```bash
curl http://127.0.0.1:4545/subscription/plans
```

### 2. Get Current Subscription
```bash
curl http://127.0.0.1:4545/subscription/current \
  -H "x-user-id: test-user"
```

### 3. Check Usage
```bash
curl http://127.0.0.1:4545/subscription/usage \
  -H "x-user-id: test-user"
```

### 4. Upgrade to Pro
```bash
curl -X POST http://127.0.0.1:4545/subscription/upgrade \
  -H "Content-Type: application/json" \
  -H "x-user-id: test-user" \
  -d '{"planId": "pro"}'
```

### 5. Browse Marketplace
```bash
curl http://127.0.0.1:4545/marketplace/templates?tier=premium
```

---

## 🔧 Usage Enforcement

### Protect Endpoints with Plan Requirements

```javascript
import { requirePlan, checkLimit } from './middleware/subscriptionMiddleware.js';

// Require Pro plan
router.post('/premium-feature', requirePlan('pro'), handler);

// Check usage limit
router.post('/create-video', checkLimit('videosPerMonth'), async (req, res) => {
  // Create video
  const result = await createVideo(req.body);
  
  // Increment usage
  await subscriptionService.incrementUsage(req.userId, 'videosPerMonth', 1);
  
  res.json({ success: true, data: result });
});
```

---

## 💳 Next Steps

### 1. Stripe Integration (Week 1)
```bash
npm install stripe
```

```javascript
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Create checkout session
const session = await stripe.checkout.sessions.create({
  mode: 'subscription',
  line_items: [{
    price: 'price_pro_monthly', // Stripe price ID
    quantity: 1
  }],
  success_url: 'https://yourapp.com/success',
  cancel_url: 'https://yourapp.com/cancel'
});
```

### 2. User Authentication (Week 1)
```bash
npm install jsonwebtoken bcrypt
```

```javascript
import jwt from 'jsonwebtoken';

// Generate token
const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);

// Verify token middleware
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.userId = decoded.userId;
  next();
};
```

### 3. Frontend UI (Week 2)
- Pricing page with plan comparison
- Marketplace template browser
- User dashboard with usage stats
- Payment checkout flow

---

## 📊 Revenue Potential

| Users | MRR | ARR |
|-------|-----|-----|
| 100 | $1,220 | $14,640 |
| 500 | $6,100 | $73,200 |
| 1000 | $12,200 | $146,400 |

**Plus marketplace**: ~$580/month additional revenue

---

## 🎯 Files Created

1. `apps/orchestrator/src/services/subscriptionService.js`
2. `apps/orchestrator/src/services/marketplaceService.js`
3. `apps/orchestrator/src/middleware/subscriptionMiddleware.js`
4. `apps/orchestrator/src/routes/subscription.js`
5. `apps/orchestrator/src/routes/marketplace.js`
6. `apps/orchestrator/src/controllers/subscriptionController.js`
7. `apps/orchestrator/src/controllers/marketplaceController.js`

**All registered in DI container and Express app** ✅

---

## 📖 Full Documentation

See [MONETIZATION_INFRASTRUCTURE.md](MONETIZATION_INFRASTRUCTURE.md) for:
- Complete API reference
- Database schema
- Revenue projections
- Implementation roadmap
- Payment integration guide

---

**Status**: 🚀 Infrastructure ready, payment integration next!
