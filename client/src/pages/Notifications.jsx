import React, { useState, useEffect } from 'react';
import { Bell, ShieldAlert, CheckCircle, Info, Settings, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import EmptyState from '../components/common/EmptyState';
import transactionService from '../services/transactionService';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const response = await transactionService.getTransactions({ limit: 10 });
        const txns = response.transactions || [];
        
        // Map recent transactions to notifications (all types)
        const dynamicNotifs = txns
          .slice(0, 5)
          .map((t, idx) => {
            let title;
            let type = 'info';
            
            if (t.status === 'blocked' || t.status === 'fraudulent') {
              title = 'High Risk Transaction Blocked';
              type = 'alert';
            } else if (t.status === 'flagged' || t.status === 'suspicious') {
              title = 'Suspicious Transaction Flagged';
              type = 'alert';
            } else if (t.status === 'clean' || t.status === 'approved') {
              title = 'Transaction Approved';
              type = 'success';
            } else {
              title = `Transaction ${t.status}`;
            }

            return {
              id: t.transactionId || `tx-${idx}`,
              type,
              title,
              message: `Transaction ${t.transactionId} was ${t.status} with a fraud score of ${t.riskScore || 0}.`,
              time: new Date(t.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
              read: false,
              link: `/transactions/${t.transactionId}` // Use transactionId for routing
            };
          });

        const staticNotifs = [
          { id: 'sys-1', type: 'success', title: 'Model Retrained', message: 'The AI scoring model has been successfully retrained with the latest dataset.', time: '2 hours ago', read: false },
          { id: 'sys-2', type: 'info', title: 'System Update', message: 'Scheduled maintenance will occur tonight at 02:00 AM UTC.', time: '1 day ago', read: true },
        ];

        setNotifications([...dynamicNotifs, ...staticNotifs]);
      } catch (err) {
        console.error('Failed to fetch notifications', err);
        // Fallback
        setNotifications([
          { id: 'err', type: 'alert', title: 'System Warning', message: 'Failed to connect to transaction service.', time: 'Just now', read: false }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const handleNotificationClick = (notif) => {
    if (!notif.read) {
      window.dispatchEvent(new CustomEvent('notificationReadOne'));
    }
    setNotifications(notifications.map(n => n.id === notif.id ? { ...n, read: true } : n));
    if (notif.link) {
      navigate(notif.link);
    }
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    localStorage.setItem('notificationsAllRead', 'true');
    window.dispatchEvent(new CustomEvent('notificationsRead'));
  };

  const getIcon = (type) => {
    switch (type) {
      case 'alert': return <ShieldAlert className="w-5 h-5 text-red-500" />;
      case 'success': return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case 'info':
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex justify-between items-end border-b border-[#2A2D3E] pb-4">
        <div>
          <h1 className="text-2xl font-bold text-[#F1F5F9] flex items-center gap-3">
            <div className="p-2 bg-[#3B82F6]/10 rounded-lg">
              <Bell className="w-6 h-6 text-[#3B82F6]" />
            </div>
            Notifications
          </h1>
          <p className="text-[#94A3B8] mt-2 ml-1">Manage your alerts and system updates</p>
        </div>
        <div className="flex space-x-3 mb-1">
          <button 
            onClick={markAllAsRead}
            className="text-sm font-medium text-[#3B82F6] hover:text-[#60A5FA] transition-colors"
          >
            Mark all as read
          </button>
          <button className="p-2 bg-[#1A1D27] border border-[#2A2D3E] rounded-lg text-[#94A3B8] hover:text-white hover:bg-[#2A2D3E] transition-all" title="Notification Settings">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      {notifications.length === 0 ? (
        <EmptyState 
          title="No notifications" 
          description="You're all caught up! We'll notify you when something important happens." 
          icon={Bell}
        />
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => (
            <div 
              key={notif.id}
              onClick={() => handleNotificationClick(notif)}
              className={`p-5 rounded-xl border flex gap-4 transition-all cursor-pointer hover:scale-[1.01] ${
                notif.read 
                  ? 'bg-[#0F1117] border-[#2A2D3E] opacity-75 hover:bg-[#1A1D27]' 
                  : 'bg-gradient-to-r from-[#1A1D27] to-[#141720] border-[#3B82F6]/30 shadow-[0_4px_20px_-4px_rgba(59,130,246,0.15)] hover:border-[#3B82F6]/50'
              }`}
            >
              <div className={`mt-0.5 p-2.5 rounded-xl shrink-0 h-fit ${
                notif.read ? 'bg-[#2A2D3E]/50' : 'bg-[#2A2D3E]'
              }`}>
                {getIcon(notif.type)}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className={`font-semibold text-lg ${notif.read ? 'text-[#94A3B8]' : 'text-[#F1F5F9]'}`}>
                    {notif.title}
                  </h3>
                  <span className="text-xs font-medium text-[#64748B] whitespace-nowrap ml-4 mt-1 bg-[#1A1D27] px-2 py-1 rounded-md border border-[#2A2D3E]">
                    {notif.time}
                  </span>
                </div>
                <p className="text-[15px] text-[#94A3B8] mt-1.5 leading-relaxed">
                  {notif.message}
                </p>
              </div>
              {!notif.read && (
                <div className="flex items-center justify-center pl-4">
                  <div className="w-2.5 h-2.5 bg-[#3B82F6] rounded-full shadow-[0_0_10px_rgba(59,130,246,0.8)] animate-pulse"></div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
