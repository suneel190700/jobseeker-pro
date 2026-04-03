'use client';
import { useState, useEffect } from 'react';

interface Notification { id: string; type: 'info' | 'success' | 'warning'; title: string; message: string; time: string; read: boolean; }

export default function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    // Load from localStorage
    try {
      const saved = localStorage.getItem('notifications');
      if (saved) setNotifications(JSON.parse(saved));
      else {
        // Default welcome notifications
        const defaults: Notification[] = [
          { id: '1', type: 'info', title: 'Welcome to JobSeeker Pro', message: 'Upload your resume in Profile to unlock AI features.', time: new Date().toISOString(), read: false },
          { id: '2', type: 'success', title: 'AI Features Ready', message: 'Resume optimization, mock interviews, and job matching are available.', time: new Date().toISOString(), read: false },
        ];
        setNotifications(defaults);
        localStorage.setItem('notifications', JSON.stringify(defaults));
      }
    } catch {}
  }, []);

  const unread = notifications.filter(n => !n.read).length;
  const markRead = (id: string) => {
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    setNotifications(updated);
    localStorage.setItem('notifications', JSON.stringify(updated));
  };
  const markAllRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    localStorage.setItem('notifications', JSON.stringify(updated));
  };
  const clearAll = () => { setNotifications([]); localStorage.setItem('notifications', '[]'); };

  const iconMap = { info: 'info', success: 'check_circle', warning: 'warning' };
  const colorMap = { info: '#bbc3ff', success: '#00daf3', warning: '#ffb4ab' };

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="relative p-2 rounded-lg text-[#8e90a2] hover:text-[#e1e2eb] hover:bg-white/5 transition">
        <span className="material-symbols-outlined text-xl">notifications</span>
        {unread > 0 && <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#3c59fd] text-[9px] text-white font-bold flex items-center justify-center">{unread}</span>}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-12 w-80 z-50 glass-card rounded-2xl overflow-hidden" style={{boxShadow:'0 25px 60px rgba(0,0,0,0.5)'}}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
              <h3 className="text-sm font-bold text-[#e1e2eb]">Notifications</h3>
              <div className="flex gap-2">
                {unread > 0 && <button onClick={markAllRead} className="text-[10px] text-[#bbc3ff] hover:underline">Mark all read</button>}
                {notifications.length > 0 && <button onClick={clearAll} className="text-[10px] text-[#8e90a2] hover:text-[#ffb4ab]">Clear</button>}
              </div>
            </div>
            <div className="max-h-[300px] overflow-y-auto">
              {notifications.length === 0 && <p className="text-center text-sm text-[#8e90a2] py-8">No notifications</p>}
              {notifications.map(n => (
                <div key={n.id} onClick={() => markRead(n.id)} className={`px-4 py-3 border-b border-white/[0.03] hover:bg-white/[0.02] cursor-pointer transition ${!n.read ? 'bg-white/[0.03]' : ''}`}>
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-base mt-0.5" style={{color: colorMap[n.type], fontVariationSettings: "'FILL' 1"}}>{iconMap[n.type]}</span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-semibold ${!n.read ? 'text-[#e1e2eb]' : 'text-[#8e90a2]'}`}>{n.title}</p>
                      <p className="text-[11px] text-[#8e90a2] mt-0.5 line-clamp-2">{n.message}</p>
                    </div>
                    {!n.read && <div className="w-2 h-2 rounded-full bg-[#3c59fd] shrink-0 mt-1" />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
