"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function CheckoutPage() {
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    address: "",
    city: "",
    deliveryZone: "",
    cardNumber: "4111111111111111",
    expiryDate: "12/25",
    cvv: "123"
  });
  const [deliveryZones, setDeliveryZones] = useState<any[]>([]);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
    } else {
      setUser(user);
      setFormData(prev => ({ ...prev, email: user.email || "" }));
      fetchCartItems(user.id);
      fetchDeliveryZones();
    }
  };

  const fetchCartItems = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('cart')
        .select(`
          *,
          products (
            id,
            name,
            price,
            discount_percentage,
            discount_start_date,
            discount_end_date
          )
        `)
        .eq('user_id', userId);

      if (!error && data) {
        setCartItems(data);
      }
    } catch (error) {
      // Handle error
    } finally {
      setLoading(false);
    }
  };

  const calculateItemPrice = (item: any) => {
    let price = parseFloat(item.products.price);
    
    if (item.products.discount_percentage && 
        item.products.discount_start_date && item.products.discount_end_date &&
        new Date() >= new Date(item.products.discount_start_date) && 
        new Date() <= new Date(item.products.discount_end_date)) {
      price = price * (1 - item.products.discount_percentage / 100);
    }
    
    return price * item.quantity;
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + calculateItemPrice(item), 0);
  };

  const getFinalTotal = () => {
    return getTotalPrice() + deliveryFee;
  };

  const fetchDeliveryZones = async () => {
    try {
      const { data, error } = await supabase
        .from('delivery_zones')
        .select('*')
        .eq('is_active', true)
        .order('zone_name');

      if (!error && data) {
        setDeliveryZones(data);
      }
    } catch (error) {
      // Handle error
    }
  };

  const handleZoneChange = (zoneId: string) => {
    const zone = deliveryZones.find(z => z.id.toString() === zoneId);
    setFormData({...formData, deliveryZone: zoneId});
    setDeliveryFee(zone ? parseFloat(zone.delivery_fee) : 0);
  };

  const processPayment = async () => {
    setProcessing(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    try {
      // Create order
      const orderData = {
        user_id: user.id,
        customer_email: formData.email,
        total_amount: getFinalTotal(),
        delivery_fee: deliveryFee,
        status: 'pending',
        shipping_address: `${formData.address}, ${formData.city}`,
        phone: formData.phone
      };

      console.log('Creating order with data:', orderData);

      const { data: newOrder, error: orderError } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();

      if (orderError) {
        console.error('Order creation error:', orderError);
        throw new Error('Failed to create order');
      }

      console.log('Order created successfully:', newOrder);

      // Create order items
      const orderItems = cartItems.map(item => ({
        order_id: newOrder.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: calculateItemPrice(item) / item.quantity,
        selected_size: item.selected_size,
        selected_color: item.selected_color
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('Order items creation error:', itemsError);
        throw new Error('Failed to create order items');
      }

      // Email functionality disabled for now

      // Clear cart after successful order creation
      await supabase
        .from('cart')
        .delete()
        .eq('user_id', user.id);

      alert('Payment successful! Order placed.');
      router.push('/my-orders');
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Error processing order. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <p className="text-gray-500 mb-4">Your cart is empty</p>
          <button
            onClick={() => router.push('/products')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <div>
                    <p className="font-medium">{item.products.name}</p>
                    <p className="text-sm text-gray-500">
                      Qty: {item.quantity}
                      {item.selected_size && ` • Size: ${item.selected_size}`}
                      {item.selected_color && ` • Color: ${item.selected_color}`}
                    </p>
                  </div>
                  <p className="font-semibold">₵{calculateItemPrice(item).toFixed(2)}</p>
                </div>
              ))}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>₵{getTotalPrice().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee:</span>
                  <span>₵{deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xl font-bold border-t pt-2">
                  <span>Total:</span>
                  <span>₵{getFinalTotal().toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Payment Details</h2>
            
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full p-3 border rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full p-3 border rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="w-full p-3 border rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                  className="w-full p-3 border rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Delivery Zone
                </label>
                <select
                  value={formData.deliveryZone}
                  onChange={(e) => handleZoneChange(e.target.value)}
                  className="w-full p-3 border rounded-lg"
                  required
                >
                  <option value="">Select Delivery Zone</option>
                  {deliveryZones.map((zone) => (
                    <option key={zone.id} value={zone.id}>
                      {zone.zone_name} - ₵{parseFloat(zone.delivery_fee).toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Payment Method</h3>
                
                <div className="space-y-2 mb-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="card"
                      checked={paymentMethod === "card"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-2"
                    />
                    Credit/Debit Card
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="momo"
                      checked={paymentMethod === "momo"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-2"
                    />
                    Mobile Money
                  </label>
                </div>

                {paymentMethod === "card" && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Card Number (Demo: 4111111111111111)
                      </label>
                      <input
                        type="text"
                        value={formData.cardNumber}
                        onChange={(e) => setFormData({...formData, cardNumber: e.target.value})}
                        className="w-full p-3 border rounded-lg"
                        placeholder="1234 5678 9012 3456"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Expiry Date
                        </label>
                        <input
                          type="text"
                          value={formData.expiryDate}
                          onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
                          className="w-full p-3 border rounded-lg"
                          placeholder="MM/YY"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          CVV
                        </label>
                        <input
                          type="text"
                          value={formData.cvv}
                          onChange={(e) => setFormData({...formData, cvv: e.target.value})}
                          className="w-full p-3 border rounded-lg"
                          placeholder="123"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === "momo" && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-800">
                      You will receive a prompt on your phone to complete the payment.
                    </p>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={processPayment}
                disabled={processing || !formData.deliveryZone}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold disabled:opacity-50"
              >
                {processing ? "Processing Payment..." : `Pay ₵${getFinalTotal().toFixed(2)}`}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}