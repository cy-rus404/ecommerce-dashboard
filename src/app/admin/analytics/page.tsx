"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Analytics() {
  const [analytics, setAnalytics] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 1,
    topProducts: [],
    recentActivity: [],
    categoryStats: [],
    stockAlerts: []
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("7days");
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
      } else {
        fetchAnalytics();
      }
    };
    checkAuth();
  }, [router, timeRange]);

  const fetchAnalytics = async () => {
    try {
      // Fetch products data
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('*');

      if (productsError) {
        console.error("Error fetching products:", productsError);
      }

      // Calculate analytics from products data
      const totalProducts = products?.length || 0;
      
      // Top products by price
      const topProducts = products
        ?.sort((a, b) => b.price - a.price)
        .slice(0, 5) || [];

      // Category statistics
      const categoryStats = products?.reduce((acc, product) => {
        const category = product.category || 'Other';
        if (!acc[category]) {
          acc[category] = { name: category, count: 0, avgPrice: 0 };
        }
        acc[category].count += 1;
        acc[category].avgPrice = (acc[category].avgPrice + product.price) / acc[category].count;
        return acc;
      }, {}) || {};

      // Stock alerts (low stock products)
      const stockAlerts = products?.filter(product => product.stock <= 5 && product.stock > 0) || [];

      // Recent activity (mock data based on products)
      const recentActivity = products?.slice(0, 5).map(product => ({
        id: product.id,
        action: 'Product Added',
        item: product.name,
        time: new Date(product.created_at).toLocaleDateString(),
        status: product.stock > 0 ? 'success' : 'warning'
      })) || [];

      // Fetch real order data
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('total_amount, status');
      
      const totalOrders = ordersData?.length || 0;
      const actualRevenue = ordersData
        ?.filter(order => order.status === 'delivered')
        .reduce((sum, order) => sum + parseFloat(order.total_amount), 0) || 0;

      setAnalytics({
        totalRevenue: actualRevenue,
        totalOrders,
        totalProducts,
        totalUsers: 1,
        topProducts,
        recentActivity,
        categoryStats: Object.values(categoryStats),
        stockAlerts
      });

    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8">Loading analytics...</div>;

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
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900">Analytics</h1>
            </div>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
            </select>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-green-600 font-bold">₵</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">₵{analytics.totalRevenue.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-blue-600 font-bold">📦</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.totalOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <span className="text-purple-600 font-bold">🛍️</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Products</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.totalProducts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <span className="text-yellow-600 font-bold">👥</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.totalUsers}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Top Products */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-medium text-gray-900">Top Products by Value</h3>
            </div>
            <div className="p-6">
              {analytics.topProducts.length > 0 ? (
                <div className="space-y-4">
                  {analytics.topProducts.map((product, index) => (
                    <div key={product.id} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-500 w-6">#{index + 1}</span>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">{product.name}</p>
                          <p className="text-sm text-gray-500">{product.stock} in stock</p>
                        </div>
                      </div>
                      <span className="text-sm font-medium text-gray-900">₵{product.price}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No products available</p>
              )}
            </div>
          </div>

          {/* Category Stats */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-medium text-gray-900">Category Performance</h3>
            </div>
            <div className="p-6">
              {analytics.categoryStats.length > 0 ? (
                <div className="space-y-4">
                  {analytics.categoryStats.map((category, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{category.name}</p>
                        <p className="text-sm text-gray-500">{category.count} products</p>
                      </div>
                      <span className="text-sm font-medium text-gray-900">₵{category.avgPrice.toFixed(2)} avg</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No categories available</p>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Stock Alerts */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-medium text-gray-900">Stock Alerts</h3>
            </div>
            <div className="p-6">
              {analytics.stockAlerts.length > 0 ? (
                <div className="space-y-3">
                  {analytics.stockAlerts.map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{product.name}</p>
                        <p className="text-sm text-yellow-600">Low stock warning</p>
                      </div>
                      <span className="text-sm font-bold text-yellow-600">{product.stock} left</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No stock alerts</p>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
            </div>
            <div className="p-6">
              {analytics.recentActivity.length > 0 ? (
                <div className="space-y-4">
                  {analytics.recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-3 ${
                        activity.status === 'success' ? 'bg-green-400' : 'bg-yellow-400'
                      }`}></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                        <p className="text-sm text-gray-500">{activity.item}</p>
                      </div>
                      <span className="text-sm text-gray-500">{activity.time}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No recent activity</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}