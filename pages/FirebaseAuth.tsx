import React, { useState } from 'react';
import { auth, db } from '../config/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useAppContext } from '../context/AppContext';
import Header from '../components/Header';
import { InformationCircleIcon } from '../components/icons/Icons';

type AuthMode = 'choice' | 'login' | 'register';

const FirebaseAuth: React.FC = () => {
    const { dispatch } = useAppContext();
    const [mode, setMode] = useState<AuthMode>('choice');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const showNotification = (message: string, type: 'success' | 'warning' | 'info') => {
        dispatch({
            type: 'ADD_NOTIFICATION',
            payload: { 
                id: `notif_${Date.now()}`, 
                message, 
                type 
            }
        });
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');
        setLoading(true);

        try {
            // Sign in dengan Firebase Auth
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            
            // Ambil data user dari Firestore
            const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
            const userData = userDoc.data();

            if (userData) {
                dispatch({
                    type: 'LOGIN',
                    payload: {
                        name: userData.name,
                        email: userData.email,
                        position: userData.position,
                        profilePicture: userData.profilePicture || '',
                        uid: userCredential.user.uid,
                    }
                });
                showNotification(`Selamat datang kembali, ${userData.name}!`, 'success');
            }
        } catch (error: any) {
            let errorMessage = 'Terjadi kesalahan';
            
            if (error.code === 'auth/user-not-found') {
                errorMessage = 'Email tidak terdaftar';
            } else if (error.code === 'auth/wrong-password') {
                errorMessage = 'Kata sandi salah';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'Email tidak valid';
            }
            
            setErrorMsg(errorMessage);
            showNotification(errorMessage, 'warning');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');
        setLoading(true);

        try {
            // Buat akun Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            
            // Simpan data user di Firestore
            const name = email.split('@')[0];
            const userData = {
                uid: userCredential.user.uid,
                email,
                name,
                position: 'Staff Gudang',
                profilePicture: '',
                createdAt: new Date().toISOString(),
            };

            await setDoc(doc(db, 'users', userCredential.user.uid), userData);

            // Login ke app
            dispatch({
                type: 'LOGIN',
                payload: userData
            });

            showNotification(`Selamat datang, ${name}!`, 'success');
        } catch (error: any) {
            let errorMessage = 'Terjadi kesalahan';
            
            if (error.code === 'auth/email-already-in-use') {
                errorMessage = 'Email sudah terdaftar';
            } else if (error.code === 'auth/weak-password') {
                errorMessage = 'Kata sandi terlalu lemah (minimal 6 karakter)';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'Email tidak valid';
            }
            
            setErrorMsg(errorMessage);
            showNotification(errorMessage, 'warning');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
            <Header />
            
            <div className="flex-1 flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    {mode === 'choice' ? (
                        // Mode: Pilih Sudah atau Belum Punya Akun
                        <div className="space-y-4">
                            <div className="text-center mb-8">
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                    Bakul Tani
                                </h1>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Kelola gudang Anda di mana saja
                                </p>
                            </div>

                            <button
                                onClick={() => {
                                    setMode('login');
                                    setErrorMsg('');
                                }}
                                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-green-500/20"
                            >
                                Sudah Punya Akun
                            </button>

                            <button
                                onClick={() => {
                                    setMode('register');
                                    setErrorMsg('');
                                }}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-500/20"
                            >
                                Buat Akun Baru
                            </button>
                        </div>
                    ) : (
                        // Mode: Login atau Register
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                            <button
                                onClick={() => {
                                    setMode('choice');
                                    setEmail('');
                                    setPassword('');
                                    setErrorMsg('');
                                }}
                                className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mb-4"
                            >
                                ← Kembali
                            </button>

                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                                {mode === 'login' ? 'Masuk' : 'Daftar'}
                            </h2>

                            <form onSubmit={mode === 'login' ? handleLogin : handleRegister} className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="masukkan@email.com"
                                        className="w-full mt-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 p-3 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Kata Sandi
                                    </label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder={mode === 'login' ? 'Masukkan kata sandi' : 'Minimal 6 karakter'}
                                        className="w-full mt-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 p-3 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                                        required
                                        minLength={6}
                                    />
                                </div>

                                {errorMsg && (
                                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 flex gap-2">
                                        <InformationCircleIcon className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                                        <p className="text-sm text-red-600 dark:text-red-400">{errorMsg}</p>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-all mt-6"
                                >
                                    {loading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                            {mode === 'login' ? 'Memproses...' : 'Membuat Akun...'}
                                        </span>
                                    ) : (
                                        mode === 'login' ? 'Masuk' : 'Daftar'
                                    )}
                                </button>
                            </form>

                            <p className="mt-6 text-xs text-gray-500 dark:text-gray-400 text-center">
                                <InformationCircleIcon className="w-3 h-3 inline mr-1" />
                                Data Anda disimpan aman di cloud dan dapat diakses dari perangkat lain
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FirebaseAuth;
