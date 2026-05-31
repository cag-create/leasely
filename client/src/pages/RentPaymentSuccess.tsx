import { Link, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Home, Receipt, ArrowRight } from "lucide-react";

const ACCENT = "#4F46E5";

export default function RentPaymentSuccess() {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-10 max-w-md w-full text-center">
        {/* Success icon */}
        <div className="h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ background: `${ACCENT}20` }}>
          <CheckCircle2 className="h-10 w-10" style={{ color: ACCENT }} />
        </div>

        <h1 className="text-2xl font-black text-gray-900 mb-2">Payment Successful!</h1>
        <p className="text-gray-500 mb-6 leading-relaxed">
          Your rent payment has been processed. A receipt has been sent to your email address.
          Funds will be transferred directly to your landlord.
        </p>

        <div className="bg-gray-50 rounded-2xl p-4 mb-6 text-left">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Receipt className="h-4 w-4 text-gray-400" />
            <span>Check your email for your payment receipt and confirmation details.</span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Link href={`/listing/${id}`}>
            <Button className="w-full font-bold gap-2" style={{ background: ACCENT, color: "#3A2410" }}>
              Back to Listing <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/marketplace">
            <Button variant="outline" className="w-full gap-2">
              <Home className="h-4 w-4" /> Browse Marketplace
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
