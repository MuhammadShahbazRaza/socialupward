import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { CheckoutSuccess } from "@/components/checkout-success";

export const dynamic = "force-dynamic";

export const metadata = { title: "Payment Successful" };

export default function CheckoutSuccessPage() {
  return (
    <div className="mx-auto max-w-xl py-24 text-center px-4">
      <Suspense
        fallback={<Loader2 className="mx-auto h-8 w-8 animate-spin text-indigo-400" />}
      >
        <CheckoutSuccess />
      </Suspense>
    </div>
  );
}
