#!/usr/bin/env python3
"""
Simple D&D Campaign Engine API Server
=====================================

This is a lightweight HTTP server using Python's built-in modules
to demonstrate the D&D Campaign Engine API functionality.
It doesn't require external dependencies like FastAPI.

Features:
- Basic HTTP endpoints for all D&D campaign operations
- JSON request/response handling
- Simple authentication with API keys
- CORS support for web applications
- Error handling and logging

Usage:
    python3 simple_api_server.py
    Then open web_interface.html in your browser

Author: Your Name
Created: 2026-03-06
"""

import os
import sys
import json
import logging
from datetime import datetime, timedelta
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import threading
import webbrowser

# Import our D&D Campaign Engine
try:
    import importlib.util
    spec = importlib.util.spec_from_file_location("project_template", "project-template.py")
    project_template = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(project_template)
    MicroSaaSApp = project_template.MicroSaaSApp
    User = project_template.User
except ImportError:
    print("Error: Could not import project_template. Make sure project-template.py exists.")
    raise

try:
    spec = importlib.util.spec_from_file_location("dnd_campaign_engine", "dnd_campaign_engine.py")
    dnd_campaign_engine = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(dnd_campaign_engine)
    DnDCampaignEngine = dnd_campaign_engine.DnDCampaignEngine
except ImportError:
    print("Error: Could not import dnd_campaign_engine. Make sure dnd_campaign_engine.py exists.")
    raise

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - [API] %(message)s',
    handlers=[
        logging.FileHandler('api_server.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

# Initialize the D&D Campaign Engine
engine = DnDCampaignEngine()

class DnDCampaignAPIHandler(BaseHTTPRequestHandler):
    """
    HTTP request handler for D&D Campaign Engine API
    
    This class handles all HTTP requests and routes them to the appropriate
    D&D Campaign Engine functions based on the URL path and method.
    """
    
    def do_OPTIONS(self):
        """
        Handle OPTIONS requests for CORS preflight
        
        This is required for CORS support when making requests from web browsers.
        """
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()
    
    def do_GET(self):
        """
        Handle GET requests
        
        Routes GET requests to appropriate handlers based on URL path.
        """
        parsed_path = urlparse(self.path)
        path = parsed_path.path
        query_params = parse_qs(parsed_path.query)
        
        # Add CORS headers
        self.send_header('Access-Control-Allow-Origin', '*')
        
        try:
            if path == '/':
                self.handle_root()
            elif path == '/health':
                self.handle_health_check()
            elif path == '/user/profile':
                self.handle_get_user_profile()
            elif path == '/campaigns':
                self.handle_get_campaigns()
            elif path.startswith('/campaigns/') and path.endswith('/overview'):
                campaign_id = path.split('/')[2]
                self.handle_get_campaign_overview(campaign_id)
            else:
                self.send_error(404, "Endpoint not found")
        except Exception as e:
            logger.error(f"GET request error: {e}")
            self.send_error_response(500, str(e))
    
    def do_POST(self):
        """
        Handle POST requests
        
        Routes POST requests to appropriate handlers based on URL path.
        """
        parsed_path = urlparse(self.path)
        path = parsed_path.path
        
        # Add CORS headers
        self.send_header('Access-Control-Allow-Origin', '*')
        
        try:
            # Read request body
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            
            # Parse JSON data
            try:
                data = json.loads(post_data.decode('utf-8'))
            except json.JSONDecodeError:
                self.send_error_response(400, "Invalid JSON")
                return
            
            # Route to appropriate handler
            if path == '/auth/register':
                self.handle_register_user(data)
            elif path == '/auth/login':
                self.handle_login_user(data)
            elif path == '/campaigns':
                self.handle_create_campaign(data)
            elif path == '/npcs':
                self.handle_create_npc(data)
            elif path == '/sessions':
                self.handle_create_session(data)
            elif path == '/plot-threads':
                self.handle_create_plot_thread(data)
            elif path == '/decisions':
                self.handle_record_decision(data)
            elif path == '/timeline-events':
                self.handle_add_timeline_event(data)
            elif path.endswith('/summary'):
                session_id = path.split('/')[2]
                self.handle_generate_summary(session_id, data)
            elif path.endswith('/consistency-check'):
                campaign_id = path.split('/')[2]
                self.handle_consistency_check(campaign_id, data)
            elif path.endswith('/export'):
                session_id = path.split('/')[2]
                self.handle_export_recap(session_id, data)
            else:
                self.send_error(404, "Endpoint not found")
                
        except Exception as e:
            logger.error(f"POST request error: {e}")
            self.send_error_response(500, str(e))
    
    def get_current_user(self):
        """
        Authenticate user from Authorization header
        
        Extracts API key from Authorization header and validates it.
        
        Returns:
            User object if authentication successful
            
        Raises:
            Exception: If authentication fails
        """
        auth_header = self.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            raise Exception("Missing or invalid Authorization header")
        
        token = auth_header.split(' ')[1]
        
        # Find user by API key
        for user in engine.users.values():
            if user.api_key == token:
                return user
        
        raise Exception("Invalid API key")
    
    def send_json_response(self, status_code, data):
        """
        Send JSON response
        
        Args:
            status_code: HTTP status code
            data: Response data (will be JSON encoded)
        """
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        response_json = json.dumps(data, indent=2, default=str)
        self.wfile.write(response_json.encode('utf-8'))
    
    def send_error_response(self, status_code, message):
        """
        Send error response in JSON format
        
        Args:
            status_code: HTTP status code
            message: Error message
        """
        error_data = {
            "status": "error",
            "message": message
        }
        self.send_json_response(status_code, error_data)
    
    # API Endpoint Handlers
    
    def handle_root(self):
        """Handle root endpoint - API information"""
        response_data = {
            "status": "success",
            "message": "D&D Campaign Memory Engine API",
            "data": {
                "version": "1.0.0",
                "docs": "Open web_interface.html for documentation",
                "health": "healthy",
                "campaigns_count": len(engine.campaigns),
                "users_count": len(engine.users)
            }
        }
        self.send_json_response(200, response_data)
    
    def handle_health_check(self):
        """Handle health check endpoint"""
        response_data = {
            "status": "success",
            "message": "API is healthy",
            "data": {
                "timestamp": datetime.now().isoformat(),
                "version": "1.0.0",
                "campaigns": len(engine.campaigns),
                "users": len(engine.users)
            }
        }
        self.send_json_response(200, response_data)
    
    def handle_register_user(self, data):
        """Handle user registration"""
        try:
            user = engine.register_user(
                email=data["email"],
                name=data["name"],
                password=data["password"]
            )
            
            response_data = {
                "status": "success",
                "message": "User registered successfully",
                "data": {
                    "user_id": user.id,
                    "email": user.email,
                    "name": user.name,
                    "plan": user.plan,
                    "api_key": user.api_key
                }
            }
            self.send_json_response(200, response_data)
        except ValueError as e:
            self.send_error_response(400, str(e))
    
    def handle_login_user(self, data):
        """Handle user login"""
        try:
            user = engine.login_user(
                email=data["email"],
                password=data["password"]
            )
            
            if user:
                response_data = {
                    "status": "success",
                    "message": "Login successful",
                    "data": {
                        "user_id": user.id,
                        "email": user.email,
                        "name": user.name,
                        "plan": user.plan,
                        "api_key": user.api_key
                    }
                }
                self.send_json_response(200, response_data)
            else:
                self.send_error_response(401, "Invalid email or password")
        except Exception as e:
            self.send_error_response(400, str(e))
    
    def handle_get_user_profile(self):
        """Handle get user profile"""
        try:
            current_user = self.get_current_user()
            limits = engine.check_usage_limits(current_user)
            user_campaigns = engine.user_campaigns.get(current_user.email, [])
            
            response_data = {
                "status": "success",
                "data": {
                    "user_id": current_user.id,
                    "email": current_user.email,
                    "name": current_user.name,
                    "plan": current_user.plan,
                    "api_key": current_user.api_key,
                    "usage_limits": limits,
                    "campaigns_count": len(user_campaigns),
                    "campaigns": user_campaigns
                }
            }
            self.send_json_response(200, response_data)
        except Exception as e:
            self.send_error_response(401, str(e))
    
    def handle_get_campaigns(self):
        """Handle get user campaigns"""
        try:
            current_user = self.get_current_user()
            user_campaign_ids = engine.user_campaigns.get(current_user.email, [])
            campaigns = []
            
            for campaign_id in user_campaign_ids:
                if campaign_id in engine.campaigns:
                    campaign = engine.campaigns[campaign_id]
                    campaigns.append({
                        "id": campaign.id,
                        "name": campaign.name,
                        "description": campaign.description,
                        "dm_name": campaign.dm_name,
                        "setting": campaign.setting,
                        "status": campaign.status,
                        "current_session": campaign.current_session,
                        "player_characters": campaign.player_characters
                    })
            
            response_data = {
                "status": "success",
                "data": {
                    "campaigns": campaigns,
                    "total": len(campaigns)
                }
            }
            self.send_json_response(200, response_data)
        except Exception as e:
            self.send_error_response(401, str(e))
    
    def handle_create_campaign(self, data):
        """Handle create campaign"""
        try:
            current_user = self.get_current_user()
            
            campaign = engine.create_campaign(
                user_email=current_user.email,
                name=data["name"],
                description=data["description"],
                dm_name=data["dm_name"],
                player_characters=data["player_characters"],
                setting=data.get("setting", "")
            )
            
            response_data = {
                "status": "success",
                "message": "Campaign created successfully",
                "data": campaign.__dict__
            }
            self.send_json_response(200, response_data)
        except ValueError as e:
            self.send_error_response(400, str(e))
        except Exception as e:
            self.send_error_response(401, str(e))
    
    def handle_get_campaign_overview(self, campaign_id):
        """Handle get campaign overview"""
        try:
            current_user = self.get_current_user()
            
            # Verify user owns this campaign
            user_campaigns = engine.user_campaigns.get(current_user.email, [])
            if campaign_id not in user_campaigns:
                self.send_error_response(403, "Access denied: You don't own this campaign")
                return
            
            overview = engine.get_campaign_overview(campaign_id)
            
            response_data = {
                "status": "success",
                "data": overview
            }
            self.send_json_response(200, response_data)
        except ValueError as e:
            self.send_error_response(404, str(e))
        except Exception as e:
            self.send_error_response(401, str(e))
    
    def handle_create_npc(self, data):
        """Handle create NPC"""
        try:
            current_user = self.get_current_user()
            
            # Verify user owns the campaign
            user_campaigns = engine.user_campaigns.get(current_user.email, [])
            if data["campaign_id"] not in user_campaigns:
                self.send_error_response(403, "Access denied: You don't own this campaign")
                return
            
            npc = engine.add_npc(
                campaign_id=data["campaign_id"],
                name=data["name"],
                description=data["description"],
                location=data["location"],
                alignment=data["alignment"],
                session_id=data.get("session_id", "")
            )
            
            response_data = {
                "status": "success",
                "message": "NPC created successfully",
                "data": npc.__dict__
            }
            self.send_json_response(200, response_data)
        except ValueError as e:
            self.send_error_response(400, str(e))
        except Exception as e:
            self.send_error_response(401, str(e))
    
    def handle_create_session(self, data):
        """Handle create session"""
        try:
            current_user = self.get_current_user()
            
            # Verify user owns the campaign
            user_campaigns = engine.user_campaigns.get(current_user.email, [])
            if data["campaign_id"] not in user_campaigns:
                self.send_error_response(403, "Access denied: You don't own this campaign")
                return
            
            session = engine.create_session(
                campaign_id=data["campaign_id"],
                session_number=data["session_number"],
                date_played=datetime.fromisoformat(data["date_played"]),
                in_game_date_range=data["in_game_date_range"],
                summary=data["summary"],
                player_attendance=data["player_attendance"]
            )
            
            response_data = {
                "status": "success",
                "message": "Session created successfully",
                "data": session.__dict__
            }
            self.send_json_response(200, response_data)
        except ValueError as e:
            self.send_error_response(400, str(e))
        except Exception as e:
            self.send_error_response(401, str(e))
    
    def handle_create_plot_thread(self, data):
        """Handle create plot thread"""
        try:
            current_user = self.get_current_user()
            
            # Verify user owns the campaign
            user_campaigns = engine.user_campaigns.get(current_user.email, [])
            if data["campaign_id"] not in user_campaigns:
                self.send_error_response(403, "Access denied: You don't own this campaign")
                return
            
            thread = engine.add_plot_thread(
                campaign_id=data["campaign_id"],
                title=data["title"],
                description=data["description"],
                priority=data.get("priority", "medium"),
                started_session=data.get("started_session", "")
            )
            
            response_data = {
                "status": "success",
                "message": "Plot thread created successfully",
                "data": thread.__dict__
            }
            self.send_json_response(200, response_data)
        except ValueError as e:
            self.send_error_response(400, str(e))
        except Exception as e:
            self.send_error_response(401, str(e))
    
    def handle_record_decision(self, data):
        """Handle record player decision"""
        try:
            current_user = self.get_current_user()
            
            decision = engine.record_player_decision(
                session_id=data["session_id"],
                player_name=data["player_name"],
                decision=data["decision"],
                immediate_consequences=data["immediate_consequences"],
                importance=data.get("importance", 5)
            )
            
            response_data = {
                "status": "success",
                "message": "Decision recorded successfully",
                "data": decision.__dict__
            }
            self.send_json_response(200, response_data)
        except ValueError as e:
            self.send_error_response(400, str(e))
        except Exception as e:
            self.send_error_response(401, str(e))
    
    def handle_add_timeline_event(self, data):
        """Handle add timeline event"""
        try:
            current_user = self.get_current_user()
            
            event = engine.add_timeline_event(
                session_id=data["session_id"],
                in_game_date=data["in_game_date"],
                event_type=data["event_type"],
                description=data["description"],
                location=data["location"],
                participants=data["participants"],
                significance=data.get("significance", 5)
            )
            
            response_data = {
                "status": "success",
                "message": "Timeline event added successfully",
                "data": event.__dict__
            }
            self.send_json_response(200, response_data)
        except ValueError as e:
            self.send_error_response(400, str(e))
        except Exception as e:
            self.send_error_response(401, str(e))
    
    def handle_generate_summary(self, session_id, data):
        """Handle generate session summary"""
        try:
            current_user = self.get_current_user()
            
            # Check if user has paid plan (in real implementation)
            if current_user.plan == "free":
                self.send_error_response(403, "AI summaries require a paid plan. Please upgrade to Basic or Pro.")
                return
            
            summary = engine.generate_session_summary_ai(session_id)
            
            response_data = {
                "status": "success",
                "message": "Session summary generated successfully",
                "data": {
                    "session_id": session_id,
                    "summary": summary
                }
            }
            self.send_json_response(200, response_data)
        except ValueError as e:
            self.send_error_response(404, str(e))
        except Exception as e:
            self.send_error_response(401, str(e))
    
    def handle_consistency_check(self, campaign_id, data):
        """Handle lore consistency check"""
        try:
            current_user = self.get_current_user()
            
            # Check if user has paid plan
            if current_user.plan == "free":
                self.send_error_response(403, "Lore consistency checks require a paid plan. Please upgrade to Basic or Pro.")
                return
            
            # Verify user owns the campaign
            user_campaigns = engine.user_campaigns.get(current_user.email, [])
            if campaign_id not in user_campaigns:
                self.send_error_response(403, "Access denied: You don't own this campaign")
                return
            
            consistency = engine.check_lore_consistency(campaign_id)
            
            response_data = {
                "status": "success",
                "message": "Lore consistency check completed",
                "data": consistency
            }
            self.send_json_response(200, response_data)
        except ValueError as e:
            self.send_error_response(404, str(e))
        except Exception as e:
            self.send_error_response(401, str(e))
    
    def handle_export_recap(self, session_id, data):
        """Handle export session recap"""
        try:
            current_user = self.get_current_user()
            
            format_type = data.get("format", "markdown")
            recap = engine.export_session_recap(session_id, format_type)
            
            response_data = {
                "status": "success",
                "message": "Session recap exported successfully",
                "data": {
                    "session_id": session_id,
                    "format": format_type,
                    "recap": recap
                }
            }
            self.send_json_response(200, response_data)
        except ValueError as e:
            self.send_error_response(404, str(e))
        except Exception as e:
            self.send_error_response(401, str(e))
    
    def log_message(self, format, *args):
        """Override log_message to use our logger"""
        logger.info(f"{format % args}")

def run_server():
    """
    Run the HTTP server
    
    This function starts the HTTP server and makes it available for requests.
    It also opens the web interface in the default browser.
    """
    server_address = ('', 8000)
    httpd = HTTPServer(server_address, DnDCampaignAPIHandler)
    
    print("🚀 Starting D&D Campaign Engine API Server")
    print("📖 API Documentation: Open web_interface.html in your browser")
    print("🔗 API Base URL: http://localhost:8000")
    print("🏥 Health Check: http://localhost:8000/health")
    print("=" * 50)
    
    # Open web interface in browser
    web_path = os.path.abspath("web_interface.html")
    if os.path.exists(web_path):
        print(f"🌐 Opening web interface: file://{web_path}")
        webbrowser.open(f"file://{web_path}")
    else:
        print("⚠️  web_interface.html not found. Create it to use the web interface.")
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
        httpd.server_close()

if __name__ == "__main__":
    run_server()
