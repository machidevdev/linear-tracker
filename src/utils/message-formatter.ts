import { 
  LinearWebhookPayload, 
  LinearIssue, 
  LinearComment, 
  LinearProject,
  LinearAction,
  LinearEntityType
} from '../types/linear.js';

/**
 * Escapes special characters for Telegram MarkdownV2
 */
function escapeMarkdown(text: string): string {
  return text.replace(/[_*\[\]()~`>#+=|{}.!-]/g, '\\$&');
}

/**
 * Formats action text with appropriate emoji
 */
function formatAction(action: LinearAction): string {
  switch (action) {
    case 'create':
      return '✅ Created';
    case 'update':
      return '📝 Updated';
    case 'remove':
      return '🗑️ Removed';
    default:
      return action;
  }
}

/**
 * Formats priority with emoji
 */
function formatPriority(priority: number): string {
  switch (priority) {
    case 1:
      return '🔴 Urgent';
    case 2:
      return '🟠 High';
    case 3:
      return '🟡 Medium';
    case 4:
      return '🔵 Low';
    default:
      return `Priority ${priority}`;
  }
}

/**
 * Formats an issue webhook payload into a Telegram message
 */
function formatIssueMessage(payload: LinearWebhookPayload): string {
  const issue = payload.data as LinearIssue;
  const action = formatAction(payload.action);
  
  let message = `${action} Issue\n\n`;
  message += `🎯 *${escapeMarkdown(issue.identifier)}*: [${escapeMarkdown(issue.title)}](${issue.url})\n`;
  message += `👤 ${escapeMarkdown(payload.actor.name)}\n`;
  message += `📋 Team: ${escapeMarkdown(issue.team.name)}\n`;
  message += `🏷️ Status: ${escapeMarkdown(issue.state.name)}\n`;
  
  if (issue.priority) {
    message += `⚡ ${formatPriority(issue.priority)}\n`;
  }
  
  if (issue.assignee) {
    message += `👨‍💻 Assignee: ${escapeMarkdown(issue.assignee.name)}\n`;
  }
  
  if (issue.labels && issue.labels.length > 0) {
    message += `🏷️ Labels: ${issue.labels.map(label => escapeMarkdown(label.name)).join(', ')}\n`;
  }
  
  if (issue.project) {
    message += `📁 Project: ${escapeMarkdown(issue.project.name)}\n`;
  }
  
  if (issue.cycle) {
    message += `🔄 Cycle: ${escapeMarkdown(issue.cycle.name)}\n`;
  }
  
  if (issue.description && payload.action === 'create') {
    const truncatedDesc = issue.description.length > 200 
      ? issue.description.substring(0, 200) + '...' 
      : issue.description;
    message += `\n📝 ${escapeMarkdown(truncatedDesc)}\n`;
  }
  
  return message;
}

/**
 * Formats a comment webhook payload into a Telegram message
 */
function formatCommentMessage(payload: LinearWebhookPayload): string {
  const comment = payload.data as LinearComment;
  const action = formatAction(payload.action);
  
  let message = `${action} Comment\n\n`;
  message += `💬 ${escapeMarkdown(payload.actor.name)} ${payload.action}d a comment\n`;
  message += `🔗 [View Comment](${payload.url})\n`;
  
  if (payload.action === 'create' || payload.action === 'update') {
    const truncatedBody = comment.body.length > 300 
      ? comment.body.substring(0, 300) + '...' 
      : comment.body;
    message += `\n"${escapeMarkdown(truncatedBody)}"\n`;
  }
  
  return message;
}

/**
 * Formats a project webhook payload into a Telegram message
 */
function formatProjectMessage(payload: LinearWebhookPayload): string {
  const project = payload.data as LinearProject;
  const action = formatAction(payload.action);
  
  let message = `${action} Project\n\n`;
  message += `📁 *${escapeMarkdown(project.name)}*\n`;
  message += `👤 ${escapeMarkdown(payload.actor.name)}\n`;
  message += `📊 Status: ${escapeMarkdown(project.state)}\n`;
  
  if (project.lead) {
    message += `👨‍💼 Lead: ${escapeMarkdown(project.lead.name)}\n`;
  }
  
  if (project.teams && project.teams.length > 0) {
    message += `🏢 Teams: ${project.teams.map(team => escapeMarkdown(team.name)).join(', ')}\n`;
  }
  
  if (project.description && payload.action === 'create') {
    const truncatedDesc = project.description.length > 200 
      ? project.description.substring(0, 200) + '...' 
      : project.description;
    message += `\n📝 ${escapeMarkdown(truncatedDesc)}\n`;
  }
  
  return message;
}

/**
 * Formats a generic entity message for unsupported types
 */
function formatGenericMessage(payload: LinearWebhookPayload): string {
  const action = formatAction(payload.action);
  const entityIcon = getEntityIcon(payload.type);
  
  let message = `${action} ${payload.type}\n\n`;
  message += `${entityIcon} ${escapeMarkdown(payload.actor.name)} ${payload.action}d a ${payload.type.toLowerCase()}\n`;
  message += `🔗 [View ${payload.type}](${payload.url})\n`;
  
  return message;
}

/**
 * Gets appropriate emoji for entity type
 */
function getEntityIcon(type: LinearEntityType): string {
  switch (type) {
    case 'Issue':
      return '🎯';
    case 'Comment':
      return '💬';
    case 'Project':
      return '📁';
    case 'IssueLabel':
      return '🏷️';
    case 'Cycle':
      return '🔄';
    case 'User':
      return '👤';
    case 'Reaction':
      return '❤️';
    default:
      return '📋';
  }
}

/**
 * Main function to format webhook payload into Telegram message
 */
export function formatLinearWebhookMessage(payload: LinearWebhookPayload): string {
  try {
    switch (payload.type) {
      case 'Issue':
        return formatIssueMessage(payload);
      case 'Comment':
        return formatCommentMessage(payload);
      case 'Project':
        return formatProjectMessage(payload);
      default:
        return formatGenericMessage(payload);
    }
  } catch (error) {
    console.error('Error formatting message:', error);
    return `❌ Error processing ${payload.type} ${payload.action} from ${escapeMarkdown(payload.actor.name)}`;
  }
}
