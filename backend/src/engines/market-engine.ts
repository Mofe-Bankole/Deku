import { prisma } from "../db/prisma-db";
import { redis } from "../db/redis";
import type { CreateMarketInput, MarketDto, MarketListQuery } from "../models/models";
import { MarketStatus } from "@prisma/client";
import slugify from "slugify";

/**
 * Helper: normalize and clamp list query parameters for markets.
 */
function normalizeMarketListQuery(query: MarketListQuery | undefined): Required<MarketListQuery> {
  const status = query?.status ?? "ALL";
  const limitRaw = query?.limit ?? 20;
  const limit = Math.min(Math.max(limitRaw, 1), 100);
  const q = query?.query?.trim() ?? "";
  const cursor = query?.cursor ?? "";

  return { status, limit, query: q, cursor };
}

/**
 * Project a Prisma Market row into the shape returned by the API.
 */
function toMarketDto(market: any): MarketDto {
  return {
    id: market.id,
    slug: market.slug,
    title: market.title,
    description: market.description,
    resolutionRules: market.resolutionRules,
    expiry: market.expiry.toISOString(),
    programId: market.programId,
    marketPda: market.marketPda,
    yesPool: market.yesPool,
    noPool: market.noPool,
    status: market.status,
    outcome: market.outcome,
    creator: market.creator
      ? {
          id: market.creator.id,
          address: market.creator.address,
          displayName: market.creator.displayName,
          avatarUrl: market.creator.avatarUrl,
        }
      : null,
    createdAt: market.createdAt.toISOString(),
    updatedAt: market.updatedAt.toISOString(),
  };
}

/**
 * Create (or find) the User row for a given wallet address.
 *
 * This lets the markets engine remain focused on markets while still
 * maintaining correct foreign keys to the users table.
 */
async function ensureUser(address: string) {
  const normalized = address.trim();

  if (!normalized) {
    throw new Error("creatorAddress is required");
  }

  return prisma.user.upsert({
    where: { address: normalized },
    create: {
      address: normalized,
    },
    update: {},
  });
}

/**
 * Generate a URL‑safe slug from the market title. If a collision occurs
 * we append a short suffix.
 */
async function generateUniqueSlug(title: string): Promise<string> {
  const base = slugify(title, { lower: true, strict: true }) || "market";

  // If base is free, use it.
  const existing = await prisma.market.findUnique({ where: { slug: base } });
  if (!existing) return base;

  // Otherwise, try with a numeric suffix a few times.
  for (let i = 2; i < 10; i++) {
    const candidate = `${base}-${i}`;
    // eslint-disable-next-line no-await-in-loop
    const collision = await prisma.market.findUnique({ where: { slug: candidate } });
    if (!collision) return candidate;
  }

  // Fall back to a timestamp + random suffix if all else fails.
  const randomSuffix = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  return `${base}-${randomSuffix}`;
}

/**
 * Create a new market row in Postgres.
 *
 * This is backend‑only logic; the on‑chain program can later be wired in
 * so that programId / marketPda are populated once the transaction
 * succeeds.
 */
export async function createMarket(input: CreateMarketInput): Promise<MarketDto> {
  const { title, description, resolutionRules, expiry, slug, creatorAddress } = input;

  if (!title?.trim()) throw new Error("title is required");
  if (!resolutionRules?.trim()) throw new Error("resolutionRules is required");
  if (!expiry) throw new Error("expiry is required");

  const expiryDate = new Date(expiry);
  if (Number.isNaN(expiryDate.getTime())) {
    throw new Error("expiry must be a valid ISO8601 timestamp");
  }

  const creator = await ensureUser(creatorAddress);
  const finalSlug = slug?.trim() || (await generateUniqueSlug(title));

  const market = await prisma.market.create({
    data: {
      slug: finalSlug,
      title: title.trim(),
      description: description?.trim() ?? "",
      resolutionRules: resolutionRules.trim(),
      expiry: expiryDate,
      status: MarketStatus.OPEN,
      creatorId: creator.id,
    },
    include: {
      creator: true,
    },
  });

  // Clear cached lists so new market appears immediately.
  await redis.del("markets:list:all");

  return toMarketDto(market);
}

/**
 * Fetch a list of markets, optionally filtered and cached in Redis.
 */
export async function listMarkets(query?: MarketListQuery): Promise<MarketDto[]> {
  const normalized = normalizeMarketListQuery(query);

  // Only cache the simplest case for now to avoid over‑engineering.
  const canUseCache =
    normalized.status === "ALL" && !normalized.query && !normalized.cursor && normalized.limit <= 50;

  if (canUseCache) {
    const cached = await redis.get("markets:list:all");
    if (cached) {
      return JSON.parse(cached) as MarketDto[];
    }
  }

  const where = {
    ...(normalized.status !== "ALL" && { status: normalized.status }),
    ...(normalized.query && {
      OR: [
        { title: { contains: normalized.query, mode: "insensitive" } },
        { description: { contains: normalized.query, mode: "insensitive" } },
        { slug: { contains: normalized.query, mode: "insensitive" } },
      ],
    }),
  };

  const markets = await prisma.market.findMany({
    // where,
    orderBy: { createdAt: "desc" },
    take: normalized.limit,
    include: { creator: true },
  });

  const dtos = markets.map(toMarketDto);

  if (canUseCache) {
    await redis.set("markets:list:all", JSON.stringify(dtos), "EX", 30); // 30 second TTL
  }

  return dtos;
}

/**
 * Fetch a single market by ID or slug.
 */
export async function getMarketByIdOrSlug(idOrSlug: string): Promise<MarketDto | null> {
  const key = idOrSlug.trim();
  if (!key) return null;

  const market = await prisma.market.findFirst({
    where: {
      OR: [{ id: key }, { slug: key }],
    },
    include: { creator: true },
  });

  return market ? toMarketDto(market) : null;
}
