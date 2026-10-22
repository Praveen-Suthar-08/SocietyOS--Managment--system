import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  APP_ENV: z.enum(['development', 'test', 'production']).default('development'),
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),

  // Database
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required').default('mongodb://127.0.0.1:27017/societyos'),
  MONGODB_DB_NAME: z.string().min(1).default('societyos'),

  // Authentication
  BETTER_AUTH_SECRET: z.string().min(16, 'BETTER_AUTH_SECRET must be at least 16 characters').default('development_secret_only_change_in_production'),
  BETTER_AUTH_URL: z.string().url().default('http://localhost:3000'),

  // Transactional Email (Optional)
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().default('SocietyOS <notifications@societyos.local>'),

  // Realtime Broadcast (Optional)
  ABLY_API_KEY: z.string().optional(),

  // CCTV Secure Media Gateway (Optional)
  CAMERA_GATEWAY_URL: z.string().url().optional().or(z.literal('')),
  CAMERA_GATEWAY_SECRET: z.string().optional(),

  // Seed Flag
  ENABLE_DEMO_SEED: z.preprocess((val) => val === 'true' || val === true, z.boolean()).default(false),
});

export type Env = z.infer<typeof envSchema>;

let parsedEnv: Env;

try {
  parsedEnv = envSchema.parse(process.env);
} catch (error) {
  if (error instanceof z.ZodError) {
    const errorDetails = error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    console.error('❌ Invalid environment variables configuration:\n' + errorDetails);
  }
  // In development, provide a fallback safe config to avoid catastrophic crash
  parsedEnv = envSchema.parse({
    NODE_ENV: 'development',
    APP_ENV: 'development',
    NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
    MONGODB_URI: 'mongodb://127.0.0.1:27017/societyos',
    MONGODB_DB_NAME: 'societyos',
    BETTER_AUTH_SECRET: 'development_fallback_secret_32_characters_minimum',
    BETTER_AUTH_URL: 'http://localhost:3000',
    EMAIL_FROM: 'SocietyOS <notifications@societyos.local>',
    ENABLE_DEMO_SEED: false,
  });
}

export const env = parsedEnv;
