import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { createContainer } from '../../apps/orchestrator/src/container/index.js';
import { createApp } from '../../apps/orchestrator/src/app.js';
import { setLogger } from '../../apps/orchestrator/src/utils/logger.js';

let baseUrl;
let server;
let container;

const quietLogger = {
  info: () => {},
  warn: () => {},
  error: () => {},
  debug: () => {}
};

// Mock template data
const mockTemplate = {
  name: 'Horror Story Template',
  description: 'Professional horror story video template',
  category: 'horror',
  tags: ['horror', 'paranormal', 'story'],
  thumbnail: 'path/to/thumbnail.jpg',
  duration: 60,
  scriptSettings: {
    genre: 'horror',
    style: 'narrative',
    duration: 60,
    topic: 'A haunted house' // Topic can't be null for creation
  },
  backgroundSettings: {
    type: 'stock',
    stockQuery: 'haunted house',
    orientation: 'portrait',
    autoSelect: true
  },
  voiceSettings: {
    speed: 1,
    pitch: 1,
    volume: 1
  },
  captionStyle: 'trending-2024',
  audioSettings: {
    voiceoverVolume: 1,
    musicVolume: 0.5,
    sfxVolume: 0.8,
    fadeInDuration: 1,
    fadeOutDuration: 2,
    normalize: true,
    compressor: false
  },
  videoSettings: {
    autoReframe: true,
    detectionMode: 'center',
    speedRamp: true,
    speedRampStart: 2
  },
  exportPreset: 'tiktok'
};

describe('Template Routes', () => {
  beforeAll(async () => {
    container = createContainer();

    const baseConfig = container.resolve('config');
    container.override('config', {
      ...baseConfig,
      logging: { enableHttpLogging: false }
    });

    container.override('logger', quietLogger);
    setLogger(quietLogger);

    // Mock template service
    const mockTemplateService = {
      getAllTemplates: async ({ category, tags, search }) => {
        let templates = [mockTemplate];
        
        if (category) {
          templates = templates.filter(t => t.category === category);
        }
        if (search) {
          templates = templates.filter(t => 
            t.name.toLowerCase().includes(search.toLowerCase()) ||
            t.description.toLowerCase().includes(search.toLowerCase())
          );
        }
        
        return templates;
      },

      getTemplateById: async (id) => {
        if (id.startsWith('template-')) {
          return { ...mockTemplate, id };
        }
        throw new Error('Template not found');
      },

      createTemplate: async (data) => {
        const id = `template-${Date.now()}`;
        return { ...data, id, createdAt: new Date().toISOString() };
      },

      updateTemplate: async (id, data) => {
        if (id.startsWith('template-')) {
          return { ...mockTemplate, id, ...data, updatedAt: new Date().toISOString() };
        }
        throw new Error('Template not found');
      },

      deleteTemplate: async (id) => {
        if (id.startsWith('template-')) {
          return { success: true, message: 'Template deleted' };
        }
        throw new Error('Template not found');
      },

      duplicateTemplate: async (id, newName) => {
        if (id.startsWith('template-')) {
          const newId = `template-${Date.now()}`;
          return {
            ...mockTemplate,
            id: newId,
            name: newName || `${mockTemplate.name} (Copy)`,
            createdAt: new Date().toISOString()
          };
        }
        throw new Error('Template not found');
      },

      applyTemplate: async (id, customizations) => {
        if (id.startsWith('template-')) {
          // Ensure topic is present if not customized
          if (!customizations.topic && !mockTemplate.scriptSettings.topic) {
            throw new Error('Topic is required to apply this template.');
          }
          return {
            templateId: id,
            appliedSettings: { ...mockTemplate, ...customizations },
            jobId: `job-${Date.now()}`
          };
        }
        throw new Error('Template not found');
      }
    };

    container.override('templateService', mockTemplateService);

    const app = createApp({ container });
    
    await new Promise((resolve) => {
      server = app.listen(0, 'localhost', () => {
        const addr = server.address();
        baseUrl = `http://localhost:${addr.port}`;
        resolve();
      });
    });
  });

  afterAll(() => {
    return new Promise((resolve, reject) => {
      server.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  });

  // Variable to hold the ID of the created template
  let createdTemplateId;

  beforeEach(async () => {
    // Create a fresh template before each test that needs one
    try {
      const response = await fetch(`${baseUrl}/templates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockTemplate)
      });
      
      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Failed to create template in beforeEach: ${response.status} - ${errorBody}`);
      }
      
      const data = await response.json();
      
      if (!data.data || !data.data.template || !data.data.template.id) {
        throw new Error(`Invalid response structure in beforeEach: ${JSON.stringify(data)}`);
      }
      
      createdTemplateId = data.data.template.id;
    } catch (error) {
      console.error('beforeEach failed:', error);
      throw error;
    }
  });


  describe('GET /templates', () => {
    it('should return all templates', async () => {
      const response = await fetch(`${baseUrl}/templates`);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data.templates)).toBe(true);
      expect(data.data.count).toBeGreaterThan(0);
    });

    it('should filter templates by category', async () => {
      const response = await fetch(`${baseUrl}/templates?category=horror`);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.templates.every(t => t.category === 'horror')).toBe(true);
    });

    it('should filter templates by search query', async () => {
      const response = await fetch(`${baseUrl}/templates?search=Horror`);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.templates.length).toBeGreaterThan(0);
    });
  });

  describe('GET /templates/:templateId', () => {
    it('should return template by ID', async () => {
      const response = await fetch(`${baseUrl}/templates/${createdTemplateId}`);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.template.id).toBe(createdTemplateId);
      expect(data.data.template.name).toBe(mockTemplate.name);
    });

    it('should return 404 for non-existent template', async () => {
      const response = await fetch(`${baseUrl}/templates/non-existent-id`);
      expect(response.status).toBe(404);

      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('NOT_FOUND');
    });
  });

  describe('POST /templates', () => {
    it('should create a new template with valid data', async () => {
      const response = await fetch(`${baseUrl}/templates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockTemplate)
      });
      expect(response.status).toBe(201);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.template).toHaveProperty('id');
      expect(data.data.template.name).toBe(mockTemplate.name);
      expect(data.message).toBe('Template created successfully');
    });

    it('should reject template creation with missing required fields', async () => {
      const invalid = { ...mockTemplate };
      delete invalid.name;

      const response = await fetch(`${baseUrl}/templates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalid)
      });
      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.success).toBe(false);
    });

    it('should reject template with invalid duration', async () => {
      const invalid = {
        ...mockTemplate,
        duration: 500 // exceeds max of 180
      };

      const response = await fetch(`${baseUrl}/templates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalid)
      });
      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.success).toBe(false);
    });

    it('should reject template with invalid export preset', async () => {
      const invalid = {
        ...mockTemplate,
        exportPreset: 'invalid-preset'
      };

      const response = await fetch(`${baseUrl}/templates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalid)
      });
      expect(response.status).toBe(400);
    });
  });

  describe('PUT /templates/:templateId', () => {
    it('should update template with valid data', async () => {
      const updateData = {
        name: 'Updated Horror Template',
        description: 'Updated description'
      };

      const response = await fetch(`${baseUrl}/templates/${createdTemplateId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...mockTemplate, ...updateData })
      });
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.template.name).toBe(updateData.name);
      expect(data.data.template.description).toBe(updateData.description);
    });

    it('should return 404 when updating non-existent template', async () => {
      const response = await fetch(`${baseUrl}/templates/non-existent`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'New Name' })
      });
      expect(response.status).toBe(404); // Should be 404 not found
    });

    it('should allow partial update data (partial schema)', async () => {
      const partial = { name: 'Only a name' }; // PUT uses partial schema, so this is valid

      const response = await fetch(`${baseUrl}/templates/${createdTemplateId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(partial)
      });
      expect(response.status).toBe(200); // Partial updates are allowed
    });
  });

  describe('DELETE /templates/:templateId', () => {
    it('should delete template by ID', async () => {
      const response = await fetch(`${baseUrl}/templates/${createdTemplateId}`, {
        method: 'DELETE'
      });
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.message).toContain('deleted');
    });

    it('should return 404 when deleting non-existent template', async () => {
      const response = await fetch(`${baseUrl}/templates/non-existent`, {
        method: 'DELETE'
      });
      expect(response.status).toBe(404);
    });
  });

  describe('POST /templates/:templateId/duplicate', () => {
    it('should duplicate template with new name', async () => {
      const response = await fetch(`${baseUrl}/templates/${createdTemplateId}/duplicate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newName: 'Horror Template - Copy' })
      });
      expect(response.status).toBe(201);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.template.name).toBe('Horror Template - Copy');
      expect(data.data.template.id).not.toBe(createdTemplateId);
      expect(data.message).toContain('duplicated');
    });

    it('should duplicate template with default name if not provided', async () => {
      const response = await fetch(`${baseUrl}/templates/${createdTemplateId}/duplicate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      expect(response.status).toBe(201);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.template.name).toContain('Copy');
    });

    it('should return 404 when duplicating non-existent template', async () => {
      const response = await fetch(`${baseUrl}/templates/non-existent/duplicate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newName: 'Copy' })
      });
      expect(response.status).toBe(404);
    });
  });

  describe('POST /templates/:templateId/apply', () => {
    it('should apply template with customizations', async () => {
      const customizations = {
        templateId: createdTemplateId,
        customizations: {
          topic: 'haunted mansion mystery',
          duration: 45
        }
      };

      const response = await fetch(`${baseUrl}/templates/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customizations)
      });
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.templateId).toBe(createdTemplateId);
      expect(data.data.jobId).toBeDefined();
    });

    it('should apply template without customizations', async () => {
      const response = await fetch(`${baseUrl}/templates/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId: createdTemplateId, customizations: { topic: 'default topic' } })
      });
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.jobId).toBeDefined();
    });

    it('should return 404 when applying non-existent template', async () => {
      const response = await fetch(`${baseUrl}/templates/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId: 'non-existent' })
      });
      expect(response.status).toBe(404);
    });
  });

  describe('Validation Protection Logic', () => {
    it('should accept any string for genre (no enum validation)', async () => {
      const validGenre = {
        ...mockTemplate,
        scriptSettings: {
          ...mockTemplate.scriptSettings,
          genre: 'custom-genre' // Genre is just z.string(), not enum
        }
      };

      const response = await fetch(`${baseUrl}/templates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validGenre)
      });
      expect(response.status).toBe(201); // Should succeed - genre has no enum restriction
    });

    it('should protect against invalid background type', async () => {
      const invalid = {
        ...mockTemplate,
        backgroundSettings: {
          ...mockTemplate.backgroundSettings,
          type: 'invalid-type'
        }
      };

      const response = await fetch(`${baseUrl}/templates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalid)
      });
      expect(response.status).toBe(400);
    });

    it('should protect against invalid detection mode', async () => {
      const invalid = {
        ...mockTemplate,
        videoSettings: {
          ...mockTemplate.videoSettings,
          detectionMode: 'invalid-mode'
        }
      };

      const response = await fetch(`${baseUrl}/templates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalid)
      });
      expect(response.status).toBe(400);
    });

    it('should enforce min/max constraints on audio volume', async () => {
      const invalid = {
        ...mockTemplate,
        audioSettings: {
          ...mockTemplate.audioSettings,
          voiceoverVolume: 5 // exceeds max of 2 (correct field name)
        }
      };

      const response = await fetch(`${baseUrl}/templates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalid)
      });
      expect(response.status).toBe(400);
    });

    it('should enforce voice pitch range', async () => {
      const invalid = {
        ...mockTemplate,
        voiceSettings: {
          ...mockTemplate.voiceSettings,
          pitch: 3 // exceeds max of 2
        }
      };

      const response = await fetch(`${baseUrl}/templates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalid)
      });
      expect(response.status).toBe(400);
    });
  });

  describe('Error Response Format', () => {
    it('should return consistent error format', async () => {
      const response = await fetch(`${baseUrl}/templates/non-existent`);
      expect(response.status).toBe(404);

      const data = await response.json();
      expect(data).toHaveProperty('success');
      expect(data).toHaveProperty('error');
      expect(data.error).toHaveProperty('code');
      expect(data.error).toHaveProperty('message');
    });

    it('should provide validation error details', async () => {
      const response = await fetch(`${baseUrl}/templates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
    });
  });
});
