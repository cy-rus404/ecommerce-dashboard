"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { logger } from "../../lib/logger";
import { VALIDATION_LIMITS } from "../../lib/constants";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function CheckoutPage() {
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  const [user, setUser] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [formData, setFormData] = useState({
    email: "",
    notificationEmail: "",
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
      setFormData(prev => ({ 
        ...prev, 
        email: user.email || "",
        notificationEmail: user.email || ""
      }));
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

  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    
    // Email validation
    if (!formData.email) errors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = "Invalid email format";
    else if (formData.email.length > VALIDATION_LIMITS.EMAIL_MAX) errors.email = "Email too long";
    
    // Notification email validation
    if (!formData.notificationEmail) errors.notificationEmail = "Notification email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.notificationEmail)) errors.notificationEmail = "Invalid notification email format";
    else if (formData.notificationEmail.length > VALIDATION_LIMITS.EMAIL_MAX) errors.notificationEmail = "Email too long";
    
    // Phone validation
    if (!formData.phone) errors.phone = "Phone number is required";
    else if (!/^[+]?[0-9\s\-()]{10,15}$/.test(formData.phone)) errors.phone = "Invalid phone number format";
    
    // Address validation
    if (!formData.address) errors.address = "Address is required";
    else if (formData.address.length > VALIDATION_LIMITS.ADDRESS_MAX) errors.address = "Address too long";
    
    // City validation
    if (!formData.city) errors.city = "City is required";
    else if (formData.city.length > VALIDATION_LIMITS.CITY_MAX) errors.city = "City name too long";
    
    if (!formData.deliveryZone) errors.deliveryZone = "Please select a delivery zone";
    
    // Payment validation
    if (paymentMethod === "card") {
      if (!formData.cardNumber) errors.cardNumber = "Card number is required";
      else if (!/^[0-9\s]{13,19}$/.test(formData.cardNumber.replace(/\s/g, ''))) errors.cardNumber = "Invalid card number";
      
      if (!formData.expiryDate) errors.expiryDate = "Expiry date is required";
      else if (!/^(0[1-9]|1[0-2])\/([0-9]{2})$/.test(formData.expiryDate)) errors.expiryDate = "Invalid expiry date (MM/YY)";
      
      if (!formData.cvv) errors.cvv = "CVV is required";
      else if (!/^[0-9]{3,4}$/.test(formData.cvv)) errors.cvv = "Invalid CVV";
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const processPayment = async () => {
    if (!validateForm()) {
      setError("Please fill in all required fields correctly.");
      return;
    }
    
    setProcessing(true);
    setError(null);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    try {
      // Create order
      const orderData = {
        user_id: user.id,
        customer_email: formData.notificationEmail, // Use notification email for order updates
        total_amount: getFinalTotal(),
        delivery_fee: deliveryFee,
        status: 'pending',
        shipping_address: `${formData.address}, ${formData.city}`,
        phone: formData.phone
      };

      logger.info('Creating order', { userId: user.id, total: getFinalTotal() });

      const { data: newOrder, error: orderError } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();

      if (orderError) {
        logger.error('Order creation failed', { error: orderError.message });
        throw new Error('Failed to create order');
      }

      logger.info('Order created successfully', { orderId: newOrder.id });

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
        logger.error('Order items creation failed', { error: itemsError.message });
        throw new Error('Failed to create order items');
      }

      // Reduce stock for each product
      for (const item of cartItems) {
        const { error: stockError } = await supabase.rpc('reduce_product_stock', {
          product_id: item.product_id,
          quantity_to_reduce: item.quantity
        });
        
        if (stockError) {
          logger.error('Stock reduction failed', { productId: item.product_id, error: stockError.message });
        }
      }

      // Send email order confirmation to customer
      if (formData.notificationEmail) {
        try {
          const EmailJS = await import('@emailjs/browser');
          const emailjs = EmailJS.default;
          emailjs.init({ publicKey: 'FEIXpFEr5PuvhR_6g' });
          
          const message = `Order confirmed! #${newOrder.id} - Total: ₵${getFinalTotal().toFixed(2)}. We'll update you when it ships. Thank you!`;
          
          await emailjs.send('service_ls40okk', 'template_9enxem8', {
            to_email: formData.notificationEmail,
            message: message,
            order_id: newOrder.id
          });
          
          logger.info('Order confirmation email sent', { email: formData.notificationEmail });
        } catch (error) {
          logger.error('Order confirmation email failed', { error });
        }
      }

      // Clear cart after successful order creation
      await supabase
        .from('cart')
        .delete()
        .eq('user_id', user.id);

      // Show success message
      const successDiv = document.createElement('div');
      successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg z-50';
      successDiv.innerHTML = '✓ Payment successful! Redirecting to your orders...';
      document.body.appendChild(successDiv);
      
      setTimeout(() => {
        document.body.removeChild(successDiv);
        router.push('/my-orders');
      }, 2000);
    } catch (error) {
      logger.error('Checkout process failed', { error });
      setError('Failed to process your order. Please try again or contact support if the problem persists.');
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
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                <div className="flex items-center">
                  <span className="text-red-500 mr-2">⚠️</span>
                  {error}
                </div>
              </div>
            )}
            
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({...formData, email: e.target.value});
                    if (validationErrors.email) {
                      setValidationErrors({...validationErrors, email: ''});
                    }
                  }}
                  className={`w-full p-3 border rounded-lg ${
                    validationErrors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  maxLength={100}
                  autoComplete="email"
                  required
                />
                {validationErrors.email && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notification Email * <span className="text-sm text-gray-500">(for order updates)</span>
                </label>
                <input
                  type="email"
                  value={formData.notificationEmail}
                  onChange={(e) => {
                    setFormData({...formData, notificationEmail: e.target.value});
                    if (validationErrors.notificationEmail) {
                      setValidationErrors({...validationErrors, notificationEmail: ''});
                    }
                  }}
                  className={`w-full p-3 border rounded-lg ${
                    validationErrors.notificationEmail ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Enter your active email for order updates"
                  maxLength={100}
                  autoComplete="email"
                  required
                />
                {validationErrors.notificationEmail && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.notificationEmail}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => {
                    setFormData({...formData, phone: e.target.value});
                    if (validationErrors.phone) {
                      setValidationErrors({...validationErrors, phone: ''});
                    }
                  }}
                  className={`w-full p-3 border rounded-lg ${
                    validationErrors.phone ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  pattern="[+]?[0-9\s\-()]{10,15}"
                  maxLength={15}
                  autoComplete="tel"
                  required
                />
                {validationErrors.phone && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.phone}</p>
                )}
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
                disabled={processing || cartItems.length === 0}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold disabled:opacity-50 transition flex items-center justify-center"
              >
                {processing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Processing Payment...
                  </>
                ) : (
                  `Pay ₵${getFinalTotal().toFixed(2)}`
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}