import { InventoryItem, DashboardStats, ChartData, LocationData } from './types';

// Start with empty inventory
export const MOCK_INVENTORY: InventoryItem[] = [];

// Initialize stats to zero
export const MOCK_STATS: DashboardStats = {
  totalItems: 0,
  totalStock: 0,
  lowStock: 0,
  inputs: 0,
  outputs: 0
};

// Start with NO locations (User must add them)
export const MOCK_LOCATIONS: LocationData[] = [];

// Empty chart data (will be populated dynamically)
export const CHART_DATA: ChartData[] = [];