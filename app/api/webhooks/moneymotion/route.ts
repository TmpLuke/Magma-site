import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookSignature, WebhookPayload } from '@/lib/moneymotion';

export async function POST(request: NextRequest) {
  try {
    // Get the raw body for signature verification
    const rawBody = await request.text();
    const signature = request.headers.get('x-webhook-signature');
    const webhookSecret = process.env.MONEYMOTION_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error('MoneyMotion webhook secret not configured');
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
    }

    if (!signature) {
      return NextResponse.json({ error: 'Missing webhook signature' }, { status: 401 });
    }

    // Verify the webhook signature
    const isValid = await verifyWebhookSignature(rawBody, signature, webhookSecret);
    if (!isValid) {
      console.error('Invalid webhook signature');
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 });
    }

    // Parse the webhook payload
    let payload: WebhookPayload;
    try {
      payload = JSON.parse(rawBody);
    } catch (error) {
      console.error('Invalid JSON payload:', error);
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    const { event, checkoutSession, customer } = payload;
    console.log(`Received webhook event: ${event}`, { checkoutSession, customer });

    // Handle different webhook events
    switch (event) {
      case 'checkout_session:complete':
        await handlePaymentComplete(checkoutSession, customer);
        break;
      case 'checkout_session:refunded':
        await handlePaymentRefunded(checkoutSession, customer);
        break;
      case 'checkout_session:expired':
        await handlePaymentExpired(checkoutSession, customer);
        break;
      case 'checkout_session:disputed':
        await handlePaymentDisputed(checkoutSession, customer);
        break;
      case 'checkout_session:new':
        await handlePaymentNew(checkoutSession, customer);
        break;
      default:
        console.log(`Unhandled webhook event: ${event}`);
    }

    return NextResponse.json({ received: true, event });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function handlePaymentComplete(checkoutSession: any, customer: any) {
  console.log('Payment completed:', {
    sessionId: checkoutSession.id,
    amount: checkoutSession.totalInCents,
    customerEmail: customer.email,
    paymentMethod: customer.paymentMethodInfo
  });

  // TODO: Implement your business logic here
  // - Update order status in database
  // - Send confirmation email
  // - Grant access to purchased products
  // - Create user account if needed
}

async function handlePaymentRefunded(checkoutSession: any, customer: any) {
  console.log('Payment refunded:', {
    sessionId: checkoutSession.id,
    amount: checkoutSession.totalInCents,
    customerEmail: customer.email
  });

  // TODO: Implement refund logic
  // - Revoke access to products
  // - Update order status
  // - Send refund notification
}

async function handlePaymentExpired(checkoutSession: any, customer: any) {
  console.log('Payment expired:', {
    sessionId: checkoutSession.id,
    customerEmail: customer.email
  });

  // TODO: Implement expiration logic
  // - Clean up pending orders
  // - Release reserved inventory
}

async function handlePaymentDisputed(checkoutSession: any, customer: any) {
  console.log('Payment disputed:', {
    sessionId: checkoutSession.id,
    amount: checkoutSession.totalInCents,
    customerEmail: customer.email
  });

  // TODO: Implement dispute logic
  // - Flag account for review
  // - Temporarily suspend access
  // - Notify support team
}

async function handlePaymentNew(checkoutSession: any, customer: any) {
  console.log('New checkout session:', {
    sessionId: checkoutSession.id,
    customerEmail: customer.email
  });

  // TODO: Implement new session logic
  // - Create pending order record
  // - Reserve inventory
  // - Send order confirmation
}