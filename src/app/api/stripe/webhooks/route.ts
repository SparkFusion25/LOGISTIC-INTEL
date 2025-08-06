import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature provided' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  console.log('Received Stripe webhook:', event.type);

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        if (session.mode === 'subscription') {
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          );
          
          await handleSubscriptionCreated(session, subscription);
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        
        // Get subscription ID from invoice lines
        const subscriptionId = invoice.lines?.data?.[0]?.subscription;
        if (subscriptionId && typeof subscriptionId === 'string') {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          await handlePaymentSucceeded(invoice, subscription);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCanceled(subscription);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleSubscriptionCreated(
  session: Stripe.Checkout.Session,
  subscription: Stripe.Subscription
) {
  const userId = session.metadata?.user_id;
  const planId = session.metadata?.plan_id;

  if (!userId) {
    console.error('No user_id in checkout session metadata');
    return;
  }

  // Update user with subscription details
  const sub = subscription as any;
  await supabase
    .from('users')
    .update({
      stripe_customer_id: session.customer as string,
      stripe_subscription_id: subscription.id,
      subscription_status: subscription.status,
      subscription_plan: planId,
      subscription_current_period_start: sub.current_period_start ? new Date(sub.current_period_start * 1000).toISOString() : null,
      subscription_current_period_end: sub.current_period_end ? new Date(sub.current_period_end * 1000).toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  console.log(`Subscription created for user ${userId}: ${subscription.id}`);
}

async function handlePaymentSucceeded(
  invoice: Stripe.Invoice,
  subscription: Stripe.Subscription
) {
  // Get user by stripe customer ID
  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('stripe_customer_id', typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id)
    .single();

  if (!user) {
    console.error('User not found for customer:', invoice.customer);
    return;
  }

  // Update subscription details
  const sub = subscription as any;
  await supabase
    .from('users')
    .update({
      subscription_status: subscription.status,
      subscription_current_period_start: sub.current_period_start ? new Date(sub.current_period_start * 1000).toISOString() : null,
      subscription_current_period_end: sub.current_period_end ? new Date(sub.current_period_end * 1000).toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id);

  console.log(`Payment succeeded for user ${user.id}: ${invoice.id}`);
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  // Get user by stripe customer ID
  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('stripe_customer_id', typeof subscription.customer === 'string' ? subscription.customer : subscription.customer?.id)
    .single();

  if (!user) {
    console.error('User not found for customer:', subscription.customer);
    return;
  }

  // Update subscription details
  const sub = subscription as any;
  await supabase
    .from('users')
    .update({
      subscription_status: subscription.status,
      subscription_current_period_start: sub.current_period_start ? new Date(sub.current_period_start * 1000).toISOString() : null,
      subscription_current_period_end: sub.current_period_end ? new Date(sub.current_period_end * 1000).toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id);

  console.log(`Subscription updated for user ${user.id}: ${subscription.id}`);
}

async function handleSubscriptionCanceled(subscription: Stripe.Subscription) {
  // Get user by stripe customer ID
  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('stripe_customer_id', typeof subscription.customer === 'string' ? subscription.customer : subscription.customer?.id)
    .single();

  if (!user) {
    console.error('User not found for customer:', subscription.customer);
    return;
  }

  // Update subscription status
  await supabase
    .from('users')
    .update({
      subscription_status: 'canceled',
      subscription_plan: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id);

  console.log(`Subscription canceled for user ${user.id}: ${subscription.id}`);
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  // Get user by stripe customer ID
  const { data: user } = await supabase
    .from('users')
    .select('id, email')
    .eq('stripe_customer_id', typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id)
    .single();

  if (!user) {
    console.error('User not found for customer:', invoice.customer);
    return;
  }

  // You could send an email notification here or update user status
  console.log(`Payment failed for user ${user.id}: ${invoice.id}`);
  
  // Optional: Update user status to indicate payment failure
  await supabase
    .from('users')
    .update({
      subscription_status: 'past_due',
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id);
}