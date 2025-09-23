import { 
  LinearWebhookPayload, 
  LinearIssue, 
  LinearComment, 
  LinearProject,
  LinearEntityType
} from '../types/linear.js';

/**
 * Escapes special characters for Telegram MarkdownV2
 */
function escapeMarkdown(text: string): string {
  return text.replace(/[_*\[\]()~`>#+=|{}.!-]/g, '\\$&');
}



/**
 * Formats an issue webhook payload into a Telegram message
 */
function formatIssueMessage(payload: LinearWebhookPayload): string {
  const issue = payload.data as LinearIssue;
  const statusLower = issue.state.name.toLowerCase();
  
  // Simple format: [status]: Title - Actor
  let message = `\\[${escapeMarkdown(statusLower)}\\]: [${escapeMarkdown(issue.title)}](${issue.url})\n`;
  message += `\\- ${escapeMarkdown(payload.actor.name)}\n`;
  
  return message;
}

/**
 * Formats a comment webhook payload into a Telegram message
 */
function formatCommentMessage(payload: LinearWebhookPayload): string {
  const comment = payload.data as LinearComment;
  
  let message = `💬 New comment by ${escapeMarkdown(payload.actor.name)}\n`;
  
  if (payload.action === 'create' || payload.action === 'update') {
    const truncatedBody = comment.body.length > 200 
      ? comment.body.substring(0, 200) + '\\.\\.\\.' 
      : comment.body;
    message += `"${escapeMarkdown(truncatedBody)}"\n`;
  }
  
  return message;
}

/**
 * Formats a project webhook payload into a Telegram message
 */
function formatProjectMessage(payload: LinearWebhookPayload): string {
  const project = payload.data as LinearProject;
  const action = payload.action === 'create' ? 'New project' : `Project ${payload.action}d`;
  
  let message = `📁 ${action}: ${escapeMarkdown(project.name)}\n`;
  message += `\\- ${escapeMarkdown(payload.actor.name)}\n`;
  
  return message;
}

/**
 * Formats a generic entity message for unsupported types
 */
function formatGenericMessage(payload: LinearWebhookPayload): string {
  const entityIcon = getEntityIcon(payload.type);
  
  let message = `${entityIcon} ${escapeMarkdown(payload.actor.name)} ${payload.action}d a ${payload.type.toLowerCase()}\n`;
  
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
