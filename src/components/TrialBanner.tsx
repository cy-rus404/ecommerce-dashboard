"use client";
import { useEffect, useState } from "react";
import { TrialContext } from "../lib/trialContext";

export default function TrialBanner() {
  const [isTrialMode, setIsTrialMode] = useState(false);

  useEffect(() => {
    setIsTrialMode(TrialContext.isTrialMode());
  }, []);

  if (!isTrialMode) return null;

  return (
    <div className="bg-blue-600 text-white px-4 py-2 text-center text-sm">
      🔄 <strong>DEMO MODE</strong> - You're experiencing the full website functionality. All actions are simulated and won't affect real data.
    </div>
  );
}