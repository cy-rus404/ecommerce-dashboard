import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface EmailNotification {
  to: string;
  subject: string;
  html: string;
  type: 'order_confirmation' | 'low_stock_alert' | 'order_status_update';
}

export class EmailService {
  // Send email notification
  static async sendEmail(notification: EmailNotification): Promise<boolean> {
    try {
      // Store email in database for tracking
      const { error } = await supabase
        .from('email_notifications')
        .insert([{
          recipient_email: notification.to,
          subject: notification.subject,
          html_content: notification.html,
          notification_type: notification.type,
          status: 'sent',
          sent_at: new Date().toISOString()
        }]);

      if (error) {
        console.error('Error storing email notification:', error);
        return false;
      }

      // In a real app, you would integrate with an email service like:
      // - SendGrid, Mailgun, AWS SES, etc.
      // For now, we'll just log and store in database
      console.log('Email sent:', notification);
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }

  // Order confirmation email
  static async sendOrderConfirmation(
    customerEmail: string, 
    orderId: number, 
    orderTotal: number,
    orderItems: any[]
  ): Promise<boolean> {
    const subject = `Order Confirmation #${orderId}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Order Confirmation</h2>
        <p>Thank you for your order! Here are the details:</p>
        
        <div style="background: #f5f5f5; padding: 20px; margin: 20px 0;">
          <h3>Order #${orderId}</h3>
          <p><strong>Total: ₵${orderTotal.toFixed(2)}</strong></p>
        </div>
        
        <h3>Items Ordered:</h3>
        <ul>
          ${orderItems.map(item => `
            <li>${item.products?.name || 'Product'} - Qty: ${item.quantity} - ₵${item.price}</li>
          `).join('')}
        </ul>
        
        <p>We'll send you another email when your order ships.</p>
        <p>Thank you for shopping with us!</p>
      </div>
    `;

    return this.sendEmail({
      to: customerEmail,
      subject,
      html,
      type: 'order_confirmation'
    });
  }

  // Low stock alert email
  static async sendLowStockAlert(
    adminEmail: string,
    lowStockProducts: any[]
  ): Promise<boolean> {
    const subject = `Low Stock Alert - ${lowStockProducts.length} Products`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #d32f2f;">Low Stock Alert</h2>
        <p>The following products are running low on stock:</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead>
            <tr style="background: #f5f5f5;">
              <th style="border: 1px solid #ddd; padding: 12px; text-align: left;">Product</th>
              <th style="border: 1px solid #ddd; padding: 12px; text-align: left;">Current Stock</th>
              <th style="border: 1px solid #ddd; padding: 12px; text-align: left;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${lowStockProducts.map(product => `
              <tr>
                <td style="border: 1px solid #ddd; padding: 12px;">${product.name}</td>
                <td style="border: 1px solid #ddd; padding: 12px;">${product.stock}</td>
                <td style="border: 1px solid #ddd; padding: 12px;">
                  <span style="color: ${product.stock === 0 ? '#d32f2f' : '#f57c00'};">
                    ${product.stock === 0 ? 'Out of Stock' : 'Low Stock'}
                  </span>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <p>Please restock these items to avoid lost sales.</p>
        <p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/view-products" style="background: #1976d2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Manage Inventory</a></p>
      </div>
    `;

    return this.sendEmail({
      to: adminEmail,
      subject,
      html,
      type: 'low_stock_alert'
    });
  }

  // Order status update email
  static async sendOrderStatusUpdate(
    customerEmail: string,
    orderId: number,
    newStatus: string,
    trackingNumber?: string
  ): Promise<boolean> {
    const subject = `Order #${orderId} - ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`;
    let html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Order Status Update</h2>
        <p>Your order status has been updated:</p>
        
        <div style="background: #f5f5f5; padding: 20px; margin: 20px 0;">
          <h3>Order #${orderId}</h3>
          <p><strong>Status: ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}</strong></p>
          ${trackingNumber ? `<p><strong>Tracking Number: ${trackingNumber}</strong></p>` : ''}
        </div>
    `;

    if (newStatus === 'shipped') {
      html += `<p>Your order is on its way! ${trackingNumber ? 'Use the tracking number above to monitor your shipment.' : ''}</p>`;
    } else if (newStatus === 'delivered') {
      html += `<p>Your order has been delivered! We hope you enjoy your purchase.</p>`;
    } else if (newStatus === 'processing') {
      html += `<p>Your order is being prepared for shipment.</p>`;
    }

    html += `
        <p>Thank you for shopping with us!</p>
      </div>
    `;

    return this.sendEmail({
      to: customerEmail,
      subject,
      html,
      type: 'order_status_update'
    });
  }

  // Check for low stock and send alerts
  static async checkAndSendLowStockAlerts(): Promise<void> {
    try {
      // Get products with stock <= 5
      const { data: lowStockProducts, error } = await supabase
        .from('products')
        .select('*')
        .lte('stock', 5);

      if (error || !lowStockProducts || lowStockProducts.length === 0) {
        return;
      }

      // Get admin emails
      const { data: admins, error: adminError } = await supabase
        .from('admin_users')
        .select('email')
        .eq('is_active', true);

      if (adminError || !admins) {
        return;
      }

      // Send alerts to all active admins
      for (const admin of admins) {
        await this.sendLowStockAlert(admin.email, lowStockProducts);
      }

      console.log(`Low stock alerts sent for ${lowStockProducts.length} products`);
    } catch (error) {
      console.error('Error checking low stock:', error);
    }
  }
}