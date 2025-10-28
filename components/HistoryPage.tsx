
import React, { useState, useEffect } from 'react';
import { OrderHistoryItem } from '../types';
import * as apiService from '../services/apiService';
import { useLiff } from '../hooks/useLiff';
import { LoadingSpinner } from './LoadingSpinner';

interface HistoryPageProps {
    onBack: () => void;
    showNotification: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

const getStatusBadge = (status: string) => {
    const statusConfig: { [key: string]: { color: string, text: string } } = {
        'pending': { color: 'bg-yellow-100 text-yellow-800', text: '待確認' },
        'confirmed': { color: 'bg-blue-100 text-blue-800', text: '已確認' },
        'completed': { color: 'bg-green-100 text-green-800', text: '已完成' },
        'cancelled': { color: 'bg-red-100 text-red-800', text: '已取消' }
    };
    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', text: status };
    return <span className={`px-2 py-1 rounded text-xs ${config.color}`}>{config.text}</span>;
};

export const HistoryPage: React.FC<HistoryPageProps> = ({ onBack, showNotification }) => {
    const { idToken, profile } = useLiff();
    const [startDate, setStartDate] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() - 7);
        return d.toISOString().split('T')[0];
    });
    const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [nameError, setNameError] = useState('');
    const [phoneError, setPhoneError] = useState('');
    const [orders, setOrders] = useState<OrderHistoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const isLineUser = !!idToken;

    useEffect(() => {
        if (profile?.displayName && isLineUser) {
            setCustomerName(profile.displayName);
        }
    }, [profile, isLineUser]);

    const handleSearch = async () => {
        setNameError('');
        setPhoneError('');
        
        let isValid = true;
        if (!isLineUser) {
            if (!customerName.trim()) {
                setNameError('請輸入顧客姓名');
                isValid = false;
            }
            if (!customerPhone.trim()) {
                setPhoneError('請輸入手機號碼');
                isValid = false;
            } else if (!/^09\d{8}$/.test(customerPhone)) {
                setPhoneError('請輸入有效的10位手機號碼 (09開頭)');
                isValid = false;
            }
        } else {
            if (!customerName.trim()) {
                setNameError('請輸入顧客姓名');
                isValid = false;
            }
        }

        if (!isValid) return;
        
        setIsLoading(true);
        try {
            const params = {
                customerName: customerName.trim(),
                customerPhone: isLineUser ? '' : customerPhone.trim(),
                idToken: idToken,
                startDate: startDate,
                endDate: endDate
            };

            const result = await apiService.getOrders(params);
            setOrders(result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
            showNotification(`找到 ${result.length} 筆訂單`, 'success');
        } catch (error: any) {
            showNotification(`查詢失敗：${error.message}`, 'error');
            setOrders([]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">訂單紀錄查詢</h2>
                <button onClick={onBack} className="text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 py-1 px-3 rounded-lg clickable-btn">返回訂餐</button>
            </div>
            
            <div className="grid grid-cols-1 gap-4 mb-4 p-4 bg-gray-50 rounded-lg border">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">顧客姓名 <span className="text-red-500">*</span></label>
                    <input 
                        type="text" 
                        value={customerName} 
                        onChange={e => setCustomerName(e.target.value)} 
                        placeholder={isLineUser ? "自動帶入 LINE 名稱" : "請輸入完整姓名"}
                        className={`w-full p-2 border rounded-md ${nameError ? 'border-red-500' : 'border-gray-300'}`} 
                    />
                    {nameError && <p className="text-red-500 text-xs mt-1">{nameError}</p>}
                    <p className="text-xs text-gray-500 mt-1">📝 姓名必須與訂單完全一致</p>
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        手機號碼 {!isLineUser && <span className="text-red-500">*</span>}
                    </label>
                    <input 
                        type="tel" 
                        value={customerPhone} 
                        onChange={e => setCustomerPhone(e.target.value)} 
                        placeholder={isLineUser ? "LINE 用戶免填" : "0936220000"}
                        disabled={isLineUser}
                        className={`w-full p-2 border rounded-md ${phoneError ? 'border-red-500' : 'border-gray-300'} ${isLineUser ? 'bg-gray-200 cursor-not-allowed' : ''}`} 
                    />
                    {phoneError && <p className="text-red-500 text-xs mt-1">{phoneError}</p>}
                    <p className="text-xs text-gray-500 mt-1">📱 電話號碼必須與訂單完全一致 (包含開頭0)</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">開始日期</label>
                        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">結束日期</label>
                        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md" />
                    </div>
                </div>
                
                <div>
                    <button onClick={handleSearch} disabled={isLoading} className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg disabled:bg-gray-400 flex items-center justify-center clickable-btn">
                        {isLoading ? <><LoadingSpinner /><span>查詢中...</span></> : '🔍 精確搜尋'}
                    </button>
                </div>
            </div>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto p-1">
                {!isLoading && orders.length === 0 && (
                    <div className="text-center text-gray-500 py-10 italic">
                        <p>請輸入搜尋條件進行查詢</p>
                        <p className="text-sm mt-2">使用精確匹配方式搜尋</p>
                    </div>
                )}
                {orders.map(order => (
                    <div key={order.orderId} className="bg-white p-4 rounded-lg shadow border border-gray-200">
                        <div className="flex justify-between items-start border-b pb-2 mb-2">
                            <div>
                                <p className="text-xs text-gray-500">訂單編號</p>
                                <p className="font-bold text-gray-800 text-sm">{order.orderId}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-gray-500">訂單金額</p>
                                <p className="font-bold text-green-600 text-lg">${order.totalAmount}</p>
                            </div>
                        </div>
                        <div className="text-sm space-y-1 text-gray-600">
                            <p><strong>顧客姓名:</strong> {order.customerName}</p>
                            <p><strong>手機號碼:</strong> {order.customerPhone}</p>
                            <p><strong>下單時間:</strong> {new Date(order.createdAt).toLocaleString('zh-TW')}</p>
                            <p><strong>預計取餐:</strong> {new Date(order.pickupTime).toLocaleString('zh-TW')}</p>
                            <p><strong>訂單內容:</strong> {order.items}</p>
                            <p><strong>狀態:</strong> {getStatusBadge(order.status)}</p>
                            {order.deliveryAddress && <p><strong>外送地址:</strong> {order.deliveryAddress}</p>}
                            {order.notes && <p><strong>備註:</strong> {order.notes}</p>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
