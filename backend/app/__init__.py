from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from models import db
from app.routes import main
from app.config import Config
from app.auth_routes import auth_bp
from flask_jwt_extended import JWTManager

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Initialize extensions
    db.init_app(app)
    jwt = JWTManager(app)
    CORS(app, origins=["http://localhost:5173"], supports_credentials=True)

    # Register Blueprints
    app.register_blueprint(main)
    app.register_blueprint(auth_bp)

    # Create tables
    with app.app_context():
        db.create_all()

    return app