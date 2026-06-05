import React from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle2, Home } from "lucide-react";

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const uuid = searchParams.get("uuid") || "N/A";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 max-w-md w-full text-center shadow-xl border border-gray-100 dark:border-gray-800 animate-slide-up">
        <div className="h-20 w-20 bg-green-50 dark:bg-green-950/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
        </div>
        
        <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white mb-2">
          Payment Successful!
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Your payment has been successfully processed and verified. Your booking is confirmed.
        </p>

        <div className="bg-gray-50 dark:bg-gray-950 rounded-2xl p-4 mb-8 text-left border border-gray-150 dark:border-gray-850">
          <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Transaction reference ID</span>
          <code className="text-xs font-semibold text-gray-700 dark:text-gray-300 break-all">{uuid}</code>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => navigate("/")}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            <Home className="h-5 w-5" /> Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
