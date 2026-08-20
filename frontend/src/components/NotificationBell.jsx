import { useState, useEffect, useRef } from 'react';
import { Bell, Heart, MessageCircle, UserPlus, FileText, Reply, Check, Trash2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

const typeIcons = {
  follow: { icon: UserPlus, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30' },
  like: { icon: Heart, color: 'text-rose-500', bg: 'bg-rose-100 dark:bg-rose-900/30' },
  comment: { icon: MessageCircle, color: 'text-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
  reply: { icon: Reply, color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-900/30' },
  new_post: { icon: FileText, color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-900/30' },
};

function timeAgo(date) {
  const now = new Date();
  const d = new Date(date);
  const seconds = Math.floor((now - d) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return `${Math.floor(days / 7)}w`;
}

function getNotificationText(type, senderName, postTitle) {
  const name = senderName || 'Someone';
  switch (type) {
    case 'follow': return <><strong>{name}</strong> started following you</>;
    case 'like': return <><strong>{name}</strong> liked <strong>{postTitle || 'your post'}</strong></>;
    case 'comment': return <><strong>{name}</strong> commented on <strong>{postTitle || 'your post'}</strong></>;
    case 'reply': return <><strong>{name}</strong> replied to your comment on <strong>{postTitle || 'a post'}</strong></>;
    case 'new_post': return <><strong>{name}</strong> published a new post</>;
    default: return null;
  }
}

export default function NotificationBell() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    if (open && user) {
      fetchNotifications(1);
    }
  }, [open, user]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const res = await api.get('/social/notifications/unread-count');
      setUnreadCount(res.data.count);
    } catch (e) {}
  };

  const fetchNotifications = async (pageNum) => {
    setLoading(true);
    try {
      const res = await api.get('/social/notifications', { params: { page: pageNum, limit: 15 } });
      if (pageNum === 1) {
        setNotifications(res.data.items);
      } else {
        setNotifications(prev => [...prev, ...res.data.items]);
      }
      setHasMore(pageNum < res.data.pages);
      setPage(pageNum);
    } catch (e) {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAllRead = async () => {
    try {
      await api.patch('/social/notifications/read-all');
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (e) {}
  };

  const markRead = async (id) => {
    try {
      await api.patch(`/social/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (e) {}
  };

  const deleteNotif = async (id) => {
    try {
      await api.delete(`/social/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n.id !== id));
      if (!notifications.find(n => n.id === id)?.is_read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (e) {}
  };

  const handleNotifClick = (notif) => {
    if (!notif.is_read) markRead(notif.id);
    setOpen(false);
    if (notif.type === 'follow') {
      navigate(`/user/${notif.sender_id}`);
    } else if (notif.post_id) {
      navigate(`/post/${notif.post_id}`);
    }
  };

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 text-maroon-600 dark:text-charcoal-400 hover:text-maroon-800 dark:hover:text-gold-400 transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-red-500 rounded-full ring-2 ring-white dark:ring-charcoal-950 animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white dark:bg-charcoal-900 rounded-2xl shadow-2xl border border-maroon-100 dark:border-charcoal-800 overflow-hidden z-50"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-maroon-100 dark:border-charcoal-800">
              <h3 className="font-display text-lg font-semibold text-maroon-900 dark:text-cream-50">
                {t('notifications.title') || 'Notifications'}
              </h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="flex items-center gap-1 text-xs text-maroon-600 dark:text-gold-400 hover:text-maroon-800 dark:hover:text-gold-300 transition-colors"
                  >
                    <Check className="w-3 h-3" />
                    {t('notifications.markAllRead') || 'Mark all read'}
                  </button>
                )}
                <button onClick={() => setOpen(false)} className="p-1 hover:bg-maroon-100 dark:hover:bg-charcoal-800 rounded-lg transition-colors">
                  <X className="w-4 h-4 text-maroon-400 dark:text-charcoal-500" />
                </button>
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 && !loading ? (
                <div className="py-12 text-center text-maroon-400 dark:text-charcoal-500">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">{t('notifications.empty') || 'No notifications yet'}</p>
                </div>
              ) : (
                <>
                  {notifications.map((notif) => {
                    const typeConfig = typeIcons[notif.type] || typeIcons.follow;
                    const Icon = typeConfig.icon;
                    return (
                      <div
                        key={notif.id}
                        onClick={() => handleNotifClick(notif)}
                        className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors border-b border-maroon-50 dark:border-charcoal-800/50 last:border-0 ${
                          notif.is_read
                            ? 'hover:bg-maroon-50/50 dark:hover:bg-charcoal-800/50'
                            : 'bg-amber-50/50 dark:bg-amber-900/10 hover:bg-amber-100/50 dark:hover:bg-amber-900/20'
                        }`}
                      >
                        <div className={`flex-shrink-0 p-2 rounded-full ${typeConfig.bg}`}>
                          <Icon className={`w-4 h-4 ${typeConfig.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm leading-snug ${notif.is_read ? 'text-maroon-600 dark:text-charcoal-400' : 'text-maroon-900 dark:text-cream-50'}`}>
                            {getNotificationText(notif.type, notif.sender?.display_name || notif.sender?.username, notif.post_title)}
                          </p>
                          <span className="text-xs text-maroon-400 dark:text-charcoal-500 mt-0.5">
                            {timeAgo(notif.created_at)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {!notif.is_read && (
                            <button
                              onClick={(e) => { e.stopPropagation(); markRead(notif.id); }}
                              className="p-1 hover:bg-maroon-100 dark:hover:bg-charcoal-800 rounded-lg transition-colors"
                              title="Mark as read"
                            >
                              <Check className="w-3 h-3 text-maroon-400 dark:text-charcoal-500" />
                            </button>
                          )}
                          <button
                            onClick={(e) => { e.stopPropagation(); deleteNotif(notif.id); }}
                            className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3 h-3 text-maroon-400 dark:text-charcoal-500 hover:text-red-500" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  {hasMore && (
                    <button
                      onClick={() => fetchNotifications(page + 1)}
                      disabled={loading}
                      className="w-full py-3 text-sm text-maroon-600 dark:text-gold-400 hover:bg-maroon-50 dark:hover:bg-charcoal-800 transition-colors"
                    >
                      {loading ? 'Loading...' : 'Load more'}
                    </button>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
