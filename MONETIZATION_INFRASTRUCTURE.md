# 💰 Monetization Infrastructure - Freemium & Marketplace

**Date**: 2025-01-20  
**Status**: ✅ Ready for Implementation  
**Business Model**: Freemium + Template Marketplace

---

## 📊 OVERVIEW

### Freemium Model
Three-tier subscription system with usage-based limits:
- **Free**: 10 videos/month, basic templates, watermark
- **Pro**: 100 videos/month, premium templates, no watermark ($29/mo)
- **Business**: Unlimited videos, exclusive templates, priority support ($99/mo)

### Template Marketplace
- Buy/sell custom templates
- Rating and review system
- Tiered pricing (basic/premium/exclusive)
- Revenue sharing model ready

---

## 🏗️ ARCHITECTURE

### Services

#### 1. Subscription Service (`subscriptionService.js`)
```javascript
// Plan management
subscriptionService.getPlans()
subscriptionService.getPlan(planId)
subscriptionService.getUserSubscription(userId)

// Usage tracking
subscriptionService.checkLimit(userId, 'videosPerMonth', 1)
subscriptionService.incrementUsage(userId, 'videosPerMonth', 1)
subscriptionService.resetMonthlyUsage(userId)
```

#### 2. Marketplace Service (`marketplaceService.js`)
```javascript
// Template browsing
marketplaceService.listMarketplaceTemplates({ tier, category, minRating })

// Purchasing
marketplaceService.purchaseTemplate(userId, templateId)
marketplaceService.getUserPurchases(userId)

// Rating
marketplaceService.rateTemplate(userId, templateId, rating, review)
```

### Middleware

#### Plan Requirements
```javascript
import { requirePlan } from './middleware/subscriptionMiddleware.js';

// Require Pro plan or higher
router.post('/premium-feature', requirePlan('pro'), handler);
```

#### Usage Limits
```javascript
import { checkLimit } from './middleware/subscriptionMiddleware.js';

// Check video creation limit
router.post('/pipeline/build', checkLimit('videosPerMonth'), handler);
```

---

## 💳 SUBSCRIPTION PLANS

### Free Plan
```json
{
  "id": "free",
  "name": "Free",
  "price": 0,
  "limits": {
    "videosPerMonth": 10,
    "batchSize": 3,
    "aiCredits": 20,
    "templates": ["basic"],
    "brandKits": 1,
    "exportQuality": "standard",
    "watermark": true
  }
}
```

### Pro Plan ($29/month)
```json
{
  "id": "pro",
  "name": "Pro",
  "price": 29,
  "limits": {
    "videosPerMonth": 100,
    "batchSize": 10,
    "aiCredits": 500,
    "templates": ["basic", "premium"],
    "brandKits": 5,
    "exportQuality": "high",
    "watermark": false
  }
}
```

### Business Plan ($99/month)
```json
{
  "id": "business",
  "name": "Business",
  "price": 99,
  "limits": {
    "videosPerMonth": -1,
    "batchSize": 50,
    "aiCredits": -1,
    "templates": ["basic", "premium", "exclusive"],
    "brandKits": -1,
    "exportQuality": "ultra",
    "watermark": false
  }
}
```

---

## 🛒 MARKETPLACE

### Template Tiers

**Basic** (Free)
- Included with all plans
- Simple layouts
- Standard effects

**Premium** ($9-$29)
- Pro plan required
- Advanced animations
- Custom branding

**Exclusive** ($49-$99)
- Business plan required
- Professional quality
- Industry-specific

### Template Metadata
```json
{
  "id": "template-123",
  "name": "Horror Story Pro",
  "marketplace": {
    "listed": true,
    "tier": "premium",
    "price": 19,
    "rating": 4.7,
    "downloads": 1250,
    "reviews": [
      {
        "userId": "user-456",
        "rating": 5,
        "review": "Amazing template!",
        "createdAt": "2025-01-15T10:00:00Z"
      }
    ]
  }
}
```

---

## 🔌 API ENDPOINTS

### Subscription

#### Get Plans
```bash
GET /subscription/plans

Response:
{
  "success": true,
  "data": {
    "plans": [
      { "id": "free", "name": "Free", "price": 0, ... },
      { "id": "pro", "name": "Pro", "price": 29, ... },
      { "id": "business", "name": "Business", "price": 99, ... }
    ]
  }
}
```

#### Get Current Subscription
```bash
GET /subscription/current
Headers: x-user-id: user-123

Response:
{
  "success": true,
  "data": {
    "subscription": {
      "userId": "user-123",
      "plan": "pro",
      "usage": {
        "videosThisMonth": 45,
        "aiCreditsUsed": 230
      },
      "periodStart": "2025-01-01T00:00:00Z",
      "planDetails": { ... }
    }
  }
}
```

#### Get Usage
```bash
GET /subscription/usage
Headers: x-user-id: user-123

Response:
{
  "success": true,
  "data": {
    "usage": {
      "videosThisMonth": {
        "used": 45,
        "limit": 100,
        "remaining": 55
      },
      "aiCredits": {
        "used": 230,
        "limit": 500,
        "remaining": 270
      }
    }
  }
}
```

#### Upgrade Plan
```bash
POST /subscription/upgrade
Headers: x-user-id: user-123
Body: { "planId": "business" }

Response:
{
  "success": true,
  "data": {
    "subscription": { ... },
    "planDetails": { ... }
  }
}
```

### Marketplace

#### List Templates
```bash
GET /marketplace/templates?tier=premium&category=horror&minRating=4.0

Response:
{
  "success": true,
  "data": {
    "templates": [
      {
        "id": "template-123",
        "name": "Horror Story Pro",
        "price": 19,
        "tier": "premium",
        "rating": 4.7,
        "downloads": 1250
      }
    ],
    "total": 15
  }
}
```

#### Purchase Template
```bash
POST /marketplace/templates/template-123/purchase
Headers: x-user-id: user-123

Response:
{
  "success": true,
  "data": {
    "purchase": {
      "id": "purchase-789",
      "userId": "user-123",
      "templateId": "template-123",
      "price": 19,
      "purchasedAt": "2025-01-20T10:00:00Z"
    }
  },
  "message": "Template purchased successfully"
}
```

#### Rate Template
```bash
POST /marketplace/templates/template-123/rate
Headers: x-user-id: user-123
Body: {
  "rating": 5,
  "review": "Excellent template, very professional!"
}

Response:
{
  "success": true,
  "data": {
    "marketplace": {
      "rating": 4.8,
      "reviews": [ ... ]
    }
  },
  "message": "Rating submitted successfully"
}
```

#### Get User Purchases
```bash
GET /marketplace/purchases
Headers: x-user-id: user-123

Response:
{
  "success": true,
  "data": {
    "purchases": [
      {
        "id": "purchase-789",
        "templateId": "template-123",
        "price": 19,
        "purchasedAt": "2025-01-20T10:00:00Z"
      }
    ],
    "total": 5
  }
}
```

---

## 🔒 USAGE ENFORCEMENT

### Middleware Integration

```javascript
// Require Pro plan for premium features
app.post('/templates/premium', 
  requirePlan('pro'), 
  templateController.create
);

// Check video creation limit
app.post('/pipeline/build',
  checkLimit('videosPerMonth'),
  async (req, res) => {
    // Create video
    await pipelineService.buildCompleteVideo(req.body);
    
    // Increment usage
    await subscriptionService.incrementUsage(
      req.userId, 
      'videosPerMonth', 
      1
    );
    
    res.json({ success: true });
  }
);
```

### Error Responses

**Plan Upgrade Required**
```json
{
  "success": false,
  "error": {
    "code": "PLAN_UPGRADE_REQUIRED",
    "message": "This feature requires pro plan or higher",
    "currentPlan": "free",
    "requiredPlan": "pro"
  }
}
```

**Limit Exceeded**
```json
{
  "success": false,
  "error": {
    "code": "LIMIT_EXCEEDED",
    "message": "videosPerMonth limit exceeded",
    "current": 10,
    "limit": 10,
    "remaining": 0
  }
}
```

---

## 💾 DATA STORAGE

### Current (In-Memory)
```javascript
// subscriptionService.js
const users = new Map(); // userId -> subscription

// marketplaceService.js
const purchases = []; // stored in data/marketplace/purchases.json
```

### Production (Database)
```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  plan VARCHAR(50) DEFAULT 'free',
  period_start TIMESTAMP,
  created_at TIMESTAMP
);

-- Usage table
CREATE TABLE usage (
  user_id UUID REFERENCES users(id),
  resource VARCHAR(50),
  amount INT,
  period VARCHAR(7), -- YYYY-MM
  PRIMARY KEY (user_id, resource, period)
);

-- Purchases table
CREATE TABLE purchases (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  template_id UUID,
  price DECIMAL(10,2),
  purchased_at TIMESTAMP
);

-- Reviews table
CREATE TABLE reviews (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  template_id UUID,
  rating INT CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  created_at TIMESTAMP
);
```

---

## 🎯 REVENUE PROJECTIONS

### Monthly Recurring Revenue (MRR)

**Conservative (100 users)**
- Free: 70 users × $0 = $0
- Pro: 25 users × $29 = $725
- Business: 5 users × $99 = $495
- **Total MRR**: $1,220

**Moderate (500 users)**
- Free: 350 users × $0 = $0
- Pro: 125 users × $29 = $3,625
- Business: 25 users × $99 = $2,475
- **Total MRR**: $6,100

**Optimistic (1000 users)**
- Free: 700 users × $0 = $0
- Pro: 250 users × $29 = $7,250
- Business: 50 users × $99 = $4,950
- **Total MRR**: $12,200

### Marketplace Revenue

**Template Sales (per month)**
- 50 templates × $19 avg × 30% commission = $285
- 20 premium templates × $49 avg × 30% commission = $294
- **Total Marketplace**: ~$580/month

### Annual Recurring Revenue (ARR)

| Scenario | MRR | ARR | Marketplace | Total |
|----------|-----|-----|-------------|-------|
| Conservative | $1,220 | $14,640 | $6,960 | **$21,600** |
| Moderate | $6,100 | $73,200 | $34,800 | **$108,000** |
| Optimistic | $12,200 | $146,400 | $69,600 | **$216,000** |

---

## 🚀 IMPLEMENTATION ROADMAP

### Phase 1: Core Infrastructure (✅ Complete)
- [x] Subscription service with 3 tiers
- [x] Usage tracking and limits
- [x] Marketplace service
- [x] Purchase and rating system
- [x] API endpoints
- [x] Middleware for enforcement

### Phase 2: Payment Integration (Next)
- [ ] Stripe integration for subscriptions
- [ ] Payment processing for marketplace
- [ ] Webhook handling for subscription events
- [ ] Invoice generation

### Phase 3: User Management (Next)
- [ ] User authentication (JWT)
- [ ] User registration and login
- [ ] Email verification
- [ ] Password reset

### Phase 4: Frontend Integration (Next)
- [ ] Subscription management UI
- [ ] Marketplace browsing UI
- [ ] Purchase flow
- [ ] Usage dashboard

### Phase 5: Analytics & Optimization (Future)
- [ ] Revenue analytics dashboard
- [ ] User behavior tracking
- [ ] A/B testing for pricing
- [ ] Churn prediction

---

## 📝 NEXT STEPS

### Immediate (Week 1)
1. **Stripe Integration**
   - Set up Stripe account
   - Implement subscription checkout
   - Handle webhooks for subscription events

2. **User Authentication**
   - JWT-based authentication
   - User registration/login endpoints
   - Session management

### Short-Term (Month 1)
3. **Frontend UI**
   - Subscription plans page
   - Marketplace template browser
   - User dashboard with usage stats

4. **Testing**
   - Unit tests for subscription logic
   - Integration tests for payment flow
   - E2E tests for purchase flow

### Medium-Term (Month 2-3)
5. **Analytics**
   - Revenue tracking dashboard
   - User engagement metrics
   - Template performance analytics

6. **Marketing**
   - Landing page with pricing
   - Email campaigns for upgrades
   - Referral program

---

## 🔧 CONFIGURATION

### Environment Variables
```bash
# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Plans
FREE_PLAN_VIDEOS=10
PRO_PLAN_VIDEOS=100
PRO_PLAN_PRICE=29
BUSINESS_PLAN_PRICE=99

# Marketplace
MARKETPLACE_COMMISSION=0.30  # 30%
```

---

## ✅ CONCLUSION

### Infrastructure Ready
- ✅ Subscription service with 3 tiers
- ✅ Usage tracking and enforcement
- ✅ Template marketplace
- ✅ Purchase and rating system
- ✅ API endpoints complete
- ✅ Middleware for plan requirements

### Next: Payment Integration
- Stripe for subscriptions
- Payment processing for marketplace
- User authentication
- Frontend UI

**Status**: 🚀 Ready for payment integration and user management
