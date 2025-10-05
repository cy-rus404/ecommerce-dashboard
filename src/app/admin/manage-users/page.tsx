"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ManageUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
      } else {
        setCurrentUser(user);
        fetchUsers();
      }
    };
    checkAuth();
  }, [router]);

  const fetchUsers = async () => {
    try {
      const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Error fetching users:", error);
        setUsers([]);
      } else {
        setUsers(users || []);
      }
    } catch (error) {
      console.error("Error loading users:", error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);
      
      if (error) {
        console.error("Supabase delete error:", error);
        alert("Error deleting user: " + error.message);
      } else {
        setUsers(users.filter(user => user.id !== userId));
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Error deleting user");
    }
  };

  const toggleUserStatus = async (userId: string, banned: boolean) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ 
          banned_until: banned ? null : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        })
        .eq('id', userId);
      
      if (error) {
        console.error("Supabase update error:", error);
        alert("Error updating user status: " + error.message);
      } else {
        fetchUsers();
      }
    } catch (error) {
      console.error("Error updating user status:", error);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

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
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900">Manage Users</h1>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-4 sm:px-6 border-b">
            <h2 className="text-lg font-medium text-gray-900">
              All Users ({users.length})
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    User
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Created
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {user.name || "N/A"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.phone || "No phone"}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.email || "No email"}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A"}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.banned_until ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {user.banned_until ? 'Banned' : 'Active'}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm space-x-2">
                      <button
                        onClick={() => toggleUserStatus(user.id, !!user.banned_until)}
                        className={`px-3 py-1 rounded text-xs font-medium ${
                          user.banned_until 
                            ? 'bg-green-600 text-white hover:bg-green-700' 
                            : 'bg-yellow-600 text-white hover:bg-yellow-700'
                        }`}
                      >
                        {user.banned_until ? 'Unban' : 'Ban'}
                      </button>
                      <button
                        onClick={() => deleteUser(user.id)}
                        className="px-3 py-1 bg-red-600 text-white rounded text-xs font-medium hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {users.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No users found
            </div>
          )}
        </div>
      </main>
    </div>
  );
}