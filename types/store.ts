export interface StoreItem {
  id: string;
  name: string;
  description: string;
  sprite_key: string;
  cost: number;
  type: string;
  min_level: number;
  created_at: string;
}

export interface MaskedStoreItem {
  id: string;
  name: string | null;
  description: string | null;
  sprite_key: string | null;
  cost: number | null;
  type: string;
  min_level: number;
  created_at: string;
}

export interface Purchase {
  id: string;
  user_id: string;
  item_id: string;
  cost_at_purchase: number;
  type: string;
  expires_at: string | null;
  created_at: string;
  sprite_key: string | null;
}
