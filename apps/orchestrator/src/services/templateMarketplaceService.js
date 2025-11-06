/**
 * Template Marketplace Service
 * Browse, purchase, and download video templates
 */

import path from 'path';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';

export class TemplateMarketplaceService {
  constructor({ logger }) {
    this.logger = logger;
    this.templates = [];
    this.purchases = new Map();
    this.reviews = new Map();
    
    // Initialize with seed templates
    this.initializeSeedTemplates();
  }

  /**
   * Initialize marketplace with pre-seeded templates
   */
  initializeSeedTemplates() {
    this.templates = [
      {
        id: 'horror-suspense-01',
        name: 'Horror Suspense Pro',
        description: 'Dark atmospheric template with tension-building effects',
        category: 'horror',
        price: 0,
        rating: 4.8,
        downloads: 1250,
        tags: ['horror', 'suspense', 'dark', 'atmospheric'],
        author: 'VideoOrchestrator',
        thumbnail: '/static/templates/horror-suspense-01/thumb.jpg',
        isPremium: false
      },
      {
        id: 'mystery-noir-02',
        name: 'Mystery Noir Classic',
        description: 'Film noir style with dramatic lighting and shadows',
        category: 'mystery',
        price: 5,
        rating: 4.6,
        downloads: 890,
        tags: ['mystery', 'noir', 'classic', 'dramatic'],
        author: 'VideoOrchestrator',
        thumbnail: '/static/templates/mystery-noir-02/thumb.jpg',
        isPremium: true
      },
      {
        id: 'paranormal-03',
        name: 'Paranormal Investigation',
        description: 'Found footage style with glitch effects',
        category: 'paranormal',
        price: 10,
        rating: 4.9,
        downloads: 2100,
        tags: ['paranormal', 'investigation', 'glitch', 'found-footage'],
        author: 'VideoOrchestrator',
        thumbnail: '/static/templates/paranormal-03/thumb.jpg',
        isPremium: true
      }
    ];

    this.logger.info('Marketplace initialized with seed templates', { 
      count: this.templates.length 
    });
  }

  /**
   * Browse templates with filters
   */
  async browseTemplates(filters = {}, pagination = {}) {
    const {
      category,
      priceRange,
      minRating,
      tags,
      sortBy = 'downloads'
    } = filters;

    const { page = 1, limit = 12 } = pagination;

    this.logger.info('Browsing templates', { filters, pagination });

    let filtered = [...this.templates];

    // Apply filters
    if (category) {
      filtered = filtered.filter(t => t.category === category);
    }

    if (priceRange) {
      const [min, max] = priceRange;
      filtered = filtered.filter(t => t.price >= min && t.price <= max);
    }

    if (minRating) {
      filtered = filtered.filter(t => t.rating >= minRating);
    }

    if (tags && tags.length > 0) {
      filtered = filtered.filter(t => 
        tags.some(tag => t.tags.includes(tag))
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'downloads':
          return b.downloads - a.downloads;
        case 'rating':
          return b.rating - a.rating;
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        default:
          return 0;
      }
    });

    // Paginate
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginated = filtered.slice(start, end);

    return {
      templates: paginated,
      pagination: {
        page,
        limit,
        total: filtered.length,
        pages: Math.ceil(filtered.length / limit)
      }
    };
  }

  /**
   * Get template by ID
   */
  async getTemplateById(id) {
    this.logger.info('Getting template by ID', { id });

    const template = this.templates.find(t => t.id === id);
    if (!template) {
      throw new Error(`Template not found: ${id}`);
    }

    // Include reviews
    const reviews = this.reviews.get(id) || [];

    return {
      ...template,
      reviews
    };
  }

  /**
   * Search templates
   */
  async searchTemplates(query, filters = {}) {
    this.logger.info('Searching templates', { query, filters });

    const lowerQuery = query.toLowerCase();

    let results = this.templates.filter(t =>
      t.name.toLowerCase().includes(lowerQuery) ||
      t.description.toLowerCase().includes(lowerQuery) ||
      t.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );

    // Apply additional filters if provided
    if (filters.category) {
      results = results.filter(t => t.category === filters.category);
    }

    return {
      templates: results,
      query,
      count: results.length
    };
  }

  /**
   * Get featured templates
   */
  async getFeaturedTemplates(limit = 6) {
    this.logger.info('Getting featured templates', { limit });

    // Return top-rated templates
    const featured = [...this.templates]
      .sort((a, b) => b.rating - a.rating)
      .slice(0, limit);

    return featured;
  }

  /**
   * Purchase template
   */
  async purchaseTemplate(templateId, userId) {
    this.logger.info('Processing template purchase', { templateId, userId });

    const template = this.templates.find(t => t.id === templateId);
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    // Check if already purchased
    const purchaseKey = `${userId}:${templateId}`;
    if (this.purchases.has(purchaseKey)) {
      throw new Error('Template already purchased');
    }

    // Process payment (mock)
    const purchase = {
      id: uuidv4(),
      userId,
      templateId,
      price: template.price,
      purchasedAt: new Date().toISOString()
    };

    this.purchases.set(purchaseKey, purchase);

    // Increment download count
    template.downloads += 1;

    this.logger.info('Purchase completed', { purchase });

    return purchase;
  }

  /**
   * Download template
   */
  async downloadTemplate(templateId, userId) {
    this.logger.info('Processing template download', { templateId, userId });

    // Verify purchase
    const purchaseKey = `${userId}:${templateId}`;
    const purchase = this.purchases.get(purchaseKey);

    const template = this.templates.find(t => t.id === templateId);
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    // Allow free templates without purchase
    if (template.price > 0 && !purchase) {
      throw new Error('Template not purchased');
    }

    // Generate download URL (mock)
    const downloadUrl = `/static/templates/${templateId}/template.json`;

    return {
      templateId,
      downloadUrl,
      expiresAt: new Date(Date.now() + 3600000).toISOString() // 1 hour
    };
  }

  /**
   * Rate and review template
   */
  async rateTemplate(templateId, userId, rating, reviewText) {
    this.logger.info('Adding template review', { templateId, userId, rating });

    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    const template = this.templates.find(t => t.id === templateId);
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    const reviews = this.reviews.get(templateId) || [];
    
    const review = {
      id: uuidv4(),
      userId,
      rating,
      reviewText,
      createdAt: new Date().toISOString()
    };

    reviews.push(review);
    this.reviews.set(templateId, reviews);

    // Recalculate average rating
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    template.rating = Math.round(avgRating * 10) / 10;

    this.logger.info('Review added', { review });

    return review;
  }

  /**
   * Get user's purchased templates
   */
  async getUserTemplates(userId) {
    this.logger.info('Getting user templates', { userId });

    const userPurchases = Array.from(this.purchases.values())
      .filter(p => p.userId === userId);

    const templates = userPurchases.map(purchase => {
      const template = this.templates.find(t => t.id === purchase.templateId);
      return {
        ...template,
        purchasedAt: purchase.purchasedAt
      };
    });

    return templates;
  }
}
