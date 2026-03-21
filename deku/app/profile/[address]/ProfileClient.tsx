"use client";

import { useConnection } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { useEffect, useState } from "react";
import { MarketSummary, ProfileStats, ReputationEvent } from "@/models/types";

const mockProfileStats: ProfileStats = {
  accuracy: "72%",
  profit: "+3.2 SOL",
  marketsPlayed: 48,
  followers: 327,
};

const mockMarkets: MarketSummary[] = [
  {
    id: "sol-250",
    title: "Will SOL reach $250 before July 2026?",
    side: "YES",
    size: "$650",
    entryPrice: 0.58,
    currentPrice: 0.63,
    pnl: "+$55",
    status: "Open",
  },
  {
    id: "ai-vs-defi",
    title: "Will AI tokens outperform DeFi in Q2 2026?",
    side: "YES",
    size: "$420",
    entryPrice: 0.54,
    currentPrice: 0.61,
    pnl: "+$29",
    status: "Open",
  },
  {
    id: "sol-etf",
    title: "Will a Solana ETF be approved by end of 2026?",
    side: "NO",
    size: "$300",
    entryPrice: 0.46,
    currentPrice: 0.44,
    pnl: "+$6",
    status: "Open",
  },
  {
    id: "btc-halving",
    title: "Will BTC trade above $100k before the next halving?",
    side: "NO",
    size: "$500",
    entryPrice: 0.41,
    currentPrice: 0.36,
    pnl: "-$25",
    status: "Open",
  },
];

const mockReputationTimeline: ReputationEvent[] = [
  {
    id: "evt-1",
    label: "Called SOL breakout early",
    date: "Feb 2026",
    detail: "Bought YES at 32% on SOL > $150 before Q2; market resolved YES.",
    result: "Win",
    impact: "+4.5% accuracy • +$320 P&L",
  },
  {
    id: "evt-2",
    label: "AI vs DeFi rotation",
    date: "Jan 2026",
    detail: "Took YES on AI tokens outperforming DeFi; market resolved YES.",
    result: "Win",
    impact: "+2.1% accuracy • +$190 P&L",
  },
  {
    id: "evt-3",
    label: "Memecoin overconfidence",
    date: "Dec 2025",
    detail: "Bought YES on memecoins flipping DeFi volume; market resolved NO.",
    result: "Loss",
    impact: "-1.3% accuracy • -$120 P&L",
  },
];

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export default function ProfileClient({ address }: { address: string }) {
  const shortAddress = `${address.slice(0, 4)}...${address.slice(-4)}`;
  const { connection } = useConnection();
  const [profileStats, setProfileStats] = useState<ProfileStats | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      try {
        // Fetch aggregated profile stats from the backend if available
        const res = await fetch(`${API_URL}/profiles/${encodeURIComponent(address)}`);
        if (res.ok) {
          const data = await res.json();
          const accuracyPct = `${Math.round((data.profile.accuracy ?? 0) * 100)}%`;
          const profitLabel = `${data.profile.realizedPnl >= 0 ? "+" : ""}${data.profile.realizedPnl.toFixed(2)} SOL`;

          const base: ProfileStats = {
            accuracy: accuracyPct,
            profit: profitLabel,
            marketsPlayed: data.profile.marketsPlayed ?? 0,
            followers: data.profile.followers ?? 0,
          };

          if (!cancelled) setProfileStats(base);
        }
      } catch {
        // ignore – fall back to mock stats below
      }

      try {
        // Also fetch devnet SOL balance for this address
        const key = new PublicKey(address);
        const lamports = await connection.getBalance(key);
        const sol = lamports / LAMPORTS_PER_SOL;

        if (!cancelled) {
          setProfileStats((prev) => ({
            accuracy: prev?.accuracy ?? mockProfileStats.accuracy,
            profit: prev?.profit ?? mockProfileStats.profit,
            marketsPlayed: prev?.marketsPlayed ?? mockProfileStats.marketsPlayed,
            followers: prev?.followers ?? mockProfileStats.followers,
            solBalance: sol,
          }));
        }
      } catch {
        // ignore balance errors for now
      }
    }

    void loadProfile();

    return () => {
      cancelled = true;
    };
  }, [address, connection]);

  const stats = profileStats ?? mockProfileStats;

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      <main className="mx-auto flex max-w-5xl flex-col gap-10 px-4 pb-24 pt-10">
        {/* Header / identity */}
        <section className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-900 text-sm font-semibold text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900">
              {address.slice(2, 4).toUpperCase()}
            </div>
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-display text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                  0xNarrativeNinja
                </h1>
                <span className="rounded-full border border-zinc-200 bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
                  Top 3% predictors
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-500">
                Wallet: <span className="font-mono text-[11px]">{shortAddress}</span>
              </p>
              <p className="max-w-md text-sm text-zinc-600 dark:text-zinc-400">
                Trading crypto narratives on Solana. Focused on SOL ecosystem, L1 rotations and
                AI vs DeFi cycles. All predictions and P&L are public on-chain.
              </p>
            </div>
          </div>
          <div className="flex flex-col items-start gap-3 text-xs md:items-end">
            <div className="flex gap-2">
              <button className="rounded-full bg-zinc-900 px-4 py-1.5 font-semibold text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200">
                Follow
              </button>
              <button className="rounded-full border border-zinc-300 px-4 py-1.5 font-semibold text-zinc-900 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-900">
                Share profile
              </button>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-500">
              Share this profile to X or Discord so others can track these calls.
            </p>
          </div>
        </section>

        {/* Stats overview */}
        <section className="grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-[11px] text-zinc-500 dark:text-zinc-500">Prediction accuracy</p>
            <p className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
              {stats.accuracy}
            </p>
            <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-500">
              Across {stats.marketsPlayed} resolved markets
            </p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-[11px] text-zinc-500 dark:text-zinc-500">Realized profit</p>
            <p className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
              {stats.profit}
            </p>
            <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-500">
              After fees and closed positions
            </p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-[11px] text-zinc-500 dark:text-zinc-500">Markets played</p>
            <p className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
              {stats.marketsPlayed}
            </p>
            <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-500">
              Open + resolved binary markets
            </p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-[11px] text-zinc-500 dark:text-zinc-500">Followers</p>
            <p className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
              {stats.followers}
            </p>
            <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-500">
              Tracking these predictions
            </p>
          </div>

          {typeof stats.solBalance === "number" && (
            <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-[11px] text-zinc-500 dark:text-zinc-500">Wallet balance (devnet)</p>
              <p className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
                {stats.solBalance.toFixed(3)} SOL
              </p>
              <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-500">
                Live balance for this wallet on Solana devnet
              </p>
            </div>
          )}
        </section>

        {/* Tabs (single page for now) */}
        <section className="flex flex-wrap items-center gap-2 border-b border-zinc-200 pb-2 text-xs dark:border-zinc-800">
          <button className="rounded-full bg-zinc-900 px-3 py-1 font-semibold text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900">
            Overview
          </button>
          <button className="rounded-full px-3 py-1 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900">
            Markets
          </button>
          <button className="rounded-full px-3 py-1 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900">
            History
          </button>
        </section>

        <section className="grid gap-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          {/* Recent markets table */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
                Recent markets
              </h2>
              <button className="text-[11px] font-medium text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100">
                View all
              </button>
            </div>
            <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
              <table className="min-w-full border-collapse text-xs">
                <thead className="border-b border-zinc-200 bg-zinc-50 text-[11px] text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-400">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium">Market</th>
                    <th className="px-4 py-2 text-left font-medium">Side</th>
                    <th className="px-4 py-2 text-right font-medium">Size</th>
                    <th className="px-4 py-2 text-right font-medium">Entry</th>
                    <th className="px-4 py-2 text-right font-medium">Current</th>
                    <th className="px-4 py-2 text-right font-medium">P&L</th>
                    <th className="px-4 py-2 text-right font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {mockMarkets.map((m) => (
                    <tr
                      key={m.id}
                      className="border-t border-zinc-100 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900/80"
                    >
                      <td className="px-4 py-3 align-top">
                        <p className="text-[13px] font-medium text-zinc-900 dark:text-zinc-50">
                          {m.title}
                        </p>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${
                            m.side === "YES"
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300"
                              : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300"
                          }`}
                        >
                          {m.side}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right align-top text-zinc-700 dark:text-zinc-300">
                        {m.size}
                      </td>
                      <td className="px-4 py-3 text-right align-top text-zinc-700 dark:text-zinc-300">
                        {m.entryPrice.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right align-top text-zinc-700 dark:text-zinc-300">
                        {m.currentPrice.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right align-top">
                        <span
                          className={
                            m.pnl.startsWith("-")
                              ? "text-red-600 dark:text-red-300"
                              : "text-emerald-600 dark:text-emerald-300"
                          }
                        >
                          {m.pnl}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right align-top text-[11px] text-zinc-500 dark:text-zinc-400">
                        {m.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Accuracy + reputation */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
                Accuracy breakdown
              </p>
              <div className="mt-4 space-y-3 text-[11px] text-zinc-600 dark:text-zinc-400">
                <div>
                  <div className="flex items-center justify-between">
                    <span>SOL / L1 rotation</span>
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">78%</span>
                  </div>
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                    <div
                      className="h-full rounded-full bg-zinc-900 dark:bg-zinc-50"
                      style={{ width: "78%" }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <span>AI vs DeFi narratives</span>
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">71%</span>
                  </div>
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                    <div
                      className="h-full rounded-full bg-zinc-900 dark:bg-zinc-50"
                      style={{ width: "71%" }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <span>Memecoins / high beta</span>
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">61%</span>
                  </div>
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                    <div
                      className="h-full rounded-full bg-zinc-900 dark:bg-zinc-50"
                      style={{ width: "61%" }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
                Reputation timeline
              </p>
              <div className="mt-4 space-y-4 text-xs">
                {mockReputationTimeline.map((evt) => (
                  <div key={evt.id} className="flex gap-3">
                    <div className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-zinc-900 dark:bg-zinc-50" />
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-zinc-900 dark:text-zinc-50">
                          {evt.label}
                        </p>
                        <span className="text-[11px] text-zinc-500 dark:text-zinc-500">
                          {evt.date}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                            evt.result === "Win"
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300"
                              : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300"
                          }`}
                        >
                          {evt.result}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
                        {evt.detail}
                      </p>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-500">
                        {evt.impact}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
