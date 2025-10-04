"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminAuth } from "../lib/adminAuth";

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

export default function AdminProtectedRoute({ children }: AdminProtectedRouteProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [adminUser, setAdminUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const { token, email } = AdminAuth.getCurrentSession();
      
      if (!token || !email) {
        console.log('No admin session found');
        setIsAuthenticated(false);
        router.push("/login");
        return;
      }

      // Validate session
      const isValidSession = await AdminAuth.validateSession(token);
      if (!isValidSession) {
        console.log('Invalid admin session');
        setIsAuthenticated(false);
        router.push("/login");
        return;
      }

      // Check if user is still admin
      const isAdmin = await AdminAuth.isAdmin(email);
      if (!isAdmin) {
        console.log('User is not admin');
        await AdminAuth.destroySession(token);
        setIsAuthenticated(false);
        router.push("/login");
        return;
      }

      // Get admin user details
      const adminUserData = await AdminAuth.getAdminUser(email);
      if (!adminUserData) {
        console.log('Could not get admin user data');
        setIsAuthenticated(false);
        router.push("/login");
        return;
      }

      setAdminUser(adminUserData);
      setIsAuthenticated(true);
      
      // Cleanup expired sessions
      AdminAuth.cleanupExpiredSessions();
    };

    checkAuth();
  }, [router]);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return <>{children}</>;
}