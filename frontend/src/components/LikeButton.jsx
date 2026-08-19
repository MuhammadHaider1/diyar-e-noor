import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { useState } from 'react';
import api from '../lib/api';
import { useAuth } from '../hooks/useAuth';

export default function LikeButton({ postId, initialLiked, initialCount }) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [animating, setAnimating] = useState(false);
  const { user } = useAuth();

  const handleLike = async () => {
    if (!user) {
      window.location.href = '/login';
      return;
    }

    setAnimating(true);
    setTimeout(() => setAnimating(false), 300);

    try {
      const response = await api.post(`/posts/${postId}/like`);
      setLiked(response.data.liked);
      setCount(prev => response.data.liked ? prev + 1 : prev - 1);
    } catch (error) {
      console.error('Failed to toggle like:', error);
    }
  };

  return (
    <button
      onClick={handleLike}
      className={`flex items-center space-x-2 px-5 py-2.5 rounded-full transition-all duration-300 ${
        liked
          ? 'bg-maroon-100 dark:bg-maroon-900/50 text-maroon-700 dark:text-maroon-300'
          : 'bg-cream-100 dark:bg-charcoal-800 text-maroon-500 dark:text-charcoal-400 hover:bg-maroon-50 dark:hover:bg-charcoal-700'
      }`}
    >
      <motion.div
        animate={animating ? { scale: [1, 1.4, 1] } : {}}
        transition={{ duration: 0.3 }}
      >
        <Heart
          className={`w-5 h-5 ${liked ? 'fill-current' : ''}`}
        />
      </motion.div>
      <span className="font-medium">{count}</span>
    </button>
  );
}
