
import React from 'react';
import { useAppContext } from '../context/AppContext';
import type { Notification as NotificationType } from '../types';
import { ExclamationTriangleIcon, XMarkIcon, CheckCircleIcon, InformationCircleIcon } from './icons/Icons';

const Notification: React.FC<{ notification: NotificationType; onDismiss: (id: string) => void }> = ({ notification, onDismiss }) => {
    React.useEffect(() => {
        const timer = setTimeout(() => {
            onDismiss(notification.id);
        }, 5000); // Auto-dismiss after 5 seconds

        return () => clearTimeout(timer);
    }, [notification.id, onDismiss]);

    const iconClasses = 'w-6 h-6';
    const containerClasses = {
        warning: 'bg-amber-500 border-amber-600 text-white',
        info: 'bg-blue-500 border-blue-600 text-white',
        success: 'bg-green-500 border-green-600 text-white',
    };

    return (
        <div className={`flex items-start p-4 mb-4 rounded-lg shadow-lg border-l-4 transition-all animate-fade-in-right ${containerClasses[notification.type]}`}>
            <div className="flex-shrink-0 mr-3">
                {notification.type === 'warning' && <ExclamationTriangleIcon className={iconClasses} />}
                {notification.type === 'success' && <CheckCircleIcon className={iconClasses} />}
                {notification.type === 'info' && <InformationCircleIcon className={iconClasses} />}
            </div>
            <div className="flex-1">
                <p className="text-sm font-medium">{notification.message}</p>
            </div>
            <div className="ml-4 flex-shrink-0">
                <button onClick={() => onDismiss(notification.id)} className="inline-flex text-white rounded-md p-1 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white">
                    <span className="sr-only">Tutup</span>
                    <XMarkIcon className="h-5 w-5" />
                </button>
            </div>
        </div>
    );
};

const NotificationContainer: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const { notifications } = state;

    const handleDismiss = (id: string) => {
        dispatch({ type: 'REMOVE_NOTIFICATION', payload: { id } });
    };

    if (!notifications.length) {
        return null;
    }

    return (
        <div className="fixed top-4 right-4 w-full max-w-sm z-[100]">
            {notifications.map((notification) => (
                <Notification key={notification.id} notification={notification} onDismiss={handleDismiss} />
            ))}
        </div>
    );
};

export default NotificationContainer;
