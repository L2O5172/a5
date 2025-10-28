import { MenuItem } from './types';

// 從 Vercel 等託管平台提供的環境變數讀取設定。
// 變數名稱必須以 NEXT_PUBLIC_ 開頭，Vercel 的建置系統才會將其暴露給瀏覽器端。
export const LIFF_ID = process.env.NEXT_PUBLIC_LIFF_ID;
export const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT;

if (!LIFF_ID || !API_ENDPOINT) {
    // 這個檢查會提醒開發者，如果環境變數未設定，應用程式將無法正常運作。
    console.error("NEXT_PUBLIC_LIFF_ID and NEXT_PUBLIC_API_ENDPOINT environment variables are not set. The application will not function correctly.");
}

export const DELIVERY_FEE = 30;

export const DEFAULT_MENU: MenuItem[] = [
    { name: '滷肉飯', price: 35, icon: '🍚', status: '供應中', image: 'https://picsum.photos/seed/luroufan/400/300' },
    { name: '雞肉飯', price: 40, icon: '🍗', status: '供應中', image: 'https://picsum.photos/seed/chickenrice/400/300' },
    { name: '蚵仔煎', price: 65, icon: '🍳', status: '供應中', image: 'https://picsum.photos/seed/oyster/400/300' },
    { name: '大腸麵線', price: 50, icon: '🍜', status: '供應中', image: 'https://picsum.photos/seed/misua/400/300' },
    { name: '珍珠奶茶', price: 45, icon: '🥤', status: '供應中', image: 'https://picsum.photos/seed/bubbletea/400/300' }
];
