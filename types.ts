
export enum InventoryStatus {
  OK = 'OK',
  LOW = 'LOW',
  OUT = 'OUT'
}

export enum SyncStatus {
  SYNCED = 'Synced',
  PENDING = 'Pending',
  ERROR = 'Error'
}

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  qty: number;
  unit: string;
  category: string;
  location?: string; // Tracks which warehouse the item belongs to
  status: InventoryStatus;
  syncStatus: SyncStatus;
  lastUpdated: string;
}

export interface LocationData {
  id: string;
  name: string;
  itemsCount: number;
  totalStock: number;
  capacityPercent: number;
}

export interface DashboardStats {
  totalItems: number;
  totalStock: number;
  lowStock: number;
  inputs: number;
  outputs: number;
}

export interface ChartData {
  name: string;
  stock: number;
}