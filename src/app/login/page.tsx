"use client";
import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { FaGoogle, FaGithub } from "react-icons/fa";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

     //Handle OAuth login
    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) setError(error.message);
        setLoading(false);
    };

    //Handle Signup
    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error } = await supabase.auth.signUp({ email, password });
        if (error) setError(error.message);
        setLoading(false);
    };

    //Social Login
    const handleSocialLogin = async (provider: 'google' | 'github') => {
        const {error} = await supabase.auth.signInWithOAuth({provider});
        if (error) setError(error.message);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Sign in to your account
                    </h2>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleEmailLogin}>
                    {error && (
                        <div className="text-red-600 text-sm text-center">{error}</div>
                    )}
                    <div>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            required
                        />
                    </div>
                    <div>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            required
                        />
                    </div>
                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </div>
                    <div className="flex space-x-4">
                        <button
                            type="button"
                            onClick={() => handleSocialLogin('google')}
                            className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center justify-center"
                        >
                            <FaGoogle className="mr-2" /> Google
                        </button>
                        <button
                            type="button"
                            onClick={() => handleSocialLogin('github')}
                            className="flex-1 py-2 px-4 bg-gray-800 text-white rounded-md hover:bg-gray-900 flex items-center justify-center"
                        >
                            <FaGithub className="mr-2" /> GitHub
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

