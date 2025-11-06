import { v4 as uuid } from 'uuid';
import { logger } from '../utils/logger.js';

const ROLES = {
  owner: { permissions: ['read', 'write', 'delete', 'invite', 'manage'] },
  editor: { permissions: ['read', 'write'] },
  viewer: { permissions: ['read'] }
};

export class CollaborationService {
  constructor({ logger: log }) {
    this.logger = log;
    this.projects = new Map();
    this.members = new Map();
  }

  async createProject(userId, projectData) {
    const project = {
      id: uuid(),
      ...projectData,
      ownerId: userId,
      members: [{ userId, role: 'owner', joinedAt: new Date().toISOString() }],
      createdAt: new Date().toISOString()
    };

    this.projects.set(project.id, project);
    this.logger.info('Project created', { projectId: project.id, owner: userId });

    return project;
  }

  async inviteMember(projectId, invitedBy, email, role = 'editor') {
    const project = this.projects.get(projectId);
    if (!project) throw new Error('Project not found');

    if (!this.hasPermission(projectId, invitedBy, 'invite')) {
      throw new Error('No permission to invite');
    }

    const member = {
      userId: `user-${Date.now()}`,
      email,
      role,
      invitedBy,
      joinedAt: new Date().toISOString()
    };

    project.members.push(member);
    this.logger.info('Member invited', { projectId, email, role });

    return member;
  }

  hasPermission(projectId, userId, permission) {
    const project = this.projects.get(projectId);
    if (!project) return false;

    const member = project.members.find(m => m.userId === userId);
    if (!member) return false;

    return ROLES[member.role]?.permissions.includes(permission) || false;
  }

  getProjectMembers(projectId) {
    const project = this.projects.get(projectId);
    return project?.members || [];
  }

  getUserProjects(userId) {
    return Array.from(this.projects.values())
      .filter(p => p.members.some(m => m.userId === userId));
  }
}
