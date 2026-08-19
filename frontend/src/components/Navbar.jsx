import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { Menu, X, Heart, User, LogOut, PenTool, Shield, Sun, Moon } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/categories', label: 'Topics' },
  ];

  const authLinks = user ? [
    ...(user.role === 'admin' || user.role === 'super_admin'
      ? [{ path: '/admin', label: 'Write', icon: PenTool }]
      : []),
    ...(user.role === 'super_admin'
      ? [{ path: '/superadmin', label: 'Admin', icon: Shield }]
      : []),
    { path: '/profile', label: 'Profile', icon: User },
  ] : [];

  return (
    <nav className="sticky top-0 z-50 bg-cream-50/80 dark:bg-charcoal-950/80 backdrop-blur-xl border-b border-maroon-100/30 dark:border-charcoal-800/50 transition-colors duration-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="relative">
              <Heart className="w-6 h-6 text-maroon-600 dark:text-gold-500 group-hover:text-gold-500 transition-colors duration-300" />
              <div className="absolute inset-0 bg-gold-500/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <span className="font-display text-xl font-bold tracking-widest text-maroon-800 dark:text-cream-100 uppercase">
              Diyar<span className="font-script text-3xl mx-0.5 text-gold-500">e</span>Noor
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`nav-link font-medium transition-colors duration-200 ${
                  isActive(link.path)
                    ? 'text-maroon-700 dark:text-gold-400'
                    : 'text-maroon-600 dark:text-charcoal-300 hover:text-maroon-800 dark:hover:text-cream-100'
                }`}
              >
                {link.label}
              </Link>
            ))}

            {authLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`nav-link font-medium transition-colors duration-200 ${
                  isActive(link.path)
                    ? 'text-maroon-700 dark:text-gold-400'
                    : 'text-maroon-600 dark:text-charcoal-300 hover:text-maroon-800 dark:hover:text-cream-100'
                }`}
              >
                {link.icon && <link.icon className="w-4 h-4 inline mr-1" />}
                {link.label}
              </Link>
            ))}

            {user ? (
              <button
                onClick={logout}
                className="text-maroon-600 dark:text-charcoal-400 hover:text-maroon-800 dark:hover:text-cream-100 transition-colors duration-200"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="font-medium text-maroon-600 dark:text-charcoal-300 hover:text-maroon-800 dark:hover:text-cream-100 transition-colors duration-200"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-maroon-700 dark:bg-gold-500 dark:text-charcoal-950 text-cream-50 px-5 py-2 rounded-full font-medium hover:bg-maroon-800 dark:hover:bg-gold-400 transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  Join
                </Link>
              </div>
            )}

            {/* Dark Mode Toggle */}
            <button
              onClick={toggle}
              className="relative w-10 h-10 rounded-full flex items-center justify-center bg-maroon-50 dark:bg-charcoal-800 hover:bg-maroon-100 dark:hover:bg-charcoal-700 transition-all duration-300 border border-maroon-100 dark:border-charcoal-700"
              title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              <AnimatePresence mode="wait">
                {dark ? (
                  <motion.div
                    key="sun"
                    initial={{ rotate: -90, scale: 0 }}
                    animate={{ rotate: 0, scale: 1 }}
                    exit={{ rotate: 90, scale: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Sun className="w-4 h-4 text-gold-500" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="moon"
                    initial={{ rotate: 90, scale: 0 }}
                    animate={{ rotate: 0, scale: 1 }}
                    exit={{ rotate: -90, scale: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Moon className="w-4 h-4 text-maroon-600" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>

          {/* Mobile Controls */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={toggle}
              className="w-9 h-9 rounded-full flex items-center justify-center bg-maroon-50 dark:bg-charcoal-800 transition-colors"
            >
              {dark ? (
                <Sun className="w-4 h-4 text-gold-500" />
              ) : (
                <Moon className="w-4 h-4 text-maroon-600" />
              )}
            </button>
            <button
              className="text-maroon-700 dark:text-cream-200 p-1"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="md:hidden overflow-hidden bg-cream-50 dark:bg-charcoal-900 border-b border-maroon-100 dark:border-charcoal-800"
          >
            <div className="px-4 py-5 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`block py-2.5 px-3 rounded-lg font-medium transition-colors ${
                    isActive(link.path)
                      ? 'bg-maroon-50 dark:bg-charcoal-800 text-maroon-700 dark:text-gold-400'
                      : 'text-maroon-600 dark:text-charcoal-300 hover:bg-maroon-50 dark:hover:bg-charcoal-800'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}

              {authLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`block py-2.5 px-3 rounded-lg font-medium transition-colors ${
                    isActive(link.path)
                      ? 'bg-maroon-50 dark:bg-charcoal-800 text-maroon-700 dark:text-gold-400'
                      : 'text-maroon-600 dark:text-charcoal-300 hover:bg-maroon-50 dark:hover:bg-charcoal-800'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.icon && <link.icon className="w-4 h-4 inline mr-2" />}
                  {link.label}
                </Link>
              ))}

              {user ? (
                <button
                  onClick={() => { logout(); setMobileMenuOpen(false); }}
                  className="block w-full text-left py-2.5 px-3 rounded-lg font-medium text-maroon-600 dark:text-charcoal-300 hover:bg-maroon-50 dark:hover:bg-charcoal-800 transition-colors"
                >
                  <LogOut className="w-4 h-4 inline mr-2" />
                  Logout
                </button>
              ) : (
                <div className="pt-3 space-y-2 border-t border-maroon-100 dark:border-charcoal-800 mt-2">
                  <Link
                    to="/login"
                    className="block py-2.5 px-3 rounded-lg font-medium text-maroon-600 dark:text-charcoal-300 hover:bg-maroon-50 dark:hover:bg-charcoal-800 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="block text-center py-2.5 px-3 bg-maroon-700 dark:bg-gold-500 dark:text-charcoal-950 text-cream-50 rounded-full font-medium transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Join Now
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
