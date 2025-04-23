from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
import os
from datetime import timedelta
import logging

# Import models
from models.user import User, UserProfile, UserFeedback, UserRoutine, ProgressImage
from models.product import Product
from models.recommendation import Recommendation

# Import services
from services.skin_analysis import analyze_quiz_results, analyze_skin_image
from services.recommendation_engine import get_personalized_recommendations, filter_products
from services.chatbot_service import process_user_query
from services.image_processing import preprocess_image, detect_skin_concerns

# Import utils
from utils.database import db, init_db
from utils.helpers import validate_email, generate_response

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Configure app
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key')
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///skincare.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'jwt-secret-key')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=1)
app.config['UPLOAD_FOLDER'] = os.path.join(os.getcwd(), 'uploads')

# Ensure upload directory exists
if not os.path.exists(app.config['UPLOAD_FOLDER']):
    os.makedirs(app.config['UPLOAD_FOLDER'])

# Initialize extensions
db.init_app(app)
jwt = JWTManager(app)

# Initialize database
with app.app_context():
    init_db()

# Authentication routes
@app.route('/api/auth/register', methods=['POST'])
def register():
    try:
        data = request.json
        
        # Validate required fields
        if not all(k in data for k in ('email', 'password', 'name')):
            return jsonify({'error': 'Missing required fields'}), 400
        
        # Validate email format
        if not validate_email(data['email']):
            return jsonify({'error': 'Invalid email format'}), 400
        
        # Check if user already exists
        existing_user = User.query.filter_by(email=data['email']).first()
        if existing_user:
            return jsonify({'error': 'Email already registered'}), 409
        
        # Create new user
        hashed_password = generate_password_hash(data['password'])
        new_user = User(
            email=data['email'],
            password_hash=hashed_password,
            name=data['name']
        )
        
        db.session.add(new_user)
        db.session.commit()
        
        # Create user profile
        user_profile = UserProfile(user_id=new_user.id)
        db.session.add(user_profile)
        db.session.commit()
        
        # Generate access token
        access_token = create_access_token(identity=new_user.id)
        
        return jsonify({
            'message': 'User registered successfully',
            'token': access_token,
            'user': {
                'id': new_user.id,
                'email': new_user.email,
                'name': new_user.name
            }
        }), 201
        
    except Exception as e:
        logger.error(f"Registration error: {str(e)}")
        db.session.rollback()
        return jsonify({'error': 'Registration failed'}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    try:
        data = request.json
        
        # Validate required fields
        if not all(k in data for k in ('email', 'password')):
            return jsonify({'error': 'Missing email or password'}), 400
        
        # Find user by email
        user = User.query.filter_by(email=data['email']).first()
        
        # Check if user exists and password is correct
        if not user or not check_password_hash(user.password_hash, data['password']):
            return jsonify({'error': 'Invalid email or password'}), 401
        
        # Generate access token
        access_token = create_access_token(identity=user.id)
        
        return jsonify({
            'message': 'Login successful',
            'token': access_token,
            'user': {
                'id': user.id,
                'email': user.email,
                'name': user.name
            }
        }), 200
        
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        return jsonify({'error': 'Login failed'}), 500

@app.route('/api/auth/verify', methods=['GET'])
@jwt_required()
def verify_token():
    try:
        # If JWT is valid, this will execute
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({'valid': False}), 401
            
        return jsonify({'valid': True}), 200
        
    except Exception as e:
        logger.error(f"Token verification error: {str(e)}")
        return jsonify({'valid': False}), 401

@app.route('/api/auth/reset-password-request', methods=['POST'])
def reset_password_request():
    try:
        data = request.json
        
        if 'email' not in data:
            return jsonify({'error': 'Email is required'}), 400
            
        user = User.query.filter_by(email=data['email']).first()
        
        if not user:
            # Don't reveal that the user doesn't exist
            return jsonify({'message': 'If your email is registered, you will receive a password reset link'}), 200
            
        # In a real application, send an email with a reset token
        # For this example, we'll just return a success message
        
        return jsonify({'message': 'If your email is registered, you will receive a password reset link'}), 200
        
    except Exception as e:
        logger.error(f"Password reset request error: {str(e)}")
        return jsonify({'error': 'Password reset request failed'}), 500

@app.route('/api/auth/reset-password', methods=['POST'])
def reset_password():
    try:
        data = request.json
        
        if not all(k in data for k in ('token', 'newPassword')):
            return jsonify({'error': 'Missing required fields'}), 400
            
        # In a real application, verify the reset token
        # For this example, we'll just return a success message
        
        return jsonify({'message': 'Password has been reset successfully'}), 200
        
    except Exception as e:
        logger.error(f"Password reset error: {str(e)}")
        return jsonify({'error': 'Password reset failed'}), 500

@app.route('/api/auth/update-password', methods=['PUT'])
@jwt_required()
def update_password():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
            
        data = request.json
        
        if not all(k in data for k in ('currentPassword', 'newPassword')):
            return jsonify({'error': 'Missing required fields'}), 400
            
        # Verify current password
        if not check_password_hash(user.password_hash, data['currentPassword']):
            return jsonify({'error': 'Current password is incorrect'}), 401
            
        # Update password
        user.password_hash = generate_password_hash(data['newPassword'])
        db.session.commit()
        
        return jsonify({'message': 'Password updated successfully'}), 200
        
    except Exception as e:
        logger.error(f"Password update error: {str(e)}")
        db.session.rollback()
        return jsonify({'error': 'Password update failed'}), 500

# User profile routes
@app.route('/api/user/profile', methods=['GET'])
@jwt_required()
def get_user_profile():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
            
        profile = UserProfile.query.filter_by(user_id=current_user_id).first()
        
        if not profile:
            # Create profile if it doesn't exist
            profile = UserProfile(user_id=current_user_id)
            db.session.add(profile)
            db.session.commit()
            
        return jsonify({
            'user': {
                'id': user.id,
                'email': user.email,
                'name': user.name,
                'created_at': user.created_at.isoformat()
            },
            'allergies': profile.allergies or [],
            'lifestyle': profile.lifestyle_factors or {}
        }), 200
        
    except Exception as e:
        logger.error(f"Get user profile error: {str(e)}")
        return jsonify({'error': 'Failed to retrieve user profile'}), 500

@app.route('/api/user/profile', methods=['PUT'])
@jwt_required()
def update_user_profile():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
            
        data = request.json
        
        # Update user information
        if 'name' in data:
            user.name = data['name']
        if 'email' in data:
            # Check if email is already taken by another user
            existing_user = User.query.filter_by(email=data['email']).first()
            if existing_user and existing_user.id != current_user_id:
                return jsonify({'error': 'Email already in use'}), 409
            user.email = data['email']
            
        db.session.commit()
        
        return jsonify({
            'message': 'Profile updated successfully',
            'name': user.name,
            'email': user.email
        }), 200
        
    except Exception as e:
        logger.error(f"Update user profile error: {str(e)}")
        db.session.rollback()
        return jsonify({'error': 'Failed to update user profile'}), 500

@app.route('/api/user/allergies', methods=['PUT'])
@jwt_required()
def update_allergies():
    try:
        current_user_id = get_jwt_identity()
        profile = UserProfile.query.filter_by(user_id=current_user_id).first()
        
        if not profile:
            return jsonify({'error': 'User profile not found'}), 404
            
        data = request.json
        
        if 'allergies' not in data:
            return jsonify({'error': 'Allergies data is required'}), 400
            
        profile.allergies = data['allergies']
        db.session.commit()
        
        return jsonify({
            'message': 'Allergies updated successfully',
            'allergies': profile.allergies
        }), 200
        
    except Exception as e:
        logger.error(f"Update allergies error: {str(e)}")
        db.session.rollback()
        return jsonify({'error': 'Failed to update allergies'}), 500

@app.route('/api/user/lifestyle', methods=['PUT'])
@jwt_required()
def update_lifestyle():
    try:
        current_user_id = get_jwt_identity()
        profile = UserProfile.query.filter_by(user_id=current_user_id).first()
        
        if not profile:
            return jsonify({'error': 'User profile not found'}), 404
            
        data = request.json
        
        profile.lifestyle_factors = data
        db.session.commit()
        
        return jsonify({
            'message': 'Lifestyle factors updated successfully',
            'lifestyle': profile.lifestyle_factors
        }), 200
        
    except Exception as e:
        logger.error(f"Update lifestyle error: {str(e)}")
        db.session.rollback()
        return jsonify({'error': 'Failed to update lifestyle factors'}), 500

# Skin analysis routes
@app.route('/api/analyze-skin/quiz', methods=['POST'])
def analyze_skin_quiz():
    try:
        quiz_data = request.json
        
        if not quiz_data:
            return jsonify({'error': 'Quiz data is required'}), 400
            
        # Process quiz data and generate skin profile
        analysis_results = analyze_quiz_results(quiz_data)
        
        return jsonify(analysis_results), 200
        
    except Exception as e:
        logger.error(f"Skin quiz analysis error: {str(e)}")
        return jsonify({'error': 'Failed to analyze skin quiz data'}), 500

@app.route('/api/analyze-skin/image', methods=['POST'])
def analyze_skin_image_route():
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'No image file provided'}), 400
            
        image_file = request.files['image']
        
        if image_file.filename == '':
            return jsonify({'error': 'No image selected'}), 400
            
        # Process and analyze the image
        preprocessed_image = preprocess_image(image_file)
        analysis_results = analyze_skin_image(preprocessed_image)
        
        return jsonify(analysis_results), 200
        
    except Exception as e:
        logger.error(f"Skin image analysis error: {str(e)}")
        return jsonify({'error': 'Failed to analyze skin image'}), 500

# Recommendation routes
@app.route('/api/recommendations', methods=['POST'])
def get_recommendations():
    try:
        filter_data = request.json or {}
        
        # Get personalized product recommendations
        recommendations = get_personalized_recommendations(filter_data)
        
        return jsonify(recommendations), 200
        
    except Exception as e:
        logger.error(f"Recommendations error: {str(e)}")
        return jsonify({'error': 'Failed to get recommendations'}), 500

@app.route('/api/products/<int:product_id>', methods=['GET'])
def get_product_details(product_id):
    try:
        product = Product.query.get(product_id)
        
        if not product:
            return jsonify({'error': 'Product not found'}), 404
            
        return jsonify(product.to_dict()), 200
        
    except Exception as e:
        logger.error(f"Get product details error: {str(e)}")
        return jsonify({'error': 'Failed to get product details'}), 500

# Routine routes
@app.route('/api/user/routine', methods=['GET'])
@jwt_required()
def get_user_routine():
    try:
        current_user_id = get_jwt_identity()
        routine = UserRoutine.query.filter_by(user_id=current_user_id).first()
        
        if not routine:
            return jsonify({
                'morning': {},
                'evening': {}
            }), 200
            
        return jsonify({
            'morning': routine.morning_routine or {},
            'evening': routine.evening_routine or {}
        }), 200
        
    except Exception as e:
        logger.error(f"Get user routine error: {str(e)}")
        return jsonify({'error': 'Failed to get user routine'}), 500

@app.route('/api/user/routine', methods=['POST'])
@jwt_required()
def save_user_routine():
    try:
        current_user_id = get_jwt_identity()
        data = request.json
        
        routine = UserRoutine.query.filter_by(user_id=current_user_id).first()
        
        if not routine:
            routine = UserRoutine(user_id=current_user_id)
            db.session.add(routine)
            
        if 'morning' in data:
            routine.morning_routine = data['morning']
        if 'evening' in data:
            routine.evening_routine = data['evening']
            
        db.session.commit()
        
        return jsonify({
            'message': 'Routine saved successfully',
            'morning': routine.morning_routine,
            'evening': routine.evening_routine
        }), 200
        
    except Exception as e:
        logger.error(f"Save user routine error: {str(e)}")
        db.session.rollback()
        return jsonify({'error': 'Failed to save user routine'}), 500

# Progress tracking routes
@app.route('/api/user/progress', methods=['GET'])
@jwt_required()
def get_progress_history():
    try:
        current_user_id = get_jwt_identity()
        progress_images = ProgressImage.query.filter_by(user_id=current_user_id).order_by(ProgressImage.date.desc()).all()
        
        results = []
        for image in progress_images:
            results.append({
                'id': image.id,
                'date': image.date.isoformat(),
                'imageUrl': image.image_url,
                'notes': image.notes,
                'concerns': image.concerns,
                'mood': image.mood,
                'skinScore': image.skin_score,
                'skinAnalysis': image.skin_analysis
            })
            
        return jsonify(results), 200
        
    except Exception as e:
        logger.error(f"Get progress history error: {str(e)}")
        return jsonify({'error': 'Failed to get progress history'}), 500

@app.route('/api/user/progress', methods=['POST'])
@jwt_required()
def upload_progress_image():
    try:
        current_user_id = get_jwt_identity()
        
        if 'image' not in request.files:
            return jsonify({'error': 'No image file provided'}), 400
            
        image_file = request.files['image']
        notes = request.form.get('notes', '')
        date_str = request.form.get('date')
        concerns_str = request.form.get('concerns', '[]')
        mood = request.form.get('mood', 'neutral')
        
        import json
        concerns = json.loads(concerns_str)
        
        from datetime import datetime
        date = datetime.fromisoformat(date_str) if date_str else datetime.now()
        
        # Process image and save to storage
        import uuid
        import os
        filename = f"{uuid.uuid4()}.jpg"
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        image_file.save(filepath)
        
        # In a production app, you would upload to cloud storage
        image_url = f"/uploads/{filename}"
        
        # Analyze skin in the image
        preprocessed_image = preprocess_image(filepath)
        analysis_results = analyze_skin_image(preprocessed_image)
        
        # Create progress image record
        progress_image = ProgressImage(
            user_id=current_user_id,
            date=date,
            image_url=image_url,
            notes=notes,
            concerns=concerns,
            mood=mood,
            skin_score=analysis_results.get('skinScore'),
            skin_analysis=analysis_results.get('skinHealthMetrics')
        )
        
        db.session.add(progress_image)
        db.session.commit()
        
        return jsonify({
            'message': 'Progress image uploaded successfully',
            'id': progress_image.id,
            'date': progress_image.date.isoformat(),
            'imageUrl': progress_image.image_url,
            'skinScore': progress_image.skin_score
        }), 201
        
    except Exception as e:
        logger.error(f"Upload progress image error: {str(e)}")
        db.session.rollback()
        return jsonify({'error': 'Failed to upload progress image'}), 500

# Feedback routes
@app.route('/api/feedback', methods=['POST'])
@jwt_required()
def submit_feedback():
    try:
        current_user_id = get_jwt_identity()
        data = request.json
        
        if not all(k in data for k in ('productId', 'rating')):
            return jsonify({'error': 'Product ID and rating are required'}), 400
            
        # Check if product exists
        product = Product.query.get(data['productId'])
        if not product:
            return jsonify({'error': 'Product not found'}), 404
            
        # Check if user has already submitted feedback for this product
        existing_feedback = UserFeedback.query.filter_by(
            user_id=current_user_id,
            product_id=data['productId']
        ).first()
        
        if existing_feedback:
            # Update existing feedback
            existing_feedback.rating = data['rating']
            existing_feedback.feedback_text = data.get('feedback', '')
        else:
            # Create new feedback
            feedback = UserFeedback(
                user_id=current_user_id,
                product_id=data['productId'],
                rating=data['rating'],
                feedback_text=data.get('feedback', '')
            )
            db.session.add(feedback)
            
        db.session.commit()
        
        # Update product's average rating
        product_feedbacks = UserFeedback.query.filter_by(product_id=data['productId']).all()
        total_rating = sum(feedback.rating for feedback in product_feedbacks)
        avg_rating = total_rating / len(product_feedbacks) if product_feedbacks else 0
        
        product.rating = round(avg_rating, 1)
        product.review_count = len(product_feedbacks)
        db.session.commit()
        
        return jsonify({
            'message': 'Feedback submitted successfully',
            'productId': data['productId'],
            'rating': data['rating']
        }), 200
        
    except Exception as e:
        logger.error(f"Submit feedback error: {str(e)}")
        db.session.rollback()
        return jsonify({'error': 'Failed to submit feedback'}), 500

# Chatbot route
@app.route('/api/chatbot', methods=['POST'])
def chatbot():
    try:
        data = request.json
        
        if 'message' not in data:
            return jsonify({'error': 'Message is required'}), 400
            
        user_id = None
        if 'Authorization' in request.headers:
            try:
                from flask_jwt_extended import decode_token
                token = request.headers['Authorization'].split(' ')[1]
                decoded = decode_token(token)
                user_id = decoded['sub']
            except:
                pass
                
        response = process_user_query(data['message'], user_id)
        
        return jsonify({
            'response': response
        }), 200
        
    except Exception as e:
        logger.error(f"Chatbot error: {str(e)}")
        return jsonify({'error': 'Failed to process message'}), 500

# Main entry point
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
