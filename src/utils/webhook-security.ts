import crypto from 'node:crypto';

/**
 * Verifies the Linear webhook signature using HMAC-SHA256
 * Based on Linear's webhook security documentation
 */
export function verifyLinearSignature(
  headerSignature: string | undefined,
  rawBody: Buffer | string,
  secret: string
): boolean {
  if (typeof headerSignature !== 'string') {
    return false;
  }

  try {
    const headerSignatureBuffer = Buffer.from(headerSignature, 'hex');
    const computedSignature = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest();

    return crypto.timingSafeEqual(computedSignature, headerSignatureBuffer);
  } catch (error) {
    console.error('Error verifying webhook signature:', error);
    return false;
  }
}

/**
 * Verifies the webhook timestamp to prevent replay attacks
 * Rejects webhooks older than 60 seconds
 */
export function verifyWebhookTimestamp(webhookTimestamp: number): boolean {
  const currentTime = Date.now();
  const timeDifference = Math.abs(currentTime - webhookTimestamp);
  const maxAge = 60 * 1000; // 60 seconds in milliseconds

  return timeDifference <= maxAge;
}

/**
 * List of Linear webhook IP addresses for additional security
 * Based on Linear's documentation
 */
export const LINEAR_WEBHOOK_IPS = [
  '35.231.147.226',
  '35.243.134.228',
  '34.140.253.14',
  '34.38.87.206',
  '34.134.222.122',
  '35.222.25.142'
] as const;

/**
 * Verifies if the request comes from a valid Linear IP address
 */
export function verifyLinearIP(clientIP: string): boolean {
  return LINEAR_WEBHOOK_IPS.includes(clientIP as typeof LINEAR_WEBHOOK_IPS[number]);
}
