"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { SMSService } from "../../../lib/smsService";
import { logger } from "../../../lib/logger";
import { ORDER_STATUS, EMAIL_CONFIG, QUERY_LIMITS } from "../../../lib/constants";
// Import EmailJS dynamically to avoid SSR issues
let emailjs: any = null;

// Initialize EmailJS on client side
if (typeof window !== 'undefined') {
  import('@emailjs/browser').then((EmailJS) => {
    emailjs = EmailJS.default;
    emailjs.init({
      publicKey: 'FEIXpFEr5PuvhR_6g'
    });
  }).catch((error) => {
    console.error('EmailJS import error:', error);
  });
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'
);

export default function OrderManagement() {
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrders, setSelectedOrders] = useState<number[]>([]);
  const [showBulkSMS, setShowBulkSMS] = useState(false);
  const [bulkStatus, setBulkStatus] = useState("");
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
      } else {
        fetchOrders();
      }
    };
    checkAuth();
  }, [router]);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id, customer_email, total_amount, status, created_at, phone,
          order_items!inner (
            id, quantity, price,
            products!inner (name, price, image_urls)
          )
        `)
        .order('created_at', { ascending: false })
        .limit(QUERY_LIMITS.ORDERS_LIMIT);

      if (error) {
        logger.error('Failed to fetch orders', { error: error.message });
        setOrders([]);
      } else {
        logger.info('Orders fetched successfully', { count: data?.length || 0 });
        setOrders(data || []);
      }
    } catch (error) {
      logger.error('Orders fetch error', { error });
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) {
        console.error('Order update error:', error);
        alert("Error updating order status");
      } else {
        
        // Send email notification to customer
        const order = orders.find(o => o.id === orderId);
        
        if (order && order.customer_email) {
          try {
            if (!emailjs) {
              const EmailJS = await import('@emailjs/browser');
              emailjs = EmailJS.default;
              emailjs.init({ publicKey: 'FEIXpFEr5PuvhR_6g' });
            }
            
            const message = `Your order #${orderId} has been ${newStatus.toUpperCase()}. ${newStatus === 'shipped' ? 'Your order is on the way!' : newStatus === 'delivered' ? 'Delivered! Enjoy your purchase.' : 'We\'ll keep you updated.'}`;
            
            await emailjs.send('service_ls40okk', 'template_9enxem8', {
              to_email: order.customer_email,
              message: message,
              order_id: orderId
            });
            
          } catch (error) {
            console.error('Email notification error:', error);
          }
        } else {
        }
        
        fetchOrders();
        if (selectedOrder?.id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: newStatus });
        }
      }
    } catch (error) {
      console.error('Update order status error:', error);
    }
  };

  const filteredOrders = useMemo(() => {
    if (statusFilter === "all") return orders;
    return orders.filter(order => order.status === statusFilter);
  }, [orders, statusFilter]);

  const orderStats = useMemo(() => {
    const stats = { total: 0, pending: 0, processing: 0, shipped: 0, delivered: 0, cancelled: 0 };
    orders.forEach(order => {
      stats.total++;
      stats[order.status as keyof typeof stats]++;
    });
    return stats;
  }, [orders]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-600 text-white';
      case 'processing': return 'bg-blue-600 text-white';
      case 'shipped': return 'bg-purple-600 text-white';
      case 'delivered': return 'bg-green-600 text-white';
      case 'cancelled': return 'bg-red-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  if (loading) return <div className="p-8">Loading orders...</div>;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push("/admin")}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
              >
                ← Back to Dashboard
              </button>
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Order Management</h1>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
        {/* Order Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{orderStats.total}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Orders</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow text-center">
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{orderStats.pending}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Pending</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow text-center">
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{orderStats.processing}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Processing</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow text-center">
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{orderStats.shipped}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Shipped</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow text-center">
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{orderStats.delivered}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Delivered</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow text-center">
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">{orderStats.cancelled}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Cancelled</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Orders List */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
              <div className="px-6 py-4 border-b dark:border-gray-700">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Orders</h3>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="p-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="all">All Orders</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                {selectedOrders.length > 0 && (
                  <div className="flex items-center justify-between bg-blue-50 p-3 rounded-lg">
                    <span className="text-sm text-blue-800">{selectedOrders.length} orders selected</span>
                    <div className="flex space-x-2">
                      <button
                        onClick={async () => {
                          try {
                            if (!emailjs) {
                              const EmailJS = await import('@emailjs/browser');
                              emailjs = EmailJS.default;
                              emailjs.init({ publicKey: 'FEIXpFEr5PuvhR_6g' });
                            }
                            const result = await emailjs.send('service_ls40okk', 'template_9enxem8', {
                              to_email: 'test@example.com',
                              message: 'Test message',
                              order_id: '999'
                            });
                            alert('Test email sent successfully!');
                          } catch (error) {
                            alert('Test email failed: ' + JSON.stringify(error));
                            console.error('Test error:', error);
                          }
                        }}
                        className="bg-green-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-green-700"
                      >
                        Test Email
                      </button>
                      <button
                        onClick={() => setShowBulkSMS(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
                      >
                        Send Bulk SMS
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <div
                      key={order.id}
                      className={`p-6 hover:bg-gray-50 dark:hover:bg-gray-700 ${
                        selectedOrder?.id === order.id ? "bg-blue-50 dark:bg-blue-900" : ""
                      } ${
                        selectedOrders.includes(order.id) ? "bg-green-50 dark:bg-green-900" : ""
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={selectedOrders.includes(order.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedOrders([...selectedOrders, order.id]);
                            } else {
                              setSelectedOrders(selectedOrders.filter(id => id !== order.id));
                            }
                          }}
                          className="rounded"
                        />
                        <div className="flex-1 cursor-pointer" onClick={() => setSelectedOrder(order)}>
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h4 className="text-sm font-medium text-gray-900">
                                Order #{order.id}
                              </h4>
                              <p className="text-sm text-gray-500">{order.customer_email}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-gray-900">₵{order.total_amount}</p>
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                                {order.status}
                              </span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center text-sm text-gray-500">
                            <span>{order.order_items?.length || 0} items</span>
                            <span>{new Date(order.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-gray-500">
                    No orders found
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Order Details */}
          <div>
            {selectedOrder ? (
              <div className="space-y-6">
                <div className="bg-white shadow rounded-lg">
                  <div className="px-6 py-4 border-b">
                    <h3 className="text-lg font-medium text-gray-900">Order Details</h3>
                  </div>
                  <div className="p-6">
                    <dl className="space-y-3">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Order ID</dt>
                        <dd className="text-sm text-gray-900">#{selectedOrder.id}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Customer</dt>
                        <dd className="text-sm text-gray-900">{selectedOrder.customer_email}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Total Amount</dt>
                        <dd className="text-sm text-gray-900">₵{selectedOrder.total_amount}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Status</dt>
                        <dd>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedOrder.status)}`}>
                            {selectedOrder.status}
                          </span>
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Order Date</dt>
                        <dd className="text-sm text-gray-900">
                          {new Date(selectedOrder.created_at).toLocaleString()}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>

                {/* Order Items */}
                <div className="bg-white shadow rounded-lg">
                  <div className="px-6 py-4 border-b">
                    <h3 className="text-lg font-medium text-gray-900">Order Items</h3>
                  </div>
                  <div className="p-6">
                    {selectedOrder.order_items?.map((item: any, index: number) => (
                      <div key={index} className="flex items-center space-x-4 py-3 border-b last:border-b-0">
                        {item.products?.image_urls?.[0] && (
                          <img
                            src={item.products.image_urls[0]}
                            alt={item.products.name}
                            className="w-12 h-12 rounded object-cover"
                          />
                        )}
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{item.products?.name}</p>
                          <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                        </div>
                        <p className="text-sm font-medium text-gray-900">₵{item.price}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status Update */}
                <div className="bg-white shadow rounded-lg">
                  <div className="px-6 py-4 border-b">
                    <h3 className="text-lg font-medium text-gray-900">Update Status</h3>
                  </div>
                  <div className="p-6 space-y-3">
                    <button
                      onClick={() => updateOrderStatus(selectedOrder.id, 'processing')}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
                    >
                      Mark as Processing
                    </button>
                    <button
                      onClick={() => updateOrderStatus(selectedOrder.id, 'shipped')}
                      className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700"
                    >
                      Mark as Shipped
                    </button>
                    <button
                      onClick={() => updateOrderStatus(selectedOrder.id, 'delivered')}
                      className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
                    >
                      Mark as Delivered
                    </button>
                    <button
                      onClick={() => updateOrderStatus(selectedOrder.id, 'cancelled')}
                      className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700"
                    >
                      Cancel Order
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white shadow rounded-lg p-6 text-center text-gray-500">
                Select an order to view details
              </div>
            )}
          </div>
        </div>

        {/* Bulk SMS Modal */}
        {showBulkSMS && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold mb-4">Send Bulk Status Update</h3>
              <p className="text-sm text-gray-600 mb-4">
                Update status for {selectedOrders.length} selected orders
              </p>
              <select
                value={bulkStatus}
                onChange={(e) => setBulkStatus(e.target.value)}
                className="w-full p-3 border rounded-lg mb-4"
              >
                <option value="">Select Status</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <div className="flex space-x-3 mt-4">
                <button
                  onClick={async () => {
                    const selectedOrdersData = orders.filter(o => selectedOrders.includes(o.id) && o.phone);
                    
                    if (selectedOrdersData.length > 0 && bulkStatus) {
                      // Update all order statuses in database
                      for (const order of selectedOrdersData) {
                        await supabase.from('orders').update({ 
                          status: bulkStatus,
                          updated_at: new Date().toISOString()
                        }).eq('id', order.id);
                      }
                      
                      // Send real SMS using SMSGateway.me free tier
                      let successCount = 0;
                      let failCount = 0;
                      
                      // Show sending progress
                      const progressDiv = document.createElement('div');
                      progressDiv.className = 'fixed top-4 right-4 bg-blue-500 text-white p-4 rounded-lg shadow-lg z-50';
                      progressDiv.innerHTML = `
                        <div class="mb-2">📧 Sending Emails via EmailJS...</div>
                        <div class="text-sm">Processing ${selectedOrdersData.length} messages</div>
                      `;
                      document.body.appendChild(progressDiv);
                      
                      for (const order of selectedOrdersData) {
                        const message = `Your order #${order.id} has been ${bulkStatus.toUpperCase()}. ${bulkStatus === 'shipped' ? 'Your order is on the way!' : bulkStatus === 'delivered' ? 'Delivered! Enjoy your purchase.' : 'We\'ll keep you updated.'}`;
                        
                        // Check if we have customer email
                        
                        if (!order.customer_email) {
                          failCount++;
                          continue;
                        }
                        
                        try {
                          
                          if (!emailjs) {
                            // Try to load EmailJS if not loaded
                            const EmailJS = await import('@emailjs/browser');
                            emailjs = EmailJS.default;
                            emailjs.init({
              publicKey: 'FEIXpFEr5PuvhR_6g'
            });
                          }
                          
                          // Test with minimal data first
                          
                          const result = await emailjs.send(
                            'service_ls40okk',
                            'template_9enxem8',
                            {
                              to_email: order.customer_email,
                              message: 'Test message',
                              order_id: '123'
                            }
                          );
                          
                          successCount++;
                          
                        } catch (error) {
                          failCount++;
                          console.error('EmailJS error:', error);
                        }
                        
                        // Small delay between messages
                        await new Promise(resolve => setTimeout(resolve, 500));
                      }
                      
                      // Remove progress and show results
                      document.body.removeChild(progressDiv);
                      
                      const notification_div = document.createElement('div');
                      notification_div.className = 'fixed top-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg z-50';
                      notification_div.innerHTML = `
                        <div class="mb-2">✓ EmailJS Results</div>
                        <div class="text-sm">
                          ✓ ${successCount} emails sent successfully<br>
                          ${failCount > 0 ? `✗ ${failCount} emails failed` : ''}
                        </div>
                        <button onclick="this.parentElement.remove()" class="mt-2 bg-white text-green-500 px-3 py-1 rounded text-sm">
                          Close
                        </button>
                      `;
                      document.body.appendChild(notification_div);
                      
                      setTimeout(() => {
                        if (document.body.contains(notification_div)) {
                          document.body.removeChild(notification_div);
                        }
                      }, 5000);
                      
                      fetchOrders(); // Refresh orders
                    }
                    
                    setShowBulkSMS(false);
                    setBulkStatus("");
                    setSelectedOrders([]);
                  }}
                  disabled={!bulkStatus}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  Update & Send SMS
                </button>
                <button
                  onClick={() => {
                    setShowBulkSMS(false);
                    setBulkStatus("");
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}