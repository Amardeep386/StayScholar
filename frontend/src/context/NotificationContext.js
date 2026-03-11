import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import AuthContext from './AuthContext';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const { isAuthenticated, token } = useContext(AuthContext);

    const markAsRead = useCallback(async (id) => {
        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
        try {
            const res = await axios.patch(
                `${API_URL}/notifications/${id}/read`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (res.data.success) {
                setNotifications(prev =>
                    prev.map(n => n._id === id ? { ...n, isRead: true } : n)
                );
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error('Mark as read error:', error);
        }
    }, [token]);

    const fetchNotifications = useCallback(async () => {
        if (!isAuthenticated || !token) return;

        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

        try {
            const res = await axios.get(`${API_URL}/notifications`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data.success) {
                // Check for new notifications to show toast
                if (notifications.length > 0) {
                    const newNotifications = res.data.data.filter(
                        newNotif => !notifications.some(existing => existing._id === newNotif._id)
                    );

                    newNotifications.forEach(notif => {
                        if (!notif.isRead) {
                            toast.info(notif.message, {
                                onClick: () => {
                                    markAsRead(notif._id);
                                    window.location.href = notif.link || '#';
                                },
                                hideProgressBar: false,
                                closeOnClick: true,
                                pauseOnHover: true,
                                draggable: true,
                                progress: undefined,
                                theme: "colored",
                                icon: "💬"
                            });
                        }
                    });
                }

                setNotifications(res.data.data);
                setUnreadCount(res.data.unreadCount);
            }
        } catch (error) {
            console.error('Fetch notifications error:', error);
        }
    }, [isAuthenticated, token, notifications, markAsRead]);

    useEffect(() => {
        if (isAuthenticated) {
            fetchNotifications();
            // Poll every 10 seconds for more "real-time" feel
            const interval = setInterval(fetchNotifications, 10000);
            return () => clearInterval(interval);
        } else {
            setNotifications([]);
            setUnreadCount(0);
        }
    }, [isAuthenticated, fetchNotifications]);


    const markAllAsRead = async () => {
        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
        try {
            const res = await axios.put(
                `${API_URL}/notifications/read-all`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (res.data.success) {
                setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
                setUnreadCount(0);
            }
        } catch (error) {
            console.error('Mark all as read error:', error);
        }
    };


    return (
        <NotificationContext.Provider value={{
            notifications,
            unreadCount,
            fetchNotifications,
            markAsRead,
            markAllAsRead
        }}>
            {children}
        </NotificationContext.Provider>
    );
};

export default NotificationContext;
