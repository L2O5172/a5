import { useState, useEffect } from 'react';
import { LiffProfile, NotificationType } from '../types';
import { LIFF_ID } from '../constants';

export const useLiff = () => {
    const [profile, setProfile] = useState<LiffProfile | null>(null);
    const [idToken, setIdToken] = useState<string | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [liffStatus, setLiffStatus] = useState('🔄 初始化 LINE 功能中...');
    const [statusType, setStatusType] = useState<NotificationType>('info');

    useEffect(() => {
        const initializeLiff = async () => {
            try {
                if (!LIFF_ID) {
                    throw new Error("LIFF ID not configured.");
                }
                await window.liff.init({ liffId: LIFF_ID });
                if (window.liff.isLoggedIn()) {
                    setIsLoggedIn(true);
                    const [userProfile, token] = await Promise.all([
                        window.liff.getProfile(),
                        window.liff.getIDToken()
                    ]);
                    setProfile(userProfile);
                    setIdToken(token);
                    setLiffStatus(`👋 歡迎，${userProfile.displayName}！`);
                    setStatusType('success');
                    sessionStorage.removeItem('liffLoginAttempt'); // Clear flag on success
                } else {
                    if (window.liff.isInClient()) {
                        const loginAttempted = sessionStorage.getItem('liffLoginAttempt');
                        if (!loginAttempted) {
                            sessionStorage.setItem('liffLoginAttempt', 'true');
                            setLiffStatus('未登入 LINE，正在嘗試登入...');
                            window.liff.login();
                        } else {
                            // Avoid login loop
                            setLiffStatus('⚠️ LINE 登入失敗，請嘗試重新整理頁面。');
                            setStatusType('error');
                        }
                    } else {
                        setLiffStatus('請在 LINE App 中開啟以獲得完整功能。');
                        setStatusType('warning');
                    }
                }
            } catch (error) {
                console.warn('LINE 初始化失敗:', error);
                setLiffStatus('⚠️ LINE 功能載入失敗，但您仍可訂餐。');
                setStatusType('warning');
                sessionStorage.removeItem('liffLoginAttempt'); // Clean up on error
            }
        };
        
        // Wait for the liff object to be available on the window object
        if (window.liff) {
            initializeLiff();
        } else {
            document.addEventListener('liff#ready', initializeLiff);
        }

        return () => {
            document.removeEventListener('liff#ready', initializeLiff);
        };
    }, []);

    return { profile, idToken, isLoggedIn, liffStatus, statusType };
};