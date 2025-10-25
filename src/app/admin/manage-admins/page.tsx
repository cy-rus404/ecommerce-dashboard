"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

import { AdminAuth } from "../../../lib/adminAuth";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'
);

export default function ManageAdmins() {
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentAdmin, setCurrentAdmin] = useState<any>(null);
  const [newAdmin, setNewAdmin] = useState({ email: "", name: "", role: "admin", password: "" });
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      
      // Check if user is admin
      if (user.email === 'admin@ecommerce.com') {
        setCurrentAdmin({ email: user.email, role: 'super_admin' });
        fetchAdmins();
      } else {
        alert("Only admins can manage admin users");
        router.push("/admin");
      }
    };
    checkAuth();
  }, [router]);

  const fetchAdmins = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching admins:", error);
      } else {
        setAdmins(data || []);
      }
    } catch (error) {
      console.error("Error fetching admins:", error);
    } finally {
      setLoading(false);
    }
  };

  const createAdmin = async () => {
    if (!newAdmin.email || !newAdmin.name || !newAdmin.password) {
      alert("Please fill in all fields");
      return;
    }

    if (newAdmin.password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    try {
      // Create Supabase auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newAdmin.email,
        password: newAdmin.password
      });

      if (authError) {
        alert("Error creating auth user: " + authError.message);
        return;
      }

      // Add to admin_users table
      const { error } = await supabase
        .from('admin_users')
        .insert([{
          email: newAdmin.email,
          name: newAdmin.name,
          role: newAdmin.role,
          created_by: currentAdmin?.email
        }]);

      if (error) {
        console.error("Error creating admin:", error);
        alert("Error creating admin: " + error.message);
      } else {
        alert(`Admin created successfully!\n\nCredentials:\nEmail: ${newAdmin.email}\nPassword: ${newAdmin.password}\n\nPlease share these credentials securely.`);
        setNewAdmin({ email: "", name: "", role: "admin", password: "" });
        fetchAdmins();
      }
    } catch (error) {
      console.error("Error creating admin:", error);
      alert("Error creating admin. Please try again.");
    }
  };

  const toggleAdminStatus = async (adminId: number, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('admin_users')
        .update({ is_active: !currentStatus })
        .eq('id', adminId);

      if (error) {
        console.error("Error updating admin status:", error);
      } else {
        fetchAdmins();
      }
    } catch (error) {
      console.error("Error updating admin status:", error);
    }
  };

  const deleteAdmin = async (adminId: number, adminEmail: string) => {
    if (!confirm(`Are you sure you want to permanently delete admin: ${adminEmail}?`)) {
      return;
    }

    try {
      // Delete from admin_users table
      const { error } = await supabase
        .from('admin_users')
        .delete()
        .eq('id', adminId);

      if (error) {
        console.error("Error deleting admin:", error);
        alert("Error deleting admin: " + error.message);
      } else {
        alert("Admin deleted successfully");
        fetchAdmins();
      }
    } catch (error) {
      console.error("Error deleting admin:", error);
      alert("Error deleting admin. Please try again.");
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

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
                <h1 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Manage Admins</h1>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Admin List */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
                <div className="px-6 py-4 border-b dark:border-gray-700">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Admin Users</h3>
                </div>
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {admins.map((admin) => (
                    <div key={admin.id} className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white">{admin.name}</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{admin.email}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              admin.role === 'super_admin' 
                                ? 'bg-purple-600 text-white' 
                                : 'bg-blue-600 text-white'
                            }`}>
                              {admin.role.replace('_', ' ')}
                            </span>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              admin.is_active 
                                ? 'bg-green-600 text-white' 
                                : 'bg-red-600 text-white'
                            }`}>
                              {admin.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          {admin.email !== currentAdmin?.email && (
                            <>
                              <button
                                onClick={() => toggleAdminStatus(admin.id, admin.is_active)}
                                className={`px-3 py-1 rounded text-xs font-medium ${
                                  admin.is_active
                                    ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                                    : 'bg-green-600 text-white hover:bg-green-700'
                                }`}
                              >
                                {admin.is_active ? 'Deactivate' : 'Activate'}
                              </button>
                              <button
                                onClick={() => deleteAdmin(admin.id, admin.email)}
                                className="px-3 py-1 rounded text-xs font-medium bg-red-600 text-white hover:bg-red-700"
                              >
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                        Created: {new Date(admin.created_at).toLocaleDateString()}
                        {admin.created_by && ` by ${admin.created_by}`}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Create Admin */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
              <div className="px-6 py-4 border-b dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Create New Admin</h3>
              </div>
              <div className="p-6 space-y-4">
                <input
                  type="email"
                  placeholder="Email"
                  value={newAdmin.email}
                  onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                  className="w-full p-3 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
                <input
                  type="text"
                  placeholder="Full Name"
                  value={newAdmin.name}
                  onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
                  className="w-full p-3 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
                <input
                  type="password"
                  placeholder="Password (min 6 characters)"
                  value={newAdmin.password}
                  onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                  className="w-full p-3 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  minLength={6}
                />
                <select
                  value={newAdmin.role}
                  onChange={(e) => setNewAdmin({ ...newAdmin, role: e.target.value })}
                  className="w-full p-3 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
                <button
                  onClick={createAdmin}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
                >
                  Create Admin
                </button>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Note: New admin must create account with this email first
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
  );
}