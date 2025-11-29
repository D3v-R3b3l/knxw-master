import { createHmac } from 'node:crypto';

export function signWebhookPayload(payload, secret) {
  const hmac = createHmac('sha256', secret);
  hmac.update(JSON.stringify(payload));
  return 'sha256=' + hmac.digest('hex');
}

export function verifyWebhookSignature(payload, signature, secret) {
  const expectedSignature = signWebhookPayload(payload, secret);
  
  // Constant-time comparison
  if (signature.length !== expectedSignature.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < signature.length; i++) {
    result |= signature.charCodeAt(i) ^ expectedSignature.charCodeAt(i);
  }
  
  return result === 0;
}