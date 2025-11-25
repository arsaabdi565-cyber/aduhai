
import React, { createContext, useReducer, useContext, useEffect } from 'react';
import type { AppState, Action, Notification } from '../types';

const initialState: AppState = {
  items: [],
  transactions: [],
  categories: [
    { id: 'c1', name: 'Benih', syncStatus: 'synced' },
    { id: 'c2', name: 'Alat', syncStatus: 'synced' },
  ],
  warehouses: [
    { id: 'w1', name: 'Gudang Utama', capacity: 1000, syncStatus: 'synced' }
  ],
  currentWarehouseId: 'w1',
  user: {
    name: 'Azam Ganteng',
    email: 'user@example.com',
    position: 'Owner',
    profilePicture: '',
  },
  notifications: [],
  isLoggedIn: false,
  isOnline: navigator.onLine,
  theme: 'dark', // Default to dark for consistency with previous version
};


const AppContext = createContext<{ state: AppState; dispatch: React.Dispatch<Action> }>({
  state: initialState,
  dispatch: () => null,
});

const appReducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'ADD_ITEM': {
        const { item, transaction } = action.payload;
        return {
            ...state,
            items: [...state.items, item],
            transactions: [...state.transactions, transaction],
        };
    }
    case 'UPDATE_STOCK': {
        const { itemId, quantityChange, transaction } = action.payload;
        const oldItem = state.items.find(item => item.id === itemId);
        const newItems = state.items.map(item =>
            item.id === itemId ? { ...item, quantity: item.quantity + quantityChange } : item
        );
        const updatedItem = newItems.find(item => item.id === itemId);
        let newNotifications = [...state.notifications];

        if (updatedItem && oldItem && transaction.type === 'out' && updatedItem.lowStockThreshold > 0) {
            const oldQuantity = oldItem.quantity;
            const newQuantity = updatedItem.quantity;

            if (newQuantity <= updatedItem.lowStockThreshold && oldQuantity > updatedItem.lowStockThreshold) {
                const hasExistingNotification = state.notifications.some(n => n.message.includes(`"${updatedItem.name}"`));
                if (!hasExistingNotification) {
                    newNotifications.push({
                        id: `notif_${Date.now()}`,
                        message: `Stok untuk "${updatedItem.name}" rendah! Sisa ${newQuantity} ${updatedItem.unit}.`,
                        type: 'warning'
                    });
                }
            }
        }

        return {
            ...state,
            items: newItems,
            transactions: [...state.transactions, transaction],
            notifications: newNotifications,
        };
    }
    case 'UPDATE_ITEM_DETAILS':
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id ? action.payload : item
        ),
      };
    case 'ADD_CATEGORY':
      const newCategory = {
        ...action.payload,
        syncStatus: state.isOnline ? ('synced' as const) : ('pending' as const)
      };
      return {
        ...state,
        categories: [...state.categories, newCategory],
      };
    case 'UPDATE_CATEGORY':
      const updatedCategory = {
        ...action.payload,
         syncStatus: state.isOnline ? ('synced' as const) : ('pending' as const)
      };
      return {
        ...state,
        categories: state.categories.map(cat =>
          cat.id === action.payload.id ? updatedCategory : cat
        ),
      };
    case 'DELETE_CATEGORY':
      return {
        ...state,
        categories: state.categories.filter(cat => cat.id !== action.payload.id),
        items: state.items.map(item => 
          item.categoryId === action.payload.id 
            ? { ...item, categoryId: '' } 
            : item
        ),
      };
    case 'ADD_WAREHOUSE':
      const newWarehouse = {
        ...action.payload,
        syncStatus: state.isOnline ? ('synced' as const) : ('pending' as const)
      };
      return {
        ...state,
        warehouses: [...state.warehouses, newWarehouse],
      };
    case 'UPDATE_WAREHOUSE':
      const updatedWarehouse = {
        ...action.payload,
        syncStatus: state.isOnline ? ('synced' as const) : ('pending' as const)
      };
      return {
        ...state,
        warehouses: state.warehouses.map(wh =>
          wh.id === action.payload.id ? updatedWarehouse : wh
        ),
      };
    case 'DELETE_WAREHOUSE':
       // Prevent deleting the currently selected warehouse
       const isDeletingCurrent = state.currentWarehouseId === action.payload.id;
       const remainingWarehouses = state.warehouses.filter(wh => wh.id !== action.payload.id);
       
      return {
        ...state,
        warehouses: remainingWarehouses,
        currentWarehouseId: isDeletingCurrent && remainingWarehouses.length > 0 ? remainingWarehouses[0].id : state.currentWarehouseId
      };
    case 'SELECT_WAREHOUSE':
        return {
            ...state,
            currentWarehouseId: action.payload
        };
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
      };
    case 'RESET_DATA':
        return { ...initialState, user: state.user, isLoggedIn: state.isLoggedIn, isOnline: state.isOnline, theme: state.theme };
    case 'RESTORE_DATA':
        return { ...action.payload, notifications: [], isOnline: state.isOnline };
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [...state.notifications, action.payload],
      };
    case 'REMOVE_NOTIFICATION': {
        return {
            ...state,
            notifications: state.notifications.filter(n => n.id !== action.payload.id)
        }
    }
    case 'LOGIN':
        return {
            ...state,
            isLoggedIn: true,
            user: { ...state.user, ...action.payload } // Merge with existing default or replace
        };
    case 'LOGOUT':
        return {
            ...state,
            isLoggedIn: false
        };
    case 'SET_ONLINE_STATUS':
        return {
            ...state,
            isOnline: action.payload
        };
    case 'SYNC_DATA':
        // Ubah semua status 'pending' menjadi 'synced' untuk kategori dan gudang
        return {
            ...state,
            categories: state.categories.map(c => ({ ...c, syncStatus: 'synced' })),
            warehouses: state.warehouses.map(w => ({ ...w, syncStatus: 'synced' }))
        };
    case 'SET_THEME':
        return {
            ...state,
            theme: action.payload
        };
    default:
      return state;
  }
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(appReducer, initialState, (initial) => {
        try {
            const storedState = localStorage.getItem('bakulTaniState');
            if (storedState) {
                const parsedState = JSON.parse(storedState);
                
                // Robust merging strategy:
                // 1. Start with initial state to ensure all top-level keys exist (categories, warehouses, etc)
                // 2. Override with stored state
                const mergedState = { ...initial, ...parsedState };
                
                // 3. Reset runtime-only fields
                mergedState.notifications = [];
                mergedState.isOnline = navigator.onLine;
                
                // 4. Validate and migrate Arrays to ensure they are at least empty arrays if corrupt/missing in storage
                mergedState.categories = Array.isArray(mergedState.categories) ? mergedState.categories : initial.categories;
                mergedState.warehouses = Array.isArray(mergedState.warehouses) ? mergedState.warehouses : initial.warehouses;
                mergedState.items = Array.isArray(mergedState.items) ? mergedState.items : initial.items;
                mergedState.transactions = Array.isArray(mergedState.transactions) ? mergedState.transactions : initial.transactions;

                // 5. Apply property migrations
                mergedState.categories = mergedState.categories.map((c: any) => ({
                    ...c,
                    syncStatus: c.syncStatus || 'synced'
                }));

                mergedState.warehouses = mergedState.warehouses.map((w: any) => ({
                    ...w,
                    syncStatus: w.syncStatus || 'synced'
                }));
                
                // Ensure currentWarehouseId exists
                if (!mergedState.currentWarehouseId && mergedState.warehouses.length > 0) {
                    mergedState.currentWarehouseId = mergedState.warehouses[0].id;
                }

                // 5.1 Migrate Items to have warehouseId if missing (Assign to default/first warehouse)
                const defaultWarehouseId = mergedState.warehouses[0]?.id || 'w1';
                mergedState.items = mergedState.items.map((item: any) => ({
                    ...item,
                    warehouseId: item.warehouseId || defaultWarehouseId
                }));
                
                // 6. Ensure user object exists
                mergedState.user = { ...initial.user, ...(mergedState.user || {}) };

                // 7. Ensure theme exists (fallback to stored preference or initial)
                mergedState.theme = mergedState.theme || initial.theme;

                return mergedState;
            }
            return initial;
        } catch (error) {
            console.error("Failed to rehydrate state:", error);
            return initial;
        }
    });

    // Effect for Theme Toggle
    useEffect(() => {
        const root = window.document.documentElement;
        if (state.theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    }, [state.theme]);

    // Listener untuk Online/Offline
    useEffect(() => {
        const handleOnline = () => {
            dispatch({ type: 'SET_ONLINE_STATUS', payload: true });
            // Otomatis sinkronisasi data saat kembali online
            setTimeout(() => {
                dispatch({ type: 'SYNC_DATA' });
                dispatch({
                    type: 'ADD_NOTIFICATION',
                    payload: { id: `notif_sync_${Date.now()}`, message: 'Koneksi kembali! Data telah disinkronkan.', type: 'success' }
                });
            }, 1000); // Simulasi delay server
        };

        const handleOffline = () => {
             dispatch({ type: 'SET_ONLINE_STATUS', payload: false });
             dispatch({
                type: 'ADD_NOTIFICATION',
                payload: { id: `notif_offline_${Date.now()}`, message: 'Anda sedang offline. Perubahan akan disimpan lokal (pending).', type: 'warning' }
            });
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    useEffect(() => {
        // Persist state without notifications
        const stateToPersist = { ...state, notifications: [] };
        localStorage.setItem('bakulTaniState', JSON.stringify(stateToPersist));
    }, [state]);

    return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);
