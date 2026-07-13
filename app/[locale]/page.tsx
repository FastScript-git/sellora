import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Bot,
  Check,
  MessageSquare,
  Radio,
  ShieldCheck,
  Sparkles,
  Workflow,
} from "lucide-react";

const features = [
  {
    icon: Bot,
    title: "AI Employees",
    description:
      "Create digital employees with clear roles, instructions and business goals.",
  },
  {
    icon: BookOpen,
    title: "Business knowledge",
    description:
      "Connect websites, documents, FAQs and notes to every AI Employee.",
  },
  {
    icon: MessageSquare,
    title: "Customer conversations",
    description:
      "Manage conversations across channels from one focused workspace.",
  },
  {
    icon: Workflow,
    title: "Automations",
    description:
      "Build workflows that trigger actions, update contacts and move work forward.",
  },
  {
    icon: Radio,
    title: "Connected channels",
    description:
      "Deploy AI Employees to your website and connect additional channels as you grow.",
  },
  {
    icon: BarChart3,
    title: "Actionable analytics",
    description:
      "Track resolution rate, customer satisfaction, performance and knowledge gaps.",
  },
];

const benefits = [
  "Available to customers around the clock",
  "Works from your verified business knowledge",
  "Maintains a consistent communication style",
  "Scales without adding repetitive manual work",
];

export default function HomePage() {
  return (
    <div className="min-h-screen overflow-hidden bg-background text-foreground">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/5 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Sparkles className="size-4" />
            </span>

            <span className="text-lg font-semibold tracking-tight">
              Sellora
            </span>
          </Link>

          <nav
            aria-label="Landing navigation"
            className="hidden items-center gap-7 md:flex"
          >
            <a
              href="#features"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Features
            </a>

            <a
              href="#how-it-works"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              How it works
            </a>

            <a
              href="#security"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Security
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/en/dashboard"
              className="hidden h-9 items-center justify-center rounded-md px-4 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:inline-flex"
            >
              Dashboard
            </Link>

            <Link
              href="/en/dashboard"
              className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Start Free
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative isolate px-4 pb-24 pt-36 sm:px-6 sm:pb-32 sm:pt-44 lg:px-8">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[680px] bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.18),transparent_58%)]"
          />

          <div className="mx-auto max-w-5xl text-center">
            <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1.5 text-xs font-medium text-blue-300">
              <Sparkles className="size-3.5" />
              AI Employees for modern businesses
            </div>

            <h1 className="mx-auto mt-7 max-w-4xl text-balance text-5xl font-semibold tracking-[-0.04em] sm:text-6xl lg:text-7xl">
              Build an AI workforce that works for your business
              <span className="block bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-400 bg-clip-text text-transparent">
                every hour of every day.
              </span>
            </h1>

            <p className="mx-auto mt-7 max-w-2xl text-balance text-base leading-7 text-muted-foreground sm:text-lg">
              Create digital AI Employees that communicate with customers,
              use your business knowledge and complete repetitive work across
              connected channels.
            </p>

            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/en/dashboard"
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 sm:w-auto"
              >
                Start Free
                <ArrowRight className="size-4" />
              </Link>

              <a
                href="#how-it-works"
                className="inline-flex h-11 w-full items-center justify-center rounded-md border bg-background/70 px-6 text-sm font-medium transition-colors hover:bg-muted sm:w-auto"
              >
                See how it works
              </a>
            </div>

            <p className="mt-4 text-xs text-muted-foreground">
              No credit card required. Start with your first AI Employee.
            </p>
          </div>

          <div className="mx-auto mt-16 max-w-6xl">
            <div className="relative rounded-2xl border border-white/10 bg-card/60 p-2 shadow-2xl shadow-blue-950/20 backdrop-blur">
              <div className="rounded-xl border bg-background">
                <div className="flex h-12 items-center gap-2 border-b px-4">
                  <span className="size-2.5 rounded-full bg-red-400/70" />
                  <span className="size-2.5 rounded-full bg-amber-400/70" />
                  <span className="size-2.5 rounded-full bg-emerald-400/70" />

                  <div className="ml-4 h-6 w-56 rounded-md bg-muted/70" />
                </div>

                <div className="grid min-h-[420px] md:grid-cols-[220px_1fr]">
                  <aside className="hidden border-r p-4 md:block">
                    <div className="mb-6 flex items-center gap-2">
                      <span className="flex size-7 items-center justify-center rounded-lg bg-primary">
                        <Sparkles className="size-3.5 text-primary-foreground" />
                      </span>
                      <span className="text-sm font-semibold">Sellora</span>
                    </div>

                    <div className="space-y-2">
                      {[
                        "Dashboard",
                        "AI Employees",
                        "Knowledge Base",
                        "Conversations",
                        "Automations",
                        "Analytics",
                      ].map((item, index) => (
                        <div
                          key={item}
                          className={`h-9 rounded-md px-3 py-2 text-xs ${
                            index === 1
                              ? "bg-muted text-foreground"
                              : "text-muted-foreground"
                          }`}
                        >
                          {item}
                        </div>
                      ))}
                    </div>
                  </aside>

                  <div className="p-5 sm:p-8">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-medium text-blue-400">
                          AI Employees
                        </p>
                        <h2 className="mt-2 text-xl font-semibold">
                          Your digital workforce
                        </h2>
                      </div>

                      <div className="rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground">
                        Create AI Employee
                      </div>
                    </div>

                    <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                      {[
                        {
                          name: "Alex",
                          role: "Sales Specialist",
                          status: "Active",
                        },
                        {
                          name: "Emma",
                          role: "Customer Support",
                          status: "Active",
                        },
                        {
                          name: "Daniel",
                          role: "Lead Qualifier",
                          status: "Draft",
                        },
                      ].map((employee) => (
                        <div
                          key={employee.name}
                          className="rounded-xl border bg-card p-5"
                        >
                          <div className="flex items-start gap-3">
                            <span className="flex size-9 items-center justify-center rounded-lg border bg-muted/50">
                              <Bot className="size-4 text-muted-foreground" />
                            </span>

                            <div className="min-w-0 flex-1">
                              <p className="font-medium">{employee.name}</p>
                              <p className="mt-1 truncate text-xs text-muted-foreground">
                                {employee.role}
                              </p>
                            </div>

                            <span className="rounded-full border px-2 py-1 text-[10px] text-muted-foreground">
                              {employee.status}
                            </span>
                          </div>

                          <div className="mt-6 h-1.5 rounded-full bg-muted">
                            <div className="h-full w-3/4 rounded-full bg-primary" />
                          </div>

                          <p className="mt-3 text-[11px] text-muted-foreground">
                            Ready to handle customer conversations
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-5 grid gap-4 sm:grid-cols-3">
                      {[
                        ["1,248", "Conversations"],
                        ["86%", "AI Resolution"],
                        ["4.8", "Customer rating"],
                      ].map(([value, label]) => (
                        <div
                          key={label}
                          className="rounded-xl border bg-card p-4"
                        >
                          <p className="text-xl font-semibold">{value}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {label}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="features"
          className="border-y bg-card/30 px-4 py-24 sm:px-6 lg:px-8"
        >
          <div className="mx-auto max-w-7xl">
            <div className="max-w-2xl">
              <p className="text-sm font-medium text-blue-400">
                One platform
              </p>

              <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                Everything your AI workforce needs
              </h2>

              <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">
                Manage identity, knowledge, conversations, tools, channels and
                performance from one focused workspace.
              </p>
            </div>

            <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border bg-border md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => {
                const Icon = feature.icon;

                return (
                  <article key={feature.title} className="bg-background p-7">
                    <span className="flex size-10 items-center justify-center rounded-xl border bg-muted/50">
                      <Icon className="size-4 text-blue-400" />
                    </span>

                    <h3 className="mt-5 font-semibold">{feature.title}</h3>

                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {feature.description}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section
          id="how-it-works"
          className="px-4 py-24 sm:px-6 lg:px-8"
        >
          <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-sm font-medium text-blue-400">
                Simple by design
              </p>

              <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                From setup to real customer work in three steps
              </h2>

              <div className="mt-10 space-y-8">
                {[
                  {
                    number: "01",
                    title: "Create an AI Employee",
                    description:
                      "Choose a name, role, communication style and clear business objective.",
                  },
                  {
                    number: "02",
                    title: "Connect your knowledge",
                    description:
                      "Add the information your employee needs to answer accurately.",
                  },
                  {
                    number: "03",
                    title: "Launch on a channel",
                    description:
                      "Test the experience and connect it to your website or API.",
                  },
                ].map((step) => (
                  <div key={step.number} className="flex gap-5">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full border text-xs font-semibold text-blue-400">
                      {step.number}
                    </span>

                    <div>
                      <h3 className="font-semibold">{step.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border bg-card p-6 sm:p-8">
              <p className="text-sm font-medium">Built for real operations</p>

              <div className="mt-6 space-y-4">
                {benefits.map((benefit) => (
                  <div
                    key={benefit}
                    className="flex items-start gap-3 rounded-xl border bg-background p-4"
                  >
                    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-blue-500/15">
                      <Check className="size-3 text-blue-400" />
                    </span>

                    <p className="text-sm text-muted-foreground">{benefit}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section
          id="security"
          className="border-y bg-card/30 px-4 py-20 sm:px-6 lg:px-8"
        >
          <div className="mx-auto flex max-w-5xl flex-col items-center text-center">
            <span className="flex size-12 items-center justify-center rounded-2xl border bg-background">
              <ShieldCheck className="size-5 text-blue-400" />
            </span>

            <h2 className="mt-6 text-3xl font-semibold tracking-tight">
              Your business data stays separated and controlled
            </h2>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">
              Sellora is built around isolated workspaces, scoped data access
              and controlled knowledge sources for every AI Employee.
            </p>
          </div>
        </section>

        <section className="px-4 py-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl rounded-3xl border bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.18),transparent_65%)] px-6 py-16 text-center sm:px-12">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Create your first AI Employee today
            </h2>

            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-muted-foreground">
              Start building a digital workforce that supports customers and
              helps your business grow around the clock.
            </p>

            <Link
              href="/en/dashboard"
              className="mt-8 inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Start Free
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Sparkles className="size-3.5" />
            </span>

            <span className="text-sm font-semibold">Sellora</span>
          </div>

          <p className="text-xs text-muted-foreground">
            © 2026 Sellora. AI Employees for modern businesses.
          </p>
        </div>
      </footer>
    </div>
  );
}