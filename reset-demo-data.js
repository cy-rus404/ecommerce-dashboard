const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function resetDemoData() {
  try {
    console.log('🔄 Resetting demo data...');
    
    // Call the reset function
    const { data, error } = await supabase.rpc('reset_demo_data');
    
    if (error) {
      console.error('❌ Error resetting demo data:', error);
    } else {
      console.log('✅ Demo data reset successfully!');
    }
  } catch (error) {
    console.error('❌ Failed to reset demo data:', error);
  }
}

resetDemoData();