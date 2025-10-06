"use client";
import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { FaGoogle, FaGithub } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { AdminAuth } from "../../lib/adminAuth";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  const router = useRouter();

  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    
    if (!email) errors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) errors.email = "Invalid email format";
    
    if (!password) errors.password = "Password is required";
    else if (password.length < 6) errors.password = "Password must be at least 6 characters";
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  //Handle OAuth login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setError("Please fix the errors below.");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.error('Authentication failed');
      if (error.message?.includes('Invalid login credentials')) {
        setError('Invalid email or password. Please check your credentials and try again.');
      } else if (error.message?.includes('Email not confirmed')) {
        setError('Please check your email and click the confirmation link before signing in.');
      } else if (error.message?.includes('Too many requests')) {
        setError('Too many login attempts. Please wait a few minutes before trying again.');
      } else {
        setError('Login failed. Please try again later.');
      }
    } else {
      // Check if user is admin
      const isAdmin = await AdminAuth.isAdmin(email);
      
      if (isAdmin) {
        // Create admin session
        const sessionToken = await AdminAuth.createSession(email);
        if (sessionToken) {
          console.log('Admin session created');
          router.push("/admin");
        } else {
          console.error('Admin session creation failed');
          setError("Authentication failed. Please try again.");
        }
      } else {
        // Regular user
        router.push("/products");
      }
    }
    setLoading(false);
  };

  //Navigate to Signup
  const handleSignupClick = () => {
    router.push("/signup");
  };

  //Social Login
  const handleSocialLogin = async (provider: "google" | "github") => {
    setSocialLoading(provider);
    setError(null);
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({ provider });
      if (error) {
        console.error('Social login failed');
        setError(`Failed to sign in with ${provider}. Please try again.`);
      }
    } catch (err) {
      console.error('Social login error');
      setError('Network error. Please check your connection and try again.');
    } finally {
      setSocialLoading(null);
    }
  };



  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4 sm:px-6 lg:px-8">
      <div className="bg-white shadow-lg rounded-2xl p-4 sm:p-6 md:p-8 w-full max-w-md mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-center text-gray-800 mb-4 sm:mb-6">
          Welcome Back
        </h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            <div className="flex items-center">
              <span className="text-red-500 mr-2">⚠️</span>
              {error}
            </div>
          </div>
        )}

        {/*Email & Password*/}
        <form className="space-y-3 sm:space-y-4">
          <div>
            <input
              type="email"
              placeholder="Email"
              className={`w-full p-2 sm:p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base ${
                validationErrors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (validationErrors.email) {
                  setValidationErrors({...validationErrors, email: ''});
                }
              }}
              maxLength={100}
              autoComplete="email"
              required
            />
            {validationErrors.email && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.email}</p>
            )}
          </div>
          <div>
            <input
              type="password"
              placeholder="Password"
              className={`w-full p-2 sm:p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base ${
                validationErrors.password ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (validationErrors.password) {
                  setValidationErrors({...validationErrors, password: ''});
                }
              }}
              minLength={6}
              maxLength={128}
              autoComplete="current-password"
              required
            />
            {validationErrors.password && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.password}</p>
            )}
          </div>

          <div className="flex justify-between items-center text-sm">
            <a href="#" className="text-blue-600 hover:underline">
              Forgot Password?
            </a>
          </div>

          {/*Sign in and Sign up buttons*/}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button
              onClick={handleLogin}
              disabled={loading || socialLoading}
              className="w-full sm:w-1/2 bg-blue-600 text-white py-2 sm:py-3 rounded-lg hover:bg-blue-700 transition text-sm sm:text-base disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
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
            disabled={loading || socialLoading}
            className="flex items-center justify-center gap-2 border px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-50 transition text-sm sm:text-base w-full sm:w-auto disabled:opacity-50">
              {socialLoading === 'google' ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
              ) : (
                <FaGoogle className="text-red-500"/>
              )}
              Google
            </button>
            <button
            onClick={() => handleSocialLogin('github')}
            disabled={loading || socialLoading}
            className="flex items-center justify-center gap-2 border px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-50 transition text-sm sm:text-base w-full sm:w-auto disabled:opacity-50">
              {socialLoading === 'github' ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
              ) : (
                <FaGithub className="text-gray-700" />
              )}
              Github
            </button>
        </div>
      </div>
    </div>
  );
}
