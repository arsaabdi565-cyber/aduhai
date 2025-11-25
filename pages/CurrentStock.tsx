
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import { useAppContext } from '../context/AppContext';
import { QrCodeIcon, PencilIcon, InformationCircleIcon } from '../components/icons/Icons';

const CurrentStock: React.FC = () => {
    const { state } = useAppContext();
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState<'name_asc' | 'name_desc' | 'qty_asc' | 'qty_desc'>('name_asc');

    const sortedAndFilteredItems = [...state.items]
        .filter(item => 
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            item.sku.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => {
            switch (sortBy) {
                case 'name_asc':
                    return a.name.localeCompare(b.name);
                case 'name_desc':
                    return b.name.localeCompare(a.name);
                case 'qty_asc':
                    return a.quantity - b.quantity;
                case 'qty_desc':
                    return b.quantity - a.quantity;
                default:
                    return 0;
            }
        });

    return (
        <div>
            <Header title="Stok Terkini" />
            <div className="p-4 md:p-8">
                <div className="max-w-4xl mx-auto">
                    <div className="relative mb-4">
                        <input
                            type="text"
                            placeholder="Cari nama atau SKU..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-gray-700 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 pr-12"
                        />
                        <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-white">
                            <QrCodeIcon className="w-6 h-6" />
                        </button>
                    </div>
                    
                    <div className="flex justify-between items-center mb-4">
                        <label htmlFor="sort" className="text-sm text-gray-300">Urutkan:</label>
                        <select 
                            id="sort" 
                            value={sortBy} 
                            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                            className="bg-gray-700 text-white text-sm rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                            <option value="name_asc">Nama (A-Z)</option>
                            <option value="name_desc">Nama (Z-A)</option>
                            <option value="qty_asc">Jumlah (Sedikit)</option>
                            <option value="qty_desc">Jumlah (Banyak)</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        {sortedAndFilteredItems.map(item => (
                            <div key={item.id} className={`p-3 rounded-lg flex justify-between items-center transition ${item.quantity <= item.lowStockThreshold && item.lowStockThreshold > 0 ? 'bg-amber-800/50 border border-amber-500/50' : 'bg-gray-800/50'}`}>
                                <div>
                                <p className="font-semibold">{item.name}</p>
                                <p className="text-xs text-gray-400">SKU: {item.sku || 'N/A'}</p>
                                </div>
                                <div className="flex items-center gap-2 md:gap-4">
                                    <div className="text-right">
                                        <p className={`font-bold text-lg ${item.quantity <= item.lowStockThreshold && item.lowStockThreshold > 0 ? 'text-amber-300' : 'text-white'}`}>{item.quantity}</p>
                                        <p className="text-sm text-gray-400">{item.unit}</p>
                                    </div>
                                    <div className="flex flex-col md:flex-row gap-1">
                                        <Link to={`/stock/${item.id}`} className="p-2 text-gray-300 hover:bg-gray-700 rounded-full" aria-label={`Detail untuk ${item.name}`}>
                                            <InformationCircleIcon className="w-5 h-5" />
                                        </Link>
                                        <Link to={`/edit-stock/${item.id}`} className="p-2 text-gray-300 hover:bg-gray-700 rounded-full" aria-label={`Edit ${item.name}`}>
                                            <PencilIcon className="w-5 h-5" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CurrentStock;