import { useCategories } from '../hooks/useCategories';
import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { categories } = useCategories();
  const { t } = useTranslation();

  return (
    <footer className="bg-maroon-900 dark:bg-charcoal-900 text-cream-100 py-12 mt-auto border-t border-maroon-800 dark:border-charcoal-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-display text-xl font-bold tracking-widest mb-4 uppercase">
              <span className="text-gold-400">Diyar</span><span className="font-script text-2xl mx-0.5 text-gold-400">e</span><span className="text-gold-400">Noor</span>
            </h3>
            <p className="text-maroon-200 dark:text-charcoal-400 text-sm leading-relaxed">
              {t('footer.sanctuaryDesc')}
            </p>
          </div>

          <div>
            <h4 className="font-display text-lg font-semibold mb-4 text-cream-100">{t('footer.explore')}</h4>
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
            <h4 className="font-display text-lg font-semibold mb-4 text-cream-100">{t('footer.connect')}</h4>
            <ul className="space-y-2 text-maroon-200 dark:text-charcoal-400 text-sm">
              <li><a href="/about" className="hover:text-gold-400 transition-colors">{t('footer.aboutUs')}</a></li>
              <li><a href="/contact" className="hover:text-gold-400 transition-colors">{t('footer.contact')}</a></li>
              <li><a href="/become-admin" className="hover:text-gold-400 transition-colors">{t('footer.becomeAdmin')}</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-maroon-800 dark:border-charcoal-800 text-center">
          <p className="text-maroon-400 dark:text-charcoal-600 text-sm">
            &copy; {new Date().getFullYear()} <span className="font-display font-bold tracking-widest text-gold-400 uppercase">Diyar<span className="font-script text-lg mx-0.5">e</span>Noor</span>. {t('footer.madeWith')}
          </p>
        </div>
      </div>
    </footer>
  );
}
