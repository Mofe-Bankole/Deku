"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useAuth } from "../../providers";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export default function CreateMarketPage() {
  const [title, setTitle] = useState("");
  const [narrative, setNarrative] = useState("");
  const [tag, setTag] = useState("");
  const [description, setDescription] = useState("");
  const [resolutionRule, setResolutionRule] = useState("");
  const [expiry, setExpiry] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { address, token, login } = useAuth();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setSubmitted(false);
    setError(null);

    try {
      if (!address) {
        await login();
      }

      const body = {
        title,
        description,
        resolutionRules: resolutionRule,
        expiry,
      };

      const res = await fetch(`${API_URL}/markets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error ?? `Failed to create market (${res.status})`);
      }

      setSubmitted(true);
      router.push(`/markets/${body.title.toLowerCase().replace("%" , "-")}`)
      // In a polished flow we’d redirect to the new market using next/router.
    } catch (err: any) {
      setError(err?.message ?? "Unable to create market");
    } finally {
      setSubmitting(false);
    }
  }

  const previewTitle = title || "Will SOL reach $250 before July 2026?";

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      <header className="border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">Deku</span>
            </Link>
            <span className="hidden text-[11px] text-zinc-400 sm:inline dark:text-zinc-500">/</span>
            <Link
              href="/markets"
              className="hidden text-[11px] text-zinc-500 hover:text-zinc-900 sm:inline dark:text-zinc-400 dark:hover:text-zinc-100"
            >
              Markets
            </Link>
            <span className="hidden text-[11px] text-zinc-400 sm:inline dark:text-zinc-500">/</span>
            <span className="hidden text-[11px] text-zinc-700 sm:inline dark:text-zinc-300">Create</span>
          </div>
          <button className="cursor-pointer rounded-full border border-zinc-900/15 bg-zinc-900 px-4 py-1.5 text-xs font-semibold text-zinc-50 hover:bg-zinc-800 dark:border-zinc-50/15 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200">
            Connect wallet
          </button>
        </div>
      </header>

      <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 pb-24 pt-8">
        <section className="grid gap-6 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] md:items-start">
          <form
            onSubmit={handleSubmit}
            className="space-y-5 rounded-2xl border border-zinc-200 bg-white p-4 text-xs text-zinc-800 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
          >
            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
                Create a market
              </p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Turn a crypto narrative into a tradable binary market. Keep the resolution rules crisp and
                unambiguous.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-medium text-zinc-600 dark:text-zinc-300">Market question</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Will SOL reach $250 before July 2026?"
                className="mt-2 w-full rounded-sm border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:placeholder:text-zinc-600 dark:focus:border-zinc-100"
              />
              <p className="text-[10px] text-zinc-500 dark:text-zinc-500">Ask it as a clear YES/NO question.</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-[11px] font-medium text-zinc-600 dark:text-zinc-300">Narrative</label>
                <input
                  value={narrative}
                  onChange={(e) => setNarrative(e.target.value)}
                  placeholder="AI tokens, ETF speculation, memecoins..."
                  className="mt-2 w-full rounded-sm border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:placeholder:text-zinc-600 dark:focus:border-zinc-100"
                />
                <p className="text-[10px] text-zinc-500 dark:text-zinc-500">
                  The narrative this market belongs to.
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-medium text-zinc-600 dark:text-zinc-300">Tag / category</label>
                <input
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  placeholder="Price targets, L1 competition, Regulation..."
                  className="mt-2 w-full rounded-sm border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:placeholder:text-zinc-600 dark:focus:border-zinc-100"
                />
                <p className="text-[10px] text-zinc-500 dark:text-zinc-500">Helps group markets on the feed.</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-medium text-zinc-600 dark:text-zinc-300">Short description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Give traders a bit of context on why this narrative matters."
                className="mt-2 w-full resize-none rounded-sm border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:placeholder:text-zinc-600 dark:focus:border-zinc-100"
              />
              <p className="text-[10px] text-zinc-500 dark:text-zinc-500">Optional, but helps shareability on X.</p>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-medium text-zinc-600 dark:text-zinc-300">Resolution rules</label>
              <textarea
                value={resolutionRule}
                onChange={(e) => setResolutionRule(e.target.value)}
                rows={4}
                placeholder="Resolves YES if the SOL/USD price on Pyth or Switchboard prints ≥ $250 at any point before 00:00 UTC on July 1, 2026. Otherwise NO."
                className="mt-2 w-full resize-none rounded-sm border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:placeholder:text-zinc-600 dark:focus:border-zinc-100"
              />
              <p className="text-[10px] text-zinc-500 dark:text-zinc-500">
                Be extremely specific: data sources, dates, timezones, and edge cases.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
              <div className="space-y-2">
                <label className="text-[11px] font-medium text-zinc-600 dark:text-zinc-300">Expiry date</label>
                <input
                  type="datetime-local"
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                  className="mt-2 w-full rounded-sm border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-900 outline-none focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-100"
                />
                <p className="text-[10px] text-zinc-500 dark:text-zinc-500">
                  After this, trading stops and the market awaits resolution.
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-medium text-zinc-600 dark:text-zinc-300">Initial liquidity</label>
                <input
                  type="number"
                  min={0}
                  placeholder="e.g. 1,000 DAURA"
                  className="mt-2 w-full rounded-sm border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:placeholder:text-zinc-600 dark:focus:border-zinc-100"
                />
                <p className="text-[10px] text-zinc-500 dark:text-zinc-500">
                  In the full app, you’ll seed the YES/NO pools with DeAura.
                </p>
              </div>
            </div>

            {error && (
              <div className="rounded-sm border border-red-300 bg-red-50 p-3 text-[11px] text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-2 border-t border-zinc-200 pt-4 text-[11px] dark:border-zinc-800">
              <button
                type="submit"
                disabled={submitting}
                className="w-full cursor-pointer rounded-full bg-zinc-900 px-4 py-2 text-[11px] font-semibold text-zinc-50 hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                {submitting ? "Creating market..." : "Create market"}
              </button>
            </div>
          </form>

          <aside className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-4 text-xs text-zinc-900 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100">
            <div className="flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
              <span>Preview</span>
              <span className="rounded-full bg-zinc-900 px-2 py-0.5 text-[10px] font-medium text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900">
                Market card
              </span>
            </div>
            <div className="mt-2 space-y-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-3 text-xs dark:border-zinc-800 dark:bg-zinc-950">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[13px] font-medium text-zinc-900 dark:text-zinc-50">{previewTitle}</p>
                  <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-500">
                    {narrative || "AI tokens"} • {tag || "Price targets"}
                  </p>
                </div>
                <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                  Binary • YES/NO
                </span>
              </div>
              <div className="mt-2 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
                  <span>YES probability</span>
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">63%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                  <div className="h-full w-[63%] rounded-full bg-zinc-900 dark:bg-zinc-50" />
                </div>
                <div className="flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-500">
                  <span>Volume</span>
                  <span>$0 (new)</span>
                </div>
              </div>
              <div className="mt-2 flex gap-2 text-[11px]">
                <button className="flex-1 rounded-full bg-zinc-900 px-3 py-1.5 font-semibold text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900">
                  Buy YES
                </button>
                <button className="flex-1 rounded-full border border-zinc-300 px-3 py-1.5 font-semibold text-zinc-900 dark:border-zinc-700 dark:text-zinc-100">
                  Buy NO
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3 text-[11px] text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300">
              <p className="font-semibold text-zinc-800 dark:text-zinc-100">Good market hygiene</p>
              <ul className="mt-2 list-disc space-y-1 pl-4">
                <li>Use a clear question with one unambiguous outcome.</li>
                <li>Define exact data sources, dates and timezones.</li>
                <li>Avoid markets that depend on subjective interpretation.</li>
              </ul>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}
