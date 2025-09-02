import React, { useState, useEffect, useMemo, useCallback } from 'react';
import './BrowsingHistory.css';

const BrowsingHistory = ({ history, products, onClearHistory, onProductClick }) => {
  const [viewMode, setViewMode] = useState('list');
  const [sortBy, setSortBy] = useState('recent');
  const [filterBy, setFilterBy] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState(new Set());
  const [timestamps, setTimestamps] = useState(new Map());

  useEffect(() => {
    const newTimestamps = new Map(timestamps);
    history.forEach(id => {
      if (!newTimestamps.has(id)) newTimestamps.set(id, Date.now());
    });
    setTimestamps(newTimestamps);
  }, [history, timestamps]);

  useEffect(() => {
    if (history.length > 0) {
      const latest = history[0];
      setTimestamps(prev => new Map(prev.set(latest, Date.now())));
    }
  }, [history]);

  const historyProducts = useMemo(() => {
    return history
      .map(id => {
        const product = products.find(p => p.id === id);
        if (!product) return null;
        return {
          ...product,
          viewedAt: timestamps.get(id) || Date.now(),
          isFavorite: favorites.has(id),
          viewCount: history.filter(histId => histId === id).length
        };
      })
      .filter(Boolean);
  }, [history, products, timestamps, favorites]);

  const processedProducts = useMemo(() => {
    let filtered = [...historyProducts];
    if (searchQuery) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (filterBy !== 'all') {
      filtered = filtered.filter(p =>
        filterBy === 'favorites' ? p.isFavorite : p.category === filterBy
      );
    }
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'recent': return b.viewedAt - a.viewedAt;
        case 'name': return a.name.localeCompare(b.name);
        case 'price': return a.price - b.price;
        case 'rating': return b.rating - a.rating;
        default: return 0;
      }
    });
    return filtered;
  }, [historyProducts, searchQuery, filterBy, sortBy]);

  const availableCategories = useMemo(() => {
    return [...new Set(historyProducts.map(p => p.category))].sort();
  }, [historyProducts]);

  const insights = useMemo(() => {
    if (!historyProducts.length) return [];
    const categoryCount = historyProducts.reduce((acc, p) => { acc[p.category] = (acc[p.category] || 0) + 1; return acc; }, {});
    const brandCount = historyProducts.reduce((acc, p) => { acc[p.brand] = (acc[p.brand] || 0) + 1; return acc; }, {});
    const avgPrice = historyProducts.reduce((sum, p) => sum + p.price, 0) / historyProducts.length;
    const avgRating = historyProducts.reduce((sum, p) => sum + p.rating, 0) / historyProducts.length;
    const topCategory = Object.entries(categoryCount).reduce((a, b) => a[1] > b[1] ? a : b)[0];
    const topBrand = Object.entries(brandCount).reduce((a, b) => a[1] > b[1] ? a : b)[0];
    return [
      `Most viewed category: ${topCategory}`,
      `Favorite brand: ${topBrand}`,
      `Average price: $${avgPrice.toFixed(2)}`,
      `Average rating: ${avgRating.toFixed(1)}/5`
    ];
  }, [historyProducts]);

  const handleProductClick = useCallback((product) => {
    onProductClick && onProductClick(product.id);
  }, [onProductClick]);

  const handleFavoriteToggle = useCallback((productId, e) => {
    e.stopPropagation();
    setFavorites(prev => {
      const newSet = new Set(prev);
      newSet.has(productId) ? newSet.delete(productId) : newSet.add(productId);
      return newSet;
    });
  }, []);

  const handleRemoveItem = useCallback((productId, e) => {
    e.stopPropagation();
    setFavorites(prev => {
      const newSet = new Set(prev);
      newSet.delete(productId);
      return newSet;
    });
  }, []);

  const handleClearSearch = () => setSearchQuery('');

  const exportHistory = useCallback(() => {
    const data = historyProducts.map(p => ({
      name: p.name, brand: p.brand, category: p.category,
      price: p.price, rating: p.rating,
      viewedAt: new Date(p.viewedAt).toISOString(),
      isFavorite: p.isFavorite
    }));
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `browsing-history-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [historyProducts]);

  const formatTimestamp = (timestamp) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);
    return <span className="rating-stars">{'★'.repeat(fullStars)}{hasHalf && '☆'}{'☆'.repeat(emptyStars)}</span>;
  };

  const renderHistoryItem = (product) => (
    <div key={product.id} className="history-item" onClick={() => handleProductClick(product)}>
      <div className="history-item-info">
        <h4 title={product.name}>{product.name}</h4>
        <div className="item-details">
          <span className="price">${product.price.toFixed(2)}</span>
          <span className="brand">{product.brand}</span>
          <span className="category">{product.category}</span>
        </div>
        <div>{renderStars(product.rating)} {product.rating.toFixed(1)}</div>
      </div>
      <div className="history-item-footer">
        <span className="timestamp">{formatTimestamp(product.viewedAt)}</span>
        <div>
          <button className={product.isFavorite ? 'favorited' : ''} onClick={(e) => handleFavoriteToggle(product.id, e)}>
            {product.isFavorite ? '❤️' : '🤍'}
          </button>
          <button onClick={(e) => handleRemoveItem(product.id, e)}>✕</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="history-container">
      <h3>Browsing History ({processedProducts.length})</h3>

      {/* Actions */}
      <div className="actions">
        <button onClick={onClearHistory}>Clear History</button>
        <button onClick={exportHistory}>Export History</button>
      </div>

      {/* Search */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search history..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
        {searchQuery && <button onClick={handleClearSearch}>✕</button>}
      </div>

      {/* Filters */}
      <div className="filters">
        <button onClick={() => setFilterBy('all')} className={filterBy === 'all' ? 'active' : ''}>All</button>
        <button onClick={() => setFilterBy('favorites')} className={filterBy === 'favorites' ? 'active' : ''}>Favorites</button>
        {availableCategories.map(cat => (
          <button key={cat} onClick={() => setFilterBy(cat)} className={filterBy === cat ? 'active' : ''}>{cat}</button>
        ))}
      </div>

      {/* Sort & View */}
      <div className="sort-view">
        <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="recent">Most Recent</option>
          <option value="name">Name A-Z</option>
          <option value="price">Price Low-High</option>
          <option value="rating">Rating High-Low</option>
        </select>
        <div className="view-toggle">
          <button onClick={() => setViewMode('list')} className={viewMode==='list'?'active':''}>List</button>
          <button onClick={() => setViewMode('grid')} className={viewMode==='grid'?'active':''}>Grid</button>
        </div>
      </div>

      {/* Items */}
      <div className={`history-list ${viewMode}`}>
        {processedProducts.length === 0 ? <p>No matching items</p> : processedProducts.map(renderHistoryItem)}
      </div>

      {/* Insights */}
      {insights.length > 0 && (
        <div className="insights">
          <h4>Insights</h4>
          <ul>{insights.map((i, idx) => <li key={idx}>{i}</li>)}</ul>
        </div>
      )}
    </div>
  );
};

export default BrowsingHistory;
