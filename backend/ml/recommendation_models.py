import numpy as np
import logging
from models.user import UserFeedback
from models.product import Product
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

logger = logging.getLogger(__name__)

def content_based_filtering(products, skin_type=None, skin_concerns=None):
    """
    Generate product recommendations using content-based filtering.
    
    Args:
        products (list): List of Product objects
        skin_type (str, optional): User's skin type
        skin_concerns (list, optional): User's skin concerns
        
    Returns:
        list: Recommended Product objects
    """
    try:
        logger.info("Generating content-based recommendations")
        
        if not products:
            logger.warning("No products provided for content-based filtering")
            return []
        
        # Create feature vectors for products
        product_features = []
        for product in products:
            # Combine relevant product attributes into a single string
            features = []
            
            # Add product type
            if product.product_type:
                features.append(product.product_type.lower())
            
            # Add suitable skin types
            if product.suitable_skin_types:
                features.extend(product.suitable_skin_types)
            
            # Add concerns addressed
            if product.concerns:
                features.extend(product.concerns)
            
            # Add key ingredients
            if product.key_ingredients:
                features.extend(product.key_ingredients)
            
            # Join all features into a single string
            feature_string = " ".join(features).lower()
            product_features.append(feature_string)
        
        # Create user profile based on skin type and concerns
        user_profile = []
        if skin_type:
            user_profile.append(skin_type.lower())
        if skin_concerns:
            if isinstance(skin_concerns, list):
                user_profile.extend([concern.lower() for concern in skin_concerns])
            else:
                user_profile.append(skin_concerns.lower())
        
        user_profile_string = " ".join(user_profile)
        
        # If user profile is empty, return products sorted by rating
        if not user_profile_string:
            logger.info("No user profile available, sorting by rating")
            return sorted(products, key=lambda p: p.rating, reverse=True)
        
        # Add user profile to product features for vectorization
        all_features = product_features + [user_profile_string]
        
        # Create TF-IDF vectors
        vectorizer = TfidfVectorizer(stop_words='english')
        tfidf_matrix = vectorizer.fit_transform(all_features)
        
        # Calculate similarity between user profile and each product
        user_vector = tfidf_matrix[-1]  # Last vector is the user profile
        product_vectors = tfidf_matrix[:-1]  # All but the last are products
        
        # Calculate cosine similarity
        similarities = cosine_similarity(user_vector, product_vectors).flatten()
        
        # Create list of (product, similarity) tuples
        product_similarities = list(zip(products, similarities))
        
        # Sort by similarity score (descending)
        product_similarities.sort(key=lambda x: x[1], reverse=True)
        
        # Extract sorted products
        sorted_products = [p for p, _ in product_similarities]
        
        logger.info(f"Generated {len(sorted_products)} content-based recommendations")
        return sorted_products
        
    except Exception as e:
        logger.error(f"Error in content-based filtering: {str(e)}")
        # Fall back to sorting by rating
        return sorted(products, key=lambda p: p.rating, reverse=True)

def collaborative_filtering(user_id, products):
    """
    Generate product recommendations using collaborative filtering.
    
    Args:
        user_id (int): User ID
        products (list): List of Product objects
        
    Returns:
        list: Recommended Product objects
    """
    try:
        logger.info(f"Generating collaborative recommendations for user {user_id}")
        
        # Get user's feedback
        user_feedbacks = UserFeedback.query.filter_by(user_id=user_id).all()
        
        # If user has no feedback, return empty list
        if not user_feedbacks:
            logger.info("No user feedback available for collaborative filtering")
            return []
        
        # Get products user has already rated
        rated_product_ids = [feedback.product_id for feedback in user_feedbacks]
        
        # Find similar users based on product ratings
        similar_users = find_similar_users(user_id, rated_product_ids)
        
        # Get recommendations from similar users
        recommended_products = get_recommendations_from_similar_users(
            similar_users, rated_product_ids, products
        )
        
        logger.info(f"Generated {len(recommended_products)} collaborative recommendations")
        return recommended_products
        
    except Exception as e:
        logger.error(f"Error in collaborative filtering: {str(e)}")
        return []

def find_similar_users(user_id, rated_product_ids):
    """
    Find users with similar product preferences.
    
    Args:
        user_id (int): User ID
        rated_product_ids (list): Products rated by the user
        
    Returns:
        list: Similar user IDs with similarity scores
    """
    try:
        # Get all users who have rated at least one of the same products
        similar_users = []
        
        for product_id in rated_product_ids:
            # Find users who rated this product
            feedbacks = UserFeedback.query.filter_by(product_id=product_id).all()
            
            # Exclude the current user
            other_users = [f.user_id for f in feedbacks if f.user_id != user_id]
            
            # Add to similar users
            similar_users.extend(other_users)
        
        # Count occurrences of each user (more common products = more similar)
        from collections import Counter
        user_counts = Counter(similar_users)
        
        # Convert to list of (user_id, similarity) tuples
        similar_users_with_scores = [(user, count / len(rated_product_ids)) 
                                    for user, count in user_counts.items()]
        
        # Sort by similarity score (descending)
        similar_users_with_scores.sort(key=lambda x: x[1], reverse=True)
        
        # Limit to top 10 similar users
        return similar_users_with_scores[:10]
        
    except Exception as e:
        logger.error(f"Error finding similar users: {str(e)}")
        return []

def get_recommendations_from_similar_users(similar_users, rated_product_ids, available_products):
    """
    Get product recommendations from similar users.
    
    Args:
        similar_users (list): Similar user IDs with similarity scores
        rated_product_ids (list): Products already rated by the user
        available_products (list): Available Product objects
        
    Returns:
        list: Recommended Product objects
    """
    try:
        # Get product ratings from similar users
        product_scores = {}
        
        for user_id, similarity in similar_users:
            # Get user's feedback
            feedbacks = UserFeedback.query.filter_by(user_id=user_id).all()
            
            for feedback in feedbacks:
                # Skip products user has already rated
                if feedback.product_id in rated_product_ids:
                    continue
                
                # Calculate weighted score
                weighted_score = feedback.rating * similarity
                
                # Add to product scores
                if feedback.product_id in product_scores:
                    product_scores[feedback.product_id]['total_score'] += weighted_score
                    product_scores[feedback.product_id]['count'] += 1
                else:
                    product_scores[feedback.product_id] = {
                        'total_score': weighted_score,
                        'count': 1
                    }
        
        # Calculate average scores
        for product_id in product_scores:
            product_scores[product_id]['avg_score'] = (
                product_scores[product_id]['total_score'] / product_scores[product_id]['count']
            )
        
        # Sort product IDs by average score
        sorted_product_ids = sorted(
            product_scores.keys(),
            key=lambda pid: product_scores[pid]['avg_score'],
            reverse=True
        )
        
        # Filter available products to include only recommended ones
        recommended_products = [
            p for p in available_products if p.id in sorted_product_ids
        ]
        
        # Sort recommended products by their scores
        recommended_products.sort(
            key=lambda p: product_scores[p.id]['avg_score'] if p.id in product_scores else 0,
            reverse=True
        )
        
        return recommended_products
        
    except Exception as e:
        logger.error(f"Error getting recommendations from similar users: {str(e)}")
        return []

def hybrid_recommendations(user_id, products, skin_type=None, skin_concerns
