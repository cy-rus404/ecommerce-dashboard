"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [message, setMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
    } else {
      setUser(user);
      setFormData({
        name: user.user_metadata?.name || "",
        phone: user.user_metadata?.phone || "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
    }
    setLoading(false);
  };

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setMessage("");

    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          name: formData.name,
          phone: formData.phone
        }
      });

      if (error) {
        setMessage("Error updating profile: " + error.message);
      } else {
        setMessage("Profile updated successfully!");
      }
    } catch (error) {
      setMessage("Error updating profile");
    } finally {
      setUpdating(false);
    }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      setMessage("New passwords don't match");
      return;
    }

    if (formData.newPassword.length < 6) {
      setMessage("Password must be at least 6 characters");
      return;
    }

    setUpdating(true);
    setMessage("");

    try {
      const { error } = await supabase.auth.updateUser({
        password: formData.newPassword
      });

      if (error) {
        setMessage("Error changing password: " + error.message);
      } else {
        setMessage("Password changed successfully!");
        setFormData({
          ...formData,
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        });
      }
    } catch (error) {
      setMessage("Error changing password");
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <button
            onClick={() => router.push('/products')}
            className="text-blue-600 hover:text-blue-800"
          >
            Back to Products
          </button>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.includes('successfully') 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {message}
          </div>
        )}

        <div className="space-y-6">
          {/* Profile Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
            <form onSubmit={updateProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="w-full p-3 border rounded-lg bg-gray-100 text-gray-500"
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={updating}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {updating ? "Updating..." : "Update Profile"}
              </button>
            </form>
          </div>

          {/* Change Password */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Change Password</h2>
            <form onSubmit={changePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={formData.newPassword}
                  onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  minLength={6}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  minLength={6}
                />
              </div>

              <button
                type="submit"
                disabled={updating || !formData.newPassword || !formData.confirmPassword}
                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {updating ? "Changing..." : "Change Password"}
              </button>
            </form>
          </div>

          {/* Account Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Account Actions</h2>
            <div className="space-y-3">
              <button
                onClick={() => router.push('/my-orders')}
                className="w-full bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700"
              >
                View My Orders
              </button>
              <button
                onClick={handleLogout}
                className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}