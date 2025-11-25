
export interface Notification {
  id: string;
  message: string;
  type: 'warning' | 'info' | 'success';
}

export interface Item {
  id: string;
  name: string;
  unit: string;
  sku: string;
  categoryId?: string;
  warehouseId?: string; // Menambahkan ID Gudang
  lowStockThreshold: number;
  quantity: number;
  createdAt: string;
}

export interface Transaction {
  id:string;
  itemId: string;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  changeDirection?: 'up' | 'down';
  date: string;
  notes: string;
}

export interface Category {
  id: string;
  name: string;
  syncStatus?: 'pending' | 'synced';
}

export interface Warehouse {
  id: string;
  name: string;
  capacity?: number; // Opsional
  syncStatus?: 'pending' | 'synced';
}

export interface User {
  name: string;
  email: string;
  position: string;
  profilePicture?: string;
}

export interface AppState {
  items: Item[];
  transactions: Transaction[];
  categories: Category[];
  warehouses: Warehouse[];
  currentWarehouseId: string;
  user: User;
  notifications: Notification[];
  isLoggedIn: boolean;
  isOnline: boolean;
  theme: 'light' | 'dark';
}

export type Action =
  | { type: 'ADD_ITEM'; payload: { item: Item; transaction: Transaction } }
  | { type: 'UPDATE_STOCK'; payload: { itemId: string; quantityChange: number; transaction: Transaction } }
  | { type: 'UPDATE_ITEM_DETAILS'; payload: Item }
  | { type: 'ADD_CATEGORY'; payload: Category }
  | { type: 'UPDATE_CATEGORY'; payload: Category }
  | { type: 'DELETE_CATEGORY'; payload: { id: string } }
  | { type: 'ADD_WAREHOUSE'; payload: Warehouse }
  | { type: 'UPDATE_WAREHOUSE'; payload: Warehouse }
  | { type: 'DELETE_WAREHOUSE'; payload: { id: string } }
  | { type: 'SELECT_WAREHOUSE'; payload: string }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'RESET_DATA' }
  | { type: 'RESTORE_DATA'; payload: AppState }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'REMOVE_NOTIFICATION'; payload: { id: string } }
  | { type: 'LOGIN'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'SET_ONLINE_STATUS'; payload: boolean }
  | { type: 'SYNC_DATA' }
  | { type: 'SET_THEME'; payload: 'light' | 'dark' };
