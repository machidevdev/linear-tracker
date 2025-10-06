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
 * Converts Linear priority number to readable label
 * Priority values: 0 = No priority, 1 = Urgent, 2 = High, 3 = Medium, 4 = Low
 */
function getPriorityLabel(priority: number): string {
  switch (priority) {
    case 1:
      return 'Urgent';
    case 2:
      return 'High';
    case 3:
      return 'Medium';
    case 4:
      return 'Low';
    default:
      return 'No priority';
  }
}

/**
 * Formats date string to readable format
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const month = date.toLocaleString('en-US', { month: 'short' });
  const day = date.getDate();
  const year = date.getFullYear();
  return `${month} ${day}, ${year}`;
}



/**
 * Formats an issue webhook payload into a Telegram message
 */
function formatIssueMessage(payload: LinearWebhookPayload): string {
  const issue = payload.data as LinearIssue;

  // Action header
  let actionText = '';
  if (payload.action === 'create') {
    actionText = '🎯 New issue';
  } else if (payload.action === 'update') {
    actionText = '🔄 Issue updated';
  } else if (payload.action === 'remove') {
    actionText = '🗑️ Issue removed';
  }

  let message = `${actionText}\n`;

  // Title and creator
  message += `[${escapeMarkdown(issue.title)}](${issue.url}) \\- ${escapeMarkdown(issue.creator.name)}\n`;

  // Build metadata line (priority, due date, status)
  const metadata: string[] = [];

  // Add priority
  const priorityLabel = getPriorityLabel(issue.priority);
  if (issue.priority > 0) {
    metadata.push(`Priority: ${escapeMarkdown(priorityLabel)}`);
  }

  // Add due date
  if (issue.dueDate) {
    const formattedDate = formatDate(issue.dueDate);
    metadata.push(`Due: ${escapeMarkdown(formattedDate)}`);
  }

  // Add status (with transition if updated)
  const currentStatus = issue.state.name;
  if (payload.action === 'update' && payload.updatedFrom && 'state' in payload.updatedFrom) {
    const previousState = (payload.updatedFrom as any).state;
    if (previousState && previousState.name) {
      const previousStatus = previousState.name;
      metadata.push(`${escapeMarkdown(previousStatus)} → ${escapeMarkdown(currentStatus)}`);
    }
  } else {
    metadata.push(escapeMarkdown(currentStatus));
  }

  if (metadata.length > 0) {
    message += metadata.join(' • ') + '\n';
  }

  // Add assignee
  if (issue.assignee) {
    message += `👤 ${escapeMarkdown(issue.assignee.name)}\n`;
  }

  // Add description for new issues
  if (payload.action === 'create' && issue.description) {
    const truncatedDescription = issue.description.length > 300
      ? issue.description.substring(0, 300) + '...'
      : issue.description;
    message += `\n${escapeMarkdown(truncatedDescription)}\n`;
  }

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
