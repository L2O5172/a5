import { MenuItem } from './types';

// Configuration values for the application.
// In a real-world scenario, these should be stored in environment variables for security.
export const LIFF_ID = '2008316489-6nMjb0KX';
export const API_ENDPOINT = 'https://script.google.com/macros/s/AKfycbxR1gzQgV1jq8DUhYX8EY0EmA6i2PBnjo_IZJUuwRgj7Ggjgro8Mdbnic7ZdhIIc2B1/exec';

if (!LIFF_ID || !API_ENDPOINT) {
    // This check remains as a safeguard.
    console.error("LIFF_ID and API_ENDPOINT are not set. The application will not function correctly.");
}

export const DELIVERY_FEE = 30;

export const DEFAULT_MENU: MenuItem[] = [
    { name: '滷肉飯', price: 35, icon: '🍚', status: '供應中', image: 'https://picsum.photos/seed/luroufan/400/300' },
    { name: '雞肉飯', price: 40, icon: '🍗', status: '供應中', image: 'https://picsum.photos/seed/chickenrice/400/300' },
    { name: '蚵仔煎', price: 65, icon: '🍳', status: '供應中', image: 'https://picsum.photos/seed/oyster/400/300' },
    { name: '大腸麵線', price: 50, icon: '🍜', status: '供應中', image: 'https://picsum.photos/seed/misua/400/300' },
    { name: '珍珠奶茶', price: 45, icon: '🥤', status: '供應中', image: 'https://picsum.photos/seed/bubbletea/400/300' }
];