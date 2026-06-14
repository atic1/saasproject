import React from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";

export default function PaymentPending() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const uuid = searchParams.get("uuid") || "N/A";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-gray-950 dark:to-gray-900 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 sm:p-10 max-w-md w-full text-center shadow-2xl shadow-yellow-500/10 border border-yellow-100 dark:border-gray-800">

        {/* Pending icon with animation */}
        <div className="relative w-24 h-24 mx-auto mb-6">
          <div className="w-24 h-24 bg-yellow-100 dark:bg-yellow-950/30 rounded-full flex items-center justify-center">
            <AlertTriangle className="h-12 w-12 text-yellow-600 dark:text-yellow-400" />
          </div>
          <div className="absolute inset-0 rounded-full border-4 border-yellow-300 dark:border-yellow-700 animate-ping opacity-30" />
        </div>

        <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white mb-2">
          Payment Pending
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Your payment is being processed. We are waiting for confirmation from eSewa. This usually completes within a few seconds.
        </p>

        <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-100 dark:border-yellow-900/30 rounded-2xl p-4 mb-8 text-left">
          <span className="block text-[10px] font-bold text-yellow-600 dark:text-yellow-500 uppercase tracking-wider mb-1">
            Transaction Reference
          </span>
          <code className="text-xs font-semibold text-gray-700 dark:text-gray-300 break-all">{uuid}</code>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => window.location.reload()}
            className="w-full py-4 bg-yellow-500 hover:bg-yellow-400 text-white font-bold rounded-2xl shadow-lg shadow-yellow-500/25 transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2"
          >
            <RefreshCw className="h-5 w-5" /> Check Status
          </button>
          <button
            onClick={() => navigate("/")}
            className="w-full py-4 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-2xl transition-all flex items-center justify-center gap-2"
          >
            <Home className="h-4 w-4" /> Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
