import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import api, { getUploadUrl } from '../lib/api';
import { User, Mail, Calendar, Edit2, Save, X, Camera, BookOpen, Heart, Users, UserCheck, Settings } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import ImageUploader from '../components/ImageUploader';
import PostCard from '../components/PostCard';
import FollowButton from '../components/FollowButton';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const TABS = [
  { key: 'posts', icon: BookOpen, label: 'Posts' },
  { key: 'liked', icon: Heart, label: 'Liked' },
  { key: 'followers', icon: Users, label: 'Followers' },
  { key: 'following', icon: UserCheck, label: 'Following' },
];

export default function Profile() {
  const { t } = useTranslation();
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ display_name: '', bio: '', avatar_url: '' });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');
  const [profileData, setProfileData] = useState(null);
  const [posts, setPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [tabLoading, setTabLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({ display_name: user.display_name || '', bio: user.bio || '', avatar_url: user.avatar_url || '' });
      fetchProfile();
    }
  }, [user]);

  useEffect(() => {
    if (profileData) fetchTabData(activeTab);
  }, [activeTab, profileData]);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/social/users/' + user.id + '/profile');
      setProfileData(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchTabData = async (tab) => {
    setTabLoading(true);
    try {
      if (tab === 'posts') {
        const res = await api.get('/social/users/' + user.id + '/posts', { params: { page: 1, limit: 50 } });
        setPosts(res.data.items);
      } else if (tab === 'liked') {
        const res = await api.get('/social/users/' + user.id + '/liked-posts', { params: { page: 1, limit: 50 } });
        setLikedPosts(res.data.items);
      } else if (tab === 'followers') {
        const res = await api.get('/social/users/' + user.id + '/followers', { params: { page: 1, limit: 50 } });
        setFollowers(res.data.items);
      } else if (tab === 'following') {
        const res = await api.get('/social/users/' + user.id + '/following', { params: { page: 1, limit: 50 } });
        setFollowing(res.data.items);
      }
    } catch (e) {
      console.error('Failed to load tab:', e);
    } finally {
      setTabLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateUser(formData);
      setEditing(false);
      toast.success(t('profile.profileUpdated'));
      fetchProfile();
    } catch (error) {
      toast.error(t('profile.updateFailed'));
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-50 dark:bg-charcoal-950">
        <p className="text-maroon-500 dark:text-charcoal-400">{t('profile.pleaseLogin')}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 bg-cream-50 dark:bg-charcoal-950">
      <div className="max-w-3xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="dark-card rounded-2xl shadow-premium dark:shadow-premium-dark overflow-hidden mb-6"
        >
          <div className="bg-gradient-to-r from-maroon-700 to-maroon-800 dark:from-charcoal-800 dark:to-charcoal-900 h-32" />

          <div className="px-8 pb-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 -mt-16 mb-6">
              <div className="relative group">
                <div className="w-28 h-28 rounded-full bg-cream-100 dark:bg-charcoal-800 border-4 border-white dark:border-charcoal-900 shadow-lg overflow-hidden">
                  {formData.avatar_url ? (
                    <img src={getUploadUrl(formData.avatar_url)} alt={user.username} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-maroon-400 to-gold-500">
                      <span className="text-4xl font-bold text-white">{(user.display_name || user.username)?.[0]?.toUpperCase()}</span>
                    </div>
                  )}
                </div>
                {editing && (
                  <div className="absolute -bottom-1 -right-1">
                    <ImageUploader
                      onUpload={(url) => { setFormData({ ...formData, avatar_url: url }); toast.success(t('profile.photoUploaded')); }}
                      aspect={1}
                      label={t('profile.changePhoto')}
                    />
                  </div>
                )}
              </div>

              <div className="flex-1 text-center sm:text-left">
                <h1 className="font-display text-2xl font-bold text-maroon-900 dark:text-cream-50">
                  {user.display_name || user.username}
                </h1>
                <p className="text-maroon-500 dark:text-charcoal-400 text-sm">@{user.username}</p>
              </div>

              <button
                onClick={() => editing ? handleSave() : setEditing(true)}
                disabled={loading}
                className="flex items-center space-x-2 px-4 py-2 bg-maroon-100 dark:bg-charcoal-800 text-maroon-700 dark:text-gold-400 rounded-full hover:bg-maroon-200 dark:hover:bg-charcoal-700 transition-colors"
              >
                {editing ? <Save className="w-4 h-4" /> : <Settings className="w-4 h-4" />}
                <span>{editing ? t('profile.save') : t('profile.editProfile')}</span>
              </button>
            </div>

            {editing && (
              <div className="space-y-4 mb-6 p-4 bg-maroon-50 dark:bg-charcoal-800/50 rounded-xl">
                <div>
                  <label className="block text-sm font-medium text-maroon-700 dark:text-charcoal-300 mb-1">{t('profile.displayName')}</label>
                  <input
                    type="text"
                    value={formData.display_name}
                    onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                    className="w-full px-4 py-2 dark-input rounded-xl focus:outline-none focus:ring-2 focus:ring-maroon-200 dark:focus:ring-gold-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-maroon-700 dark:text-charcoal-300 mb-1">Bio</label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 dark-input rounded-xl focus:outline-none focus:ring-2 focus:ring-maroon-200 dark:focus:ring-gold-500/50 resize-none"
                    placeholder="Tell us about yourself..."
                  />
                </div>
              </div>
            )}

            {!editing && profileData?.bio && (
              <p className="text-maroon-600 dark:text-charcoal-300 text-sm mb-4">{profileData.bio}</p>
            )}

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-6 text-sm text-maroon-500 dark:text-charcoal-400">
              <span className="flex items-center gap-1">
                <Mail className="w-4 h-4" />
                {user.email}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Joined {format(new Date(user.created_at), 'MMM yyyy')}
              </span>
              <span className="inline-flex items-center px-3 py-0.5 rounded-full text-xs font-medium dark-badge capitalize">
                {user.role.replace('_', ' ')}
              </span>
            </div>

            <div className="flex items-center justify-center sm:justify-start gap-8 mt-6 pt-6 border-t border-maroon-100 dark:border-charcoal-800">
              <div className="text-center">
                <span className="block text-xl font-bold text-maroon-900 dark:text-cream-50">{profileData?.posts_count || 0}</span>
                <span className="text-xs text-maroon-500 dark:text-charcoal-400">{t('profile.posts')}</span>
              </div>
              <div className="text-center">
                <span className="block text-xl font-bold text-maroon-900 dark:text-cream-50">{profileData?.followers_count || 0}</span>
                <span className="text-xs text-maroon-500 dark:text-charcoal-400">{t('profile.followers')}</span>
              </div>
              <div className="text-center">
                <span className="block text-xl font-bold text-maroon-900 dark:text-cream-50">{profileData?.following_count || 0}</span>
                <span className="text-xs text-maroon-500 dark:text-charcoal-400">{t('profile.following')}</span>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="flex border-b border-maroon-200 dark:border-charcoal-800 mb-6">
          {TABS.map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors border-b-2 ${
                activeTab === key
                  ? 'border-maroon-700 dark:border-gold-400 text-maroon-700 dark:text-gold-400'
                  : 'border-transparent text-maroon-400 dark:text-charcoal-500 hover:text-maroon-600 dark:hover:text-charcoal-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {tabLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="dark-card rounded-xl h-32 animate-pulse" />
                ))}
              </div>
            ) : (
              <>
                {activeTab === 'posts' && (
                  posts.length > 0 ? (
                    <div className="space-y-4">
                      {posts.map((post, i) => <PostCard key={post.id} post={post} index={i} onFollowChange={() => fetchTabData(activeTab)} />)}
                    </div>
                  ) : (
                    <EmptyState icon={BookOpen} message="No posts yet" />
                  )
                )}

                {activeTab === 'liked' && (
                  likedPosts.length > 0 ? (
                    <div className="space-y-4">
                      {likedPosts.map((post, i) => <PostCard key={post.id} post={post} index={i} onFollowChange={() => fetchTabData(activeTab)} />)}
                    </div>
                  ) : (
                    <EmptyState icon={Heart} message="No liked posts yet" />
                  )
                )}

                {activeTab === 'followers' && (
                  followers.length > 0 ? (
                    <div className="space-y-2">
                      {followers.map((f) => (
                        <UserListItem key={f.id} user={f.follower} followId={f.follower_id} currentUserId={user.id} />
                      ))}
                    </div>
                  ) : (
                    <EmptyState icon={Users} message="No followers yet" />
                  )
                )}

                {activeTab === 'following' && (
                  following.length > 0 ? (
                    <div className="space-y-2">
                      {following.map((f) => (
                        <UserListItem key={f.id} user={f.following} followId={f.following_id} currentUserId={user.id} />
                      ))}
                    </div>
                  ) : (
                    <EmptyState icon={UserCheck} message="Not following anyone yet" />
                  )
                )}
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, message }) {
  return (
    <div className="dark-card rounded-2xl p-12 text-center">
      <Icon className="w-10 h-10 mx-auto mb-3 text-maroon-300 dark:text-charcoal-600" />
      <p className="text-maroon-400 dark:text-charcoal-500">{message}</p>
    </div>
  );
}

function UserListItem({ user: u, followId, currentUserId }) {
  const navigate = useNavigate();
  if (!u) return null;

  return (
    <div className="dark-card rounded-xl p-4 flex items-center gap-4">
      <div
        onClick={() => navigate('/user/' + u.id)}
        className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 cursor-pointer"
      >
        {u.avatar_url ? (
          <img src={getUploadUrl(u.avatar_url)} alt={u.username} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-maroon-400 to-gold-500">
            <span className="text-lg font-bold text-white">{(u.display_name || u.username)?.[0]?.toUpperCase()}</span>
          </div>
        )}
      </div>
      <div
        onClick={() => navigate('/user/' + u.id)}
        className="flex-1 min-w-0 cursor-pointer"
      >
        <p className="font-medium text-maroon-900 dark:text-cream-50 truncate">{u.display_name || u.username}</p>
        <p className="text-sm text-maroon-500 dark:text-charcoal-400">@{u.username}</p>
      </div>
      {u.id !== currentUserId && (
        <FollowButton userId={u.id} initialFollowing={false} size="sm" />
      )}
    </div>
  );
}
