/**
 * Linear webhook types based on the official Linear API documentation
 * https://linear.app/developers/webhooks#data-change-events-payload
 */

export type LinearAction = 'create' | 'update' | 'remove';

export type LinearEntityType = 
  | 'Issue'
  | 'Comment' 
  | 'IssueLabel'
  | 'Project'
  | 'ProjectUpdate'
  | 'Document'
  | 'Initiative'
  | 'InitiativeUpdate'
  | 'Cycle'
  | 'Customer'
  | 'CustomerRequest'
  | 'User'
  | 'Reaction';

export type LinearActorType = 'user' | 'integration' | 'oauth_client';

export interface LinearActor {
  id: string;
  type: LinearActorType;
  name: string;
  email?: string;
  url?: string;
}

export interface LinearIssue {
  id: string;
  title: string;
  description?: string;
  priority?: number;
  estimate?: number;
  createdAt: string;
  updatedAt: string;
  archivedAt?: string;
  dueDate?: string;
  number: number;
  url: string;
  identifier: string;
  state?: {
    id: string;
    name: string;
    type: string;
    color: string;
  };
  team: {
    id: string;
    name: string;
    key: string;
  };
  assignee?: {
    id: string;
    name: string;
    email: string;
  };
  creator?: {
    id: string;
    name: string;
    email: string;
  };
  parent?: {
    id: string;
    title: string;
    identifier: string;
  };
  labels?: Array<{
    id: string;
    name: string;
    color: string;
  }>;
  project?: {
    id: string;
    name: string;
  };
  cycle?: {
    id: string;
    name: string;
    number: number;
  };
}

export interface LinearComment {
  id: string;
  body: string;
  createdAt: string;
  updatedAt: string;
  edited: boolean;
  issueId: string;
  userId: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export interface LinearProject {
  id: string;
  name: string;
  description?: string;
  state: string;
  priority: number;
  createdAt: string;
  updatedAt: string;
  startedAt?: string;
  completedAt?: string;
  canceledAt?: string;
  targetDate?: string;
  lead?: {
    id: string;
    name: string;
    email: string;
  };
  teams: Array<{
    id: string;
    name: string;
    key: string;
  }>;
}

export interface LinearWebhookPayload {
  action: LinearAction;
  type: LinearEntityType;
  actor: LinearActor;
  createdAt: string;
  data: LinearIssue | LinearComment | LinearProject | Record<string, unknown>;
  url: string;
  updatedFrom?: Record<string, unknown>;
  webhookTimestamp: number;
  webhookId: string;
  organizationId: string;
}

export interface LinearHeaders {
  'linear-delivery': string;
  'linear-event': LinearEntityType;
  'linear-signature': string;
  'user-agent': 'Linear-Webhook';
  'accept-charset': 'utf-8';
  'content-type': 'application/json; charset=utf-8';
}
