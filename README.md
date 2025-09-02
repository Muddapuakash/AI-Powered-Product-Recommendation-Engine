# i95dev AI Engineering Intern - Take-Home Assignment
## AI-Powered Product Recommendation Engine

### Overview

Welcome to the i95dev AI Engineering Intern take-home assignment! This project is designed to evaluate your skills in working with LLMs, prompt engineering, and full-stack development in an eCommerce context.

Your task is to build a simplified product recommendation system that leverages LLMs to generate personalized recommendations based on user preferences and browsing history. This system should demonstrate your ability to effectively engineer prompts, build APIs, and create a functional frontend interface.

### Project Requirements

#### Backend (Python)
- Develop a REST API using Flask that interfaces with an LLM (OpenAI GPT-3.5-turbo or similar)
- Implement prompt engineering to optimize product recommendations based on user preferences
- Create endpoints for:
  - Accepting user preference data
  - Processing browsing history
  - Returning personalized product recommendations with explanations

#### Frontend (React)
- Build a clean interface showing the product catalog
- Implement a user preference form to capture interests (e.g., preferences for categories, price ranges, styles)
- Create a browsing history simulation (users can click on products to add them to history)
- Display personalized recommendations with reasoning from the LLM

### Starter Kit

We've provided a starter kit to help you focus on the core technical challenges rather than boilerplate setup. The kit includes:

#### Backend Structure
```
backend/
│
├── app.py               # Main Flask application
├── requirements.txt     # Python dependencies
├── config.py            # Configuration (add your API keys here)
├── data/
│   └── products.json    # Sample product catalog
│
├── services/
│   ├── __init__.py
│   ├── llm_service.py   # Service for LLM interactions (implement this)
│   └── product_service.py  # Service for product data operations
│
└── README.md            # Backend setup instructions
```

#### Frontend Structure
```
frontend/
│
├── public/
│   └── index.html
│
├── src/
│   ├── App.js           # Main application component
│   ├── index.js         # Entry point
│   ├── components/
│   │   ├── Catalog.js   # Product catalog display (implement this)
│   │   ├── UserPreferences.js  # Preference form (implement this)
│   │   ├── Recommendations.js  # Recommendations display (implement this)
│   │   └── BrowsingHistory.js  # Browsing history component (implement this)
│   │
│   ├── services/
│   │   └── api.js       # API client for backend communication
│   │
│   └── styles/
│       └── App.css      # Styling
│
├── package.json         # NPM dependencies
└── README.md            # Frontend setup instructions
```

### Sample Dataset

We've provided a sample product catalog (`products.json`) that contains 50 products across various categories. Each product has the following structure:

```json
{
  "id": "product123",
  "name": "Ultra-Comfort Running Shoes",
  "category": "Footwear",
  "subcategory": "Running",
  "price": 89.99,
  "brand": "SportsFlex",
  "description": "Lightweight running shoes with responsive cushioning and breathable mesh upper.",
  "features": ["Responsive cushioning", "Breathable mesh", "Durable outsole"],
  "rating": 4.7,
  "inventory": 45,
  "tags": ["running", "athletic", "comfortable", "lightweight"]
}
```

The dataset includes products from categories such as:
- Electronics (smartphones, laptops, headphones, etc.)
- Clothing (shirts, pants, dresses, etc.)
- Home goods (furniture, kitchenware, decor, etc.)
- Beauty & Personal Care (skincare, makeup, fragrances, etc.)
- Sports & Outdoors (equipment, apparel, accessories, etc.)

### Key Implementation Guidelines

#### LLM Integration
- You should use OpenAI's API (GPT-3.5-turbo is sufficient) or another LLM API of your choice
- Implement proper error handling for API calls
- Use appropriate context windows and token limits

#### Prompt Engineering
- Design prompts that effectively leverage product metadata and user preferences
- Ensure your prompts provide reasoning for recommendations
- Consider how to handle context limitations for larger product catalogs

#### API Design
- Create RESTful endpoints with proper request/response formats
- Implement appropriate error handling
- Consider performance and optimization

#### React Frontend
- Focus on clean, functional UI rather than elaborate designs
- Implement responsive components that adapt to different screen sizes
- Use React state management appropriately (useState, useContext, etc.)

### Stretch Goals (Optional)

If you complete the core requirements and want to demonstrate additional skills, consider implementing one or more of these stretch goals:

1. Add user authentication and profile persistence
2. Implement caching for LLM responses to improve performance
3. Add filtering and sorting options to the product catalog
4. Create A/B testing for different prompt strategies
5. Add unit and/or integration tests

### Evaluation Criteria

Your submission will be evaluated based on:

1. **Prompt Engineering Quality (30%)**
   - Effectiveness of prompts in generating relevant recommendations
   - Context handling and optimization
   - Clarity and usefulness of recommendation explanations

2. **API Design and Implementation (25%)**
   - RESTful API design and implementation
   - Error handling and edge cases
   - Code organization and structure

3. **Frontend Implementation (25%)**
   - Component architecture and organization
   - User experience and interface design
   - State management and data flow

4. **Code Quality (20%)**
   - Code readability and documentation
   - Proper use of version control (commit messages, organization)
   - Error handling and edge cases

### Submission Guidelines

1. **GitHub Repository**
   - Create a **public** GitHub repository with your implementation
   - Ensure your repository includes:
     - Complete source code for both frontend and backend
     - A comprehensive README with setup instructions
     - Documentation of your approach, especially for prompt engineering

2. **Deployment (Optional)**
   - If possible, deploy your application (e.g., Vercel, Netlify, Heroku)
   - Include the deployed URL in your README

3. **Submission Timeline**
   - Complete the assignment within 7 days of receiving it
   - Submit by **replying to the original assessment email** with:
     - GitHub repository link
     - Brief overview of your approach (1-2 paragraphs)
     - Any challenges you faced and how you overcame them
     - Time spent on the assignment

### Setup Instructions

#### Backend Setup
1. Navigate to the `backend` directory
2. Create a virtual environment: `python -m venv venv`
3. Activate the virtual environment:
   - Windows: `venv\Scripts\activate`
   - macOS/Linux: `source venv/bin/activate`
4. Install dependencies: `pip install -r requirements.txt`
5. Create a `.env` file based on `.env.example` and add your LLM API key
6. Run the application: `python app.py`

#### Frontend Setup
1. Navigate to the `frontend` directory
2. Install dependencies: `npm install`
3. Start the development server: `npm start`
4. The application should open at `http://localhost:3000`

### Notes and Tips

- **API Keys**: Never commit your API keys to GitHub. Use environment variables.
- **Time Management**: Focus on core functionality first, then enhance if time permits.
- **Documentation**: Document your approach, especially your prompt engineering strategy.
- **Code Quality**: Clean, well-organized code is more important than feature quantity.
- **Questions**: If you have questions, email recruiting@i95dev.com with "Question: AI Intern Take-Home" as the subject.

### Resources

- [OpenAI API Documentation](https://platform.openai.com/docs/api-reference)
- [Flask Documentation](https://flask.palletsprojects.com/)
- [React Documentation](https://reactjs.org/docs/getting-started.html)
- [Prompt Engineering Guide](https://www.promptingguide.ai/)

We're excited to see your implementation and approach! Good luck!