"use client";

import { ConnectionProvider, WalletProvider, useWallet } from "@solana/wallet-adapter-react";
import { PhantomWalletAdapter, SolflareWalletAdapter} from "@solana/wallet-adapter-wallets";
import { clusterApiUrl } from "@solana/web3.js";
import React, { ReactNode, useEffect, useMemo, useState } from "react";

interface AuthContextValue {
  address: string | null;
  token: string | null;
  login: (opts?: { force?: boolean }) => Promise<void>;
}

export const AuthContext = React.createContext<AuthContextValue | undefined>(undefined);

export function useAuth(): AuthContextValue {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <Providers>");
  return ctx;
}

interface ProvidersProps {
  children: ReactNode;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

const SOLANA_CLUSTER = process.env.NEXT_PUBLIC_SOLANA_CLUSTER ?? "devnet";
const SOLANA_RPC = process.env.NEXT_PUBLIC_SOLANA_RPC_ENDPOINT;

function InnerAuthProvider({ children }: { children: ReactNode }) {
  const { publicKey, connected, connect, wallets, wallet, select } = useWallet();

  const [address, setAddress] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Hydrate auth state from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("deku_auth");
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored) as { address?: string; token?: string };
      setAddress(parsed.address ?? null);
      setToken(parsed.token ?? null);
    } catch {
      // ignore
    }
  }, []);

  // Sync address with connected wallet
  useEffect(() => {
    if (publicKey) {
      const nextAddress = publicKey.toBase58();
      setAddress(nextAddress);
      if (typeof window !== "undefined") {
        const stored = window.localStorage.getItem("deku_auth");
        const parsed = stored ? JSON.parse(stored) : {};
        window.localStorage.setItem(
          "deku_auth",
          JSON.stringify({ ...parsed, address: nextAddress }),
        );
      }
    } else if (!connected) {
      setAddress(null);
    }
  }, [publicKey, connected]);

  async function login(opts?: { force?: boolean }) {
    // If not connected, pick a default wallet (Phantom/Solflare) and trigger connect
    if (!connected || !publicKey) {
      try {
        if (!wallet) {
          const preferred = wallets.find((w) =>
            ["Phantom", "Solflare"].includes(w.adapter.name),
          ) ?? wallets[0];

          if (preferred) {
            select(preferred.adapter.name);
          }
        }

        await connect();
      } catch (err: any) {
        console.error("Wallet connect failed", err);
        throw new Error("Please connect a wallet (Phantom or Solflare) in your browser and try again.");
      }
    }

    const walletAddress = publicKey?.toBase58();
    
    if (!walletAddress) {
      throw new Error("Wallet not connected");
    }

    setAddress(walletAddress);

    // 1) Request nonce from backend
    const nonceRes = await fetch(
      `${API_URL}/auth/nonce?address=${encodeURIComponent(walletAddress)}`,
    );

    if (!nonceRes.ok) {
      throw new Error("Unable to request nonce from Deku backend");
    }

    const { nonce } = (await nonceRes.json()) as { nonce: string };

    const message = `Sign this message to sign in to Deku.\nAddress: ${walletAddress}\nNonce: ${nonce}`;

    // For hackathon MVP, we still send a placeholder signature; the backend
    // only checks that the nonce is present in the message. This can be
    // upgraded later to use real signMessage verification.
    const verifyRes = await fetch(`${API_URL}/auth/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address: walletAddress, message, signature: "hackathon-placeholder" }),
    });

    if (!verifyRes.ok) {
      const data = await verifyRes.json().catch(() => ({}));
      throw new Error(data?.error ?? "Unable to verify wallet signature");
    }

    const data = (await verifyRes.json()) as { token: string; user: { address: string } };
    setToken(data.token);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(
        "deku_auth",
        JSON.stringify({ address: data.user.address, token: data.token }),
      );
    }
  }

  const authValue: AuthContextValue = {
    address,
    token,
    login,
  };

  return <AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>;
}

export function Providers({ children }: ProvidersProps) {
  const endpoint = useMemo(
    () => SOLANA_RPC || clusterApiUrl(SOLANA_CLUSTER as any),
    [],
  );

  const wallets = useMemo(
    () => [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
    [],
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <InnerAuthProvider>{children}</InnerAuthProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
