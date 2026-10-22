import 'server-only';
import { betterAuth } from 'better-auth';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import { twoFactor } from 'better-auth/plugins';
import { mongoDb } from '@/lib/db/mongodb';
import { env } from '@/lib/env';

export const auth = betterAuth({
  database: mongodbAdapter(mongoDb),
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 12,
    autoSignIn: false, // Ensure verification / explicit session after signup
    sendResetPassword: async ({ user, url }: { user: { email: string }; url: string }) => {
      const { emailService } = await import('@/lib/email');
      await emailService.sendEmail({
        to: user.email,
        subject: 'Reset your SocietyOS password',
        text: `You requested a password reset. Reset your password at: ${url}`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; border: 1px solid #D9DED8; border-radius: 8px;">
            <h2 style="color: #276749;">Password Reset Request</h2>
            <p>Click the button below to reset your SocietyOS credentials. If you did not make this request, please contact your administrator immediately.</p>
            <p><a href="${url}" style="background-color: #276749; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; display: inline-block;">Reset Password</a></p>
          </div>
        `,
      });
    },
    sendVerificationEmail: async ({ user, url }: { user: { email: string }; url: string }) => {
      const { emailService } = await import('@/lib/email');
      await emailService.sendEmail({
        to: user.email,
        subject: 'Verify your SocietyOS email',
        text: `Verify your email for SocietyOS at: ${url}`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; border: 1px solid #D9DED8; border-radius: 8px;">
            <h2 style="color: #276749;">Verify Email Address</h2>
            <p>Please confirm your email address by clicking the link below:</p>
            <p><a href="${url}" style="background-color: #276749; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; display: inline-block;">Verify Email</a></p>
          </div>
        `,
      });
    },
  },

  user: {
    additionalFields: {
      role: {
        type: 'string',
        required: true,
        defaultValue: 'RESIDENT',
        input: false, // Disallow client input from modifying or setting role during standard registration
      },
      societyId: {
        type: 'string',
        required: true,
        input: false, // Tenant boundary cannot be set arbitrarily by client
      },
      status: {
        type: 'string',
        required: true,
        defaultValue: 'ACTIVE',
        input: false,
      },
      unitIds: {
        type: 'string[]',
        required: false,
        input: false,
      },
      phone: {
        type: 'string',
        required: false,
      },
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },

  plugins: [
    twoFactor({
      issuer: 'SocietyOS',
    }),
  ],

  advanced: {
    useSecureCookies: env.NODE_ENV === 'production',
  },
});

export type Auth = typeof auth;
export type Session = typeof auth.$Infer.Session;
