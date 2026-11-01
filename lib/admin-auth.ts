import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export type AdminSessionPayload = {
  username: string;
  role: 'admin';
};

export async function getAdminSession(): Promise<AdminSessionPayload | null> {
  const sessionSecret = process.env.SESSION_SECRET?.trim();

  if (!sessionSecret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('SESSION_SECRET must be set in production to verify admin sessions.');
    }

    return null;
  }

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin-session')?.value;

    if (!token) {
      return null;
    }

    const payload = jwt.verify(token, sessionSecret) as AdminSessionPayload;

    if (payload.role !== 'admin' || !payload.username) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
