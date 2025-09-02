import React from 'react';
import './Recommendations.css';

const Recommendations = ({ recommendations, isLoading }) => {
  if (isLoading) return <p className="loading">Loading recommendations...</p>;

  if (!recommendations || recommendations.length === 0) {
    return <p className="no-recommendations">No recommendations yet. Set your preferences and browse some products!</p>;
  }

  const getConfidenceColor = (score) => {
    if (score >= 8) return '#16a34a'; // green
    if (score >= 5) return '#f59e0b'; // yellow
    return '#ef4444'; // red
  };

  return (
    <div className="recommendations-grid">
      {recommendations.map((rec) => (
        <div key={rec.product.id} className="recommendation-card">
          <div className="card-header">
            <h4>{rec.product.name}</h4>
            <span className="category">{rec.product.category}</span>
          </div>
          <div className="card-body">
            <p><strong>Brand:</strong> {rec.product.brand}</p>
            <p><strong>Price:</strong> ${rec.product.price.toFixed(2)}</p>
            <p><strong>Why:</strong> {rec.explanation}</p>
          </div>
          <div className="confidence-section">
            <p><strong>Confidence:</strong> {rec.confidence_score}/10</p>
            <div className="confidence-bar">
              <div
                className="confidence-fill"
                style={{
                  width: `${rec.confidence_score * 10}%`,
                  backgroundColor: getConfidenceColor(rec.confidence_score)
                }}
              ></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Recommendations;
