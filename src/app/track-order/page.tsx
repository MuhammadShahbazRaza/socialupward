import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { OrderTracker } from "@/components/order-tracker";

export const dynamic = "force-dynamic";

export const metadata = { title: "Track Your Order" };

export default function TrackOrderPage() {
  return (
    <div className="pt-24 pb-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Track Your <span className="text-gradient">Order</span>
          </h1>
          <p className="mt-2 text-slate-400">
            Enter the email and order ID from your confirmation to see live fulfillment status.
          </p>
        </div>
        <Suspense
          fallback={
            <div className="flex min-h-[30vh] items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
            </div>
          }
        >
          <OrderTracker />
        </Suspense>
      </div>
    </div>
  );
}
