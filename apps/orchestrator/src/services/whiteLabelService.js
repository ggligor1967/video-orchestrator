import { logger } from '../utils/logger.js';

export class WhiteLabelService {
  constructor({ logger: log }) {
    this.logger = log;
    this.brands = new Map();
  }

  async createBrand(orgId, branding) {
    const brand = {
      orgId,
      name: branding.name,
      logo: branding.logo,
      colors: {
        primary: branding.primaryColor || '#3B82F6',
        secondary: branding.secondaryColor || '#10B981',
        accent: branding.accentColor || '#F59E0B'
      },
      fonts: {
        heading: branding.headingFont || 'Inter',
        body: branding.bodyFont || 'Inter'
      },
      domain: branding.customDomain,
      emailDomain: branding.emailDomain,
      features: {
        customLogin: true,
        customDashboard: true,
        customReports: true,
        apiAccess: true
      },
      createdAt: new Date().toISOString()
    };

    this.brands.set(orgId, brand);
    this.logger.info('White-label brand created', { orgId, name: brand.name });

    return brand;
  }

  getBrand(orgId) {
    return this.brands.get(orgId);
  }

  async updateBrand(orgId, updates) {
    const brand = this.brands.get(orgId);
    if (!brand) throw new Error('Brand not found');

    Object.assign(brand, updates);
    brand.updatedAt = new Date().toISOString();

    this.logger.info('Brand updated', { orgId });
    return brand;
  }

  async generateCustomDomain(orgId, domain) {
    const brand = this.brands.get(orgId);
    if (!brand) throw new Error('Brand not found');

    brand.domain = domain;
    brand.dnsRecords = [
      { type: 'CNAME', name: domain, value: 'videoorchestrator.com' },
      { type: 'TXT', name: `_verify.${domain}`, value: `verify-${orgId}` }
    ];

    this.logger.info('Custom domain configured', { orgId, domain });
    return brand;
  }
}
