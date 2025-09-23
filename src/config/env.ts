import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

interface Config {
  telegram: {
    botToken: string;
    chatId: string;
  };
  linear: {
    webhookSecret: string;
  };
  server: {
    port: number;
    nodeEnv: string;
  };
}

function getRequiredEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function getOptionalEnvVar(name: string, defaultValue: string): string {
  return process.env[name] || defaultValue;
}

export const config: Config = {
  telegram: {
    botToken: getRequiredEnvVar('TELEGRAM_BOT_TOKEN'),
    chatId: getRequiredEnvVar('TELEGRAM_CHAT_ID'),
  },
  linear: {
    webhookSecret: getRequiredEnvVar('LINEAR_WEBHOOK_SECRET'),
  },
  server: {
    port: parseInt(getOptionalEnvVar('PORT', '3000'), 10),
    nodeEnv: getOptionalEnvVar('NODE_ENV', 'development'),
  },
};

// Validate configuration
if (isNaN(config.server.port)) {
  throw new Error('PORT must be a valid number');
}

console.log('✅ Configuration loaded successfully');
console.log(`🚀 Server will run on port ${config.server.port}`);
console.log(`🌍 Environment: ${config.server.nodeEnv}`);
