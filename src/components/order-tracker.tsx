"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  PackageSearch,
  Loader2,
  Check,
  Clock,
  Rocket,
  RefreshCcw,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input, Label } from "./ui/input";
import { Badge } from "./ui/badge";
import { Card, CardContent } from "./ui/card";
import { cn } from "./ui/cn";
import { formatUSD, displayOrderId } from "@/lib/pricing";
import { findLocalOrder } from "@/lib/local-orders";

type OrderPayload = {
  id: string;
  email: string;
  usernameOrUrl: string;
  quantity: number;
  subtotal: number;
  discountAmount: number;
  total: number;
  couponCode: string | null;
  status: string;
  paymentStatus: string;
  createdAt: string;
  platform: { name: string };
  packageTier: { tierName: string; unitLabel: string; serviceCategory: { name: string } };
};

const STAGES = [
  { key: "PENDING", label: "Pending", icon: Clock },
  { key: "IN_PROGRESS", label: "In Progress", icon: Rocket },
  { key: "COMPLETED", label: "Completed", icon: Check },
];

const STATUS_TONE: Record<string, "indigo" | "amber" | "emerald" | "violet" | "red" | "slate"> = {
  PENDING: "amber",
  IN_PROGRESS: "indigo",
  COMPLETED: "emerald",
  REFILL_REQUESTED: "violet",
  CANCELLED: "red",
};

function statusLabel(s: string) {
  return s.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

export function OrderTracker() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState(searchParams.get("email") ?? "");
  const [orderId, setOrderId] = useState(searchParams.get("order") ?? "");
  const [order, setOrder] = useState<OrderPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const autoLookedUp = useRef(false);

  const lookup = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError("");
    setOrder(null);
    if (!orderId.trim() || !email.trim()) {
      setError("Please enter both your email and order ID.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `/api/orders?id=${encodeURIComponent(orderId.trim())}&email=${encodeURIComponent(email.trim())}`,
      );
      const d = await res.json().catch(() => ({}));
      if (res.ok && d.order) {
        setOrder(d.order);
        return;
      }
      // API missed (no DB, or a different serverless instance) — check the
      // browser's local order cache before giving up.
      const local = findLocalOrder(orderId, email);
      if (local) {
        setOrder(local);
        return;
      }
      throw new Error(typeof d.error === "string" ? d.error : "Order not found");
    } catch (err) {
      if (err instanceof TypeError) {
        const local = findLocalOrder(orderId, email);
        if (local) {
          setOrder(local);
          return;
        }
      }
      setError(err instanceof Error ? err.message : "Lookup failed");
    } finally {
      setLoading(false);
    }
  };

  // Auto-run when arriving from the checkout success page with params.
  useEffect(() => {
    if (!autoLookedUp.current && orderId.trim() && email.trim()) {
      autoLookedUp.current = true;
      void lookup();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stageIndex =
    order?.status === "COMPLETED" ? 2 : order?.status === "IN_PROGRESS" ? 1 : 0;

  return (
    <div className="mt-8">
      <Card>
        <CardContent className="p-6 sm:p-8">
          <form onSubmit={lookup} className="grid gap-4 sm:grid-cols-[1fr_1fr_auto]">
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <Label>Order ID</Label>
              <Input
                placeholder="e.g. A1B2C3D4"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                className="font-mono uppercase"
              />
            </div>
            <div className="flex items-end">
              <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <PackageSearch className="h-4 w-4" />}
                Track
              </Button>
            </div>
          </form>

          {error && (
            <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
              <AlertTriangle className="h-5 w-5 shrink-0" /> {error}
            </div>
          )}

          {order && (
            <div className="mt-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-sm text-slate-400">Order</div>
                  <div className="font-mono text-xl font-bold text-white">
                    {displayOrderId(order.id)}
                  </div>
                </div>
                <Badge tone={STATUS_TONE[order.status] ?? "slate"} className="text-sm px-3 py-1">
                  {statusLabel(order.status)}
                </Badge>
              </div>

              {/* Status timeline */}
              <div className="mt-8">
                {order.status === "REFILL_REQUESTED" || order.status === "CANCELLED" ? (
                  <div
                    className={cn(
                      "flex items-center gap-3 rounded-xl border p-4",
                      order.status === "REFILL_REQUESTED"
                        ? "border-violet-500/30 bg-violet-500/10"
                        : "border-red-500/30 bg-red-500/10",
                    )}
                  >
                    {order.status === "REFILL_REQUESTED" ? (
                      <RefreshCcw className="h-6 w-6 text-violet-300" />
                    ) : (
                      <XCircle className="h-6 w-6 text-red-300" />
                    )}
                    <div className="text-sm">
                      <div className="font-semibold text-white">{statusLabel(order.status)}</div>
                      <div className="text-slate-400">
                        {order.status === "REFILL_REQUESTED"
                          ? "A refill was requested on this order — our team is topping it up now."
                          : "This order was cancelled. Contact support if you believe this is a mistake."}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center">
                    {STAGES.map((s, i) => {
                      const done = i <= stageIndex;
                      const current = i === stageIndex;
                      return (
                        <div key={s.key} className="flex flex-1 items-center last:flex-none">
                          <div className="flex flex-col items-center gap-2">
                            <span
                              className={cn(
                                "flex h-11 w-11 items-center justify-center rounded-full border-2 transition",
                                done
                                  ? "border-emerald-400 bg-emerald-500/15 text-emerald-300"
                                  : "border-white/15 bg-white/5 text-slate-500",
                                current && "border-indigo-400 bg-indigo-500/20 text-indigo-200 shadow-lg shadow-indigo-600/30",
                              )}
                            >
                              <s.icon className="h-5 w-5" />
                            </span>
                            <span
                              className={cn(
                                "text-xs font-medium",
                                done || current ? "text-white" : "text-slate-500",
                              )}
                            >
                              {s.label}
                            </span>
                          </div>
                          {i < STAGES.length - 1 && (
                            <div
                              className={cn(
                                "mx-2 mb-6 h-0.5 flex-1 rounded",
                                i < stageIndex ? "bg-emerald-400/60" : "bg-white/10",
                              )}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Order details */}
              <div className="mt-8 grid gap-4 rounded-xl border border-white/10 bg-white/[0.02] p-5 text-sm sm:grid-cols-2">
                <div>
                  <div className="text-xs uppercase tracking-wider text-slate-500">Service</div>
                  <div className="mt-1 font-medium text-white">
                    {order.platform.name} · {order.packageTier.serviceCategory.name}
                  </div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider text-slate-500">Tier</div>
                  <div className="mt-1 font-medium text-white">{order.packageTier.tierName}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider text-slate-500">Quantity</div>
                  <div className="mt-1 font-medium text-white">
                    {order.quantity.toLocaleString()} {order.packageTier.unitLabel}
                  </div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider text-slate-500">Deliver to</div>
                  <div className="mt-1 font-medium text-white break-all">{order.usernameOrUrl}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider text-slate-500">Total paid</div>
                  <div className="mt-1 font-medium text-white">{formatUSD(order.total)}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider text-slate-500">Placed</div>
                  <div className="mt-1 font-medium text-white">
                    {new Date(order.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>

              <p className="mt-4 text-center text-xs text-slate-500">
                Numbers dropped within your guarantee window? Contact 24/7 support with your order
                ID for a free refill.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
