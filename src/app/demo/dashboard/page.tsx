"use client";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { DemoAuth } from "../../../lib/demoAuth";
import { useEffect } from "react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function DemoDashboard() {
  const router = useRouter();

  useEffect(() => {
    // Ensure user is in demo mode
    if (!DemoAuth.isDemoSession()) {
      router.push('/login');
    }
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">Demo Experience</h1>
              <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                DEMO MODE
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, Demo User</span>
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
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Experience Both Sides</h2>
            <p className="text-gray-600 mb-6">
              Try our platform from both customer and admin perspectives. All actions are simulated - no real data is affected.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="bg-white overflow-hidden shadow rounded-lg cursor-pointer hover:shadow-lg transition" 
                 onClick={() => router.push('/products')}>
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-xl">🛍️</span>
                    </div>
                  </div>
                  <div className="ml-5">
                    <h3 className="text-lg font-medium text-gray-900">Customer Experience</h3>
                    <p className="text-sm text-gray-500 mt-1">Browse products, add to cart, and experience the shopping flow</p>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center text-sm text-blue-600">
                    <span>Try Shopping →</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg cursor-pointer hover:shadow-lg transition" 
                 onClick={() => router.push('/demo/admin')}>
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-green-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-xl">⚙️</span>
                    </div>
                  </div>
                  <div className="ml-5">
                    <h3 className="text-lg font-medium text-gray-900">Admin Experience</h3>
                    <p className="text-sm text-gray-500 mt-1">Manage products, view analytics, and explore admin features</p>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center text-sm text-green-600">
                    <span>Try Admin Panel →</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 bg-orange-50 border border-orange-200 rounded-lg p-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-orange-400 text-xl">ℹ️</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-orange-800">Demo Mode Features</h3>
                <div className="mt-2 text-sm text-orange-700">
                  <ul className="list-disc list-inside space-y-1">
                    <li>Browse real product data as a customer</li>
                    <li>See the admin interface design</li>
                    <li>View statistics and dashboards</li>
                    <li>Management actions are restricted for security</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}