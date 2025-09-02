import React, { useState, useMemo, useCallback } from 'react';
import './Catalog.css';

const Catalog = ({ 
  products, 
  onProductClick, 
  browsingHistory, 
  isLoading = false,
  onProductFavorite,
  onProductCompare 
}) => {
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('featured');
  const [wishlist, setWishlist] = useState(new Set());
  const [compareList, setCompareList] = useState(new Set());
  const [compareMode, setCompareMode] = useState(false);

  const sortedProducts = useMemo(() => {
    if (!products || products.length === 0) return [];
    return [...products].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        case 'newest':
          return (b.dateAdded || 0) - (a.dateAdded || 0);
        case 'featured':
        default:
          const aScore = (a.rating * 20) + (a.reviewCount || 0) * 0.1 + (wishlist.has(a.id) ? 50 : 0);
          const bScore = (b.rating * 20) + (b.reviewCount || 0) * 0.1 + (wishlist.has(b.id) ? 50 : 0);
          return bScore - aScore;
      }
    });
  }, [products, sortBy, wishlist]);

  const handleProductClick = useCallback((product) => {
    onProductClick(product.id);
  }, [onProductClick]);

  const handleWishlistToggle = useCallback((productId, event) => {
    event.stopPropagation();
    setWishlist(prev => {
      const newWishlist = new Set(prev);
      if (newWishlist.has(productId)) {
        newWishlist.delete(productId);
      } else {
        newWishlist.add(productId);
      }
      onProductFavorite && onProductFavorite(productId, !prev.has(productId));
      return newWishlist;
    });
  }, [onProductFavorite]);

  const handleCompareToggle = useCallback((productId, event) => {
    event.stopPropagation();
    if (compareList.size >= 3 && !compareList.has(productId)) return;

    setCompareList(prev => {
      const newCompareList = new Set(prev);
      if (newCompareList.has(productId)) {
        newCompareList.delete(productId);
      } else {
        newCompareList.add(productId);
      }
      onProductCompare && onProductCompare(Array.from(newCompareList));
      return newCompareList;
    });
  }, [compareList, onProductCompare]);

  const getProductBadges = (product) => {
    const badges = [];
    if (product.isNew) badges.push({ type: 'new', text: 'New' });
    if (product.onSale) badges.push({ type: 'sale', text: `${product.discountPercent}% Off` });
    if (product.rating >= 4.5 && (product.reviewCount || 0) > 100) badges.push({ type: 'popular', text: 'Popular' });
    if (product.price > 500) badges.push({ type: 'premium', text: 'Premium' });
    return badges;
  };

  const renderStars = (rating, reviewCount = 0) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) stars.push(<span key={i} className="star filled">★</span>);
      else if (i === fullStars && hasHalfStar) stars.push(<span key={i} className="star half">★</span>);
      else stars.push(<span key={i} className="star">★</span>);
    }
    return (
      <div className="product-rating">
        <div className="rating-stars">{stars}</div>
        <span className="rating-count">
          {rating.toFixed(1)} {reviewCount > 0 && `(${reviewCount})`}
        </span>
      </div>
    );
  };

  const renderProductCard = (product) => {
    const isClicked = browsingHistory.includes(product.id);
    const isWishlisted = wishlist.has(product.id);
    const isSelected = compareList.has(product.id);
    const badges = getProductBadges(product);

    return (
      <div
        key={product.id}
        className={`catalog-card ${isClicked ? 'clicked' : ''} ${isSelected ? 'selected-for-compare' : ''}`}
        onClick={() => handleProductClick(product)}
        tabIndex={0}
        role="button"
        aria-label={`View details for ${product.name}`}
      >
        {badges.length > 0 && (
          <div className="product-badges">
            {badges.map((badge, index) => (
              <span key={index} className={`product-badge badge-${badge.type}`}>{badge.text}</span>
            ))}
          </div>
        )}

        {compareMode && (
          <input
            type="checkbox"
            className="compare-checkbox"
            checked={isSelected}
            onChange={(e) => handleCompareToggle(product.id, e)}
            onClick={(e) => e.stopPropagation()}
            aria-label={`${isSelected ? 'Remove from' : 'Add to'} comparison`}
          />
        )}

        <div className="product-content">
          <div className="product-info">
            <h4 className="product-name">{product.name}</h4>
            <div className="product-brand">{product.brand}</div>
            {renderStars(product.rating, product.reviewCount)}
          </div>

          <div className="product-pricing">
            <span className="product-price">${product.price.toFixed(2)}</span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="product-original-price">${product.originalPrice.toFixed(2)}</span>
            )}
          </div>
        </div>

        <div className="product-actions">
          <button 
            className={`action-btn ${isWishlisted ? 'favorited' : ''}`}
            onClick={(e) => handleWishlistToggle(product.id, e)}
          >
            {isWishlisted ? '❤️ Saved' : '🤍 Save'}
          </button>
          {compareMode && (
            <button 
              className={`action-btn ${isSelected ? 'selected' : ''}`}
              onClick={(e) => handleCompareToggle(product.id, e)}
              disabled={compareList.size >= 3 && !isSelected}
            >
              {isSelected ? '✓ Added' : '⚖️ Compare'}
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderSkeletonCard = (index) => (
    <div key={`skeleton-${index}`} className="skeleton-card">
      <div className="skeleton-text title"></div>
      <div className="skeleton-text subtitle"></div>
      <div className="skeleton-text price"></div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="catalog-container">
        <div className="catalog-skeleton">
          {Array.from({ length: 8 }, (_, index) => renderSkeletonCard(index))}
        </div>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="catalog-container">
        <div className="catalog-empty">
          <div className="catalog-empty-content">
            <span className="catalog-empty-icon">🛍️</span>
            <h3>No Products Found</h3>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="catalog-container">
      <div className="catalog-controls">
        <div className="view-options">
          <button className={`view-btn ${viewMode==='grid'?'active':''}`} onClick={()=>setViewMode('grid')}>Grid</button>
          <button className={`view-btn ${viewMode==='list'?'active':''}`} onClick={()=>setViewMode('list')}>List</button>
          <button className={`view-btn ${viewMode==='compact'?'active':''}`} onClick={()=>setViewMode('compact')}>Compact</button>
        </div>

        <div className="sort-controls">
          <span>Sort by:</span>
          <select value={sortBy} onChange={e=>setSortBy(e.target.value)}>
            <option value="featured">Featured</option>
            <option value="name">Name</option>
            <option value="price-low">Price Low → High</option>
            <option value="price-high">Price High → Low</option>
            <option value="rating">Rating</option>
            <option value="newest">Newest</option>
          </select>
        </div>

        <button className={`compare-toggle ${compareMode ? 'active' : ''}`} onClick={() => setCompareMode(!compareMode)}>
          {compareMode ? 'Exit Compare' : 'Compare Products'}
        </button>
      </div>

      <div className={`catalog-grid view-${viewMode}`}>
        {sortedProducts.map(renderProductCard)}
      </div>
    </div>
  );
};

export default Catalog;
