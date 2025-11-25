
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { useAppContext } from '../context/AppContext';
import type { Item } from '../types';
import { PlusIcon, MinusIcon, QrCodeIcon } from '../components/icons/Icons';

const AddStock: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const navigate = useNavigate();
    
    const [itemName, setItemName] = useState('');
    const [unit, setUnit] = useState('');
    const [sku, setSku] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [lowStockThreshold, setLowStockThreshold] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [notes, setNotes] = useState('');
    
    const [isNewItem, setIsNewItem] = useState(true);
    const [selectedItem, setSelectedItem] = useState<Item | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredItems = searchTerm ? state.items.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        item.sku.toLowerCase().includes(searchTerm.toLowerCase())
    ) : [];

    const selectItem = (item: Item) => {
        setSelectedItem(item);
        setIsNewItem(false);
        setSearchTerm(item.name);
        setItemName(item.name);
        setUnit(item.unit);
        setSku(item.sku);
        setCategoryId(item.categoryId || '');
        setLowStockThreshold(String(item.lowStockThreshold));
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setSelectedItem(null);
        setIsNewItem(true);
        setItemName(e.target.value);
    }
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isNewItem) {
            const newItem: Item = {
                id: Date.now().toString(),
                name: itemName,
                unit,
                sku,
                categoryId,
                warehouseId: state.currentWarehouseId, // Assign to current warehouse
                lowStockThreshold: Number(lowStockThreshold) || 0,
                quantity: quantity,
                createdAt: new Date().toISOString()
            };
            const newTransaction = {
                id: 't' + Date.now().toString(),
                itemId: newItem.id,
                type: 'in' as const,
                quantity,
                date: new Date().toISOString(),
                notes
            };
            dispatch({ type: 'ADD_ITEM', payload: { item: newItem, transaction: newTransaction } });
        } else if (selectedItem) {
            const newTransaction = {
                id: 't' + Date.now().toString(),
                itemId: selectedItem.id,
                type: 'in' as const,
                quantity,
                date: new Date().toISOString(),
                notes
            };
            dispatch({ type: 'UPDATE_STOCK', payload: { itemId: selectedItem.id, quantityChange: quantity, transaction: newTransaction } });
        }
        
        navigate('/');
    };

    return (
        <div>
            <Header title={isNewItem ? "Tambah Barang Baru" : "Tambah Stok Masuk"} />
            <div className="p-4 md:p-8">
                <form onSubmit={handleSubmit} className="p-4 space-y-5 max-w-2xl mx-auto">
                    <div>
                        <label className="text-sm text-gray-300">Nama Barang</label>
                        <div className="relative">
                            <input
                                type="text"
                                value={searchTerm || itemName}
                                onChange={handleSearchChange}
                                placeholder="Masukkan atau cari nama barang"
                                className="w-full bg-gray-700 p-3 rounded-md mt-1 focus:outline-none focus:ring-2 focus:ring-green-500 pr-12"
                                required
                            />
                            <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-white">
                                <QrCodeIcon className="w-6 h-6"/>
                            </button>
                            {searchTerm && filteredItems.length > 0 && (
                                <div className="absolute z-10 w-full bg-gray-800 rounded-md mt-1 max-h-40 overflow-y-auto">
                                    {filteredItems.map(item => (
                                        <div key={item.id} onClick={() => selectItem(item)} className="p-2 hover:bg-gray-700 cursor-pointer">
                                            {item.name} ({item.sku})
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className={isNewItem ? 'block' : 'hidden'}>
                        <label className="text-sm text-gray-300">Unit Barang</label>
                        <input type="text" value={unit} onChange={e => setUnit(e.target.value)} placeholder="Contoh: kg, pcs, unit" className="w-full bg-gray-700 p-3 rounded-md mt-1 focus:outline-none focus:ring-2 focus:ring-green-500" required={isNewItem} />
                    </div>
                    <div className={isNewItem ? 'block' : 'hidden'}>
                        <label className="text-sm text-gray-300">SKU / Barcode (Opsional)</label>
                        <input type="text" value={sku} onChange={e => setSku(e.target.value)} placeholder="Scan atau masukkan kode unik" className="w-full bg-gray-700 p-3 rounded-md mt-1 focus:outline-none focus:ring-2 focus:ring-green-500" />
                    </div>
                    <div className={isNewItem ? 'block' : 'hidden'}>
                        <label className="text-sm text-gray-300">Kategori (Opsional)</label>
                        <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className="w-full bg-gray-700 p-3 rounded-md mt-1 focus:outline-none focus:ring-2 focus:ring-green-500">
                            <option value="">Tanpa Kategori</option>
                            {state.categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                        </select>
                    </div>
                    <div className={isNewItem ? 'block' : 'hidden'}>
                        <label className="text-sm text-gray-300">Ambang Batas Stok Rendah (Opsional)</label>
                        <input type="number" value={lowStockThreshold} onChange={e => setLowStockThreshold(e.target.value)} placeholder="Contoh: 10" className="w-full bg-gray-700 p-3 rounded-md mt-1 focus:outline-none focus:ring-2 focus:ring-green-500" />
                        <p className="text-xs text-gray-400 mt-1">Dapatkan peringatan di dasbor jika stok kurang dari atau sama dengan angka ini.</p>
                    </div>

                    <div>
                        <label className="text-sm text-gray-300">Jumlah</label>
                        <div className="flex items-center gap-4 mt-1">
                            <button type="button" onClick={() => setQuantity(q => Math.max(1, q - 1))} className="bg-gray-700 p-3 rounded-md"><MinusIcon className="w-6 h-6"/></button>
                            <input type="number" value={quantity} onChange={e => setQuantity(parseInt(e.target.value) || 1)} className="w-full bg-gray-700 p-3 rounded-md text-center font-bold text-xl focus:outline-none focus:ring-2 focus:ring-green-500" />
                            <button type="button" onClick={() => setQuantity(q => q + 1)} className="bg-gray-700 p-3 rounded-md"><PlusIcon className="w-6 h-6"/></button>
                        </div>
                    </div>

                    <div>
                        <label className="text-sm text-gray-300">Catatan (Opsional)</label>
                        <input type="text" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Contoh: Penerimaan dari supplier X" className="w-full bg-gray-700 p-3 rounded-md mt-1 focus:outline-none focus:ring-2 focus:ring-green-500" />
                    </div>

                    <button type="submit" className="w-full bg-green-500 text-white font-bold py-4 rounded-xl text-lg mt-6 hover:bg-green-600 transition">Tambahkan Stok</button>
                </form>
            </div>
        </div>
    );
};

export default AddStock;
