import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, BookOpen, Users, UserCheck } from 'lucide-react';
import { format } from 'date-fns';
import api, { getUploadUrl } from '../lib/api';
import FollowButton from '../components/FollowButton';
import PostCard from '../components/PostCard';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { useCategories } from '../hooks/useCategories';

export default function WriterProfile() {
  const { id } = useParams();
  const { user } = useAuth();
  const { t } = useTranslation();
  const { getSlugMap, getColorClasses } = useCategories();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
    fetchPosts();
  }, [id]);

  const fetchProfile = async () => {
    try {
      const endpoint = user
        ? `/social/users/${id}/profile`
        : `/social/users/${id}/profile-public`;
      const res = await api.get(endpoint);
      setProfile(res.data);
    } catch (e) {
      console.error('Failed to load profile:', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchPosts = async () => {
    try {
      setPostsLoading(true);
      const res = await api.get('/posts', { params: { status: 'published', limit: 50 } });
      const authorPosts = res.data.items.filter(p => p.admin_id === parseInt(id));
      setPosts(authorPosts);
    } catch (e) {
      console.error('Failed to load posts:', e);
    } finally {
      setPostsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-12 bg-cream-50 dark:bg-charcoal-950">
        <div className="max-w-4xl mx-auto px-4">
          <div className="dark-card rounded-2xl p-8 animate-pulse">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-maroon-200 dark:bg-charcoal-700" />
              <div className="flex-1 space-y-3">
                <div className="h-6 w-48 bg-maroon-200 dark:bg-charcoal-700 rounded" />
                <div className="h-4 w-32 bg-maroon-200 dark:bg-charcoal-700 rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen py-12 bg-cream-50 dark:bg-charcoal-950 flex items-center justify-center">
        <p className="text-maroon-400 dark:text-charcoal-500">Writer not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 bg-cream-50 dark:bg-charcoal-950">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="dark-card rounded-2xl p-8 mb-8"
        >
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative">
              {profile.avatar_url ? (
                <img
                  src={getUploadUrl(profile.avatar_url)}
                  alt={profile.display_name || profile.username}
                  className="w-24 h-24 rounded-full object-cover ring-4 ring-maroon-100 dark:ring-charcoal-800"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-maroon-400 to-gold-500 flex items-center justify-center ring-4 ring-maroon-100 dark:ring-charcoal-800">
                  <span className="text-3xl font-bold text-white">
                    {(profile.display_name || profile.username)?.[0]?.toUpperCase()}
                  </span>
                </div>
              )}
              {profile.role === 'admin' && (
                <span className="absolute -bottom-1 -right-1 px-2 py-0.5 bg-gold-500 text-charcoal-950 text-xs font-bold rounded-full">
                  WRITER
                </span>
              )}
            </div>

            <div className="flex-1 text-center sm:text-left">
              <h1 className="font-display text-2xl font-bold text-maroon-900 dark:text-cream-50">
                {profile.display_name || profile.username}
              </h1>
              <p className="text-maroon-500 dark:text-charcoal-400 text-sm mt-0.5">
                @{profile.username}
              </p>
              {profile.bio && (
                <p className="text-maroon-600 dark:text-charcoal-300 mt-2 text-sm max-w-md">
                  {profile.bio}
                </p>
              )}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-4 text-sm text-maroon-500 dark:text-charcoal-400">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Joined {format(new Date(profile.created_at), 'MMM yyyy')}
                </span>
                <span className="flex items-center gap-1">
                  <BookOpen className="w-4 h-4" />
                  {profile.posts_count} posts
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {profile.followers_count} followers
                </span>
                <span className="flex items-center gap-1">
                  <UserCheck className="w-4 h-4" />
                  {profile.following_count} following
                </span>
              </div>
            </div>

            <div className="flex-shrink-0">
              <FollowButton
                userId={profile.id}
                initialFollowing={profile.is_following}
                initialCount={profile.followers_count}
                size="md"
                onCountChange={(count, following) => {
                  setProfile(prev => ({
                    ...prev,
                    followers_count: count,
                    is_following: following,
                  }));
                }}
              />
            </div>
          </div>
        </motion.div>

        <h2 className="font-display text-xl font-semibold text-maroon-900 dark:text-cream-50 mb-4">
          Posts by {profile.display_name || profile.username}
        </h2>

        {postsLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="dark-card rounded-xl h-32 animate-pulse" />
            ))}
          </div>
        ) : posts.length > 0 ? (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="dark-card rounded-2xl p-12 text-center">
            <BookOpen className="w-10 h-10 mx-auto mb-3 text-maroon-300 dark:text-charcoal-600" />
            <p className="text-maroon-400 dark:text-charcoal-500">No posts yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
