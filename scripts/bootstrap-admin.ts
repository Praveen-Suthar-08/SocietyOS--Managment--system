import { MongoClient } from 'mongodb';
import { betterAuth } from 'better-auth';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import { twoFactor } from 'better-auth/plugins';

async function bootstrapAdmin() {
  const email = process.env.BOOTSTRAP_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.BOOTSTRAP_ADMIN_PASSWORD;
  const name = process.env.BOOTSTRAP_ADMIN_NAME?.trim() || 'System Administrator';
  const societyId = process.env.BOOTSTRAP_SOCIETY_ID?.trim() || 'default-society';
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/societyos';
  const dbName = process.env.MONGODB_DB_NAME || 'societyos';
  const secret = process.env.BETTER_AUTH_SECRET || 'fallback_secret_32_characters_minimum_bootstrap';

  if (!email || !password) {
    console.error('❌ Error: BOOTSTRAP_ADMIN_EMAIL and BOOTSTRAP_ADMIN_PASSWORD environment variables are required.');
    console.error('Usage: BOOTSTRAP_ADMIN_EMAIL="admin@society.local" BOOTSTRAP_ADMIN_PASSWORD="StrongPassword123!" npx tsx scripts/bootstrap-admin.ts');
    process.exit(1);
  }

  if (password.length < 12) {
    console.error('❌ Error: Password must be at least 12 characters long.');
    process.exit(1);
  }

  console.log(`Connecting to MongoDB at: ${mongoUri.replace(/\/\/.*@/, '//<redacted>@')}`);
  const client = new MongoClient(mongoUri);
  await client.connect();
  const db = client.db(dbName);

  // Check if an admin already exists for this society
  const usersCollection = db.collection('user');
  const existingAdmin = await usersCollection.findOne({
    societyId,
    role: 'ADMIN',
  });

  if (existingAdmin) {
    console.error(`❌ Security Abort: An administrator already exists for society "${societyId}". Bootstrap can only run once.`);
    await client.close();
    process.exit(1);
  }

  // Initialize Better Auth with Mongo adapter to hash password and set up auth collections
  const auth = betterAuth({
    database: mongodbAdapter(db),
    secret,
    baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 12,
    },
    user: {
      additionalFields: {
        role: { type: 'string', required: true, defaultValue: 'ADMIN' },
        societyId: { type: 'string', required: true },
        status: { type: 'string', required: true, defaultValue: 'ACTIVE' },
      },
    },
    plugins: [twoFactor({ issuer: 'SocietyOS' })],
  });

  console.log(`Creating initial administrator account for: ${email}...`);

  const user = await auth.api.signUpEmail({
    body: {
      email,
      password,
      name,
      societyId,
    },
  });

  if (!user || !user.user) {
    console.error('❌ Failed to create administrator account.');
    await client.close();
    process.exit(1);
  }

  await usersCollection.updateOne(
    { email },
    {
      $set: {
        role: 'ADMIN',
        societyId,
        status: 'ACTIVE',
        updatedAt: new Date(),
      },
    }
  );

  // Record audit log
  await db.collection('auditLogs').insertOne({
    societyId,
    actorId: user.user.id,
    actorRole: 'ADMIN',
    action: 'INITIAL_ADMIN_BOOTSTRAP',
    resourceType: 'SYSTEM',
    outcome: 'SUCCESS',
    details: {
      email,
      societyId,
    },
    timestamp: new Date(),
  });

  console.log(`\n✅ Administrator successfully initialized!`);
  console.log(`   User ID: ${user.user.id}`);
  console.log(`   Email: ${email}`);
  console.log(`   Society: ${societyId}`);
  console.log(`   Role: ADMIN`);
  console.log(`   Notice: MFA setup is mandatory upon first login via the security settings.\n`);

  await client.close();
}

bootstrapAdmin().catch((err) => {
  console.error('Unexpected bootstrap failure:', err);
  process.exit(1);
});
