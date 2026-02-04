
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// 1. Load Env Vars manually since we are running via tsx
const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars: Record<string, string> = {};
envContent.split('\n').forEach(line => {
    const [key, val] = line.split('=');
    if (key && val) envVars[key.trim()] = val.trim();
});

const supabaseUrl = envVars['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseKey = envVars['NEXT_PUBLIC_SUPABASE_ANON_KEY'];

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Env Vars");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Mock Services locally to avoid circular dependencies with @/lib/supabase if it fails
// Actually we can just implement the logic here directly to test the Database.
// The Services wrapper is just a convenience. Let's test the DB directly to be sure.

async function runTest() {
    console.log("--- Starting Supabase Migration Test (Direct DB) ---");

    // 1. Sign In Existing User (to avoid rate limits)
    const email = 'test_seller_1769492854296@gmail.com';
    const password = 'password123';
    console.log(`Signing In Seller: ${email}`);

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (authError) {
        console.error("Auth Error:", authError);
        return;
    }

    const session = authData.session;
    const userId = authData.user?.id;
    if (!userId || !session) {
        console.error("No Session/User");
        return;
    }
    console.log("Seller Created:", userId);

    // Create Authenticated Client
    const authClient = createClient(supabaseUrl, supabaseKey, {
        global: {
            headers: {
                Authorization: `Bearer ${session.access_token}`
            }
        }
    });

    // 2. Create a Car
    console.log("Creating Car...");
    const { data: car, error: carError } = await authClient.from('cars').insert({
        seller_id: userId,
        make: 'Toyota',
        model: 'Corolla',
        year: 2020,
        price: 250000,
        description: 'Test Car',
        status: 'draft'
    }).select().single();

    if (carError) {
        console.error("Car Creation Error:", carError);
        return;
    }
    console.log("Car Created:", car.id);

    // 3. Create Service Ticket
    console.log("Creating Service Ticket...");
    const { data: ticket, error: ticketError } = await authClient
        .from('service_tickets')
        .insert({
            car_id: car.id,
            workshop_id: "workshop-123",
            workshop_name: "Taller Test",
            scheduled_date: new Date().toISOString(),
            status: 'PENDING_PAYMENT',
            payout_amount: 750
        })
        .select()
        .single();

    if (ticketError) {
        console.error("Ticket Creation Error:", ticketError);
        return;
    }
    console.log("Ticket Created:", ticket.id);

    // 4. Simulate Payment (Anyone can insert currently per our policy for simulation)
    // We use the authClient but really this would be server side.
    console.log("Simulating Payment...");
    const { error: payError } = await authClient
        .from('service_payments')
        .insert({
            ticket_id: ticket.id,
            amount: 900,
            type: 'CHARGE',
            stripe_id: 'ch_test_123',
            status: 'SUCCEEDED'
        });

    if (payError) {
        console.error("Payment Error:", payError);
        return;
    }
    console.log("Payment Recorded.");

    // Update ticket status (allowed by RLS for involved parties)
    const { data: updatedTicket, error: updateError } = await authClient
        .from('service_tickets')
        .update({ status: 'PAID_PENDING_VISIT' })
        .eq('id', ticket.id)
        .select()
        .single();

    if (updateError) {
        console.error("Ticket Update Failed:", updateError);
        return;
    }
    console.log("Ticket Status Updated:", updatedTicket.status);
    console.log("SUCCESS: Migration Verified.");
}

runTest();
