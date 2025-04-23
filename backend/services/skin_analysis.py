import numpy as np
import logging
from ml.skin_classifier import classify_skin_type
from ml.concern_detector import detect_concerns

logger = logging.getLogger(__name__)

def analyze_quiz_results(quiz_data):
    """
    Analyze skin quiz responses to determine skin type, concerns, and properties.
    
    Args:
        quiz_data (dict): User responses to the skin quiz
        
    Returns:
        dict: Analysis results including skin type, concerns, and properties
    """
    try:
        logger.info("Analyzing quiz results")
        
        # Extract key data from quiz
        skin_type_response = quiz_data.get('skinType', '')
        oiliness = quiz_data.get('oiliness', '')
        sensitivity = quiz_data.get('sensitivity', '')
        concerns = quiz_data.get('concerns', [])
        acne_frequency = quiz_data.get('acneFrequency', '')
        skin_tone = quiz_data.get('skinTone', '')
        aging_concerns = quiz_data.get('aging', [])
        environment = quiz_data.get('environment', '')
        allergies = quiz_data.get('allergies', [])
        
        # Determine skin type
        if skin_type_response:
            skin_type = skin_type_response
        else:
            # Determine skin type from other responses if not directly provided
            if oiliness == 'very_oily':
                skin_type = 'oily'
            elif oiliness == 'very_dry':
                skin_type = 'dry'
            elif oiliness == 'slightly_oily':
                skin_type = 'combination'
            else:
                skin_type = 'normal'
                
            # Override with sensitive if indicated
            if sensitivity == 'very_sensitive' or sensitivity == 'somewhat_sensitive':
                skin_type = 'sensitive'
        
        # Determine skin concerns
        skin_concerns = []
        
        # Add concerns from direct selection
        if concerns:
            for concern in concerns:
                severity = 'high'
                if concern == 'acne':
                    # Adjust acne severity based on frequency
                    if acne_frequency == 'occasionally':
                        severity = 'low'
                    elif acne_frequency == 'monthly':
                        severity = 'medium'
                    # else keep as high
                
                skin_concerns.append({
                    'name': concern.replace('_', ' ').title(),
                    'severity': severity
                })
        
        # Add aging concerns
        if aging_concerns and 'none' not in aging_concerns:
            for concern in aging_concerns:
                if concern not in [c['name'].lower().replace(' ', '_') for c in skin_concerns]:
                    skin_concerns.append({
                        'name': concern.replace('_', ' ').title(),
                        'severity': 'medium'
                    })
        
        # Calculate skin properties
        # These are approximate values based on quiz responses
        
        # Hydration (inverse of dryness)
        hydration = 70  # Default
        if oiliness == 'very_dry':
            hydration = 30
        elif oiliness == 'normal':
            hydration = 70
        elif oiliness == 'slightly_oily':
            hydration = 60
        elif oiliness == 'very_oily':
            hydration = 50  # Oily skin can still be dehydrated
            
        # Oil production
        oil_production = 50  # Default
        if oiliness == 'very_dry':
            oil_production = 20
        elif oiliness == 'normal':
            oil_production = 50
        elif oiliness == 'slightly_oily':
            oil_production = 70
        elif oiliness == 'very_oily':
            oil_production = 90
            
        # UV sensitivity based on skin tone
        uv_sensitivity = 50  # Default
        if skin_tone == 'very_fair':
            uv_sensitivity = 90
        elif skin_tone == 'fair':
            uv_sensitivity = 80
        elif skin_tone == 'medium':
            uv_sensitivity = 60
        elif skin_tone == 'olive':
            uv_sensitivity = 50
        elif skin_tone == 'tan':
            uv_sensitivity = 40
        elif skin_tone == 'deep':
            uv_sensitivity = 30
            
        # Sensitivity
        sensitivity_level = 50  # Default
        if sensitivity == 'very_sensitive':
            sensitivity_level = 90
        elif sensitivity == 'somewhat_sensitive':
            sensitivity_level = 70
        elif sensitivity == 'not_sensitive':
            sensitivity_level = 30
        elif sensitivity == 'never_sensitive':
            sensitivity_level = 10
            
        # Calculate overall skin health score
        # This is a simplified calculation
        skin_health_metrics = {
            'texture': np.random.randint(40, 90),  # Randomized for demo
            'pores': np.random.randint(40, 90),
            'redness': np.random.randint(40, 90),
            'pigmentation': np.random.randint(40, 90),
            'wrinkles': np.random.randint(40, 90),
            'hydration': hydration
        }
        
        # Overall score is average of metrics
        skin_score = int(np.mean(list(skin_health_metrics.values())))
        
        # Estimate skin age (for demo purposes)
        # In a real app, this would be based on more sophisticated analysis
        skin_age = None  # Not provided from quiz data
        
        # Generate recommended ingredients based on concerns
        recommended_ingredients = get_recommended_ingredients(skin_type, skin_concerns)
        
        # Compile results
        results = {
            'skinType': skin_type,
            'skinConcerns': skin_concerns,
            'skinProperties': {
                'hydration': hydration,
                'oilProduction': oil_production,
                'uvSensitivity': uv_sensitivity,
                'sensitivity': sensitivity_level
            },
            'skinHealthMetrics': skin_health_metrics,
            'skinScore': skin_score,
            'skinAge': skin_age,
            'recommendations': {
                'ingredients': recommended_ingredients
            },
            'analysisMethod': 'quiz'
        }
        
        logger.info("Quiz analysis complete")
        return results
        
    except Exception as e:
        logger.error(f"Error analyzing quiz results: {str(e)}")
        raise

def analyze_skin_image(image):
    """
    Analyze skin image to determine skin type, concerns, and properties.
    
    Args:
        image: Preprocessed image data
        
    Returns:
        dict: Analysis results including skin type, concerns, and properties
    """
    try:
        logger.info("Analyzing skin image")
        
        # Use ML models to classify skin type and detect concerns
        skin_type = classify_skin_type(image)
        detected_concerns = detect_concerns(image)
        
        # Convert detected concerns to the required format
        skin_concerns = []
        for concern, severity_score in detected_concerns.items():
            severity = 'low'
            if severity_score > 0.7:
                severity = 'high'
            elif severity_score > 0.4:
                severity = 'medium'
                
            skin_concerns.append({
                'name': concern.replace('_', ' ').title(),
                'severity': severity
            })
        
        # Calculate skin properties based on image analysis
        # These would normally come from the ML model
        hydration = np.random.randint(40, 90)
        oil_production = np.random.randint(40, 90)
        uv_sensitivity = np.random.randint(40, 90)
        sensitivity_level = np.random.randint(40, 90)
        
        # Calculate skin health metrics
        skin_health_metrics = {
            'texture': np.random.randint(40, 90),
            'pores': np.random.randint(40, 90),
            'redness': np.random.randint(40, 90),
            'pigmentation': np.random.randint(40, 90),
            'wrinkles': np.random.randint(40, 90),
            'hydration': hydration
        }
        
        # Overall score is average of metrics
        skin_score = int(np.mean(list(skin_health_metrics.values())))
        
        # Estimate skin age
        # In a real app, this would be based on more sophisticated analysis
        skin_age = np.random.randint(20, 45)  # Random for demo purposes
        
        # Generate recommended ingredients based on concerns
        recommended_ingredients = get_recommended_ingredients(skin_type, skin_concerns)
        
        # Compile results
        results = {
            'skinType': skin_type,
            'skinConcerns': skin_concerns,
            'skinProperties': {
                'hydration': hydration,
                'oilProduction': oil_production,
                'uvSensitivity': uv_sensitivity,
                'sensitivity': sensitivity_level
            },
            'skinHealthMetrics': skin_health_metrics,
            'skinScore': skin_score,
            'skinAge': skin_age,
            'recommendations': {
                'ingredients': recommended_ingredients
            },
            'analysisMethod': 'image'
        }
        
        logger.info("Image analysis complete")
        return results
        
    except Exception as e:
        logger.error(f"Error analyzing skin image: {str(e)}")
        raise

def get_recommended_ingredients(skin_type, skin_concerns):
    """
    Generate recommended ingredients based on skin type and concerns.
    
    Args:
        skin_type (str): User's skin type
        skin_concerns (list): List of user's skin concerns
        
    Returns:
        list: Recommended ingredients with benefits
    """
    # Define ingredient recommendations by skin type
    skin_type_ingredients = {
        'dry': [
            {'name': 'Hyaluronic Acid', 'benefit': 'Hydration and moisture retention'},
            {'name': 'Glycerin', 'benefit': 'Hydration and moisture barrier support'},
            {'name': 'Ceramides', 'benefit': 'Strengthens moisture barrier'},
            {'name': 'Squalane', 'benefit': 'Lightweight, non-greasy hydration'},
            {'name': 'Shea Butter', 'benefit': 'Rich moisturization for dry skin'}
        ],
        'oily': [
            {'name': 'Niacinamide', 'benefit': 'Regulates sebum production'},
            {'name': 'Salicylic Acid', 'benefit': 'Unclogs pores and reduces oil'},
            {'name': 'Tea Tree Oil', 'benefit': 'Natural antibacterial properties'},
            {'name': 'Kaolin Clay', 'benefit': 'Absorbs excess oil'},
            {'name': 'Zinc PCA', 'benefit': 'Controls shine and oil production'}
        ],
        'combination': [
            {'name': 'Niacinamide', 'benefit': 'Balances oil production in T-zone'},
            {'name': 'Hyaluronic Acid', 'benefit': 'Hydrates dry areas without oiliness'},
            {'name': 'Green Tea Extract', 'benefit': 'Soothes and balances skin'},
            {'name': 'Glycolic Acid', 'benefit': 'Gentle exfoliation for both areas'},
            {'name': 'Squalane', 'benefit': 'Lightweight hydration for all skin types'}
        ],
        'normal': [
            {'name': 'Peptides', 'benefit': 'Maintains skin health and elasticity'},
            {'name': 'Antioxidants', 'benefit': 'Protects against environmental damage'},
            {'name': 'Vitamin E', 'benefit': 'Nourishes and protects skin'},
            {'name': 'Glycerin', 'benefit': 'Maintains optimal hydration'},
            {'name': 'Aloe Vera', 'benefit': 'Soothes and hydrates skin'}
        ],
        'sensitive': [
            {'name': 'Centella Asiatica', 'benefit': 'Calms and soothes sensitive skin'},
            {'name': 'Allantoin', 'benefit': 'Reduces irritation and redness'},
            {'name': 'Oat Extract', 'benefit': 'Gentle anti-inflammatory properties'},
            {'name': 'Aloe Vera', 'benefit': 'Soothes and reduces sensitivity'},
            {'name': 'Bisabolol', 'benefit': 'Calms irritation and redness'}
        ]
    }
    
    # Define ingredient recommendations by skin concern
    concern_ingredients = {
        'Acne': [
            {'name': 'Salicylic Acid', 'benefit': 'Unclogs pores and reduces breakouts'},
            {'name': 'Benzoyl Peroxide', 'benefit': 'Kills acne-causing bacteria'},
            {'name': 'Tea Tree Oil', 'benefit': 'Natural antibacterial properties'},
            {'name': 'Niacinamide', 'benefit': 'Reduces inflammation and redness'},
            {'name': 'Zinc', 'benefit': 'Reduces sebum and helps heal blemishes'}
        ],
        'Wrinkles': [
            {'name': 'Retinol', 'benefit': 'Reduces fine lines and wrinkles'},
            {'name': 'Peptides', 'benefit': 'Boosts collagen production'},
            {'name': 'Vitamin C', 'benefit': 'Brightens and firms skin'},
            {'name': 'Coenzyme Q10', 'benefit': 'Protects against premature aging'},
            {'name': 'Hyaluronic Acid', 'benefit': 'Plumps skin and reduces wrinkle appearance'}
        ],
        'Dullness': [
            {'name': 'Vitamin C', 'benefit': 'Brightens and evens skin tone'},
            {'name': 'AHAs (Glycolic Acid)', 'benefit': 'Exfoliates and reveals brighter skin'},
            {'name': 'Niacinamide', 'benefit': 'Improves radiance and texture'},
            {'name': 'Arbutin', 'benefit': 'Brightens and reduces dark spots'},
            {'name': 'Licorice Root Extract', 'benefit': 'Natural brightening properties'}
        ],
        'Dark Spots': [
            {'name': 'Vitamin C', 'benefit': 'Fades hyperpigmentation'},
            {'name': 'Tranexamic Acid', 'benefit': 'Reduces dark spots and discoloration'},
            {'name': 'Kojic Acid', 'benefit': 'Inhibits melanin production'},
            {'name': 'Arbutin', 'benefit': 'Brightens and evens skin tone'},
            {'name': 'Niacinamide', 'benefit': 'Reduces appearance of dark spots'}
        ],
        'Redness': [
            {'name': 'Centella Asiatica', 'benefit': 'Reduces redness and inflammation'},
            {'name': 'Green Tea Extract', 'benefit': 'Calms and soothes irritated skin'},
            {'name': 'Azelaic Acid', 'benefit': 'Reduces redness and inflammation'},
            {'name': 'Licorice Root Extract', 'benefit': 'Anti-inflammatory properties'},
            {'name': 'Aloe Vera', 'benefit': 'Soothes and calms redness'}
        ],
        'Dryness': [
            {'name': 'Hyaluronic Acid', 'benefit': 'Intense hydration'},
            {'name': 'Ceramides', 'benefit': 'Restores moisture barrier'},
            {'name': 'Glycerin', 'benefit': 'Attracts and retains moisture'},
            {'name': 'Squalane', 'benefit': 'Lightweight, non-greasy hydration'},
            {'name': 'Fatty Acids', 'benefit': 'Nourishes and prevents moisture loss'}
        ],
        'Oiliness': [
            {'name': 'Niacinamide', 'benefit': 'Regulates sebum production'},
            {'name': 'Salicylic Acid', 'benefit': 'Controls oil and unclogs pores'},
            {'name': 'Kaolin Clay', 'benefit': 'Absorbs excess oil'},
            {'name': 'Witch Hazel', 'benefit': 'Natural astringent properties'},
            {'name': 'Zinc PCA', 'benefit': 'Reduces sebum production'}
        ],
        'Large Pores': [
            {'name': 'Niacinamide', 'benefit': 'Reduces pore appearance'},
            {'name': 'Retinol', 'benefit': 'Tightens pores over time'},
            {'name': 'BHAs (Salicylic Acid)', 'benefit': 'Cleans deep within pores'},
            {'name': 'Clay', 'benefit': 'Draws out impurities from pores'},
            {'name': 'Vitamin C', 'benefit': 'Tightens and refines pore appearance'}
        ],
        'Dark Circles': [
            {'name': 'Vitamin K', 'benefit': 'Reduces dark circles'},
            {'name': 'Caffeine', 'benefit': 'Reduces puffiness and dark circles'},
            {'name': 'Peptides', 'benefit': 'Strengthens delicate under-eye skin'},
            {'name': 'Vitamin C', 'benefit': 'Brightens under-eye area'},
            {'name': 'Hyaluronic Acid', 'benefit': 'Hydrates and plumps under-eye area'}
        ]
    }
    
    # Start with ingredients for skin type
    recommended = skin_type_ingredients.get(skin_type.lower(), [])[:3]  # Get top 3
    
    # Add ingredients for top concerns
    for concern in skin_concerns[:3]:  # Consider top 3 concerns
        concern_name = concern['name']
        if concern_name in concern_ingredients:
            # Add top 2 ingredients for each concern
            for ingredient in concern_ingredients[concern_name][:2]:
                # Check if ingredient is already in the list
                if not any(r['name'] == ingredient['name'] for r in recommended):
                    recommended.append(ingredient)
    
    # Limit to 8 total ingredients
    return recommended[:8]
