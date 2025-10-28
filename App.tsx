
import React, { useState, useCallback, useEffect } from 'react';
import { View, NotificationState, MenuItem, OrderData, SubmittedOrderData } from './types';
import * as apiService from './services/apiService';
import { DELIVERY_FEE, DEFAULT_MENU } from './constants';
import { OrderPage } from './components/OrderPage';
import { HistoryPage } from './components/HistoryPage';
import { SuccessPage } from './components/SuccessPage';
import { Notification } from './components/Notification';
import { LoadingSpinner } from './components/LoadingSpinner';

export const App: React.FC = () => {
    const [view, setView] = useState<View>('order');
    const [submittedOrder, setSubmittedOrder] = useState<SubmittedOrderData | null>(null);
    const [notification, setNotification] = useState<NotificationState>({ message: '', type: 'success', visible: false });
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [isMenuLoading, setIsMenuLoading] = useState(true);

    const showNotification = useCallback((message: string, type: NotificationState['type'] = 'success') => {
        setNotification({ message, type, visible: true });
    }, []);

    useEffect(() => {
        const fetchMenu = async () => {
            try {
                const items = await apiService.getMenu();
                setMenuItems(items);
            } catch (error) {
                setMenuItems(DEFAULT_MENU);
                showNotification('菜單載入失敗，使用預設菜單', 'warning');
            } finally {
                setIsMenuLoading(false);
            }
        };
        fetchMenu();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSubmitOrder = async (orderData: OrderData, idToken: string | null) => {
        try {
            const result = await apiService.submitOrder(orderData, idToken);
            const finalOrderData: SubmittedOrderData = { 
                ...orderData, 
                orderId: result.data?.orderId || 'TEST_' + Date.now(), 
                totalAmount: result.data?.totalAmount || orderData.items.reduce((sum, item) => sum + item.price * item.quantity, 0) + (orderData.deliveryAddress ? DELIVERY_FEE : 0)
            };
            setSubmittedOrder(finalOrderData);
            setView('success');
            showNotification('訂單提交成功！');
        } catch (error: any) {
            showNotification(`訂單提交失敗：${error.message}`, 'error');
            throw error; // Re-throw to let the caller handle loading state
        }
    };

    const handleNewOrder = () => {
        setSubmittedOrder(null);
        setView('order');
    };

    const renderContent = () => {
        if (isMenuLoading) {
            return (
                <div className="text-center py-20 flex flex-col items-center justify-center text-gray-600">
                    <LoadingSpinner />
                    <p className="mt-3 text-sm">正在載入菜單...</p>
                </div>
            );
        }

        switch(view) {
            case 'history':
                return <HistoryPage onBack={() => setView('order')} showNotification={showNotification} />;
            case 'success':
                return submittedOrder && <SuccessPage orderData={submittedOrder} onNewOrder={handleNewOrder} showNotification={showNotification} />;
            default:
                return <OrderPage menuItems={menuItems} onSubmitOrder={handleSubmitOrder} showNotification={showNotification} onViewHistory={() => setView('history')} />;
        }
    };

    return (
        <div className="p-4 min-h-screen flex items-center justify-center">
            <div className="container max-w-md mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">
                <div className="bg-[#fff3cd] border border-[#ffeaa7] rounded-t-2xl p-2.5 text-xs text-center text-[#856404]">
                    <span role="img" aria-label="lock">🔒</span> 安全訂餐系統 - 24小時接受預訂
                </div>

                <header className="bg-green-500 text-white p-5 text-center relative">
                    <h1 className="text-2xl font-bold mb-1">🍜 台灣小吃店</h1>
                    <p className="text-sm opacity-90">LINE 快速訂餐 - 24小時服務</p>
                </header>

                <main className="p-5 space-y-4">
                    <Notification 
                        message={notification.message} 
                        type={notification.type} 
                        visible={notification.visible} 
                        onClose={() => setNotification(prev => ({ ...prev, visible: false }))} 
                    />
                    {renderContent()}
                </main>
                
                <footer className="bg-gray-100 p-4 text-center text-xs text-gray-500 border-t border-gray-200">
                    <p>📍 營業時間: 10:00 - 21:00 | 📞 聯絡電話: 02-1234-5678</p>
                </footer>
            </div>
        </div>
    );
};
