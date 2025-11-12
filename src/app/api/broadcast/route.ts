// src/app/api/broadcast/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, userIds } = body;

    if (!message || !userIds || !Array.isArray(userIds)) {
      return NextResponse.json(
        { error: 'Invalid request. Message and userIds are required.' },
        { status: 400 }
      );
    }

    // Call your backend bot to send messages
    const BOT_URL = process.env.NEXT_PUBLIC_BOT_URL || 'https://advancedcb.onrender.com';
    
    const results = await Promise.allSettled(
      userIds.map(async (userId) => {
        const response = await fetch(`${BOT_URL}/api/send-message`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.BOT_API_SECRET}` // Tambahkan auth
          },
          body: JSON.stringify({
            to: userId,
            message: message
          })
        });

        if (!response.ok) {
          throw new Error(`Failed to send to ${userId}`);
        }

        return { userId, status: 'success' };
      })
    );

    const success = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;
    const errors = results
      .filter((r): r is PromiseRejectedResult => r.status === 'rejected')
      .map((r, i) => ({
        userId: userIds[i],
        error: r.reason.message
      }));

    return NextResponse.json({
      success,
      failed,
      total: userIds.length,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error('Broadcast error:', error);
    return NextResponse.json(
      { error: 'Failed to send broadcast' },
      { status: 500 }
    );
  }
}