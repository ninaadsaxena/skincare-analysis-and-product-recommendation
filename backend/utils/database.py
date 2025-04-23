from flask_sqlalchemy import SQLAlchemy
import logging
import json
import os
from datetime import datetime

# Initialize SQLAlchemy
db = SQLAlchemy()

logger = logging.getLogger(__name__)

def init_db():
    """
    Initialize database and create tables if they don't exist.
    Also seed the database with initial data if needed.
    """
    try:
        logger.info("Initializing database")
        
        # Create all tables
        db.create_all()
        
        # Check if we need to seed the database
        if should_seed_database():
            seed_database()
            
        logger.info("Database initialization complete")
        
    except Exception as e:
        logger.error(f"Error initializing database: {str(e)}")
        raise

def should_seed_database():
    """
    Check if the database should be seeded with initial data.
    
    Returns:
        bool: True if database should be seeded, False otherwise
    """
    # Check if products table is empty
    from models.product import Product
    product_count = Product.query.count()
    
    return product_count == 0

def seed_database():
    """
    Seed the database with initial data.
    """
    try:
        logger.info("Seeding database with initial data")
        
        # Seed products
        seed_products()
        
        logger.info("Database seeding complete")
        
    except Exception as e:
        logger.error(f"Error seeding database: {str(e)}")
        db.session.rollback()
        raise

def seed_products():
    """
    Seed the database with sample skincare products.
    """
    from models.product import Product
    
    # Sample products data
    products_data = [
        {
            "name": "Gentle Foaming Cleanser",
            "brand": "CeraVe",
            "product_type": "cleanser",
            "suitable_skin_types": ["normal", "oily", "combination"],
            "ingredients": "Aqua/Water, Glycerin, Cocamidopropyl Hydroxysultaine, Sodium Lauroyl Sarcosinate, PEG-150 Pentaerythrityl Tetrastearate, Niacinamide, Sodium Methyl Cocoyl Taurate, PEG-6 Caprylic/Capric Glycerides, Sodium Chloride, Ceramide NP, Ceramide AP, Ceramide EOP, Carbomer, Methylparaben, Sodium Hydroxide, Sodium Hyaluronate, Cholesterol, Phenoxyethanol, Propylparaben, Citric Acid, Tetrasodium EDTA, Dihydrocholesterol, Xanthan Gum",
            "price": 14.99,
            "description": "A gentle foaming cleanser that effectively removes excess oil, dirt, and makeup without disrupting the skin's natural protective barrier. Formulated with three essential ceramides and hyaluronic acid.",
            "image_url": "https://example.com/images/cerave-foaming-cleanser.jpg",
            "size": "16 fl oz / 473 ml",
            "benefits": [
                "Removes excess oil without stripping the skin",
                "Maintains protective skin barrier",
                "Non-comedogenic and non-drying"
            ],
            "how_to_use": "Apply to wet skin and massage gently, avoiding the eye area. Rinse thoroughly with water.",
            "key_ingredients": [
                "Ceramides",
                "Hyaluronic Acid",
                "Niacinamide"
            ],
            "concerns": [
                "acne",
                "oiliness",
                "large pores"
            ],
            "rating": 4.5,
            "review_count": 3245
        },
        {
            "name": "Vitamin C Serum",
            "brand": "The Ordinary",
            "product_type": "serum",
            "suitable_skin_types": ["all", "normal", "dry", "combination", "oily"],
            "ingredients": "Ascorbic Acid, Propanediol, Glycerin, Palmitic Acid, Tocopherol, Sodium Hyaluronate, Phenoxyethanol, Triethanolamine",
            "price": 5.80,
            "description": "A water-free, stable solution of 23% pure L-Ascorbic Acid that targets signs of aging, brightens skin tone, and reduces the appearance of dark spots.",
            "image_url": "https://example.com/images/ordinary-vitamin-c.jpg",
            "size": "30 ml",
            "benefits": [
                "Brightens skin tone",
                "Reduces signs of aging",
                "Targets hyperpigmentation"
            ],
            "how_to_use": "Apply a small amount to face in the morning after cleansing and before moisturizing. Avoid contact with eyes.",
            "key_ingredients": [
                "L-Ascorbic Acid (Vitamin C)",
                "Tocopherol (Vitamin E)",
                "Sodium Hyaluronate"
            ],
            "concerns": [
                "dullness",
                "dark spots",
                "wrinkles"
            ],
            "rating": 4.2,
            "review_count": 2187
        },
        {
            "name": "Moisturizing Cream",
            "brand": "La Roche-Posay",
            "product_type": "moisturizer",
            "suitable_skin_types": ["dry", "sensitive", "normal"],
            "ingredients": "Aqua/Water, Glycerin, Butyrospermum Parkii Butter/Shea Butter, Cetearyl Alcohol, Niacinamide, Ceteareth-20, Dimethicone, Ceramide NP, Ceramide AP, Ceramide EOP, Phytosphingosine, Cholesterol, Sodium Hyaluronate, Disodium EDTA, Capryloyl Glycine, Xanthan Gum, Acrylates/C10-30 Alkyl Acrylate Crosspolymer, Sodium Hydroxide",
            "price": 18.99,
            "description": "A rich, hydrating moisturizer that provides immediate and long-lasting hydration for dry to very dry skin. Formulated with ceramides and niacinamide to restore the skin's natural barrier.",
            "image_url": "https://example.com/images/laroche-moisturizer.jpg",
            "size": "400 ml",
            "benefits": [
                "Provides 48-hour hydration",
                "Restores skin barrier",
                "Soothes dry, sensitive skin"
            ],
            "how_to_use": "Apply to face and body daily, or as needed, especially after bathing. Can be used morning and night.",
            "key_ingredients": [
                "Ceramides",
                "Niacinamide",
                "Glycerin",
                "Shea Butter"
            ],
            "concerns": [
                "dryness",
                "sensitivity",
                "redness"
            ],
            "rating": 4.7,
            "review_count": 5621
        },
        {
            "name": "Salicylic Acid 2% Solution",
            "brand": "The Ordinary",
            "product_type": "treatment",
            "suitable_skin_types": ["oily", "acne-prone", "combination"],
            "ingredients": "Aqua (Water), Methylpropanediol, Butylene Glycol, Salicylic Acid, Citric Acid, Polysorbate 20, Triethanolamine, Tetrasodium Glutamate Diacetate, Phenoxyethanol, Chlorphenesin",
            "price": 5.90,
            "description": "A solution of 2% salicylic acid that exfoliates inside pores to fight acne and reduce visible blemishes. Helps clear congested skin and reduce inflammation.",
            "image_url": "https://example.com/images/ordinary-salicylic.jpg",
            "size": "30 ml",
            "benefits": [
                "Unclogs pores",
                "Reduces acne and blemishes",
                "Exfoliates skin surface"
            ],
            "how_to_use": "Apply a small amount to affected areas once daily, preferably in the evening. Avoid contact with eyes and lips.",
            "key_ingredients": [
                "Salicylic Acid"
            ],
            "concerns": [
                "acne",
                "blackheads",
                "oiliness",
                "large pores"
            ],
            "rating": 4.3,
            "review_count": 3876
        },
        {
            "name": "Ultra Facial Cream",
            "brand": "Kiehl's",
            "product_type": "moisturizer",
            "suitable_skin_types": ["all", "normal", "dry", "combination"],
            "ingredients": "Aqua/Water, Glycerin, Cyclohexasiloxane, Squalane, Bis-PEG-18 Methyl Ether Dimethyl Silane, Sucrose Stearate, Stearyl Alcohol, PEG-8 Stearate, Urea, Myristyl Myristate, Pentaerythrityl Tetraethylhexanoate, Prunus Armeniaca Kernel Oil/Apricot Kernel Oil, Phenoxyethanol, Persea Gratissima Oil/Avocado Oil, Glyceryl Stearate, Cetyl Alcohol, Oryza Sativa Bran Oil/Rice Bran Oil, Olea Europaea Fruit Oil/Olive Fruit Oil, Chlorphenesin, Stearic Acid, Palmitic Acid, Disodium EDTA, Acrylates/C10-30 Alkyl Acrylate Crosspolymer, Carbomer, Prunus Amygdalus Dulcis Oil/Sweet Almond Oil, Xanthan Gum, Sodium Hydroxide, Tocopherol, Glycine Soja Oil/Soybean Oil, Pseudoalteromonas Ferment Extract, Myristic Acid, Hydroxypalmitoyl Sphinganine, BHT, Salicylic Acid, Citric Acid",
            "price": 32.00,
            "description": "A lightweight yet effective 24-hour daily facial cream that leaves skin feeling balanced and comfortable in any environment. Formulated with Squalane and Glacial Glycoprotein to hydrate and protect.",
            "image_url": "https://example.com/images/kiehls-facial-cream.jpg",
            "size": "50 ml",
            "benefits": [
                "24-hour hydration",
                "Lightweight, non-greasy formula",
                "Strengthens skin barrier"
            ],
            "how_to_use": "Apply to clean facial skin morning and night. Can be used under makeup.",
            "key_ingredients": [
                "Squalane",
                "Glacial Glycoprotein",
                "Glycerin"
            ],
            "concerns": [
                "dryness",
                "dullness"
            ],
            "rating": 4.6,
            "review_count": 4532
        },
        {
            "name": "Mineral Sunscreen SPF 50",
            "brand": "Neutrogena",
            "product_type": "sunscreen",
            "suitable_skin_types": ["all", "sensitive", "acne-prone"],
            "ingredients": "Zinc Oxide (21.6%), Titanium Dioxide (2.4%), Water, Cyclopentasiloxane, Dimethicone, Glycerin, Neopentyl Glycol Diheptanoate, Dimethicone/Vinyl Dimethicone Crosspolymer, Phenyl Trimethicone, Silica, Butyloctyl Salicylate, Polyglyceryl-3 Polydimethylsiloxyethyl Dimethicone, Diethylhexyl Carbonate, Phenoxyethanol, Caprylyl Glycol, Sodium Chloride, Ethylhexylglycerin, Glyceryl Behenate, Dimethicone/PEG-10/15 Crosspolymer, Polyhydroxystearic Acid, Alumina, Triethoxycaprylylsilane, Dipotassium Glycyrrhizate, Tocopheryl Acetate, Disodium EDTA",
            "price": 15.99,
            "description": "A 100% mineral sunscreen that provides broad-spectrum SPF 50 protection against UVA and UVB rays. The lightweight formula is gentle on sensitive skin and leaves a natural finish.",
            "image_url": "https://example.com/images/neutrogena-sunscreen.jpg",
            "size": "88 ml",
            "benefits": [
                "Broad-spectrum UVA/UVB protection",
                "Water-resistant (80 minutes)",
                "Non-comedogenic"
            ],
            "how_to_use": "Apply liberally 15 minutes before sun exposure. Reapply after 80 minutes of swimming or sweating, immediately after towel drying, and at least every 2 hours.",
            "key_ingredients": [
                "Zinc Oxide",
                "Titanium Dioxide",
                "Vitamin E"
            ],
            "concerns": [
                "sun protection",
                "sensitivity"
            ],
            "rating": 4.0,
            "review_count": 2876
        },
        {
            "name": "Retinol 0.5% in Squalane",
            "brand": "The Ordinary",
            "product_type": "serum",
            "suitable_skin_types": ["normal", "combination", "dry"],
            "ingredients": "Squalane, Caprylic/Capric Triglyceride, Retinol, Solanum Lycopersicum (Tomato) Fruit Extract, Simmondsia Chinensis (Jojoba) Seed Oil, BHT",
            "price": 5.80,
            "description": "A moderate-strength retinol formula in a squalane base that targets signs of aging including fine lines, wrinkles, and uneven skin tone. Helps improve skin texture and reduce the appearance of pores.",
            "image_url": "https://example.com/images/ordinary-retinol.jpg",
            "size": "30 ml",
            "benefits": [
                "Reduces fine lines and wrinkles",
                "Improves skin texture",
                "Evens skin tone"
            ],
            "how_to_use": "Apply a small amount to face in the evening as part of your skincare regimen, after water-based serums but before heavier treatments. Not recommended for use with other retinoid treatments. Use sun protection during the day.",
            "key_ingredients": [
                "Retinol 0.5%",
                "Squalane",
                "Tomato Fruit Extract"
            ],
            "concerns": [
                "aging",
                "wrinkles",
                "uneven texture",
                "dark spots"
            ],
            "rating": 4.4,
            "review_count": 3245
        },
        {
            "name": "Hydrating Hyaluronic Acid Serum",
            "brand": "Neutrogena",
            "product_type": "serum",
            "suitable_skin_types": ["all", "dry", "normal", "combination"],
            "ingredients": "Water, Dimethicone, Glycerin, Dimethicone/Vinyl Dimethicone Crosspolymer, Sodium Hyaluronate, Panthenol, Tocopheryl Acetate, Adipic Acid/Neopentyl Glycol Crosspolymer, VP/VA Copolymer, Acrylates/C10-30 Alkyl Acrylate Crosspolymer, Fragrance, Sodium Hydroxide, Disodium EDTA, Ethylhexylglycerin, Phenoxyethanol",
            "price": 19.99,
            "description": "A lightweight, oil-free serum that instantly quenches dry skin and helps improve hydration for smoother, more supple skin. Contains hyaluronic acid, a hydrator found naturally in the skin.",
            "image_url": "https://example.com/images/neutrogena-hyaluronic.jpg",
            "size": "30 ml",
            "benefits": [
                "Boosts skin hydration",
                "Plumps fine lines",
                "Non-comedogenic"
            ],
            "how_to_use": "Apply 2-3 drops to face and neck, morning and evening after cleansing and before moisturizer.",
            "key_ingredients": [
                "Hyaluronic Acid",
                "Vitamin B5",
                "Vitamin E"
            ],
            "concerns": [
                "dryness",
                "fine lines",
                "dullness"
            ],
            "rating": 4.3,
            "review_count": 1876
        },
        {
            "name": "Niacinamide 10% + Zinc 1%",
            "brand": "The Ordinary",
            "product_type": "serum",
            "suitable_skin_types": ["all", "oily", "acne-prone", "combination"],
            "ingredients": "Aqua (Water), Niacinamide, Pentylene Glycol, Zinc PCA, Dimethyl Isosorbide, Tamarindus Indica Seed Gum, Xanthan gum, Isoceteth-20, Ethoxydiglycol, Phenoxyethanol, Chlorphenesin",
            "price": 5.90,
            "description": "A high-strength vitamin and mineral formula that reduces the appearance of blemishes and congestion. The zinc content helps balance visible sebum activity.",
            "image_url": "https://example.com/images/ordinary-niacinamide.jpg",
            "size": "30 ml",
            "benefits": [
                "Reduces blemishes and congestion",
                "Balances sebum production",
                "Minimizes pore appearance"
            ],
            "how_to_use": "Apply a few drops to face morning and evening before heavier creams. Avoid using with products containing Vitamin C.",
            "key_ingredients": [
                "Niacinamide (Vitamin B3)",
                "Zinc PCA"
            ],
            "concerns": [
                "acne",
                "oiliness",
                "large pores",
                "uneven skin tone"
            ],
            "rating": 4.5,
            "review_count": 5432
        },
        {
            "name": "Glycolic Acid 7% Toning Solution",
            "brand": "The Ordinary",
            "product_type": "toner",
            "suitable_skin_types": ["normal", "combination", "oily"],
            "ingredients": "Aqua (Water), Glycolic Acid, Rosa damascena flower water, Centaurea cyanus flower water, Aloe Barbadensis Leaf Water, Propanediol, Glycerin, Triethanolamine, Aminomethyl Propanol, Panax Ginseng Root Extract, Tasmannia Lanceolata Fruit/Leaf Extract, Aspartic Acid, Alanine, Glycine, Serine, Valine, Isoleucine, Proline, Threonine, Histidine, Phenylalanine, Glutamic Acid, Arginine, PCA, Sodium PCA, Sodium Lactate, Fructose, Glucose, Sucrose, Urea, Hexyl Nicotinate, Dextrin, Citric Acid, Polysorbate 20, Gellan Gum, Trisodium Ethylenediamine Disuccinate, Sodium Chloride, Hexylene Glycol, Potassium Sorbate, Sodium Benzoate, 1,2-Hexanediol, Caprylyl Glycol",
            "price": 8.70,
            "description": "An exfoliating toning solution with 7% Glycolic Acid, Amino Acids, Aloe Vera, Ginseng and Tasmanian Pepperberry. Offers mild exfoliation for improved skin radiance and visible clarity.",
            "image_url": "https://example.com/images/ordinary-glycolic.jpg",
            "size": "240 ml",
            "benefits": [
                "Exfoliates for brighter skin",
                "Improves texture and tone",
                "Reduces fine lines with continued use"
            ],
            "how_to_use": "Use once daily in the evening after cleansing. Apply to face and neck using a cotton pad. Avoid the eye area. Do not rinse off. Follow with additional treatments as needed.",
            "key_ingredients": [
                "Glycolic Acid",
                "Aloe Vera",
                "Ginseng",
                "Tasmanian Pepperberry"
            ],
            "concerns": [
                "dullness",
                "uneven texture",
                "fine lines",
                "dark spots"
            ],
            "rating": 4.6,
            "review_count": 3987
        }
    ]
    
    # Add products to database
    for product_data in products_data:
        # Convert lists to JSON strings for storage
        product = Product(
            name=product_data["name"],
            brand=product_data["brand"],
            product_type=product_data["product_type"],
            suitable_skin_types=product_data["suitable_skin_types"],
            ingredients=product_data["ingredients"],
            price=product_data["price"],
            description=product_data["description"],
            image_url=product_data["image_url"],
            size=product_data["size"],
            benefits=product_data["benefits"],
            how_to_use=product_data["how_to_use"],
            key_ingredients=product_data["key_ingredients"],
            concerns=product_data["concerns"],
            rating=product_data["rating"],
            review_count=product_data["review_count"]
        )
        db.session.add(product)
    
    # Commit changes
    db.session.commit()
    logger.info(f"Added {len(products_data)} sample products to database")
