"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "./providers";

export default function Home() {
  const { address, login } = useAuth();
  const router = useRouter();

  async function handleConnect() {
    await login();
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      <header className="border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            {/* <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 text-xs font-bold text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900">
              D
            </div> */}
            <span className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
              Deku
            </span>
          </div>
          <nav className="hidden gap-6 text-xs font-medium text-zinc-500 dark:text-zinc-400 sm:flex">
            <a
              href="#how-it-works"
              className="hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              How it works
            </a>
            <a
              href="/markets"
              className="hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              Markets
            </a>
            <a
              href="/feed"
              className="hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              Feed
            </a>
            {address && (
              <a
                href={`/profiles/${address}`}
                className="hover:text-zinc-900 dark:hover:text-zinc-100"
              >
                My profile
              </a>
            )}
          </nav>
          <div className="space-x-2">
            <button
              onClick={() => {
                router.push("/auth/login");
              }}
              className="cursor-pointer rounded-full px-4 py-1.5 text-xs font-semibold text-zinc-50 border border-zinc-900/15"
            >
              Login
            </button>
            <button  onClick={() => {
                router.push("/auth/register");
              }} className="cursor-pointer rounded-full border border-zinc-900/15 bg-zinc-900 px-4 py-1.5 text-xs font-semibold text-zinc-50 hover:bg-zinc-800 dark:border-zinc-50/15 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200">
              Get Started
            </button>
          </div>
         
        </div>
      </header>

      <main className="mx-auto flex max-w-5xl flex-col gap-16 px-4 pb-24 pt-10">
        {/* Hero */}
        <section className="grid gap-10 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] md:items-center">
          <div className="space-y-6">
            <p className="inline-flex items-center gap-2 rounded-full border border-blue-400 bg-white px-3 py-1 text-[11px] font-medium text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
              Built for Pacifica
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl md:text-5xl dark:text-zinc-50">
              Trade crypto narratives.
              <br />
              Build a public prediction record.
            </h1>
            <p className="max-w-xl text-sm leading-relaxed text-zinc-600 sm:text-base dark:text-zinc-400">
              Deku turns crypto Twitter narratives into tradable prediction
              markets. Buy YES/NO on outcomes like{" "}
              <span className="text-zinc-900 dark:text-zinc-100">
                “SOL to $250”
              </span>{" "}
              or
              <span className="text-zinc-900 dark:text-zinc-100">
                {" "}
                “AI tokens vs DeFi”
              </span>{" "}
              and build a verifiable track record of how early you really were.
            </p>
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <button className="rounded-full cursor-pointer bg-zinc-900 px-4 py-2 font-semibold text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200">
                Connect wallet & start predicting
              </button>
              <button className="rounded-full border cursor-pointer border-zinc-300 px-4 py-2 font-semibold text-zinc-900 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-900">
                Watch demo flow
              </button>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-500">
                No signup. Your Solana wallet is your identity.
              </p>
            </div>
          </div>

          {/* Hero side card */}
          <div className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-4 text-xs text-zinc-900 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100">
            <div className="flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
              <span>Live narrative</span>
              <span className="rounded-full bg-zinc-900 px-2 py-0.5 text-[10px] font-medium text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900">
                On-chain
              </span>
            </div>
            <div className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-950">
              <p className="text-[11px] text-zinc-500 dark:text-zinc-500">
                Market
              </p>
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                Will SOL reach $250 before July 2026?
              </p>
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
                  <span>YES pool</span>
                  <span>0.63</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                  <div
                    className="h-full rounded-full bg-zinc-900 dark:bg-zinc-50"
                    style={{ width: "63%" }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
                  <span>NO pool</span>
                  <span>0.37</span>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
                <span>Implied probability</span>
                <span className="font-medium text-zinc-900 dark:text-zinc-100">
                  63% YES
                </span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 text-[11px]">
              <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-950">
                <p className="text-zinc-500 dark:text-zinc-500">Total volume</p>
                <p className="mt-1 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                  $32,410
                </p>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-950">
                <p className="text-zinc-500 dark:text-zinc-500">
                  Active traders
                </p>
                <p className="mt-1 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                  1,284
                </p>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-950">
                <p className="text-zinc-500 dark:text-zinc-500">Avg. ROI</p>
                <p className="mt-1 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                  +18.2%
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="space-y-6">
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
            How Deku works
          </h2>
          <div className="grid gap-4 text-sm text-zinc-700 md:grid-cols-3 dark:text-zinc-300">
            <div className="space-y-2 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
                01 • Connect
              </p>
              <p className="font-medium text-zinc-900 dark:text-zinc-50">
                Connect your Solana wallet
              </p>
              <p className="text-[13px] text-zinc-600 dark:text-zinc-400">
                Phantom, Backpack, Solflare and more. Your wallet is your
                identity and trading account.
              </p>
            </div>
            <div className="space-y-2 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
                02 • Predict
              </p>
              <p className="font-medium text-zinc-900 dark:text-zinc-50">
                Trade YES/NO on narratives
              </p>
              <p className="text-[13px] text-zinc-600 dark:text-zinc-400">
                Markets like “AI tokens outperform DeFi” or “Solana ETF
                approved” turn sentiment into prices.
              </p>
            </div>
            <div className="space-y-2 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
                03 • Prove it
              </p>
              <p className="font-medium text-zinc-900 dark:text-zinc-50">
                Build a public track record
              </p>
              <p className="text-[13px] text-zinc-600 dark:text-zinc-400">
                Resolved markets lock in your P&L and accuracy. Followers can
                see who actually called it early.
              </p>
            </div>
          </div>
        </section>

        {/* Markets preview */}
        <section id="markets" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
              Live narratives
            </h2>
            <button className="text-[11px] font-medium text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100">
              View all markets
            </button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              {
                id: "sol-250",
                title: "Will SOL reach $250 before July 2026?",
                probability: 0.63,
                volume: "$12,980",
              },
              {
                id: "ai-vs-defi",
                title: "Will AI tokens outperform DeFi in Q2 2026?",
                probability: 0.61,
                volume: "$8,720",
              },
              {
                id: "sol-etf",
                title: "Will a Solana ETF be approved by end of 2026?",
                probability: 0.44,
                volume: "$5,340",
              },
              {
                id: "memecoins-cycle",
                title: "Will memecoins flip DeFi volume this month?",
                probability: 0.57,
                volume: "$4,210",
              },
            ].map((m) => (
              <div
                key={m.id}
                className="group flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-4 text-sm text-zinc-900 shadow-sm hover:border-zinc-900/40 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-zinc-50/40"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[13px] font-medium text-zinc-900 dark:text-zinc-50">
                    {m.title}
                  </p>
                  <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                    Binary • YES/NO
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
                    <span>YES probability</span>
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">
                      {Math.round(m.probability * 100)}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                    <div
                      className="h-full rounded-full bg-zinc-900 dark:bg-zinc-50"
                      style={{ width: `${m.probability * 100}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-500">
                    <span>Volume</span>
                    <span>{m.volume}</span>
                  </div>
                </div>
                <div className="mt-1 flex gap-2 text-[11px]">
                  <button className="flex-1 rounded-full bg-zinc-900 px-3 py-1.5 font-semibold text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200">
                    Buy YES
                  </button>
                  <button className="flex-1 rounded-full border border-zinc-300 px-3 py-1.5 font-semibold text-zinc-900 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-900">
                    Buy NO
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Profiles / Leaderboard preview */}
        <section id="profiles" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
              Top predictors
            </h2>
            <button className="text-[11px] font-medium text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100">
              View leaderboard
            </button>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                name: "0xNarrativeNinja",
                accuracy: "72%",
                profit: "+$4,320",
              },
              {
                name: "solana_degen",
                accuracy: "68%",
                profit: "+$3,150",
              },
              {
                name: "ai_thesis",
                accuracy: "64%",
                profit: "+$2,890",
              },
            ].map((u) => (
              <div
                key={u.name}
                className="rounded-2xl border border-zinc-200 bg-white p-4 text-xs text-zinc-800 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
              >
                <p className="text-[11px] text-zinc-500 dark:text-zinc-500">
                  Predictor
                </p>
                <p className="mt-1 text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  {u.name}
                </p>
                <div className="mt-3 flex items-center justify-between">
                  <div>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-500">
                      Accuracy
                    </p>
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                      {u.accuracy}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-500">
                      Realized P&L
                    </p>
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                      {u.profit}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
