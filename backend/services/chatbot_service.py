import logging
import re
import random
from models.product import Product
from models.user import UserProfile, UserRoutine
from utils.database import db

logger = logging.getLogger(__name__)

# Define common skincare questions and their responses
FAQ = {
    "what is retinol": "Retinol is a form of vitamin A that promotes skin cell turnover and helps with anti-aging, acne, and skin texture. Start with a low concentration and use it at night, followed by moisturizer. Always use sunscreen during the day when using retinol products.",
    
    "how to layer skincare": "The general rule for layering skincare is to apply products from thinnest to thickest consistency. A typical order would be: 1) Cleanser 2) Toner 3) Serums 4) Eye cream 5) Treatments (like retinol) 6) Moisturizer 7) Face oil (at night) or Sunscreen (during day).",
    
    "how often should i exfoliate": "For chemical exfoliation, BHAs (like salicylic acid) can be used 2-3 times per week for oily/acne-prone skin, while AHAs (like glycolic acid) can be used 1-2 times weekly for normal/dry skin. Physical exfoliants should be limited to once a week. Always listen to your skin and reduce frequency if irritation occurs.",
    
    "what spf should i use": "Dermatologists recommend using a broad-spectrum sunscreen with at least SPF 30 daily, even on cloudy days or when indoors. For extended outdoor activities, use SPF 50+ and reapply every two hours or after swimming/sweating.",
    
    "how to treat acne": "For treating acne, look for products with ingredients like salicylic acid (unclogs pores), benzoyl peroxide (kills bacteria), niacinamide (reduces inflammation), or retinoids (prevents clogged pores). Maintain a consistent cleansing routine, avoid picking at blemishes, and consider consulting a dermatologist for persistent acne.",
    
    "what is double cleansing": "Double cleansing involves using an oil-based cleanser first to remove makeup, sunscreen, and oil-based impurities, followed by a water-based cleanser to clean the skin itself. This method ensures thorough cleansing without stripping the skin and is especially beneficial for those who wear makeup or sunscreen regularly.",
    
    "how to reduce dark circles": "Dark circles can be addressed with ingredients like vitamin C, vitamin K, caffeine, and peptides. Use a dedicated eye cream, ensure adequate sleep, stay hydrated, and protect the area with sunscreen. For persistent dark circles, consider treatments like fillers or laser therapy from a dermatologist.",
    
    "what is skin purging": "Skin purging is a temporary reaction to active ingredients (like retinoids, AHAs, BHAs) that accelerate cell turnover, bringing underlying breakouts to the surface faster. Unlike a bad reaction, purging occurs in areas you typically break out and resolves within 4-6 weeks. If breakouts appear in new areas or last longer, it might be a negative reaction to the product.",
    
    "how to treat hyperpigmentation": "To treat hyperpigmentation, use ingredients like vitamin C, niacinamide, alpha arbutin, kojic acid, or tranexamic acid. Exfoliate regularly with AHAs, always use sunscreen (as UV exposure worsens dark spots), and be patient—hyperpigmentation takes time to fade. For stubborn cases, consider professional treatments like chemical peels or laser therapy.",
    
    "what order to apply skincare": "The correct order for skincare application is: 1) Cleanser 2) Toner 3) Treatment serums (vitamin C in morning, retinol/acids at night) 4) Eye cream 5) Moisturizer 6) Face oil (optional, usually at night) 7) Sunscreen (morning only). Apply products from thinnest to thickest consistency, waiting 1-2 minutes between steps for better absorption."
}

def process_user_query(query, user_id=None):
    """
    Process user queries and generate appropriate responses.
    
    Args:
        query (str): User's question or message
        user_id (int, optional): User ID if authenticated
        
    Returns:
        str: Response to the user's query
    """
    try:
        logger.info(f"Processing chatbot query: {query}")
        
        # Clean and normalize the query
        clean_query = query.lower().strip()
        
        # Check if it's a FAQ
        for question, answer in FAQ.items():
            if question_match(clean_query, question):
                return answer
        
        # Check for specific query types
        if re.search(r'\b(recommend|suggestion|what should i use for)\b', clean_query):
            return handle_recommendation_query(clean_query, user_id)
            
        elif re.search(r'\b(routine|regimen|steps|order)\b', clean_query):
            return handle_routine_query(clean_query, user_id)
            
        elif re.search(r'\b(ingredient|what is|purpose of|benefits of)\b', clean_query):
            return handle_ingredient_query(clean_query)
            
        elif re.search(r'\b(how often|frequency|daily|weekly)\b', clean_query):
            return handle_frequency_query(clean_query)
            
        elif re.search(r'\b(can i use|mix|combine|together)\b', clean_query):
            return handle_compatibility_query(clean_query)
        
        # Default responses if no specific pattern is matched
        general_responses = [
            "I'm not sure I understand your question. Could you rephrase it or ask about a specific skincare concern?",
            "For more personalized advice, try completing a skin analysis or browsing our product recommendations.",
            "That's a great question! For the most accurate advice, I'd recommend consulting with a dermatologist.",
            "I don't have enough information to answer that specifically. Could you provide more details about your skin type and concerns?"
        ]
        
        return random.choice(general_responses)
        
    except Exception as e:
        logger.error(f"Error processing chatbot query: {str(e)}")
        return "I'm having trouble processing your question right now. Please try again later."

def question_match(user_query, faq_question):
    """
    Check if user query matches an FAQ question using fuzzy matching.
    
    Args:
        user_query (str): User's question
        faq_question (str): FAQ question to match against
        
    Returns:
        bool: True if there's a match, False otherwise
    """
    # Convert both to sets of words for comparison
    user_words = set(user_query.lower().split())
    faq_words = set(faq_question.lower().split())
    
    # Check for keyword overlap
    common_words = user_words.intersection(faq_words)
    
    # If the query contains key terms from the FAQ question, consider it a match
    key_terms = [word for word in faq_words if len(word) > 3]  # Only consider significant words
    matches = [word for word in key_terms if word in user_query]
    
    return len(matches) >= len(key_terms) * 0.6  # 60% match threshold

def handle_recommendation_query(query, user_id):
    """
    Handle queries asking for product recommendations.
    
    Args:
        query (str): User's question
        user_id (int, optional): User ID if authenticated
        
    Returns:
        str: Product recommendation response
    """
    # Extract skin concerns from the query
    concerns = []
    if re.search(r'\b(acne|pimple|breakout|blemish)\b', query):
        concerns.append('acne')
    if re.search(r'\b(wrinkle|aging|fine line|anti-aging)\b', query):
        concerns.append('aging')
    if re.search(r'\b(dry|dehydrat|flak)\b', query):
        concerns.append('dryness')
    if re.search(r'\b(oily|shine|greasy)\b', query):
        concerns.append('oiliness')
    if re.search(r'\b(sensitive|irritat|redness|react)\b', query):
        concerns.append('sensitivity')
    if re.search(r'\b(dark spot|hyperpigment|discolor|melasma)\b', query):
        concerns.append('dark spots')
    if re.search(r'\b(dull|uneven|tone|brightening|glow)\b', query):
        concerns.append('dullness')
    
    # Extract product type from the query
    product_type = None
    if re.search(r'\b(cleanser|face wash|cleaning)\b', query):
        product_type = 'cleanser'
    elif re.search(r'\b(moisturizer|cream|lotion|hydrat)\b', query):
        product_type = 'moisturizer'
    elif re.search(r'\b(serum|treatment)\b', query):
        product_type = 'serum'
    elif re.search(r'\b(sunscreen|spf|sun protection)\b', query):
        product_type = 'sunscreen'
    elif re.search(r'\b(toner|essence)\b', query):
        product_type = 'toner'
    elif re.search(r'\b(mask|masque)\b', query):
        product_type = 'mask'
    elif re.search(r'\b(exfoliat|scrub|peel)\b', query):
        product_type = 'exfoliator'
    
    # Get user's skin type if available
    skin_type = None
    if user_id:
        profile = UserProfile.query.filter_by(user_id=user_id).first()
        if profile:
            skin_type = profile.skin_type
    
    # If no skin type from profile, try to extract from query
    if not skin_type:
        if re.search(r'\b(dry skin|dry)\b', query):
            skin_type = 'dry'
        elif re.search(r'\b(oily skin|oily)\b', query):
            skin_type = 'oily'
        elif re.search(r'\b(combination|combo)\b', query):
            skin_type = 'combination'
        elif re.search(r'\b(sensitive skin|sensitive)\b', query):
            skin_type = 'sensitive'
        elif re.search(r'\b(normal skin|normal)\b', query):
            skin_type = 'normal'
    
    # Query the database for matching products
    query = Product.query
    
    if product_type:
        query = query.filter(Product.product_type.ilike(f'%{product_type}%'))
    
    if skin_type:
        # This assumes suitable_skin_types is stored as JSON
        query = query.filter(Product._suitable_skin_types.ilike(f'%{skin_type}%'))
    
    if concerns:
        # Filter for products that address any of the concerns
        for concern in concerns:
            query = query.filter(Product._concerns.ilike(f'%{concern}%'))
    
    # Get top rated products
    products = query.order_by(Product.rating.desc()).limit(3).all()
    
    if not products:
        return "I couldn't find specific product recommendations based on your query. Try completing a skin analysis for personalized recommendations."
    
    # Format response
    response = "Based on your query, here are some recommended products:\n\n"
    for i, product in enumerate(products, 1):
        response += f"{i}. {product.name} by {product.brand}\n"
        response += f"   • Type: {product.product_type}\n"
        response += f"   • Rating: {product.rating}/5 ({product.review_count} reviews)\n"
        if product.key_ingredients and len(product.key_ingredients) > 0:
            response += f"   • Key ingredients: {', '.join(product.key_ingredients[:3])}\n"
        response += "\n"
    
    response += "For more personalized recommendations, try our skin analysis tool!"
    
    return response

def handle_routine_query(query, user_id):
    """
    Handle queries about skincare routines.
    
    Args:
        query (str): User's question
        user_id (int, optional): User ID if authenticated
        
    Returns:
        str: Routine advice response
    """
    # Check if it's about morning or evening routine
    is_morning = re.search(r'\b(morning|am|day|daytime)\b', query) is not None
    is_evening = re.search(r'\b(evening|night|pm|bedtime)\b', query) is not None
    
    # If user is authenticated, check if they have a saved routine
    if user_id:
        routine = UserRoutine.query.filter_by(user_id=user_id).first()
        if routine:
            if is_morning and routine.morning_routine:
                return format_user_routine(routine.morning_routine, "morning")
            elif is_evening and routine.evening_routine:
                return format_user_routine(routine.evening_routine, "evening")
    
    # If no specific routine or user is not authenticated, provide general advice
    if is_morning:
        return """A basic morning skincare routine should follow these steps:

1. Cleanser: Start with a gentle cleanser to remove overnight buildup
2. Toner (optional): Balance your skin's pH
3. Vitamin C Serum: Protect against environmental damage
4. Eye Cream: Hydrate the delicate eye area
5. Moisturizer: Hydrate and protect your skin
6. Sunscreen: Always finish with SPF 30+ (the most important step!)

Keep your morning routine focused on protection and prevention. Adjust based on your skin's needs and remember that consistency is key!"""

    elif is_evening:
        return """A basic evening skincare routine should follow these steps:

1. Makeup Remover/Oil Cleanser: If you wear makeup or sunscreen
2. Water-based Cleanser: To clean the skin itself
3. Exfoliant: 2-3 times per week (AHA/BHA)
4. Toner (optional): Prep skin for treatments
5. Treatments/Serums: Target specific concerns (retinol, peptides, etc.)
6. Eye Cream: Address eye-area concerns
7. Moisturizer: Lock in hydration
8. Face Oil (optional): For extra nourishment

Your evening routine should focus on repair and renewal. This is the best time to use active ingredients like retinol or exfoliating acids."""

    else:
        return """A complete skincare routine typically includes:

MORNING:
1. Gentle cleanser
2. Toner (optional)
3. Antioxidant serum (e.g., Vitamin C)
4. Eye cream
5. Moisturizer
6. Sunscreen (SPF 30+)

EVENING:
1. Makeup remover/oil cleanser (if needed)
2. Water-based cleanser
3. Exfoliant (2-3 times weekly)
4. Toner (optional)
5. Treatment serums (retinol, peptides, etc.)
6. Eye cream
7. Moisturizer
8. Face oil (optional)

Adjust based on your skin's needs and remember that consistency is more important than complexity. Start with the basics (cleanser, moisturizer, sunscreen) and add products gradually."""

def format_user_routine(routine_data, time_of_day):
    """Format a user's saved routine into a readable response"""
    response = f"Here's your current {time_of_day} routine:\n\n"
    
    # Define the order of steps
    if time_of_day == "morning":
        steps_order = ['cleanser', 'toner', 'serum', 'eye_cream', 'moisturizer', 'sunscreen']
    else:
        steps_order = ['makeup_remover', 'cleanser', 'exfoliator', 'toner', 'treatment', 
                      'serum', 'eye_cream', 'moisturizer', 'face_oil', 'night_cream']
    
    # Format each step in the routine
    for step in steps_order:
        if step in routine_data:
            product = routine_data[step]
            step_name = step.replace('_', ' ').capitalize()
            response += f"{step_name}: {product['name']} by {product['brand']}\n"
    
    response += "\nYou can modify your routine in the Routine Planner section!"
    return response

def handle_ingredient_query(query):
    """
    Handle queries about skincare ingredients.
    
    Args:
        query (str): User's question
        
    Returns:
        str: Information about the ingredient
    """
    # Extract the ingredient from the query
    ingredient_match = re.search(r'what is ([\w\s]+)', query)
    if not ingredient_match:
        ingredient_match = re.search(r'([\w\s]+) ingredient', query)
    if not ingredient_match:
        ingredient_match = re.search(r'benefits of ([\w\s]+)', query)
    
    if not ingredient_match:
        return "I'm not sure which ingredient you're asking about. Could you specify the ingredient name?"
    
    ingredient = ingredient_match.group(1).strip().lower()
    
    # Dictionary of common skincare ingredients
    ingredients_info = {
        "hyaluronic acid": "Hyaluronic acid is a powerful humectant that can hold up to 1000 times its weight in water. It hydrates the skin by drawing moisture from the environment and deeper skin layers, resulting in plumper, more hydrated skin with reduced appearance of fine lines. It works for all skin types, even oily and acne-prone skin.",
        
        "retinol": "Retinol is a vitamin A derivative that promotes cell turnover and stimulates collagen production. It helps with anti-aging (reducing fine lines and wrinkles), acne, texture, and hyperpigmentation. Start with a low concentration (0.25-0.5%) 1-2 times weekly, gradually increasing frequency. Always use sunscreen during the day as retinol can increase sun sensitivity.",
        
        "vitamin c": "Vitamin C is a potent antioxidant that brightens skin, fades hyperpigmentation, and protects against environmental damage. It also stimulates collagen production for firmer skin. Look for stable forms like L-ascorbic acid (15-20%), sodium ascorbyl phosphate, or ethylated ascorbic acid. Best used in the morning under sunscreen for enhanced UV protection.",
        
        "niacinamide": "Niacinamide (Vitamin B3) is a versatile ingredient that regulates oil production, strengthens the skin barrier, reduces redness, minimizes pores, and fades hyperpigmentation. It's well-tolerated by most skin types (even sensitive) and can be used at 2-10% concentration. Unlike many actives, it can be safely combined with most other ingredients, including retinol and vitamin C.",
        
        "salicylic acid": "Salicylic acid is a beta-hydroxy acid (BHA) that penetrates oil-filled pores to exfoliate from within. It's excellent for treating and preventing acne, blackheads, and clogged pores. It has anti-inflammatory properties and works best at 0.5-2% concentration. Use 2-3 times weekly, or daily for oilier skin types. May cause dryness initially.",
        
        "glycolic acid": "Glycolic acid is an alpha-hydroxy acid (AHA) with the smallest molecule size, allowing for deeper penetration. It exfoliates by dissolving the bonds between dead skin cells, improving texture, brightness, and reducing fine lines and hyperpigmentation. Concentrations range from 5-30% (higher percentages for professional peels). Start with lower concentrations 1-2 times weekly.",
        
        "peptides": "Peptides are short chains of amino acids that act as building blocks of proteins like collagen and elastin. In skincare, they signal your skin to produce more collagen, resulting in firmer, more youthful skin with reduced fine lines. They're gentle enough for all skin types and work well in combination with other anti-aging ingredients like antioxidants and retinol.",
        
        "ceramides": "Ceramides are lipids (fats) that make up about 50% of the skin barrier. They help retain moisture, protect against environmental damage, and keep irritants out. Skincare with ceramides strengthens the skin barrier, reduces sensitivity, and improves hydration. They're beneficial for all skin types but especially for dry, sensitive, or eczema-prone skin.",
        
        "azelaic acid": "Azelaic acid is a multifunctional ingredient that fights acne, reduces redness, and fades hyperpigmentation. It has antibacterial and anti-inflammatory properties, making it excellent for rosacea and acne. It's gentler than many other acids and safe during pregnancy. Typically used at 10-20% concentration and can be combined with most other skincare ingredients.",
        
        "squalane": "Squalane is a lightweight, non-comedogenic oil that mimics your skin's natural sebum. It hydrates without greasiness, strengthens the skin barrier, and has antioxidant properties. Despite being an oil, it works well for all skin types, including oily and acne-prone skin. It's stable, doesn't oxidize, and helps other ingredients penetrate better."
    }
    
    # Check for the ingredient in our dictionary
    for key, info in ingredients_info.items():
        if ingredient in key or key in ingredient:
            return info
    
    # If not found in our dictionary, provide a generic response
    return f"I don't have specific information about {ingredient}. For detailed information about this ingredient, I recommend checking specialized skincare resources or consulting with a dermatologist."

def handle_frequency_query(query):
    """
    Handle queries about how often to use skincare products.
    
    Args:
        query (str): User's question
        
    Returns:
        str: Advice on usage frequency
    """
    # Extract the product or ingredient type from the query
    if re.search(r'\b(retinol|vitamin a|tretinoin)\b', query):
        return "For retinol or retinoids: Start with 1-2 times per week, applying a pea-sized amount to dry skin at night. Gradually increase frequency as your skin builds tolerance. Beginners should use lower concentrations (0.25-0.5%) and work up to stronger formulations. Always use sunscreen during the day when using retinol products."
        
    elif re.search(r'\b(exfoliat|scrub|peel|aha|bha|glycolic|salicylic)\b', query):
        return "Exfoliation frequency depends on your skin type and the product strength. For chemical exfoliants (AHAs/BHAs): Oily/acne-prone skin can typically handle 2-3 times per week, while dry/sensitive skin should limit to 1-2 times weekly. Physical scrubs should be used no more than 1-2 times per week. Always watch for signs of over-exfoliation like redness, irritation, or increased sensitivity."
        
    elif re.search(r'\b(vitamin c|ascorbic)\b', query):
        return "Vitamin C serums can be used daily, typically in the morning under sunscreen to provide antioxidant protection throughout the day. If you have sensitive skin, you might start with every other day application and increase as tolerated. L-ascorbic acid formulations are most effective at concentrations of 10-20%."
        
    elif re.search(r'\b(face mask|sheet mask|clay mask|masque)\b', query):
        return "Face mask frequency depends on the type: Hydrating masks can be used 2-3 times per week. Clay or purifying masks are best limited to once weekly for most skin types, or twice weekly for very oily skin. Sheet masks can be used 1-3 times weekly. Always follow package instructions and reduce frequency if you notice any irritation."
        
    elif re.search(r'\b(cleanser|cleanse|wash)\b', query):
        return "Most people should cleanse their face twice daily - morning and evening. However, if you have very dry or sensitive skin, you might opt for water only in the morning and cleanser at night. Those with extremely oily skin might benefit from a gentle cleanse midday as well. Always use lukewarm (not hot) water and gentle motions."
        
    elif re.search(r'\b(moisturizer|moisturize|cream|lotion)\b', query):
        return "Moisturizer should typically be applied twice daily, after cleansing and before sunscreen (in the morning) or as the final step (at night). Those with very oily skin might prefer a lightweight moisturizer or gel only at night. Those with dry skin might benefit from reapplying during the day or using a richer formula at night."
        
    elif re.search(r'\b(sunscreen|spf|sun protection)\b', query):
        return "Sunscreen should be applied every morning as the final step of your skincare routine, regardless of weather or season. Use approximately ¼ teaspoon for the face. Reapply every 2 hours when outdoors, or after swimming or sweating. For daily indoor activities with minimal sun exposure, one morning application is typically sufficient."
        
    else:
        return "The frequency of product application depends on the specific product type, your skin type, and the active ingredients. As a general rule:\n\n- Cleansers: 1-2 times daily\n- Toners: 1-2 times daily\n- Serums: 1-2 times daily\n- Moisturizers: 1-2 times daily\n- Sunscreen: Every morning, reapply every 2 hours when outdoors\n- Exfoliants: 1-3 times weekly\n- Masks: 1-2 times weekly\n\nAlways start new products gradually and follow package instructions. If you're asking about a specific product, please provide more details."

def handle_compatibility_query(query):
    """
    Handle queries about combining skincare ingredients.
    
    Args:
        query (str): User's question
        
    Returns:
        str: Advice on ingredient compatibility
    """
    # Extract the ingredients being asked about
    ingredients = []
    
    for ingredient in ["retinol", "vitamin c", "niacinamide", "aha", "bha", "hyaluronic acid", 
                      "peptides", "vitamin e", "benzoyl peroxide", "hydroquinone", "acids"]:
        if re.search(rf'\b{ingredient}\b', query.lower()):
            ingredients.append(ingredient)
    
    # If we couldn't identify specific ingredients
    if len(ingredients) < 2:
        return "When combining skincare products, the general rule is to apply them from thinnest to thickest consistency. Some ingredients work well together, while others may reduce each other's effectiveness or cause irritation. Common incompatibilities include:\n\n- Retinol + AHAs/BHAs (can cause irritation)\n- Vitamin C + Retinol (may reduce effectiveness)\n- Benzoyl Peroxide + Retinol (can deactivate each other)\n- Multiple strong acids together (can damage skin barrier)\n\nIf you're asking about specific ingredients, please mention them by name."
    
    # Define compatibility information
    compatibility = {
        ("retinol", "vitamin c"): "Retinol and Vitamin C are both powerful actives that can cause irritation when used together. They also work best at different pH levels, potentially making each less effective. For best results, use Vitamin C in the morning and retinol at night. If you want to use both in the same routine, wait 30 minutes between applications or consider a formulation specifically designed to contain both.",
        
        ("retinol", "aha"): "Retinol and AHAs (like glycolic acid) can both cause irritation and over-exfoliation when used together. This combination may compromise your skin barrier. It's best to use them on alternate nights or at different times of day (AHA in morning, retinol at night). If your skin is well-adjusted to both, you might gradually try using them together, but watch carefully for irritation.",
        
        ("retinol", "bha"): "Retinol and BHAs (like salicylic acid) can both cause irritation when used together. For most people, it's best to alternate them (different nights or different routines). If you have resilient skin and want to use both, apply the BHA first, wait 30 minutes, then apply retinol. Always monitor for signs of irritation like redness, peeling, or increased sensitivity.",
        
        ("retinol", "niacinamide"): "Retinol and niacinamide work well together! Niacinamide can actually help reduce the irritation potential of retinol while boosting its effectiveness. Niacinamide strengthens the skin barrier, which can be helpful when using potentially irritating ingredients like retinol. Apply niacinamide first, then retinol, or use a product that combines both ingredients.",
        
        ("retinol", "hyaluronic acid"): "Retinol and hyaluronic acid are a great combination. Hyaluronic acid provides hydration that can help counteract the potentially drying effects of retinol. Apply hyaluronic acid to damp skin first, then follow with retinol once the hyaluronic acid has absorbed. This combination is particularly good for those new to retinol or with drier skin types.",
        
        ("retinol", "peptides"): "Retinol and peptides can work well together in your skincare routine. Both ingredients support anti-aging goals through different mechanisms. However, some peptides may be less effective at the low pH that retinol requires. For best results, apply peptides first, wait 10-15 minutes, then apply retinol, or use them at different times of day.",
        
        ("vitamin c", "niacinamide"): "Contrary to older beliefs, vitamin C and niacinamide can be used together effectively. While high concentrations in DIY mixtures might cause issues, modern formulations have stabilizers that prevent adverse reactions. They actually complement each other well - vitamin C provides antioxidant protection while niacinamide strengthens the skin barrier. You can layer them (apply vitamin C first) or use them at different times of day.",
        
        ("vitamin c", "aha"): "Vitamin C and AHAs can be used together, but this combination may increase sensitivity for some people. Both work well in acidic environments, so they don't deactivate each other. If combining, apply the AHA first, wait 15-30 minutes, then apply vitamin C. For sensitive skin, consider using AHAs at night and vitamin C in the morning instead of together.",
        
        ("vitamin c", "bha"): "Vitamin C and BHAs (like salicylic acid) can be used together, but may increase sensitivity for some skin types. Both are acidic, so they don't deactivate each other. If using together, apply the BHA first, wait 15-30 minutes, then apply vitamin C. Those with sensitive skin might prefer using BHA at night and vitamin C in the morning to avoid potential irritation.",
        
        ("aha", "bha"): "AHAs and BHAs can be used together for enhanced exfoliation, especially beneficial for those with oily, acne-prone skin with hyperpigmentation or texture concerns. However, this combination can be irritating, so start by alternating them on different days. If your skin tolerates this well, you can try using them together (apply BHA first, then AHA) or look for products formulated with both.",
        
        ("niacinamide", "aha"): "Niacinamide and AHAs work well together. Niacinamide can help reduce the potential irritation from AHAs while enhancing results. For best application, use the AHA first (which works best at a lower pH), wait 15-30 minutes to allow the pH to normalize, then apply niacinamide. Alternatively, you can use AHA at night and niacinamide in the morning.",
        
        ("niacinamide", "bha"): "Niacinamide and BHAs like salicylic acid complement each other well, especially for oily or acne-prone skin. BHAs clear pores while niacinamide regulates sebum production and reduces inflammation. Apply the BHA first, wait 15-30 minutes for the pH to normalize, then apply niacinamide. This combination is generally well-tolerated but introduce gradually if you have sensitive skin.",
        
        ("benzoyl peroxide", "retinol"): "Benzoyl peroxide can deactivate retinol, making both ingredients less effective when used together. For best results, use them at different times of day (one in morning, one at night) or on alternate days. If you must use both in the same routine, apply retinol first, wait for it to fully absorb, then apply benzoyl peroxide, but be aware efficacy may be reduced.",
        
        ("benzoyl peroxide", "vitamin c"): "Benzoyl peroxide and vitamin C (especially L-ascorbic acid) should generally not be used together as benzoyl peroxide can oxidize vitamin C, making it less effective. Use vitamin C in the morning and benzoyl peroxide at night, or use them on alternate days. If both are crucial for your concerns, look for more stable vitamin C derivatives to use with benzoyl peroxide."
    }
    
    # Check for matches in our compatibility dictionary
    for i in range(len(ingredients)):
        for j in range(i+1, len(ingredients)):
            ing1, ing2 = ingredients[i], ingredients[j]
            if (ing1, ing2) in compatibility:
                return compatibility[(ing1, ing2)]
            elif (ing2, ing1) in compatibility:
                return compatibility[(ing2, ing1)]
    
    # If we have ingredients but no specific compatibility info
    return f"Generally, {' and '.join(ingredients)} can be used together in a skincare routine, but introduce them gradually and watch for any signs of irritation. Apply products from thinnest to thickest consistency, and consider using more active ingredients at different times of day (morning vs. evening) to minimize potential irritation. If you experience any redness, burning, or increased sensitivity, reduce frequency or stop using one of the products."
