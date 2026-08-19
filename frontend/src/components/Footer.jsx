import { useCategories } from '../hooks/useCategories';

export default function Footer() {
  const { categories } = useCategories();

  return (
    <footer className="bg-maroon-900 dark:bg-charcoal-900 text-cream-100 py-12 mt-auto border-t border-maroon-800 dark:border-charcoal-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-display text-xl font-bold tracking-widest mb-4 uppercase">
              <span className="text-gold-400">Diyar</span><span className="font-script text-2xl mx-0.5 text-gold-400">e</span><span className="text-gold-400">Noor</span>
            </h3>
            <p className="text-maroon-200 dark:text-charcoal-400 text-sm leading-relaxed">
              A sanctuary for hearts seeking guidance in the beauty of sacred love.
            </p>
          </div>

          <div>
            <h4 className="font-display text-lg font-semibold mb-4 text-cream-100">Explore</h4>
            <ul className="space-y-2 text-maroon-200 dark:text-charcoal-400 text-sm">
              {categories.map((cat) => (
                <li key={cat.slug}>
                  <a href={`/categories?category=${cat.slug}`} className="hover:text-gold-400 transition-colors">
                    {cat.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display text-lg font-semibold mb-4 text-cream-100">Connect</h4>
            <ul className="space-y-2 text-maroon-200 dark:text-charcoal-400 text-sm">
              <li><a href="/about" className="hover:text-gold-400 transition-colors">About Us</a></li>
              <li><a href="/contact" className="hover:text-gold-400 transition-colors">Contact</a></li>
              <li><a href="/become-admin" className="hover:text-gold-400 transition-colors">Become an Admin</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-maroon-800 dark:border-charcoal-800 text-center">
          <p className="text-maroon-400 dark:text-charcoal-600 text-sm">
            &copy; {new Date().getFullYear()} <span className="font-display font-bold tracking-widest text-gold-400 uppercase">Diyar<span className="font-script text-lg mx-0.5">e</span>Noor</span>. Made with love and intention.
          </p>
        </div>
      </div>
    </footer>
  );
}
