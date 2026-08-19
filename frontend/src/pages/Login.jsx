import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { Heart, Mail, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-cream-50 dark:bg-charcoal-950">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 mb-6">
            <Heart className="w-8 h-8 text-maroon-600 dark:text-gold-500" />
            <span className="font-display text-2xl font-bold tracking-widest text-maroon-800 dark:text-cream-100 uppercase">Diyar<span className="font-script text-3xl mx-0.5 text-gold-500">e</span>Noor</span>
          </Link>
          <h2 className="font-display text-2xl font-semibold text-maroon-900 dark:text-cream-50">Welcome Back</h2>
          <p className="text-maroon-600 dark:text-charcoal-400 mt-2">Continue your journey of sacred love</p>
        </div>

        <form onSubmit={handleSubmit} className="dark-card rounded-2xl shadow-premium dark:shadow-premium-dark p-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-maroon-700 dark:text-charcoal-300 mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-maroon-400 dark:text-charcoal-600" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 dark-input rounded-xl focus:outline-none focus:ring-2 focus:ring-maroon-200 dark:focus:ring-gold-500/50 transition-all"
                placeholder="your@email.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-maroon-700 dark:text-charcoal-300 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-maroon-400 dark:text-charcoal-600" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 dark-input rounded-xl focus:outline-none focus:ring-2 focus:ring-maroon-200 dark:focus:ring-gold-500/50 transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-maroon-700 dark:bg-gold-500 dark:text-charcoal-950 text-cream-50 py-3 rounded-xl font-medium hover:bg-maroon-800 dark:hover:bg-gold-400 transition-all disabled:opacity-50 shadow-sm hover:shadow-md"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <p className="text-center text-maroon-600 dark:text-charcoal-400 text-sm">
            Don't have an account?{' '}
            <Link to="/register" className="text-maroon-700 dark:text-gold-400 font-medium hover:underline">
              Register
            </Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
}
