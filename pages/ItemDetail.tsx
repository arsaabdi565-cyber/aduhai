import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import Header from '../components/Header';
import { ArrowUpCircleIcon, ArrowDownCircleIcon, PencilIcon, ScaleIcon } from '../components/icons/Icons';
import type { Transaction } from '../types';

const ItemDetail: React.FC = () => {
    const { itemId } = useParams<{ itemId: string }>();
    const { state, dispatch } = useAppContext();
    const item = state.items.find(i => i.id === itemId);
    const transactions = state.transactions
        .filter(t => t.itemId === itemId)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const category = state.categories.find(c => c.id === item?.categoryId);

    const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
    const [newQuantity, setNewQuantity] = useState(item?.quantity || 0);
    const [adjustmentNotes, setAdjustmentNotes] = useState('');

    const handleAdjustStock = (e: React.FormEvent) => {
        e.preventDefault();
        if (!item || newQuantity < 0) {
            alert("Kuantitas tidak valid.");
            return;
        }

        const quantityChange = newQuantity - item.quantity;

        if (quantityChange === 0) {
            setIsAdjustModalOpen(false);
            return;
        }
        
        const newTransaction: Transaction = {
            id: 't' + Date.now().toString(),
            itemId: item.id,
            type: 'adjustment',
            quantity: Math.abs(quantityChange),
            changeDirection: quantityChange > 0 ? 'up' : 'down',
            date: new Date().toISOString(),
            notes: adjustmentNotes || 'Koreksi stok',
        };

        dispatch({
            type: 'UPDATE_STOCK',
            payload: {
                itemId: item.id,
                quantityChange: quantityChange,
                transaction: newTransaction,
            },
        });
        
        dispatch({
            type: 'ADD_NOTIFICATION',
            payload: {
                id: `notif_${Date.now()}`,
                message: `Stok "${item.name}" berhasil dikoreksi.`,
                type: 'success'
            }
        });

        setIsAdjustModalOpen(false);
        setAdjustmentNotes('');
    };

    if (!item) {
        return (
            <div>
                <Header title="Detail Barang" />
                <p className="p-4 text-center">Barang tidak ditemukan.</p>
            </div>
        );
    }

    const getTransactionDisplay = (t: Transaction) => {
        let Icon = ScaleIcon;
        let color = 'text-blue-400';
        let text = 'Koreksi Stok';
        let changeText = `${t.changeDirection === 'up' ? '+' : '-'}${t.quantity}`;

        if (t.type === 'in') {
            Icon = ArrowDownCircleIcon;
            color = 'text-green-400';
            text = 'Stok Masuk';
            changeText = `+${t.quantity}`;
        } else if (t.type === 'out') {
            Icon = ArrowUpCircleIcon;
            color = 'text-red-400';
            text = 'Stok Keluar';
            changeText = `-${t.quantity}`;
        }
        
        return { Icon, color, text, changeText };
    };

    return (
        <div>
            <Header title="Detail Barang">
                 <Link to={`/edit-stock/${item.id}`} className="p-2 text-white hover:bg-white/10 rounded-full transition-colors">
                    <PencilIcon className="w-6 h-6"/>
                </Link>
            </Header>
            <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
                <div className="bg-gray-800/50 p-4 rounded-xl">
                    <h2 className="text-2xl font-bold mb-2">{item.name}</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-300">
                        <p><span className="font-semibold text-white">SKU:</span> {item.sku || 'N/A'}</p>
                        <p><span className="font-semibold text-white">Unit:</span> {item.unit}</p>
                        <p><span className="font-semibold text-white">Kategori:</span> {category?.name || 'Tanpa Kategori'}</p>
                        <p><span className="font-semibold text-white">Ambang Stok Rendah:</span> {item.lowStockThreshold > 0 ? item.lowStockThreshold : 'Tidak diatur'}</p>
                    </div>
                    <div className={`mt-4 text-center p-4 rounded-lg ${item.quantity <= item.lowStockThreshold && item.lowStockThreshold > 0 ? 'bg-amber-800/50' : 'bg-green-800/50'}`}>
                        <div className="flex justify-between items-center">
                            <div className="flex-1 text-left">
                                <p className="text-sm text-gray-200">Jumlah Stok Saat Ini</p>
                                <p className={`text-4xl font-bold ${item.quantity <= item.lowStockThreshold && item.lowStockThreshold > 0 ? 'text-amber-300' : 'text-green-300'}`}>{item.quantity}</p>
                            </div>
                            <button onClick={() => { setNewQuantity(item.quantity); setIsAdjustModalOpen(true); }} className="bg-blue-500/20 text-blue-300 font-semibold px-4 py-2 rounded-lg hover:bg-blue-500/40 transition">
                                Koreksi Stok
                            </button>
                        </div>
                    </div>
                </div>

                <div>
                    <h3 className="text-xl font-semibold mb-3">Riwayat Transaksi</h3>
                    <div className="space-y-3">
                        {transactions.length > 0 ? (
                            transactions.map(t => {
                                const { Icon, color, text, changeText } = getTransactionDisplay(t);
                                return (
                                <div key={t.id} className="bg-gray-800/50 p-3 rounded-lg flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Icon className={`w-8 h-8 ${color} flex-shrink-0`} />
                                        <div>
                                            <p className="font-semibold">{text}</p>
                                            <p className="text-xs text-gray-400">{new Date(t.date).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                                             {t.notes && <p className="text-xs text-gray-400 italic break-all">Catatan: {t.notes}</p>}
                                        </div>
                                    </div>
                                    <p className={`font-bold text-lg whitespace-nowrap ml-2 ${color}`}>
                                        {changeText}
                                    </p>
                                </div>
                            )})
                        ) : (
                            <div className="text-center py-8 bg-gray-800/50 rounded-lg">
                                <p className="text-gray-400">Belum ada transaksi untuk barang ini.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Adjustment Modal */}
            {isAdjustModalOpen && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                    <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md shadow-lg border border-green-700/50">
                        <h3 className="text-xl font-semibold mb-1">Koreksi Stok: {item.name}</h3>
                        <p className="text-sm text-gray-400 mb-4">Stok saat ini: {item.quantity} {item.unit}</p>
                        <form onSubmit={handleAdjustStock} className="space-y-4">
                            <div>
                                <label htmlFor="newQuantity" className="text-sm text-gray-300">Kuantitas Baru</label>
                                <input
                                    id="newQuantity"
                                    type="number"
                                    value={newQuantity}
                                    onChange={(e) => setNewQuantity(Number(e.target.value))}
                                    className="w-full bg-gray-700 p-3 rounded-md mt-1 text-center font-bold text-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                                    required
                                    min="0"
                                />
                            </div>
                            <div>
                                <label htmlFor="adjustmentNotes" className="text-sm text-gray-300">Catatan Koreksi (Opsional)</label>
                                <input
                                    id="adjustmentNotes"
                                    type="text"
                                    value={adjustmentNotes}
                                    onChange={(e) => setAdjustmentNotes(e.target.value)}
                                    placeholder="Contoh: Hasil stock opname"
                                    className="w-full bg-gray-700 p-3 rounded-md mt-1 focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setIsAdjustModalOpen(false)} className="w-full bg-gray-600 font-bold py-3 rounded-xl hover:bg-gray-500 transition">Batal</button>
                                <button type="submit" className="w-full bg-green-500 font-bold py-3 rounded-xl hover:bg-green-600 transition">Simpan Koreksi</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
};

export default ItemDetail;