import { env } from '../../config/env';

export class TextBeeProvider {
  private apiKey: string;
  private deviceId: string;

  constructor() {
    this.apiKey = env.TEXTBEE_API_KEY;
    this.deviceId = env.TEXTBEE_DEVICE_ID;
  }

  async sendSMS(to: string, message: string): Promise<boolean> {
    try {
      // In development or if mocking is needed, just log securely
      if (env.NODE_ENV === 'development') {
        console.log(`[TextBee Mock] Would send to ${to}. Message length: ${message.length}`);
        return true; // Mock success
      }

      // Actual implementation would make an HTTP request to TextBee
      // const response = await fetch('https://api.textbee.net/api/v1/gateway/devices/...', { ... })
      
      return true;
    } catch (error) {
      console.error('[TextBeeProvider] Failed to send SMS:', error);
      return false;
    }
  }
}

export const textBeeService = new TextBeeProvider();
