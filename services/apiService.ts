import { API_ENDPOINT, DEFAULT_MENU } from '../constants';
import { OrderData, MenuItem, OrderHistoryItem } from '../types';

async function request<T,>(payload: any): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15-second timeout

    try {
        console.log('發送請求:', payload.action);
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: { 
                'Content-Type': 'text/plain;charset=utf-8',
            },
            body: JSON.stringify(payload),
            signal: controller.signal,
            mode: 'cors', // Explicitly set mode for clarity
        });
        
        clearTimeout(timeoutId);

        if (!response.ok) {
            // If response is not OK, try to get more details from the body
            const errorText = await response.text();
            // The error text from Google Apps Script might be HTML, so we show a snippet
            const errorDetail = errorText.slice(0, 300).trim(); 
            throw new Error(`伺服器錯誤 (狀態 ${response.status}): ${errorDetail}...`);
        }
        
        const result = await response.json();
        console.log('收到回應:', result);
        return result;
    } catch (error: any) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
            console.error('API 請求超時');
            throw new Error('請求超時，伺服器無回應。請檢查後端是否運行正常。');
        }
        console.error('API 請求失敗:', error);
        // Add more context to the generic network error
        throw new Error(`網路連線失敗。請檢查手機網路，或可能是後端伺服器設定問題 (CORS 或部署)。錯誤: ${error.message}`);
    }
}

export const getMenu = async (): Promise<MenuItem[]> => {
    try {
        const result = await request<{ success: boolean; data: MenuItem[] }>({ action: 'getMenu' });
        if (result.success && Array.isArray(result.data)) {
            return result.data;
        }
        return DEFAULT_MENU;
    } catch (error) {
        console.warn('獲取菜單失敗，使用默認菜單:', error);
        return DEFAULT_MENU;
    }
};

export const submitOrder = async (orderData: OrderData, idToken: string | null) => {
    const orderDataForServer = {
        customerName: orderData.customerName.trim(),
        customerPhone: orderData.customerPhone.trim(),
        items: orderData.items.map(item => ({ 
            name: item.name, 
            quantity: item.quantity,
            price: item.price 
        })),
        pickupTime: orderData.pickupTime,
        deliveryAddress: orderData.deliveryAddress.trim(),
        notes: orderData.notes.trim()
    };

    console.log('提交訂單數據:', orderDataForServer);

    const result = await request<{ success: boolean; message?: string; data?: any }>({ 
        action: 'createOrder', 
        idToken: idToken,
        orderData: orderDataForServer 
    });

    if (!result.success) {
        throw new Error(result.message || '訂單提交失敗');
    }

    return result;
};

export const getOrders = async (params: { 
    customerName: string; 
    customerPhone: string;
    idToken: string | null;
    startDate: string;
    endDate: string;
}): Promise<OrderHistoryItem[]> => {
    const searchParams = {
        ...params,
        customerPhone: params.customerPhone ? params.customerPhone.trim() : '',
        exactMatch: true
    };

    const result = await request<{ success: boolean; message?: string; data?: OrderHistoryItem[] }>({ 
        action: 'getOrders', 
        ...searchParams 
    });

    if (!result.success) {
        throw new Error(result.message || '查詢失敗');
    }

    return result.data || [];
};
