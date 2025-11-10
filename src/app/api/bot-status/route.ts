// app/api/bot-status/route.ts (Next.js App Router)
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('https://advancedcb.onrender.com/webhook/health');
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ status: 'offline' }, { status: 500 });
  }
}
