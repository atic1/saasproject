import React from "react";
import { useNavigate } from "react-router-dom";
import { XCircle, RefreshCw } from "lucide-react";

export default function PaymentFailed() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 max-w-md w-full text-center shadow-xl border border-gray-100 dark:border-gray-800 animate-slide-up">
        <div className="h-20 w-20 bg-red-50 dark:bg-red-950/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
        </div>
        
        <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white mb-2">
          Payment Failed
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
          The transaction could not be completed. Either the process was cancelled or eSewa rejected the transaction. Please try again.
        </p>

        <div className="space-y-3">
          <button
            onClick={() => navigate(-1)}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw className="h-5 w-5" /> Retry Payment
          </button>
          <button
            onClick={() => navigate("/")}
            className="w-full py-4 bg-gray-100 dark:bg-gray-800 hover:bg-gray-250 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-2xl transition-all"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
