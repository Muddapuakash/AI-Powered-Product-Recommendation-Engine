# services/llm_service.py

import openai
import json
from config import config
import random

class LLMService:
    """
    Service to handle interactions with the LLM API with fallback to local simulation
    """

    def __init__(self, use_openai=True):
        self.use_openai = use_openai
        
        if self.use_openai:
            # OpenAI configuration
            openai.api_key = config.get('OPENAI_API_KEY',"your open api key")
            self.model_name = config.get('MODEL_NAME', 'gpt-3.5-turbo')
            self.max_tokens = config.get('MAX_TOKENS', 500)
            self.temperature = config.get('TEMPERATURE', 0.7)
        else:
            # Local simulation configuration
            self.model_name = "local_simulated_model"
            self.max_tokens = 500
            self.temperature = 0.7

    def generate_recommendations(self, user_preferences, browsing_history, all_products):
        """
        Generate personalized product recommendations using OpenAI or local simulation
        """
        try:
            if self.use_openai:
                return self._generate_openai_recommendations(user_preferences, browsing_history, all_products)
            else:
                return self._generate_local_recommendations(user_preferences, browsing_history, all_products)
        except Exception as e:
            print(f"Error in primary recommendation method: {str(e)}")
            # Fallback to local recommendations if OpenAI fails
            if self.use_openai:
                print("Falling back to local recommendations...")
                return self._generate_local_recommendations(user_preferences, browsing_history, all_products)
            else:
                return {
                    "recommendations": [],
                    "error": str(e)
                }

    def _generate_openai_recommendations(self, user_preferences, browsing_history, all_products):
        """
        Generate recommendations using OpenAI API
        """
        # Get browsed products details
        browsed_products = [p for p in all_products if p['id'] in browsing_history]

        # Create LLM prompt
        prompt = self._create_recommendation_prompt(user_preferences, browsed_products, all_products)

        # Call LLM API
        response = openai.ChatCompletion.create(
            model=self.model_name,
            messages=[
                {"role": "system", "content": "You are a helpful eCommerce product recommendation assistant."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=self.max_tokens,
            temperature=self.temperature
        )

        llm_output = response.choices[0].message.content

        # Parse recommendations
        recommendations = self._parse_recommendation_response(llm_output, all_products)

        # Fallback: if less than 5, fill with random products matching preferences
        if len(recommendations) < 5:
            fallback = self._get_fallback_recommendations(user_preferences, recommendations, all_products)
            recommendations.extend(fallback)

        return {
            "recommendations": recommendations[:5],
            "count": len(recommendations[:5])
        }

    def _generate_local_recommendations(self, user_preferences, browsing_history, all_products):
        """
        Generate recommendations using local simulation (no API required)
        """
        # Get browsed products details
        browsed_products = [p for p in all_products if p['id'] in browsing_history]

        # Filter products based on user preferences
        filtered = self._filter_products_by_preferences(user_preferences, all_products)

        # Remove already browsed products
        filtered = [p for p in filtered if p['id'] not in browsing_history]

        # Fallback if less than 5
        if len(filtered) < 5:
            filtered = [p for p in all_products if p['id'] not in browsing_history]

        # Randomly select up to 5 products
        recommended = random.sample(filtered, min(5, len(filtered)))

        # Build recommendations with explanations
        recommendations = [
            {
                "product": p,
                "explanation": self._generate_local_explanation(p, user_preferences, browsed_products),
                "confidence_score": random.randint(6, 10)
            } for p in recommended
        ]

        return {
            "recommendations": recommendations,
            "count": len(recommendations)
        }

    def _create_recommendation_prompt(self, user_preferences, browsed_products, all_products):
        """
        Create a strong prompt to enforce preferences, JSON output, and diversity
        """
        prompt = "You are an expert eCommerce recommendation assistant.\n"
        prompt += "Given the user's preferences and browsing history, recommend **exactly 5 products** from the catalog.\n"
        prompt += "Strictly follow these rules:\n"
        prompt += "- Only recommend products matching the user's selected categories, brands, and price range.\n"
        prompt += "- Include a brief explanation for each recommendation.\n"
        prompt += "- Return output as a JSON array with keys: product_id, explanation, score (1-10 confidence).\n"
        prompt += "- Ensure diversity in recommendations.\n\n"

        # User preferences
        prompt += "User Preferences:\n"
        for k, v in user_preferences.items():
            prompt += f"- {k}: {v}\n"

        # Browsing history
        if browsed_products:
            prompt += "\nBrowsing History:\n"
            for p in browsed_products:
                prompt += f"- {p['name']} (Category: {p['category']}, Price: ${p['price']}, Brand: {p['brand']})\n"

        # Provide catalog summary
        prompt += "\nCatalog contains the following products (showing only names and categories for brevity):\n"
        for p in all_products[:50]:  # avoid token overload
            prompt += f"- {p['name']} (Category: {p['category']}, Price: ${p['price']}, Brand: {p['brand']})\n"

        prompt += "\nRespond ONLY with the JSON array, no extra text."

        return prompt

    def _parse_recommendation_response(self, llm_response, all_products):
        """
        Parse LLM response and enrich with full product info
        """
        try:
            # Extract JSON array from response
            start_idx = llm_response.find('[')
            end_idx = llm_response.rfind(']') + 1
            if start_idx == -1 or end_idx == 0:
                return []

            rec_list = json.loads(llm_response[start_idx:end_idx])

            enriched_recs = []
            for rec in rec_list:
                product_id = rec.get('product_id')
                product = next((p for p in all_products if p['id'] == product_id), None)
                if product:
                    enriched_recs.append({
                        "product": product,
                        "explanation": rec.get('explanation', ''),
                        "confidence_score": rec.get('score', 5)
                    })

            return enriched_recs
        except Exception as e:
            print(f"Error parsing LLM response: {str(e)}")
            return []

    def _filter_products_by_preferences(self, preferences, all_products):
        """
        Filter products based on user preferences
        """
        filtered = all_products.copy()

        # Apply category filter
        if preferences.get('categories'):
            filtered = [p for p in filtered if p['category'] in preferences['categories']]

        # Apply brand filter
        if preferences.get('brands'):
            filtered = [p for p in filtered if p['brand'] in preferences['brands']]

        # Apply price range filter
        price_range = preferences.get('priceRange', 'all')
        if price_range != 'all':
            min_price, max_price = self._get_price_range_bounds(price_range)
            filtered = [p for p in filtered if min_price <= p['price'] <= max_price]

        return filtered

    def _get_price_range_bounds(self, price_range):
        """
        Get min and max price bounds from price range string
        """
        if price_range == "0-50":
            return 0, 50
        elif price_range == "50-100":
            return 50, 100
        elif price_range == "100+":
            return 100, float('inf')
        else:
            return 0, float('inf')

    def _generate_local_explanation(self, product, user_preferences, browsed_products):
        """
        Generate explanation for local recommendations
        """
        explanations = [
            f"Recommended because you showed interest in {product['category']} products.",
            f"This {product['brand']} {product['name']} matches your preferences.",
            f"Popular choice in the {product['category']} category.",
            f"Great value at ${product['price']} for a {product['brand']} product."
        ]

        # Add context based on browsing history
        if browsed_products:
            similar_categories = [p['category'] for p in browsed_products if p['category'] == product['category']]
            if similar_categories:
                explanations.append(f"Similar to {product['category']} products you've viewed.")

        return random.choice(explanations)

    def _get_fallback_recommendations(self, preferences, existing_recs, all_products):
        """
        If LLM returns <5, fill with random products matching preferences
        """
        existing_ids = [r['product']['id'] for r in existing_recs]

        # Filter catalog by preferences
        filtered = self._filter_products_by_preferences(preferences, all_products)
        filtered = [p for p in filtered if p['id'] not in existing_ids]

        # Randomly select remaining recommendations
        fallback = []
        random.shuffle(filtered)
        for p in filtered[:5 - len(existing_recs)]:
            fallback.append({
                "product": p,
                "explanation": "Additional recommendation based on your preferences.",
                "confidence_score": 5
            })

        return fallback

    def set_mode(self, use_openai=True):
        """
        Switch between OpenAI and local mode
        """
        self.use_openai = use_openai
        if use_openai and not hasattr(openai, 'api_key'):
            print("Warning: OpenAI API key not configured")

    def get_current_mode(self):
        """
        Get current operational mode
        """
        return "OpenAI" if self.use_openai else "Local Simulation"