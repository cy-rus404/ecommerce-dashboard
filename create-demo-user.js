const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function createDemoUser() {
  try {
    console.log('🔄 Creating demo user...');
    
    // First, try to sign up the demo user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: 'demo@example.com',
      password: 'demo123456',
      options: {
        data: {
          name: 'Demo User'
        }
      }
    });

    if (authError && !authError.message.includes('already registered')) {
      console.error('❌ Error creating auth user:', authError);
      return;
    }

    console.log('✅ Demo auth user created/exists');

    // Add to demo_users table
    const { data: demoData, error: demoError } = await supabase
      .from('demo_users')
      .upsert({
        email: 'demo@example.com',
        name: 'Demo User',
        is_demo: true
      }, { onConflict: 'email' });

    if (demoError) {
      console.error('❌ Error creating demo user record:', demoError);
    } else {
      console.log('✅ Demo user record created/updated');
    }

    console.log('🎉 Demo user setup complete!');
    console.log('📧 Email: demo@example.com');
    console.log('🔑 Password: demo123456');

  } catch (error) {
    console.error('❌ Failed to create demo user:', error);
  }
}

createDemoUser();