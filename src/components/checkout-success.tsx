"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "./ui/button";
import { shortOrderId } from "@/lib/pricing";

/**
 * Landing page for Stripe's success_url.
 * Confirms the order exists; in production, trust the Stripe webhook
 * (see README) as the source of truth for payment status.
 */
export function CheckoutSuccess() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order") ?? "";

  return (
    <>
      <CheckCircle2 className="mx-auto h-16 w-16 text-emerald-400" />
      <h1 className="mt-6 text-3xl font-extrabold">Payment successful!</h1>
      <p className="mt-3 text-slate-400">
        Thanks for your order
        {orderId && (
          <>
            {" "}
            (<span className="font-mono text-white">{shortOrderId(orderId)}</span>)
          </>
        )}
        . Your growth is queued — check your email for the receipt and tracking link.
      </p>
      <div className="mt-8 flex justify-center gap-3">
        <Link href="/track-order">
          <Button size="lg">Track Order</Button>
        </Link>
        <Link href="/#platforms">
          <Button size="lg" variant="secondary">
            Order More
          </Button>
        </Link>
      </div>
    </>
  );
}
