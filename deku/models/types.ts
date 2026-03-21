
export interface ProfileStats {
    accuracy: string; // e.g. "72%"
    profit: string;   // e.g. "+$4,320" or "+3.2 SOL"
    marketsPlayed: number;
    followers: number;
    solBalance?: number; // optional, devnet SOL wallet balance
  }
  
  export interface MarketSummary {
    id: string;
    title: string;
    side: "YES" | "NO";
    size: string;
    entryPrice: number;
    currentPrice: number;
    pnl: string;
    status: "Open" | "Resolved";
    outcome?: "YES" | "NO";
  }
  
  export interface ReputationEvent {
    id: string;
    label: string;
    date: string;
    detail: string;
    result: "Win" | "Loss";
    impact: string;
  }
  