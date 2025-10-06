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
  // Send SMS notification directly
  static async sendSMS(notification: SMSNotification): Promise<boolean> {
    try {
      // Store SMS in database
      const { error } = await supabase
        .from('sms_notifications')
        .insert([{
          recipient_phone: notification.to,
          message_content: notification.message,
          notification_type: notification.type,
          status: 'pending',
          sent_at: new Date().toISOString()
        }]);

      if (error) {
        console.error('SMS storage failed');
      }

      // Format phone number for WhatsApp
      let phone = notification.to.replace(/[^0-9]/g, '');
      if (phone.startsWith('0')) {
        phone = '233' + phone.substring(1); // Convert Ghana format
      }
      
      const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(notification.message)}`;
      
      // Show WhatsApp popup
      if (typeof window !== 'undefined') {
        try {
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
          const messageDiv = document.createElement('div');
          messageDiv.className = 'mb-2';
          messageDiv.textContent = '📱 SMS Ready';
          
          const contentDiv = document.createElement('div');
          contentDiv.className = 'text-sm mb-3';
          contentDiv.textContent = notification.message;
          
          const whatsappLink = document.createElement('a');
          whatsappLink.href = whatsappUrl;
          whatsappLink.target = '_blank';
          whatsappLink.className = 'bg-green-500 hover:bg-green-600 px-3 py-1 rounded text-sm';
          whatsappLink.textContent = 'Send via WhatsApp';
          
          const closeButton = document.createElement('button');
          closeButton.className = 'ml-2 bg-gray-500 hover:bg-gray-600 px-3 py-1 rounded text-sm';
          closeButton.textContent = 'Close';
          closeButton.onclick = () => notification_div.remove();
          
          notification_div.appendChild(messageDiv);
          notification_div.appendChild(contentDiv);
          notification_div.appendChild(whatsappLink);
          notification_div.appendChild(closeButton);
          document.body.appendChild(notification_div);
          
          // Auto-remove after 15 seconds
          setTimeout(() => {
            if (document.body.contains(notification_div)) {
              document.body.removeChild(notification_div);
            }
          }, 15000);
        } catch (err) {
          console.error('Notification display failed');
          alert('SMS notification ready');
        }
      }

      return true;
    } catch (error) {
      console.error('SMS sending failed');
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
        console.error('Failed to fetch low stock products');
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

      console.log('Low stock SMS alerts processed successfully');
    } catch (error) {
      console.error('Low stock check failed');
      alert('Error sending alerts. Please try again.');
    }
  }
}