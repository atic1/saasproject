import React from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle2, Home, Sparkles } from "lucide-react";

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const uuid = searchParams.get("uuid") || "N/A";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-950 dark:to-gray-900 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 sm:p-10 max-w-md w-full text-center shadow-2xl shadow-green-500/10 border border-green-100 dark:border-gray-800">
        
        {/* Success icon */}
        <div className="relative w-24 h-24 mx-auto mb-6">
          <div className="w-24 h-24 bg-green-100 dark:bg-green-950/30 rounded-full flex items-center justify-center">
            <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
          </div>
          <div className="absolute -top-1 -right-1 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
        </div>

        <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white mb-2">
          Payment Successful!
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Your payment has been verified and your booking is confirmed. We look forward to seeing you!
        </p>

        <div className="bg-green-50 dark:bg-green-950/20 border border-green-100 dark:border-green-900/30 rounded-2xl p-4 mb-8 text-left">
          <span className="block text-[10px] font-bold text-green-600 dark:text-green-500 uppercase tracking-wider mb-1">
            Transaction Reference
          </span>
          <code className="text-xs font-semibold text-gray-700 dark:text-gray-300 break-all">{uuid}</code>
        </div>

        <button
          onClick={() => navigate("/")}
          className="w-full py-4 bg-green-600 hover:bg-green-500 text-white font-bold rounded-2xl shadow-lg shadow-green-500/25 transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2"
        >
          <Home className="h-5 w-5" /> Back to Home
        </button>
      </div>
    </div>
  );
}
