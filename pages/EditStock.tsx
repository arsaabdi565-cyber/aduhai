
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { useAppContext } from '../context/AppContext';
import type { Item } from '../types';
const EditStock: React.FC = () => {
    const { itemId } = useParams<{ itemId: string }>();
    const navigate = useNavigate();
    const { state, dispatch } = useAppContext();
    const itemToEdit = state.items.find(i => i.id === itemId);

    // Form state only holds editable fields
    const [formData, setFormData] = useState({
        name: '',
        unit: '',
        sku: '',
        categoryId: '',
        lowStockThreshold: 0,
    });
    
    useEffect(() => {
        if (itemToEdit) {
            setFormData({
                name: itemToEdit.name,
                unit: itemToEdit.unit,
                sku: itemToEdit.sku,
                categoryId: itemToEdit.categoryId || '',
                lowStockThreshold: itemToEdit.lowStockThreshold,
            });
        }
    }, [itemToEdit]);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'lowStockThreshold' ? Number(value) : value,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!itemToEdit) return;

        const updatedItem: Item = {
            ...itemToEdit, // preserve quantity, createdAt, and id
            ...formData,   // apply updates from form
        };

        dispatch({ type: 'UPDATE_ITEM_DETAILS', payload: updatedItem });
        
        dispatch({
            type: 'ADD_NOTIFICATION',
            payload: {
                id: `notif_${Date.now()}`,
                message: `"${updatedItem.name}" berhasil diperbarui.`,
                type: 'success'
            }
        });

        navigate(`/stock/${itemToEdit.id}`);
    };

    if (!itemToEdit) {
        return (
            <div>
                <Header title="Edit Barang" />
                <p className="p-4 text-center">Barang tidak ditemukan.</p>
            </div>
        );
    }
    
    return (
        <div>
            <Header title="Edit Barang" />
            <div className="p-4 md:p-8">
                <form onSubmit={handleSubmit} className="p-4 space-y-5 max-w-2xl mx-auto">
                    <div>
                        <label htmlFor="name" className="text-sm text-gray-300">Nama Barang</label>
                        <input id="name" name="name" type="text" value={formData.name} onChange={handleChange} className="w-full bg-gray-700 p-3 rounded-md mt-1 focus:outline-none focus:ring-2 focus:ring-green-500" required />
                    </div>
                     <div>
                        <label htmlFor="unit" className="text-sm text-gray-300">Unit Barang</label>
                        <input id="unit" name="unit" type="text" value={formData.unit} onChange={handleChange} placeholder="Contoh: kg, pcs, unit" className="w-full bg-gray-700 p-3 rounded-md mt-1 focus:outline-none focus:ring-2 focus:ring-green-500" required />
                    </div>
                    <div>
                        <label htmlFor="sku" className="text-sm text-gray-300">SKU / Barcode (Opsional)</label>
                        <input id="sku" name="sku" type="text" value={formData.sku} onChange={handleChange} placeholder="Scan atau masukkan kode unik" className="w-full bg-gray-700 p-3 rounded-md mt-1 focus:outline-none focus:ring-2 focus:ring-green-500" />
                    </div>
                    <div>
                        <label htmlFor="categoryId" className="text-sm text-gray-300">Kategori (Opsional)</label>
                        <select id="categoryId" name="categoryId" value={formData.categoryId} onChange={handleChange} className="w-full bg-gray-700 p-3 rounded-md mt-1 focus:outline-none focus:ring-2 focus:ring-green-500">
                            <option value="">Tanpa Kategori</option>
                            {state.categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="lowStockThreshold" className="text-sm text-gray-300">Ambang Batas Stok Rendah (Opsional)</label>
                        <input id="lowStockThreshold" name="lowStockThreshold" type="number" value={formData.lowStockThreshold} onChange={handleChange} placeholder="Contoh: 10" className="w-full bg-gray-700 p-3 rounded-md mt-1 focus:outline-none focus:ring-2 focus:ring-green-500" min="0"/>
                        <p className="text-xs text-gray-400 mt-1">Dapatkan peringatan di dasbor jika stok kurang dari atau sama dengan angka ini.</p>
                    </div>
                    <div className="flex gap-4 pt-4">
                        <button type="button" onClick={() => navigate(-1)} className="w-full bg-gray-600 text-white font-bold py-3 rounded-xl hover:bg-gray-500 transition">Batal</button>
                        <button type="submit" className="w-full bg-green-500 text-white font-bold py-3 rounded-xl hover:bg-green-600 transition">Simpan Perubahan</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditStock;
