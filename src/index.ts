import express from 'express';
import { Telegraf } from 'telegraf';
import { config } from './config/env.js';
import { LinearWebhookPayload } from './types/linear.js';
import { verifyLinearSignature, verifyWebhookTimestamp } from './utils/webhook-security.js';
import { formatLinearWebhookMessage } from './utils/message-formatter.js';

// Initialize Telegraf bot
const bot = new Telegraf(config.telegram.botToken);

// Initialize Express server
const app = express();

// Middleware to capture raw body for signature verification
app.use('/webhook/linear', express.raw({ type: 'application/json' }));

// Parse JSON for other routes
app.use(express.json());

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'linear-tracker-bot'
  });
});

// Linear webhook endpoint
app.post('/webhook/linear', async (req, res) => {
  try {
    const signature = req.get('linear-signature');
    const rawBody = req.body as Buffer;

    // Verify webhook signature
    if (!verifyLinearSignature(signature, rawBody, config.linear.webhookSecret)) {
      console.warn('❌ Invalid webhook signature');
      return res.status(401).json({ error: 'Invalid signature' });
    }

    // Parse the payload
    const payload: LinearWebhookPayload = JSON.parse(rawBody.toString());

    // Verify timestamp to prevent replay attacks
    if (!verifyWebhookTimestamp(payload.webhookTimestamp)) {
      console.warn('❌ Webhook timestamp too old');
      return res.status(401).json({ error: 'Timestamp too old' });
    }

    console.log(`📨 Received ${payload.type} ${payload.action} webhook from ${payload.actor.name}`);

    // Format the message for Telegram
    const message = formatLinearWebhookMessage(payload);

    // Send message to Telegram
    await bot.telegram.sendMessage(config.telegram.chatId, message, {
      parse_mode: 'MarkdownV2',
      link_preview_options: { is_disabled: true },
    });

    console.log(`✅ Message sent to Telegram for ${payload.type} ${payload.action}`);
    
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('❌ Error processing webhook:', error);
    
    // Return 500 so Linear retries the webhook
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Error handling middleware
app.use((error: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('❌ Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Basic bot commands
bot.start((ctx) => {
  const chatId = ctx.chat.id;
  console.log(`🤖 Bot started in chat: ${chatId}`);
  
  ctx.reply(
    `🚀 Linear Tracker Bot is now active!\n\n` +
    `Chat ID: \`${chatId}\`\n\n` +
    `This bot will send notifications when Linear issues, comments, and projects are created, updated, or removed.\n\n` +
    `Make sure to configure your Linear webhook to point to: \`/webhook/linear\``,
    { parse_mode: 'Markdown' }
  );
});

bot.help((ctx) => {
  ctx.reply(
    `🤖 *Linear Tracker Bot Help*\n\n` +
    `This bot receives webhooks from Linear and sends formatted notifications to this chat.\n\n` +
    `*Supported Linear events:*\n` +
    `• ✅ Issues (create, update, remove)\n` +
    `• 💬 Comments (create, update, remove)\n` +
    `• 📁 Projects (create, update, remove)\n` +
    `• 🏷️ Labels and other entities\n\n` +
    `*Commands:*\n` +
    `/start - Initialize the bot\n` +
    `/help - Show this help message\n` +
    `/status - Check bot status`,
    { parse_mode: 'Markdown' }
  );
});

bot.command('status', (ctx) => {
  const chatId = ctx.chat.id;
  const isCorrectChat = chatId.toString() === config.telegram.chatId;
  
  ctx.reply(
    `🤖 *Bot Status*\n\n` +
    `✅ Bot is running\n` +
    `📱 Current Chat ID: \`${chatId}\`\n` +
    `🎯 Configured Chat ID: \`${config.telegram.chatId}\`\n` +
    `${isCorrectChat ? '✅' : '❌'} Chat configuration: ${isCorrectChat ? 'Correct' : 'Incorrect'}\n\n` +
    `Environment: ${config.server.nodeEnv}\n` +
    `Server Port: ${config.server.port}`,
    { parse_mode: 'Markdown' }
  );
});

// Start the bot
function startBot(): void {
  console.log('🤖 Starting Telegram bot...');
  bot.launch()
    .then(() => {
      console.log('✅ Telegram bot started successfully');
    })
    .catch((error) => {
      console.error('❌ Failed to start Telegram bot:', error);
      process.exit(1);
    });
}

// Start the server
function startServer(): void {
  const server = app.listen(config.server.port, () => {
    console.log(`🚀 Express server listening on port ${config.server.port}`);
    console.log(`📡 Webhook endpoint: http://localhost:${config.server.port}/webhook/linear`);
    console.log(`🩺 Health check: http://localhost:${config.server.port}/health`);
  });

  // Graceful shutdown
  const gracefulShutdown = (signal: string): void => {
    console.log(`\n${signal} received, shutting down gracefully...`);
    
    server.close((error) => {
      if (error) {
        console.error('❌ Error during server shutdown:', error);
        process.exit(1);
      }
      
      console.log('✅ Express server closed');
      bot.stop(signal);
      console.log('✅ Telegram bot stopped');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}

// Main function
function main(): void {
  try {
    startBot();
    startServer();
  } catch (error) {
    console.error('❌ Failed to start application:', error);
    process.exit(1);
  }
}

// Start the application
main();
