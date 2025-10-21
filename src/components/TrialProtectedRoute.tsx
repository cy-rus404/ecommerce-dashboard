"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface TrialProtectedRouteProps {
  children: React.ReactNode;
}

export default function TrialProtectedRoute({ children }: TrialProtectedRouteProps) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    console.log('TrialProtectedRoute: Checking trial auth...');
    const trialToken = localStorage.getItem('trial_token');
    const trialSession = localStorage.getItem('trial_session');
    
    console.log('TrialProtectedRoute token:', trialToken);
    console.log('TrialProtectedRoute session:', trialSession);
    
    if (!trialToken) {
      console.log('TrialProtectedRoute: No trial token, redirecting to /trial');
      router.push('/trial');
      return;
    }
    
    console.log('TrialProtectedRoute: Trial token found, allowing access');
    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return <>{children}</>;
}