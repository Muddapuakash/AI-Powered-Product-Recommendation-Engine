// services/api.js

const API_BASE_URL = "http://localhost:5000/api";

/**
 * Fetch all products from the backend API
 */
export const fetchProducts = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/products`);
    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("fetchProducts error:", error);
    throw error;
  }
};

/**
 * Get product recommendations based on user preferences and browsing history
 * @param {Object} userPreferences - { priceRange, categories, brands, minRating }
 * @param {Array} browsingHistory - array of product IDs
 */
export const getRecommendations = async (userPreferences, browsingHistory) => {
  try {
    const payload = {
      preferences: userPreferences,
      browsing_history: browsingHistory
    };

    const response = await fetch(`${API_BASE_URL}/recommendations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Failed to get recommendations: ${response.status}, ${text}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("getRecommendations error:", error);
    throw error;
  }
};
