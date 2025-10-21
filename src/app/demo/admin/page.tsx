"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DemoAuth } from "../../../lib/demoAuth";
import { supabase } from "../../../lib/supabase";

export default function DemoAdminDashboard() {
  const [userCount, setUserCount] = useState(0);
  const [productCount, setProductCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkDemoAuth = async () => {
      const isDemo = await DemoAuth.isDemoSession();
      if (!isDemo) {
        router.push('/login');
        return;
      }
      fetchStats();
    };
    
    checkDemoAuth();
  }, [router]);

  const fetchStats = async () => {
    try {
      const { count: products } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });
      
      setProductCount(products || 0);
      setUserCount(25); // Demo user count
      setOrderCount(12); // Demo order count
      setTotalRevenue(1250.50); // Demo revenue
    } catch (error) {
      console.log('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const showDemoAlert = (feature: string) => {
    DemoAuth.showDemoNotification(`${feature} - Action blocked in demo mode`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/demo/dashboard')}
                className="text-blue-600 hover:text-blue-800"
              >
                ← Back to Demo Dashboard
              </button>
              <h1 className="text-xl font-semibold text-gray-900">Demo Admin Panel</h1>
              <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                DEMO MODE
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Demo Admin</span>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="py-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
            <div className="px-6 py-5">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Admin Features (Demo Mode)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <button 
                  onClick={() => router.push('/demo/admin/add-product')}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition text-sm"
                >
                  ➕ Add Product (Demo)
                </button>
                <button 
                  onClick={() => router.push('/demo/admin/products')}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition text-sm"
                >
                  📋 View Products (Demo)
                </button>
                <button 
                  onClick={() => showDemoAlert("Analytics")}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition text-sm opacity-75 cursor-not-allowed"
                >
                  📊 Analytics (Demo)
                </button>
                <button 
                  onClick={() => showDemoAlert("Manage Users")}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm opacity-75 cursor-not-allowed"
                >
                  👥 Manage Users (Demo)
                </button>
                <button 
                  onClick={() => showDemoAlert("View Orders")}
                  className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition text-sm opacity-75 cursor-not-allowed"
                >
                  🛒 View Orders (Demo)
                </button>
                <button 
                  onClick={() => showDemoAlert("Bulk Upload")}
                  className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition text-sm opacity-75 cursor-not-allowed"
                >
                  📦 Bulk Upload (Demo)
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-orange-400">⚠️</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-orange-800">Demo Admin Panel - Limited Access</h3>
                <div className="mt-2 text-sm text-orange-700">
                  <p>This is a restricted demo version. You can see the admin interface and statistics, but most management features are disabled to protect the real system.</p>
                  <ul className="mt-2 list-disc list-inside">
                    <li>View real product statistics</li>
                    <li>See admin interface design</li>
                    <li>Management actions are blocked</li>
                    <li>No real data modifications allowed</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}