export type StatType = "acorns" | "wonder" | "magic";

export interface LevelConfig {
  level: number;
  wonder_required: number;
  max_wonder: number;
  max_magic: number;
}

export interface UserStats {
  user_id: string;
  level: number;
  acorns: number;
  wonder: number;
  magic: number;
  maxWonder: number;
  maxMagic: number;
}

export interface StatLedger {
  id: string;
  user_id: string;
  stat_type: StatType;
  amount: number;
  reason: string;
  created_at: string;
}
