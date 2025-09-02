import React, { useState, useEffect, useCallback } from 'react';
import './styles/App.css';
import Catalog from './components/Catalog';
import UserPreferences from './components/UserPreferences';
import Recommendations from './components/Recommendations';
import BrowsingHistory from './components/BrowsingHistory';
import { fetchProducts, getRecommendations } from './services/api';

function App() {
  // State
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [userPreferences, setUserPreferences] = useState({
    priceRange: 'all',
    categories: [],
    brands: [],
    minRating: 0
  });
  const [browsingHistory, setBrowsingHistory] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [notification, setNotification] = useState(null);

  // Fetch products
  useEffect(() => {
    const loadProducts = async () => {
      setIsLoadingProducts(true);
      try {
        const data = await fetchProducts();
        setProducts(data);
        setFilteredProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
        showNotification('Failed to load products.', 'error');
      } finally {
        setIsLoadingProducts(false);
      }
    };
    loadProducts();
  }, []);

  // Filter products
  useEffect(() => {
    const filtered = products.filter(product => {
      const matchesSearch = searchQuery === '' ||
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = userPreferences.categories.length === 0 ||
        userPreferences.categories.includes(product.category);

      const matchesBrand = userPreferences.brands.length === 0 ||
        userPreferences.brands.includes(product.brand);

      const matchesPrice = userPreferences.priceRange === 'all' ||
        (userPreferences.priceRange === '0-50' && product.price <= 50) ||
        (userPreferences.priceRange === '50-100' && product.price > 50 && product.price <= 100) ||
        (userPreferences.priceRange === '100+' && product.price > 100);

      const matchesRating = product.rating >= userPreferences.minRating;

      return matchesSearch && matchesCategory && matchesBrand && matchesPrice && matchesRating;
    });
    setFilteredProducts(filtered);
  }, [products, searchQuery, userPreferences]);

  // Update preferences
  const handlePreferencesChange = useCallback((newPreferences) => {
    setUserPreferences(prev => ({ ...prev, ...newPreferences }));
  }, []);

  // Handle product click
  const handleProductClick = (productId) => {
    setBrowsingHistory(prev => [productId, ...prev.filter(id => id !== productId)].slice(0, 20));
  };

  // Get recommendations
  const handleGetRecommendations = async () => {
    if (browsingHistory.length === 0 && userPreferences.categories.length === 0) {
      showNotification('Browse products or set preferences first.', 'warning');
      return;
    }

    setIsLoading(true);
    try {
      const data = await getRecommendations(userPreferences, browsingHistory);
      setRecommendations(data.recommendations || []);
      showNotification('Recommendations updated!', 'success');
    } catch (error) {
      console.error('Error getting recommendations:', error);
      showNotification('Failed to get recommendations.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Clear browsing history
  const handleClearHistory = () => setBrowsingHistory([]);

  // Show notification
  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>AI-Powered Product Recommendation Engine</h1>
        <input
          type="text"
          placeholder="Search products, brands, categories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
      </header>

      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      <main className="app-content">
        <aside className="sidebar">
          <UserPreferences
            preferences={userPreferences}
            products={products}
            onPreferencesChange={handlePreferencesChange}
          />
          <BrowsingHistory
            history={browsingHistory}
            products={products}
            onClearHistory={handleClearHistory}
          />
          <button
            className="get-recommendations-btn"
            onClick={handleGetRecommendations}
            disabled={isLoading}
          >
            {isLoading ? 'Getting Recommendations...' : 'Get Personalized Recommendations'}
          </button>
        </aside>

        <section className="main-section">
          <div className="catalog-section">
            <h2>Product Catalog</h2>
            {isLoadingProducts ? <p>Loading products...</p> : (
              <Catalog
                products={filteredProducts}
                onProductClick={handleProductClick}
                browsingHistory={browsingHistory}
              />
            )}
          </div>

          <div className="recommendations-section">
            <h2>Your Recommendations</h2>
            <Recommendations
              recommendations={recommendations}
              isLoading={isLoading}
              onProductClick={handleProductClick}
            />
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
