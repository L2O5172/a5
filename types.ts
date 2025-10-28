
export interface MenuItem {
    name: string;
    price: number;
    icon: string;
    status: string;
    image: string;
}

export interface CartItem extends MenuItem {
    quantity: number;
}

export interface OrderData {
    customerName: string;
    customerPhone: string;
    items: CartItem[];
    pickupTime: string;
    deliveryAddress: string;
    notes: string;
}

export interface SubmittedOrderData extends OrderData {
    orderId: string;
    totalAmount: number;
}

export interface LiffProfile {
    userId: string;
    displayName: string;
    pictureUrl?: string;
    statusMessage?: string;
}

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface NotificationState {
    message: string;
    type: NotificationType;
    visible: boolean;
}

export type View = 'order' | 'history' | 'success';

export interface OrderHistoryItem {
    orderId: string;
    totalAmount: number;
    customerName: string;
    customerPhone: string;
    createdAt: string;
    pickupTime: string;
    items: string; // This is a stringified representation from the API
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | string;
    deliveryAddress?: string;
    notes?: string;
}

// Minimal type definition for the global liff object
declare global {
    interface Window {
        liff: any;
    }
}
