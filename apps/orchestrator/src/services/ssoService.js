import { v4 as uuid } from 'uuid';
import { logger } from '../utils/logger.js';

const SSO_PROVIDERS = {
  google: { name: 'Google', authUrl: 'https://accounts.google.com/o/oauth2/v2/auth' },
  microsoft: { name: 'Microsoft', authUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize' },
  okta: { name: 'Okta', authUrl: 'https://dev-123456.okta.com/oauth2/v1/authorize' },
  saml: { name: 'SAML 2.0', authUrl: '/saml/login' }
};

export class SSOService {
  constructor({ logger: log }) {
    this.logger = log;
    this.sessions = new Map();
    this.organizations = new Map();
  }

  async configureSSO(orgId, provider, config) {
    const ssoConfig = {
      orgId,
      provider,
      clientId: config.clientId,
      domain: config.domain,
      enabled: true,
      createdAt: new Date().toISOString()
    };

    this.organizations.set(orgId, ssoConfig);
    this.logger.info('SSO configured', { orgId, provider });

    return ssoConfig;
  }

  async authenticateSSO(provider, token) {
    // Mock SSO authentication
    const session = {
      id: uuid(),
      userId: `user-${Date.now()}`,
      provider,
      email: `user@${provider}.com`,
      roles: ['user'],
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString()
    };

    this.sessions.set(session.id, session);
    this.logger.info('SSO authentication successful', { provider, userId: session.userId });

    return session;
  }

  validateSession(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    if (new Date(session.expiresAt) < new Date()) {
      this.sessions.delete(sessionId);
      return null;
    }

    return session;
  }

  getSupportedProviders() {
    return Object.entries(SSO_PROVIDERS).map(([key, value]) => ({
      id: key,
      ...value
    }));
  }
}
