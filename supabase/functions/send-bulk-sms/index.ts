import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { orders, status } = await req.json()

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    let successCount = 0
    let failCount = 0

    for (const order of orders) {
      const message = `Your order #${order.id} has been ${status.toUpperCase()}. ${status === 'shipped' ? 'Your order is on the way!' : status === 'delivered' ? 'Delivered! Enjoy your purchase.' : 'We\'ll keep you updated.'}`

      try {
        // Use free SMS service (server-side avoids CORS)
        const response = await fetch('https://api.textbelt.com/text', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            phone: order.phone,
            message: message,
            key: 'textbelt'
          })
        })

        const result = await response.json()
        
        if (result.success) {
          successCount++
          
          // Store successful SMS in database
          await supabaseClient.from('sms_notifications').insert([{
            recipient_phone: order.phone,
            message_content: message,
            notification_type: 'order_status_update',
            status: 'sent',
            sent_at: new Date().toISOString()
          }])
        } else {
          failCount++
        }
      } catch (error) {
        failCount++
        console.error('SMS error:', error)
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        successCount,
        failCount,
        message: `${successCount} SMS sent, ${failCount} failed`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})