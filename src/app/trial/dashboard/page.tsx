"use client";
import { useRouter } from "next/navigation";
import TrialProtectedRoute from "../../../components/TrialProtectedRoute";

export default function TrialDashboard() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('trial_session');
    router.push('/trial');
  };

  const navigateToFullSite = (path: string) => {
    // Navigate to actual site pages but maintain trial context
    router.push(path);
  };

  return (
    <TrialProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center space-x-4">
                <h1 className="text-xl font-semibold text-gray-900">Trial Dashboard</h1>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  FULL ACCESS DEMO
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigateToFullSite('/products')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm"
                >
                  Customer Store
                </button>
                <button
                  onClick={() => navigateToFullSite('/admin')}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition text-sm"
                >
                  Admin Panel
                </button>
                <button
                  onClick={handleLogout}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              <div className="bg-white overflow-hidden shadow rounded-lg cursor-pointer hover:shadow-lg transition" onClick={() => navigateToFullSite('/products')}>
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                        <span className="text-white text-sm">🛍️</span>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Products Store</dt>
                        <dd className="text-lg font-medium text-gray-900">Browse & Shop</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg cursor-pointer hover:shadow-lg transition" onClick={() => navigateToFullSite('/admin')}>
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                        <span className="text-white text-sm">⚙️</span>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Admin Panel</dt>
                        <dd className="text-lg font-medium text-gray-900">Manage Store</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                        <span className="text-white text-sm">📊</span>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Demo Data</dt>
                        <dd className="text-lg font-medium text-gray-900">Sample Only</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Available Features
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50" onClick={() => navigateToFullSite('/products')}>
                    <h4 className="font-medium text-gray-900">🛍️ Customer Store</h4>
                    <p className="text-sm text-gray-600 mt-1">Browse products, add to cart, checkout</p>
                  </div>
                  <div className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50" onClick={() => navigateToFullSite('/admin')}>
                    <h4 className="font-medium text-gray-900">⚙️ Admin Dashboard</h4>
                    <p className="text-sm text-gray-600 mt-1">Manage products, orders, users</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="text-yellow-400">⚠️</span>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">Trial Mode Notice</h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>Full access demo - use all features exactly like the main site. Actions are simulated and won't affect real data.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TrialProtectedRoute>
  );
}