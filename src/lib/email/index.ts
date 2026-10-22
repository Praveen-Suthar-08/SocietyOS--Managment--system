import { env } from '@/lib/env';

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export interface EmailService {
  sendEmail(payload: EmailPayload): Promise<{ success: boolean; messageId?: string; error?: string }>;
}

// In-memory sink for development & integration tests
export const devEmailSink: Array<EmailPayload & { sentAt: Date; id: string }> = [];

class ResendEmailService implements EmailService {
  private apiKey: string;
  private from: string;

  constructor(apiKey: string, from: string) {
    this.apiKey = apiKey;
    this.from = from;
  }

  async sendEmail(payload: EmailPayload) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          from: this.from,
          to: payload.to,
          subject: payload.subject,
          html: payload.html,
          text: payload.text,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return { success: false, error: JSON.stringify(errorData) };
      }

      const data = await response.json();
      return { success: true, messageId: data.id };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown email dispatch error';
      return { success: false, error: msg };
    }
  }
}

class DevEmailSinkService implements EmailService {
  async sendEmail(payload: EmailPayload) {
    const id = `mock_email_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const record = { ...payload, sentAt: new Date(), id };
    devEmailSink.push(record);

    if (env.NODE_ENV === 'development') {
      console.log(`\n📬 [DEV EMAIL SINK] Email dispatched to: ${payload.to}`);
      console.log(`   Subject: ${payload.subject}`);
      console.log(`   Preview Text: ${payload.text.substring(0, 120)}...\n`);
    }

    return { success: true, messageId: id };
  }
}

export const emailService: EmailService =
  env.RESEND_API_KEY && env.RESEND_API_KEY.trim() !== ''
    ? new ResendEmailService(env.RESEND_API_KEY, env.EMAIL_FROM)
    : new DevEmailSinkService();
