"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  Layers,
  Ticket,
  Star,
  LogOut,
  Loader2,
  DollarSign,
  Clock,
  Pencil,
  Trash2,
  Check,
  X,
  Plus,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input, Label, Textarea } from "./ui/input";
import { Select } from "./ui/select";
import { Badge } from "./ui/badge";
import { Card, CardContent } from "./ui/card";
import { Table, THead, TRow, TH, TD } from "./ui/table";
import { Dialog } from "./ui/dialog";
import { cn } from "./ui/cn";
import { formatUSD, shortOrderId, parsePriceTiers, type PriceTier } from "@/lib/pricing";

type Tab = "overview" | "orders" | "tiers" | "coupons" | "reviews";

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "orders", label: "Orders", icon: ShoppingCart },
  { id: "tiers", label: "Pricing Tiers", icon: Layers },
  { id: "coupons", label: "Coupons", icon: Ticket },
  { id: "reviews", label: "Reviews", icon: Star },
];

const ORDER_STATUSES = ["PENDING", "IN_PROGRESS", "COMPLETED", "REFILL_REQUESTED", "CANCELLED"];
const PAYMENT_STATUSES = ["UNPAID", "PENDING", "PAID", "FAILED", "REFUNDED"];

/* ── Row types (mirror the admin API payloads) ─────────────────────── */
interface DashboardStats {
  orders: number;
  revenue: number;
  pending: number;
  tiers: number;
  coupons: number;
}

interface OrderRow {
  id: string;
  email: string;
  usernameOrUrl: string;
  quantity: number;
  total: number;
  status: string;
  paymentStatus: string;
  notes: string | null;
  platform?: { name: string } | null;
  packageTier?: {
    tierName: string;
    unitLabel: string;
    serviceCategory?: { name: string } | null;
  } | null;
}

interface TierRow {
  id: string;
  tierName: string;
  unitLabel: string;
  basePricePer1000: number;
  priceTiers: unknown;
  deliveryEstimate: string;
  guaranteeDays: number;
  active: boolean;
  serviceCategory?: {
    name: string;
    platform?: { name: string } | null;
  } | null;
}

interface CouponRow {
  id: string;
  code: string;
  discountPct: number;
  usedCount: number;
  maxUses: number | null;
  active: boolean;
}

interface ReviewRow {
  id: string;
  name: string;
  rating: number;
  text: string;
  platformName: string;
}

export function AdminDashboard() {
  const [tab, setTab] = useState<Tab>("overview");
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [tiers, setTiers] = useState<TierRow[]>([]);
  const [coupons, setCoupons] = useState<CouponRow[]>([]);
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const router = useRouter();

  // Pure data fetch — no state updates, so both the effect and manual
  // refreshes can share it without tripping the set-state-in-effect rule.
  const fetchAll = async (status: string) => {
    const [s, o, t, c, r] = await Promise.all([
      fetch("/api/admin/stats").then((x) => x.json()),
      fetch("/api/admin/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: status || undefined }),
      }).then((x) => x.json()),
      fetch("/api/admin/tiers").then((x) => x.json()),
      fetch("/api/admin/coupons").then((x) => x.json()),
      fetch("/api/admin/reviews").then((x) => x.json()),
    ]);
    return {
      stats: (s.stats ?? null) as DashboardStats | null,
      orders: (o.orders ?? []) as OrderRow[],
      tiers: (t.tiers ?? []) as TierRow[],
      coupons: (c.coupons ?? []) as CouponRow[],
      reviews: (r.reviews ?? []) as ReviewRow[],
    };
  };

  const applyData = useCallback((d: Awaited<ReturnType<typeof fetchAll>>) => {
    setStats(d.stats);
    setOrders(d.orders);
    setTiers(d.tiers);
    setCoupons(d.coupons);
    setReviews(d.reviews);
    setLoading(false);
  }, []);

  const load = async () => {
    setLoading(true);
    applyData(await fetchAll(statusFilter));
  };

  useEffect(() => {
    let cancelled = false;
    fetchAll(statusFilter).then((d) => {
      if (!cancelled) applyData(d);
    });
    return () => {
      cancelled = true;
    };
  }, [statusFilter, applyData]);

  const logout = async () => {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.refresh();
  };

  const updateOrder = async (id: string, patch: Record<string, unknown>) => {
    await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    load();
  };

  return (
    <div className="pt-20 pb-20 min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Header */}
        <div className="flex items-center justify-between py-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Admin <span className="text-gradient">Dashboard</span>
            </h1>
            <p className="text-sm text-slate-400">Manage catalog, pricing, orders & promotions.</p>
          </div>
          <Button variant="secondary" size="sm" onClick={logout}>
            <LogOut className="h-4 w-4" /> Log out
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto rounded-2xl border border-white/10 bg-ink-800/60 p-1.5">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium whitespace-nowrap transition cursor-pointer",
                tab === t.id ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30" : "text-slate-400 hover:text-white hover:bg-white/5",
              )}
            >
              <t.icon className="h-4 w-4" /> {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
          </div>
        ) : (
          <div className="mt-6">
            {tab === "overview" && <OverviewTab stats={stats} />}
            {tab === "orders" && (
              <OrdersTab
                orders={orders}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                updateOrder={updateOrder}
              />
            )}
            {tab === "tiers" && <TiersTab tiers={tiers} reload={load} />}
            {tab === "coupons" && <CouponsTab coupons={coupons} reload={load} />}
            {tab === "reviews" && <ReviewsTab reviews={reviews} reload={load} />}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Overview ─────────────────────────────────────────────────────── */
function OverviewTab({ stats }: { stats: DashboardStats | null }) {
  if (!stats) return null;
  const cards = [
    { label: "Total orders", value: stats.orders, icon: ShoppingCart, tone: "text-indigo-300" },
    { label: "Revenue (paid)", value: formatUSD(stats.revenue), icon: DollarSign, tone: "text-emerald-300" },
    { label: "Pending orders", value: stats.pending, icon: Clock, tone: "text-amber-300" },
    { label: "Active tiers", value: stats.tiers, icon: Layers, tone: "text-violet-300" },
  ];
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((c) => (
        <Card key={c.label}>
          <CardContent className="p-6 flex items-center gap-4">
            <c.icon className={cn("h-9 w-9", c.tone)} />
            <div>
              <div className="text-2xl font-extrabold text-white">{c.value}</div>
              <div className="text-sm text-slate-400">{c.label}</div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/* ── Orders ───────────────────────────────────────────────────────── */
function OrdersTab({
  orders,
  statusFilter,
  setStatusFilter,
  updateOrder,
}: {
  orders: OrderRow[];
  statusFilter: string;
  setStatusFilter: (s: string) => void;
  updateOrder: (id: string, patch: Record<string, unknown>) => void;
}) {
  const [editing, setEditing] = useState<OrderRow | null>(null);
  const [notes, setNotes] = useState("");

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-white">Orders ({orders.length})</h2>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-auto"
          >
            <option value="">All statuses</option>
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.replace(/_/g, " ")}
              </option>
            ))}
          </Select>
        </div>
        <div className="mt-4">
          <Table>
            <THead>
              <TRow>
                <TH>Order</TH>
                <TH>Service</TH>
                <TH>Deliver to</TH>
                <TH>Total</TH>
                <TH>Status</TH>
                <TH>Payment</TH>
                <TH></TH>
              </TRow>
            </THead>
            <tbody>
              {orders.map((o) => (
                <TRow key={o.id}>
                  <TD>
                    <div className="font-mono font-semibold text-white">{shortOrderId(o.id)}</div>
                    <div className="text-xs text-slate-500">{o.email}</div>
                  </TD>
                  <TD>
                    {o.platform?.name} · {o.packageTier?.serviceCategory?.name}
                    <div className="text-xs text-slate-500">
                      {o.quantity.toLocaleString()} {o.packageTier?.unitLabel} · {o.packageTier?.tierName}
                    </div>
                  </TD>
                  <TD className="max-w-[160px] truncate">{o.usernameOrUrl}</TD>
                  <TD className="font-semibold text-white">{formatUSD(o.total)}</TD>
                  <TD>
                    <Select
                      value={o.status}
                      onChange={(e) => updateOrder(o.id, { status: e.target.value })}
                      className="w-auto text-xs py-1.5"
                    >
                      {ORDER_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s.replace(/_/g, " ")}
                        </option>
                      ))}
                    </Select>
                  </TD>
                  <TD>
                    <Select
                      value={o.paymentStatus}
                      onChange={(e) => updateOrder(o.id, { paymentStatus: e.target.value })}
                      className="w-auto text-xs py-1.5"
                    >
                      {PAYMENT_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </Select>
                  </TD>
                  <TD>
                    <button
                      onClick={() => {
                        setEditing(o);
                        setNotes(o.notes ?? "");
                      }}
                      className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white cursor-pointer"
                      aria-label="Edit notes"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                  </TD>
                </TRow>
              ))}
            </tbody>
          </Table>
          {orders.length === 0 && (
            <p className="py-10 text-center text-sm text-slate-500">No orders yet.</p>
          )}
        </div>

        <Dialog open={!!editing} onClose={() => setEditing(null)}>
          <div className="p-6">
            <h3 className="text-lg font-bold text-white">
              Order {editing && shortOrderId(editing.id)} — notes
            </h3>
            <Textarea
              className="mt-4"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Internal notes about this order…"
            />
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (editing) updateOrder(editing.id, { notes });
                  setEditing(null);
                }}
              >
                Save notes
              </Button>
            </div>
          </div>
        </Dialog>
      </CardContent>
    </Card>
  );
}

/* ── Tiers (pricing) ──────────────────────────────────────────────── */
function TiersTab({ tiers, reload }: { tiers: TierRow[]; reload: () => void }) {
  const [editing, setEditing] = useState<TierRow | null>(null);
  const [form, setForm] = useState({ basePricePer1000: 0, deliveryEstimate: "", guaranteeDays: 30, active: true, ladder: [] as PriceTier[] });

  const openEdit = (t: TierRow) => {
    setEditing(t);
    setForm({
      basePricePer1000: t.basePricePer1000,
      deliveryEstimate: t.deliveryEstimate,
      guaranteeDays: t.guaranteeDays,
      active: t.active,
      ladder: parsePriceTiers(t.priceTiers),
    });
  };

  const save = async () => {
    if (!editing) return;
    await fetch(`/api/admin/tiers/${editing.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form }),
    });
    setEditing(null);
    reload();
  };

  const setLadderPrice = (qty: number, v: number) => {
    setForm((f) => ({
      ...f,
      ladder: f.ladder.map((pt) => (pt.qty === qty ? { ...pt, pricePer1000: v } : pt)),
    }));
  };

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-lg font-bold text-white">Package tiers & pricing ({tiers.length})</h2>
        <p className="mt-1 text-sm text-slate-400">
          Edit the base price or any quantity breakpoint. New prices apply to future orders only.
        </p>
        <div className="mt-4">
          <Table>
            <THead>
              <TRow>
                <TH>Platform / Category</TH>
                <TH>Tier</TH>
                <TH>Base /1K</TH>
                <TH>Status</TH>
                <TH></TH>
              </TRow>
            </THead>
            <tbody>
              {tiers.map((t) => (
                <TRow key={t.id}>
                  <TD>
                    <div className="font-medium text-white">
                      {t.serviceCategory?.platform?.name} · {t.serviceCategory?.name}
                    </div>
                    <div className="text-xs text-slate-500">{t.unitLabel}</div>
                  </TD>
                  <TD>
                    <Badge tone={t.tierName.includes("Premium") ? "amber" : "indigo"}>
                      {t.tierName}
                    </Badge>
                  </TD>
                  <TD className="font-semibold text-white">{formatUSD(t.basePricePer1000)}</TD>
                  <TD>
                    <Badge tone={t.active ? "emerald" : "slate"}>
                      {t.active ? "Active" : "Hidden"}
                    </Badge>
                  </TD>
                  <TD>
                    <button
                      onClick={() => openEdit(t)}
                      className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white cursor-pointer"
                      aria-label="Edit pricing"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                  </TD>
                </TRow>
              ))}
            </tbody>
          </Table>
        </div>

        <Dialog open={!!editing} onClose={() => setEditing(null)} className="max-w-3xl">
          <div className="p-6">
            <h3 className="text-lg font-bold text-white">
              Edit pricing — {editing?.serviceCategory?.platform?.name}{" "}
              {editing?.serviceCategory?.name} ({editing?.tierName})
            </h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Base price per 1,000 (USD)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.basePricePer1000}
                  onChange={(e) => setForm({ ...form, basePricePer1000: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label>Delivery estimate</Label>
                <Input
                  value={form.deliveryEstimate}
                  onChange={(e) => setForm({ ...form, deliveryEstimate: e.target.value })}
                />
              </div>
              <div>
                <Label>Guarantee (days)</Label>
                <Input
                  type="number"
                  min="0"
                  value={form.guaranteeDays}
                  onChange={(e) => setForm({ ...form, guaranteeDays: Number(e.target.value) })}
                />
              </div>
              <div className="flex items-end gap-2 pb-1">
                <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.active}
                    onChange={(e) => setForm({ ...form, active: e.target.checked })}
                    className="h-4 w-4 accent-indigo-500"
                  />
                  Visible in catalog
                </label>
              </div>
            </div>

            <h4 className="mt-6 font-semibold text-white">Quantity breakpoints (price per 1K)</h4>
            <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {form.ladder.map((pt) => (
                <div key={pt.qty}>
                  <Label>{pt.qty >= 1000 ? `${pt.qty / 1000}K` : pt.qty} units</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={pt.pricePer1000}
                    onChange={(e) => setLadderPrice(pt.qty, Number(e.target.value))}
                  />
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <Button onClick={save}>
                <Check className="h-4 w-4" /> Save pricing
              </Button>
            </div>
          </div>
        </Dialog>
      </CardContent>
    </Card>
  );
}

/* ── Coupons ──────────────────────────────────────────────────────── */
function CouponsTab({ coupons, reload }: { coupons: CouponRow[]; reload: () => void }) {
  const [code, setCode] = useState("");
  const [pct, setPct] = useState(10);
  const [maxUses, setMaxUses] = useState("");

  const create = async () => {
    if (!code.trim()) return;
    await fetch("/api/admin/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code,
        discountPct: pct,
        maxUses: maxUses ? Number(maxUses) : null,
      }),
    });
    setCode("");
    setPct(10);
    setMaxUses("");
    reload();
  };

  const toggle = async (id: string, active: boolean) => {
    await fetch(`/api/admin/coupons/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active }),
    });
    reload();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this coupon?")) return;
    await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
    reload();
  };

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-lg font-bold text-white">Discount codes</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_120px_140px_auto] items-end">
          <div>
            <Label>Code</Label>
            <Input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="SUMMER15" />
          </div>
          <div>
            <Label>Discount %</Label>
            <Input type="number" min="1" max="100" value={pct} onChange={(e) => setPct(Number(e.target.value))} />
          </div>
          <div>
            <Label>Max uses (optional)</Label>
            <Input type="number" min="1" value={maxUses} onChange={(e) => setMaxUses(e.target.value)} placeholder="∞" />
          </div>
          <Button onClick={create}>
            <Plus className="h-4 w-4" /> Create
          </Button>
        </div>

        <div className="mt-5">
          <Table>
            <THead>
              <TRow>
                <TH>Code</TH>
                <TH>Discount</TH>
                <TH>Used</TH>
                <TH>Status</TH>
                <TH></TH>
              </TRow>
            </THead>
            <tbody>
              {coupons.map((c) => (
                <TRow key={c.id}>
                  <TD className="font-mono font-semibold text-white">{c.code}</TD>
                  <TD>{c.discountPct}%</TD>
                  <TD>
                    {c.usedCount}
                    {c.maxUses ? ` / ${c.maxUses}` : ""}
                  </TD>
                  <TD>
                    <Badge tone={c.active ? "emerald" : "slate"}>
                      {c.active ? "Active" : "Disabled"}
                    </Badge>
                  </TD>
                  <TD>
                    <div className="flex gap-1">
                      <button
                        onClick={() => toggle(c.id, !c.active)}
                        className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white cursor-pointer"
                        aria-label="Toggle"
                      >
                        {c.active ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => remove(c.id)}
                        className="rounded-lg p-2 text-slate-400 hover:bg-red-500/20 hover:text-red-300 cursor-pointer"
                        aria-label="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </TD>
                </TRow>
              ))}
            </tbody>
          </Table>
          {coupons.length === 0 && (
            <p className="py-10 text-center text-sm text-slate-500">No coupons yet.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/* ── Reviews ──────────────────────────────────────────────────────── */
function ReviewsTab({ reviews, reload }: { reviews: ReviewRow[]; reload: () => void }) {
  const remove = async (id: string) => {
    if (!confirm("Delete this review?")) return;
    await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
    reload();
  };

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-lg font-bold text-white">Customer reviews ({reviews.length})</h2>
        <div className="mt-4 space-y-3">
          {reviews.map((r) => (
            <div key={r.id} className="rounded-xl border border-white/10 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">{r.name}</span>
                    <Badge tone="slate">{r.platformName}</Badge>
                    <span className="text-amber-300 text-sm">{"★".repeat(r.rating)}</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-300">{r.text}</p>
                </div>
                <button
                  onClick={() => remove(r.id)}
                  className="rounded-lg p-2 text-slate-400 hover:bg-red-500/20 hover:text-red-300 cursor-pointer shrink-0"
                  aria-label="Delete review"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
          {reviews.length === 0 && (
            <p className="py-10 text-center text-sm text-slate-500">No reviews yet.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
