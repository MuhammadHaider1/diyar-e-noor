import { useState, useEffect } from 'react';
import { UserPlus, UserCheck } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export default function FollowButton({ userId, initialFollowing = false, initialCount = 0, onCountChange, size = 'sm' }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isFollowing, setIsFollowing] = useState(initialFollowing);
  const [followersCount, setFollowersCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setIsFollowing(initialFollowing);
    setFollowersCount(initialCount);
  }, [initialFollowing, initialCount]);

  const handleToggle = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.id === userId) return;

    setLoading(true);
    try {
      const response = await api.post(`/social/users/${userId}/follow`);
      setIsFollowing(response.data.following);
      setFollowersCount(response.data.followers_count);
      if (onCountChange) onCountChange(response.data.followers_count, response.data.following);
    } catch (error) {
      toast.error('Failed to update follow');
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.id === userId) return null;

  const isSmall = size === 'sm';

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`flex items-center gap-1.5 rounded-full font-medium transition-all duration-200 ${
        isSmall ? 'px-3 py-1 text-xs' : 'px-4 py-2 text-sm'
      } ${
        isFollowing
          ? 'bg-maroon-100 dark:bg-charcoal-800 text-maroon-700 dark:text-gold-400 border border-maroon-200 dark:border-charcoal-700 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-800'
          : 'bg-maroon-700 dark:bg-gold-500 text-white dark:text-charcoal-950 hover:bg-maroon-800 dark:hover:bg-gold-400 shadow-sm'
      } disabled:opacity-50`}
    >
      {loading ? (
        <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : isFollowing ? (
        <UserCheck className={isSmall ? 'w-3 h-3' : 'w-4 h-4'} />
      ) : (
        <UserPlus className={isSmall ? 'w-3 h-3' : 'w-4 h-4'} />
      )}
      <span>{isFollowing ? t('profile.following') : t('profile.follow')}</span>
    </button>
  );
}
