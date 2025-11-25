# 🌾 Bakul Tani - Warehouse Management

Aplikasi manajemen gudang untuk hasil pertanian dengan fitur tracking stok, laporan, dan sinkronisasi cloud.

### 1. Setup Firebase Project

1. Buka [Firebase Console](https://console.firebase.google.com/)
2. Buat project baru
3. Aktifkan **Authentication** → **Email/Password**
4. Aktifkan **Firestore Database** (mode production, ubah rules nanti)
5. Copy config ke `.env.local`

### 2. Setup Rules Firestore

Buka Firestore → Rules, ganti dengan:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    
    match /warehouses/{warehouseId} {
      allow read, write: if request.auth != null;
    }
    
    match /items/{itemId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 3. Setup Environment Variables

Copy `.env.example` ke `.env.local` dan isi dengan credentials Firebase kamu:

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 4. Install & Run

```bash
npm install
npm run dev
```

Buka `http://localhost:5173`

## 📱 Fitur

- ✅ **Multi-Device Sync** - Login sekali, akses dari device manapun
- ✅ **Cloud Storage** - Data tersimpan di Firebase Firestore
- ✅ **Auth Email** - Satu email = satu akun
- ✅ **Tracking Stok** - Keluar masuk barang real-time
- ✅ **Laporan** - Dashboard & export CSV
- ✅ **Dark Mode** - UI modern yang nyaman

## 🔧 Tech Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS
- Firebase (Auth + Firestore)
- React Router v6
- Recharts (visualisasi data)

## 📤 Deploy ke Vercel

```bash
git push
```

Di Vercel Console, tambah Environment Variables:
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

## 📝 Struktur Data Firestore

```
users/
  {uid}/
    - email: string
    - name: string
    - position: string
    - profilePicture: string
    - createdAt: timestamp

warehouses/
  {warehouseId}/
    - name: string
    - capacity: number

items/
  {itemId}/
    - name: string
    - quantity: number
    - warehouseId: string
    - ...
```

## 🤝 Contributing

Buat branch baru, lakukan perubahan, push dan buat PR.

## 📄 License

MIT
