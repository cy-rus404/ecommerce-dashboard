const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function createTrialUser(name, email = null, daysValid = 7) {
  try {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + daysValid);

    const trialToken = `trial_${Math.random().toString(36).substring(2, 15)}${Date.now().toString(36)}`;

    const { data, error } = await supabase
      .from('trial_users')
      .insert({
        trial_token: trialToken,
        name,
        email,
        expires_at: expiresAt.toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating trial user:', error);
      return;
    }

    console.log('✅ Trial user created successfully!');
    console.log('📧 Name:', name);
    console.log('🔑 Trial Token:', trialToken);
    console.log('⏰ Expires:', expiresAt.toLocaleDateString());
    console.log('🌐 Trial URL: http://localhost:3000/trial');
    console.log('\nShare this token with the user to access the trial dashboard.');

  } catch (error) {
    console.error('Failed to create trial user:', error);
  }
}

// Get command line arguments
const args = process.argv.slice(2);
const name = args[0];
const email = args[1];
const days = parseInt(args[2]) || 7;

if (!name) {
  console.log('Usage: npm run create-trial-user "User Name" [email] [days]');
  console.log('Example: npm run create-trial-user "John Doe" "john@example.com" 14');
  process.exit(1);
}

createTrialUser(name, email, days);