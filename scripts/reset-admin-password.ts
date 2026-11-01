import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/mongodb';
import Admin from '@/lib/models/Admin';

async function main() {
  const [, , username, newPassword] = process.argv;

  if (!username || !newPassword) {
    console.error('Usage: npx tsx scripts/reset-admin-password.ts <username> <newPassword>');
    process.exit(1);
  }

  await connectDB();

  const passwordHash = await bcrypt.hash(newPassword, 10);

  const result = await Admin.updateOne(
    { username: username.toLowerCase().trim() },
    { $set: { passwordHash } }
  );

  if (result.matchedCount === 0) {
    console.error(`Admin user not found: ${username}`);
    process.exit(1);
  }

  console.log(`Password reset completed for admin user: ${username}`);
}

main().catch((error) => {
  console.error('Failed to reset admin password:', error instanceof Error ? error.message : error);
  process.exit(1);
});
