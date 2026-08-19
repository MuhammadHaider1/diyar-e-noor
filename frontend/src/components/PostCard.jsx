import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Eye } from 'lucide-react';
import { useCategories } from '../hooks/useCategories';
import { getUploadUrl } from '../lib/api';

export default function PostCard({ post, index }) {
  const { categories, getColorClasses } = useCategories();
  const slugMap = {};
  categories.forEach(c => { slugMap[c.slug] = c; });

  const cat = slugMap[post.category];
  const badgeClass = cat ? getColorClasses(cat.color) : 'dark-badge';

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group"
    >
      <Link to={`/post/${post.slug}`}>
        <div className="dark-card rounded-2xl overflow-hidden shadow-premium dark:shadow-premium-dark card-hover">
          {post.cover_image_url && (
            <div className="aspect-[16/10] overflow-hidden">
              <img
                src={getUploadUrl(post.cover_image_url)}
                alt={post.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
          )}

          <div className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${badgeClass}`}>
                {cat?.title || post.category}
              </span>
            </div>

            <h3 className="font-display text-xl font-semibold text-maroon-900 dark:text-cream-50 mb-2 group-hover:text-maroon-700 dark:group-hover:text-gold-400 transition-colors line-clamp-2">
              {post.title}
            </h3>

            <p className="text-maroon-600 dark:text-charcoal-400 text-sm line-clamp-3 mb-4 leading-relaxed">
              {post.content.substring(0, 150)}...
            </p>

            <div className="flex items-center justify-between text-maroon-500 dark:text-charcoal-500 text-sm">
              <div className="flex items-center space-x-4">
                <span className="flex items-center space-x-1">
                  <Heart className="w-4 h-4" />
                  <span>{post.likes_count}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <MessageCircle className="w-4 h-4" />
                  <span>{post.comments_count}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Eye className="w-4 h-4" />
                  <span>{post.views_count}</span>
                </span>
              </div>

              {post.admin && (
                <span className="text-maroon-400 dark:text-charcoal-600">
                  by {post.admin.display_name || post.admin.username}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
