"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

interface MarketDto {
  id: string;
  slug: string;
  title: string;
  description: string;
  resolutionRules: string;
  expiry: string;
  yesPool: number;
  noPool: number;
  status: "OPEN" | "RESOLVED" | "CANCELLED";
  outcome?: "YES" | "NO" | null;
  createdAt: string;
  updatedAt: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export default function MarketDetailPage() {
  const params = useParams<{ id: string }>();
  const [market, setMarket] = useState<MarketDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [side, setSide] = useState<"YES" | "NO">("YES");
  const [stake, setStake] = useState("100");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const idOrSlug = Array.isArray(params.id) ? params.id[0] : params.id;
        const res = await fetch(`${API_URL}/markets/${idOrSlug}`, {
          cache: "no-store",
        });
        if (!res.ok) {
          throw new Error(
            res.status === 404
              ? "Market not found"
              : `Failed to fetch market (${res.status})`,
          );
        }
        const data = (await res.json()) as { market: MarketDto };
        if (!cancelled) setMarket(data.market);
      } catch (err: any) {
        if (!cancelled) setError(err?.message ?? "Unable to load market");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (params.id) {
      load();
    }

    return () => {
      cancelled = true;
    };
  }, [params.id]);

  const { yesPrice, noPrice, probabilityPct } = useMemo(() => {
    if (!market) {
      return { yesPrice: 0.5, noPrice: 0.5, probabilityPct: 50 };
    }
    const yes = market.yesPool ?? 0;
    const no = market.noPool ?? 0;
    const total = yes + no;
    if (total <= 0) return { yesPrice: 0.5, noPrice: 0.5, probabilityPct: 50 };
    const pYes = yes / total;
    return {
      yesPrice: pYes,
      noPrice: 1 - pYes,
      probabilityPct: Math.round(pYes * 100),
    };
  }, [market]);

  const stakeNumber = Number(stake) || 0;
  const estimatedShares =
    stakeNumber *
    (side === "YES"
      ? yesPrice > 0
        ? 1 / yesPrice
        : 0
      : noPrice > 0
        ? 1 / noPrice
        : 0);

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      <header className="border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                Deku
              </span>
            </Link>
            <span className="hidden text-[11px] text-zinc-400 sm:inline dark:text-zinc-500">
              /
            </span>
            <Link
              href="/markets"
              className="hidden text-[11px] text-zinc-500 hover:text-zinc-900 sm:inline dark:text-zinc-400 dark:hover:text-zinc-100"
            >
              Markets
            </Link>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <Link
              href="/markets/create"
              className="hidden rounded-full border border-zinc-300 px-4 py-1.5 font-semibold text-zinc-900 hover:bg-zinc-100 sm:inline dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-900"
            >
              Create market
            </Link>
            <button className="cursor-pointer rounded-full border border-zinc-900/15 bg-zinc-900 px-4 py-1.5 text-xs font-semibold text-zinc-50 hover:bg-zinc-800 dark:border-zinc-50/15 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200">
              Connect wallet
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 pb-24 pt-8">
        {loading && (
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-xs text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
            Loading market...
          </div>
        )}

        {error && !loading && (
          <div className="rounded-2xl border border-red-300 bg-red-50 p-4 text-xs text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200">
            {error}
          </div>
        )}

        {!loading && !error && market && (
          <section className="grid gap-6 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] md:items-start">
            {/* Market overview */}
            <div className="space-y-4">
              <div className="space-y-3 rounded-2xl border border-zinc-200 bg-white p-4 text-sm text-zinc-900 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
                      Market
                    </p>
                    <h1 className="text-lg font-semibold tracking-tight text-zinc-900 sm:text-xl dark:text-zinc-50">
                      {market.title}
                    </h1>
                    <p className="max-w-xl text-[13px] text-zinc-600 dark:text-zinc-400">
                      {market.description}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2 text-[11px]">
                    <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                      Binary • YES/NO
                    </span>
                    <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      Expires {new Date(market.expiry).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="mt-3 grid gap-3 text-[11px] text-zinc-500 sm:grid-cols-3 dark:text-zinc-400">
                  <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-950">
                    <p>YES probability</p>
                    <p className="mt-1 text-base font-semibold text-zinc-900 dark:text-zinc-50">
                      {probabilityPct}%
                    </p>
                    <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-500">
                      Implied odds for YES
                    </p>
                  </div>
                  <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-950">
                    <p>YES pool</p>
                    <p className="mt-1 text-base font-semibold text-zinc-900 dark:text-zinc-50">
                      {market.yesPool}
                    </p>
                    <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-500">
                      SOL staked on YES (devnet)
                    </p>
                  </div>
                  <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-950">
                    <p>NO pool</p>
                    <p className="mt-1 text-base font-semibold text-zinc-900 dark:text-zinc-50">
                      {market.noPool}
                    </p>
                    <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-500">
                      SOL staked on NO (devnet)
                    </p>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
                    <span>YES pool share</span>
                    <span>{yesPrice.toFixed(2)}</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                    <div
                      className="h-full rounded-full bg-zinc-900 dark:bg-zinc-50"
                      style={{ width: `${probabilityPct}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
                    <span>NO pool share</span>
                    <span>{noPrice.toFixed(2)}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
                    <span>Implied probability</span>
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">
                      {probabilityPct}% YES
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-4 text-xs text-zinc-900 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
                    Place a prediction
                  </p>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    Demo only – backend ready underneath
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setSide("YES")}
                    className={`rounded-xl border px-3 py-2 text-left font-medium transition-colors ${
                      side === "YES"
                        ? "border-emerald-500 bg-emerald-500 text-zinc-50 dark:border-emerald-400 dark:bg-emerald-500"
                        : "border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900"
                    }`}
                  >
                    <p className="text-[10px] uppercase tracking-wide">
                      Buy YES
                    </p>
                    <p className="mt-1 text-sm">
                      {probabilityPct}%
                      <span className="ml-1 text-[10px] opacity-70">
                        probability
                      </span>
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSide("NO")}
                    className={`rounded-xl border px-3 py-2 text-left font-medium transition-colors ${
                      side === "NO"
                        ? "border-red-500 bg-red-500 text-zinc-50 dark:border-red-400 dark:bg-red-500"
                        : "border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900"
                    }`}
                  >
                    <p className="text-[10px] uppercase tracking-wide">
                      Buy NO
                    </p>
                    <p className="mt-1 text-sm">
                      {100 - probabilityPct}%
                      <span className="ml-1 text-[10px] opacity-70">
                        probability
                      </span>
                    </p>
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-medium text-zinc-600 dark:text-zinc-300">
                    Stake amount
                  </label>
                  <div className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-[11px] text-zinc-600 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300">
                    <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
                      SOL
                    </span>
                    <input
                      type="number"
                      min={0}
                      value={stake}
                      onChange={(e) => setStake(e.target.value)}
                      className="h-6 flex-1 bg-transparent text-right text-xs text-zinc-900 outline-none dark:text-zinc-100"
                    />
                  </div>
                  <div className="flex gap-2 text-[11px]">
                    {["50", "100", "250"].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setStake(preset)}
                        className="rounded-full cursor-pointer border border-zinc-200 px-2 py-1 text-[11px] text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 rounded-xl bg-zinc-50 p-3 text-[11px] text-zinc-600 dark:bg-zinc-950 dark:text-zinc-300">
                  <div className="flex items-center justify-between">
                    <span>Estimated shares</span>
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">
                      {isFinite(estimatedShares)
                        ? estimatedShares.toFixed(2)
                        : "–"}{" "}
                      {side}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Max payout (on correct outcome)</span>
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">
                      ≈ {stake || 0} SOL
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-zinc-500 dark:text-zinc-500">
                    <span>Protocol fee</span>
                    <span>1% per trade (configurable)</span>
                  </div>
                </div>

                <button className="mt-1 w-full cursor-pointer rounded-full bg-zinc-900 px-4 py-2 text-[11px] font-semibold text-zinc-50 hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200">
                  Connect wallet to confirm trade
                </button>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-500">
                  In the full product, this will trigger a Solana transaction to
                  the Deku program using SOL on devnet as collateral.
                </p>
              </div>
            </div>

            {/* Resolution rules & activity */}
            <div className="space-y-4">
              <div className="rounded-2xl border border-zinc-200 bg-white p-4 text-xs text-zinc-800 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
                <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
                  Resolution rules
                </h2>
                <p className="mt-2 text-[13px] leading-relaxed text-zinc-600 dark:text-zinc-400">
                  {market.resolutionRules}
                </p>
                <p className="mt-3 text-[11px] text-zinc-500 dark:text-zinc-500">
                  Clear rules reduce disputes and manipulation. In production,
                  these rules will be enforced by an on-chain oracle or a
                  clearly defined resolution authority.
                </p>
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-white p-4 text-xs text-zinc-800 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
                    Recent predictions
                  </h2>
                  <span className="text-[11px] text-zinc-500 dark:text-zinc-500">
                    Demo data
                  </span>
                </div>
                <div className="mt-3 space-y-2">
                  {[
                    {
                      wallet: "solana_degen",
                      side: "YES",
                      size: "0.32 SOL",
                      at: "2m ago",
                    },
                    {
                      wallet: "0xNarrativeNinja",
                      side: "NO",
                      size: "0.15 SOL",
                      at: "15m ago",
                    },
                    {
                      wallet: "ai_thesis",
                      side: "YES",
                      size: "0.22 SOL",
                      at: "42m ago",
                    },
                  ].map((t) => (
                    <div
                      key={`${t.wallet}-${t.at}`}
                      className="flex items-center justify-between rounded-xl bg-zinc-50 px-3 py-2 text-[11px] dark:bg-zinc-950"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium text-zinc-900 dark:text-zinc-100">
                          {t.wallet}
                        </span>
                        <span className="text-[10px] text-zinc-500 dark:text-zinc-500">
                          {t.at}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                            t.side === "YES"
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200"
                              : "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200"
                          }`}
                        >
                          {t.side}
                        </span>
                        <span className="text-[11px] text-zinc-600 dark:text-zinc-300">
                          {t.size}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
