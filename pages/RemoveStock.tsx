
import React, { useState } from 'react';
import Header from '../components/Header';
import { useAppContext } from '../context/AppContext';
import { QrCodeIcon, MinusIcon, PlusIcon } from '../components/icons/Icons';
import type { Item } from '../types';
import { useNavigate } from 'react-router-dom';


const RemoveStock: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedItem, setSelectedItem] = useState<Item | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [notes, setNotes] = useState('');

    const filteredItems = state.items.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        item.sku.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleRemoveStock = () => {
        if (!selectedItem || quantity <= 0 || quantity > selectedItem.quantity) {
            alert("Jumlah tidak valid atau melebihi stok.");
            return;
        }

        const newTransaction = {
            id: 't' + Date.now().toString(),
            itemId: selectedItem.id,
            type: 'out' as const,
            quantity: quantity,
            date: new Date().toISOString(),
            notes: notes,
        };
        dispatch({
            type: 'UPDATE_STOCK',
            payload: {
                itemId: selectedItem.id,
                quantityChange: -quantity,
                transaction: newTransaction,
            },
        });
        setSelectedItem(null);
        setQuantity(1);
        setNotes('');
        navigate('/');
    };

    if (selectedItem) {
        return (
            <div>
                <Header title="Kurangi Stok Barang" />
                <div className="p-4 md:p-8">
                    <div className="max-w-2xl mx-auto space-y-5">
                        <div className="bg-gray-800/50 p-4 rounded-lg">
                            <p className="text-gray-400">Barang</p>
                            <p className="text-xl font-semibold">{selectedItem.name}</p>
                            <p className="text-gray-300">Stok saat ini: {selectedItem.quantity} {selectedItem.unit}</p>
                        </div>
                        <div>
                            <label className="text-sm text-gray-300">Jumlah Keluar</label>
                            <div className="flex items-center gap-4 mt-1">
                                <button type="button" onClick={() => setQuantity(q => Math.max(1, q - 1))} className="bg-gray-700 p-3 rounded-md"><MinusIcon className="w-6 h-6"/></button>
                                <input type="number" value={quantity} onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))} className="w-full bg-gray-700 p-3 rounded-md text-center font-bold text-xl focus:outline-none focus:ring-2 focus:ring-green-500" />
                                <button type="button" onClick={() => setQuantity(q => Math.min(selectedItem.quantity, q + 1))} className="bg-gray-700 p-3 rounded-md"><PlusIcon className="w-6 h-6"/></button>
                            </div>
                        </div>
                        <div>
                            <label className="text-sm text-gray-300">Catatan (Opsional)</label>
                            <input type="text" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Contoh: Penjualan ke pelanggan Y" className="w-full bg-gray-700 p-3 rounded-md mt-1 focus:outline-none focus:ring-2 focus:ring-green-500" />
                        </div>
                        <div className="flex gap-4 pt-4">
                            <button onClick={() => setSelectedItem(null)} className="w-full bg-gray-600 text-white font-bold py-3 rounded-xl hover:bg-gray-500 transition">Batal</button>
                            <button onClick={handleRemoveStock} className="w-full bg-emerald-500 text-white font-bold py-3 rounded-xl hover:bg-emerald-600 transition">Kurangi Stok</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    
    return (
        <div>
            <Header title="Kurangi Stok Barang" />
            <div className="p-4 md:p-8">
                <div className="max-w-2xl mx-auto">
                    <p className="text-sm text-gray-300 mb-2">Pilih Barang</p>
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

                    <div className="space-y-2">
                        {filteredItems.map(item => (
                            <div key={item.id} onClick={() => setSelectedItem(item)} className="bg-gray-800/50 p-3 rounded-lg flex justify-between items-center cursor-pointer hover:bg-gray-700/70 transition">
                                <span className="font-semibold">{item.name}</span>
                                <span className="text-gray-400">{item.quantity} {item.unit}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RemoveStock;
