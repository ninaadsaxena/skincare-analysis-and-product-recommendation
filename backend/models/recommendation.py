from utils.database import db
from datetime import datetime
import json

class Recommendation(db.Model):
    __tablename__ = 'recommendations'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    skin_type = db.Column(db.String(50), nullable=True)
    _skin_concerns = db.Column(db.Text, nullable=True)  # JSON string
    _recommended_products = db.Column(db.Text, nullable=True)  # JSON string
    _recommended_ingredients = db.Column(db.Text, nullable=True)  # JSON string
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    @property
    def skin_concerns(self):
        if self._skin_concerns:
            return json.loads(self._skin_concerns)
        return []
    
    @skin_concerns.setter
    def skin_concerns(self, value):
        self._skin_concerns = json.dumps(value)
    
    @property
    def recommended_products(self):
        if self._recommended_products:
            return json.loads(self._recommended_products)
        return []
    
    @recommended_products.setter
    def recommended_products(self, value):
        self._recommended_products = json.dumps(value)
    
    @property
    def recommended_ingredients(self):
        if self._recommended_ingredients:
            return json.loads(self._recommended_ingredients)
        return []
    
    @recommended_ingredients.setter
    def recommended_ingredients(self, value):
        self._recommended_ingredients = json.dumps(value)
    
    def __repr__(self):
        return f'<Recommendation id={self.id} user_id={self.user_id}>'
