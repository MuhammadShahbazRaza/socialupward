import { MousePointerClick, UserCheck, CreditCard, Rocket } from "lucide-react";

const steps = [
  {
    icon: MousePointerClick,
    step: "01",
    title: "Choose your package",
    text: "Pick a platform, select Standard or Premium/VIP, then dial in your quantity. Pricing updates live with bulk discounts.",
  },
  {
    icon: UserCheck,
    step: "02",
    title: "Enter your handle",
    text: "Just your public username or post URL and email. We never ask for your password — ever.",
  },
  {
    icon: CreditCard,
    step: "03",
    title: "Check out securely",
    text: "Pay by card, Stripe or crypto. Get your order ID instantly and track fulfillment in real time.",
  },
  {
    icon: Rocket,
    step: "04",
    title: "Watch it grow",
    text: "Delivery starts within the hour on most services. Drops? Our 30-day refill guarantee has you covered.",
  },
];

export function HowItWorks() {
  return (
    <section className="border-y border-white/5 bg-ink-900/40 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            From checkout to growth in <span className="text-gradient">four steps</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-slate-400">
            No accounts to create, no passwords to share, no waiting days to start.
          </p>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s) => (
            <div key={s.step} className="glass relative rounded-2xl p-6">
              <span className="absolute right-5 top-4 text-5xl font-extrabold text-white/5">
                {s.step}
              </span>
              <s.icon className="h-9 w-9 text-indigo-300" />
              <h3 className="mt-4 font-semibold text-white">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{s.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
