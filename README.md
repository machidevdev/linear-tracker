# Linear Tracker Bot 🤖

A TypeScript Telegram bot that receives webhooks from Linear and sends formatted notifications to a Telegram group chat.

## Features ✨

- 🔐 **Secure webhook verification** with HMAC-SHA256 signature validation
- 📱 **Rich message formatting** with Telegram MarkdownV2
- 🎯 **Support for multiple Linear entities**: Issues, Comments, Projects, and more
- ⚡ **Real-time notifications** for create, update, and remove actions
- 🛡️ **Replay attack protection** with timestamp verification
- 🚀 **TypeScript with strict type checking** (no `any` types)
- 🩺 **Health check endpoint** for monitoring

## Supported Linear Events 📋

- ✅ **Issues** (create, update, remove)
- 💬 **Comments** (create, update, remove)
- 📁 **Projects** (create, update, remove)
- 🏷️ **Labels** and other entities (generic formatting)

## Quick Start 🚀

### 1. Prerequisites

- Node.js 18+
- A Telegram bot token from [@BotFather](https://t.me/BotFather)
- A Linear workspace with admin access

### 2. Installation

```bash
# Clone or create the project
cd linear-tracker

# Install dependencies
npm install
```

### 3. Configuration

1. Copy the environment template:

```bash
cp env.example .env
```

2. Edit `.env` with your credentials:

```env
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
TELEGRAM_CHAT_ID=your_telegram_chat_id_here
LINEAR_WEBHOOK_SECRET=your_linear_webhook_secret_here
PORT=3000
NODE_ENV=development
```

#### Getting Your Telegram Chat ID

1. Start your bot and send it a message
2. Visit: `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
3. Look for the `chat.id` in the response

### 4. Running the Bot

```bash
# Development (with auto-reload)
npm run dev

# Production build
npm run build
npm start

# Type checking only
npm run type-check
```

### 5. Configure Linear Webhook

1. Go to your Linear workspace settings
2. Navigate to **API** → **Webhooks**
3. Create a new webhook with:
   - **URL**: `https://your-domain.com/webhook/linear`
   - **Resource Types**: Select the events you want (Issue, Comment, Project, etc.)
   - **Secret**: Copy this to your `LINEAR_WEBHOOK_SECRET` environment variable

## API Endpoints 🌐

- `POST /webhook/linear` - Linear webhook receiver
- `GET /health` - Health check endpoint
- `GET /*` - 404 handler

## Bot Commands 🤖

- `/start` - Initialize the bot and get setup information
- `/help` - Show available commands and supported events
- `/status` - Check bot status and configuration

## Security Features 🔐

- **Signature Verification**: All webhooks are verified using HMAC-SHA256
- **Timestamp Validation**: Rejects webhooks older than 60 seconds
- **IP Allowlisting**: Optional verification of Linear's webhook IP addresses
- **Graceful Error Handling**: Returns appropriate HTTP status codes for Linear's retry logic

## Message Format 📝

The bot sends rich, formatted messages with:

- 🎯 **Issue updates**: Title, status, assignee, priority, labels
- 💬 **Comment updates**: Truncated comment body with link
- 📁 **Project updates**: Project status, lead, teams
- 🔗 **Direct links** to Linear entities
- 👤 **Actor information** (who performed the action)

## Development 🛠️

### Project Structure

```
src/
├── config/          # Environment configuration
├── types/           # TypeScript type definitions
├── utils/           # Utility functions
│   ├── webhook-security.ts    # Signature verification
│   └── message-formatter.ts   # Message formatting
└── index.ts         # Main application
```

### Type Safety

This project uses strict TypeScript with:

- `noImplicitAny: true`
- `strictNullChecks: true`
- `exactOptionalPropertyTypes: true`
- No `any` types used anywhere

## Deployment 🚀

### Environment Variables

Ensure these are set in production:

```env
TELEGRAM_BOT_TOKEN=your_production_bot_token
TELEGRAM_CHAT_ID=your_production_chat_id
LINEAR_WEBHOOK_SECRET=your_production_webhook_secret
PORT=3000
NODE_ENV=production
```

### Process Management

The bot includes graceful shutdown handling for `SIGTERM` and `SIGINT` signals.

## Troubleshooting 🔧

### Common Issues

1. **"Invalid signature" errors**

   - Verify your `LINEAR_WEBHOOK_SECRET` matches Linear's webhook settings
   - Ensure you're using the raw request body for verification

2. **"Timestamp too old" errors**

   - Check your server's system time
   - Ensure webhooks are processed within 60 seconds

3. **Messages not formatting correctly**
   - Telegram MarkdownV2 is strict about escaping special characters
   - Check console logs for formatting errors

### Debugging

Enable debug logging by setting:

```env
NODE_ENV=development
```

## Contributing 🤝

1. Follow the existing TypeScript patterns
2. Maintain strict type safety (no `any` types)
3. Add appropriate error handling
4. Update documentation for new features

## License 📄

MIT License - see the code for details.
