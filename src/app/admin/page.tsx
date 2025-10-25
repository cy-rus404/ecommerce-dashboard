"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminProtectedRoute from "../../components/AdminProtectedRoute";
import { AdminAuth } from "../../lib/adminAuth";
import { supabase } from "../../lib/supabase";

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
      
      if (error) {
        setOrderCount(0);
        setTotalRevenue(0);
        return;
      }
      
      setOrderCount(count || 0);
      
      const { data: revenueData, error: revenueError } = await supabase
        .from('orders')
        .select('total_amount')
        .eq('status', 'delivered');
      
      if (!revenueError && revenueData) {
        const revenue = revenueData.reduce((sum, order) => sum + parseFloat(order.total_amount), 0);
        setTotalRevenue(revenue);
      } else {
        setTotalRevenue(0);
      }
    } catch (error) {
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
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <span className="text-gray-700 dark:text-gray-300 text-sm sm:text-base hidden sm:block">Welcome, {user.email}</span>
              <span className="text-gray-700 dark:text-gray-300 text-sm sm:hidden">Admin</span>
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
            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">U</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Total Users</dt>
                      <dd className="text-lg font-medium text-gray-900 dark:text-white">{userCount}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">P</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Products</dt>
                      <dd className="text-lg font-medium text-gray-900 dark:text-white">{productCount}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">O</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Orders</dt>
                      <dd className="text-lg font-medium text-gray-900 dark:text-white">{orderCount}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">$</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Revenue</dt>
                      <dd className="text-lg font-medium text-gray-900 dark:text-white">₵{totalRevenue.toFixed(2)}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
            <div className="px-4 py-4 sm:px-6 sm:py-5">
              <h3 className="text-base sm:text-lg leading-6 font-medium text-gray-900 dark:text-white mb-3 sm:mb-4">
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
                  onClick={() => router.push("/admin/bulk-upload")}
                  className="bg-emerald-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-emerald-700 transition text-sm sm:text-base"
                >
                  📦 Bulk Upload
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
  );
}