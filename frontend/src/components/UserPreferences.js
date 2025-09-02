import React, { useState, useEffect } from 'react';
import './UserPreferences.css';

const UserPreferences = ({ preferences, products, onPreferencesChange }) => {
  const [selectedCategories, setSelectedCategories] = useState(preferences.categories);
  const [selectedBrands, setSelectedBrands] = useState(preferences.brands);
  const [priceRange, setPriceRange] = useState(preferences.priceRange || 100);

  const categories = [...new Set(products.map(p => p.category))];
  const brands = [...new Set(products.map(p => p.brand))];

  useEffect(() => {
    if (typeof onPreferencesChange === 'function') {
      onPreferencesChange({
        categories: selectedCategories,
        brands: selectedBrands,
        priceRange: priceRange
      });
    }
  }, [selectedCategories, selectedBrands, priceRange, onPreferencesChange]);

  const handleCategoryChange = (category) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleBrandChange = (brand) => {
    setSelectedBrands(prev =>
      prev.includes(brand)
        ? prev.filter(b => b !== brand)
        : [...prev, brand]
    );
  };

  return (
    <div className="preferences-container">
      <h3>Your Preferences</h3>

      <div className="preference-group">
        <label>Max Price: ${priceRange}</label>
        <input
          type="range"
          min="0"
          max="500"
          value={priceRange}
          onChange={(e) => setPriceRange(e.target.value)}
          className="price-range"
        />
      </div>

      <div className="preference-group">
        <label>Categories:</label>
        <div className="checkbox-group">
          {categories.map((category) => (
            <label key={category} className="toggle-checkbox">
              <input
                type="checkbox"
                checked={selectedCategories.includes(category)}
                onChange={() => handleCategoryChange(category)}
              />
              <span>{category}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="preference-group">
        <label>Brands:</label>
        <div className="checkbox-group">
          {brands.map((brand) => (
            <label key={brand} className="toggle-checkbox">
              <input
                type="checkbox"
                checked={selectedBrands.includes(brand)}
                onChange={() => handleBrandChange(brand)}
              />
              <span>{brand}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserPreferences;
