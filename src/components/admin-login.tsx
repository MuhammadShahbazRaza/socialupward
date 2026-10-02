"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Loader2, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error ?? "Login failed");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md pt-24 pb-20 px-4">
      <Card>
        <CardContent className="p-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600">
            <LayoutDashboard className="h-7 w-7 text-white" />
          </div>
          <h1 className="mt-5 text-center text-2xl font-extrabold">Admin Panel</h1>
          <p className="mt-1 text-center text-sm text-slate-400">
            Enter the admin password to manage SocialUpward.
          </p>
          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <Label>Admin password</Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  className="pl-10"
                  autoFocus
                />
              </div>
            </div>
            {error && <p className="text-sm text-red-300">{error}</p>}
            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Unlock Dashboard"}
            </Button>
          </form>
          <p className="mt-4 text-center text-xs text-slate-500">
            Set via the <code className="text-indigo-300">ADMIN_PASSWORD</code> environment variable.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
