import re
import logging
import json
from datetime import datetime, date

logger = logging.getLogger(__name__)

def validate_email(email):
    """
    Validate email format.
    
    Args:
        email (str): Email address to validate
        
    Returns:
        bool: True if email is valid, False otherwise
    """
    # Simple regex for email validation
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def generate_response(data=None, message=None, status="success", status_code=200):
    """
    Generate a standardized API response.
    
    Args:
        data (dict, optional): Response data
        message (str, optional): Response message
        status (str, optional): Response status (success/error)
        status_code (int, optional): HTTP status code
        
    Returns:
        tuple: (response_dict, status_code)
    """
    response = {
        "status": status,
        "timestamp": datetime.now().isoformat()
    }
    
    if message:
        response["message"] = message
        
    if data:
        response["data"] = data
        
    return response, status_code

class CustomJSONEncoder(json.JSONEncoder):
    """
    Custom JSON encoder to handle datetime and other non-serializable objects.
    """
    def default(self, obj):
        if isinstance(obj, (datetime, date)):
            return obj.isoformat()
        return super().default(obj)

def parse_json_data(json_string):
    """
    Safely parse JSON data.
    
    Args:
        json_string (str): JSON string to parse
        
    Returns:
        dict: Parsed JSON data or empty dict if invalid
    """
    try:
        if not json_string:
            return {}
        return json.loads(json_string)
    except json.JSONDecodeError as e:
        logger.error(f"Error parsing JSON data: {str(e)}")
        return {}

def sanitize_input(text):
    """
    Sanitize user input to prevent injection attacks.
    
    Args:
        text (str): Input text to sanitize
        
    Returns:
        str: Sanitized text
    """
    if not text:
        return ""
        
    # Remove potentially dangerous characters
    sanitized = re.sub(r'[<>\'";]', '', text)
    return sanitized

def extract_concerns_from_feedback(feedback_text):
    """
    Extract skin concerns from user feedback text.
    
    Args:
        feedback_text (str): User feedback text
        
    Returns:
        list: Extracted skin concerns
    """
    concerns = []
    
    # Define keywords for common skin concerns
    concern_keywords = {
        "acne": ["acne", "pimple", "breakout", "blemish", "zit"],
        "wrinkles": ["wrinkle", "fine line", "aging", "anti-aging", "age"],
        "dryness": ["dry", "flaky", "dehydrated", "tight", "parched"],
        "oiliness": ["oily", "greasy", "shiny", "sebum"],
        "sensitivity": ["sensitive", "irritation", "irritated", "reaction", "redness"],
        "dark spots": ["dark spot", "hyperpigmentation", "discoloration", "melasma", "sun spot"],
        "dullness": ["dull", "tired", "glow", "radiance", "bright"],
        "texture": ["texture", "rough", "smooth", "bumpy", "uneven"]
    }
    
    # Check for each concern in the feedback text
    for concern, keywords in concern_keywords.items():
        for keyword in keywords:
            if re.search(r'\b' + re.escape(keyword) + r'\b', feedback_text.lower()):
                concerns.append(concern)
                break  # Found one keyword for this concern, no need to check others
    
    return concerns

def calculate_product_relevance(product, user_concerns):
    """
    Calculate relevance score of a product for given user concerns.
    
    Args:
        product (Product): Product object
        user_concerns (list): List of user skin concerns
        
    Returns:
        float: Relevance score (0-100)
    """
    if not user_concerns:
        return 50  # Neutral score if no concerns specified
    
    # Base score starts at 50
    score = 50
    
    # Check if product addresses user concerns
    product_concerns = product.concerns
    if not product_concerns:
        return score
    
    # Count matching concerns
    matching_concerns = set(user_concerns).intersection(set(product_concerns))
    match_count = len(matching_concerns)
    
    # Adjust score based on matches
    if match_count > 0:
        # More matches = higher score
        score += min(match_count * 10, 40)  # Cap at +40 points
    
    # Consider product rating
    if product.rating:
        # Adjust score by up to 10 points based on rating
        score += (product.rating - 2.5) * 5  # Rating from 0-5 maps to -12.5 to +12.5
    
    # Ensure score is within 0-100 range
    score = max(0, min(100, score))
    
    return score

def find_alternative_ingredients(ingredient):
    """
    Find alternative ingredients for a given ingredient.
    
    Args:
        ingredient (str): Ingredient to find alternatives for
        
    Returns:
        list: Alternative ingredients
    """
    # Define alternatives for common ingredients
    alternatives = {
        "retinol": ["bakuchiol", "peptides", "vitamin C"],
        "benzoyl peroxide": ["salicylic acid", "tea tree oil", "azelaic acid"],
        "hydroquinone": ["vitamin C", "alpha arbutin", "kojic acid", "niacinamide"],
        "fragrance": ["fragrance-free alternatives"],
        "alcohol": ["glycerin", "hyaluronic acid", "aloe vera"],
        "salicylic acid": ["lactic acid", "mandelic acid", "tea tree oil"],
        "glycolic acid": ["lactic acid", "mandelic acid", "polyhydroxy acids"],
        "vitamin c": ["niacinamide", "alpha arbutin", "azelaic acid"],
        "hyaluronic acid": ["glycerin", "sodium PCA", "aloe vera"],
        "niacinamide": ["vitamin C", "zinc", "azelaic acid"],
        "parabens": ["phenoxyethanol", "sodium benzoate", "potassium sorbate"]
    }
    
    # Normalize ingredient name
    ingredient_lower = ingredient.lower()
    
    # Return alternatives if found, otherwise empty list
    for key, value in alternatives.items():
        if key in ingredient_lower or ingredient_lower in key:
            return value
    
    return []
