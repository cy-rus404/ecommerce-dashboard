import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface SMSNotification {
  to: string;
  message: string;
  type: 'order_confirmation' | 'low_stock_alert' | 'order_status_update';
}

export class SMSService {
  // Send SMS notification via Supabase Edge Function
  static async sendSMS(notification: SMSNotification): Promise<boolean> {
    try {
      const { data, error } = await supabase.functions.invoke('send-sms', {
        body: {
          phone: notification.to,
          message: notification.message,
          type: notification.type
        }
      });

      if (error) {
        console.error('Error calling SMS function:', error);
        return false;
      }

      console.log('SMS function response:', data);
      
      // Show WhatsApp popup with the URL from Supabase function
      if (typeof window !== 'undefined' && data.whatsappUrl) {
        try {
          // Request notification permission
          if (Notification.permission === 'default') {
            await Notification.requestPermission();
          }
          
          // Show browser notification
          if (Notification.permission === 'granted') {
            new Notification('SMS Alert', {
              body: notification.message,
              icon: '/favicon.ico'
            });
          }
          
          // Show notification with WhatsApp option
          const notification_div = document.createElement('div');
          notification_div.className = 'fixed top-4 right-4 bg-blue-500 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm';
          notification_div.innerHTML = `
            <div class="mb-2">📱 SMS Ready</div>
            <div class="text-sm mb-3">${notification.message}</div>
            <a href="${data.whatsappUrl}" target="_blank" class="bg-green-500 hover:bg-green-600 px-3 py-1 rounded text-sm">
              Send via WhatsApp
            </a>
            <button onclick="this.parentElement.remove()" class="ml-2 bg-gray-500 hover:bg-gray-600 px-3 py-1 rounded text-sm">
              Close
            </button>
          `;
          document.body.appendChild(notification_div);
          
          // Auto-remove after 10 seconds
          setTimeout(() => {
            if (document.body.contains(notification_div)) {
              document.body.removeChild(notification_div);
            }
          }, 10000);
        } catch (err) {
          console.error('Error showing notification:', err);
          alert('SMS: ' + notification.message);
        }
      }

      return true;
    } catch (error) {
      console.error('Error sending SMS:', error);
      return false;
    }
  }

  // Order confirmation SMS
  static async sendOrderConfirmation(
    customerPhone: string,
    orderId: number,
    orderTotal: number
  ): Promise<boolean> {
    const message = `Order confirmed! #${orderId} - Total: ₵${orderTotal.toFixed(2)}. We'll update you when it ships. Thank you!`;

    return this.sendSMS({
      to: customerPhone,
      message,
      type: 'order_confirmation'
    });
  }

  // Low stock alert SMS
  static async sendLowStockAlert(
    adminPhone: string,
    lowStockProducts: any[]
  ): Promise<boolean> {
    const productList = lowStockProducts.slice(0, 3).map(p => `${p.name} (${p.stock})`).join(', ');
    const message = `LOW STOCK ALERT: ${lowStockProducts.length} products need restocking: ${productList}${lowStockProducts.length > 3 ? '...' : ''}`;

    return this.sendSMS({
      to: adminPhone,
      message,
      type: 'low_stock_alert'
    });
  }

  // Order status update SMS
  static async sendOrderStatusUpdate(
    customerPhone: string,
    orderId: number,
    newStatus: string
  ): Promise<boolean> {
    const message = `Order #${orderId} is now ${newStatus.toUpperCase()}. ${newStatus === 'shipped' ? 'Your order is on the way!' : newStatus === 'delivered' ? 'Delivered! Enjoy your purchase.' : 'We\'ll keep you updated.'}`;

    return this.sendSMS({
      to: customerPhone,
      message,
      type: 'order_status_update'
    });
  }

  // Check for low stock and send SMS alerts via Supabase
  static async checkAndSendLowStockAlerts(): Promise<void> {
    try {
      const { data: lowStockProducts, error } = await supabase
        .from('products')
        .select('*')
        .lte('stock', 5);

      if (error) {
        console.error('Error fetching low stock products:', error);
        alert('Error fetching products');
        return;
      }

      if (!lowStockProducts || lowStockProducts.length === 0) {
        alert('No low stock products found');
        return;
      }

      // Use default admin phone
      const defaultPhone = '+233505719507';
      await this.sendLowStockAlert(defaultPhone, lowStockProducts);

      console.log(`Low stock SMS alerts processed for ${lowStockProducts.length} products`);
    } catch (error) {
      console.error('Error checking low stock:', error);
      alert('Error sending alerts: ' + error);
    }
  }
}