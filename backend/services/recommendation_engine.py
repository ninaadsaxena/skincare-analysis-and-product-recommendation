import logging
from models.product import Product
from models.user import UserProfile
from ml.recommendation_models import content_based_filtering, collaborative_filtering

logger = logging.getLogger(__name__)

def get_personalized_recommendations(user_data, limit=20):
    """
    Generate personalized product recommendations based on user data.
    
    Args:
        user_data (dict): User profile data including skin type, concerns, etc.
        limit (int): Maximum number of products to recommend
        
    Returns:
        dict: Recommended products and ingredients
    """
    try:
        logger.info("Generating personalized recommendations")
        
        # Extract user data
        skin_type = user_data.get('skinType', '')
        skin_concerns = user_data.get('skinConcerns', [])
        allergies = user_data.get('allergies', [])
        product_types = user_data.get('productTypes', [])
        concerns_filter = user_data.get('concerns', [])
        brands_filter = user_data.get('brands', [])
        ingredients_filter = user_data.get('ingredients', [])
        min_price = user_data.get('minPrice', 0)
        max_price = user_data.get('maxPrice', 1000)
        additional_filters = user_data.get('additionalFilters', [])
        
        # Get all products from database
        products = Product.query.all()
        
        # Apply filters
        filtered_products = filter_products(
            products,
            skin_type=skin_type,
            skin_concerns=skin_concerns,
            allergies=allergies,
            product_types=product_types,
            concerns=concerns_filter,
            brands=brands_filter,
            ingredients=ingredients_filter,
            min_price=min_price,
            max_price=max_price,
            additional_filters=additional_filters
        )
        
        # If user is logged in, get user_id for collaborative filtering
        user_id = user_data.get('user_id')
        
        # Generate recommendations using content-based filtering
        recommended_products = content_based_filtering(
            filtered_products,
            skin_type=skin_type,
            skin_concerns=[c['name'] for c in skin_concerns] if isinstance(skin_concerns, list) and skin_concerns and isinstance(skin_concerns[0], dict) else skin_concerns
        )
        
        # If user_id is available, enhance with collaborative filtering
        if user_id:
            collaborative_recs = collaborative_filtering(user_id, filtered_products)
            
            # Merge recommendations (prioritize collaborative results)
            # This is a simple approach - in a real system you'd use a more sophisticated merging strategy
            seen_ids = set()
            merged_recs = []
            
            # First add collaborative recommendations
            for product in collaborative_recs:
                seen_ids.add(product.id)
                merged_recs.append(product)
            
            # Then add content-based recommendations not already included
            for product in recommended_products:
                if product.id not in seen_ids:
                    merged_recs.append(product)
                    seen_ids.add(product.id)
            
            recommended_products = merged_recs
        
        # Limit number of recommendations
        recommended_products = recommended_products[:limit]
        
        # Convert to dictionaries and add match scores
        products_with_scores = []
        for i, product in enumerate(recommended_products):
            product_dict = product.to_dict()
            
            # Calculate match score (decreasing with position)
            match_score = 100 - (i * (100 / (len(recommended_products) or 1)))
            product_dict['matchScore'] = int(match_score)
            
            products_with_scores.append(product_dict)
        
        # Get recommended ingredients based on skin type and concerns
        from services.skin_analysis import get_recommended_ingredients
        concern_names = [c['name'] for c in skin_concerns] if isinstance(skin_concerns, list) and skin_concerns and isinstance(skin_concerns[0], dict) else skin_concerns
        recommended_ingredients = get_recommended_ingredients(skin_type, [{'name': c} for c in concern_names])
        
        return {
            'products': products_with_scores,
            'ingredients': recommended_ingredients
        }
        
    except Exception as e:
        logger.error(f"Error generating recommendations: {str(e)}")
        raise

def filter_products(products, **filters):
    """
    Filter products based on various criteria.
    
    Args:
        products (list): List of Product objects
        **filters: Various filtering criteria
        
    Returns:
        list: Filtered list of Product objects
    """
    filtered_products = products
    
    # Filter by skin type
    skin_type = filters.get('skin_type')
    if skin_type:
        filtered_products = [
            p for p in filtered_products 
            if not p.suitable_skin_types or skin_type.lower() in [s.lower() for s in p.suitable_skin_types]
        ]
    
    # Filter by skin concerns
    skin_concerns = filters.get('skin_concerns', [])
    if skin_concerns:
        # Extract concern names if they're in dict format
        if isinstance(skin_concerns, list) and skin_concerns and isinstance(skin_concerns[0], dict):
            concern_names = [c['name'].lower() for c in skin_concerns]
        else:
            concern_names = [c.lower() for c in skin_concerns]
            
        filtered_products = [
            p for p in filtered_products 
            if not p.concerns or any(c.lower() in concern_names for c in p.concerns)
        ]
    
    # Filter out products with allergens
    allergies = filters.get('allergies', [])
    if allergies:
        filtered_products = [
            p for p in filtered_products 
            if not any(allergen.lower() in p.ingredients.lower() for allergen in allergies if allergen)
        ]
    
    # Filter by product type
    product_types = filters.get('product_types', [])
    if product_types:
        filtered_products = [
            p for p in filtered_products 
            if not product_types or p.product_type.lower() in [pt.lower() for pt in product_types]
        ]
    
    # Filter by specific concerns
    concerns = filters.get('concerns', [])
    if concerns:
        filtered_products = [
            p for p in filtered_products 
            if not concerns or any(c.lower() in [pc.lower() for pc in p.concerns] for c in concerns)
        ]
    
    # Filter by brands
    brands = filters.get('brands', [])
    if brands:
        filtered_products = [
            p for p in filtered_products 
            if not brands or p.brand.lower() in [b.lower() for b in brands]
        ]
    
    # Filter by ingredients
    ingredients = filters.get('ingredients', [])
    if ingredients:
        filtered_products = [
            p for p in filtered_products 
            if not ingredients or all(i.lower() in p.ingredients.lower() for i in ingredients if i)
        ]
    
    # Filter by price range
    min_price = filters.get('min_price', 0)
    max_price = filters.get('max_price', float('inf'))
    filtered_products = [
        p for p in filtered_products 
        if p.price is None or (p.price >= min_price and p.price <= max_price)
    ]
    
    # Apply additional filters
    additional_filters = filters.get('additional_filters', [])
    if additional_filters:
        # This is a simplified implementation - in a real app, you'd have more structured data
        if 'cruelty_free' in additional_filters:
            filtered_products = [p for p in filtered_products if 'cruelty free' in p.description.lower()]
        if 'vegan' in additional_filters:
            filtered_products = [p for p in filtered_products if 'vegan' in p.description.lower()]
        if 'fragrance_free' in additional_filters:
