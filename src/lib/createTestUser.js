require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function createTestUser() {
  const testUser = {
    email: process.env.TEST_USER_EMAIL || 'testuser@example.com',
    password: process.env.TEST_USER_PASSWORD || 'secure_random_password',
    name: process.env.TEST_USER_NAME || 'Test User',
    phone: process.env.TEST_USER_PHONE || '+233123456789'
  };

  const { data, error } = await supabase.auth.signUp({
    email: testUser.email,
    password: testUser.password,
    options: {
      data: {
        name: testUser.name,
        phone: testUser.phone
      }
    }
  });

  if (error) {
    console.error('Error creating test user:', error.message);
  } else {
    console.log('Test user created successfully');
    console.log('User ID:', data.user?.id);
  }
}

createTestUser();