#!/usr/bin/env python3
"""
Micro-SaaS Project Template
===========================

This is a heavily documented template for building micro-SaaS tools.
Every function, class, and important line is explained to help you learn
and understand the code structure.

Author: Your Name
Created: $(date)
License: MIT

Key Principles:
- Keep it simple and focused
- Document everything for future reference
- Build MVP first, add features later
- Think about monetization from day 1
"""

import os
import sys
import json
import logging
from datetime import datetime
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from pathlib import Path

# Configure logging for debugging and monitoring
# This helps track issues when users report problems
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('app.log'),  # Log to file for debugging
        logging.StreamHandler(sys.stdout)  # Also show in console
    ]
)
logger = logging.getLogger(__name__)

@dataclass
class User:
    """
    User data structure
    
    This represents a user in our micro-SaaS application.
    Using dataclass makes it easy to create and manage user data
    with automatic __init__, __repr__, and other methods.
    
    Attributes:
        id: Unique identifier for the user
        email: User's email address (used for login)
        name: Display name
        plan: Subscription plan (free, basic, pro)
        created_at: When user account was created
        api_key: API key for programmatic access
    """
    id: str
    email: str
    name: str
    plan: str = "free"
    created_at: datetime = None
    api_key: str = None
    
    def __post_init__(self):
        """Post-initialization to set default values"""
        if self.created_at is None:
            self.created_at = datetime.now()
        if self.api_key is None:
            self.api_key = self.generate_api_key()
    
    def generate_api_key(self) -> str:
        """
        Generate a unique API key for the user
        
        Returns:
            A random API key string
        """
        import secrets
        return f"sk_{secrets.token_urlsafe(32)}"

class MicroSaaSApp:
    """
    Main application class for our micro-SaaS tool
    
    This class handles the core business logic and provides
    a clean interface for building features on top.
    
    Design Pattern: Singleton-ish - one app instance per process
    """
    
    def __init__(self, config_file: str = "config.json"):
        """
        Initialize the application
        
        Args:
            config_file: Path to configuration file
        """
        self.config = self.load_config(config_file)
        self.users: Dict[str, User] = {}  # In-memory user storage
        self.current_user: Optional[User] = None
        
        # Log application startup
        logger.info(f"Starting {self.__class__.__name__}")
        logger.info(f"Configuration loaded: {len(self.config)} settings")
    
    def load_config(self, config_file: str) -> Dict[str, Any]:
        """
        Load configuration from JSON file
        
        Configuration files allow us to change settings
        without modifying code. This is crucial for deployment.
        
        Args:
            config_file: Path to config JSON file
            
        Returns:
            Dictionary with configuration values
        """
        try:
            if os.path.exists(config_file):
                with open(config_file, 'r') as f:
                    config = json.load(f)
                    logger.info(f"Loaded configuration from {config_file}")
                    return config
            else:
                # Create default config if none exists
                default_config = {
                    "app_name": "Micro-SaaS Tool",
                    "version": "1.0.0",
                    "database": {
                        "type": "sqlite",
                        "path": "app.db"
                    },
                    "pricing": {
                        "free_limit": 10,
                        "basic_price": 9.99,
                        "pro_price": 29.99
                    },
                    "features": {
                        "api_access": True,
                        "export": True,
                        "collaboration": False
                    }
                }
                
                with open(config_file, 'w') as f:
                    json.dump(default_config, f, indent=2)
                    logger.info(f"Created default config at {config_file}")
                
                return default_config
                
        except Exception as e:
            logger.error(f"Failed to load config: {e}")
            # Return minimal config to prevent crashes
            return {"app_name": "Micro-SaaS Tool"}
    
    def register_user(self, email: str, name: str, password: str) -> User:
        """
        Register a new user in the system
        
        This is the entry point for new customers.
        In production, you'd hash passwords and use a real database.
        
        Args:
            email: User's email address
            name: User's display name
            password: Plain text password (DON'T do this in production!)
            
        Returns:
            User object for the newly created user
            
        Raises:
            ValueError: If user already exists
        """
        # Check if user already exists
        if email in self.users:
            raise ValueError(f"User with email {email} already exists")
        
        # Create new user
        user_id = f"user_{len(self.users) + 1}"
        new_user = User(
            id=user_id,
            email=email,
            name=name
        )
        
        # Store user (in production, use a real database)
        self.users[email] = new_user
        
        logger.info(f"Registered new user: {email}")
        return new_user
    
    def login_user(self, email: str, password: str) -> Optional[User]:
        """
        Authenticate and login a user
        
        Args:
            email: User's email
            password: User's password
            
        Returns:
            User object if login successful, None otherwise
        """
        user = self.users.get(email)
        if user:
            # In production, verify password hash
            self.current_user = user
            logger.info(f"User logged in: {email}")
            return user
        
        logger.warning(f"Failed login attempt: {email}")
        return None
    
    def check_usage_limits(self, user: User) -> Dict[str, Any]:
        """
        Check if user has reached their usage limits
        
        This is crucial for freemium models - we need to enforce limits
        to encourage upgrades to paid plans.
        
        Args:
            user: User to check limits for
            
        Returns:
            Dictionary with limit information
        """
        limits = {
            "plan": user.plan,
            "monthly_requests": 0,  # Would track from database
            "limit": self.config["pricing"]["free_limit"],
            "can_use": True,
            "upgrade_needed": False
        }
        
        # Check if user needs to upgrade
        if user.plan == "free" and limits["monthly_requests"] >= limits["limit"]:
            limits["can_use"] = False
            limits["upgrade_needed"] = True
        
        return limits
    
    def process_request(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Main method to process user requests
        
        This is where your specific micro-SaaS logic would go.
        Each tool will override this method with its own implementation.
        
        Args:
            data: Request data from user
            
        Returns:
            Response data
        """
        # Check if user is authenticated
        if not self.current_user:
            return {"error": "Authentication required"}
        
        # Check usage limits
        limits = self.check_usage_limits(self.current_user)
        if not limits["can_use"]:
            return {
                "error": "Usage limit exceeded",
                "upgrade_needed": True,
                "plan": limits["plan"]
            }
        
        # Process the actual request (to be implemented by subclasses)
        result = self.handle_core_logic(data)
        
        # Log usage for billing/analytics
        logger.info(f"Processed request for user {self.current_user.email}")
        
        return result
    
    def handle_core_logic(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Override this method in your specific tool implementation
        
        This is where you'll put the actual business logic for your
        micro-SaaS tool (PDF processing, screenshot capture, etc.)
        
        Args:
            data: Input data for processing
            
        Returns:
            Processing results
        """
        # Placeholder implementation
        return {
            "status": "success",
            "message": "Core logic not implemented yet",
            "input_data": data
        }
    
    def export_data(self, format: str = "json") -> str:
        """
        Export user data in various formats
        
        This is a premium feature - users love being able to export
        their data for backup or analysis.
        
        Args:
            format: Export format (json, csv, excel)
            
        Returns:
            Exported data as string
        """
        if not self.current_user:
            return "No user logged in"
        
        # In a real implementation, you'd fetch user's actual data
        export_data = {
            "user": {
                "id": self.current_user.id,
                "email": self.current_user.email,
                "name": self.current_user.name
            },
            "export_date": datetime.now().isoformat(),
            "data": []  # User's actual data would go here
        }
        
        if format.lower() == "json":
            return json.dumps(export_data, indent=2)
        elif format.lower() == "csv":
            # Convert to CSV format
            return "id,email,name,export_date\n" + \
                   f"{export_data['user']['id']},{export_data['user']['email']},{export_data['user']['name']},{export_data['export_date']}"
        else:
            return "Unsupported format"

def main():
    """
    Main entry point for the application
    
    This function demonstrates how to use the MicroSaaSApp class
    and provides a simple command-line interface for testing.
    """
    print("🚀 Starting Micro-SaaS Application")
    print("=" * 50)
    
    # Initialize the app
    app = MicroSaaSApp()
    
    # Demo: Register a new user
    try:
        user = app.register_user(
            email="demo@example.com",
            name="Demo User", 
            password="secure123"
        )
        print(f"✅ Registered user: {user.email}")
        
        # Login the user
        logged_in_user = app.login_user("demo@example.com", "secure123")
        if logged_in_user:
            print(f"✅ Logged in as: {logged_in_user.name}")
            print(f"📧 API Key: {logged_in_user.api_key}")
        
        # Process a sample request
        sample_data = {"action": "test", "input": "Hello World"}
        result = app.process_request(sample_data)
        print(f"📊 Processed request: {result}")
        
        # Export data
        export_json = app.export_data("json")
        print(f"📤 Export preview (first 100 chars): {export_json[:100]}...")
        
    except Exception as e:
        logger.error(f"Demo failed: {e}")
        print(f"❌ Error: {e}")
    
    print("\n🎉 Application demo complete!")

if __name__ == "__main__":
    # This block runs when the script is executed directly
    # It's the standard Python way to make scripts runnable
    main()
