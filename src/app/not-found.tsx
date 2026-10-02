import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <div className="text-7xl font-extrabold text-gradient">404</div>
      <h1 className="mt-4 text-2xl font-bold text-white">Page not found</h1>
      <p className="mt-2 max-w-md text-slate-400">
        This page drifted off into the algorithm. Let&apos;s get you back to growing.
      </p>
      <Link href="/" className="mt-6">
        <Button>Back to Home</Button>
      </Link>
    </div>
  );
}
