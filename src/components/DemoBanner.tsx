"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { DemoAuth } from "../lib/demoAuth";

export default function DemoBanner() {
  const [isDemoMode, setIsDemoMode] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const checkDemoMode = async () => {
      try {
        const isDemo = await DemoAuth.isDemoSession();
        setIsDemoMode(isDemo);
      } catch {
        setIsDemoMode(false);
      }
    };

    checkDemoMode();
    
    // Check periodically for auth changes
    const interval = setInterval(checkDemoMode, 3000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  // Don't show banner on login page or if not in demo mode
  if (!isDemoMode || pathname === '/login') return null;

  return (
    <div className="bg-orange-500 text-white px-4 py-2 text-center text-sm font-medium">
      🔄 You're viewing a demo version. Real actions are disabled.
    </div>
  );
}