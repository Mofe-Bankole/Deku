# Deku

A social prediction market for crypto tokens and narratives.

Built for the TokenTon26 Consumer Apps Track.

## Overview

Crypto markets run on narratives.

Deku turns those narratives into tradable prediction markets where users can bet on outcomes and build reputation through accurate predictions.

## Features

### Prediction Markets

Users can create markets like:

- Will SOL reach $250 before July 2026?
- Will AI tokens outperform DeFi this quarter?
- Will a Solana ETF be approved in 2026?

### Social Predictions

Users share predictions directly to X (Twitter) and other social platforms.

### Profiles

Public profiles track:

- Prediction accuracy
- Realized profit
- Markets played

### Leaderboards

Top predictors ranked by performance, so anyone can discover the best forecasters.

## Architecture

**Frontend**

- Next.js (App Router)
- Tailwind CSS
- Shadcn UI

**Backend**

- Rust API (indexing, stats, leaderboards)

**Blockchain**

- Solana program (market creation, trading, resolution, payouts)

**Database**

- Postgres + Redis

## How It Works

1. Connect wallet
2. Browse active markets
3. Buy YES or NO shares
4. Market probabilities update as liquidity changes
5. Markets resolve based on oracle data
6. Winners receive payouts

## Local Development

From the `deku` directory:

```bash
npm install
npm run dev
```

Then open http://localhost:3000 in your browser.

## Demo

The demo will showcase:

- Market creation
- Trading YES/NO
- Probability updates
- Market resolution
- Payout distribution

## Future Vision

Deku becomes the sentiment layer for crypto markets.

Users can trade narratives, follow top predictors, and discover emerging trends before they move the market.
