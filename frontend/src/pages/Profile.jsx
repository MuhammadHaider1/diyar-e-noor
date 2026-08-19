import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import api from '../lib/api';
import { User, Mail, Calendar, Edit2, Save, X, Camera } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import ImageUploader from '../components/ImageUploader';
import { useTranslation } from 'react-i18next';

export default function Profile() {
  const { t } = useTranslation();
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    display_name: '',
    bio: '',
    avatar_url: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        display_name: user.display_name || '',
        bio: user.bio || '',
        avatar_url: user.avatar_url || '',
      });
    }
  }, [user]);

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateUser(formData);
      setEditing(false);
      toast.success(t('profile.profileUpdated'));
    } catch (error) {
      toast.error(t('profile.updateFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = (url) => {
    setFormData({ ...formData, avatar_url: url });
    toast.success(t('profile.photoUploaded'));
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
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="dark-card rounded-2xl shadow-premium dark:shadow-premium-dark overflow-hidden"
        >
          <div className="bg-gradient-to-r from-maroon-700 to-maroon-800 dark:from-charcoal-800 dark:to-charcoal-900 h-32" />
          
          <div className="px-8 pb-8">
            <div className="flex items-end justify-between -mt-16 mb-6">
              {/* Avatar */}
              <div className="relative group">
                <div className="w-32 h-32 rounded-full bg-cream-100 dark:bg-charcoal-800 border-4 border-white dark:border-charcoal-900 shadow-lg flex items-center justify-center overflow-hidden">
                  {formData.avatar_url ? (
                    <img src={formData.avatar_url} alt={user.username} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-12 h-12 text-maroon-400 dark:text-charcoal-600" />
                  )}
                </div>
                {/* Camera overlay on hover */}
                <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <Camera className="w-8 h-8 text-white" />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {editing && (
                  <ImageUploader
                    onUpload={handleAvatarUpload}
                    aspect={1}
                    label={t('profile.changePhoto')}
                  />
                )}
                <button
                  onClick={() => editing ? handleSave() : setEditing(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-maroon-100 dark:bg-charcoal-800 text-maroon-700 dark:text-gold-400 rounded-full hover:bg-maroon-200 dark:hover:bg-charcoal-700 transition-colors"
                >
                  {editing ? <Save className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                  <span>{editing ? t('profile.save') : t('profile.editProfile')}</span>
                </button>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-maroon-700 dark:text-charcoal-300 mb-2">{t('profile.displayName')}</label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.display_name}
                    onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                    className="w-full px-4 py-2 dark-input rounded-xl focus:outline-none focus:ring-2 focus:ring-maroon-200 dark:focus:ring-gold-500/50"
                  />
                ) : (
                  <p className="text-maroon-900 dark:text-cream-100 font-medium">{user.display_name || user.username}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-maroon-700 dark:text-charcoal-300 mb-2">Bio</label>
                {editing ? (
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 dark-input rounded-xl focus:outline-none focus:ring-2 focus:ring-maroon-200 dark:focus:ring-gold-500/50 resize-none"
                    placeholder="Tell us about yourself..."
                  />
                ) : (
                  <p className="text-maroon-700 dark:text-charcoal-300">{user.bio || 'No bio yet'}</p>
                )}
              </div>

              <div className="flex items-center space-x-6 text-sm text-maroon-500 dark:text-charcoal-400">
                <span className="flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span>{user.email}</span>
                </span>
                <span className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {format(new Date(user.created_at), 'MMM yyyy')}</span>
                </span>
              </div>

              <div className="pt-4 border-t border-maroon-100 dark:border-charcoal-800">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium dark-badge capitalize">
                  {user.role.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
