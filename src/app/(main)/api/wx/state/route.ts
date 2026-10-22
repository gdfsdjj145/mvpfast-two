import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const STATE_COOKIE = 'mvpfast.wx.open_state';

export async function GET(request: NextRequest) {
  const state = `open_${crypto.randomBytes(24).toString('hex')}`;
  const response = NextResponse.json({ state }, {
    headers: { 'Cache-Control': 'no-store' },
  });
  response.cookies.set(STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: 'lax',
    secure: request.nextUrl.protocol === 'https:',
    path: '/',
    maxAge: 5 * 60,
  });
  return response;
}
