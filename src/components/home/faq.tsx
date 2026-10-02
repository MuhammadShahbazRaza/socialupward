import { Accordion } from "../ui/accordion";

const FAQS = [
  {
    title: "Do you need my account password?",
    content:
      "Never. We only need your public username or a link to your post/video. Any service that asks for your password is a red flag — your account security is non-negotiable, and our entire delivery system is built to work without login access.",
  },
  {
    title: "How fast will my order start?",
    content:
      "Most orders begin within 15–60 minutes of payment, 24/7. Larger packages (50K+) are drip-fed over hours or days to keep growth looking natural and protect your account. Your order's estimated delivery window is shown before checkout and in the tracker.",
  },
  {
    title: "What's the difference between Standard and Premium/VIP?",
    content:
      "Standard tiers use high-quality profiles at the best price — perfect for social proof. Premium/VIP tiers use active, real-looking accounts with niche and geo targeting, faster delivery, and a 60-day refill guarantee instead of 30. Creators serious about monetization usually pick Premium.",
  },
  {
    title: "Is this safe for my account?",
    content:
      "Yes. We never ask for passwords, we pace delivery to mimic organic growth, and we use high-retention profiles. We've delivered over 2.4M orders with strict safety practices. That said, no growth service can offer a 100% guarantee against platform policy changes — which is why our refill guarantee exists.",
  },
  {
    title: "What if my numbers drop?",
    content:
      "Every order includes a retention guarantee — 30 days on Standard, 60 days on Premium/VIP. If numbers dip below what you ordered within the window, head to the order tracker and request a refill. It's automatic and free.",
  },
  {
    title: "How do bulk discounts work?",
    content:
      "The more units you order, the lower your price per 1,000. Discounts apply automatically at quantity breakpoints (500, 1K, 5K, 10K, 25K, 50K, 100K) — up to 45% off. You'll see the exact per-unit price and savings live in the configurator before you pay.",
  },
  {
    title: "Can I track my order?",
    content:
      "Absolutely. Every order gets a unique order ID emailed to you. Enter it with your email on the Track Order page to see live status: Pending → In Progress → Completed, plus refill requests.",
  },
  {
    title: "What payment methods do you accept?",
    content:
      "We accept all major credit/debit cards via Stripe, plus crypto (BTC, ETH, USDT and more). Card payments are processed over encrypted connections — we never see or store your card details.",
  },
];

export function Faq() {
  return (
    <section id="faq" className="mx-auto max-w-4xl px-4 sm:px-6 py-16 sm:py-24">
      <div className="text-center">
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
          Questions? <span className="text-gradient">Answered.</span>
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-slate-400">
          Everything you need to know before you grow. Still stuck? Our 24/7 support answers in
          under 5 minutes.
        </p>
      </div>
      <Accordion items={FAQS} className="mt-10" />
    </section>
  );
}
