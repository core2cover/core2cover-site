import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const { sessionId, userId, razorpayPaymentId, razorpayOrderId, razorpaySignature } = await req.json();

    if (!sessionId || !userId || !razorpayPaymentId || !razorpayOrderId || !razorpaySignature) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const body = razorpayOrderId + '|' + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpaySignature) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
    }

    const { error: sessionError } = await supabaseAdmin
      .from('checkout_sessions')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('id', sessionId);

    if (sessionError) {
      console.error('Failed to update checkout session:', sessionError);
      return NextResponse.json({ error: 'Failed to update checkout session' }, { status: 500 });
    }

    const periodEnd = new Date();
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    const { error: subError } = await supabaseAdmin
      .from('subscriptions')
      .upsert({
        user_id: userId,
        plan: 'blue',
        status: 'active',
        current_period_start: new Date().toISOString(),
        current_period_end: periodEnd.toISOString(),
        stripe_subscription_id: razorpayOrderId,
        stripe_customer_id: razorpayPaymentId,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

    if (subError) {
      console.error('Failed to upsert subscription:', subError);
      return NextResponse.json({ error: 'Payment processed but subscription creation failed. Please contact support.' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Payment verification failed:', error);
    return NextResponse.json({ error: 'Payment verification failed' }, { status: 500 });
  }
}
