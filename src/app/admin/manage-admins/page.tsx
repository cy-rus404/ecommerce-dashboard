"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import AdminProtectedRoute from "../../../components/AdminProtectedRoute";
import { AdminAuth } from "../../../lib/adminAuth";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ManageAdmins() {
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentAdmin, setCurrentAdmin] = useState<any>(null);
  const [newAdmin, setNewAdmin] = useState({ email: "", name: "", role: "admin" });
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const { email } = AdminAuth.getCurrentSession();
      if (email) {
        const adminUser = await AdminAuth.getAdminUser(email);
        setCurrentAdmin(adminUser);
        if (adminUser?.role === 'super_admin') {
          fetchAdmins();
        } else {
          alert("Only super admins can manage admin users");
          router.push("/admin");
        }
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
    if (!newAdmin.email || !newAdmin.name) {
      alert("Please fill in all fields");
      return;
    }

    try {
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
        console.log("Admin created successfully");
        setNewAdmin({ email: "", name: "", role: "admin" });
        fetchAdmins();
      }
    } catch (error) {
      console.error("Error creating admin:", error);
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

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <AdminProtectedRoute>
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
                <h1 className="text-lg sm:text-xl font-semibold text-gray-900">Manage Admins</h1>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Admin List */}
            <div className="lg:col-span-2">
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b">
                  <h3 className="text-lg font-medium text-gray-900">Admin Users</h3>
                </div>
                <div className="divide-y divide-gray-200">
                  {admins.map((admin) => (
                    <div key={admin.id} className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">{admin.name}</h4>
                          <p className="text-sm text-gray-500">{admin.email}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              admin.role === 'super_admin' 
                                ? 'bg-purple-100 text-purple-800' 
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {admin.role.replace('_', ' ')}
                            </span>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              admin.is_active 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {admin.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          {admin.email !== currentAdmin?.email && (
                            <button
                              onClick={() => toggleAdminStatus(admin.id, admin.is_active)}
                              className={`px-3 py-1 rounded text-xs font-medium ${
                                admin.is_active
                                  ? 'bg-red-600 text-white hover:bg-red-700'
                                  : 'bg-green-600 text-white hover:bg-green-700'
                              }`}
                            >
                              {admin.is_active ? 'Deactivate' : 'Activate'}
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 mt-2">
                        Created: {new Date(admin.created_at).toLocaleDateString()}
                        {admin.created_by && ` by ${admin.created_by}`}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Create Admin */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b">
                <h3 className="text-lg font-medium text-gray-900">Create New Admin</h3>
              </div>
              <div className="p-6 space-y-4">
                <input
                  type="email"
                  placeholder="Email"
                  value={newAdmin.email}
                  onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Full Name"
                  value={newAdmin.name}
                  onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={newAdmin.role}
                  onChange={(e) => setNewAdmin({ ...newAdmin, role: e.target.value })}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
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
                <p className="text-xs text-gray-500">
                  Note: New admin must create account with this email first
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </AdminProtectedRoute>
  );
}