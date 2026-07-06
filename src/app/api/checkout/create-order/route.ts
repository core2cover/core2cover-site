import { razorpay } from '@/lib/razorpay';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { sessionId } = await req.json();

    if (!sessionId) {
      return NextResponse.json({ error: 'Missing session ID' }, { status: 400 });
    }

    const order = await razorpay.orders.create({
      amount: 14900,
      currency: 'INR',
      receipt: sessionId,
      notes: { sessionId },
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    console.error('Razorpay order creation failed:', error);
    return NextResponse.json({ error: 'Failed to create payment order' }, { status: 500 });
  }
}
