import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { useCategories } from '../hooks/useCategories';
import api from '../lib/api';
import { PenTool, Trash2, Eye, Edit2, Plus, Clock, CheckCircle, XCircle, Image as ImageIcon } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import ImageUploader from '../components/ImageUploader';

export default function AdminDashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { categories } = useCategories();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: categories[0]?.slug || 'ishq',
    status: 'draft',
    cover_image_url: '',
  });

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await api.get('/posts', { params: { status: null } });
      const myPosts = response.data.items.filter(p => p.admin_id === user.id);
      setPosts(myPosts);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (editingPost) {
        await api.put(`/posts/${editingPost.id}`, formData);
        toast.success(t('adminDashboard.postUpdated'));
      } else {
        await api.post('/posts', formData);
        toast.success(t('adminDashboard.postCreated'));
      }
      setShowEditor(false);
      setEditingPost(null);
      setFormData({ title: '', content: '', category: categories[0]?.slug || 'ishq', status: 'draft', cover_image_url: '' });
      fetchPosts();
    } catch (error) {
      toast.error(t('adminDashboard.saveFailed'));
    }
  };

  const handleEdit = (post) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      content: post.content,
      category: post.category,
      status: post.status,
      cover_image_url: post.cover_image_url || '',
    });
    setShowEditor(true);
  };

  const handleDelete = async (postId) => {
    if (!confirm(t('adminDashboard.confirmDelete'))) return;
    try {
      await api.delete(`/posts/${postId}`);
      toast.success(t('adminDashboard.postDeleted'));
      fetchPosts();
    } catch (error) {
      toast.error(t('adminDashboard.deleteFailed'));
    }
  };

  return (
    <div className="min-h-screen py-12 bg-cream-50 dark:bg-charcoal-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-maroon-900 dark:text-cream-50">{t('adminDashboard.yourPosts')}</h1>
            <p className="text-maroon-600 dark:text-charcoal-400 mt-1">{t('adminDashboard.managePosts')}</p>
          </div>
          <button
            onClick={() => { setEditingPost(null); setFormData({ title: '', content: '', category: categories[0]?.slug || 'ishq', status: 'draft', cover_image_url: '' }); setShowEditor(true); }}
            className="flex items-center space-x-2 bg-maroon-700 dark:bg-gold-500 dark:text-charcoal-950 text-cream-50 px-4 py-2 rounded-full hover:bg-maroon-800 dark:hover:bg-gold-400 transition-colors shadow-sm hover:shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>{t('adminDashboard.newPost')}</span>
          </button>
        </div>

        {showEditor && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="dark-card rounded-2xl shadow-premium dark:shadow-premium-dark p-6 mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl font-semibold text-maroon-900 dark:text-cream-50">
                {editingPost ? t('adminDashboard.editPost') : t('adminDashboard.newPost')}
              </h2>
              <button onClick={() => setShowEditor(false)} className="text-maroon-400 dark:text-charcoal-600 hover:text-maroon-600 dark:hover:text-cream-100 transition-colors">
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder={t('adminDashboard.postTitle')}
                className="w-full px-4 py-3 dark-input rounded-xl focus:outline-none focus:ring-2 focus:ring-maroon-200 dark:focus:ring-gold-500/50 font-display text-lg"
              />

              <div className="grid grid-cols-2 gap-4">
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="px-4 py-3 dark-input rounded-xl focus:outline-none focus:ring-2 focus:ring-maroon-200 dark:focus:ring-gold-500/50"
                >
                  {categories.map((cat) => (
                    <option key={cat.slug} value={cat.slug}>{cat.title}</option>
                  ))}
                </select>

                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="px-4 py-3 dark-input rounded-xl focus:outline-none focus:ring-2 focus:ring-maroon-200 dark:focus:ring-gold-500/50"
                >
                  <option value="draft">{t('adminDashboard.draft')}</option>
                  <option value="published">{t('adminDashboard.published')}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-maroon-700 dark:text-charcoal-300 mb-2">{t('adminDashboard.coverImage')}</label>
                {formData.cover_image_url ? (
                  <div className="relative">
                    <img src={formData.cover_image_url} alt="Cover" className="w-full h-40 object-cover rounded-xl" />
                    <button
                      onClick={() => setFormData({ ...formData, cover_image_url: '' })}
                      className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <ImageUploader
                    onUpload={(url) => setFormData({ ...formData, cover_image_url: url })}
                    aspect={16/10}
                    label="Upload Cover Image"
                  />
                )}
              </div>

              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder={t('adminDashboard.postContent')}
                rows={12}
                className="w-full px-4 py-3 dark-input rounded-xl focus:outline-none focus:ring-2 focus:ring-maroon-200 dark:focus:ring-gold-500/50 resize-none font-mono text-sm"
              />

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowEditor(false)}
                  className="px-6 py-2 border border-maroon-200 dark:border-charcoal-700 text-maroon-700 dark:text-charcoal-300 rounded-xl hover:bg-maroon-50 dark:hover:bg-charcoal-800 transition-colors"
                >
                  {t('adminDashboard.cancel')}
                </button>
                <button
                  onClick={handleSave}
                  disabled={!formData.title || !formData.content}
                  className="px-6 py-2 bg-maroon-700 dark:bg-gold-500 dark:text-charcoal-950 text-cream-50 rounded-xl hover:bg-maroon-800 dark:hover:bg-gold-400 disabled:opacity-50 transition-colors shadow-sm"
                >
                  {editingPost ? t('adminDashboard.update') : t('adminDashboard.publish')}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="dark-card rounded-xl h-24 animate-pulse" />
            ))}
          </div>
        ) : posts.length > 0 ? (
          <div className="space-y-4">
            {posts.map((post) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="dark-card rounded-xl p-6 flex items-center justify-between"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="font-display text-lg font-semibold text-maroon-900 dark:text-cream-50">{post.title}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      post.status === 'published' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                    }`}>
                      {post.status}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-maroon-500 dark:text-charcoal-400">
                    <span>{format(new Date(post.created_at), 'MMM d, yyyy')}</span>
                    <span className="flex items-center space-x-1">
                      <Eye className="w-3 h-3" />
                      <span>{post.views_count}</span>
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEdit(post)}
                    className="p-2 text-maroon-500 dark:text-charcoal-400 hover:text-maroon-700 dark:hover:text-gold-400 hover:bg-maroon-50 dark:hover:bg-charcoal-800 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 dark-card rounded-2xl">
            <PenTool className="w-12 h-12 text-maroon-300 dark:text-charcoal-700 mx-auto mb-4" />
            <p className="text-maroon-500 dark:text-charcoal-400">{t('adminDashboard.noPosts')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
