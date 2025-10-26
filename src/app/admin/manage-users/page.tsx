"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'
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
      const { data: users, error } = await supabase.rpc('get_all_users');
      
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
    if (!confirm("Are you sure you want to permanently delete this user? They will not be able to login anymore.")) return;
    
    try {
      const { error } = await supabase.rpc('delete_user_completely', { user_id: userId });
      
      if (error) {
        console.error("Error deleting user:", error);
        alert("Error deleting user: " + error.message);
      } else {
        alert("User deleted successfully. They can no longer login.");
        fetchUsers();
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Error deleting user");
    }
  };

  const toggleUserStatus = async (userId: string, banned: boolean) => {
    try {
      const action = banned ? 'unban' : 'ban';
      const { error } = await supabase.rpc('toggle_user_ban', { 
        user_id: userId, 
        ban_user: !banned 
      });
      
      if (error) {
        console.error("Error updating user status:", error);
        alert("Error updating user status: " + error.message);
      } else {
        alert(`User ${action}ned successfully. ${!banned ? 'They cannot login until unbanned.' : 'They can now login normally.'}`);
        fetchUsers();
      }
    } catch (error) {
      console.error("Error updating user status:", error);
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
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Manage Users</h1>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          <div className="px-4 py-4 sm:px-6 border-b dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
              All Users ({users.length})
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    User
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Created
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {user.name || "N/A"}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {user.phone || "No phone"}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {user.email || "No email"}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {user.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A"}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                        user.banned_until ? 'bg-red-600 text-white' : 'bg-green-600 text-white'
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
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No users found
            </div>
          )}
        </div>
      </main>
    </div>
  );
}