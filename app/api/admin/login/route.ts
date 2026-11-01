import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/mongodb';
import Admin from '@/lib/models/Admin';

const cookieName = 'admin-session';
// Simple in-memory rate limiting for a single-server deployment. It resets on restart and does not share state across multiple instances.
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 5;

function getSessionSecret() {
  const sessionSecret = process.env.SESSION_SECRET?.trim();

  if (!sessionSecret && process.env.NODE_ENV === 'production') {
    throw new Error('SESSION_SECRET must be set in production to sign admin session tokens.');
  }

  if (!sessionSecret) {
    throw new Error('SESSION_SECRET must be set to sign admin session tokens.');
  }

  return sessionSecret;
}

function getClientIp(req: NextRequest) {
  const forwardedFor = req.headers.get('x-forwarded-for');
  const clientIp = forwardedFor?.split(',')[0]?.trim();

  return clientIp || req.headers.get('x-real-ip') || 'unknown';
}

function applyRateLimit(req: NextRequest) {
  const ip = getClientIp(req);
  const now = Date.now();
  const previous = rateLimitMap.get(ip) ?? [];
  const recent = previous.filter((timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS);

  if (recent.length >= RATE_LIMIT_MAX_REQUESTS) {
    rateLimitMap.set(ip, recent);
    return false;
  }

  recent.push(now);
  rateLimitMap.set(ip, recent);
  return true;
}

export async function POST(req: NextRequest) {
  const sessionSecret = getSessionSecret();

  if (!applyRateLimit(req)) {
    return NextResponse.json(
      { success: false, error: 'Too many requests. Please try again later.' },
      { status: 429 }
    );
  }

  try {
    await connectDB();

    const body = await req.json();
    const username = typeof body?.username === 'string' ? body.username.trim().toLowerCase() : '';
    const password = typeof body?.password === 'string' ? body.password : '';

    if (!username || !password) {
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
    }

    const admin = await Admin.findOne({ username });
    console.log('admin login attempt:', {
      username,
      foundAdmin: !!admin,
    });

    if (!admin || !(await bcrypt.compare(password, admin.passwordHash))) {
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
    }

    const payload = {
      username: admin.username,
      role: 'admin',
    };

    const token = jwt.sign(payload, sessionSecret, {
      expiresIn: '7d',
    });

    const response = NextResponse.json({ success: true });
    response.cookies.set({
      name: cookieName,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error(error);
    }
    return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
  }
}
