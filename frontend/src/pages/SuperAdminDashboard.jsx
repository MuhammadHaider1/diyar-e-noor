import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { useCategories } from '../hooks/useCategories';
import api from '../lib/api';
import { Shield, Users, CreditCard, CheckCircle, XCircle, Clock, FileText, FolderOpen, Plus, GripVertical, Eye, EyeOff, Trash2, Edit3, Save, X, ArrowUp, ArrowDown } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import ImageUploader from '../components/ImageUploader';
import { useTranslation } from 'react-i18next';

const colorOptions = [
  { value: 'rose', label: 'Rose', class: 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300' },
  { value: 'pink', label: 'Pink', class: 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300' },
  { value: 'emerald', label: 'Emerald', class: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' },
  { value: 'gold', label: 'Gold', class: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' },
  { value: 'purple', label: 'Purple', class: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' },
  { value: 'blue', label: 'Blue', class: 'bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300' },
  { value: 'maroon', label: 'Maroon', class: 'bg-maroon-100 dark:bg-maroon-900/30 text-maroon-700 dark:text-maroon-300' },
];

const statusStyles = {
  pending: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/30',
  approved: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/30',
  rejected: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800/30',
};

const emptyCategory = {
  slug: '',
  title: '',
  subtitle: '',
  description: '',
  image_url: '',
  icon: '',
  color: 'maroon',
  is_active: true,
  sort_order: 0,
};

export default function SuperAdminDashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { categories, fetchCategories } = useCategories();
  const [requests, setRequests] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('requests');
  const [reviewingId, setReviewingId] = useState(null);
  const [reviewNote, setReviewNote] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  const [catForm, setCatForm] = useState({ ...emptyCategory });
  const [editingCatId, setEditingCatId] = useState(null);
  const [showCatForm, setShowCatForm] = useState(false);
  const [catSaving, setCatSaving] = useState(false);

  useEffect(() => {
    if (user?.role === 'super_admin') fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const [reqsRes, adminsRes, paysRes] = await Promise.all([
        api.get('/superadmin/admin-requests'),
        api.get('/superadmin/admins'),
        api.get('/superadmin/payments'),
      ]);
      setRequests(reqsRes.data);
      setAdmins(adminsRes.data);
      setPayments(paysRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (requestId, newStatus) => {
    try {
      await api.patch(`/superadmin/admin-requests/${requestId}`, {
        status: newStatus,
        review_note: reviewNote || null,
      });
      toast.success(newStatus === 'approved' ? t('superAdmin.adminApproved') : t('superAdmin.requestRejected'));
      setReviewingId(null);
      setReviewNote('');
      fetchData();
    } catch (error) {
      toast.error(t('superAdmin.reviewFailed'));
    }
  };

  const handleCatSave = async () => {
    if (!catForm.slug.trim() || !catForm.title.trim()) {
      toast.error(t('superAdmin.slugRequired'));
      return;
    }
    const slugRegex = /^[a-z0-9-]+$/;
    if (!slugRegex.test(catForm.slug)) {
      toast.error(t('superAdmin.slugInvalid'));
      return;
    }

    setCatSaving(true);
    try {
      if (editingCatId) {
        await api.put(`/categories/${editingCatId}`, catForm);
        toast.success(t('superAdmin.categoryUpdated'));
      } else {
        await api.post('/categories', catForm);
        toast.success(t('superAdmin.categoryCreated'));
      }
      setShowCatForm(false);
      setEditingCatId(null);
      setCatForm({ ...emptyCategory });
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to save category');
    } finally {
      setCatSaving(false);
    }
  };

  const handleCatEdit = (cat) => {
    setCatForm({ ...cat });
    setEditingCatId(cat.id);
    setShowCatForm(true);
  };

  const handleCatDelete = async (catId) => {
    if (!confirm(t('superAdmin.confirmDelete'))) return;
    try {
      await api.delete(`/categories/${catId}`);
      toast.success(t('superAdmin.categoryDeleted'));
      fetchCategories();
    } catch (error) {
      toast.error('Failed to delete category');
    }
  };

  const handleCatToggle = async (catId) => {
    try {
      await api.patch(`/categories/${catId}/toggle`);
      fetchCategories();
    } catch (error) {
      toast.error('Failed to toggle category');
    }
  };

  const handleMoveCategory = async (catId, direction) => {
    const sorted = [...categories].sort((a, b) => a.sort_order - b.sort_order);
    const idx = sorted.findIndex(c => c.id === catId);
    if ((direction === 'up' && idx === 0) || (direction === 'down' && idx === sorted.length - 1)) return;
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    const newOrder = sorted.map((c, i) => c.id);
    [newOrder[idx], newOrder[swapIdx]] = [newOrder[swapIdx], newOrder[idx]];
    try {
      await api.patch('/categories/reorder', newOrder);
      fetchCategories();
    } catch (error) {
      toast.error('Failed to reorder');
    }
  };

  if (user?.role !== 'super_admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-50 dark:bg-charcoal-950">
        <p className="text-maroon-500 dark:text-charcoal-400">{t('superAdmin.accessDenied')}</p>
      </div>
    );
  }

  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const sortedCats = [...categories].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div className="min-h-screen bg-cream-50 dark:bg-charcoal-950 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-3 mb-8">
          <Shield className="w-8 h-8 text-maroon-700 dark:text-gold-400" />
          <div>
            <h1 className="font-display text-3xl font-bold text-maroon-900 dark:text-cream-50">{t('superAdmin.title')}</h1>
            <p className="text-maroon-600 dark:text-charcoal-400">{t('superAdmin.subtitle')}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-3 mb-8 overflow-x-auto pb-1">
          {[
            { id: 'requests', label: t('superAdmin.adminRequests'), icon: FileText, count: pendingCount },
            { id: 'categories', label: t('superAdmin.categoriesTab'), icon: FolderOpen, count: categories.length },
            { id: 'admins', label: t('superAdmin.adminsTab'), icon: Users, count: admins.length },
            { id: 'payments', label: t('superAdmin.paymentsTab'), icon: CreditCard, count: payments.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-medium text-sm whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-maroon-700 dark:bg-gold-500 dark:text-charcoal-950 text-cream-50 shadow-sm'
                  : 'dark-card text-maroon-600 dark:text-charcoal-300 hover:bg-maroon-50 dark:hover:bg-charcoal-800 border border-maroon-100 dark:border-charcoal-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
              <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                activeTab === tab.id ? 'bg-white/20' : 'bg-maroon-100 dark:bg-charcoal-800 text-maroon-600 dark:text-charcoal-400'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="dark-card rounded-xl h-24 animate-pulse" />
            ))}
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {/* Admin Requests Tab */}
            {activeTab === 'requests' && (
              <motion.div
                key="requests"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {requests.length === 0 ? (
                  <div className="dark-card rounded-2xl p-12 text-center">
                    <FileText className="w-12 h-12 text-maroon-300 dark:text-charcoal-700 mx-auto mb-4" />
                    <p className="text-maroon-500 dark:text-charcoal-400">{t('superAdmin.noApplications')}</p>
                  </div>
                ) : (
                  requests.map((req) => (
                    <motion.div
                      key={req.id}
                      layout
                      className="dark-card rounded-xl overflow-hidden"
                    >
                      <div
                        className="p-5 cursor-pointer hover:bg-maroon-50/30 dark:hover:bg-charcoal-800/50 transition-colors"
                        onClick={() => setExpandedId(expandedId === req.id ? null : req.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-maroon-100 dark:bg-charcoal-800 flex items-center justify-center text-maroon-600 dark:text-gold-400 font-semibold text-sm">
                              {req.user?.username?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div>
                              <h4 className="font-medium text-maroon-900 dark:text-cream-100">
                                {req.user?.display_name || req.user?.username}
                              </h4>
                              <p className="text-maroon-400 dark:text-charcoal-600 text-xs">
                                {req.user?.email} • Applied {format(new Date(req.created_at), 'MMM d, yyyy')}
                              </p>
                            </div>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusStyles[req.status]}`}>
                            {req.status}
                          </span>
                        </div>
                      </div>

                      <AnimatePresence>
                        {expandedId === req.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="px-5 pb-5 border-t border-maroon-50 dark:border-charcoal-800 pt-4 space-y-4">
                              <div>
                                <h5 className="text-xs font-semibold text-maroon-500 dark:text-charcoal-500 uppercase tracking-wider mb-2">Categories</h5>
                                <div className="flex flex-wrap gap-2">
                                  {req.categories.split(',').map((cat) => (
                                    <span key={cat} className="px-3 py-1 bg-maroon-50 dark:bg-charcoal-800 text-maroon-700 dark:text-charcoal-300 rounded-full text-xs font-medium">
                                      {categories.find(c => c.slug === cat)?.title || cat}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <h5 className="text-xs font-semibold text-maroon-500 dark:text-charcoal-500 uppercase tracking-wider mb-2">Experience</h5>
                                <p className="text-maroon-700 dark:text-charcoal-300 text-sm leading-relaxed">{req.experience}</p>
                              </div>
                              <div>
                                <h5 className="text-xs font-semibold text-maroon-500 dark:text-charcoal-500 uppercase tracking-wider mb-2">Statement</h5>
                                <p className="text-maroon-700 dark:text-charcoal-300 text-sm leading-relaxed">{req.statement}</p>
                              </div>
                              {req.review_note && (
                                <div>
                                  <h5 className="text-xs font-semibold text-maroon-500 dark:text-charcoal-500 uppercase tracking-wider mb-2">Review Note</h5>
                                  <p className="text-maroon-600 dark:text-charcoal-400 text-sm italic">{req.review_note}</p>
                                </div>
                              )}
                              {req.status === 'pending' && (
                                <div className="flex items-center gap-3 pt-3 border-t border-maroon-50 dark:border-charcoal-800">
                                  {reviewingId === req.id ? (
                                    <div className="flex-1 flex items-center gap-3">
                                      <input
                                        type="text"
                                        value={reviewNote}
                                        onChange={(e) => setReviewNote(e.target.value)}
                                        placeholder="Note (optional)"
                                        className="flex-1 px-3 py-2 dark-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-maroon-200 dark:focus:ring-gold-500/50"
                                      />
                                      <button
                                        onClick={() => handleReview(req.id, 'approved')}
                                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
                                      >
                                        {t('superAdmin.approve')}
                                      </button>
                                      <button
                                        onClick={() => handleReview(req.id, 'rejected')}
                                        className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
                                      >
                                        {t('superAdmin.reject')}
                                      </button>
                                      <button
                                        onClick={() => { setReviewingId(null); setReviewNote(''); }}
                                        className="text-maroon-400 dark:text-charcoal-500 hover:text-maroon-600 dark:hover:text-cream-100 text-sm transition-colors"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => setReviewingId(req.id)}
                                      className="px-5 py-2 bg-maroon-700 dark:bg-gold-500 dark:text-charcoal-950 text-cream-50 rounded-lg text-sm font-medium hover:bg-maroon-800 dark:hover:bg-gold-400 transition-colors shadow-sm"
                                    >
                                      Review Application
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))
                )}
              </motion.div>
            )}

            {/* Categories Tab */}
            {activeTab === 'categories' && (
              <motion.div
                key="categories"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <div className="flex justify-end">
                  <button
                    onClick={() => { setCatForm({ ...emptyCategory }); setEditingCatId(null); setShowCatForm(true); }}
                    className="flex items-center space-x-2 bg-maroon-700 dark:bg-gold-500 dark:text-charcoal-950 text-cream-50 px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-maroon-800 dark:hover:bg-gold-400 transition-colors shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{t('superAdmin.addCategory')}</span>
                  </button>
                </div>

                <AnimatePresence>
                  {showCatForm && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="dark-card rounded-2xl border border-maroon-100 dark:border-charcoal-700 p-6 space-y-5">
                        <div className="flex items-center justify-between">
                          <h3 className="font-display text-lg font-semibold text-maroon-900 dark:text-cream-50">
                            {editingCatId ? t('superAdmin.editCategory') : t('superAdmin.newCategory')}
                          </h3>
                          <button onClick={() => { setShowCatForm(false); setEditingCatId(null); }} className="text-maroon-400 dark:text-charcoal-600 hover:text-maroon-600 dark:hover:text-cream-100 transition-colors">
                            <X className="w-5 h-5" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-maroon-700 dark:text-charcoal-300 mb-1">{t('superAdmin.slug')} *</label>
                            <input
                              type="text"
                              value={catForm.slug}
                              onChange={(e) => setCatForm({ ...catForm, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                              placeholder="e.g. ishq"
                              className="w-full px-3 py-2 dark-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-maroon-200 dark:focus:ring-gold-500/50"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-maroon-700 dark:text-charcoal-300 mb-1">{t('superAdmin.title2')} *</label>
                            <input
                              type="text"
                              value={catForm.title}
                              onChange={(e) => setCatForm({ ...catForm, title: e.target.value })}
                              placeholder="e.g. Ishq"
                              className="w-full px-3 py-2 dark-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-maroon-200 dark:focus:ring-gold-500/50"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-maroon-700 dark:text-charcoal-300 mb-1">{t('superAdmin.subtitle2')}</label>
                            <input
                              type="text"
                              value={catForm.subtitle}
                              onChange={(e) => setCatForm({ ...catForm, subtitle: e.target.value })}
                              placeholder="e.g. Divine Love"
                              className="w-full px-3 py-2 dark-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-maroon-200 dark:focus:ring-gold-500/50"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-maroon-700 dark:text-charcoal-300 mb-1">{t('superAdmin.icon')}</label>
                            <input
                              type="text"
                              value={catForm.icon}
                              onChange={(e) => setCatForm({ ...catForm, icon: e.target.value })}
                              placeholder="e.g. 🔥"
                              className="w-full px-3 py-2 dark-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-maroon-200 dark:focus:ring-gold-500/50"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-xs font-semibold text-maroon-700 dark:text-charcoal-300 mb-1">{t('superAdmin.description')}</label>
                            <textarea
                              value={catForm.description}
                              onChange={(e) => setCatForm({ ...catForm, description: e.target.value })}
                              rows={2}
                              placeholder="Short description for the homepage card..."
                              className="w-full px-3 py-2 dark-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-maroon-200 dark:focus:ring-gold-500/50 resize-none"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-xs font-semibold text-maroon-700 dark:text-charcoal-300 mb-1">{t('superAdmin.image')}</label>
                            {catForm.image_url ? (
                              <div className="relative">
                                <img src={catForm.image_url} alt="Category" className="w-full h-32 object-cover rounded-lg" />
                                <button
                                  onClick={() => setCatForm({ ...catForm, image_url: '' })}
                                  className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ) : (
                              <ImageUploader
                                onUpload={(url) => setCatForm({ ...catForm, image_url: url })}
                                aspect={16/9}
                                label="Upload Category Image"
                              />
                            )}
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-maroon-700 dark:text-charcoal-300 mb-2">{t('superAdmin.colorTheme')}</label>
                            <div className="flex flex-wrap gap-2">
                              {colorOptions.map((c) => (
                                <button
                                  key={c.value}
                                  type="button"
                                  onClick={() => setCatForm({ ...catForm, color: c.value })}
                                  className={`w-8 h-8 rounded-full border-2 transition-all ${c.class.replace('text-', 'border-').replace('bg-', 'bg-')} ${
                                    catForm.color === c.value ? 'border-maroon-800 dark:border-gold-500 scale-110 ring-2 ring-maroon-300 dark:ring-gold-500/50' : 'border-transparent hover:scale-105'
                                  }`}
                                  title={c.label}
                                />
                              ))}
                            </div>
                          </div>
                        </div>

                        {catForm.title && (
                          <div className="border-t border-maroon-50 dark:border-charcoal-800 pt-4">
                            <p className="text-xs font-semibold text-maroon-500 dark:text-charcoal-500 uppercase tracking-wider mb-2">{t('superAdmin.preview')}</p>
                            <div className="flex items-center gap-3 p-3 bg-cream-50 dark:bg-charcoal-800 rounded-xl">
                              {catForm.icon && <span className="text-2xl">{catForm.icon}</span>}
                              <div>
                                <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${colorOptions.find(c => c.value === catForm.color)?.class || ''}`}>
                                  {catForm.title}
                                </span>
                                {catForm.subtitle && <p className="text-maroon-500 dark:text-charcoal-500 text-xs mt-1">{catForm.subtitle}</p>}
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="flex justify-end gap-3 pt-2">
                          <button
                            onClick={() => { setShowCatForm(false); setEditingCatId(null); }}
                            className="px-4 py-2 text-maroon-500 dark:text-charcoal-400 hover:text-maroon-700 dark:hover:text-cream-100 text-sm font-medium transition-colors"
                          >
                            {t('superAdmin.cancel')}
                          </button>
                          <button
                            onClick={handleCatSave}
                            disabled={catSaving}
                            className="flex items-center space-x-2 bg-maroon-700 dark:bg-gold-500 dark:text-charcoal-950 text-cream-50 px-6 py-2 rounded-lg text-sm font-medium hover:bg-maroon-800 dark:hover:bg-gold-400 disabled:opacity-50 transition-colors shadow-sm"
                          >
                            <Save className="w-4 h-4" />
                            <span>{catSaving ? t('superAdmin.saving') : editingCatId ? t('superAdmin.update') : t('superAdmin.create')}</span>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {sortedCats.length === 0 ? (
                  <div className="dark-card rounded-2xl p-12 text-center">
                    <FolderOpen className="w-12 h-12 text-maroon-300 dark:text-charcoal-700 mx-auto mb-4" />
                    <p className="text-maroon-500 dark:text-charcoal-400">{t('superAdmin.noCategories')}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sortedCats.map((cat, i) => (
                      <motion.div
                        key={cat.id}
                        layout
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className={`dark-card rounded-xl p-4 flex items-center gap-4 ${!cat.is_active ? 'opacity-50' : ''}`}
                      >
                        <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-maroon-50 dark:bg-charcoal-800 flex items-center justify-center">
                          {cat.image_url ? (
                            <img src={cat.image_url} alt={cat.title} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-2xl">{cat.icon || '📁'}</span>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-maroon-900 dark:text-cream-100">{cat.title}</h4>
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${colorOptions.find(c => c.value === cat.color)?.class || 'dark-badge'}`}>
                              {cat.color}
                            </span>
                            {!cat.is_active && (
                              <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-charcoal-800 text-gray-500 dark:text-charcoal-500">{t('superAdmin.hidden')}</span>
                            )}
                          </div>
                          <p className="text-maroon-400 dark:text-charcoal-600 text-xs mt-0.5">
                            <span className="font-mono">/{cat.slug}</span>
                            {cat.subtitle && <span> — {cat.subtitle}</span>}
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleMoveCategory(cat.id, 'up')}
                            disabled={i === 0}
                            className="p-1.5 rounded-lg hover:bg-maroon-50 dark:hover:bg-charcoal-800 text-maroon-400 dark:text-charcoal-600 hover:text-maroon-600 dark:hover:text-gold-400 disabled:opacity-30 transition-colors"
                            title={t('superAdmin.moveUp')}
                          >
                            <ArrowUp className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleMoveCategory(cat.id, 'down')}
                            disabled={i === sortedCats.length - 1}
                            className="p-1.5 rounded-lg hover:bg-maroon-50 dark:hover:bg-charcoal-800 text-maroon-400 dark:text-charcoal-600 hover:text-maroon-600 dark:hover:text-gold-400 disabled:opacity-30 transition-colors"
                            title={t('superAdmin.moveDown')}
                          >
                            <ArrowDown className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleCatToggle(cat.id)}
                            className="p-1.5 rounded-lg hover:bg-maroon-50 dark:hover:bg-charcoal-800 text-maroon-400 dark:text-charcoal-600 hover:text-maroon-600 dark:hover:text-gold-400 transition-colors"
                            title={cat.is_active ? t('superAdmin.hide') : t('superAdmin.show')}
                          >
                            {cat.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => handleCatEdit(cat)}
                            className="p-1.5 rounded-lg hover:bg-maroon-50 dark:hover:bg-charcoal-800 text-maroon-400 dark:text-charcoal-600 hover:text-maroon-600 dark:hover:text-gold-400 transition-colors"
                            title={t('superAdmin.edit')}
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleCatDelete(cat.id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-maroon-400 hover:text-red-500 transition-colors"
                            title={t('superAdmin.delete')}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Admins Tab */}
            {activeTab === 'admins' && (
              <motion.div
                key="admins"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {admins.length === 0 ? (
                  <div className="dark-card rounded-2xl p-12 text-center">
                    <Users className="w-12 h-12 text-maroon-300 dark:text-charcoal-700 mx-auto mb-4" />
                    <p className="text-maroon-500 dark:text-charcoal-400">{t('superAdmin.noAdmins')}</p>
                  </div>
                ) : (
                  admins.map((admin) => (
                    <div key={admin.id} className="dark-card rounded-xl p-5 flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-11 h-11 rounded-full bg-maroon-100 dark:bg-charcoal-800 flex items-center justify-center text-maroon-600 dark:text-gold-400 font-semibold">
                          {admin.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-medium text-maroon-900 dark:text-cream-100">{admin.display_name || admin.username}</h3>
                          <p className="text-sm text-maroon-500 dark:text-charcoal-400">{admin.email}</p>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full text-xs font-medium border border-emerald-200 dark:border-emerald-800/30">
                        {t('superAdmin.active')}
                      </span>
                    </div>
                  ))
                )}
              </motion.div>
            )}

            {/* Payments Tab */}
            {activeTab === 'payments' && (
              <motion.div
                key="payments"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {payments.length === 0 ? (
                  <div className="dark-card rounded-2xl p-12 text-center">
                    <CreditCard className="w-12 h-12 text-maroon-300 dark:text-charcoal-700 mx-auto mb-4" />
                    <p className="text-maroon-500 dark:text-charcoal-400">{t('superAdmin.noPayments')}</p>
                  </div>
                ) : (
                  payments.map((payment) => (
                    <div key={payment.id} className="dark-card rounded-xl p-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-maroon-900 dark:text-cream-100">User ID: {payment.user_id}</p>
                          <p className="text-sm text-maroon-500 dark:text-charcoal-400">
                            {payment.payment_method.toUpperCase()} • PKR {payment.amount}
                          </p>
                          <p className="text-sm text-maroon-400 dark:text-charcoal-600">
                            {format(new Date(payment.created_at), 'MMM d, yyyy HH:mm')}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          payment.status === 'active' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                        }`}>
                          {payment.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
