#!/usr/bin/env python3
"""
Website Screenshot Change Tracker
===============================

A micro-SaaS tool that monitors websites and alerts users when
they visually change. Perfect for SEO monitoring, competitor
tracking, product launch alerts, and price page updates.

Features:
- Automatic screenshot capture at scheduled intervals
- Visual difference detection and highlighting
- Multiple notification channels (email, Slack, webhook)
- Screenshot history and comparison tools
- Batch monitoring for multiple websites
- Performance metrics and uptime monitoring
- Export capabilities for reports

Business Model:
- Free: 1 website, daily screenshots
- Basic: 10 websites, hourly screenshots ($9.99/month)
- Pro: 100 websites, 30-minute screenshots ($29.99/month)

Target Users:
- SEO agencies and marketers
- Competitor monitoring teams
- Product launch managers
- Price comparison services
- Website maintenance companies

Technical Implementation:
- Uses browser automation for screenshots
- Image comparison algorithms for change detection
- Scheduled tasks for regular monitoring
- Multiple notification integrations
- Cloud storage for screenshots

Author: Your Name
Created: 2026-03-06
"""

import os
import sys
import logging
import hashlib
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, field
import uuid
import threading
import time

# Import our base template
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

# Configure logging specifically for screenshot tracking
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - [SCREENSHOT] %(message)s',
    handlers=[
        logging.FileHandler('screenshot_tracker.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

@dataclass
class Website:
    """
    Website monitoring configuration
    
    Represents a website that needs to be monitored for changes.
    Contains all configuration for how and when to capture screenshots.
    
    Attributes:
        id: Unique identifier for the website
        url: URL to monitor
        name: Human-readable name
        description: What this website is
        capture_interval: Minutes between captures
        viewport_width: Browser width for screenshots
        viewport_height: Browser height for screenshots
        wait_time: Seconds to wait after page load
        selector: CSS selector for specific element (optional)
        is_active: Whether monitoring is active
        notification_channels: List of notification channel IDs
        created_at: When monitoring was started
        last_capture: When last screenshot was taken
        owner_email: Email of the owner
        tags: List of tags for categorization
    """
    id: str
    url: str
    name: str
    description: str
    capture_interval: int  # minutes
    viewport_width: int = 1920
    viewport_height: int = 1080
    wait_time: int = 5
    selector: str = ""
    is_active: bool = True
    notification_channels: List[str] = field(default_factory=list)
    created_at: datetime = field(default_factory=datetime.now)
    last_capture: Optional[datetime] = None
    owner_email: str = ""
    tags: List[str] = field(default_factory=list)

@dataclass
class Screenshot:
    """
    Screenshot data structure
    
    Represents a single screenshot capture with metadata
    and change detection information.
    
    Attributes:
        id: Unique identifier for the screenshot
        website_id: ID of the website this belongs to
        file_path: Path to the screenshot file
        file_size: Size of the screenshot file in bytes
        image_hash: Hash of the image for comparison
        capture_time: When the screenshot was taken
        load_time: Page load time in seconds
        status_code: HTTP status code
        has_changes: Whether this screenshot has changes from previous
        change_percentage: Percentage of pixels that changed
        change_regions: List of bounding boxes for changed regions
        thumbnail_path: Path to thumbnail image
        metadata: Additional capture metadata
        created_at: When screenshot record was created
    """
    id: str
    website_id: str
    file_path: str
    file_size: int
    image_hash: str
    capture_time: datetime
    load_time: float
    status_code: int
    has_changes: bool = False
    change_percentage: float = 0.0
    change_regions: List[Dict[str, int]] = field(default_factory=list)
    thumbnail_path: str = ""
    metadata: Dict[str, Any] = field(default_factory=dict)
    created_at: datetime = field(default_factory=datetime.now)

@dataclass
class ChangeAlert:
    """
    Change alert data structure
    
    Represents a detected change and notification sent to users.
    Tracks what changed and how users were notified.
    
    Attributes:
        id: Unique identifier for the alert
        website_id: ID of the website that changed
        screenshot_id: ID of the screenshot with changes
        previous_screenshot_id: ID of the previous screenshot
        change_summary: Summary of what changed
        change_percentage: Overall percentage of change
        notification_sent: Whether notification was sent
        notification_channels: Channels used for notification
        acknowledged: Whether user acknowledged the alert
        acknowledged_at: When alert was acknowledged
        created_at: When the alert was created
    """
    id: str
    website_id: str
    screenshot_id: str
    previous_screenshot_id: str
    change_summary: str
    change_percentage: float
    notification_sent: bool = False
    notification_channels: List[str] = field(default_factory=list)
    acknowledged: bool = False
    acknowledged_at: Optional[datetime] = None
    created_at: datetime = field(default_factory=datetime.now)

@dataclass
class NotificationChannel:
    """
    Notification channel configuration
    
    Represents how users want to be notified about changes.
    Supports multiple channels like email, Slack, webhooks.
    
    Attributes:
        id: Unique identifier for the channel
        name: Human-readable name
        type: Channel type (email, slack, webhook, etc.)
        config: Channel-specific configuration
        is_active: Whether channel is active
        owner_email: Email of the owner
        created_at: When channel was created
    """
    id: str
    name: str
    type: str  # email, slack, webhook, discord
    config: Dict[str, Any] = field(default_factory=dict)
    is_active: bool = True
    owner_email: str = ""
    created_at: datetime = field(default_factory=datetime.now)

class ScreenshotTracker(MicroSaaSApp):
    """
    Main Website Screenshot Change Tracker application
    
    This class extends the base MicroSaaSApp with screenshot-specific
    functionality for monitoring websites and detecting changes.
    
    Key Features:
    - Automated screenshot capture with browser automation
    - Visual change detection with image comparison
    - Multiple notification channels
    - Scheduled monitoring with configurable intervals
    - Screenshot history and comparison tools
    - Usage limits for freemium model
    """
    
    def __init__(self, config_file: str = "config.json"):
        """Initialize the Screenshot Tracker"""
        super().__init__(config_file)
        
        # Screenshot tracker specific data storage
        self.websites: Dict[str, Website] = {}  # website_id -> Website
        self.screenshots: Dict[str, Screenshot] = {}  # screenshot_id -> Screenshot
        self.change_alerts: Dict[str, ChangeAlert] = {}  # alert_id -> ChangeAlert
        self.notification_channels: Dict[str, NotificationChannel] = {}  # channel_id -> NotificationChannel
        
        # User website mapping
        self.user_websites: Dict[str, List[str]] = {}  # user_email -> [website_ids]
        
        # Storage paths
        self.storage_path = "screenshots"
        self.thumbnails_path = "thumbnails"
        
        # Create storage directories
        os.makedirs(self.storage_path, exist_ok=True)
        os.makedirs(self.thumbnails_path, exist_ok=True)
        
        # Monitoring thread
        self.monitoring_active = False
        self.monitoring_thread = None
        
        logger.info("Screenshot Tracker initialized")
        logger.info(f"Storage path: {self.storage_path}")
        logger.info(f"Loaded {len(self.websites)} websites for monitoring")
    
    def add_website(self, user_email: str, url: str, name: str, description: str,
                   capture_interval: int = 60, viewport_width: int = 1920,
                   viewport_height: int = 1080, wait_time: int = 5,
                   selector: str = "", tags: List[str] = None) -> Website:
        """
        Add a new website for monitoring
        
        This is the entry point for users to start monitoring websites.
        Checks usage limits and creates monitoring configuration.
        
        Args:
            user_email: Email of the user adding the website
            url: URL to monitor
            name: Human-readable name
            description: What this website is
            capture_interval: Minutes between captures
            viewport_width: Browser width
            viewport_height: Browser height
            wait_time: Seconds to wait after page load
            selector: CSS selector for specific element
            tags: List of tags for categorization
            
        Returns:
            Created Website object
        """
        # Check user limits
        if user_email not in self.users:
            raise ValueError("User not found. Please register first.")
        
        user = self.users[user_email]
        user_websites = self.user_websites.get(user_email, [])
        website_limit = self.get_website_limit(user.plan)
        
        if len(user_websites) >= website_limit:
            raise ValueError(f"Website limit reached ({website_limit}). Upgrade your plan to monitor more websites.")
        
        # Validate URL
        if not url.startswith(('http://', 'https://')):
            url = 'https://' + url
        
        # Create website
        website_id = f"website_{uuid.uuid4().hex[:8]}"
        new_website = Website(
            id=website_id,
            url=url,
            name=name,
            description=description,
            capture_interval=capture_interval,
            viewport_width=viewport_width,
            viewport_height=viewport_height,
            wait_time=wait_time,
            selector=selector,
            tags=tags or [],
            owner_email=user_email
        )
        
        # Store website
        self.websites[website_id] = new_website
        
        # Link to user
        if user_email not in self.user_websites:
            self.user_websites[user_email] = []
        self.user_websites[user_email].append(website_id)
        
        logger.info(f"Added website '{name}' ({url}) for user {user_email}")
        return new_website
    
    def get_website_limit(self, plan: str) -> int:
        """
        Get website limit based on user plan
        
        Args:
            plan: User's subscription plan
            
        Returns:
            Maximum number of websites allowed
        """
        limits = {
            "free": 1,
            "basic": 10,
            "pro": 100,
            "enterprise": 1000
        }
        return limits.get(plan, 1)
    
    def capture_screenshot(self, website_id: str) -> Optional[Screenshot]:
        """
        Capture a screenshot of a website
        
        This method uses browser automation to capture a screenshot
        of the specified website with the configured settings.
        
        Args:
            website_id: ID of the website to capture
            
        Returns:
            Screenshot object if successful, None otherwise
        """
        if website_id not in self.websites:
            raise ValueError("Website not found")
        
        website = self.websites[website_id]
        
        try:
            # In a real implementation, this would use Selenium or Playwright
            # For demo purposes, we'll simulate screenshot capture
            logger.info(f"Capturing screenshot for {website.url}")
            
            # Simulate screenshot capture
            start_time = time.time()
            time.sleep(2)  # Simulate page load time
            load_time = time.time() - start_time
            
            # Generate fake screenshot file
            screenshot_id = f"screenshot_{uuid.uuid4().hex[:8]}"
            filename = f"{screenshot_id}.png"
            file_path = os.path.join(self.storage_path, filename)
            
            # Create a dummy image file (in real implementation, this would be actual screenshot)
            with open(file_path, 'wb') as f:
                # Write some dummy data to simulate image
                f.write(b'FAKE_SCREENSHOT_DATA' * 1000)
            
            file_size = os.path.getsize(file_path)
            
            # Generate image hash
            image_hash = self.generate_image_hash(file_path)
            
            # Create thumbnail path
            thumbnail_filename = f"thumb_{screenshot_id}.png"
            thumbnail_path = os.path.join(self.thumbnails_path, thumbnail_filename)
            
            # Create thumbnail (dummy implementation)
            with open(thumbnail_path, 'wb') as f:
                f.write(b'FAKE_THUMBNAIL_DATA' * 100)
            
            # Create screenshot object
            screenshot = Screenshot(
                id=screenshot_id,
                website_id=website_id,
                file_path=file_path,
                file_size=file_size,
                image_hash=image_hash,
                capture_time=datetime.now(),
                load_time=load_time,
                status_code=200,
                thumbnail_path=thumbnail_path,
                metadata={
                    "user_agent": "ScreenshotBot/1.0",
                    "viewport": f"{website.viewport_width}x{website.viewport_height}",
                    "full_page": not bool(website.selector)
                }
            )
            
            # Store screenshot
            self.screenshots[screenshot_id] = screenshot
            
            # Update website last capture time
            website.last_capture = screenshot.capture_time
            
            logger.info(f"Captured screenshot {screenshot_id} for website {website_id}")
            return screenshot
            
        except Exception as e:
            logger.error(f"Failed to capture screenshot for {website_id}: {e}")
            return None
    
    def generate_image_hash(self, file_path: str) -> str:
        """
        Generate hash for image comparison
        
        Creates a hash of the image file for quick comparison
        and change detection.
        
        Args:
            file_path: Path to the image file
            
        Returns:
            Hex string of the image hash
        """
        # In a real implementation, this would use image processing
        # For demo, we'll use file hash
        hash_md5 = hashlib.md5()
        with open(file_path, "rb") as f:
            for chunk in iter(lambda: f.read(4096), b""):
                hash_md5.update(chunk)
        return hash_md5.hexdigest()
    
    def detect_changes(self, current_screenshot: Screenshot, 
                     previous_screenshot: Optional[Screenshot]) -> Dict[str, Any]:
        """
        Detect changes between screenshots
        
        Compares current screenshot with previous one to detect
        visual changes and calculate change metrics.
        
        Args:
            current_screenshot: The new screenshot
            previous_screenshot: The previous screenshot (can be None)
            
        Returns:
            Dictionary with change detection results
        """
        if not previous_screenshot:
            return {
                "has_changes": True,
                "change_percentage": 100.0,
                "change_regions": [],
                "summary": "First screenshot captured"
            }
        
        # In a real implementation, this would use image comparison algorithms
        # For demo, we'll simulate change detection
        
        # Compare hashes
        if current_screenshot.image_hash == previous_screenshot.image_hash:
            return {
                "has_changes": False,
                "change_percentage": 0.0,
                "change_regions": [],
                "summary": "No changes detected"
            }
        
        # Simulate change detection
        change_percentage = 15.5  # Simulated value
        change_regions = [
            {"x": 100, "y": 200, "width": 300, "height": 150},
            {"x": 500, "y": 400, "width": 200, "height": 100}
        ]
        
        return {
            "has_changes": True,
            "change_percentage": change_percentage,
            "change_regions": change_regions,
            "summary": f"Visual changes detected in {len(change_regions)} regions ({change_percentage}% changed)"
        }
    
    def create_change_alert(self, website_id: str, screenshot_id: str,
                         previous_screenshot_id: str, change_summary: str,
                         change_percentage: float) -> ChangeAlert:
        """
        Create a change alert for detected changes
        
        Creates an alert when changes are detected and
        triggers notifications to configured channels.
        
        Args:
            website_id: ID of the website that changed
            screenshot_id: ID of the screenshot with changes
            previous_screenshot_id: ID of the previous screenshot
            change_summary: Summary of what changed
            change_percentage: Overall percentage of change
            
        Returns:
            Created ChangeAlert object
        """
        alert_id = f"alert_{uuid.uuid4().hex[:8]}"
        
        alert = ChangeAlert(
            id=alert_id,
            website_id=website_id,
            screenshot_id=screenshot_id,
            previous_screenshot_id=previous_screenshot_id,
            change_summary=change_summary,
            change_percentage=change_percentage
        )
        
        # Store alert
        self.change_alerts[alert_id] = alert
        
        # Get website for notifications
        website = self.websites.get(website_id)
        if website:
            # Send notifications
            self.send_notifications(website, alert)
            alert.notification_sent = True
            alert.notification_channels = website.notification_channels
        
        logger.info(f"Created change alert {alert_id} for website {website_id}")
        return alert
    
    def send_notifications(self, website: Website, alert: ChangeAlert):
        """
        Send notifications for a change alert
        
        Sends notifications to all configured channels for the website.
        
        Args:
            website: Website configuration
            alert: Change alert to notify about
        """
        for channel_id in website.notification_channels:
            if channel_id in self.notification_channels:
                channel = self.notification_channels[channel_id]
                
                if channel.type == "email":
                    self.send_email_notification(channel, website, alert)
                elif channel.type == "slack":
                    self.send_slack_notification(channel, website, alert)
                elif channel.type == "webhook":
                    self.send_webhook_notification(channel, website, alert)
                
                logger.info(f"Sent notification via {channel.type} for alert {alert.id}")
    
    def send_email_notification(self, channel: NotificationChannel, 
                              website: Website, alert: ChangeAlert):
        """
        Send email notification
        
        Sends email notification about detected changes.
        In production, this would use an email service like SendGrid.
        """
        # Simulate email sending
        logger.info(f"Email notification sent to {channel.config.get('email')}")
    
    def send_slack_notification(self, channel: NotificationChannel,
                              website: Website, alert: ChangeAlert):
        """
        Send Slack notification
        
        Sends Slack notification about detected changes.
        In production, this would use Slack API.
        """
        # Simulate Slack notification
        logger.info(f"Slack notification sent to {channel.config.get('webhook_url')}")
    
    def send_webhook_notification(self, channel: NotificationChannel,
                               website: Website, alert: ChangeAlert):
        """
        Send webhook notification
        
        Sends webhook notification about detected changes.
        In production, this would make HTTP request to webhook URL.
        """
        # Simulate webhook notification
        logger.info(f"Webhook notification sent to {channel.config.get('url')}")
    
    def add_notification_channel(self, user_email: str, name: str, channel_type: str,
                               config: Dict[str, Any]) -> NotificationChannel:
        """
        Add a notification channel for a user
        
        Creates a new notification channel that can be used
        to send alerts about website changes.
        
        Args:
            user_email: Email of the user
            name: Human-readable name for the channel
            channel_type: Type of channel (email, slack, webhook)
            config: Channel-specific configuration
            
        Returns:
            Created NotificationChannel object
        """
        channel_id = f"channel_{uuid.uuid4().hex[:8]}"
        
        new_channel = NotificationChannel(
            id=channel_id,
            name=name,
            type=channel_type,
            config=config,
            owner_email=user_email
        )
        
        # Store channel
        self.notification_channels[channel_id] = new_channel
        
        logger.info(f"Added notification channel '{name}' ({channel_type}) for user {user_email}")
        return new_channel
    
    def get_website_history(self, website_id: str, limit: int = 50) -> List[Screenshot]:
        """
        Get screenshot history for a website
        
        Returns historical screenshots for a website,
        sorted by capture time (newest first).
        
        Args:
            website_id: ID of the website
            limit: Maximum number of screenshots to return
            
        Returns:
            List of Screenshot objects
        """
        website_screenshots = [
            screenshot for screenshot in self.screenshots.values()
            if screenshot.website_id == website_id
        ]
        
        # Sort by capture time (newest first)
        website_screenshots.sort(key=lambda x: x.capture_time, reverse=True)
        
        return website_screenshots[:limit]
    
    def compare_screenshots(self, screenshot1_id: str, screenshot2_id: str) -> Dict[str, Any]:
        """
        Compare two screenshots side-by-side
        
        Provides detailed comparison between two screenshots
        with visual difference analysis.
        
        Args:
            screenshot1_id: ID of first screenshot
            screenshot2_id: ID of second screenshot
            
        Returns:
            Comparison data with differences and metrics
        """
        if screenshot1_id not in self.screenshots:
            raise ValueError("Screenshot 1 not found")
        
        if screenshot2_id not in self.screenshots:
            raise ValueError("Screenshot 2 not found")
        
        screenshot1 = self.screenshots[screenshot1_id]
        screenshot2 = self.screenshots[screenshot2_id]
        
        # Calculate differences
        comparison = {
            "screenshot1": {
                "id": screenshot1.id,
                "capture_time": screenshot1.capture_time.isoformat(),
                "file_size": screenshot1.file_size,
                "load_time": screenshot1.load_time,
                "status_code": screenshot1.status_code
            },
            "screenshot2": {
                "id": screenshot2.id,
                "capture_time": screenshot2.capture_time.isoformat(),
                "file_size": screenshot2.file_size,
                "load_time": screenshot2.load_time,
                "status_code": screenshot2.status_code
            },
            "differences": {
                "time_diff": (screenshot2.capture_time - screenshot1.capture_time).total_seconds(),
                "size_diff": screenshot2.file_size - screenshot1.file_size,
                "load_time_diff": screenshot2.load_time - screenshot1.load_time,
                "hashes_different": screenshot1.image_hash != screenshot2.image_hash
            },
            "change_detection": self.detect_changes(screenshot2, screenshot1)
        }
        
        return comparison
    
    def start_monitoring(self):
        """
        Start the monitoring service
        
        Starts a background thread that periodically captures
        screenshots for all active websites.
        """
        if self.monitoring_active:
            logger.warning("Monitoring is already active")
            return
        
        self.monitoring_active = True
        self.monitoring_thread = threading.Thread(target=self._monitoring_loop, daemon=True)
        self.monitoring_thread.start()
        
        logger.info("Started website monitoring service")
    
    def stop_monitoring(self):
        """
        Stop the monitoring service
        
        Stops the background monitoring thread.
        """
        self.monitoring_active = False
        
        if self.monitoring_thread:
            self.monitoring_thread.join(timeout=5)
        
        logger.info("Stopped website monitoring service")
    
    def _monitoring_loop(self):
        """
        Background monitoring loop
        
        This method runs in a separate thread and periodically
        captures screenshots for active websites.
        """
        logger.info("Monitoring loop started")
        
        while self.monitoring_active:
            try:
                current_time = datetime.now()
                
                # Check each active website
                for website in self.websites.values():
                    if not website.is_active:
                        continue
                    
                    # Check if it's time to capture
                    if (website.last_capture is None or 
                        (current_time - website.last_capture).total_seconds() >= website.capture_interval * 60):
                        
                        logger.info(f"Time to capture {website.name} ({website.url})")
                        
                        # Get previous screenshot for comparison
                        previous_screenshots = self.get_website_history(website.id, limit=1)
                        previous_screenshot = previous_screenshots[0] if previous_screenshots else None
                        
                        # Capture new screenshot
                        current_screenshot = self.capture_screenshot(website.id)
                        
                        if current_screenshot and previous_screenshot:
                            # Detect changes
                            changes = self.detect_changes(current_screenshot, previous_screenshot)
                            
                            if changes["has_changes"]:
                                # Create change alert
                                self.create_change_alert(
                                    website_id=website.id,
                                    screenshot_id=current_screenshot.id,
                                    previous_screenshot_id=previous_screenshot.id,
                                    change_summary=changes["summary"],
                                    change_percentage=changes["change_percentage"]
                                )
                
                # Sleep for a minute before next check
                time.sleep(60)
                
            except Exception as e:
                logger.error(f"Error in monitoring loop: {e}")
                time.sleep(60)
    
    def get_user_analytics(self, user_email: str) -> Dict[str, Any]:
        """
        Get comprehensive analytics for a user
        
        Provides usage statistics, performance metrics,
        and insights about the user's website monitoring.
        
        Args:
            user_email: Email of the user
            
        Returns:
            Analytics data dictionary
        """
        if user_email not in self.users:
            raise ValueError("User not found")
        
        user = self.users[user_email]
        user_website_ids = self.user_websites.get(user_email, [])
        
        # Get user's websites
        user_websites = [self.websites[wid] for wid in user_website_ids if wid in self.websites]
        
        # Calculate statistics
        total_websites = len(user_websites)
        active_websites = len([w for w in user_websites if w.is_active])
        
        # Screenshot statistics
        total_screenshots = 0
        total_storage = 0
        recent_screenshots = 0
        
        for website_id in user_website_ids:
            website_screenshots = self.get_website_history(website_id)
            total_screenshots += len(website_screenshots)
            total_storage += sum(s.file_size for s in website_screenshots)
            
            # Count recent screenshots (last 7 days)
            week_ago = datetime.now() - timedelta(days=7)
            recent_screenshots += len([s for s in website_screenshots if s.capture_time >= week_ago])
        
        # Change alerts
        user_alerts = [a for a in self.change_alerts.values() 
                        for wid in user_website_ids if a.website_id == wid]
        total_alerts = len(user_alerts)
        unacknowledged_alerts = len([a for a in user_alerts if not a.acknowledged])
        
        # Performance metrics
        avg_load_time = 0
        if total_screenshots > 0:
            all_screenshots = [s for wid in user_website_ids for s in self.get_website_history(wid)]
            avg_load_time = sum(s.load_time for s in all_screenshots) / len(all_screenshots)
        
        analytics = {
            "user": {
                "email": user_email,
                "name": user.name,
                "plan": user.plan
            },
            "websites": {
                "total": total_websites,
                "active": active_websites,
                "inactive": total_websites - active_websites
            },
            "screenshots": {
                "total": total_screenshots,
                "recent": recent_screenshots,
                "storage_used_mb": round(total_storage / (1024 * 1024), 2),
                "avg_load_time": round(avg_load_time, 2)
            },
            "alerts": {
                "total": total_alerts,
                "unacknowledged": unacknowledged_alerts,
                "acknowledged": total_alerts - unacknowledged_alerts
            },
            "recent_activity": self._get_recent_monitoring_activity(user_email)
        }
        
        return analytics
    
    def _get_recent_monitoring_activity(self, user_email: str) -> List[Dict[str, Any]]:
        """Get recent monitoring activity for user"""
        # This would track recent captures, alerts, etc.
        # For now, return placeholder
        return [
            {
                "type": "screenshot_captured",
                "timestamp": datetime.now().isoformat(),
                "description": "Recent screenshot captured"
            }
        ]
    
    def handle_core_logic(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Handle screenshot tracker specific requests
        
        Routes requests to appropriate screenshot tracking functions.
        """
        action = data.get("action", "")
        
        try:
            if action == "add_website":
                result = self.add_website(
                    user_email=data["user_email"],
                    url=data["url"],
                    name=data["name"],
                    description=data["description"],
                    capture_interval=data.get("capture_interval", 60),
                    viewport_width=data.get("viewport_width", 1920),
                    viewport_height=data.get("viewport_height", 1080),
                    wait_time=data.get("wait_time", 5),
                    selector=data.get("selector", ""),
                    tags=data.get("tags", [])
                )
                return {"status": "success", "website": result.__dict__}
            
            elif action == "capture_screenshot":
                result = self.capture_screenshot(data["website_id"])
                return {"status": "success", "screenshot": result.__dict__ if result else None}
            
            elif action == "get_website_history":
                result = self.get_website_history(
                    data["website_id"],
                    limit=data.get("limit", 50)
                )
                return {"status": "success", "screenshots": [s.__dict__ for s in result]}
            
            elif action == "compare_screenshots":
                result = self.compare_screenshots(
                    data["screenshot1_id"],
                    data["screenshot2_id"]
                )
                return {"status": "success", "comparison": result}
            
            elif action == "add_notification_channel":
                result = self.add_notification_channel(
                    user_email=data["user_email"],
                    name=data["name"],
                    channel_type=data["type"],
                    config=data["config"]
                )
                return {"status": "success", "channel": result.__dict__}
            
            elif action == "start_monitoring":
                self.start_monitoring()
                return {"status": "success", "message": "Monitoring started"}
            
            elif action == "stop_monitoring":
                self.stop_monitoring()
                return {"status": "success", "message": "Monitoring stopped"}
            
            elif action == "get_analytics":
                result = self.get_user_analytics(data["user_email"])
                return {"status": "success", "analytics": result}
            
            else:
                return {"status": "error", "message": f"Unknown action: {action}"}
                
        except Exception as e:
            logger.error(f"Error handling action {action}: {e}")
            return {"status": "error", "message": str(e)}

def main():
    """
    Demo Screenshot Tracker
    
    This function demonstrates core functionality with sample data.
    """
    print("📸 Website Screenshot Change Tracker Demo")
    print("=" * 50)
    
    # Initialize tracker
    tracker = ScreenshotTracker()
    
    # Register a demo user
    try:
        user = tracker.register_user(
            email="monitor@example.com",
            name="Website Monitor",
            password="monitor123"
        )
        print(f"✅ Registered user: {user.name}")
        
        # Login user
        logged_in_user = tracker.login_user("monitor@example.com", "monitor123")
        if logged_in_user:
            print(f"✅ Logged in as: {logged_in_user.name}")
        
        # Add websites to monitor
        website1 = tracker.add_website(
            user_email="monitor@example.com",
            url="https://example.com",
            name="Example Homepage",
            description="Monitor the main example.com homepage for changes",
            capture_interval=30,  # 30 minutes
            viewport_width=1920,
            viewport_height=1080,
            tags=["homepage", "landing", "example"]
        )
        print(f"✅ Added website: {website1.name}")
        
        website2 = tracker.add_website(
            user_email="monitor@example.com",
            url="https://news.example.com",
            name="Example News",
            description="Monitor news section for breaking stories",
            capture_interval=15,  # 15 minutes
            viewport_width=1920,
            viewport_height=1080,
            tags=["news", "content", "updates"]
        )
        print(f"✅ Added website: {website2.name}")
        
        # Add notification channel
        email_channel = tracker.add_notification_channel(
            user_email="monitor@example.com",
            name="Email Notifications",
            channel_type="email",
            config={"email": "monitor@example.com"}
        )
        print(f"✅ Added notification channel: {email_channel.name}")
        
        # Link notification channel to websites
        website1.notification_channels = [email_channel.id]
        website2.notification_channels = [email_channel.id]
        
        # Capture initial screenshots
        screenshot1 = tracker.capture_screenshot(website1.id)
        if screenshot1:
            print(f"✅ Captured screenshot for {website1.name}: {screenshot1.file_size} bytes")
        
        screenshot2 = tracker.capture_screenshot(website2.id)
        if screenshot2:
            print(f"✅ Captured screenshot for {website2.name}: {screenshot2.file_size} bytes")
        
        # Wait a bit and capture again to simulate changes
        print("⏳ Waiting 3 seconds to simulate changes...")
        time.sleep(3)
        
        screenshot3 = tracker.capture_screenshot(website1.id)
        if screenshot3:
            print(f"✅ Captured second screenshot for {website1.name}")
        
        # Compare screenshots
        if screenshot1 and screenshot3:
            comparison = tracker.compare_screenshots(screenshot1.id, screenshot3.id)
            print(f"✅ Compared screenshots: {comparison['change_detection']['summary']}")
            
            # Create change alert if changes detected
            if comparison['change_detection']['has_changes']:
                alert = tracker.create_change_alert(
                    website_id=website1.id,
                    screenshot_id=screenshot3.id,
                    previous_screenshot_id=screenshot1.id,
                    change_summary=comparison['change_detection']['summary'],
                    change_percentage=comparison['change_detection']['change_percentage']
                )
                print(f"✅ Created change alert: {alert.change_summary}")
        
        # Get website history
        history = tracker.get_website_history(website1.id)
        print(f"✅ Website history: {len(history)} screenshots")
        
        # Start monitoring (briefly for demo)
        print("🚀 Starting monitoring service (5 seconds for demo)...")
        tracker.start_monitoring()
        time.sleep(5)
        tracker.stop_monitoring()
        
        # Get analytics
        analytics = tracker.get_user_analytics("monitor@example.com")
        print(f"✅ User analytics: {analytics['websites']['total']} websites, {analytics['screenshots']['total']} screenshots")
        
        print("\n🎉 Screenshot Tracker demo complete!")
        print(f"📊 Websites monitored: {analytics['websites']['total']}")
        print(f"📸 Screenshots captured: {analytics['screenshots']['total']}")
        print(f"💾 Storage used: {analytics['screenshots']['storage_used_mb']} MB")
        print(f"⚡ Average load time: {analytics['screenshots']['avg_load_time']}s")
        print(f"🚨 Change alerts: {analytics['alerts']['total']}")
        
    except Exception as e:
        logger.error(f"Demo failed: {e}")
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    main()
