#!/usr/bin/env python3
"""
Website UX Friction Scanner
==========================

A micro-SaaS tool that automatically scans websites for UX friction points
and provides actionable recommendations for improvement.

Features:
- Automated website scanning and analysis
- UX friction point detection
- Accessibility compliance checking
- Performance impact assessment
- Mobile usability analysis
- SEO impact evaluation
- Competitor UX comparison
- Detailed reporting and recommendations

Business Model:
- Free: 1 scan/month, basic analysis
- Basic: 10 scans/month, detailed reports ($9.99/month)
- Pro: 50 scans/month, competitor analysis ($29.99/month)

Target Users:
- Website owners and developers
- UX designers and researchers
- Digital marketing agencies
- E-commerce businesses
- Product managers

Technical Implementation:
- Web scraping and analysis
- UX heuristic evaluation
- Performance testing
- Accessibility checking
- Mobile responsiveness testing
- Report generation

Author: Your Name
Created: 2026-03-06
"""

import os
import sys
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, field
import uuid
import statistics
import random
from urllib.parse import urlparse

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

# Configure logging specifically for UX scanner
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - [UX] %(message)s',
    handlers=[
        logging.FileHandler('website_ux_scanner.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

@dataclass
class Website:
    """
    Website data structure
    
    Represents a website being analyzed for UX issues.
    
    Attributes:
        id: Unique identifier for the website
        url: Website URL
        domain: Domain name
        title: Website title
        description: Website description
        owner_email: Email of the website owner
        created_at: When website was added
        last_scanned: When website was last scanned
        scan_count: Number of times scanned
        is_active: Whether scanning is active
    """
    id: str
    url: str
    domain: str
    title: str
    description: str
    owner_email: str
    created_at: datetime = field(default_factory=datetime.now)
    last_scanned: Optional[datetime] = None
    scan_count: int = 0
    is_active: bool = True

@dataclass
class UXIssue:
    """
    UX issue data structure
    
    Represents a specific UX issue found during scanning.
    
    Attributes:
        id: Unique identifier for the issue
        website_id: ID of the website
        category: Issue category (navigation, content, performance, etc.)
        severity: Issue severity (low, medium, high, critical)
        title: Issue title
        description: Detailed issue description
        location: Where the issue was found
        recommendation: Recommended solution
        impact_score: Impact score (0-100)
        effort_score: Effort to fix (0-100)
        priority: Calculated priority
        created_at: When issue was identified
    """
    id: str
    website_id: str
    category: str
    severity: str
    title: str
    description: str
    location: str
    recommendation: str
    impact_score: float
    effort_score: float
    priority: float
    created_at: datetime = field(default_factory=datetime.now)

@dataclass
class UXScan:
    """
    UX scan data structure
    
    Represents a complete UX scan of a website.
    
    Attributes:
        id: Unique identifier for the scan
        website_id: ID of the website
        scan_date: When the scan was performed
        overall_score: Overall UX score (0-100)
        issues_found: List of issues found
        accessibility_score: Accessibility compliance score
        performance_score: Performance score
        mobile_score: Mobile usability score
        seo_score: SEO impact score
        scan_duration: How long the scan took
        recommendations: List of top recommendations
        created_at: When scan was created
    """
    id: str
    website_id: str
    scan_date: datetime
    overall_score: float
    issues_found: List[UXIssue]
    accessibility_score: float
    performance_score: float
    mobile_score: float
    seo_score: float
    scan_duration: int
    recommendations: List[str]
    created_at: datetime = field(default_factory=datetime.now)

@dataclass
class CompetitorAnalysis:
    """
    Competitor analysis data structure
    
    Represents UX analysis of competitor websites.
    
    Attributes:
        id: Unique identifier for the analysis
        website_id: ID of the original website
        competitor_url: Competitor website URL
        competitor_score: Competitor's UX score
        strengths: Competitor's UX strengths
        weaknesses: Competitor's UX weaknesses
        opportunities: Opportunities based on competitor analysis
        threats: Threats based on competitor analysis
        created_at: When analysis was performed
    """
    id: str
    website_id: str
    competitor_url: str
    competitor_score: float
    strengths: List[str]
    weaknesses: List[str]
    opportunities: List[str]
    threats: List[str]
    created_at: datetime = field(default_factory=datetime.now)

class WebsiteUXScanner(MicroSaaSApp):
    """
    Main Website UX Scanner application
    
    This class extends the base MicroSaaSApp with UX-specific
    functionality for website analysis and optimization.
    
    Key Features:
    - Automated website scanning
    - UX friction point detection
    - Accessibility compliance checking
    - Performance analysis
    - Mobile usability testing
    - Competitor analysis
    - Detailed reporting
    - Usage limits for freemium model
    """
    
    def __init__(self, config_file: str = "config.json"):
        """Initialize the Website UX Scanner"""
        super().__init__(config_file)
        
        # UX scanner specific data storage
        self.websites: Dict[str, Website] = {}  # website_id -> Website
        self.ux_issues: Dict[str, UXIssue] = {}  # issue_id -> UXIssue
        self.ux_scans: Dict[str, UXScan] = {}  # scan_id -> UXScan
        self.competitor_analyses: Dict[str, CompetitorAnalysis] = {}  # analysis_id -> CompetitorAnalysis
        
        # User website mapping
        self.user_websites: Dict[str, List[str]] = {}  # user_email -> [website_ids]
        
        # UX heuristics and checks
        self.ux_checks = self._initialize_ux_checks()
        
        # Severity weights
        self.severity_weights = {
            "low": 1,
            "medium": 2,
            "high": 3,
            "critical": 4
        }
        
        logger.info("Website UX Scanner initialized")
        logger.info(f"Loaded {len(self.ux_checks)} UX checks")
    
    def _initialize_ux_checks(self) -> Dict[str, List[Dict[str, Any]]]:
        """
        Initialize UX checks database
        
        Returns:
            Dictionary of UX checks by category
        """
        return {
            "navigation": [
                {
                    "check": "missing_navigation",
                    "title": "Missing Navigation Menu",
                    "description": "Website lacks clear navigation menu",
                    "recommendation": "Add a clear, consistent navigation menu",
                    "impact": 80,
                    "effort": 40
                },
                {
                    "check": "confusing_structure",
                    "title": "Confusing Navigation Structure",
                    "description": "Navigation hierarchy is unclear or inconsistent",
                    "recommendation": "Simplify navigation structure and use clear labels",
                    "impact": 60,
                    "effort": 60
                }
            ],
            "content": [
                {
                    "check": "missing_cta",
                    "title": "Missing Call-to-Action",
                    "description": "Website lacks clear call-to-action buttons",
                    "recommendation": "Add prominent and clear CTAs",
                    "impact": 70,
                    "effort": 30
                },
                {
                    "check": "poor_readability",
                    "title": "Poor Text Readability",
                    "description": "Text is difficult to read due to font size or contrast",
                    "recommendation": "Improve font size and color contrast",
                    "impact": 65,
                    "effort": 20
                }
            ],
            "performance": [
                {
                    "check": "slow_loading",
                    "title": "Slow Page Loading",
                    "description": "Website takes too long to load",
                    "recommendation": "Optimize images and reduce file sizes",
                    "impact": 85,
                    "effort": 70
                },
                {
                    "check": "large_images",
                    "title": "Unoptimized Images",
                    "description": "Images are not optimized for web",
                    "recommendation": "Compress images and use appropriate formats",
                    "impact": 60,
                    "effort": 50
                }
            ],
            "mobile": [
                {
                    "check": "not_responsive",
                    "title": "Not Mobile Responsive",
                    "description": "Website doesn't work well on mobile devices",
                    "recommendation": "Implement responsive design",
                    "impact": 90,
                    "effort": 80
                },
                {
                    "check": "small_touch_targets",
                    "title": "Small Touch Targets",
                    "description": "Buttons and links are too small for mobile",
                    "recommendation": "Increase touch target size to at least 44px",
                    "impact": 70,
                    "effort": 40
                }
            ],
            "accessibility": [
                {
                    "check": "missing_alt_text",
                    "title": "Missing Alt Text",
                    "description": "Images lack alt text for screen readers",
                    "recommendation": "Add descriptive alt text to all images",
                    "impact": 50,
                    "effort": 30
                },
                {
                    "check": "poor_color_contrast",
                    "title": "Poor Color Contrast",
                    "description": "Text and background colors don't have enough contrast",
                    "recommendation": "Increase color contrast to meet WCAG standards",
                    "impact": 60,
                    "effort": 25
                }
            ]
        }
    
    def add_website(self, user_email: str, url: str, title: str = "", 
                    description: str = "") -> Website:
        """
        Add a website for UX scanning
        
        Args:
            user_email: Email of the user
            url: Website URL
            title: Website title
            description: Website description
            
        Returns:
            Created Website object
        """
        # Check user limits
        if user_email not in self.users:
            raise ValueError("User not found. Please register first.")
        
        user = self.users[user_email]
        user_websites = self.user_websites.get(user_email, [])
        scan_limit = self.get_scan_limit(user.plan)
        
        # Count scans in last month
        month_ago = datetime.now() - timedelta(days=30)
        recent_scans = sum(website.scan_count for website_id in user_websites 
                           if website_id in self.websites 
                           and self.websites[website_id].last_scanned
                           and self.websites[website_id].last_scanned >= month_ago)
        
        if recent_scans >= scan_limit:
            raise ValueError(f"Monthly scan limit reached ({scan_limit}). Upgrade your plan for more scans.")
        
        # Validate URL
        parsed_url = urlparse(url)
        if not parsed_url.scheme or not parsed_url.netloc:
            raise ValueError("Invalid URL format")
        
        # Create website
        website_id = f"website_{uuid.uuid4().hex[:8]}"
        domain = parsed_url.netloc
        
        new_website = Website(
            id=website_id,
            url=url,
            domain=domain,
            title=title or domain,
            description=description,
            owner_email=user_email
        )
        
        # Store website
        self.websites[website_id] = new_website
        
        # Link to user
        if user_email not in self.user_websites:
            self.user_websites[user_email] = []
        self.user_websites[user_email].append(website_id)
        
        logger.info(f"Added website {url} for user {user_email}")
        return new_website
    
    def get_scan_limit(self, plan: str) -> int:
        """
        Get scan limit based on user plan
        
        Args:
            plan: User's subscription plan
            
        Returns:
            Maximum number of scans per month
        """
        limits = {
            "free": 1,
            "basic": 10,
            "pro": 50,
            "enterprise": 200
        }
        return limits.get(plan, 1)
    
    def scan_website(self, website_id: str) -> UXScan:
        """
        Perform comprehensive UX scan of a website
        
        Args:
            website_id: ID of the website to scan
            
        Returns:
            UXScan results
        """
        if website_id not in self.websites:
            raise ValueError("Website not found")
        
        website = self.websites[website_id]
        
        # Simulate website scanning
        # In production, you'd use web scraping and actual testing
        scan_start = datetime.now()
        
        # Detect UX issues
        detected_issues = self._detect_ux_issues(website)
        
        # Calculate scores
        overall_score = self._calculate_overall_score(detected_issues)
        accessibility_score = self._calculate_category_score(detected_issues, "accessibility")
        performance_score = self._calculate_category_score(detected_issues, "performance")
        mobile_score = self._calculate_category_score(detected_issues, "mobile")
        seo_score = self._calculate_seo_score(website)
        
        # Generate recommendations
        recommendations = self._generate_recommendations(detected_issues)
        
        # Calculate scan duration
        scan_duration = int((datetime.now() - scan_start).total_seconds())
        
        # Create scan
        scan_id = f"scan_{uuid.uuid4().hex[:8]}"
        new_scan = UXScan(
            id=scan_id,
            website_id=website_id,
            scan_date=datetime.now(),
            overall_score=overall_score,
            issues_found=detected_issues,
            accessibility_score=accessibility_score,
            performance_score=performance_score,
            mobile_score=mobile_score,
            seo_score=seo_score,
            scan_duration=scan_duration,
            recommendations=recommendations
        )
        
        # Store scan
        self.ux_scans[scan_id] = new_scan
        
        # Update website
        website.last_scanned = datetime.now()
        website.scan_count += 1
        
        # Store issues
        for issue in detected_issues:
            self.ux_issues[issue.id] = issue
        
        logger.info(f"Scanned website {website_id} - Score: {overall_score:.1f}")
        return new_scan
    
    def _detect_ux_issues(self, website: Website) -> List[UXIssue]:
        """
        Detect UX issues for a website
        
        Args:
            website: Website to analyze
            
        Returns:
            List of detected UX issues
        """
        issues = []
        
        # Simulate issue detection based on random factors
        # In production, you'd analyze actual website data
        
        for category, checks in self.ux_checks.items():
            for check in checks:
                # Simulate detection (30% chance for each check)
                if random.random() < 0.3:
                    issue_id = f"issue_{uuid.uuid4().hex[:8]}"
                    
                    # Determine severity
                    severity = self._determine_severity(check, website)
                    
                    # Calculate priority
                    impact_score = check["impact"]
                    effort_score = check["effort"]
                    priority = (impact_score * self.severity_weights[severity]) / effort_score
                    
                    issue = UXIssue(
                        id=issue_id,
                        website_id=website.id,
                        category=category,
                        severity=severity,
                        title=check["title"],
                        description=check["description"],
                        location=f"{website.url} - {category}",
                        recommendation=check["recommendation"],
                        impact_score=impact_score,
                        effort_score=effort_score,
                        priority=priority
                    )
                    
                    issues.append(issue)
        
        return issues
    
    def _determine_severity(self, check: Dict[str, Any], website: Website) -> str:
        """
        Determine severity of an issue
        
        Args:
            check: UX check data
            website: Website context
            
        Returns:
            Severity level
        """
        # Simulate severity based on impact and random factors
        impact = check["impact"]
        
        if impact >= 85:
            return "critical"
        elif impact >= 70:
            return "high" if random.random() < 0.7 else "medium"
        elif impact >= 60:
            return "medium" if random.random() < 0.6 else "low"
        else:
            return "low"
    
    def _calculate_overall_score(self, issues: List[UXIssue]) -> float:
        """
        Calculate overall UX score
        
        Args:
            issues: List of detected issues
            
        Returns:
            Overall score (0-100)
        """
        if not issues:
            return 100.0
        
        # Calculate penalty based on issues
        total_penalty = 0
        for issue in issues:
            weight = self.severity_weights[issue.severity]
            total_penalty += weight * 10  # Each issue reduces score by weight * 10
        
        # Calculate score
        score = max(0, 100 - total_penalty)
        
        return round(score, 1)
    
    def _calculate_category_score(self, issues: List[UXIssue], category: str) -> float:
        """
        Calculate score for a specific category
        
        Args:
            issues: List of detected issues
            category: Category to score
            
        Returns:
            Category score (0-100)
        """
        category_issues = [issue for issue in issues if issue.category == category]
        
        if not category_issues:
            return 100.0
        
        # Calculate penalty
        total_penalty = sum(self.severity_weights[issue.severity] * 10 for issue in category_issues)
        score = max(0, 100 - total_penalty)
        
        return round(score, 1)
    
    def _calculate_seo_score(self, website: Website) -> float:
        """
        Calculate SEO impact score
        
        Args:
            website: Website to analyze
            
        Returns:
            SEO score (0-100)
        """
        # Simulate SEO analysis
        score = 70.0  # Base score
        
        # Add points for having a title
        if website.title and website.title != website.domain:
            score += 10
        
        # Add points for having a description
        if website.description:
            score += 10
        
        # Add points for having keywords in title/description
        if website.title and "website" in website.title.lower():
            score += 5
        
        if website.description and "website" in website.description.lower():
            score += 5
        
        return min(100, round(score, 1))
    
    def _generate_recommendations(self, issues: List[UXIssue]) -> List[str]:
        """
        Generate top recommendations
        
        Args:
            issues: List of detected issues
            
        Returns:
            List of recommendations
        """
        # Sort issues by priority
        sorted_issues = sorted(issues, key=lambda x: x.priority, reverse=True)
        
        # Get top 5 recommendations
        recommendations = []
        for issue in sorted_issues[:5]:
            recommendations.append(f"{issue.title}: {issue.recommendation}")
        
        return recommendations
    
    def analyze_competitors(self, website_id: str, competitor_urls: List[str]) -> List[CompetitorAnalysis]:
        """
        Analyze competitor websites
        
        Args:
            website_id: ID of the original website
            competitor_urls: List of competitor URLs
            
        Returns:
            List of competitor analyses
        """
        if website_id not in self.websites:
            raise ValueError("Website not found")
        
        analyses = []
        
        for competitor_url in competitor_urls:
            # Simulate competitor analysis
            competitor_score = 65 + random.random() * 30  # Random score between 65-95
            
            # Generate strengths and weaknesses
            strengths = [
                "Clean navigation structure",
                "Fast loading times",
                "Mobile-responsive design",
                "Clear call-to-actions"
            ]
            
            weaknesses = [
                "Outdated design",
                "Poor color contrast",
                "Missing accessibility features",
                "Complex navigation"
            ]
            
            # Randomly select strengths and weaknesses
            selected_strengths = random.sample(strengths, min(2, len(strengths)))
            selected_weaknesses = random.sample(weaknesses, min(2, len(weaknesses)))
            
            # Generate opportunities and threats
            opportunities = [
                "Improve mobile experience",
                "Add more engaging content",
                "Optimize for search engines",
                "Enhance accessibility"
            ]
            
            threats = [
                "Competitor has better UX",
                "Competitor ranks higher in search",
                "Competitor has more features",
                "Competitor has stronger brand"
            ]
            
            analysis_id = f"analysis_{uuid.uuid4().hex[:8]}"
            analysis = CompetitorAnalysis(
                id=analysis_id,
                website_id=website_id,
                competitor_url=competitor_url,
                competitor_score=competitor_score,
                strengths=selected_strengths,
                weaknesses=selected_weaknesses,
                opportunities=random.sample(opportunities, 2),
                threats=random.sample(threats, 2)
            )
            
            analyses.append(analysis)
            self.competitor_analyses[analysis_id] = analysis
        
        logger.info(f"Analyzed {len(competitor_urls)} competitors for website {website_id}")
        return analyses
    
    def export_scan_report(self, scan_id: str, format: str = "html") -> str:
        """
        Export scan report in various formats
        
        Args:
            scan_id: ID of the scan
            format: Export format (html, pdf, json)
            
        Returns:
            Exported report data
        """
        if scan_id not in self.ux_scans:
            raise ValueError("Scan not found")
        
        scan = self.ux_scans[scan_id]
        website = self.websites[scan.website_id]
        
        if format.lower() == "json":
            import json
            
            report_data = {
                "website": {
                    "url": website.url,
                    "title": website.title,
                    "domain": website.domain
                },
                "scan": {
                    "date": scan.scan_date.isoformat(),
                    "overall_score": scan.overall_score,
                    "accessibility_score": scan.accessibility_score,
                    "performance_score": scan.performance_score,
                    "mobile_score": scan.mobile_score,
                    "seo_score": scan.seo_score
                },
                "issues": [
                    {
                        "category": issue.category,
                        "severity": issue.severity,
                        "title": issue.title,
                        "description": issue.description,
                        "recommendation": issue.recommendation,
                        "priority": round(issue.priority, 2)
                    }
                    for issue in scan.issues_found
                ],
                "recommendations": scan.recommendations,
                "export_date": datetime.now().isoformat()
            }
            
            return json.dumps(report_data, indent=2)
        
        elif format.lower() == "html":
            html_content = f"""
<!DOCTYPE html>
<html>
<head>
    <title>UX Scan Report - {website.title}</title>
    <style>
        body {{ font-family: Arial, sans-serif; margin: 40px; }}
        .header {{ border-bottom: 2px solid #333; padding-bottom: 20px; }}
        .score {{ font-size: 48px; font-weight: bold; color: #333; }}
        .score.good {{ color: #28a745; }}
        .score.warning {{ color: #ffc107; }}
        .score.danger {{ color: #dc3545; }}
        .section {{ margin: 30px 0; }}
        .issue {{ background: #f8f9fa; padding: 15px; margin: 10px 0; border-left: 4px solid #007bff; }}
        .issue.critical {{ border-left-color: #dc3545; }}
        .issue.high {{ border-left-color: #fd7e14; }}
        .issue.medium {{ border-left-color: #ffc107; }}
        .issue.low {{ border-left-color: #28a745; }}
        .metrics {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; }}
        .metric {{ text-align: center; padding: 20px; background: #f8f9fa; border-radius: 8px; }}
        .metric-value {{ font-size: 24px; font-weight: bold; }}
    </style>
</head>
<body>
    <div class="header">
        <h1>UX Scan Report</h1>
        <p><strong>Website:</strong> {website.title}</p>
        <p><strong>URL:</strong> {website.url}</p>
        <p><strong>Scan Date:</strong> {scan.scan_date.strftime('%Y-%m-%d %H:%M')}</p>
        <div class="score {self._get_score_class(scan.overall_score)}">{scan.overall_score:.1f}</div>
    </div>
    
    <div class="section">
        <h2>Performance Metrics</h2>
        <div class="metrics">
            <div class="metric">
                <div class="metric-value">{scan.accessibility_score:.1f}</div>
                <div>Accessibility</div>
            </div>
            <div class="metric">
                <div class="metric-value">{scan.performance_score:.1f}</div>
                <div>Performance</div>
            </div>
            <div class="metric">
                <div class="metric-value">{scan.mobile_score:.1f}</div>
                <div>Mobile</div>
            </div>
            <div class="metric">
                <div class="metric-value">{scan.seo_score:.1f}</div>
                <div>SEO</div>
            </div>
        </div>
    </div>
    
    <div class="section">
        <h2>Issues Found ({len(scan.issues_found)})</h2>
        {''.join([f'<div class="issue {issue.severity}"><h3>{issue.title}</h3><p><strong>Severity:</strong> {issue.severity.title()}</p><p><strong>Description:</strong> {issue.description}</p><p><strong>Recommendation:</strong> {issue.recommendation}</p></div>' for issue in scan.issues_found])}
    </div>
    
    <div class="section">
        <h2>Top Recommendations</h2>
        <ol>
            {''.join([f'<li>{rec}</li>' for rec in scan.recommendations])}
        </ol>
    </div>
</body>
</html>
"""
            return html_content
        
        else:
            raise ValueError(f"Unsupported export format: {format}")
    
    def _get_score_class(self, score: float) -> str:
        """Get CSS class for score display"""
        if score >= 80:
            return "good"
        elif score >= 60:
            return "warning"
        else:
            return "danger"
    
    def get_user_analytics(self, user_email: str) -> Dict[str, Any]:
        """
        Get comprehensive analytics for a user
        
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
        
        # Get user's scans
        user_scans = []
        for website_id in user_website_ids:
            website_scans = [s for s in self.ux_scans.values() if s.website_id == website_id]
            user_scans.extend(website_scans)
        
        # Calculate statistics
        total_websites = len(user_websites)
        total_scans = len(user_scans)
        
        if user_scans:
            avg_score = sum(s.overall_score for s in user_scans) / len(user_scans)
            avg_accessibility = sum(s.accessibility_score for s in user_scans) / len(user_scans)
            avg_performance = sum(s.performance_score for s in user_scans) / len(user_scans)
            avg_mobile = sum(s.mobile_score for s in user_scans) / len(user_scans)
        else:
            avg_score = avg_accessibility = avg_performance = avg_mobile = 0
        
        # Issue statistics
        all_issues = []
        for scan in user_scans:
            all_issues.extend(scan.issues_found)
        
        issue_by_severity = {
            "low": len([i for i in all_issues if i.severity == "low"]),
            "medium": len([i for i in all_issues if i.severity == "medium"]),
            "high": len([i for i in all_issues if i.severity == "high"]),
            "critical": len([i for i in all_issues if i.severity == "critical"])
        }
        
        issue_by_category = {}
        for issue in all_issues:
            issue_by_category[issue.category] = issue_by_category.get(issue.category, 0) + 1
        
        # Recent activity (last 30 days)
        month_ago = datetime.now() - timedelta(days=30)
        recent_scans = [s for s in user_scans if s.scan_date >= month_ago]
        
        analytics = {
            "user": {
                "email": user_email,
                "name": user.name,
                "plan": user.plan
            },
            "websites": {
                "total": total_websites,
                "active": len([w for w in user_websites if w.is_active])
            },
            "scans": {
                "total": total_scans,
                "recent": len(recent_scans),
                "average_score": round(avg_score, 2),
                "average_accessibility": round(avg_accessibility, 2),
                "average_performance": round(avg_performance, 2),
                "average_mobile": round(avg_mobile, 2)
            },
            "issues": {
                "total": len(all_issues),
                "by_severity": issue_by_severity,
                "by_category": issue_by_category
            },
            "recent_activity": self._get_recent_activity(user_email)
        }
        
        return analytics
    
    def _get_recent_activity(self, user_email: str) -> List[Dict[str, Any]]:
        """Get recent activity for user"""
        user_website_ids = self.user_websites.get(user_email, [])
        recent_activity = []
        
        # Recent scans
        for website_id in user_website_ids:
            website_scans = [s for s in self.ux_scans.values() if s.website_id == website_id]
            recent_scans = sorted(website_scans, key=lambda s: s.scan_date, reverse=True)[:3]
            
            for scan in recent_scans:
                website = self.websites[website_id]
                recent_activity.append({
                    "type": "website_scan",
                    "website": website.title,
                    "url": website.url,
                    "score": scan.overall_score,
                    "issues": len(scan.issues_found),
                    "date": scan.scan_date.isoformat()
                })
        
        return sorted(recent_activity, key=lambda x: x["date"], reverse=True)[:10]
    
    def handle_core_logic(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Handle UX scanner specific requests
        
        Routes requests to appropriate UX functions.
        """
        action = data.get("action", "")
        
        try:
            if action == "add_website":
                result = self.add_website(
                    user_email=data["user_email"],
                    url=data["url"],
                    title=data.get("title", ""),
                    description=data.get("description", "")
                )
                return {"status": "success", "website": result.__dict__}
            
            elif action == "scan_website":
                result = self.scan_website(data["website_id"])
                return {"status": "success", "scan": result.__dict__}
            
            elif action == "analyze_competitors":
                result = self.analyze_competitors(
                    website_id=data["website_id"],
                    competitor_urls=data["competitor_urls"]
                )
                return {"status": "success", "analyses": [a.__dict__ for a in result]}
            
            elif action == "export_report":
                export_data = self.export_scan_report(
                    scan_id=data["scan_id"],
                    format=data.get("format", "html")
                )
                return {"status": "success", "export": export_data}
            
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
    Demo Website UX Scanner
    
    This function demonstrates core functionality with sample data.
    """
    print("🌐 Website UX Friction Scanner Demo")
    print("=" * 50)
    
    # Initialize scanner
    scanner = WebsiteUXScanner()
    
    # Register a demo user
    try:
        user = scanner.register_user(
            email="webmaster@example.com",
            name="Web Developer",
            password="ux123"
        )
        print(f"✅ Registered user: {user.name}")
        
        # Login user
        logged_in_user = scanner.login_user("webmaster@example.com", "ux123")
        if logged_in_user:
            print(f"✅ Logged in as: {logged_in_user.name}")
        
        # Add a website
        website = scanner.add_website(
            user_email="webmaster@example.com",
            url="https://example.com",
            title="Example Website",
            description="A sample website for UX analysis"
        )
        print(f"✅ Added website: {website.title}")
        
        # Scan the website
        scan = scanner.scan_website(website.id)
        print(f"✅ Scanned website: Score {scan.overall_score:.1f}/100")
        
        # Display scan results
        print(f"\n📊 UX Scan Results:")
        print(f"  Overall Score: {scan.overall_score:.1f}/100")
        print(f"  Accessibility: {scan.accessibility_score:.1f}/100")
        print(f"  Performance: {scan.performance_score:.1f}/100")
        print(f"  Mobile: {scan.mobile_score:.1f}/100")
        print(f"  SEO: {scan.seo_score:.1f}/100")
        print(f"  Issues Found: {len(scan.issues_found)}")
        print(f"  Scan Duration: {scan.scan_duration} seconds")
        
        # Display issues
        if scan.issues_found:
            print(f"\n⚠️  Issues Found:")
            for i, issue in enumerate(scan.issues_found, 1):
                print(f"  {i}. [{issue.severity.upper()}] {issue.title}")
                print(f"     {issue.description}")
                print(f"     💡 {issue.recommendation}")
        
        # Display recommendations
        print(f"\n💡 Top Recommendations:")
        for i, rec in enumerate(scan.recommendations, 1):
            print(f"  {i}. {rec}")
        
        # Analyze competitors
        competitors = scanner.analyze_competitors(
            website.id,
            ["https://competitor1.com", "https://competitor2.com"]
        )
        print(f"✅ Analyzed {len(competitors)} competitors")
        
        # Display competitor insights
        print(f"\n🏆 Competitor Analysis:")
        for comp in competitors:
            print(f"  {comp.competitor_url}: {comp.competitor_score:.1f}/100")
            print(f"    Strengths: {', '.join(comp.strengths)}")
            print(f"    Weaknesses: {', '.join(comp.weaknesses)}")
        
        # Export report
        html_report = scanner.export_scan_report(scan.id, "html")
        print(f"✅ Exported HTML report ({len(html_report)} characters)")
        
        # Get user analytics
        analytics = scanner.get_user_analytics("webmaster@example.com")
        print(f"✅ User analytics: {analytics['websites']['total']} websites, {analytics['scans']['total']} scans")
        
        print("\n🎉 Website UX Friction Scanner demo complete!")
        print(f"🌐 Websites scanned: {analytics['websites']['total']}")
        print(f"🔍 Total scans: {analytics['scans']['total']}")
        print(f"📊 Average UX score: {analytics['scans']['average_score']:.1f}/100")
        print(f"⚠️  Total issues found: {analytics['issues']['total']}")
        print(f"📱 Average mobile score: {analytics['scans']['average_mobile']:.1f}/100")
        print(f"♿ Average accessibility: {analytics['scans']['average_accessibility']:.1f}/100")
        print(f"⚡ Average performance: {analytics['scans']['average_performance']:.1f}/100")
        
    except Exception as e:
        logger.error(f"Demo failed: {e}")
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    main()
