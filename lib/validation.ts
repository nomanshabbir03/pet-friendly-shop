import { NextResponse } from 'next/server';
import { z } from 'zod';

export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export function validateRequestBody<T>(body: unknown, schema: z.ZodType<T>): ValidationResult<T> {
  const result = schema.safeParse(body);

  if (!result.success) {
    const message = result.error.issues.map((issue) => issue.message).join('; ');
    return { success: false, error: `Validation failed: ${message}` };
  }

  return { success: true, data: result.data };
}

export function badRequestResponse(message: string) {
  return NextResponse.json({ success: false, error: message }, { status: 400 });
}

export function unauthorizedResponse(message: string) {
  return NextResponse.json({ success: false, error: message }, { status: 401 });
}

export function internalErrorResponse(message = 'Internal server error') {
  return NextResponse.json({ success: false, error: message }, { status: 500 });
}
