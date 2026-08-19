import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Eye, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import api from '../lib/api';
import LikeButton from '../components/LikeButton';
import Comments from '../components/Comments';
import { useCategories } from '../hooks/useCategories';
import { format } from 'date-fns';

export default function PostDetail() {
  const { slug } = useParams();
  const { categories, getColorClasses } = useCategories();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  const slugMap = {};
  categories.forEach(c => { slugMap[c.slug] = c; });

  useEffect(() => {
    fetchPost();
  }, [slug]);

  const fetchPost = async () => {
    try {
      const response = await api.get(`/posts/${slug}`);
      setPost(response.data);
      
      const commentsResponse = await api.get(`/posts/${response.data.id}/comments`);
      setComments(commentsResponse.data);
    } catch (error) {
      console.error('Failed to fetch post:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-50 dark:bg-charcoal-950">
        <div className="animate-pulse text-maroon-500 dark:text-gold-400 font-display text-lg">Loading...</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-50 dark:bg-charcoal-950">
        <p className="text-maroon-500 dark:text-charcoal-400">Post not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-50 dark:bg-charcoal-950">
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link
            to="/"
            className="inline-flex items-center space-x-2 text-maroon-600 dark:text-charcoal-400 hover:text-maroon-800 dark:hover:text-gold-400 mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to posts</span>
          </Link>

          <div className="mb-6">
            {post.category && (
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getColorClasses(slugMap[post.category]?.color || 'maroon')}`}>
                {slugMap[post.category]?.title || post.category}
              </span>
            )}
          </div>

          <h1 className="font-display text-4xl md:text-5xl font-bold text-maroon-900 dark:text-cream-50 mb-6 leading-tight">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-6 text-maroon-500 dark:text-charcoal-400 text-sm mb-8 pb-8 border-b border-maroon-100 dark:border-charcoal-800">
            {post.admin && (
              <span className="flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span>{post.admin.display_name || post.admin.username}</span>
              </span>
            )}
            <span className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>{format(new Date(post.created_at), 'MMMM d, yyyy')}</span>
            </span>
            <span className="flex items-center space-x-2">
              <Eye className="w-4 h-4" />
              <span>{post.views_count} views</span>
            </span>
          </div>

          {post.cover_image_url && (
            <div className="mb-10 rounded-2xl overflow-hidden shadow-premium-lg dark:shadow-premium-dark">
              <img
                src={post.cover_image_url}
                alt={post.title}
                className="w-full h-auto object-cover"
              />
            </div>
          )}

          <div className="reading-content mb-12">
            <ReactMarkdown>{post.content}</ReactMarkdown>
          </div>

          <div className="flex items-center justify-between py-6 border-t border-b border-maroon-100 dark:border-charcoal-800 mb-12">
            <LikeButton
              postId={post.id}
              initialLiked={post.is_liked}
              initialCount={post.likes_count}
            />
          </div>

          <Comments
            postId={post.id}
            comments={comments}
            onCommentAdded={fetchPost}
          />
        </motion.div>
      </article>
    </div>
  );
}
