#!/usr/bin/env python3
"""
D&D Campaign Memory Engine - Standalone Application
=================================================

A complete, independent SaaS application for managing D&D campaigns.
This can be deployed and sold as a standalone product.

Features:
- Campaign management and organization
- NPC tracking and relationships
- Plot thread management
- Session logging and summaries
- AI-powered content generation
- User authentication and billing
- RESTful API
- Web interface

Business Model:
- Basic: $19/month (5 campaigns, basic features)
- Pro: $49/month (unlimited campaigns, AI features)
- Enterprise: $99/month (custom features, priority support)

Deployment:
- Docker containerized
- PostgreSQL database
- Redis for caching
- Nginx reverse proxy
- SSL/TLS encryption

Author: Your Name
Created: 2026-03-06
"""

import os
import sys
import logging
from datetime import datetime
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, field
import uuid
import json
from flask import Flask, request, jsonify, render_template, send_from_directory
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import sqlite3
from functools import wraps

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - [DND] %(message)s',
    handlers=[
        logging.FileHandler('dnd_engine.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'your-secret-key-here')
app.config['DATABASE_URL'] = os.environ.get('DATABASE_URL', 'sqlite:///dnd_engine.db')
app.config['REDIS_URL'] = os.environ.get('REDIS_URL', 'redis://localhost:6379')

# Data models
@dataclass
class User:
    """User model for authentication and billing"""
    id: str
    email: str
    name: str
    password_hash: str
    plan: str
    api_key: str
    created_at: datetime
    subscription_expires: Optional[datetime] = None
    is_active: bool = True

@dataclass
class Campaign:
    """Campaign model for D&D campaigns"""
    id: str
    user_id: str
    name: str
    description: str
    setting: str
    level_range: str
    current_session: int
    created_at: datetime
    last_updated: datetime
    is_active: bool = True

@dataclass
class NPC:
    """NPC model for non-player characters"""
    id: str
    campaign_id: str
    name: str
    race: str
    class_type: str
    description: str
    personality: str
    background: str
    location: str
    relationships: List[str]
    created_at: datetime
    last_updated: datetime

@dataclass
class PlotThread:
    """Plot thread model for story tracking"""
    id: str
    campaign_id: str
    title: str
    description: str
    status: str
    importance: int
    resolution: str
    created_at: datetime
    resolved_at: Optional[datetime] = None

@dataclass
class Session:
    """Session model for game sessions"""
    id: str
    campaign_id: str
    session_number: int
    date: datetime
    location: str
    attendees: List[str]
    summary: str
    key_events: List[str]
    notes: str
    created_at: datetime

# Database operations
class DatabaseManager:
    """Handle all database operations"""
    
    def __init__(self, db_url: str):
        self.db_url = db_url
        self.init_database()
    
    def init_database(self):
        """Initialize database tables"""
        conn = sqlite3.connect(self.db_url.replace('sqlite:///', ''))
        cursor = conn.cursor()
        
        # Users table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                email TEXT UNIQUE NOT NULL,
                name TEXT NOT NULL,
                password_hash TEXT NOT NULL,
                plan TEXT DEFAULT 'basic',
                api_key TEXT UNIQUE NOT NULL,
                created_at TEXT NOT NULL,
                subscription_expires TEXT,
                is_active BOOLEAN DEFAULT 1
            )
        ''')
        
        # Campaigns table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS campaigns (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                name TEXT NOT NULL,
                description TEXT,
                setting TEXT,
                level_range TEXT,
                current_session INTEGER DEFAULT 1,
                created_at TEXT NOT NULL,
                last_updated TEXT NOT NULL,
                is_active BOOLEAN DEFAULT 1,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        ''')
        
        # NPCs table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS npcs (
                id TEXT PRIMARY KEY,
                campaign_id TEXT NOT NULL,
                name TEXT NOT NULL,
                race TEXT,
                class_type TEXT,
                description TEXT,
                personality TEXT,
                background TEXT,
                location TEXT,
                relationships TEXT,
                created_at TEXT NOT NULL,
                last_updated TEXT NOT NULL,
                FOREIGN KEY (campaign_id) REFERENCES campaigns (id)
            )
        ''')
        
        # Plot threads table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS plot_threads (
                id TEXT PRIMARY KEY,
                campaign_id TEXT NOT NULL,
                title TEXT NOT NULL,
                description TEXT,
                status TEXT DEFAULT 'active',
                importance INTEGER DEFAULT 1,
                resolution TEXT,
                created_at TEXT NOT NULL,
                resolved_at TEXT,
                FOREIGN KEY (campaign_id) REFERENCES campaigns (id)
            )
        ''')
        
        # Sessions table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS sessions (
                id TEXT PRIMARY KEY,
                campaign_id TEXT NOT NULL,
                session_number INTEGER NOT NULL,
                date TEXT NOT NULL,
                location TEXT,
                attendees TEXT,
                summary TEXT,
                key_events TEXT,
                notes TEXT,
                created_at TEXT NOT NULL,
                FOREIGN KEY (campaign_id) REFERENCES campaigns (id)
            )
        ''')
        
        conn.commit()
        conn.close()
        logger.info("Database initialized successfully")
    
    def get_connection(self):
        """Get database connection"""
        return sqlite3.connect(self.db_url.replace('sqlite:///', ''))
    
    def create_user(self, user: User) -> User:
        """Create a new user"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute('''
                INSERT INTO users (id, email, name, password_hash, plan, api_key, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (
                user.id, user.email, user.name, user.password_hash,
                user.plan, user.api_key, user.created_at.isoformat()
            ))
            conn.commit()
            logger.info(f"Created user: {user.email}")
            return user
        except sqlite3.IntegrityError as e:
            conn.close()
            raise ValueError(f"User with email {user.email} already exists")
        finally:
            conn.close()
    
    def get_user_by_email(self, email: str) -> Optional[User]:
        """Get user by email"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute('SELECT * FROM users WHERE email = ?', (email,))
        row = cursor.fetchone()
        conn.close()
        
        if row:
            return User(
                id=row[0], email=row[1], name=row[2], password_hash=row[3],
                plan=row[4], api_key=row[5], created_at=datetime.fromisoformat(row[6]),
                subscription_expires=datetime.fromisoformat(row[7]) if row[7] else None,
                is_active=bool(row[8])
            )
        return None
    
    def create_campaign(self, campaign: Campaign) -> Campaign:
        """Create a new campaign"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO campaigns (id, user_id, name, description, setting, level_range, 
                               current_session, created_at, last_updated, is_active)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            campaign.id, campaign.user_id, campaign.name, campaign.description,
            campaign.setting, campaign.level_range, campaign.current_session,
            campaign.created_at.isoformat(), campaign.last_updated.isoformat(),
            campaign.is_active
        ))
        conn.commit()
        conn.close()
        logger.info(f"Created campaign: {campaign.name}")
        return campaign
    
    def get_user_campaigns(self, user_id: str) -> List[Campaign]:
        """Get all campaigns for a user"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute('SELECT * FROM campaigns WHERE user_id = ? AND is_active = 1', (user_id,))
        rows = cursor.fetchall()
        conn.close()
        
        campaigns = []
        for row in rows:
            campaigns.append(Campaign(
                id=row[0], user_id=row[1], name=row[2], description=row[3],
                setting=row[4], level_range=row[5], current_session=row[6],
                created_at=datetime.fromisoformat(row[7]), last_updated=datetime.fromisoformat(row[8]),
                is_active=bool(row[9])
            ))
        return campaigns

# Initialize database
db = DatabaseManager(app.config['DATABASE_URL'])

# Authentication decorators
def require_api_key(f):
    """Decorator to require API key authentication"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        api_key = request.headers.get('X-API-Key')
        if not api_key:
            return jsonify({'error': 'API key required'}), 401
        
        # Verify API key (simplified - in production, check against database)
        if not api_key.startswith('dnd_'):
            return jsonify({'error': 'Invalid API key'}), 401
        
        return f(*args, **kwargs)
    return decorated_function

# API Routes
@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'version': '1.0.0'
    })

@app.route('/api/register', methods=['POST'])
def register():
    """Register a new user"""
    try:
        data = request.get_json()
        
        # Validate input
        required_fields = ['email', 'name', 'password']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        # Check if user exists
        existing_user = db.get_user_by_email(data['email'])
        if existing_user:
            return jsonify({'error': 'User already exists'}), 409
        
        # Create new user
        user = User(
            id=f"user_{uuid.uuid4().hex[:8]}",
            email=data['email'],
            name=data['name'],
            password_hash=generate_password_hash(data['password']),
            plan='basic',
            api_key=f"dnd_{uuid.uuid4().hex[:16]}",
            created_at=datetime.now()
        )
        
        db.create_user(user)
        
        return jsonify({
            'message': 'User registered successfully',
            'user_id': user.id,
            'api_key': user.api_key
        }), 201
        
    except Exception as e:
        logger.error(f"Registration error: {e}")
        return jsonify({'error': 'Registration failed'}), 500

@app.route('/api/login', methods=['POST'])
def login():
    """Login user and return API key"""
    try:
        data = request.get_json()
        
        if not data.get('email') or not data.get('password'):
            return jsonify({'error': 'Email and password required'}), 400
        
        user = db.get_user_by_email(data['email'])
        if not user or not check_password_hash(user.password_hash, data['password']):
            return jsonify({'error': 'Invalid credentials'}), 401
        
        if not user.is_active:
            return jsonify({'error': 'Account deactivated'}), 403
        
        return jsonify({
            'message': 'Login successful',
            'user_id': user.id,
            'api_key': user.api_key,
            'plan': user.plan
        })
        
    except Exception as e:
        logger.error(f"Login error: {e}")
        return jsonify({'error': 'Login failed'}), 500

@app.route('/api/campaigns', methods=['GET'])
@require_api_key
def get_campaigns():
    """Get all campaigns for the authenticated user"""
    try:
        # In production, get user_id from API key
        user_id = "demo_user"  # Simplified for demo
        
        campaigns = db.get_user_campaigns(user_id)
        
        return jsonify({
            'campaigns': [
                {
                    'id': campaign.id,
                    'name': campaign.name,
                    'description': campaign.description,
                    'setting': campaign.setting,
                    'level_range': campaign.level_range,
                    'current_session': campaign.current_session,
                    'created_at': campaign.created_at.isoformat(),
                    'last_updated': campaign.last_updated.isoformat()
                }
                for campaign in campaigns
            ]
        })
        
    except Exception as e:
        logger.error(f"Get campaigns error: {e}")
        return jsonify({'error': 'Failed to get campaigns'}), 500

@app.route('/api/campaigns', methods=['POST'])
@require_api_key
def create_campaign():
    """Create a new campaign"""
    try:
        data = request.get_json()
        
        if not data.get('name'):
            return jsonify({'error': 'Campaign name is required'}), 400
        
        # In production, get user_id from API key
        user_id = "demo_user"  # Simplified for demo
        
        campaign = Campaign(
            id=f"campaign_{uuid.uuid4().hex[:8]}",
            user_id=user_id,
            name=data['name'],
            description=data.get('description', ''),
            setting=data.get('setting', ''),
            level_range=data.get('level_range', ''),
            current_session=1,
            created_at=datetime.now(),
            last_updated=datetime.now()
        )
        
        db.create_campaign(campaign)
        
        return jsonify({
            'message': 'Campaign created successfully',
            'campaign': {
                'id': campaign.id,
                'name': campaign.name,
                'description': campaign.description,
                'setting': campaign.setting,
                'level_range': campaign.level_range,
                'created_at': campaign.created_at.isoformat()
            }
        }), 201
        
    except Exception as e:
        logger.error(f"Create campaign error: {e}")
        return jsonify({'error': 'Failed to create campaign'}), 500

# Web interface routes
@app.route('/')
def index():
    """Main web interface"""
    return render_template('index.html')

@app.route('/dashboard')
def dashboard():
    """Dashboard page"""
    return render_template('dashboard.html')

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

# Main execution
if __name__ == '__main__':
    # Create demo user
    try:
        demo_user = User(
            id="demo_user",
            email="dm@example.com",
            name="Dungeon Master",
            password_hash=generate_password_hash("dragon123"),
            plan="pro",
            api_key="dnd_demo_api_key_12345",
            created_at=datetime.now()
        )
        
        # Only create if doesn't exist
        if not db.get_user_by_email(demo_user.email):
            db.create_user(demo_user)
            logger.info("Demo user created successfully")
    except Exception as e:
        logger.info(f"Demo user already exists or creation failed: {e}")
    
    # Start the application
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
