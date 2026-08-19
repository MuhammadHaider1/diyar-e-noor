import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Reply, Send } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import api from '../lib/api';
import { formatDistanceToNow } from 'date-fns';

function Comment({ comment, postId, onReply }) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    setSubmitting(true);
    try {
      await api.post(`/posts/${postId}/comments`, {
        content: replyContent,
        parent_id: comment.id,
      });
      setReplyContent('');
      setShowReplyForm(false);
      onReply();
    } catch (error) {
      console.error('Failed to post reply:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="border-l-2 border-maroon-100 dark:border-charcoal-700 pl-4"
    >
      <div className="flex items-start space-x-3">
        <div className="w-8 h-8 rounded-full bg-maroon-100 dark:bg-charcoal-800 flex items-center justify-center text-maroon-600 dark:text-gold-400 font-medium text-sm">
          {comment.user?.username?.charAt(0).toUpperCase() || 'U'}
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <span className="font-medium text-maroon-800 dark:text-cream-100 text-sm">
              {comment.user?.display_name || comment.user?.username}
            </span>
            <span className="text-maroon-400 dark:text-charcoal-600 text-xs">
              {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
            </span>
          </div>
          <p className="text-maroon-700 dark:text-charcoal-300 mt-1 text-sm leading-relaxed">
            {comment.content}
          </p>
          
          {user && (
            <button
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="flex items-center space-x-1 text-maroon-400 dark:text-charcoal-600 hover:text-maroon-600 dark:hover:text-gold-400 text-xs mt-2 transition-colors"
            >
              <Reply className="w-3 h-3" />
              <span>Reply</span>
            </button>
          )}

          <AnimatePresence>
            {showReplyForm && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleReply}
                className="mt-3"
              >
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Write a reply..."
                  className="w-full p-3 dark-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-maroon-200 dark:focus:ring-gold-500/50 resize-none"
                  rows={2}
                />
                <div className="flex justify-end mt-2 space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowReplyForm(false)}
                    className="px-3 py-1 text-maroon-500 dark:text-charcoal-400 hover:text-maroon-700 dark:hover:text-cream-100 text-sm transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !replyContent.trim()}
                    className="px-3 py-1 bg-maroon-600 dark:bg-gold-500 dark:text-charcoal-950 text-white rounded-lg text-sm hover:bg-maroon-700 dark:hover:bg-gold-400 disabled:opacity-50 flex items-center space-x-1 transition-colors"
                  >
                    <Send className="w-3 h-3" />
                    <span>Reply</span>
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>

      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-4 space-y-4">
          {comment.replies.map((reply) => (
            <Comment
              key={reply.id}
              comment={reply}
              postId={postId}
              onReply={onReply}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}

export default function Comments({ postId, comments, onCommentAdded }) {
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    setSubmitting(true);
    try {
      await api.post(`/posts/${postId}/comments`, { content });
      setContent('');
      onCommentAdded();
    } catch (error) {
      console.error('Failed to post comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="font-display text-xl font-semibold text-maroon-900 dark:text-cream-50 flex items-center space-x-2">
        <MessageCircle className="w-5 h-5" />
        <span>Comments ({comments.length})</span>
      </h3>

      {user ? (
        <form onSubmit={handleSubmit} className="space-y-3">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your thoughts..."
            className="w-full p-4 dark-card rounded-xl focus:outline-none focus:ring-2 focus:ring-maroon-200 dark:focus:ring-gold-500/50 resize-none"
            rows={3}
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting || !content.trim()}
              className="px-6 py-2 bg-maroon-600 dark:bg-gold-500 dark:text-charcoal-950 text-cream-50 rounded-full font-medium hover:bg-maroon-700 dark:hover:bg-gold-400 disabled:opacity-50 transition-colors flex items-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>Post Comment</span>
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-cream-100 dark:bg-charcoal-800 rounded-xl p-6 text-center">
          <p className="text-maroon-600 dark:text-charcoal-400">
            <a href="/login" className="text-maroon-700 dark:text-gold-400 font-medium hover:underline">Login</a> to join the conversation
          </p>
        </div>
      )}

      <div className="space-y-6">
        {comments.map((comment) => (
          <Comment
            key={comment.id}
            comment={comment}
            postId={postId}
            onReply={onCommentAdded}
          />
        ))}
      </div>
    </div>
  );
}
