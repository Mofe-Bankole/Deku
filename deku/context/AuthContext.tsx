 "use client";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const STORAGE_KEY = "deku.auth";

export interface StoredAuthState {
  address: string | null;
  token: string | null;
}

export interface AuthContextValue {
  address: string | null;
  token: string | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => void;
  setAddress: (address: string | null) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Hydrate from localStorage on first client render
  useEffect(() => {
    try {
      if (typeof window === "undefined") return;
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;

      const parsed = JSON.parse(raw) as StoredAuthState;
      if (parsed?.address) {
        setAddress(parsed.address);
      }
      if (parsed?.token) {
        setToken(parsed.token);
      }
    } catch {
      // ignore hydration errors
    }
  }, []);

  const persist = useCallback((next: StoredAuthState) => {
    try {
      if (typeof window === "undefined") return;
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore storage errors
    }
  }, []);

  const login = useCallback(async () => {
    if (loading) return;
    setLoading(true);

    try {
      let nextAddress = address;

      // Temporary MVP: if we don't yet have an address from a wallet,
      // ask the user for one so that onboarding can proceed.
      if (!nextAddress) {
        if (typeof window === "undefined") {
          throw new Error("Wallet login is only available in the browser.");
        }

        const input = window.prompt("Enter your Solana wallet address to continue:");
        const trimmed = input?.trim();

        if (!trimmed) {
          throw new Error("A wallet address is required to continue.");
        }

        nextAddress = trimmed;
        setAddress(trimmed);
      }

      // 1) Request nonce for this address
      const nonceRes = await fetch(
        `${API_URL}/auth/nonce?address=${encodeURIComponent(nextAddress!)}`,
      );

      if (!nonceRes.ok) {
        const data = await nonceRes.json().catch(() => ({}));
        throw new Error(data?.error ?? "Unable to start sign-in flow");
      }

      const { nonce } = (await nonceRes.json()) as { nonce: string };

      const message = `Sign in to Deku with address ${nextAddress}.\n\nNonce: ${nonce}`;

      // For the current backend implementation the signature is not actually
      // verified, only the presence of the nonce in the message is checked.
      // We therefore send a placeholder signature for now.
      const signature = "placeholder-signature";

      // 2) Verify and obtain JWT
      const verifyRes = await fetch(`${API_URL}/auth/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address: nextAddress,
          message,
          signature,
        }),
      });

      if (!verifyRes.ok) {
        const data = await verifyRes.json().catch(() => ({}));
        throw new Error(data?.error ?? "Unable to complete sign-in");
      }

      const data = (await verifyRes.json()) as { token: string };
      setToken(data.token);
      persist({ address: nextAddress, token: data.token });
    } finally {
      setLoading(false);
    }
  }, [address, loading, persist]);

  const logout = useCallback(() => {
    setAddress(null);
    setToken(null);
    persist({ address: null, token: null });
  }, [persist]);

  const value: AuthContextValue = {
    address,
    token,
    loading,
    login,
    logout,
    setAddress,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}

