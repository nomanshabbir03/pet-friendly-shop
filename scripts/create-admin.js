#!/usr/bin/env node

const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

const username = 'admin';
const password = process.env.ADMIN_PASSWORD;

async function main() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not set in .env.local');
  }

  if (!password) {
    throw new Error('ADMIN_PASSWORD must be set before running this script.');
  }

  await mongoose.connect(process.env.MONGODB_URI, { bufferCommands: false });

  const adminSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true, trim: true, lowercase: true },
    passwordHash: { type: String, required: true },
  });

  const Admin = mongoose.models.Admin || mongoose.model('Admin', adminSchema);
  const passwordHash = await bcrypt.hash(password, 10);

  await Admin.updateOne(
    { username },
    { $set: { username, passwordHash } },
    { upsert: true }
  );

  console.log(`Admin ready for ${username}`);
  await mongoose.disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
