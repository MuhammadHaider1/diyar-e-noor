import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { useCategories } from '../hooks/useCategories';
import api from '../lib/api';
import { PenTool, Clock, CheckCircle, XCircle, Gift, Send, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const statusConfig = {
  pending: { icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-200 dark:border-amber-800/30', label: 'Under Review' },
  approved: { icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-200 dark:border-emerald-800/30', label: 'Approved' },
  rejected: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200 dark:border-red-800/30', label: 'Not Approved' },
};

export default function BecomeAdmin() {
  const { user } = useAuth();
  const { categories } = useCategories();
  const [myRequests, setMyRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [experience, setExperience] = useState('');
  const [statement, setStatement] = useState('');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (user) fetchRequests();
  }, [user]);

  const fetchRequests = async () => {
    try {
      const response = await api.get('/admin/request-status');
      setMyRequests(response.data);
    } catch (error) {
      // no requests yet
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (cat) => {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedCategories.length === 0) {
      toast.error('Please select at least one category');
      return;
    }
    if (!experience.trim()) {
      toast.error('Please share your experience');
      return;
    }
    if (!statement.trim()) {
      toast.error('Please write a statement');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/admin/request', {
        categories: selectedCategories,
        experience,
        statement,
      });
      toast.success('Request submitted! We\'ll review it shortly.');
      setSelectedCategories([]);
      setExperience('');
      setStatement('');
      setShowForm(false);
      fetchRequests();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  const hasPending = myRequests.some(r => r.status === 'pending');
  const isApproved = user?.role === 'admin' || user?.role === 'super_admin';

  return (
    <div className="min-h-screen bg-cream-50 dark:bg-charcoal-950 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-16 h-16 bg-maroon-100 dark:bg-charcoal-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <PenTool className="w-8 h-8 text-maroon-600 dark:text-gold-400" />
          </div>
          <h1 className="font-display text-4xl font-bold text-maroon-900 dark:text-cream-50 mb-3">Become an Admin</h1>
          <p className="text-maroon-600 dark:text-charcoal-400 text-lg max-w-xl mx-auto">
            Share your voice with the world. Write about the topics closest to your heart.
          </p>
        </motion.div>

        {/* Free Slots Banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border border-emerald-200 dark:border-emerald-800/30 rounded-2xl p-6 mb-10"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
              <Gift className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-emerald-900 dark:text-emerald-300 mb-1">
                Admin Slots Free — Limited Time!
              </h3>
              <p className="text-emerald-700 dark:text-emerald-400/80 text-sm leading-relaxed">
                All admin slots are completely free for users who join before <strong>1st October 2026</strong>.
                No payment required — just submit your application and start writing.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Already Admin */}
        {isApproved && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/30 rounded-2xl p-8 text-center mb-10"
          >
            <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
            <h3 className="font-display text-xl font-semibold text-emerald-900 dark:text-emerald-300 mb-2">
              You're Already an Admin!
            </h3>
            <p className="text-emerald-700 dark:text-emerald-400/80">
              Head to the <a href="/admin" className="font-medium underline">dashboard</a> to start writing.
            </p>
          </motion.div>
        )}

        {/* Previous Requests */}
        {!loading && myRequests.length > 0 && (
          <div className="space-y-4 mb-10">
            <h2 className="font-display text-xl font-semibold text-maroon-900 dark:text-cream-50">Your Applications</h2>
            {myRequests.map((req, i) => {
              const cfg = statusConfig[req.status];
              const Icon = cfg.icon;
              return (
                <motion.div
                  key={req.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`dark-card border ${cfg.border} rounded-xl p-5 flex items-start gap-4`}
                >
                  <div className={`w-10 h-10 ${cfg.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-5 h-5 ${cfg.color}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className={`font-medium ${cfg.color}`}>{cfg.label}</span>
                      <span className="text-maroon-400 dark:text-charcoal-600 text-xs">
                        {new Date(req.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    <p className="text-maroon-600 dark:text-charcoal-400 text-sm">
                      Categories: {req.categories.split(',').map(c => categories.find(ac => ac.slug === c)?.title || c).join(', ')}
                    </p>
                    {req.review_note && (
                      <p className="text-maroon-500 dark:text-charcoal-500 text-sm mt-2 italic">
                        Note: {req.review_note}
                      </p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Apply Button / Form */}
        {!isApproved && !hasPending && (
          <>
            <AnimatePresence mode="wait">
              {!showForm ? (
                <motion.div
                  key="apply-btn"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-center"
                >
                  <button
                    onClick={() => setShowForm(true)}
                    className="btn-premium bg-maroon-700 dark:bg-gold-500 dark:text-charcoal-950 text-cream-50 px-10 py-4 rounded-full font-semibold text-lg hover:bg-maroon-800 dark:hover:bg-gold-400 transition-all shadow-lg hover:shadow-glow-gold hover:scale-[1.02]"
                  >
                    Apply Now — It's Free!
                  </button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  onSubmit={handleSubmit}
                  className="dark-card rounded-2xl shadow-premium dark:shadow-premium-dark p-8 space-y-8"
                >
                  <div>
                    <h3 className="font-display text-xl font-semibold text-maroon-900 dark:text-cream-50 mb-2">Your Application</h3>
                    <p className="text-maroon-500 dark:text-charcoal-400 text-sm">Tell us about yourself and what you'd like to write about.</p>
                  </div>

                  {/* Categories */}
                  <div>
                    <label className="block text-sm font-semibold text-maroon-800 dark:text-charcoal-200 mb-3">
                      Which categories do you want to write about? *
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {categories.map((cat) => (
                        <button
                          key={cat.slug}
                          type="button"
                          onClick={() => toggleCategory(cat.slug)}
                          className={`p-3 rounded-xl border-2 text-left transition-all duration-200 ${
                            selectedCategories.includes(cat.slug)
                              ? 'border-maroon-500 dark:border-gold-500 bg-maroon-50 dark:bg-gold-500/10'
                              : 'border-maroon-100 dark:border-charcoal-700 hover:border-maroon-200 dark:hover:border-charcoal-600 bg-white dark:bg-charcoal-800'
                          }`}
                        >
                          <span className="font-medium text-maroon-800 dark:text-cream-100 text-sm block">{cat.title}</span>
                          <span className="text-maroon-400 dark:text-charcoal-500 text-xs">{cat.subtitle}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Experience */}
                  <div>
                    <label className="block text-sm font-semibold text-maroon-800 dark:text-charcoal-200 mb-2">
                      Your knowledge / experience *
                    </label>
                    <textarea
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      rows={4}
                      placeholder="Tell us about your background, education, or personal experience with these topics..."
                      className="w-full px-4 py-3 dark-input rounded-xl focus:outline-none focus:ring-2 focus:ring-maroon-200 dark:focus:ring-gold-500/50 resize-none text-sm"
                    />
                  </div>

                  {/* Statement */}
                  <div>
                    <label className="block text-sm font-semibold text-maroon-800 dark:text-charcoal-200 mb-2">
                      Why do you want to be an admin? *
                    </label>
                    <textarea
                      value={statement}
                      onChange={(e) => setStatement(e.target.value)}
                      rows={4}
                      placeholder="What motivates you to write for DIYAR E NOOR? What unique perspective do you bring?"
                      className="w-full px-4 py-3 dark-input rounded-xl focus:outline-none focus:ring-2 focus:ring-maroon-200 dark:focus:ring-gold-500/50 resize-none text-sm"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="text-maroon-500 dark:text-charcoal-400 hover:text-maroon-700 dark:hover:text-cream-100 font-medium text-sm transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex items-center space-x-2 bg-maroon-700 dark:bg-gold-500 dark:text-charcoal-950 text-cream-50 px-8 py-3 rounded-full font-semibold hover:bg-maroon-800 dark:hover:bg-gold-400 disabled:opacity-50 transition-all shadow-sm hover:shadow-md"
                    >
                      <Send className="w-4 h-4" />
                      <span>{submitting ? 'Submitting...' : 'Submit Application'}</span>
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </>
        )}

        {/* Pending state */}
        {hasPending && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/30 rounded-2xl p-8 text-center"
          >
            <Clock className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <h3 className="font-display text-xl font-semibold text-amber-900 dark:text-amber-300 mb-2">
              Application Under Review
            </h3>
            <p className="text-amber-700 dark:text-amber-400/80">
              We're reviewing your application. You'll be notified once a decision is made.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
