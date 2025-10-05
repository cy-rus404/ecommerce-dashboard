// Test email function directly
const testEmail = async () => {
  const response = await fetch('https://kfqyodldadrtoxzfwsgz.supabase.co/functions/v1/send-email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer YOUR_ANON_KEY'
    },
    body: JSON.stringify({
      to: 'sduisaac@gmail.com',
      subject: 'Test Email',
      html: '<h1>Test Email</h1><p>This is a test email.</p>'
    })
  });
  
  const result = await response.json();
  console.log('Email test result:', result);
};

// Run this in browser console to test
testEmail();