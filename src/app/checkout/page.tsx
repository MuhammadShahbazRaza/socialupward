import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { CheckoutFlow } from "@/components/checkout-flow";

export const dynamic = "force-dynamic";

export const metadata = { title: "Checkout" };

export default function CheckoutPage() {
  return (
    <div className="pt-24 pb-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Secure <span className="text-gradient">Checkout</span>
          </h1>
          <p className="mt-2 text-slate-400">No account needed. No password ever.</p>
        </div>
        <Suspense
          fallback={
            <div className="flex min-h-[40vh] items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
            </div>
          }
        >
          <CheckoutFlow />
        </Suspense>
      </div>
    </div>
  );
}
