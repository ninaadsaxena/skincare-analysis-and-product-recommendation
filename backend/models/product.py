from utils.database import db
import json

class Product(db.Model):
    __tablename__ = 'products'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    brand = db.Column(db.String(100), nullable=True)
    product_type = db.Column(db.String(50), nullable=True)
    _suitable_skin_types = db.Column(db.Text, nullable=True)  # JSON string
    _ingredients = db.Column(db.Text, nullable=True)  # JSON string
    price = db.Column(db.Float, nullable=True)
    description = db.Column(db.Text, nullable=True)
    image_url = db.Column(db.String(255), nullable=True)
    size = db.Column(db.String(50), nullable=True)
    _benefits = db.Column(db.Text, nullable=True)  # JSON string
    how_to_use = db.Column(db.Text, nullable=True)
    _key_ingredients = db.Column(db.Text, nullable=True)  # JSON string
    _concerns = db.Column(db.Text, nullable=True)  # JSON string
    rating = db.Column(db.Float, default=0.0)
    review_count = db.Column(db.Integer, default=0)
    
    # Relationships
    feedbacks = db.relationship('UserFeedback', backref='product', lazy=True)
    
    @property
    def suitable_skin_types(self):
        if self._suitable_skin_types:
            return json.loads(self._suitable_skin_types)
        return []
    
    @suitable_skin_types.setter
    def suitable_skin_types(self, value):
        self._suitable_skin_types = json.dumps(value)
    
    @property
    def ingredients(self):
        if self._ingredients:
            return self._ingredients
        return ""
    
    @ingredients.setter
    def ingredients(self, value):
        self._ingredients = value
    
    @property
    def benefits(self):
        if self._benefits:
            return json.loads(self._benefits)
        return []
    
    @benefits.setter
    def benefits(self, value):
        self._benefits = json.dumps(value)
    
    @property
    def key_ingredients(self):
        if self._key_ingredients:
            return json.loads(self._key_ingredients)
        return []
    
    @key_ingredients.setter
    def key_ingredients(self, value):
        self._key_ingredients = json.dumps(value)
    
    @property
    def concerns(self):
        if self._concerns:
            return json.loads(self._concerns)
        return []
    
    @concerns.setter
    def concerns(self, value):
        self._concerns = json.dumps(value)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'brand': self.brand,
            'productType': self.product_type,
            'suitableFor': self.suitable_skin_types,
            'ingredients': self.ingredients,
            'price': self.price,
            'description': self.description,
            'imageUrl': self.image_url,
            'size': self.size,
            'benefits': self.benefits,
            'howToUse': self.how_to_use,
            'keyIngredients': self.key_ingredients,
            'concerns': self.concerns,
            'rating': self.rating,
            'reviewCount': self.review_count
        }
    
    def __repr__(self):
        return f'<Product {self.name}>'
