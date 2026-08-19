import { useState, useEffect, createContext, useContext } from 'react';
import api from '../lib/api';

const CategoriesContext = createContext(null);

export function CategoriesProvider({ children }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSlugMap = () => {
    const map = {};
    categories.forEach(c => { map[c.slug] = c; });
    return map;
  };

  const getColorClasses = (color) => {
    const map = {
      rose: 'bg-rose-100 text-rose-700',
      pink: 'bg-pink-100 text-pink-700',
      emerald: 'bg-emerald-100 text-emerald-700',
      gold: 'bg-gold-100 text-gold-700',
      purple: 'bg-purple-100 text-purple-700',
      blue: 'bg-blue-100 text-blue-700',
    };
    return map[color] || 'bg-maroon-100 text-maroon-700';
  };

  return (
    <CategoriesContext.Provider value={{ categories, loading, fetchCategories, getSlugMap, getColorClasses }}>
      {children}
    </CategoriesContext.Provider>
  );
}

export function useCategories() {
  const context = useContext(CategoriesContext);
  if (!context) {
    throw new Error('useCategories must be used within a CategoriesProvider');
  }
  return context;
}
