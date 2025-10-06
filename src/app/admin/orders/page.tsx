"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { SMSService } from "../../../lib/smsService";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
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
          *,
          order_items (
            *,
            products (name, price, image_urls)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        setOrders([]);
      } else {
        setOrders(data || []);
      }
    } catch (error) {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    console.log('Updating order status:', orderId, 'to', newStatus);
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
        console.log('Order status updated successfully');
        
        // Send SMS notification to customer
        const order = orders.find(o => o.id === orderId);
        console.log('Found order for SMS:', order);
        console.log('Order phone:', order?.phone);
        
        if (order && order.phone) {
          try {
            console.log('Sending SMS to:', order.phone);
            await SMSService.sendOrderStatusUpdate(order.phone, orderId, newStatus);
          } catch (error) {
            console.error('SMS notification error:', error);
          }
        } else {
          console.log('No phone number found for order:', orderId);
          alert('No phone number found for this order');
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

  const filteredOrders = orders.filter(order => {
    if (statusFilter === "all") return true;
    return order.status === statusFilter;
  });

  const orderStats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => o.status === 'processing').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <div className="p-8">Loading orders...</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push("/admin")}
                className="text-blue-600 hover:text-blue-800"
              >
                ← Back to Dashboard
              </button>
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900">Order Management</h1>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
        {/* Order Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <p className="text-2xl font-bold text-gray-900">{orderStats.total}</p>
            <p className="text-sm text-gray-500">Total Orders</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <p className="text-2xl font-bold text-yellow-600">{orderStats.pending}</p>
            <p className="text-sm text-gray-500">Pending</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <p className="text-2xl font-bold text-blue-600">{orderStats.processing}</p>
            <p className="text-sm text-gray-500">Processing</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <p className="text-2xl font-bold text-purple-600">{orderStats.shipped}</p>
            <p className="text-sm text-gray-500">Shipped</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <p className="text-2xl font-bold text-green-600">{orderStats.delivered}</p>
            <p className="text-sm text-gray-500">Delivered</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <p className="text-2xl font-bold text-red-600">{orderStats.cancelled}</p>
            <p className="text-sm text-gray-500">Cancelled</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Orders List */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-medium text-gray-900">Orders</h3>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
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
                    <button
                      onClick={() => setShowBulkSMS(true)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
                    >
                      Send Bulk SMS
                    </button>
                  </div>
                )}
              </div>

              <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <div
                      key={order.id}
                      className={`p-6 hover:bg-gray-50 ${
                        selectedOrder?.id === order.id ? "bg-blue-50" : ""
                      } ${
                        selectedOrders.includes(order.id) ? "bg-green-50" : ""
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
                      
                      // Format phone numbers for WhatsApp
                      const phoneNumbers = selectedOrdersData.map(order => {
                        let phone = order.phone.replace(/[^0-9]/g, '');
                        if (phone.startsWith('0')) {
                          phone = '233' + phone.substring(1);
                        }
                        return phone;
                      });
                      
                      const broadcastMessage = `Orders have been ${bulkStatus.toUpperCase()}. ${bulkStatus === 'shipped' ? 'Your orders are on the way!' : bulkStatus === 'delivered' ? 'Delivered! Enjoy your purchases.' : 'We\'ll keep you updated.'}`;
                      
                      // Show broadcast instructions
                      const notification_div = document.createElement('div');
                      notification_div.className = 'fixed top-4 right-4 bg-blue-500 text-white p-4 rounded-lg shadow-lg z-50 max-w-lg';
                      notification_div.innerHTML = `
                        <div class="mb-2">📢 WhatsApp Broadcast Ready</div>
                        <div class="text-sm mb-3">Send to ${selectedOrdersData.length} customers via broadcast:</div>
                        
                        <div class="bg-white text-black p-3 rounded mb-3 text-sm">
                          <strong>Message:</strong><br>
                          ${broadcastMessage}
                        </div>
                        
                        <div class="bg-white text-black p-3 rounded mb-3 text-xs max-h-32 overflow-y-auto">
                          <strong>Phone Numbers:</strong><br>
                          ${phoneNumbers.join(', ')}
                        </div>
                        
                        <div class="text-xs mb-3 bg-yellow-100 text-yellow-800 p-2 rounded">
                          <strong>Instructions:</strong><br>
                          1. Copy the phone numbers above<br>
                          2. Open WhatsApp → New Broadcast<br>
                          3. Add these contacts to broadcast list<br>
                          4. Send the message above
                        </div>
                        
                        <div class="flex space-x-2">
                          <button onclick="navigator.clipboard.writeText('${phoneNumbers.join(', ')}'); this.innerText='Copied!'" class="flex-1 bg-green-500 hover:bg-green-600 px-3 py-1 rounded text-sm">
                            Copy Numbers
                          </button>
                          <button onclick="navigator.clipboard.writeText('${broadcastMessage}'); this.innerText='Copied!'" class="flex-1 bg-purple-500 hover:bg-purple-600 px-3 py-1 rounded text-sm">
                            Copy Message
                          </button>
                        </div>
                        
                        <button onclick="this.parentElement.remove()" class="mt-2 w-full bg-gray-500 hover:bg-gray-600 px-3 py-1 rounded text-sm">
                          Close
                        </button>
                      `;
                      document.body.appendChild(notification_div);
                      
                      // Store in database
                      await supabase.from('sms_notifications').insert([{
                        recipient_phone: phoneNumbers.join(', '),
                        message_content: broadcastMessage,
                        notification_type: 'order_status_update',
                        status: 'pending',
                        sent_at: new Date().toISOString()
                      }]);
                      
                      fetchOrders(); // Refresh orders
                    }
                    
                    setShowBulkSMS(false);
                    setBulkStatus("");
                    setSelectedOrders([]);
                  }}
                  disabled={!bulkStatus}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  Update & Send Broadcast
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