import React, { createContext, useContext, useState, useCallback } from 'react';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);
    const [confirmState, setConfirmState] = useState(null);

    const notify = useCallback((message, type = 'success', duration = 3000) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, duration);
    }, []);

    const confirm = useCallback(({ title, message, onConfirm, confirmText, cancelText, type = 'danger' }) => {
        return new Promise((resolve) => {
            setConfirmState({
                title,
                message,
                confirmText: confirmText || 'Confirmar',
                cancelText: cancelText || 'Cancelar',
                type,
                onConfirm: () => {
                    setConfirmState(null);
                    onConfirm?.();
                    resolve(true);
                },
                onCancel: () => {
                    setConfirmState(null);
                    resolve(false);
                }
            });
        });
    }, []);

    return (
        <NotificationContext.Provider value={{ notify, confirm, toasts, confirmState }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) throw new Error('useNotification must be used within a NotificationProvider');
    return context;
};
