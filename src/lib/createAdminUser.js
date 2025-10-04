require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function createAdminUser() {
  const { data, error } = await supabase.auth.signUp({
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
    options: {
      data: {
        name: 'Admin User',
        phone: '1234567890',
        role: 'admin'
      }
    }
  });

  if (error) {
    console.error('Error creating admin user:', error.message);
  } else {
    console.log('Admin user created successfully:', data.user?.email);
  }
}

createAdminUser();