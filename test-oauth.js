// Test OAuth Configuration
// Run this after setting up OAuth providers in Supabase

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testOAuthProviders() {
  console.log('Testing OAuth provider configuration...\n');
  
  try {
    // Test Google OAuth URL generation
    const { data: googleData, error: googleError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'http://localhost:3000/auth/callback'
      }
    });
    
    if (googleError) {
      console.log('❌ Google OAuth not configured:', googleError.message);
    } else {
      console.log('✅ Google OAuth configured successfully');
    }
    
    // Test Apple OAuth URL generation
    const { data: appleData, error: appleError } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: {
        redirectTo: 'http://localhost:3000/auth/callback'
      }
    });
    
    if (appleError) {
      console.log('❌ Apple OAuth not configured:', appleError.message);
    } else {
      console.log('✅ Apple OAuth configured successfully');
    }
    
  } catch (error) {
    console.error('Error testing OAuth:', error.message);
  }
}

testOAuthProviders();