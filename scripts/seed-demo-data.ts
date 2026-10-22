import { MongoClient } from 'mongodb';
import { betterAuth } from 'better-auth';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';

async function seedDemoData() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/societyos';
  const dbName = process.env.MONGODB_DB_NAME || 'societyos';
  const societyId = 'society-greenfield';

  console.log('Seeding demo accounts and society operations data...');
  const client = new MongoClient(mongoUri);
  await client.connect();
  const db = client.db(dbName);

  const auth = betterAuth({
    database: mongodbAdapter(db),
    secret: process.env.BETTER_AUTH_SECRET || 'local_development_secret_key_societyos_32_chars',
    baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
    emailAndPassword: { enabled: true, minPasswordLength: 8 },
    user: {
      additionalFields: {
        role: { type: 'string', required: true },
        societyId: { type: 'string', required: true },
        status: { type: 'string', required: true },
      },
    },
  });

  const usersCol = db.collection('user');

  // 1. Seed Security Guard Account
  const existingSecurity = await usersCol.findOne({ email: 'security@societyos.local' });
  if (!existingSecurity) {
    const secUser = await auth.api.signUpEmail({
      body: {
        email: 'security@societyos.local',
        password: 'SecurityGuard2026!',
        name: 'Officer Vikram Singh',
        role: 'SECURITY',
        societyId,
        status: 'ACTIVE',
      },
    });
    if (secUser?.user) {
      await usersCol.updateOne(
        { email: 'security@societyos.local' },
        { $set: { role: 'SECURITY', societyId, status: 'ACTIVE' } }
      );
      console.log('✅ Created Security Guard: security@societyos.local');
    }
  }

  // 2. Seed Resident Account
  const existingResident = await usersCol.findOne({ email: 'resident@societyos.local' });
  let residentUserId = existingResident?._id?.toString();
  if (!existingResident) {
    const resUser = await auth.api.signUpEmail({
      body: {
        email: 'resident@societyos.local',
        password: 'ResidentUser2026!',
        name: 'Aarav Sharma',
        role: 'RESIDENT',
        societyId,
        status: 'ACTIVE',
      },
    });
    if (resUser?.user) {
      residentUserId = resUser.user.id;
      await usersCol.updateOne(
        { email: 'resident@societyos.local' },
        { $set: { role: 'RESIDENT', societyId, status: 'ACTIVE', unitIds: ['A-402'] } }
      );
      console.log('✅ Created Resident: resident@societyos.local');
    }
  }

  // 3. Seed Units
  const unitsCol = db.collection('units');
  const unitCount = await unitsCol.countDocuments({ societyId });
  if (unitCount === 0) {
    await unitsCol.insertMany([
      { societyId, unitCode: 'A-101', block: 'Block A', floor: 1, type: '2BHK', areaSqFt: 1150, status: 'OCCUPIED', currentOccupant: { name: 'Dr. Suresh Mehta', type: 'OWNER' }, createdAt: new Date(), updatedAt: new Date() },
      { societyId, unitCode: 'A-102', block: 'Block A', floor: 1, type: '2BHK', areaSqFt: 1150, status: 'VACANT', createdAt: new Date(), updatedAt: new Date() },
      { societyId, unitCode: 'A-201', block: 'Block A', floor: 2, type: '3BHK', areaSqFt: 1650, status: 'OCCUPIED', currentOccupant: { name: 'Priya Nambiar', type: 'TENANT' }, createdAt: new Date(), updatedAt: new Date() },
      { societyId, unitCode: 'A-402', block: 'Block A', floor: 4, type: '3BHK', areaSqFt: 1720, status: 'OCCUPIED', currentOccupant: { name: 'Aarav Sharma', type: 'OWNER' }, createdAt: new Date(), updatedAt: new Date() },
      { societyId, unitCode: 'B-101', block: 'Block B', floor: 1, type: '2BHK', areaSqFt: 1150, status: 'MAINTENANCE', createdAt: new Date(), updatedAt: new Date() },
      { societyId, unitCode: 'B-202', block: 'Block B', floor: 2, type: '3BHK', areaSqFt: 1650, status: 'VACANT', createdAt: new Date(), updatedAt: new Date() },
    ]);
    console.log('✅ Seeded society residential units');
  }

  // 4. Seed Amenities
  const amenitiesCol = db.collection('amenities');
  const amenityCount = await amenitiesCol.countDocuments({ societyId });
  if (amenityCount === 0) {
    await amenitiesCol.insertMany([
      {
        societyId,
        name: 'Grand Clubhouse Banquet Hall',
        code: 'HALL-A',
        type: 'COMMUNITY_HALL',
        capacity: 150,
        description: 'Spacious banquet hall for private family celebrations, community events, and AGM meetings.',
        openTime: '09:00',
        closeTime: '23:00',
        slotMinutes: 240,
        feePerSlot: 2500,
        depositAmount: 5000,
        status: 'ACTIVE',
        rules: ['No loud music past 22:00.', 'Cleaning fee applies if not cleared.'],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        societyId,
        name: 'Resident Guest Suite (Room 1)',
        code: 'GUEST-1',
        type: 'GUEST_ROOM',
        capacity: 3,
        description: 'Furnished air-conditioned studio room for visiting family members of registered residents.',
        openTime: '12:00',
        closeTime: '11:00',
        slotMinutes: 1440,
        feePerSlot: 1200,
        depositAmount: 1000,
        status: 'ACTIVE',
        rules: ['Valid photo ID required.', 'Maximum stay 5 nights.'],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        societyId,
        name: 'All-Weather Tennis Court',
        code: 'TENNIS-1',
        type: 'SPORTS_FACILITY',
        capacity: 4,
        description: 'Synthetic floodlit tennis court. Proper non-marking tennis shoes mandatory.',
        openTime: '06:00',
        closeTime: '21:00',
        slotMinutes: 60,
        feePerSlot: 200,
        depositAmount: 0,
        status: 'ACTIVE',
        rules: ['Non-marking shoes only.'],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
    console.log('✅ Seeded society amenities catalog');
  }

  // 5. Seed Announcements
  const announcementsCol = db.collection('announcements');
  const annCount = await announcementsCol.countDocuments({ societyId });
  if (annCount === 0) {
    await announcementsCol.insertMany([
      {
        societyId,
        title: 'Elevator Maintenance: Block A Passenger Lift #1',
        content: 'Lift #1 will undergo quarterly safety governor and cable inspection tomorrow between 10:00 and 13:00. Please use Lift #2 or service stairs.',
        priority: 'HIGH',
        audience: 'ALL',
        status: 'PUBLISHED',
        publishedAt: new Date(),
        corrections: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        societyId,
        title: 'Quarterly Resident General Body Meeting (AGM)',
        content: 'Annual General Body Meeting scheduled for this Sunday at 18:00 in the Grand Clubhouse Banquet Hall. Financial audits and solar installation proposals will be tabled.',
        priority: 'MEDIUM',
        audience: 'RESIDENTS',
        status: 'PUBLISHED',
        publishedAt: new Date(),
        corrections: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
    console.log('✅ Seeded society announcements');
  }

  // 6. Seed Sample Active Visitor Pass (VP-4021)
  const passesCol = db.collection('visitorPasses');
  const existingPass = await passesCol.findOne({ societyId, passCode: 'VP-4021' });
  if (!existingPass) {
    await passesCol.insertOne({
      societyId,
      residentId: residentUserId || 'demo-resident-id',
      unitId: 'A-402',
      visitorName: 'Vikram Sethi',
      visitorPhone: '+91 98765 43210',
      vehicleNumber: 'KA-03-MG-4021',
      purpose: 'GUEST',
      validFrom: new Date(Date.now() - 3600000),
      validUntil: new Date(Date.now() + 86400000),
      passCode: 'VP-4021',
      qrToken: 'demo_opaque_qr_token_verified_safe_no_pii',
      status: 'ACTIVE',
      entryCount: 0,
      maxEntries: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log(' Seeded sample visitor pass: VP-4021');
  }

  console.log('\n Demo society operations data seeding complete!\n');
  await client.close();
  process.exit(0);
}

seedDemoData().catch((err) => {
  console.error('Demo data seed failed:', err);
  process.exit(1);
});
