import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export class EmailNotifications {
  static async sendOrderStatusUpdate(userEmail: string, orderId: number, status: string) {
    try {
      const { error } = await supabase.functions.invoke('send-email', {
        body: {
          to: userEmail,
          subject: `Order #${orderId} Status Update`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #2563eb;">Order Status Update</h2>
              <p>Your order #${orderId} status has been updated to: <strong>${status}</strong></p>
              <p>Thank you for shopping with us!</p>
            </div>
          `
        }
      });

      if (!error) {
        await supabase.from('email_notifications').insert({
          recipient_email: userEmail,
          subject: `Order #${orderId} Status Update`,
          html_content: `Order status updated to ${status}`,
          notification_type: 'order_status_update'
        });
      }
    } catch (error) {
      // Handle error silently
    }
  }

  static async sendLowStockAlert(userEmail: string, productName: string) {
    try {
      const { error } = await supabase.functions.invoke('send-email', {
        body: {
          to: userEmail,
          subject: `${productName} - Back in Stock!`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #16a34a;">Good News!</h2>
              <p><strong>${productName}</strong> is back in stock!</p>
              <p>Don't miss out - get yours now before it's gone again.</p>
              <a href="${process.env.NEXT_PUBLIC_SITE_URL}/products" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Shop Now</a>
            </div>
          `
        }
      });

      if (!error) {
        await supabase.from('email_notifications').insert({
          recipient_email: userEmail,
          subject: `${productName} - Back in Stock!`,
          html_content: `Product ${productName} back in stock`,
          notification_type: 'low_stock_alert'
        });
      }
    } catch (error) {
      // Handle error silently
    }
  }

  static async sendDiscountAlert(userEmail: string, productName: string, discount: number) {
    try {
      const { error } = await supabase.functions.invoke('send-email', {
        body: {
          to: userEmail,
          subject: `${discount}% OFF ${productName}!`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #dc2626;">Special Discount Alert!</h2>
              <p><strong>${productName}</strong> is now ${discount}% OFF!</p>
              <p>Limited time offer - don't miss out on this amazing deal.</p>
              <a href="${process.env.NEXT_PUBLIC_SITE_URL}/products" style="background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Shop Now</a>
            </div>
          `
        }
      });

      if (!error) {
        await supabase.from('email_notifications').insert({
          recipient_email: userEmail,
          subject: `${discount}% OFF ${productName}!`,
          html_content: `Discount alert for ${productName}`,
          notification_type: 'discount_alert'
        });
      }
    } catch (error) {
      // Handle error silently
    }
  }
}