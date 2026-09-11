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
      // Use the actual TextBee API to send the SMS
      const response = await fetch('https://api.textbee.dev/api/v1/gateway/devices/' + this.deviceId + '/sendSMS', {
        method: 'POST',
        headers: {
          'x-api-key': this.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          deviceId: this.deviceId,
          recipients: [to],
          message: message
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[TextBeeProvider] API Error: ${response.status} - ${errorText}`);
        return false;
      }

      console.log(`[TextBeeProvider] Successfully sent SMS to ${to}`);
      return true;
    } catch (error) {
      console.error('[TextBeeProvider] Failed to send SMS:', error);
      return false;
    }
  }
}

export const textBeeService = new TextBeeProvider();
