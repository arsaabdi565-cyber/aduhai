
import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import type { Item, Transaction } from '../types';
import Header from '../components/Header';
import { ArrowDownTrayIcon, ArrowUpIcon, ArrowDownIcon, BuildingStorefrontIcon } from '../components/icons/Icons';

type TimeFilter = '7d' | '30d' | 'this_month' | 'last_month';
type ExportScope = 'all' | 'current';

const Reports: React.FC = () => {
    const { state } = useAppContext();
    const { theme, warehouses, currentWarehouseId } = state;
    const [timeFilter, setTimeFilter] = useState<TimeFilter>('7d');
    const [view, setView] = useState<'dashboard' | 'history'>('dashboard');
    const [showExportModal, setShowExportModal] = useState(false);

    // Theme-aware constants
    const isDark = theme === 'dark';
    const textColor = isDark ? '#FFFFFF' : '#111827';
    const axisColor = isDark ? '#9CA3AF' : '#4B5563';
    const gridColor = isDark ? '#374151' : '#E5E7EB';
    const tooltipBg = isDark ? '#1F2937' : '#FFFFFF';
    const tooltipBorder = isDark ? '#374151' : '#E5E7EB';

    const [endDate, startDate] = useMemo(() => {
        const end = new Date();
        const start = new Date();

        switch (timeFilter) {
            case '7d':
                start.setDate(end.getDate() - 6);
                break;
            case '30d':
                start.setDate(end.getDate() - 29);
                break;
            case 'this_month':
                start.setDate(1);
                break;
            case 'last_month':
                end.setDate(0); // End of last month
                start.setFullYear(end.getFullYear(), end.getMonth(), 1);
                break;
        }
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        return [end, start];
    }, [timeFilter]);

    const filteredTransactions = useMemo(() => {
        return state.transactions.filter(t => {
            const tDate = new Date(t.date);
            return tDate >= startDate && tDate <= endDate;
        });
    }, [state.transactions, startDate, endDate]);

    const stats = useMemo(() => {
        let stockIn = 0;
        let stockOut = 0;
        filteredTransactions.forEach(t => {
            if (t.type === 'in') {
                stockIn += t.quantity;
            } else if (t.type === 'out') {
                stockOut += t.quantity;
            } else if (t.type === 'adjustment') {
                if (t.changeDirection === 'up') {
                    stockIn += t.quantity;
                } else if (t.changeDirection === 'down') {
                    stockOut += t.quantity;
                }
            }
        });
        return { stockIn, stockOut, change: stockIn - stockOut };
    }, [filteredTransactions]);

    const pieData = useMemo(() => {
        return state.items.map(item => ({
            name: item.name,
            value: item.quantity,
        })).filter(d => d.value > 0);
    }, [state.items]);

    const activityData = useMemo(() => {
        const activityMap = new Map<string, { in: number; out: number }>();
        filteredTransactions.forEach(t => {
            const current = activityMap.get(t.itemId) || { in: 0, out: 0 };
            if (t.type === 'in') {
                current.in += t.quantity;
            } else if (t.type === 'out') {
                current.out += t.quantity;
            } else if (t.type === 'adjustment') {
                if (t.changeDirection === 'up') {
                    current.in += t.quantity;
                } else if (t.changeDirection === 'down') {
                    current.out += t.quantity;
                }
            }
            activityMap.set(t.itemId, current);
        });

        return Array.from(activityMap.entries())
            .map(([itemId, activity]) => ({
                name: state.items.find(i => i.id === itemId)?.name || 'Barang Dihapus',
                stockIn: activity.in,
                stockOut: activity.out,
                totalActivity: activity.in + activity.out,
            }))
            .sort((a, b) => b.totalActivity - a.totalActivity)
            .slice(0, 5);
    }, [filteredTransactions, state.items]);
    
    const handleDownloadClick = () => {
        if (state.warehouses.length > 1) {
            setShowExportModal(true);
        } else {
            generateCSV('all');
        }
    };

    const generateCSV = (scope: ExportScope) => {
        const timeFilterLabels = {
            '7d': '7 Hari Terakhir',
            '30d': '30 Hari Terakhir',
            'this_month': 'Bulan Ini',
            'last_month': 'Bulan Lalu',
        };

        const currentWh = warehouses.find(w => w.id === currentWarehouseId);
        const warehouseLabel = scope === 'current' ? `_${currentWh?.name.replace(/\s/g, '_')}` : '_Semua_Gudang';

        if (view === 'history') {
            let transactionsToExport = [...state.transactions];
            
            // Filter by warehouse if needed
            if (scope === 'current') {
                transactionsToExport = transactionsToExport.filter(t => {
                    const item = state.items.find(i => i.id === t.itemId);
                    return item?.warehouseId === currentWarehouseId;
                });
            }

            // Sort by date
            transactionsToExport.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

            if (transactionsToExport.length === 0) {
                alert("Tidak ada data histori untuk diunduh pada cakupan ini.");
                setShowExportModal(false);
                return;
            }

            const headers = ['Tanggal', 'Gudang', 'Nama Barang', 'SKU', 'Tipe', 'Perubahan Jumlah', 'Catatan'];
            const rows = transactionsToExport.map(t => {
                const item = state.items.find(i => i.id === t.itemId);
                const warehouse = warehouses.find(w => w.id === item?.warehouseId);
                const sanitizedNotes = t.notes ? `"${t.notes.replace(/"/g, '""')}"` : '""';
                let type = '';
                let change = '';
                switch (t.type) {
                    case 'in':
                        type = 'Masuk';
                        change = `+${t.quantity}`;
                        break;
                    case 'out':
                        type = 'Keluar';
                        change = `-${t.quantity}`;
                        break;
                    case 'adjustment':
                        type = 'Koreksi Stok';
                        change = `${t.changeDirection === 'up' ? '+' : '-'}${t.quantity}`;
                        break;
                }

                return [
                    `"${new Date(t.date).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short'})}"`,
                    `"${warehouse?.name || 'N/A'}"`,
                    `"${item?.name || 'Barang Dihapus'}"`,
                    `"${item?.sku || 'N/A'}"`,
                    `"${type}"`,
                    `"${change}"`,
                    sanitizedNotes
                ].join(',');
            });
            const csvContent = [headers.join(','), ...rows].join('\n');
            downloadFile(csvContent, `laporan_histori${warehouseLabel}_${new Date().toISOString().slice(0, 10)}.csv`);
        } else {
            // Dashboard Export
            // Filter items based on scope for pie data and stats
            let scopeItems = state.items;
            if (scope === 'current') {
                scopeItems = scopeItems.filter(i => i.warehouseId === currentWarehouseId);
            }

            const csvRows: string[] = [];
            csvRows.push('Laporan Dashboard Bakul Tani');
            csvRows.push(`"Periode","${timeFilterLabels[timeFilter]}"`);
            csvRows.push(`"Cakupan Data","${scope === 'current' ? currentWh?.name : 'Semua Gudang'}"`);
            csvRows.push(''); 
            
            // Recalculate basic stats for the CSV based on scope
            // Note: The UI displays 'filteredTransactions' which is time-based.
            // For export consistency, we should filter transactions by item warehouse too if scope is current.
            let scopeTransactions = filteredTransactions;
            if (scope === 'current') {
                scopeTransactions = filteredTransactions.filter(t => {
                     const item = state.items.find(i => i.id === t.itemId);
                     return item?.warehouseId === currentWarehouseId;
                });
            }

            let eStockIn = 0;
            let eStockOut = 0;
            scopeTransactions.forEach(t => {
                if (t.type === 'in') eStockIn += t.quantity;
                else if (t.type === 'out') eStockOut += t.quantity;
                else if (t.type === 'adjustment') {
                    if (t.changeDirection === 'up') eStockIn += t.quantity;
                    else if (t.changeDirection === 'down') eStockOut += t.quantity;
                }
            });
            const eChange = eStockIn - eStockOut;

            csvRows.push('Statistik Ringkas (Periode Terpilih)');
            csvRows.push(`"Stok Masuk",${eStockIn}`);
            csvRows.push(`"Stok Keluar",${eStockOut}`);
            csvRows.push(`"Perubahan","${eChange >= 0 ? '+' : ''}${eChange}"`);
            csvRows.push(''); 

            csvRows.push('Distribusi Stok Saat Ini (Total)');
            const scopePieData = scopeItems.map(item => ({ name: item.name, value: item.quantity, warehouse: warehouses.find(w => w.id === item.warehouseId)?.name })).filter(d => d.value > 0);
            
            if (scopePieData.length > 0) {
                csvRows.push('"Nama Barang","Gudang","Jumlah Saat Ini"');
                scopePieData.forEach(data => {
                    csvRows.push(`"${data.name.replace(/"/g, '""')}","${data.warehouse || ''}",${data.value}`);
                });
            } else {
                csvRows.push('Tidak ada data stok.');
            }
            
            const csvContent = csvRows.join('\n');
            downloadFile(csvContent, `laporan_dashboard${warehouseLabel}_${timeFilterLabels[timeFilter].replace(/\s/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`);
        }
        setShowExportModal(false);
    };

    const downloadFile = (content: string, filename: string) => {
        const blob = new Blob([`\uFEFF${content}`], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#EC4899'];

    const renderTransactionHistory = () => {
        const sortedTransactions = [...state.transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        const getTransactionDisplay = (t: Transaction) => {
            let color = 'text-gray-500 dark:text-gray-400';
            let text = '';
            let change = '';
            
            switch (t.type) {
                case 'in':
                    color = 'text-green-600 dark:text-green-400';
                    text = 'Masuk';
                    change = `+${t.quantity}`;
                    break;
                case 'out':
                    color = 'text-red-600 dark:text-red-400';
                    text = 'Keluar';
                    change = `-${t.quantity}`;
                    break;
                case 'adjustment':
                    color = t.changeDirection === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
                    text = 'Koreksi Stok';
                    change = `${t.changeDirection === 'up' ? '+' : '-'}${t.quantity}`;
                    break;
            }
            return { color, text, change };
        };

        return (
            <div className="p-4 md:p-8 space-y-3 max-w-4xl mx-auto pb-24">
                <div className="flex justify-between items-center mb-4">
                     <h2 className="text-xl font-bold text-gray-900 dark:text-white">Histori Transaksi</h2>
                     <span className="text-sm text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">Total: {sortedTransactions.length}</span>
                </div>
               
                {sortedTransactions.map(t => {
                    const item = state.items.find(i => i.id === t.itemId);
                    const warehouse = warehouses.find(w => w.id === item?.warehouseId);
                    const display = getTransactionDisplay(t);
                    return (
                        <div key={t.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex justify-between items-center transition-colors">
                            <div>
                                <p className="font-semibold text-gray-900 dark:text-white">{item?.name || 'Barang Dihapus'}</p>
                                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                    <span>{new Date(t.date).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short'})}</span>
                                    <span>•</span>
                                    <span>{warehouse?.name || 'Gudang N/A'}</span>
                                </div>
                            </div>
                            <div className={`font-bold text-right ${display.color}`}>
                                <p>{display.text} ({display.change})</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    const renderDashboard = () => (
        <div className="p-4 md:p-8 space-y-6 pb-24">
            <div>
                {/* Time Filters */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {['7d', '30d', 'this_month', 'last_month'].map((tf) => (
                        <button 
                            key={tf}
                            onClick={() => setTimeFilter(tf as TimeFilter)} 
                            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                                timeFilter === tf 
                                ? 'bg-green-600 text-white shadow-md' 
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                            }`}
                        >
                            {tf === '7d' ? '7 Hari' : tf === '30d' ? '30 Hari' : tf === 'this_month' ? 'Bulan Ini' : 'Bulan Lalu'}
                        </button>
                    ))}
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                    <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-center">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Stok Masuk</p>
                        <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.stockIn}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-center">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Stok Keluar</p>
                        <p className="text-3xl font-bold text-red-600 dark:text-red-400">{stats.stockOut}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-center">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Net Perubahan</p>
                        <div className={`flex items-center justify-center gap-2 text-3xl font-bold ${stats.change > 0 ? 'text-green-600 dark:text-green-400' : stats.change < 0 ? 'text-red-600 dark:text-red-400' : 'text-blue-500'}`}>
                            {stats.change > 0 && <ArrowUpIcon className="w-6 h-6" />}
                            {stats.change < 0 && <ArrowDownIcon className="w-6 h-6" />}
                            <span>{stats.change >= 0 ? `+${stats.change}` : stats.change}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pie Chart Card */}
                <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2">Distribusi Stok per Barang</h3>
                    <div style={{ width: '100%', height: 250 }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie 
                                    data={pieData} 
                                    dataKey="value" 
                                    nameKey="name" 
                                    cx="50%" 
                                    cy="50%" 
                                    outerRadius={80} 
                                    stroke={isDark ? '#1F2937' : '#fff'}
                                    strokeWidth={2}
                                    labelLine={false}
                                >
                                    {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, borderRadius: '8px', color: textColor }} 
                                    itemStyle={{ color: textColor }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                     <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs md:text-sm mt-2">
                        {pieData.map((entry, index) => (
                            <div key={`legend-${index}`} className="flex items-center bg-gray-100 dark:bg-gray-700/50 px-2 py-1 rounded-full">
                                <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                <span className="text-gray-700 dark:text-gray-200">{entry.name}: {entry.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bar Chart Card */}
                <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-4">Aktivitas Barang Teratas</h3>
                    <div style={{ width: '100%', height: 250 }}>
                        <ResponsiveContainer>
                           <BarChart data={activityData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 20 }}>
                                <XAxis type="number" hide />
                                <YAxis 
                                    type="category" 
                                    dataKey="name" 
                                    width={80} 
                                    tick={{ fill: axisColor, fontSize: 12 }} 
                                    axisLine={false} 
                                    tickLine={false} 
                                    interval={0} 
                                />
                                <Tooltip 
                                    cursor={{fill: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}} 
                                    contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, borderRadius: '8px', color: textColor }}
                                    itemStyle={{ color: textColor }}
                                />
                                <Legend wrapperStyle={{paddingTop: '10px'}} />
                                <Bar dataKey="stockIn" name="Stok Masuk" fill="#10B981" barSize={10} radius={[0, 4, 4, 0]} />
                                <Bar dataKey="stockOut" name="Stok Keluar" fill="#EF4444" barSize={10} radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );

    const currentWarehouse = warehouses.find(w => w.id === currentWarehouseId);

    return (
        <div className="bg-gray-50 dark:bg-gray-900 min-h-full transition-colors duration-300">
            <Header title="Laporan Stok">
                <button onClick={handleDownloadClick} className="p-2 text-white hover:bg-white/10 rounded-full transition-colors">
                    <ArrowDownTrayIcon className="w-6 h-6"/>
                </button>
            </Header>
            <div className="sticky top-16 z-10 flex justify-center p-3 bg-gray-50/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
                <div className="flex bg-gray-200 dark:bg-gray-800 rounded-lg p-1 text-sm shadow-inner">
                    <button 
                        onClick={() => setView('dashboard')} 
                        className={`px-6 py-1.5 rounded-md font-medium transition-all ${view === 'dashboard' ? 'bg-white dark:bg-gray-700 text-green-700 dark:text-green-400 shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
                    >
                        Dashboard
                    </button>
                    <button 
                        onClick={() => setView('history')} 
                        className={`px-6 py-1.5 rounded-md font-medium transition-all ${view === 'history' ? 'bg-white dark:bg-gray-700 text-green-700 dark:text-green-400 shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
                    >
                        Riwayat
                    </button>
                </div>
            </div>
            
            {view === 'dashboard' ? renderDashboard() : renderTransactionHistory()}

            {/* Export Modal */}
            {showExportModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowExportModal(false)}></div>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-sm p-6 relative z-10 shadow-2xl animate-fade-in-right border border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Pilih Data Ekspor</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Pilih cakupan data gudang yang ingin Anda unduh.</p>
                        
                        <div className="space-y-3">
                            <button 
                                onClick={() => generateCSV('current')}
                                className="w-full flex items-center gap-3 p-4 rounded-xl border-2 border-green-500 bg-green-50 dark:bg-green-500/10 text-green-800 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-500/20 transition-all"
                            >
                                <div className="p-2 bg-green-200 dark:bg-green-500/30 rounded-full">
                                    <BuildingStorefrontIcon className="w-5 h-5 text-green-700 dark:text-green-300"/>
                                </div>
                                <div className="text-left">
                                    <span className="block font-bold">Gudang Saat Ini</span>
                                    <span className="text-xs opacity-75">{currentWarehouse?.name}</span>
                                </div>
                            </button>

                            <button 
                                onClick={() => generateCSV('all')}
                                className="w-full flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all text-gray-700 dark:text-gray-200"
                            >
                                 <div className="p-2 bg-gray-100 dark:bg-gray-600 rounded-full">
                                    <ArrowDownTrayIcon className="w-5 h-5"/>
                                </div>
                                <div className="text-left">
                                    <span className="block font-bold">Semua Gudang</span>
                                    <span className="text-xs opacity-75">Gabungan data seluruh gudang</span>
                                </div>
                            </button>
                        </div>

                        <button 
                            onClick={() => setShowExportModal(false)}
                            className="w-full mt-6 py-3 text-gray-500 dark:text-gray-400 font-medium hover:text-gray-700 dark:hover:text-gray-200 transition"
                        >
                            Batal
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Reports;
