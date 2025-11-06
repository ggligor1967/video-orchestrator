import fs from 'fs/promises';
import path from 'path';
import { v4 as uuid } from 'uuid';
import { logger } from '../utils/logger.js';

const MARKETPLACE_DIR = path.join(process.cwd(), 'data', 'marketplace');
const PURCHASES_FILE = path.join(MARKETPLACE_DIR, 'purchases.json');

export class MarketplaceService {
  constructor({ logger: log, templateService, subscriptionService }) {
    this.logger = log;
    this.templateService = templateService;
    this.subscriptionService = subscriptionService;
  }

  async init() {
    await fs.mkdir(MARKETPLACE_DIR, { recursive: true });
  }

  async listMarketplaceTemplates({ category, tier, minRating, search } = {}) {
    let templates = await this.templateService.getAllTemplates();

    // Filter marketplace templates only
    templates = templates.filter(t => t.marketplace?.listed);

    if (tier) {
      templates = templates.filter(t => t.marketplace.tier === tier);
    }

    if (category) {
      templates = templates.filter(t => t.category === category);
    }

    if (minRating) {
      templates = templates.filter(t => (t.marketplace.rating || 0) >= minRating);
    }

    if (search) {
      const s = search.toLowerCase();
      templates = templates.filter(t =>
        t.name.toLowerCase().includes(s) ||
        t.description.toLowerCase().includes(s)
      );
    }

    return templates.map(t => ({
      ...t,
      price: t.marketplace.price,
      tier: t.marketplace.tier,
      rating: t.marketplace.rating,
      downloads: t.marketplace.downloads
    }));
  }

  async purchaseTemplate(userId, templateId) {
    const template = await this.templateService.getTemplateById(templateId);
    
    if (!template.marketplace?.listed) {
      throw new Error('Template not available in marketplace');
    }

    // Check if already purchased
    const purchases = await this.getUserPurchases(userId);
    if (purchases.some(p => p.templateId === templateId)) {
      throw new Error('Template already purchased');
    }

    // Record purchase
    const purchase = {
      id: uuid(),
      userId,
      templateId,
      price: template.marketplace.price,
      purchasedAt: new Date().toISOString()
    };

    purchases.push(purchase);
    await this.savePurchases(purchases);

    // Increment download count
    template.marketplace.downloads = (template.marketplace.downloads || 0) + 1;
    await this.templateService.updateTemplate(templateId, template);

    this.logger.info('Template purchased', { userId, templateId, price: purchase.price });

    return purchase;
  }

  async getUserPurchases(userId) {
    try {
      const data = await fs.readFile(PURCHASES_FILE, 'utf-8');
      const all = JSON.parse(data);
      return all.filter(p => p.userId === userId);
    } catch {
      return [];
    }
  }

  async savePurchases(purchases) {
    await fs.writeFile(PURCHASES_FILE, JSON.stringify(purchases, null, 2));
  }

  async rateTemplate(userId, templateId, rating, review) {
    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    const template = await this.templateService.getTemplateById(templateId);
    
    if (!template.marketplace) {
      template.marketplace = { listed: false, reviews: [] };
    }

    template.marketplace.reviews = template.marketplace.reviews || [];
    template.marketplace.reviews.push({
      userId,
      rating,
      review,
      createdAt: new Date().toISOString()
    });

    // Calculate average rating
    const ratings = template.marketplace.reviews.map(r => r.rating);
    template.marketplace.rating = ratings.reduce((a, b) => a + b, 0) / ratings.length;

    await this.templateService.updateTemplate(templateId, template);

    this.logger.info('Template rated', { templateId, rating, avgRating: template.marketplace.rating });

    return template.marketplace;
  }
}
