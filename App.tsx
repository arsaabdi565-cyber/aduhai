
import React, { useEffect, useState } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { auth } from './config/firebase';
import BottomNav from './components/BottomNav';
import SideNav from './components/SideNav';
import Home from './pages/Home';
import Reports from './pages/Reports';
import Profile from './pages/Profile';
import AddStock from './pages/AddStock';
import RemoveStock from './pages/RemoveStock';
import CurrentStock from './pages/CurrentStock';
import Settings from './pages/Settings';
import NotificationContainer from './components/NotificationContainer';
import ItemDetail from './pages/ItemDetail';
import EditStock from './pages/EditStock';
import FirebaseAuth from './pages/FirebaseAuth';
import { useAppContext } from './context/AppContext';
import { SignalSlashIcon } from './components/icons/Icons';

const AppContent: React.FC = () => {
    const location = useLocation();
    const { state } = useAppContext();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
            setUser(firebaseUser);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    if (loading) {
        return (
            <div className="h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-green-500/20 border-t-green-500 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-500 dark:text-gray-400">Memuat...</p>
                </div>
            </div>
        );
    }

    // Jika belum login, tampilkan halaman Firebase Auth
    if (!user) {
        return <FirebaseAuth />;
    }

    const showBottomNav = ['/', '/reports', '/profile'].includes(location.pathname);

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden text-gray-900 dark:text-white transition-colors duration-300">
            <SideNav />
            <div className="flex-1 flex flex-col min-w-0 relative h-full">
                {/* Global Connection Status Indicator 
                    Mobile: Top Right (Small)
                    Desktop: Bottom Left (Inside Sidebar area usually)
                */}
                <div className={`
                    fixed z-[100] pointer-events-none transition-all duration-300
                    top-3 right-3 
                    md:top-auto md:right-auto md:bottom-6 md:left-6
                `}>
                     <div className={`
                        flex items-center gap-1.5 px-2 py-0.5 md:px-3 md:py-1 rounded-full 
                        text-[9px] md:text-[10px] font-bold shadow-sm backdrop-blur-md border 
                        transition-colors duration-500
                        ${state.isOnline 
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
                            : 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400'
                        }
                    `}>
                        {state.isOnline ? (
                             <>
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse shadow-[0_0_5px_rgba(52,211,153,0.8)]"></div>
                                <span className="tracking-wide opacity-90">ONLINE</span>
                            </>
                        ) : (
                            <>
                                <SignalSlashIcon className="w-2.5 h-2.5" />
                                <span className="tracking-wide opacity-90">OFFLINE</span>
                            </>
                        )}
                    </div>
                </div>

                <NotificationContainer />
                <div className="max-w-md md:max-w-none mx-auto w-full h-full bg-gray-50 dark:bg-gray-900 md:bg-gray-100 md:dark:bg-gray-900 text-gray-900 dark:text-white flex flex-col relative shadow-2xl overflow-hidden transition-colors duration-300">
                    <main className="flex-grow pb-20 md:pb-0 overflow-y-auto scrollbar-hide">
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/reports" element={<Reports />} />
                            <Route path="/profile" element={<Profile />} />
                            <Route path="/add-stock" element={<AddStock />} />
                            <Route path="/remove-stock" element={<RemoveStock />} />
                            <Route path="/current-stock" element={<CurrentStock />} />
                            <Route path="/stock/:itemId" element={<ItemDetail />} />
                            <Route path="/edit-stock/:itemId" element={<EditStock />} />
                            <Route path="/settings" element={<Settings />} />
                        </Routes>
                    </main>
                    {showBottomNav && <BottomNav />}
                </div>
            </div>
        </div>
    );
};


const App: React.FC = () => {
    return (
        <HashRouter>
            <AppContent />
        </HashRouter>
    );
};

export default App;