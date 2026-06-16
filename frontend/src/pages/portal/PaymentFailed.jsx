import React from "react";
import { useNavigate } from "react-router-dom";
import { XCircle, RefreshCw, Home } from "lucide-react";

export default function PaymentFailed() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-rose-50 dark:from-gray-950 dark:to-gray-900 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 sm:p-10 max-w-md w-full text-center shadow-2xl shadow-red-500/10 border border-red-100 dark:border-gray-800">

        {/* Failed icon */}
        <div className="w-24 h-24 bg-red-100 dark:bg-red-950/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
        </div>

        <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white mb-2">
          Payment Failed
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
          The transaction could not be completed. This could be because the process was cancelled or the payment was rejected. Please try again.
        </p>

        <div className="space-y-3">
          <button
            onClick={() => navigate(-1)}
            className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-bold rounded-2xl shadow-lg shadow-red-500/25 transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2"
          >
            <RefreshCw className="h-5 w-5" /> Retry Payment
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
