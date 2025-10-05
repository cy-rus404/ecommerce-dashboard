/// <reference types="https://deno.land/x/types/react/index.d.ts" />
declare const Deno: any;
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const EMAILJS_SERVICE_ID = Deno.env.get('EMAILJS_SERVICE_ID')
const EMAILJS_TEMPLATE_ID = Deno.env.get('EMAILJS_TEMPLATE_ID')
const EMAILJS_PUBLIC_KEY = Deno.env.get('EMAILJS_PUBLIC_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { to, subject, html } = await req.json()
    
    console.log('Sending email to:', to)

    const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        service_id: EMAILJS_SERVICE_ID,
        template_id: EMAILJS_TEMPLATE_ID,
        user_id: EMAILJS_PUBLIC_KEY,
        template_params: {
          to_email: to,
          subject: subject,
          message: html,
          reply_to: to
        }
      }),
    })

    const responseText = await res.text()
    console.log('EmailJS response:', responseText)

    return new Response(
      JSON.stringify({ success: responseText === 'OK', response: responseText }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    console.error('Email function error:', error)
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})