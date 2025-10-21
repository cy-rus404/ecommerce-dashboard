"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'
);

export default function Analytics() {
  const [analytics, setAnalytics] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 1,
    topProducts: [] as any[],
    recentActivity: [] as any[],
    categoryStats: [] as any[],
    stockAlerts: [] as any[],
    salesTrend: [] as any[],
    customerInsights: {} as any,
    orderStats: {} as any,
    conversionRate: 0,
    avgOrderValue: 0,
    topCustomers: [] as any[],
    monthlyGrowth: 0
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
        setupRealTimeSubscriptions();
      }
    };
    checkAuth();

    return () => {
      // Cleanup subscriptions
      supabase.removeAllChannels();
    };
  }, [router, timeRange]);

  const setupRealTimeSubscriptions = () => {
    // Real-time orders subscription
    const ordersChannel = supabase
      .channel('orders-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          console.log('Order change detected:', payload);
          fetchAnalytics(); // Refresh analytics when orders change
        }
      )
      .subscribe();

    // Real-time products subscription
    const productsChannel = supabase
      .channel('products-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        (payload) => {
          console.log('Product change detected:', payload);
          fetchAnalytics(); // Refresh analytics when products change
        }
      )
      .subscribe();

    // Real-time users subscription
    const usersChannel = supabase
      .channel('users-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'users' },
        (payload) => {
          console.log('User change detected:', payload);
          fetchAnalytics(); // Refresh analytics when users change
        }
      )
      .subscribe();
  };

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
      const categoryStats = products?.reduce((acc: Record<string, any>, product) => {
        const category = product.category || 'Other';
        if (!acc[category]) {
          acc[category] = { name: category, count: 0, avgPrice: 0 };
        }
        acc[category].count += 1;
        acc[category].avgPrice = (acc[category].avgPrice + product.price) / acc[category].count;
        return acc;
      }, {} as Record<string, any>) || {};

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

      // Fetch comprehensive order data with customer info
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('total_amount, status, created_at, customer_email, order_items(quantity, price)');
      
      const { data: usersData } = await supabase
        .from('users')
        .select('id, email, created_at');
      
      const totalOrders = ordersData?.length || 0;
      const totalUsers = usersData?.length || 1;
      const actualRevenue = ordersData
        ?.filter(order => order.status === 'delivered')
        .reduce((sum, order) => sum + parseFloat(order.total_amount), 0) || 0;
      
      // Calculate advanced metrics
      const avgOrderValue = totalOrders > 0 ? actualRevenue / totalOrders : 0;
      const conversionRate = totalUsers > 0 ? (totalOrders / totalUsers) * 100 : 0;
      
      // Sales trend (last 7 days)
      const salesTrend = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dayOrders = ordersData?.filter(order => 
          new Date(order.created_at).toDateString() === date.toDateString()
        ) || [];
        return {
          date: date.toLocaleDateString(),
          orders: dayOrders.length,
          revenue: dayOrders.reduce((sum, order) => sum + parseFloat(order.total_amount), 0)
        };
      }).reverse();
      
      // Order status breakdown
      const orderStats = ordersData?.reduce((acc: Record<string, number>, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};
      
      // Top customers by spending
      const customerSpending = ordersData?.reduce((acc: Record<string, any>, order) => {
        if (!acc[order.customer_email]) {
          acc[order.customer_email] = { email: order.customer_email, total: 0, orders: 0 };
        }
        acc[order.customer_email].total += parseFloat(order.total_amount);
        acc[order.customer_email].orders += 1;
        return acc;
      }, {} as Record<string, any>) || {};
      
      const topCustomers = Object.values(customerSpending)
        .sort((a: any, b: any) => b.total - a.total)
        .slice(0, 5);
      
      // Monthly growth calculation
      const thisMonth = new Date().getMonth();
      const lastMonth = thisMonth - 1;
      const thisMonthRevenue = ordersData?.filter(order => 
        new Date(order.created_at).getMonth() === thisMonth
      ).reduce((sum, order) => sum + parseFloat(order.total_amount), 0) || 0;
      const lastMonthRevenue = ordersData?.filter(order => 
        new Date(order.created_at).getMonth() === lastMonth
      ).reduce((sum, order) => sum + parseFloat(order.total_amount), 0) || 0;
      const monthlyGrowth = lastMonthRevenue > 0 ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0;

      setAnalytics({
        totalRevenue: actualRevenue,
        totalOrders,
        totalProducts,
        totalUsers,
        topProducts,
        recentActivity,
        categoryStats: Object.values(categoryStats),
        stockAlerts,
        salesTrend,
        customerInsights: { totalCustomers: totalUsers, newThisMonth: 0 },
        orderStats,
        conversionRate,
        avgOrderValue,
        topCustomers,
        monthlyGrowth
      });

    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8">Loading analytics...</div>;

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
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Advanced Analytics</h1>
            </div>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="p-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
            </select>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
        {/* Real-time Status Indicator */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Live Analytics</span>
          </div>
          <button
            onClick={fetchAnalytics}
            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
          >
            🔄 Refresh Data
          </button>
        </div>
        {/* Enhanced Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Total Revenue</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white truncate">₵{analytics.totalRevenue.toFixed(2)}</p>
                <p className={`text-xs sm:text-sm ${analytics.monthlyGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {analytics.monthlyGrowth >= 0 ? '↑' : '↓'} {Math.abs(analytics.monthlyGrowth).toFixed(1)}% from last month
                </p>
              </div>
              <div className="p-2 sm:p-3 bg-green-100 dark:bg-green-900 rounded-lg flex-shrink-0">
                <span className="text-green-600 dark:text-green-400 text-lg sm:text-2xl">₵</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Avg Order Value</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white truncate">₵{analytics.avgOrderValue.toFixed(2)}</p>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{analytics.totalOrders} total orders</p>
              </div>
              <div className="p-2 sm:p-3 bg-blue-100 dark:bg-blue-900 rounded-lg flex-shrink-0">
                <span className="text-blue-600 dark:text-blue-400 text-lg sm:text-2xl">📊</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Conversion Rate</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">{analytics.conversionRate.toFixed(1)}%</p>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{analytics.totalUsers} customers</p>
              </div>
              <div className="p-2 sm:p-3 bg-purple-100 dark:bg-purple-900 rounded-lg flex-shrink-0">
                <span className="text-purple-600 dark:text-purple-400 text-lg sm:text-2xl">🎯</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Products</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">{analytics.totalProducts}</p>
                <p className="text-xs sm:text-sm text-orange-600">{analytics.stockAlerts.length} low stock alerts</p>
              </div>
              <div className="p-2 sm:p-3 bg-orange-100 dark:bg-orange-900 rounded-lg flex-shrink-0">
                <span className="text-orange-600 dark:text-orange-400 text-lg sm:text-2xl">🛍️</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sales Trend Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6 sm:mb-8">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b dark:border-gray-700">
            <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white">Sales Trend (Last 7 Days)</h3>
          </div>
          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-7 gap-1 sm:gap-2 lg:gap-4">
              {analytics.salesTrend.map((day, index) => (
                <div key={index} className="text-center">
                  <div className="bg-blue-100 dark:bg-blue-900 rounded-lg p-2 sm:p-3 lg:p-4 mb-1 sm:mb-2">
                    <p className="text-sm sm:text-lg lg:text-2xl font-bold text-blue-600 dark:text-blue-400">{day.orders}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">orders</p>
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">₵{day.revenue.toFixed(0)}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">{day.date}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Status Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b dark:border-gray-700">
              <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white">Order Status</h3>
            </div>
            <div className="p-4 sm:p-6">
              {Object.entries(analytics.orderStats).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">{status}</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    status === 'delivered' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300' :
                    status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300' :
                    status === 'shipped' ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300' :
                    'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                  }`}>
                    {String(count)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Customers */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b dark:border-gray-700">
              <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white">Top Customers</h3>
            </div>
            <div className="p-4 sm:p-6">
              {analytics.topCustomers.map((customer: any, index) => (
                <div key={customer.email} className="flex items-center justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">#{index + 1}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{customer.email}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">₵{customer.total.toFixed(2)}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{customer.orders} orders</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Business Insights */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b dark:border-gray-700">
              <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white">Business Insights</h3>
            </div>
            <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
                <p className="text-sm font-medium text-blue-800 dark:text-blue-300">Revenue Growth</p>
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  {analytics.monthlyGrowth >= 0 ? 'Positive' : 'Negative'} trend this month
                </p>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-900 rounded-lg">
                <p className="text-sm font-medium text-green-800 dark:text-green-300">Customer Loyalty</p>
                <p className="text-xs text-green-600 dark:text-green-400">
                  {analytics.conversionRate.toFixed(1)}% conversion rate
                </p>
              </div>
              <div className="p-4 bg-orange-50 dark:bg-orange-900 rounded-lg">
                <p className="text-sm font-medium text-orange-800 dark:text-orange-300">Inventory Alert</p>
                <p className="text-xs text-orange-600 dark:text-orange-400">
                  {analytics.stockAlerts.length} products need restocking
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
          {/* Top Products */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b dark:border-gray-700">
              <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white">Top Products by Value</h3>
            </div>
            <div className="p-4 sm:p-6">
              {analytics.topProducts.length > 0 ? (
                <div className="space-y-4">
                  {analytics.topProducts.map((product, index) => (
                    <div key={product.id} className="flex items-center justify-between">
                      <div className="flex items-center flex-1 min-w-0">
                        <span className="text-sm font-medium text-gray-500 w-6 flex-shrink-0">#{index + 1}</span>
                        <div className="ml-3 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{product.name}</p>
                          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{product.stock} in stock</p>
                        </div>
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white flex-shrink-0">₵{product.price}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">No products available</p>
              )}
            </div>
          </div>

          {/* Category Stats */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b dark:border-gray-700">
              <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white">Category Performance</h3>
            </div>
            <div className="p-4 sm:p-6">
              {analytics.categoryStats.length > 0 ? (
                <div className="space-y-4">
                  {analytics.categoryStats.map((category, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{category.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{category.count} products</p>
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">₵{category.avgPrice.toFixed(2)} avg</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">No categories available</p>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          {/* Stock Alerts */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b dark:border-gray-700">
              <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white">Stock Alerts</h3>
            </div>
            <div className="p-4 sm:p-6">
              {analytics.stockAlerts.length > 0 ? (
                <div className="space-y-3">
                  {analytics.stockAlerts.map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900 rounded-lg">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{product.name}</p>
                        <p className="text-xs sm:text-sm text-yellow-600 dark:text-yellow-400">Low stock warning</p>
                      </div>
                      <span className="text-sm font-bold text-yellow-600 dark:text-yellow-400 flex-shrink-0">{product.stock} left</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">No stock alerts</p>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b dark:border-gray-700">
              <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white">Recent Activity</h3>
            </div>
            <div className="p-4 sm:p-6">
              {analytics.recentActivity.length > 0 ? (
                <div className="space-y-4">
                  {analytics.recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-3 flex-shrink-0 ${
                        activity.status === 'success' ? 'bg-green-400' : 'bg-yellow-400'
                      }`}></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.action}</p>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">{activity.item}</p>
                      </div>
                      <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 flex-shrink-0">{activity.time}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">No recent activity</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}