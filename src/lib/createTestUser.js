require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function createTestUser() {
  const testUser = {
    email: 'testuser@example.com',
    password: 'testuser123',
    name: 'John Doe',
    phone: '+233123456789'
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
    console.log('Test user created successfully:');
    console.log('Email:', testUser.email);
    console.log('Password:', testUser.password);
    console.log('Name:', testUser.name);
    console.log('Phone:', testUser.phone);
    console.log('User ID:', data.user?.id);
  }
}

createTestUser();