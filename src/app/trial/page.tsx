"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { TrialAuth } from "../../lib/trialAuth";

export default function TrialLoginPage() {
  const [trialToken, setTrialToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleTrialLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!trialToken.trim()) {
      setError("Please enter your trial token");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // For now, accept any token that starts with 'trial_'
      if (trialToken.startsWith('trial_')) {
        localStorage.setItem('trial_token', trialToken);
        localStorage.setItem('trial_session', 'active');
        router.push('/trial/dashboard');
      } else {
        setError("Invalid trial token format");
      }
    } catch (err) {
      setError("Login failed. Please try again.");
    }
    
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Trial Access
        </h1>
        
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg mb-6">
          <p className="text-sm">Enter your unique trial token to access the demo dashboard</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleTrialLogin} className="space-y-4">
          <input
            type="text"
            placeholder="Enter trial token"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            value={trialToken}
            onChange={(e) => setTrialToken(e.target.value)}
            required
          />
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Accessing..." : "Access Trial"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => router.push('/login')}
            className="text-blue-600 hover:underline text-sm"
          >
            Back to Main Login
          </button>
        </div>
      </div>
    </div>
  );
}