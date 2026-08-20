import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import api from '../lib/api';
import PostCard from '../components/PostCard';
import { useCategories } from '../hooks/useCategories';
import { Search, Filter, ArrowLeft, BookOpen } from 'lucide-react';

export default function Categories() {
  const { t } = useTranslation();
  const { categories, loading: catLoading } = useCategories();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const currentCategory = searchParams.get('category') || '';

  const slugMap = {};
  categories.forEach(c => { slugMap[c.slug] = c; });
  const activeCat = slugMap[currentCategory];

  useEffect(() => {
    fetchPosts();
  }, [currentCategory, searchParams.get('search')]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const params = { page: 1, limit: 50 };
      if (currentCategory) params.category = currentCategory;
      if (searchParams.get('search')) params.search = searchParams.get('search');

      const response = await api.get('/posts', { params });
      setPosts(response.data.items);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (searchQuery) {
      params.set('search', searchQuery);
    } else {
      params.delete('search');
    }
    setSearchParams(params);
  };

  const handleCategoryChange = (category) => {
    const params = new URLSearchParams(searchParams);
    if (category) {
      params.set('category', category);
    } else {
      params.delete('category');
    }
    setSearchParams(params);
  };

  return (
    <div className="min-h-screen bg-cream-50 dark:bg-charcoal-950">
      {/* Header */}
      <section className="bg-maroon-800 dark:bg-charcoal-900 relative overflow-hidden">
        <div className="absolute inset-0 islamic-pattern opacity-10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-16">
          <Link to="/" className="inline-flex items-center space-x-2 text-cream-200/50 hover:text-cream-100 transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">{t('categories.backToHome')}</span>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="font-display text-3xl md:text-5xl font-bold text-cream-50 mb-3">
              {activeCat?.title || t('categories.allTopics')}
            </h1>
            <p className="text-cream-200/50 dark:text-charcoal-400 text-base md:text-lg max-w-xl">
              {activeCat?.description || t('home.exploreDesc')}
            </p>
          </motion.div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 50" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full dark:hidden" preserveAspectRatio="none">
            <path d="M0 50V30C360 50 720 10 1080 30C1260 40 1380 45 1440 48V50H0Z" fill="#FFFDF7"/>
          </svg>
          <svg viewBox="0 0 1440 50" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full hidden dark:block" preserveAspectRatio="none">
            <path d="M0 50V30C360 50 720 10 1080 30C1260 40 1380 45 1440 48V50H0Z" fill="#0F0D0D"/>
          </svg>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
        {/* Filters */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-10">
          <form onSubmit={handleSearch} className="flex-1 max-w-sm">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-maroon-400 dark:text-charcoal-600" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('categories.searchPlaceholder')}
                className="w-full pl-11 pr-4 py-2.5 dark-card rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-maroon-200 dark:focus:ring-gold-500/50 transition-shadow"
              />
            </div>
          </form>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <Filter className="w-4 h-4 text-maroon-400 dark:text-charcoal-600 flex-shrink-0" />
            <button
              onClick={() => handleCategoryChange('')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                !currentCategory
                  ? 'bg-maroon-700 dark:bg-gold-500 dark:text-charcoal-950 text-cream-50 shadow-sm'
                  : 'dark-card text-maroon-600 dark:text-charcoal-300 hover:bg-maroon-50 dark:hover:bg-charcoal-800 border border-maroon-100 dark:border-charcoal-700'
              }`}
            >
              {t('categories.allTopics')}
            </button>
            {categories.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => handleCategoryChange(cat.slug)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                  currentCategory === cat.slug
                    ? 'bg-maroon-700 dark:bg-gold-500 dark:text-charcoal-950 text-cream-50 shadow-sm'
                    : 'dark-card text-maroon-600 dark:text-charcoal-300 hover:bg-maroon-50 dark:hover:bg-charcoal-800 border border-maroon-100 dark:border-charcoal-700'
                }`}
              >
                {cat.title}
              </button>
            ))}
          </div>
        </div>

        {/* Posts Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="dark-card rounded-2xl h-72 animate-pulse" />
            ))}
          </div>
        ) : posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {posts.map((post, index) => (
              <PostCard key={post.id} post={post} index={index} onFollowChange={() => fetchPosts(currentCategory, searchQuery)} />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-24"
          >
            <div className="w-16 h-16 bg-maroon-50 dark:bg-charcoal-800 rounded-full flex items-center justify-center mx-auto mb-5">
              <BookOpen className="w-7 h-7 text-maroon-300 dark:text-charcoal-600" />
            </div>
            <p className="text-maroon-500 dark:text-charcoal-400 text-lg">{t('categories.noPosts')}</p>
            <p className="text-maroon-400 dark:text-charcoal-600 text-sm mt-1">{t('categories.checkBack')}</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
