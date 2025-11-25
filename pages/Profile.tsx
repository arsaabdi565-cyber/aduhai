
import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Cog6ToothIcon, ChevronRightIcon, PlusIcon, PencilIcon, TrashIcon, CheckIcon, XMarkIcon, CameraIcon, CloudArrowUpIcon, WifiIcon, SignalSlashIcon, ArrowRightOnRectangleIcon, UserCircleIcon, InformationCircleIcon, ExclamationTriangleIcon, BuildingStorefrontIcon, SunIcon, MoonIcon, LockClosedIcon, EyeIcon, EyeSlashIcon } from '../components/icons/Icons';
import type { User, Category, Warehouse } from '../types';

const ConnectAccountView: React.FC = () => {
    const { dispatch } = useAppContext();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        position: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isFound, setIsFound] = useState(false);
    const [emailChecked, setEmailChecked] = useState(false);

    // Cek apakah email sudah ada di "Cloud" (localStorage simulasi) saat mengetik
    const handleEmailBlur = () => {
        if (!formData.email) {
            setIsFound(false);
            setEmailChecked(false);
            return;
        }
        
        const storedUsers = JSON.parse(localStorage.getItem('bakulTani_users') || '[]');
        const existingUser = storedUsers.find((u: any) => u.email.toLowerCase() === formData.email.toLowerCase());
        
        setEmailChecked(true);

        if (existingUser) {
            setIsFound(true);
            dispatch({
                type: 'ADD_NOTIFICATION',
                payload: { id: `notif_${Date.now()}`, message: 'Akun ditemukan. Silakan masukkan kata sandi.', type: 'info' }
            });
        } else {
            setIsFound(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        // Reset status check jika email berubah
        if (e.target.name === 'email') {
            setEmailChecked(false);
            setIsFound(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.password) {
            dispatch({
                type: 'ADD_NOTIFICATION',
                payload: { id: `notif_${Date.now()}`, message: 'Kata sandi wajib diisi.', type: 'warning' }
            });
            return;
        }

        setIsLoading(true);

        // Simulasi delay koneksi
        await new Promise(resolve => setTimeout(resolve, 800));

        const storedUsers = JSON.parse(localStorage.getItem('bakulTani_users') || '[]');
        
        if (isFound) {
            // LOGIN FLOW
            const existingUser = storedUsers.find((u: any) => u.email.toLowerCase() === formData.email.toLowerCase());
            
            if (existingUser) {
                if (existingUser.password === formData.password) {
                    // Password Benar
                    dispatch({ type: 'LOGIN', payload: existingUser });
                    dispatch({
                        type: 'ADD_NOTIFICATION',
                        payload: { id: `notif_${Date.now()}`, message: `Selamat datang kembali, ${existingUser.name}!`, type: 'success' }
                    });
                } else {
                    // Password Salah
                    dispatch({
                        type: 'ADD_NOTIFICATION',
                        payload: { id: `notif_${Date.now()}`, message: 'Kata sandi salah.', type: 'warning' }
                    });
                    setIsLoading(false);
                    return;
                }
            }
        } else {
            // REGISTER FLOW
            const newUser = {
                name: formData.name,
                email: formData.email,
                position: formData.position || 'Staff Gudang',
                password: formData.password, // Simpan password (simulasi DB)
                profilePicture: '' 
            };
            
            const updatedUsersList = [...storedUsers, newUser];
            localStorage.setItem('bakulTani_users', JSON.stringify(updatedUsersList));
            
            dispatch({ type: 'LOGIN', payload: newUser });
            dispatch({
                type: 'ADD_NOTIFICATION',
                payload: { id: `notif_${Date.now()}`, message: 'Akun berhasil dibuat.', type: 'success' }
            });
        }
        
        setIsLoading(false);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] text-center p-4">
            <div className="bg-green-500/20 p-6 rounded-full mb-6 relative">
                 <div className="absolute inset-0 bg-green-400/20 blur-xl rounded-full"></div>
                <CloudArrowUpIcon className="w-16 h-16 text-green-600 dark:text-green-400 relative z-10" />
            </div>
            
            <h2 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
                {isFound ? 'Masuk ke Akun' : 'Buat Akun Baru'}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-xs">
                {isFound 
                    ? 'Masukkan kata sandi untuk menyinkronkan data.' 
                    : 'Lengkapi data diri Anda untuk mulai mengelola gudang.'}
            </p>
            
            <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
                {/* EMAIL INPUT */}
                <div className="relative">
                    <UserCircleIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input 
                        name="email"
                        type="email" 
                        value={formData.email}
                        onChange={handleChange}
                        onBlur={handleEmailBlur}
                        placeholder="Alamat Email" 
                        className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 pl-12 p-4 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors shadow-sm"
                        required
                    />
                    {emailChecked && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                            {isFound ? (
                                <span className="flex items-center text-xs text-green-500 font-medium bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-full">
                                    Terdaftar
                                </span>
                            ) : (
                                formData.email && (
                                    <span className="flex items-center text-xs text-blue-500 font-medium bg-blue-100 dark:bg-blue-900/30 px-2 py-0.5 rounded-full">
                                        Baru
                                    </span>
                                )
                            )}
                        </div>
                    )}
                </div>

                {/* NAME & POSITION (Only show if NOT found / Registering) */}
                <div className={`space-y-4 transition-all duration-300 overflow-hidden ${isFound ? 'max-h-0 opacity-0' : 'max-h-96 opacity-100'}`}>
                    <div className="relative">
                        <InformationCircleIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input 
                            name="name"
                            type="text" 
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Nama Lengkap" 
                            className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 pl-12 p-4 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors shadow-sm"
                            required={!isFound}
                        />
                    </div>
                    
                    <div className="relative">
                        <BuildingStorefrontIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input 
                            name="position"
                            type="text" 
                            value={formData.position}
                            onChange={handleChange}
                            placeholder="Jabatan (Opsional)" 
                            className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 pl-12 p-4 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors shadow-sm"
                        />
                    </div>
                </div>

                {/* PASSWORD INPUT (Always shown if email is filled) */}
                <div className={`relative transition-all duration-500 ${!formData.email ? 'opacity-50 blur-[1px] pointer-events-none' : 'opacity-100'}`}>
                    <LockClosedIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input 
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={handleChange}
                        placeholder={isFound ? "Masukkan Kata Sandi" : "Buat Kata Sandi"} 
                        className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 pl-12 pr-12 p-4 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors shadow-sm"
                        required
                    />
                    <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 focus:outline-none"
                    >
                        {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                    </button>
                </div>

                <button 
                    type="submit" 
                    disabled={isLoading || !formData.email || !formData.password}
                    className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white font-bold py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center shadow-lg shadow-green-500/20 mt-6"
                >
                    {isLoading ? (
                        <span className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    ) : (
                        isFound ? "Masuk" : "Daftar & Masuk"
                    )}
                </button>
            </form>
            
            <p className="mt-6 text-xs text-gray-500 max-w-xs mx-auto">
                <InformationCircleIcon className="w-3 h-3 inline mr-1" />
                Data Anda disimpan secara lokal di browser ini dan disimulasikan sebagai penyimpanan cloud.
            </p>
        </div>
    );
};

const Profile: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const [userForm, setUserForm] = useState<User>(state.user);
    const [isEditingUser, setIsEditingUser] = useState(false);
    
    // Category State
    const [categoryInput, setCategoryInput] = useState('');
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    // Warehouse State
    const [warehouseForm, setWarehouseForm] = useState({ name: '', capacity: '' });
    const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Jika belum login, tampilkan halaman Connect Account
    if (!state.isLoggedIn) {
        return (
            <div className="p-4 md:p-8">
                <ConnectAccountView />
            </div>
        );
    }

    const handleUserUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        dispatch({ type: 'UPDATE_USER', payload: userForm });
        
        // Update di "Cloud" (localStorage) juga
        const storedUsers = JSON.parse(localStorage.getItem('bakulTani_users') || '[]');
        const updatedUsers = storedUsers.map((u: any) => 
            u.email === state.user.email ? { ...u, ...userForm } : u
        );
        localStorage.setItem('bakulTani_users', JSON.stringify(updatedUsers));

        setIsEditingUser(false);
        dispatch({
            type: 'ADD_NOTIFICATION',
            payload: {
                id: `notif_${Date.now()}`,
                message: 'Profil berhasil diperbarui.',
                type: 'success'
            }
        });
    };
    
    const handlePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setUserForm(prev => ({ ...prev, profilePicture: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };
    
    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    const handleLogout = () => {
        if(window.confirm('Keluar dari sesi ini?')) {
            dispatch({ type: 'LOGOUT' });
        }
    };

    // --- Category Handlers ---
    const handleCategorySubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!categoryInput.trim()) return;

        if (editingCategory) {
            dispatch({
                type: 'UPDATE_CATEGORY',
                payload: { ...editingCategory, name: categoryInput.trim() }
            });
            dispatch({
                type: 'ADD_NOTIFICATION',
                payload: { id: `notif_${Date.now()}`, message: 'Kategori berhasil diperbarui.', type: 'success' }
            });
            setEditingCategory(null);
        } else {
            dispatch({
                type: 'ADD_CATEGORY',
                payload: { id: Date.now().toString(), name: categoryInput.trim() }
            });
             dispatch({
                type: 'ADD_NOTIFICATION',
                payload: { id: `notif_${Date.now()}`, message: 'Kategori baru ditambahkan.', type: 'success' }
            });
        }
        setCategoryInput('');
    };

    const startEditingCategory = (category: Category) => {
        setEditingCategory(category);
        setCategoryInput(category.name);
    };

    const cancelEditingCategory = () => {
        setEditingCategory(null);
        setCategoryInput('');
    };

    const handleDeleteCategory = (id: string, name: string) => {
        if (window.confirm(`Apakah Anda yakin ingin menghapus kategori "${name}"? Semua barang dalam kategori ini akan menjadi "Tanpa Kategori".`)) {
            dispatch({ type: 'DELETE_CATEGORY', payload: { id } });
            dispatch({
                type: 'ADD_NOTIFICATION',
                payload: { id: `notif_${Date.now()}`, message: `Kategori "${name}" telah dihapus.`, type: 'success' }
            });
        }
    };

    // --- Warehouse Handlers ---
    const handleWarehouseSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!warehouseForm.name.trim()) return;

        const capacityVal = warehouseForm.capacity ? parseInt(warehouseForm.capacity) : undefined;

        if (editingWarehouse) {
            dispatch({
                type: 'UPDATE_WAREHOUSE',
                payload: { ...editingWarehouse, name: warehouseForm.name.trim(), capacity: capacityVal }
            });
            dispatch({
                type: 'ADD_NOTIFICATION',
                payload: { id: `notif_${Date.now()}`, message: 'Data gudang diperbarui.', type: 'success' }
            });
            setEditingWarehouse(null);
        } else {
            dispatch({
                type: 'ADD_WAREHOUSE',
                payload: { 
                    id: 'w' + Date.now().toString(), 
                    name: warehouseForm.name.trim(), 
                    capacity: capacityVal 
                }
            });
            dispatch({
                type: 'ADD_NOTIFICATION',
                payload: { id: `notif_${Date.now()}`, message: 'Gudang baru ditambahkan.', type: 'success' }
            });
        }
        setWarehouseForm({ name: '', capacity: '' });
    };

    const startEditingWarehouse = (wh: Warehouse) => {
        setEditingWarehouse(wh);
        setWarehouseForm({ name: wh.name, capacity: wh.capacity ? wh.capacity.toString() : '' });
    };

    const cancelEditingWarehouse = () => {
        setEditingWarehouse(null);
        setWarehouseForm({ name: '', capacity: '' });
    };

    const handleDeleteWarehouse = (id: string, name: string) => {
        if (window.confirm(`Apakah Anda yakin ingin menghapus gudang "${name}"?`)) {
            dispatch({ type: 'DELETE_WAREHOUSE', payload: { id } });
            dispatch({
                type: 'ADD_NOTIFICATION',
                payload: { id: `notif_${Date.now()}`, message: `Gudang "${name}" telah dihapus.`, type: 'success' }
            });
        }
    };

    const toggleTheme = (theme: 'light' | 'dark') => {
        dispatch({ type: 'SET_THEME', payload: theme });
    };

    const currentUser = isEditingUser ? userForm : state.user;

    return (
        <div className="p-4 md:p-8">
             <input
                type="file"
                ref={fileInputRef}
                onChange={handlePictureChange}
                className="hidden"
                accept="image/*"
            />
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-8 relative">
                    <div className="absolute top-0 right-0">
                         <button onClick={handleLogout} className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 flex items-center gap-1 text-sm bg-red-100 dark:bg-red-900/20 px-3 py-1 rounded-full border border-red-200 dark:border-red-500/30">
                            <ArrowRightOnRectangleIcon className="w-4 h-4" />
                            Keluar
                        </button>
                    </div>
                    
                    <div className="relative w-24 h-24 rounded-full bg-green-500 mx-auto mb-4 flex items-center justify-center text-4xl font-bold overflow-hidden border-4 border-white dark:border-gray-800 shadow-xl">
                       {currentUser.profilePicture ? (
                            <img src={currentUser.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-white">{currentUser.name.charAt(0)}</span>
                        )}
                        {isEditingUser && (
                             <button
                                type="button"
                                onClick={triggerFileInput}
                                className="absolute inset-0 bg-black/50 flex items-center justify-center text-white opacity-0 hover:opacity-100 transition-opacity"
                                aria-label="Ubah foto profil"
                            >
                                <CameraIcon className="w-8 h-8" />
                            </button>
                        )}
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{state.user.name}</h2>
                    <p className="text-gray-500 dark:text-gray-400">{state.user.email}</p>
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mt-2 ${state.isOnline ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}>
                        {state.isOnline ? <WifiIcon className="w-3 h-3"/> : <SignalSlashIcon className="w-3 h-3"/>}
                        {state.isOnline ? 'Terhubung ke Cloud' : 'Mode Offline'}
                    </div>
                </div>

                {/* Edit Profile Section */}
                <div className="bg-white dark:bg-gray-800/50 p-4 rounded-xl mb-6 shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
                    <h3 className="font-semibold mb-4 text-lg text-gray-900 dark:text-white">Edit Profil</h3>
                    {isEditingUser ? (
                        <form onSubmit={handleUserUpdate} className="space-y-4">
                            <div>
                                <label className="text-sm text-gray-500 dark:text-gray-400">Nama</label>
                                <input type="text" value={userForm.name} onChange={(e) => setUserForm({...userForm, name: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-700 p-2 rounded-md mt-1 focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white border border-gray-200 dark:border-transparent"/>
                            </div>
                            <div>
                                <label className="text-sm text-gray-500 dark:text-gray-400">Email (ID)</label>
                                <input type="email" value={userForm.email} disabled className="w-full bg-gray-100 dark:bg-gray-700/50 text-gray-400 p-2 rounded-md mt-1 cursor-not-allowed border border-gray-200 dark:border-transparent"/>
                            </div>
                            <div>
                                <label className="text-sm text-gray-500 dark:text-gray-400">Jabatan / Posisi</label>
                                <input type="text" value={userForm.position} onChange={(e) => setUserForm({...userForm, position: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-700 p-2 rounded-md mt-1 focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white border border-gray-200 dark:border-transparent"/>
                            </div>
                            <div className="flex gap-4">
                                <button type="button" onClick={() => { setIsEditingUser(false); setUserForm(state.user); }} className="w-full bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-white p-3 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-500 transition">Batal</button>
                                <button type="submit" className="w-full bg-green-500 text-white p-3 rounded-lg font-semibold hover:bg-green-600 transition">Simpan</button>
                            </div>
                        </form>
                    ) : (
                        <div className="space-y-2 text-gray-600 dark:text-gray-300">
                            <p><span className="font-semibold text-gray-900 dark:text-white">Nama:</span> {state.user.name}</p>
                            <p><span className="font-semibold text-gray-900 dark:text-white">Email:</span> {state.user.email}</p>
                            <p><span className="font-semibold text-gray-900 dark:text-white">Posisi:</span> {state.user.position}</p>
                            <button onClick={() => setIsEditingUser(true)} className="w-full mt-4 bg-green-50 dark:bg-green-500/20 text-green-700 dark:text-green-300 p-3 rounded-lg font-semibold hover:bg-green-100 dark:hover:bg-green-500/40 transition">Edit Profil</button>
                        </div>
                    )}
                </div>

                {/* Theme Selection */}
                <div className="bg-white dark:bg-gray-800/50 p-4 rounded-xl mb-6 shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
                    <h3 className="font-semibold mb-4 text-lg text-gray-900 dark:text-white">Tampilan Aplikasi</h3>
                    <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
                        <button 
                            onClick={() => toggleTheme('light')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all ${state.theme === 'light' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                        >
                            <SunIcon className="w-5 h-5" />
                            Mode Terang
                        </button>
                        <button 
                            onClick={() => toggleTheme('dark')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all ${state.theme === 'dark' ? 'bg-gray-600 text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                        >
                            <MoonIcon className="w-5 h-5" />
                            Mode Gelap
                        </button>
                    </div>
                </div>
                
                {/* Warehouse Management Section */}
                <div className="bg-white dark:bg-gray-800/50 p-4 rounded-xl mb-6 shadow-sm border-l-4 border-emerald-500 border-t border-r border-b border-gray-100 dark:border-gray-700/50 transition-colors">
                    <div className="flex items-center gap-2 mb-4">
                        <BuildingStorefrontIcon className="w-6 h-6 text-emerald-500 dark:text-emerald-400" />
                        <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{editingWarehouse ? `Edit Gudang: ${editingWarehouse.name}` : 'Manajemen Gudang'}</h3>
                    </div>
                    
                    <form onSubmit={handleWarehouseSubmit} className="flex gap-2 mb-4 items-start">
                        <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 gap-2">
                             <input 
                                type="text" 
                                value={warehouseForm.name}
                                onChange={(e) => setWarehouseForm({...warehouseForm, name: e.target.value})}
                                placeholder={editingWarehouse ? 'Ubah nama gudang' : 'Nama gudang baru'}
                                className="w-full bg-gray-50 dark:bg-gray-700 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white border border-gray-200 dark:border-transparent"
                                required
                            />
                             <input 
                                type="number" 
                                value={warehouseForm.capacity}
                                onChange={(e) => setWarehouseForm({...warehouseForm, capacity: e.target.value})}
                                placeholder="Kapasitas (Opsional)"
                                className="w-full bg-gray-50 dark:bg-gray-700 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white border border-gray-200 dark:border-transparent"
                                min="0"
                            />
                        </div>
                         <button type="submit" className="bg-emerald-500 text-white p-2 rounded-md hover:bg-emerald-600 transition flex-shrink-0 h-10 mt-0.5">
                            {editingWarehouse ? <CheckIcon className="w-6 h-6"/> : <PlusIcon className="w-6 h-6"/>}
                        </button>
                        {editingWarehouse && (
                            <button type="button" onClick={cancelEditingWarehouse} className="bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-white p-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition flex-shrink-0 h-10 mt-0.5">
                                <XMarkIcon className="w-6 h-6"/>
                            </button>
                        )}
                    </form>
                    
                    <div className="space-y-2">
                        {state.warehouses?.map(wh => (
                            <div key={wh.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 p-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700/80 transition-colors border border-gray-100 dark:border-transparent">
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-gray-900 dark:text-white">{wh.name}</span>
                                        {wh.syncStatus === 'pending' && (
                                            <span className="text-[10px] bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-500/30 flex items-center gap-1">
                                                <CloudArrowUpIcon className="w-3 h-3" />
                                                Pending
                                            </span>
                                        )}
                                    </div>
                                    {wh.capacity && <span className="text-xs text-gray-500 dark:text-gray-400">Kapasitas: {wh.capacity} unit</span>}
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => startEditingWarehouse(wh)} className="p-1 text-gray-400 hover:text-green-500" aria-label={`Edit ${wh.name}`}>
                                        <PencilIcon className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleDeleteWarehouse(wh.id, wh.name)} className="p-1 text-gray-400 hover:text-red-500" aria-label={`Hapus ${wh.name}`}>
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                         {(!state.warehouses || state.warehouses.length === 0) && (
                            <p className="text-sm text-gray-500 text-center italic">Belum ada data gudang.</p>
                        )}
                    </div>
                </div>

                {/* Category Management Section */}
                <div className="bg-white dark:bg-gray-800/50 p-4 rounded-xl mb-6 shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
                    <h3 className="font-semibold mb-4 text-lg text-gray-900 dark:text-white">{editingCategory ? `Edit Kategori: ${editingCategory.name}` : 'Pengaturan Kategori'}</h3>
                    <form onSubmit={handleCategorySubmit} className="flex gap-2 mb-3">
                        <input 
                            type="text" 
                            value={categoryInput}
                            onChange={(e) => setCategoryInput(e.target.value)}
                            placeholder={editingCategory ? 'Ubah nama kategori' : 'Nama kategori baru'}
                            className="flex-grow bg-gray-50 dark:bg-gray-700 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white border border-gray-200 dark:border-transparent"
                        />
                         <button type="submit" className="bg-green-500 text-white p-2 rounded-md hover:bg-green-600 transition flex-shrink-0">
                            {editingCategory ? <CheckIcon className="w-6 h-6"/> : <PlusIcon className="w-6 h-6"/>}
                        </button>
                        {editingCategory && (
                            <button type="button" onClick={cancelEditingCategory} className="bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-white p-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition flex-shrink-0">
                                <XMarkIcon className="w-6 h-6"/>
                            </button>
                        )}
                    </form>
                    <div className="space-y-2">
                        {state.categories.map(cat => (
                            <div key={cat.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700/80 transition-colors border border-gray-100 dark:border-transparent">
                                <div className="flex items-center">
                                    <span className="text-sm text-gray-900 dark:text-white">{cat.name}</span>
                                    {cat.syncStatus === 'pending' && (
                                        <span className="ml-2 text-[10px] bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-500/30 flex items-center gap-1">
                                            <CloudArrowUpIcon className="w-3 h-3" />
                                            Pending
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => startEditingCategory(cat)} className="p-1 text-gray-400 hover:text-green-500" aria-label={`Edit ${cat.name}`}>
                                        <PencilIcon className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleDeleteCategory(cat.id, cat.name)} className="p-1 text-gray-400 hover:text-red-500" aria-label={`Hapus ${cat.name}`}>
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <Link to="/settings" className="bg-white dark:bg-gray-800/50 p-4 rounded-xl flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/80 transition shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-4">
                        <Cog6ToothIcon className="w-6 h-6 text-green-500 dark:text-green-400"/>
                        <div>
                            <h3 className="font-semibold text-lg text-gray-900 dark:text-white">Pengaturan Aplikasi</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Backup, restore, dan reset data.</p>
                        </div>
                    </div>
                    <ChevronRightIcon className="w-5 h-5 text-gray-400"/>
                </Link>
            </div>
        </div>
    );
};

export default Profile;
