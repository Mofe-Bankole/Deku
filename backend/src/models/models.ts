/**
 * Shared TypeScript models for the Deku backend.
 *
 * These types sit on top of the Prisma models and describe:
 * - The shapes exposed by the HTTP API (DTOs)
 * - Input payloads accepted by handlers
 *
 * They are deliberately explicit and documented so that judges and
 * onboarding engineers can quickly understand what each field means
 * without having to mentally reverse‑engineer the Prisma schema.
 */

import type { MarketStatus, Outcome, PositionStatus } from "@prisma/client";

/**
 * Canonical representation of a market as returned to the frontend.
 *
 * Note that this is a read‑model / DTO – it may omit internal fields
 * and is stable for the UI to depend on.
 */
export interface MarketDto {
  id: string;
  slug: string;
  title: string;
  description: string;

  /**
   * Human‑readable explanation of how the market will resolve.
   * Example: "Resolves YES if the SOL/USD price on Pyth prints ≥ $250
   * before 00:00 UTC on July 1, 2026. Otherwise NO."
   */
  resolutionRules: string;

  /** ISO8601 timestamp when trading stops and resolution can begin. */
  expiry: string;

  /** On‑chain identifiers (optional for MVP; used once the Anchor program is live). */
  programId?: string | null;
  marketPda?: string | null;

  /** Liquidity pools mirrored from on‑chain state. */
  yesPool: number;
  noPool: number;

  status: MarketStatus;
  outcome?: Outcome | null;

  /**
   * Embedded creator summary for profile links and attribution.
   */
  creator?: {
    id: string;
    address: string;
    displayName?: string | null;
    avatarUrl?: string | null;
  } | null;

  createdAt: string;
  updatedAt: string;
}

/**
 * Payload required to create a new market from the API.
 *
 * This will typically be provided by a connected wallet via the frontend,
 * then validated and passed down to the market engine.
 */
export interface CreateMarketInput {
  /** Primary YES/NO question, e.g. "Will SOL reach $250 before July 2026?" */
  title: string;

  /** Short narrative context that can power the homepage feed. */
  description: string;

  /** Crisp, unambiguous resolution rules for this market. */
  resolutionRules: string;

  /**
   * ISO8601 expiry timestamp (UTC).
   * The API will coerce/validate this into a proper Date.
   */
  expiry: string;

  /** Optional slug to override the auto‑generated one. */
  slug?: string;

  /** Wallet address of the creator; used as User.address in the DB. */
  creatorAddress: string;
}

/**
 * Lightweight representation of a position for future extensions of the
 * market API (e.g. including open positions on the market detail page).
 */
export interface PositionDto {
  id: string;
  userId: string;
  marketId: string;
  side: Outcome;
  size: number;
  entryPrice: number;
  currentPrice: number;
  realizedPnl: number;
  unrealizedPnl: number;
  status: PositionStatus;
  createdAt: string;
  updatedAt: string;
}

/** Minimal query parameters supported by the markets listing endpoint. */
export interface MarketListQuery {
  status?: MarketStatus | "ALL";
  /** Optional text search on title / description / slug */
  query?: string;
  /** Limit the number of rows returned; defaults to a safe value in the handler. */
  limit?: number;
  /** Pagination cursor (opaque ID); can be extended later. */
  cursor?: string;
}
