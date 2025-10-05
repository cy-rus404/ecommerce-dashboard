"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import AdminProtectedRoute from "../../components/AdminProtectedRoute";
import { AdminAuth } from "../../lib/adminAuth";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null);
  const [userCount, setUserCount] = useState(0);
  const [productCount, setProductCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
      } else {
        setUser(user);
        await fetchUserCount();
        await fetchProductCount();
        await fetchOrderStats();
      }
      setLoading(false);
    };
    getUser();
  }, [router]);

  const fetchUserCount = async () => {
    try {
      setUserCount(1); // Test user only (admin not counted as regular user)
      console.log('User count set to 1 (regular users only)');
    } catch (error) {
      console.error('Error setting user count:', error);
      setUserCount(0);
    }
  };

  const fetchProductCount = async () => {
    try {
      const { count, error } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.error('Error fetching product count:', error);
        setProductCount(0);
      } else {
        console.log('Product count:', count);
        setProductCount(count || 0);
      }
    } catch (error) {
      console.error('Error fetching product count:', error);
      setProductCount(0);
    }
  };

  const fetchOrderStats = async () => {
    try {
      const { count, error } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true });
      
      const { data: revenueData, error: revenueError } = await supabase
        .from('orders')
        .select('total_amount')
        .eq('status', 'delivered');
      
      if (error) {
        console.error('Error fetching order count:', error);
        setOrderCount(0);
      } else {
        console.log('Order count:', count);
        setOrderCount(count || 0);
      }
      
      if (!revenueError && revenueData) {
        const revenue = revenueData.reduce((sum, order) => sum + parseFloat(order.total_amount), 0);
        setTotalRevenue(revenue);
        console.log('Total revenue:', revenue);
      }
    } catch (error) {
      console.error('Error fetching order stats:', error);
      setOrderCount(0);
      setTotalRevenue(0);
    }
  };

  const handleLogout = async () => {
    const { token } = AdminAuth.getCurrentSession();
    if (token) {
      await AdminAuth.destroySession(token);
    }
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (loading || !user) return <div>Loading...</div>;

  return (
    <AdminProtectedRoute>
      <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900">Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <span className="text-gray-700 text-sm sm:text-base hidden sm:block">Welcome, {user.email}</span>
              <span className="text-gray-700 text-sm sm:hidden">Admin</span>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-3 sm:px-4 py-1 sm:py-2 rounded-lg hover:bg-red-700 transition text-sm sm:text-base"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
        <div className="py-4 sm:py-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">U</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                      <dd className="text-lg font-medium text-gray-900">{userCount}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">P</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Products</dt>
                      <dd className="text-lg font-medium text-gray-900">{productCount}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">O</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Orders</dt>
                      <dd className="text-lg font-medium text-gray-900">{orderCount}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">$</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Revenue</dt>
                      <dd className="text-lg font-medium text-gray-900">₵{totalRevenue.toFixed(2)}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-4 sm:px-6 sm:py-5">
              <h3 className="text-base sm:text-lg leading-6 font-medium text-gray-900 mb-3 sm:mb-4">
                Quick Actions
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
                <button 
                  onClick={() => router.push("/admin/manage-users")}
                  className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm sm:text-base"
                >
                  Manage Users
                </button>
                <button 
                  onClick={() => router.push("/admin/add-product")}
                  className="bg-green-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-green-700 transition text-sm sm:text-base"
                >
                  Add Product
                </button>
                <button 
                  onClick={() => router.push("/admin/view-products")}
                  className="bg-purple-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-purple-700 transition text-sm sm:text-base"
                >
                  View Products
                </button>
                <button 
                  onClick={() => router.push("/admin/analytics")}
                  className="bg-indigo-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-indigo-700 transition text-sm sm:text-base"
                >
                  Analytics
                </button>
                <button 
                  onClick={() => router.push("/admin/customer-management")}
                  className="bg-teal-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-teal-700 transition text-sm sm:text-base"
                >
                  Customers
                </button>
                <button 
                  onClick={() => router.push("/admin/orders")}
                  className="bg-yellow-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-yellow-700 transition text-sm sm:text-base"
                >
                  View Orders
                </button>
                <button 
                  onClick={() => router.push("/admin/manage-admins")}
                  className="bg-gray-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-700 transition text-sm sm:text-base"
                >
                  Manage Admins
                </button>
                <button 
                  onClick={() => router.push("/admin/delivery-zones")}
                  className="bg-orange-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-orange-700 transition text-sm sm:text-base"
                >
                  Delivery Zones
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      </div>
    </AdminProtectedRoute>
  );
}