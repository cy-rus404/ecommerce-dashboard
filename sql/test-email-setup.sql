-- Test email function
SELECT 
  supabase_url() as project_url,
  'Test if RESEND_API_KEY is set in Edge Functions environment' as note;