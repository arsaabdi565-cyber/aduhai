
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { ArrowDownTrayIcon, ArrowRightOnRectangleIcon, ExclamationTriangleIcon, ArrowDownCircleIcon, ArrowUpCircleIcon, ScaleIcon, TractorIcon, PlantIcon, CubeIcon, BuildingStorefrontIcon, ChevronDownIcon, CheckIcon, CloudArrowUpIcon } from '../components/icons/Icons';
import type { Transaction } from '../types';


const Home: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const { user, items, transactions, warehouses, currentWarehouseId, theme } = state;
    const [showWarehouseModal, setShowWarehouseModal] = useState(false);

    const currentWarehouse = warehouses.find(w => w.id === currentWarehouseId) || warehouses[0];

    const totalStock = items.reduce((sum, item) => sum + item.quantity, 0);
    const lowStockItemsCount = items.filter(item => item.quantity <= item.lowStockThreshold && item.lowStockThreshold > 0).length;

    const crucialItems = items
      .filter(item => item.lowStockThreshold > 0 && item.quantity <= item.lowStockThreshold)
      .sort((a, b) => (a.quantity / a.lowStockThreshold) - (b.quantity / b.lowStockThreshold)) // Sort by severity
      .slice(0, 4);
    
    const recentTransactions = [...transactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
    
    const getTransactionDisplay = (t: Transaction) => {
        let Icon = ScaleIcon;
        let color = 'text-blue-500 dark:text-blue-400';
        let changeText = `${t.changeDirection === 'up' ? '+' : '-'}${t.quantity}`;

        if (t.type === 'in') {
            Icon = ArrowDownCircleIcon;
            color = 'text-green-500 dark:text-green-400';
            changeText = `+${t.quantity}`;
        } else if (t.type === 'out') {
            Icon = ArrowUpCircleIcon;
            color = 'text-red-500 dark:text-red-400';
            changeText = `-${t.quantity}`;
        }
        
        return { Icon, color, changeText };
    };

    const handleSelectWarehouse = (id: string) => {
        dispatch({ type: 'SELECT_WAREHOUSE', payload: id });
        setShowWarehouseModal(false);
    };

    return (
        <div className="flex flex-col min-h-full bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            {/* Header Section */}
            <div className={`p-6 pb-24 md:p-8 md:pb-24 relative overflow-hidden rounded-b-[2.5rem] md:rounded-none transition-colors duration-300 ${theme === 'light' ? 'bg-[#0B2F29]' : 'bg-gradient-to-br from-green-900 to-gray-900'}`}>
                 <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                    <TractorIcon className="absolute -bottom-4 -left-4 w-32 h-32 text-white/5 transform rotate-12" />
                    <PlantIcon className="absolute -top-6 -right-6 w-32 h-32 text-white/5 transform -rotate-12" />
                </div>
                
                {/* Warehouse Selector & User Greeting */}
                <div className="relative z-20 mb-6 flex justify-between items-start">
                    <div>
                         <h1 className="text-2xl md:text-3xl font-bold text-white relative">Halo, {user.name.split(' ')[0]}!</h1>
                         <p className="text-green-200 mt-1 relative text-sm">Kelola stok barang Anda dengan mudah.</p>
                    </div>
                    <button 
                        onClick={() => setShowWarehouseModal(true)} 
                        className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-medium border border-white/20 hover:bg-white/20 transition shadow-lg text-white"
                    >
                        <BuildingStorefrontIcon className="w-4 h-4 text-green-300" />
                        <span className="max-w-[100px] truncate">{currentWarehouse?.name || 'Pilih Gudang'}</span>
                        <ChevronDownIcon className="w-3 h-3 text-green-300" />
                    </button>
                </div>
                
                {/* Header Stats Cards - High Contrast */}
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 z-10 relative">
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl flex items-center justify-between shadow-lg border border-gray-100 dark:border-gray-700 transition-colors">
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Stok</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{totalStock}</p>
                        </div>
                        <div className="p-3 rounded-full bg-green-100 dark:bg-green-500/20">
                            <CubeIcon className="w-6 h-6 text-green-600 dark:text-green-400"/>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl flex items-center justify-between shadow-lg border border-gray-100 dark:border-gray-700 transition-colors">
                         <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Stok Rendah</p>
                            <p className="text-2xl font-bold text-amber-500 mt-1">{lowStockItemsCount}</p>
                        </div>
                         <div className="p-3 rounded-full bg-amber-100 dark:bg-amber-500/20">
                            <ExclamationTriangleIcon className="w-6 h-6 text-amber-600 dark:text-amber-400"/>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Main Content Section */}
            {/* -mt-12 pulls this section up over the green header padding */}
            {/* pt-6 pushes the buttons down so they don't overlap the stats cards */}
            <div className="px-6 pt-6 pb-32 md:px-8 md:pt-8 md:pb-12 flex-grow -mt-12 relative z-10 bg-gray-50 dark:bg-gray-900 rounded-t-[2.5rem] md:rounded-none md:mt-0 md:bg-transparent shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] md:shadow-none">
                
                {/* Action Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    <Link to="/add-stock" className="flex items-center justify-center gap-3 w-full bg-green-600 dark:bg-green-600 text-white font-bold py-4 rounded-xl text-lg shadow-md hover:bg-green-700 dark:hover:bg-green-500 transition-transform transform hover:scale-[1.02]">
                        <ArrowDownTrayIcon className="w-6 h-6"/>
                        Input Stok Masuk
                    </Link>
                    <Link to="/remove-stock" className="flex items-center justify-center gap-3 w-full bg-emerald-600 dark:bg-emerald-600 text-white font-bold py-4 rounded-xl text-lg shadow-md hover:bg-emerald-700 dark:hover:bg-emerald-500 transition-transform transform hover:scale-[1.02]">
                        <ArrowRightOnRectangleIcon className="w-6 h-6"/>
                        Input Stok Keluar
                    </Link>
                    <Link to="/current-stock" className="w-full bg-white dark:bg-gray-700 text-gray-700 dark:text-white font-semibold py-4 rounded-xl text-center text-lg shadow-sm border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition md:col-span-2">
                        Lihat Stok Terkini
                    </Link>
                </div>

                {/* Dashboard Detail Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Crucial Items Card */}
                    <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 transition-colors">
                        <h3 className="flex items-center font-bold mb-4 text-gray-900 dark:text-white text-lg">
                            <div className="bg-amber-100 dark:bg-amber-500/20 p-1.5 rounded-lg mr-3">
                                <ExclamationTriangleIcon className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                            </div>
                            Item Krusial Hari Ini
                        </h3>
                        <div className="space-y-2">
                            {crucialItems.length > 0 ? (
                                crucialItems.map(item => (
                                    <Link to={`/stock/${item.id}`} key={item.id} className="block p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition border border-gray-100 dark:border-transparent">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="font-semibold text-gray-800 dark:text-gray-200">{item.name}</span>
                                            <span className="font-bold text-amber-600 dark:text-amber-400">
                                                Sisa {item.quantity} <span className="text-xs text-gray-500 dark:text-gray-500 font-normal">/ {item.lowStockThreshold}</span>
                                            </span>
                                        </div>
                                    </Link>
                                ))
                            ) : (
                                <div className="text-center py-8 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                                    <CheckIcon className="w-8 h-8 mx-auto text-green-500 mb-2 opacity-50" />
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Stok aman, tidak ada item krusial.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Recent Activity Card */}
                    <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 transition-colors">
                         <h3 className="flex items-center font-bold mb-4 text-gray-900 dark:text-white text-lg">
                            <div className="bg-blue-100 dark:bg-blue-500/20 p-1.5 rounded-lg mr-3">
                                <ScaleIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            Aktivitas Terakhir
                        </h3>
                         <div className="space-y-3">
                            {recentTransactions.length > 0 ? (
                                recentTransactions.map(t => {
                                    const item = items.find(i => i.id === t.itemId);
                                    const { Icon, color, changeText } = getTransactionDisplay(t);
                                    return (
                                        <div key={t.id} className="flex items-center gap-3 text-sm p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/30 transition">
                                            <div className={`p-2 rounded-full bg-gray-100 dark:bg-gray-700/50 ${color}`}>
                                                <Icon className="w-5 h-5" />
                                            </div>
                                            <div className="flex-grow min-w-0">
                                                <p className="font-semibold text-gray-800 dark:text-gray-200 truncate">{item?.name || 'Barang Dihapus'}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(t.date).toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                                            </div>
                                            <p className={`font-bold whitespace-nowrap ${color}`}>{changeText}</p>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="text-center py-8 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Belum ada aktivitas terbaru.</p>
                                </div>
                            )}
                         </div>
                    </div>
                </div>
            </div>

            {/* Warehouse Selection Modal */}
            {showWarehouseModal && (
                <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setShowWarehouseModal(false)}></div>
                    <div className="bg-white dark:bg-gray-900 w-full sm:w-96 rounded-t-2xl sm:rounded-2xl p-6 relative z-10 border-t sm:border border-gray-200 dark:border-gray-700 max-h-[80vh] overflow-y-auto animate-fade-in-right shadow-2xl">
                        <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-full mx-auto mb-6 sm:hidden"></div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <BuildingStorefrontIcon className="w-6 h-6 text-green-600 dark:text-green-400"/>
                            Pilih Gudang Aktif
                        </h3>
                        <div className="space-y-2">
                            {warehouses.map(wh => (
                                <button
                                    key={wh.id}
                                    onClick={() => handleSelectWarehouse(wh.id)}
                                    className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                                        currentWarehouseId === wh.id 
                                        ? 'bg-green-50 dark:bg-green-500/20 border-green-500 text-green-800 dark:text-white ring-1 ring-green-500' 
                                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                    }`}
                                >
                                    <div className="text-left">
                                        <div className="font-bold flex items-center gap-2">
                                            {wh.name}
                                            {wh.syncStatus === 'pending' && (
                                                <span className="text-[10px] bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-500/30 flex items-center gap-1 font-normal">
                                                    <CloudArrowUpIcon className="w-3 h-3" />
                                                </span>
                                            )}
                                        </div>
                                        {wh.capacity && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Kapasitas: {wh.capacity}</p>}
                                    </div>
                                    {currentWarehouseId === wh.id && <CheckIcon className="w-6 h-6 text-green-600 dark:text-green-400"/>}
                                </button>
                            ))}
                        </div>
                        <button 
                            onClick={() => setShowWarehouseModal(false)}
                            className="w-full mt-6 bg-gray-100 dark:bg-gray-800 py-3 rounded-xl font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                        >
                            Tutup
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Home;
