"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../providers";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export default function OnboardingPage() {
  const { address, token, login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function ensureLoggedIn() {
    if (!address || !token) {
      await login();
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await ensureLoggedIn();
      const res = await axios.post(`${API_URL}/profiles/me` , {body: JSON.stringify({ email, username, displayName, bio })})
      if (!res.data.success) {
        const data = await res.data.json().catch(() => ({}));
        throw new Error(data?.error ?? "Unable to complete onboarding");
      }

      const nextAddress = address;
      router.push(`/profiles/${nextAddress}`);
    } catch (err: any) {
      setError(err?.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (!address) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
        <div className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-6 text-sm shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm font-medium">Connect your wallet to get started</p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Your Solana wallet is your identity on Deku. Once connected, you can set a username and email for your profile.
          </p>
          <button
            onClick={() => login()}
            className="mt-2 w-full cursor-pointer rounded-full bg-zinc-900 px-4 py-2 text-xs font-semibold text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Connect wallet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-4 rounded-2xl border border-zinc-200 bg-white p-6 text-sm shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
      >
        <h1 className="text-base font-semibold">Create your Deku profile</h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          We use your wallet as your identity. Add a username and email so friends can find you and we can send notifications later.
        </p>

        <div className="space-y-1">
          <label className="text-[11px] font-medium text-zinc-600 dark:text-zinc-300">Username</label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            placeholder="narrative_ninja"
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs outline-none focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-950"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-medium text-zinc-600 dark:text-zinc-300">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs outline-none focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-950"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-medium text-zinc-600 dark:text-zinc-300">Display name (optional)</label>
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your public name on Deku"
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs outline-none focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-950"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-medium text-zinc-600 dark:text-zinc-300">Bio (optional)</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            placeholder="What do you trade? What narratives do you obsess over?"
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs outline-none focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-950"
          />
        </div>

        {error && (
          <p className="text-[11px] text-red-500 dark:text-red-400">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 w-full cursor-pointer rounded-full bg-zinc-900 px-4 py-2 text-xs font-semibold text-zinc-50 hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {loading ? "Creating profile..." : "Continue to my profile"}
        </button>
      </form>
    </div>
  );
}
