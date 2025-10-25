-- Create the admin auth user in Supabase
-- Run this in Supabase SQL Editor

-- First, create the auth user (this creates the actual login account)
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'admin@ecommerce.com',
    crypt('admin123456', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
);

-- Create identity record
INSERT INTO auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    (SELECT id FROM auth.users WHERE email = 'admin@ecommerce.com'),
    format('{"sub":"%s","email":"%s"}', (SELECT id FROM auth.users WHERE email = 'admin@ecommerce.com'), 'admin@ecommerce.com')::jsonb,
    'email',
    NOW(),
    NOW(),
    NOW()
);