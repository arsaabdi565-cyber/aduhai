
import React, { useRef } from 'react';
import Header from '../components/Header';
import { useAppContext } from '../context/AppContext';
import { ArrowDownTrayIcon, ArrowUpTrayIcon } from '../components/icons/Icons';
import type { AppState } from '../types';

const Settings: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleBackup = () => {
        const dataStr = JSON.stringify(state, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `bakul_tani_backup_${new Date().toISOString().slice(0, 10)}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    };
    
    const handleRestore = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result;
                if (typeof text === 'string') {
                    const restoredState: AppState = JSON.parse(text);
                    // Basic validation
                    if (restoredState.items && restoredState.transactions && restoredState.user && restoredState.categories) {
                        dispatch({ type: 'RESTORE_DATA', payload: restoredState });
                        alert('Data berhasil dipulihkan!');
                    } else {
                        throw new Error('Invalid backup file format');
                    }
                }
            } catch (error) {
                console.error("Failed to restore data:", error);
                alert('Gagal memulihkan data. File backup tidak valid.');
            }
        };
        reader.readAsText(file);
    };

    const handleReset = () => {
        if (window.confirm('Apakah Anda yakin ingin mereset semua data? Tindakan ini tidak dapat diurungkan.')) {
            dispatch({ type: 'RESET_DATA' });
            alert('Aplikasi berhasil direset.');
        }
    };

    return (
        <div>
            <Header title="Pengaturan Aplikasi" />
            <div className="p-4 md:p-8">
                <div className="space-y-6 max-w-2xl mx-auto">
                    <div>
                        <h2 className="font-semibold text-lg mb-2">Data</h2>
                        <div className="bg-gray-800/50 rounded-lg overflow-hidden">
                            <div onClick={handleBackup} className="flex justify-between items-center p-4 border-b border-gray-700/50 cursor-pointer hover:bg-gray-700/50">
                                <div>
                                    <p className="font-medium">Backup Data</p>
                                    <p className="text-sm text-gray-400">Simpan semua data stok dan transaksi ke sebuah file.</p>
                                </div>
                                <ArrowDownTrayIcon className="w-6 h-6 text-gray-400"/>
                            </div>
                            <div onClick={() => fileInputRef.current?.click()} className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-700/50">
                                <div>
                                    <p className="font-medium">Restore Data</p>
                                    <p className="text-sm text-gray-400">Pulihkan data dari file backup.</p>
                                </div>
                                <ArrowUpTrayIcon className="w-6 h-6 text-gray-400"/>
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    onChange={handleRestore}
                                    className="hidden" 
                                    accept=".json"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="border-2 border-red-500/50 bg-red-900/20 p-4 rounded-lg text-center">
                        <div className="w-12 h-12 mx-auto bg-red-500/30 rounded-full flex items-center justify-center mb-2">
                            <span className="text-2xl text-red-400">⚠️</span>
                        </div>
                        <h3 className="font-bold text-red-400 text-lg">Zona Berbahaya</h3>
                        <p className="text-sm text-red-300/80 mt-1 mb-4">Tindakan berikut tidak dapat diurungkan. Harap berhati-hati.</p>
                        <button onClick={handleReset} className="w-full bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-700 transition">
                            Reset Aplikasi
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
