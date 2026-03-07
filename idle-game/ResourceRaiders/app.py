import os
import logging
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from apscheduler.schedulers.background import BackgroundScheduler
from sqlalchemy.orm import DeclarativeBase

# Configure logging
logging.basicConfig(level=logging.DEBUG)

class Base(DeclarativeBase):
    pass

db = SQLAlchemy(model_class=Base)
app = Flask(__name__)

# Configure app
app.secret_key = os.environ.get("SESSION_SECRET", "dev_secret_key")

# Ensure we're using the correct PostgreSQL URL format
db_url = os.environ.get("DATABASE_URL")

# fallback to a local sqlite file for development/testing when no URL provided
if not db_url:
    db_url = "sqlite:///dev.db"

# ensure sqlalchemy accepts postgres URLs from platforms like Heroku
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

app.config["SQLALCHEMY_DATABASE_URI"] = db_url
app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
    "pool_recycle": 300,
    "pool_pre_ping": True,
}
app.config["STRIPE_KEY"] = os.environ.get("STRIPE_KEY", "your_stripe_test_key")

# Initialize extensions
db.init_app(app)
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

# Initialize scheduler
scheduler = BackgroundScheduler()
scheduler.start()

with app.app_context():
    # Import models here to ensure they're registered before creating tables
    from models import User, Resources, Buildings, PlayerStats, Item, Inventory, Enemy, Quest
    # Drop all tables and recreate them
    db.drop_all()
    db.create_all()

# Import routes after db initialization
from routes import *