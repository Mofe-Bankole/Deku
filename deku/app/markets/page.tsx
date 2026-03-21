"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../providers";

// Keep the type in sync with the backend MarketDto
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

const FILTERS = ["All", "Open", "Closing soon", "Resolved"] as const;

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export default function MarketsPage() {
  const [query, setQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<(typeof FILTERS)[number]>("All");
  const [markets, setMarkets] = useState<MarketDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        if (selectedFilter === "Open") params.set("status", "OPEN");
        if (selectedFilter === "Resolved") params.set("status", "RESOLVED");
        // "Closing soon" is a UI concept; we derive that client‑side below.
        if (query.trim()) params.set("query", query.trim());

        const res = await fetch(`${API_URL}/markets?${params.toString()}`, {
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error(`Failed to load markets (${res.status})`);
        }

        const data = (await res.json()) as { markets: MarketDto[] };
        if (!cancelled) {
          setMarkets(data.markets ?? []);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.message ?? "Unable to load markets");
          setMarkets([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [query, selectedFilter]);

  const filtered = useMemo(() => {
    const now = Date.now();

    return markets.filter((m) => {
      const expiryMs = new Date(m.expiry).getTime();
      const msToExpiry = expiryMs - now;

      const isClosingSoon =
        m.status === "OPEN" && msToExpiry > 0 && msToExpiry < 1000 * 60 * 60 * 24; // < 24h

      if (selectedFilter === "Closing soon" && !isClosingSoon) return false;
      return true;
    });
  }, [markets, selectedFilter]);

  function computeProbability(m: MarketDto): number {
    const yes = m.yesPool ?? 0;
    const no = m.noPool ?? 0;
    const total = yes + no;
    if (total <= 0) return 0.5;
    return yes / total;
  }

  const openCount = markets.filter((m) => m.status === "OPEN").length;
  const resolvedCount = markets.filter((m) => m.status === "RESOLVED").length;

  const { address } = useAuth();

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      <header className="border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">Deku</span>
          </Link>
          <div className="flex items-center gap-3 text-xs">
            <Link
              href="/markets/create"
              className="rounded-full border border-zinc-300 px-4 py-1.5 font-semibold text-zinc-900 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-900"
            >
              Create market
            </Link>
            <button className="cursor-pointer rounded-full border border-zinc-900/15 bg-zinc-900 px-4 py-1.5 text-xs font-semibold text-zinc-50 hover:bg-zinc-800 dark:border-zinc-50/15 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200">
              {address ? `${address.slice(0, 4)}...${address.slice(-4)}` : "Connect wallet"}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-5xl flex-col gap-6 px-4 pb-24 pt-8">
        <section className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
                Markets
              </p>
              <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                Trade crypto narratives
              </h1>
              <p className="max-w-xl text-xs text-zinc-600 dark:text-zinc-400">
                Browse all live and resolved markets on Deku. Each market represents a crypto narrative priced by the
                crowd. Connect your wallet to place YES/NO positions.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-[11px] text-zinc-500 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
              <span className="text-[11px] text-zinc-400 dark:text-zinc-500">Search</span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Markets, tickers, narratives"
                className="h-6 flex-1 bg-transparent text-xs text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-zinc-100 dark:placeholder:text-zinc-600"
              />
            </div>
            <div className="flex flex-wrap gap-2 text-[11px]">
              {FILTERS.map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setSelectedFilter(filter)}
                  className={`rounded-full border px-3 py-1 font-medium transition-colors ${
                    selectedFilter === filter
                      ? "border-zinc-900 bg-zinc-900 text-zinc-50 dark:border-zinc-50 dark:bg-zinc-50 dark:text-zinc-900"
                      : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="space-y-3">
          {loading && (
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-xs text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
              Loading markets from the Deku backend...
            </div>
          )}

          {error && !loading && (
            <div className="rounded-2xl border border-red-300 bg-red-50 p-4 text-xs text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200">
              {error}
            </div>
          )}

          {!loading && !error && filtered.length === 0 && (
            <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-6 text-xs text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
              No markets match your filters yet. Try clearing the search or creating a new market.
            </div>
          )}

          {!loading && !error && filtered.length > 0 && (
            <div className="grid gap-5 md:grid-cols-2">
              {filtered.map((m) => {
                const probability = computeProbability(m);
                const probabilityPct = Math.round(probability * 100);

                return (
                  <Link
                    key={m.id}
                    href={`/markets/${m.slug}`}
                    className="group flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-4 text-sm text-zinc-900 shadow-sm transition-colors hover:border-zinc-900/40 cursor-pointer dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-zinc-50/40"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <p className="text-[13px] font-medium text-zinc-900 dark:text-zinc-50">{m.title}</p>
                        <p className="text-[11px] text-zinc-500 line-clamp-2 dark:text-zinc-500">{m.description}</p>
                      </div>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                          m.status === "OPEN"
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                            : m.status === "RESOLVED"
                            ? "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                            : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
                        }`}
                      >
                        {m.status === "OPEN" ? "Open" : m.status === "RESOLVED" ? "Resolved" : "Cancelled"}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
                        <span>YES probability</span>
                        <span className="font-medium text-zinc-900 dark:text-zinc-100">{probabilityPct}%</span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                        <div
                          className="h-full rounded-full bg-zinc-900 dark:bg-zinc-50"
                          style={{ width: `${probabilityPct}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-500">
                        <span>Expires</span>
                        <span>{new Date(m.expiry).toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="mt-1 flex gap-2 text-[11px]">
                      <span className="flex-1 rounded-full bg-zinc-900 px-3 py-1.5 text-center font-semibold text-zinc-50 group-hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:group-hover:bg-zinc-200">
                        View market
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
