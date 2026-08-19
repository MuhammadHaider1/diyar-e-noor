import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { Heart, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Hero() {
  return (
    <section className="relative overflow-hidden py-20 lg:py-28">
      <div className="absolute inset-0 islamic-pattern opacity-30 dark:opacity-10" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center space-x-2 bg-maroon-50 dark:bg-charcoal-800 text-maroon-700 dark:text-gold-400 px-5 py-2 rounded-full mb-8 border border-maroon-100 dark:border-charcoal-700"
          >
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">A sanctuary for the heart</span>
          </motion.div>

          <h1 className="mb-6">
            <span className="font-display text-5xl md:text-6xl lg:text-7xl font-bold tracking-widest text-maroon-800 dark:text-cream-50 uppercase">
              Diyar<span className="font-script text-7xl md:text-8xl lg:text-9xl mx-1 text-gold-500">e</span>Noor
            </span>
            <span className="font-display text-xl md:text-2xl lg:text-3xl font-normal text-maroon-600 dark:text-gold-400/80 mt-2 block italic">
              Union of Beloveds
            </span>
          </h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg md:text-xl text-maroon-700 dark:text-charcoal-300 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            A halal space for exploring Ishq, Mohabbat, and Pakeezgi — where hearts find 
            guidance in the light of sacred love.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              to="/register"
              className="btn-premium bg-maroon-700 dark:bg-gold-500 dark:text-charcoal-950 text-cream-50 px-8 py-3.5 rounded-full font-medium hover:bg-maroon-800 dark:hover:bg-gold-400 transition-all shadow-lg hover:shadow-glow-gold flex items-center space-x-2"
            >
              <Heart className="w-5 h-5" />
              <span>Begin Your Journey</span>
            </Link>
            <Link
              to="/categories"
              className="text-maroon-700 dark:text-cream-200 px-8 py-3.5 rounded-full font-medium border-2 border-maroon-200 dark:border-charcoal-600 hover:border-maroon-400 dark:hover:border-gold-500 transition-colors"
            >
              Explore Topics
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="mt-20 flex justify-center"
        >
          <div className="gold-divider w-32" />
        </motion.div>
      </div>
    </section>
  );
}
