# Stripe Payment Architecture

## Overview
Secure payment flow for vehicle purchases using Stripe Checkout and Next.js Server Actions.

## Logical Flow

### 1. Frontend Trigger
**Component:** `CheckoutButton.tsx` (inside `/transaction/[id]`)
- **Action:** User clicks "Comprar Ahora".
- **Logic:** Invokes the Server Action `startCheckout(transactionId)`.
- **State:** Shows loading spinner while awaiting server response.

### 2. Server Action Initialization
**File:** `app/src/actions/checkout.ts` (Function: `startCheckout`)
- **Input:** `transactionId`
- **Validation:**
  - Check if user is authenticated.
  - Fetch transaction from Supabase.
  - Verify transaction status is `pending`.
- **Stripe Session Creation:**
  - Call `stripe.checkout.sessions.create`:
    - `payment_method_types`: `['card']`
    - `mode`: `payment`
    - `line_items`:
      - Car Title
      - Price (in cents)
      - Image (optional)
    - `metadata`:
      - `transactionId`: (UUID)
      - `userId`: (UUID)
      - `carId`: (UUID)
    - `success_url`: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`
    - `cancel_url`: `${origin}/transaction/${transactionId}?canceled=true`
- **Return:** `{ url: string }` or `{ error: string }`.

### 3. Redirection
- **Client Side:**
  - Receives the Stripe URL.
  - Redirects using `window.location.href = url`.

### 4. Webhook Processing (Async)
**Endpoint:** `/api/webhooks/stripe`
- **Event:** `checkout.session.completed`
- **Security:** Verify Stripe signature using `STRIPE_WEBHOOK_SECRET`.
- **Processing:**
  1. Parse event body.
  2. Extract `transactionId` from `session.metadata`.
  3. Update Supabase:
     ```sql
     UPDATE transactions 
     SET status = 'paid', 
         stripe_payment_id = session.payment_intent 
     WHERE id = metadata.transactionId;
     ```
  4. Trigger "Sold" logic for vehicle (mark as sold, generate QR code).
