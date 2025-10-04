"use client";
import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { FaGoogle, FaGithub } from "react-icons/fa";
import { useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  //Handle OAuth login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setError(error.message);
    } else {
      router.push("/admin");
    }
    setLoading(false);
  };

  //Navigate to Signup
  const handleSignupClick = () => {
    router.push("/signup");
  };

  //Social Login
  const handleSocialLogin = async (provider: "google" | "github") => {
    const { error } = await supabase.auth.signInWithOAuth({ provider });
    if (error) setError(error.message);
  };



  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4 sm:px-6 lg:px-8">
      <div className="bg-white shadow-lg rounded-2xl p-4 sm:p-6 md:p-8 w-full max-w-md mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-center text-gray-800 mb-4 sm:mb-6">
          Welcome Back
        </h1>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        {/*Email & Password*/}
        <form className="space-y-3 sm:space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full p-2 sm:p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-2 sm:p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="flex justify-between items-center text-sm">
            <a href="#" className="text-blue-600 hover:underline">
              Forgot Password?
            </a>
          </div>

          {/*Sign in and Sign up buttons*/}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full sm:w-1/2 bg-blue-600 text-white py-2 sm:py-3 rounded-lg hover:bg-blue-700 transition text-sm sm:text-base"
            >
              {loading ? "..." : "Sign In"}
            </button>
            <button
              type="button"
              onClick={handleSignupClick}
              className="w-full sm:w-1/2 bg-gray-800 text-white py-2 sm:py-3 rounded-lg hover:bg-gray-900 transition text-sm sm:text-base"
            >
              Sign Up
            </button>
          </div>
        </form>

        {/*Divider*/}
        <div className="flex items-center my-6">
            <div className="flex-grow border-t"></div>
            <span className="px-2 text-gray-400 text-sm">or continue with</span>
            <div className="flex-grow border-t"></div>
        </div>
        {/*Social Login*/}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 justify-center">
          <button
            onClick={() => handleSocialLogin("google")}
            className="flex items-center justify-center gap-2 border px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-50 transition text-sm sm:text-base w-full sm:w-auto">
              <FaGoogle className="text-red-500"/>
              Google
            </button>
            <button
            onClick={() => handleSocialLogin('github')}
            className="flex items-center justify-center gap-2 border px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-50 transition text-sm sm:text-base w-full sm:w-auto">
              <FaGithub className="text-gray-700" />
              Github
            </button>
        </div>
      </div>
    </div>
  );
}
