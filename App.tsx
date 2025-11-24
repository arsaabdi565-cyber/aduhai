import React, { useState, useEffect, useRef } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { LayoutDashboard, ClipboardList, User, Signal, Pencil, Check, RefreshCw } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Profile from './pages/Profile';
import { MOCK_INVENTORY, MOCK_LOCATIONS } from './constants';
import { InventoryItem, LocationData, SyncStatus } from './types';

// Bottom Navigation Component for Mobile
const BottomNav: React.FC = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/laporan', label: 'Laporan', icon: ClipboardList },
    { path: '/profil', label: 'Profil', icon: User },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex justify-around items-center z-30 pb-2 pt-2 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      {navItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={`flex flex-col items-center justify-center w-full py-2 transition-colors ${
            isActive(item.path)
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
          }`}
        >
          <item.icon size={24} className={`mb-1 ${isActive(item.path) ? 'fill-current opacity-20' : ''}`} />
          <span className="text-[10px] font-medium">{item.label}</span>
        </Link>
      ))}
    </nav>
  );
};

const App: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Initialize state from LocalStorage if available, otherwise use defaults
  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem('bakultani_inventory');
    return saved ? JSON.parse(saved) : MOCK_INVENTORY;
  });
  
  const [locations, setLocations] = useState<LocationData[]>(() => {
    const saved = localStorage.getItem('bakultani_locations');
    return saved ? JSON.parse(saved) : MOCK_LOCATIONS;
  });

  const [selectedLocation, setSelectedLocation] = useState(''); 
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('bakultani_darkmode') === 'true';
  });
  
  // App Branding State
  const [appName, setAppName] = useState(() => localStorage.getItem('bakultani_appname') || 'BakulTani');
  const [isEditingName, setIsEditingName] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem('bakultani_inventory', JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem('bakultani_locations', JSON.stringify(locations));
  }, [locations]);

  useEffect(() => {
    localStorage.setItem('bakultani_darkmode', String(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('bakultani_appname', appName);
  }, [appName]);

  // Simulate Sync Process
  const performSync = (currentInventory: InventoryItem[]) => {
    const pendingItems = currentInventory.filter(item => item.syncStatus === SyncStatus.PENDING);
    
    if (pendingItems.length > 0) {
      setIsSyncing(true);
      console.log('Syncing data to server...', pendingItems);
      
      // Simulate API Call delay
      setTimeout(() => {
        setInventory(prevInv => prevInv.map(item => 
          item.syncStatus === SyncStatus.PENDING 
            ? { ...item, syncStatus: SyncStatus.SYNCED } 
            : item
        ));
        setIsSyncing(false);
      }, 2000);
    }
  };

  // Monitor Online Status & Sync Logic
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      performSync(inventory);
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check on mount
    if (navigator.onLine) {
      performSync(inventory);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []); // Remove inventory dependency to avoid loop, pass inventory to performSync or use functional update

  // Trigger sync when inventory changes IF we are online and have pending items
  // This handles the case where user adds item while online
  useEffect(() => {
      if (isOnline) {
          const hasPending = inventory.some(item => item.syncStatus === SyncStatus.PENDING);
          if (hasPending && !isSyncing) {
              performSync(inventory);
          }
      }
  }, [inventory, isOnline]); 

  // Default location logic
  useEffect(() => {
    if (!selectedLocation && locations.length > 0) {
      setSelectedLocation(locations[0].name);
    }
  }, [locations, selectedLocation]);

  // Focus input when editing name
  useEffect(() => {
    if (isEditingName && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [isEditingName]);

  const handleAddItem = (newItem: InventoryItem) => {
    setInventory(prev => [newItem, ...prev]);
  };

  const handleUpdateInventory = (newInventory: InventoryItem[]) => {
    setInventory(newInventory);
  };

  const handleAddLocation = (newLoc: LocationData) => {
    setLocations(prev => [...prev, newLoc]);
    setSelectedLocation(newLoc.name);
  };

  const handleNameSave = () => {
    if (appName.trim() === '') {
        setAppName('BakulTani');
    }
    setIsEditingName(false);
  };

  return (
    <HashRouter>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden transition-colors duration-200">
        
        {/* Sidebar (Desktop Only) */}
        <Sidebar isOnline={isOnline} />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
          
          {/* Mobile Header - Sticky */}
          <header className="lg:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex justify-between items-center shrink-0 z-20 sticky top-0 shadow-sm">
             <div className="flex items-center gap-3">
                {/* Editable Title */}
                {isEditingName ? (
                    <div className="flex items-center gap-2">
                        <input 
                            ref={nameInputRef}
                            type="text" 
                            value={appName}
                            onChange={(e) => setAppName(e.target.value)}
                            onBlur={handleNameSave}
                            onKeyDown={(e) => e.key === 'Enter' && handleNameSave()}
                            className="font-bold text-lg text-emerald-900 dark:text-emerald-100 tracking-tight bg-transparent border-b border-emerald-500 outline-none w-40 px-1"
                        />
                        <button onClick={handleNameSave} className="text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/50 p-1 rounded">
                            <Check size={16} />
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                        <h1 className="font-bold text-lg text-emerald-900 dark:text-emerald-100 tracking-tight">{appName}</h1>
                        <button 
                            onClick={() => setIsEditingName(true)} 
                            className="text-gray-300 hover:text-emerald-600 dark:text-gray-600 dark:hover:text-emerald-400 p-1"
                            title="Edit App Name"
                        >
                            <Pencil size={14} />
                        </button>
                    </div>
                )}
             </div>
             
             {/* Status Indicators (Mobile) */}
             <div className="flex items-center gap-2">
                 {isSyncing && (
                     <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-[10px] font-bold border border-blue-200 dark:border-blue-800">
                         <RefreshCw size={10} className="animate-spin" />
                         <span>Syncing</span>
                     </div>
                 )}
                 <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                    isOnline 
                    ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/30 dark:border-green-800 dark:text-green-400' 
                    : 'bg-gray-50 border-gray-200 text-gray-600 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400'
                 }`}>
                    <Signal size={12} className={isOnline ? 'text-green-600 dark:text-green-400' : 'text-gray-400'} />
                    <span>{isOnline ? 'Online' : 'Offline'}</span>
                 </div>
             </div>
          </header>

          {/* Syncing Overlay Toast for Desktop/General */}
          {isSyncing && (
              <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg z-50 flex items-center gap-3 animate-bounce">
                  <RefreshCw size={18} className="animate-spin" />
                  <span className="text-sm font-medium">Koneksi kembali! Mengupload data offline...</span>
              </div>
          )}

          {/* Scrollable Content */}
          <main className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth no-scrollbar">
            <Routes>
              <Route 
                path="/" 
                element={
                  <Dashboard 
                    inventory={inventory} 
                    onAddItem={handleAddItem} 
                    locations={locations}
                    onAddLocation={handleAddLocation}
                    selectedLocation={selectedLocation}
                    onUpdateLocation={setSelectedLocation}
                  />
                } 
              />
              <Route 
                path="/laporan" 
                element={
                  <Inventory 
                    inventory={inventory} 
                    setInventory={handleUpdateInventory}
                    locations={locations}
                    selectedLocation={selectedLocation}
                  />
                } 
              />
              <Route 
                path="/profil" 
                element={
                  <Profile 
                    inventory={inventory} 
                    onRestore={handleUpdateInventory}
                    isDarkMode={isDarkMode}
                    toggleDarkMode={() => setIsDarkMode(!isDarkMode)}
                  />
                } 
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          {/* Bottom Navigation (Mobile Only) */}
          <BottomNav />
        </div>
      </div>
    </HashRouter>
  );
};

export default App;