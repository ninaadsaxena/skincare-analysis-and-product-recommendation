from utils.database import db
from datetime import datetime
import json

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    name = db.Column(db.String(100), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    profile = db.relationship('UserProfile', backref='user', uselist=False, lazy=True)
    feedbacks = db.relationship('UserFeedback', backref='user', lazy=True)
    routine = db.relationship('UserRoutine', backref='user', uselist=False, lazy=True)
    progress_images = db.relationship('ProgressImage', backref='user', lazy=True)
    
    def __repr__(self):
        return f'<User {self.email}>'

class UserProfile(db.Model):
    __tablename__ = 'user_profiles'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    skin_type = db.Column(db.String(50), nullable=True)
    _concerns = db.Column(db.Text, nullable=True)  # JSON string
    _allergies = db.Column(db.Text, nullable=True)  # JSON string
    _lifestyle_factors = db.Column(db.Text, nullable=True)  # JSON string
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    @property
    def concerns(self):
        if self._concerns:
            return json.loads(self._concerns)
        return []
    
    @concerns.setter
    def concerns(self, value):
        self._concerns = json.dumps(value)
    
    @property
    def allergies(self):
        if self._allergies:
            return json.loads(self._allergies)
        return []
    
    @allergies.setter
    def allergies(self, value):
        self._allergies = json.dumps(value)
    
    @property
    def lifestyle_factors(self):
        if self._lifestyle_factors:
            return json.loads(self._lifestyle_factors)
        return {}
    
    @lifestyle_factors.setter
    def lifestyle_factors(self, value):
        self._lifestyle_factors = json.dumps(value)
    
    def __repr__(self):
        return f'<UserProfile user_id={self.user_id}>'

class UserFeedback(db.Model):
    __tablename__ = 'user_feedbacks'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    rating = db.Column(db.Integer, nullable=False)  # 1-5 stars
    feedback_text = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationship to product is defined in the Product model
    
    def __repr__(self):
        return f'<UserFeedback user_id={self.user_id} product_id={self.product_id} rating={self.rating}>'

class UserRoutine(db.Model):
    __tablename__ = 'user_routines'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    _morning_routine = db.Column(db.Text, nullable=True)  # JSON string
    _evening_routine = db.Column(db.Text, nullable=True)  # JSON string
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    @property
    def morning_routine(self):
        if self._morning_routine:
            return json.loads(self._morning_routine)
        return {}
    
    @morning_routine.setter
    def morning_routine(self, value):
        self._morning_routine = json.dumps(value)
    
    @property
    def evening_routine(self):
        if self._evening_routine:
            return json.loads(self._evening_routine)
        return {}
    
    @evening_routine.setter
    def evening_routine(self, value):
        self._evening_routine = json.dumps(value)
    
    def __repr__(self):
        return f'<UserRoutine user_id={self.user_id}>'

class ProgressImage(db.Model):
    __tablename__ = 'progress_images'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    date = db.Column(db.DateTime, default=datetime.utcnow)
    image_url = db.Column(db.String(255), nullable=False)
    notes = db.Column(db.Text, nullable=True)
    _concerns = db.Column(db.Text, nullable=True)  # JSON string
    mood = db.Column(db.String(50), nullable=True)  # happy, neutral, sad
    skin_score = db.Column(db.Integer, nullable=True)  # 0-100
    _skin_analysis = db.Column(db.Text, nullable=True)  # JSON string
    
    @property
    def concerns(self):
        if self._concerns:
            return json.loads(self._concerns)
        return []
    
    @concerns.setter
    def concerns(self, value):
        self._concerns = json.dumps(value)
    
    @property
    def skin_analysis(self):
        if self._skin_analysis:
            return json.loads(self._skin_analysis)
        return {}
    
    @skin_analysis.setter
    def skin_analysis(self, value):
        self._skin_analysis = json.dumps(value)
    
    def __repr__(self):
        return f'<ProgressImage user_id={self.user_id} date={self.date}>'
