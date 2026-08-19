import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { ArrowRight, Sparkles, BookOpen } from 'lucide-react';
import { useCategories } from '../hooks/useCategories';

const colorStyles = {
  rose: {
    bgFrom: 'from-rose-50', bgTo: 'to-rose-100/50',
    border: 'border-rose-200/60', tag: 'bg-rose-100 text-rose-700', hover: 'hover:border-rose-300',
    darkBgFrom: 'dark:from-rose-950/30', darkBgTo: 'dark:to-rose-900/20',
    darkBorder: 'dark:border-rose-800/30', darkTag: 'dark:bg-rose-900/40 dark:text-rose-300',
  },
  pink: {
    bgFrom: 'from-pink-50', bgTo: 'to-rose-50/50',
    border: 'border-pink-200/60', tag: 'bg-pink-100 text-pink-700', hover: 'hover:border-pink-300',
    darkBgFrom: 'dark:from-pink-950/30', darkBgTo: 'dark:to-pink-900/20',
    darkBorder: 'dark:border-pink-800/30', darkTag: 'dark:bg-pink-900/40 dark:text-pink-300',
  },
  emerald: {
    bgFrom: 'from-emerald-50', bgTo: 'to-teal-50/50',
    border: 'border-emerald-200/60', tag: 'bg-emerald-100 text-emerald-700', hover: 'hover:border-emerald-300',
    darkBgFrom: 'dark:from-emerald-950/30', darkBgTo: 'dark:to-emerald-900/20',
    darkBorder: 'dark:border-emerald-800/30', darkTag: 'dark:bg-emerald-900/40 dark:text-emerald-300',
  },
  gold: {
    bgFrom: 'from-amber-50', bgTo: 'to-orange-50/50',
    border: 'border-amber-200/60', tag: 'bg-amber-100 text-amber-700', hover: 'hover:border-amber-300',
    darkBgFrom: 'dark:from-amber-950/30', darkBgTo: 'dark:to-amber-900/20',
    darkBorder: 'dark:border-amber-800/30', darkTag: 'dark:bg-amber-900/40 dark:text-amber-300',
  },
  purple: {
    bgFrom: 'from-violet-50', bgTo: 'to-purple-50/50',
    border: 'border-violet-200/60', tag: 'bg-violet-100 text-violet-700', hover: 'hover:border-violet-300',
    darkBgFrom: 'dark:from-violet-950/30', darkBgTo: 'dark:to-violet-900/20',
    darkBorder: 'dark:border-violet-800/30', darkTag: 'dark:bg-violet-900/40 dark:text-violet-300',
  },
  blue: {
    bgFrom: 'from-sky-50', bgTo: 'to-blue-50/50',
    border: 'border-sky-200/60', tag: 'bg-sky-100 text-sky-700', hover: 'hover:border-sky-300',
    darkBgFrom: 'dark:from-sky-950/30', darkBgTo: 'dark:to-sky-900/20',
    darkBorder: 'dark:border-sky-800/30', darkTag: 'dark:bg-sky-900/40 dark:text-sky-300',
  },
  maroon: {
    bgFrom: 'from-maroon-50', bgTo: 'to-maroon-100/50',
    border: 'border-maroon-200/60', tag: 'bg-maroon-100 text-maroon-700', hover: 'hover:border-maroon-300',
    darkBgFrom: 'dark:from-maroon-950/30', darkBgTo: 'dark:to-maroon-900/20',
    darkBorder: 'dark:border-maroon-800/30', darkTag: 'dark:bg-maroon-900/40 dark:text-maroon-300',
  },
};

const fallbackImage = 'https://images.unsplash.com/photo-1590012314607-cda9d9b699ae?w=800&q=80';

function CategoryCard({ category, index }) {
  const isLeft = index % 2 === 0;
  const styles = colorStyles[category.color] || colorStyles.maroon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.7, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <Link
        to={`/categories?category=${category.slug}`}
        className={`group block rounded-[2rem] overflow-hidden border ${styles.border} ${styles.darkBorder} ${styles.hover} shadow-premium dark:shadow-premium-dark card-hover bg-white dark:bg-charcoal-900`}
      >
        <div className={`flex flex-col ${isLeft ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
          {/* Image Side */}
          <div className="relative w-full md:w-[52%] h-64 sm:h-72 md:h-[26rem] overflow-hidden">
            <motion.img
              src={category.image_url || fallbackImage}
              alt={category.title}
              className="w-full h-full object-cover"
              whileHover={{ scale: 1.06 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
            {category.icon && (
              <div className="absolute top-5 left-5 bg-white/90 dark:bg-charcoal-900/90 backdrop-blur-sm w-11 h-11 rounded-full flex items-center justify-center text-lg shadow-sm">
                {category.icon}
              </div>
            )}
          </div>

          {/* Text Side */}
          <div className={`w-full md:w-[48%] p-8 sm:p-10 md:p-12 flex flex-col justify-center bg-gradient-to-br ${styles.bgFrom} ${styles.bgTo} ${styles.darkBgFrom} ${styles.darkBgTo}`}>
            {category.subtitle && (
              <span className={`inline-flex items-center self-start px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase mb-4 ${styles.tag} ${styles.darkTag}`}>
                {category.subtitle}
              </span>
            )}

            <h3 className="font-display text-3xl sm:text-4xl font-bold text-maroon-900 dark:text-cream-50 mb-4 leading-tight">
              {category.title}
            </h3>

            {category.description && (
              <p className="text-maroon-600/80 dark:text-charcoal-400 leading-relaxed mb-8 text-[0.95rem]">
                {category.description}
              </p>
            )}

            <div className="flex items-center text-maroon-800 dark:text-gold-400 font-semibold text-sm group-hover:text-maroon-900 transition-colors mt-auto">
              <span className="border-b-2 border-transparent group-hover:border-maroon-800 dark:group-hover:border-gold-400 transition-all duration-300">
                Read Stories
              </span>
              <motion.div
                className="ml-2"
                whileHover={{ x: 4 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </motion.div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function Home() {
  const { categories } = useCategories();
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <div className="min-h-screen bg-cream-50 dark:bg-charcoal-950">
      {/* Hero */}
      <section
        ref={heroRef}
        className="relative overflow-hidden bg-maroon-900 dark:bg-charcoal-900"
      >
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1564769662533-4f00a87b4056?w=1600&q=80"
            alt=""
            className="w-full h-full object-cover opacity-20 dark:opacity-10"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-maroon-900/60 via-maroon-900/80 to-maroon-900 dark:from-charcoal-900/60 dark:via-charcoal-900/80 dark:to-charcoal-950" />
        </div>

        <div className="absolute inset-0 islamic-pattern opacity-10" />

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-28 md:py-40 text-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center space-x-2 bg-white/10 dark:bg-charcoal-800/50 backdrop-blur-md text-gold-300 px-5 py-2 rounded-full mb-8 border border-white/10 dark:border-charcoal-700/50"
          >
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium tracking-wide">A Sanctuary for the Heart</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="mb-4"
          >
            <span className="font-display text-5xl md:text-6xl lg:text-7xl font-bold tracking-widest uppercase">
              <span className="gold-shimmer">Diyar</span><span className="font-script text-7xl md:text-8xl lg:text-9xl mx-1 gold-shimmer">e</span><span className="gold-shimmer">Noor</span>
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="font-display text-xl md:text-2xl text-gold-300/80 italic mb-6"
          >
            Union of Beloveds
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="text-cream-100/50 max-w-2xl mx-auto mb-12 text-base md:text-lg leading-relaxed"
          >
            A halal space for exploring Ishq, Mohabbat, and Pakeezgi — where hearts find
            guidance in the light of sacred love.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              to="/categories"
              className="btn-premium inline-flex items-center space-x-2 bg-gold-500 text-maroon-950 px-8 py-3.5 rounded-full font-semibold hover:bg-gold-400 transition-all shadow-lg hover:shadow-glow-gold hover:scale-[1.03]"
            >
              <BookOpen className="w-5 h-5" />
              <span>Explore All Stories</span>
            </Link>
            <Link
              to="/become-admin"
              className="inline-flex items-center space-x-2 bg-white/10 dark:bg-charcoal-800/50 backdrop-blur-sm text-cream-100 px-8 py-3.5 rounded-full font-medium border border-white/20 dark:border-charcoal-600/50 hover:bg-white/20 dark:hover:bg-charcoal-700/50 transition-all"
            >
              <span>Write for Us</span>
            </Link>
          </motion.div>
        </motion.div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full dark:hidden" preserveAspectRatio="none">
            <path d="M0 100V60C240 80 480 20 720 30C960 40 1200 80 1440 60V100H0Z" fill="#FFFDF7"/>
          </svg>
          <svg viewBox="0 0 1440 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full hidden dark:block" preserveAspectRatio="none">
            <path d="M0 100V60C240 80 480 20 720 30C960 40 1200 80 1440 60V100H0Z" fill="#0F0D0D"/>
          </svg>
        </div>
      </section>

      {/* Category Cards */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14 md:mb-20"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold text-maroon-900 dark:text-cream-50 mb-4">
            Explore Our World
          </h2>
          <p className="text-maroon-500/80 dark:text-charcoal-400 text-lg max-w-xl mx-auto leading-relaxed">
            Each theme, a doorway to understanding love, purity, and faith.
          </p>
          <div className="gold-divider w-20 mx-auto mt-6" />
        </motion.div>

        <div className="space-y-10 md:space-y-14">
          {categories.map((category, index) => (
            <CategoryCard key={category.id} category={category} index={index} />
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="relative overflow-hidden bg-maroon-800 dark:bg-charcoal-900">
        <div className="absolute inset-0 islamic-pattern opacity-10" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-cream-50 mb-5">
              Share Your Voice
            </h2>
            <p className="text-cream-200/60 dark:text-charcoal-400 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
              Become an Admin and contribute your perspective on love, faith, and sacred relationships.
            </p>
            <Link
              to="/become-admin"
              className="btn-premium inline-flex items-center space-x-2 bg-gold-500 text-maroon-950 px-8 py-3.5 rounded-full font-semibold hover:bg-gold-400 transition-all shadow-lg hover:shadow-glow-gold hover:scale-[1.03]"
            >
              <span>Become an Admin</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
