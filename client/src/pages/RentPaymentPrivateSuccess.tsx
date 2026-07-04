import { CheckCircle2, Receipt, Home } from "lucide-react";

const ACCENT = "#4F46E5";

export default function RentPaymentPrivateSuccess() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-10 max-w-md w-full text-center">
        <div className="h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: `${ACCENT}20` }}>
          <CheckCircle2 className="h-10 w-10" style={{ color: ACCENT }} />
        </div>

        <h1 className="text-2xl font-black text-gray-900 mb-2">Payment Successful!</h1>
        <p className="text-gray-500 mb-6 leading-relaxed">
          Your rent payment has been processed. A receipt has been sent to your email address.
          Funds will be transferred directly to your landlord's bank.
        </p>

        <div className="bg-gray-50 rounded-2xl p-4 text-left">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Receipt className="h-4 w-4 text-gray-400" />
            <span>Check your email for your payment receipt and confirmation details.</span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 text-xs text-gray-400 mt-6">
          <Home className="h-3.5 w-3.5" /> Powered by Leasely
        </div>
      </div>
    </div>
  );
}
