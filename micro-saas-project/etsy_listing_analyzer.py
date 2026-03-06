#!/usr/bin/env python3
"""
Etsy Listing Analyzer
====================

A micro-SaaS tool that analyzes Etsy listings to help sellers optimize
their SEO, pricing, and competitive positioning.

Features:
- Listing SEO analysis and scoring
- Keyword research and recommendations
- Competitor analysis and comparison
- Pricing optimization insights
- Title and description optimization
- Tag performance analysis
- Trending keywords in niche
- Listing performance tracking
- Export capabilities for reports

Business Model:
- Free: 5 listings/month, basic analysis
- Basic: 50 listings/month, competitor analysis ($9.99/month)
- Pro: 500 listings/month, trending keywords ($29.99/month)

Target Users:
- Etsy sellers optimizing listings
- Etsy marketing agencies
- E-commerce consultants
- Product researchers
- Competitor monitoring teams

Technical Implementation:
- Web scraping for Etsy data
- SEO analysis algorithms
- Keyword research tools
- Competitor tracking
- Performance metrics calculation
- Data visualization and reporting

Author: Your Name
Created: 2026-03-06
"""

import sys
import json
import logging
import re
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, field
import uuid
import statistics
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

# Configure logging specifically for Etsy analysis
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - [ETSY] %(message)s',
    handlers=[
        logging.FileHandler('etsy_analyzer.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

@dataclass
class EtsyListing:
    """
    Etsy listing data structure
    
    Represents an Etsy listing with all relevant data for analysis
    including SEO metrics, performance indicators, and competitive data.
    
    Attributes:
        id: Unique identifier for the listing
        etsy_id: Original Etsy listing ID
        title: Listing title
        description: Listing description
        tags: List of listing tags
        price: Listing price
        category: Product category
        shop_name: Shop name
        shop_id: Shop ID
        views: Number of views
        favorites: Number of favorites
        sales: Number of sales
        rating: Shop rating
        created_date: When listing was created
        last_updated: When listing was last updated
        shipping_info: Shipping details
        variations: Product variations
        photos: Photo information
        seo_score: Calculated SEO score
        keywords: Extracted keywords
        competitor_data: Competitor analysis data
        created_at: When record was created
        owner_email: Email of the user who analyzed it
    """
    id: str
    etsy_id: str
    title: str
    description: str
    tags: List[str]
    price: float
    category: str
    shop_name: str
    shop_id: str
    views: int = 0
    favorites: int = 0
    sales: int = 0
    rating: float = 0.0
    created_date: Optional[datetime] = None
    last_updated: Optional[datetime] = None
    shipping_info: Dict[str, Any] = field(default_factory=dict)
    variations: List[Dict[str, Any]] = field(default_factory=list)
    photos: List[Dict[str, Any]] = field(default_factory=list)
    seo_score: float = 0.0
    keywords: List[str] = field(default_factory=list)
    competitor_data: Dict[str, Any] = field(default_factory=dict)
    created_at: datetime = field(default_factory=datetime.now)
    owner_email: str = ""

@dataclass
class SEOAnalysis:
    """
    SEO analysis results for an Etsy listing
    
    Contains detailed SEO metrics, recommendations, and
    competitive analysis results.
    
    Attributes:
        listing_id: ID of the analyzed listing
        overall_score: Overall SEO score (0-100)
        title_analysis: Title-specific analysis
        description_analysis: Description-specific analysis
        tags_analysis: Tags-specific analysis
        keyword_analysis: Keyword analysis results
        competitor_analysis: Competitor comparison
        recommendations: List of actionable recommendations
        missing_keywords: Keywords that should be added
        overused_keywords: Keywords that are overused
        trending_keywords: Trending keywords in the niche
        created_at: When analysis was performed
    """
    listing_id: str
    overall_score: float
    title_analysis: Dict[str, Any] = field(default_factory=dict)
    description_analysis: Dict[str, Any] = field(default_factory=dict)
    tags_analysis: Dict[str, Any] = field(default_factory=dict)
    keyword_analysis: Dict[str, Any] = field(default_factory=dict)
    competitor_analysis: Dict[str, Any] = field(default_factory=dict)
    recommendations: List[str] = field(default_factory=list)
    missing_keywords: List[str] = field(default_factory=list)
    overused_keywords: List[str] = field(default_factory=list)
    trending_keywords: List[str] = field(default_factory=list)
    created_at: datetime = field(default_factory=datetime.now)

@dataclass
class CompetitorListing:
    """
    Competitor listing data for comparison
    
    Represents a competitor's listing with performance metrics
    and SEO analysis for competitive positioning.
    
    Attributes:
        etsy_id: Etsy listing ID
        title: Listing title
        price: Listing price
        views: Number of views
        favorites: Number of favorites
        sales: Number of sales
        tags: Listing tags
        seo_score: Calculated SEO score
        price_position: Price ranking among competitors
        performance_score: Overall performance score
        strengths: Competitive strengths
        weaknesses: Competitive weaknesses
        created_at: When data was collected
    """
    etsy_id: str
    title: str
    price: float
    views: int
    favorites: int
    sales: int
    tags: List[str]
    seo_score: float
    price_position: int
    performance_score: float
    strengths: List[str] = field(default_factory=list)
    weaknesses: List[str] = field(default_factory=list)
    created_at: datetime = field(default_factory=datetime.now)

class EtsyListingAnalyzer(MicroSaaSApp):
    """
    Main Etsy Listing Analyzer application
    
    This class extends the base MicroSaaSApp with Etsy-specific
    functionality for analyzing listings, SEO optimization, and
    competitive analysis.
    
    Key Features:
    - Etsy listing scraping and data extraction
    - SEO analysis and scoring algorithms
    - Keyword research and optimization
    - Competitor analysis and comparison
    - Pricing optimization insights
    - Trend analysis and recommendations
    - Usage limits for freemium model
    """
    
    def __init__(self, config_file: str = "config.json"):
        """Initialize the Etsy Listing Analyzer"""
        super().__init__(config_file)
        
        # Etsy analyzer specific data storage
        self.listings: Dict[str, EtsyListing] = {}  # listing_id -> EtsyListing
        self.seo_analyses: Dict[str, SEOAnalysis] = {}  # analysis_id -> SEOAnalysis
        self.competitor_listings: Dict[str, List[CompetitorListing]] = {}  # listing_id -> [competitors]
        
        # User listing mapping
        self.user_listings: Dict[str, List[str]] = {}  # user_email -> [listing_ids]
        
        # SEO analysis data
        self.stop_words = {
            'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
            'by', 'from', 'up', 'about', 'into', 'through', 'during', 'before', 'after', 'above',
            'below', 'between', 'among', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
            'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should',
            'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he',
            'she', 'it', 'we', 'they', 'what', 'which', 'who', 'when', 'where', 'why', 'how'
        }
        
        # High-value Etsy keywords
        self.high_value_keywords = {
            'handmade', 'vintage', 'custom', 'personalized', 'gift', 'unique', 'artisan',
            'craft', 'boho', 'rustic', 'modern', 'minimalist', 'eco-friendly', 'sustainable',
            'organic', 'natural', 'home', 'decor', 'wedding', 'birthday', 'christmas', 'halloween'
        }
        
        logger.info("Etsy Listing Analyzer initialized")
        logger.info(f"Loaded {len(self.listings)} listings")
    
    def analyze_etsy_url(self, user_email: str, etsy_url: str) -> SEOAnalysis:
        """
        Analyze an Etsy listing from URL
        
        This is the main entry point for analyzing Etsy listings.
        It scrapes the listing data and performs comprehensive SEO analysis.
        
        Args:
            user_email: Email of the user requesting analysis
            etsy_url: URL of the Etsy listing to analyze
            
        Returns:
            SEOAnalysis results
        """
        # Check user limits
        if user_email not in self.users:
            raise ValueError("User not found. Please register first.")
        
        user = self.users[user_email]
        user_listings = self.user_listings.get(user_email, [])
        analysis_limit = self.get_analysis_limit(user.plan)
        
        # Count analyses in last month
        month_ago = datetime.now() - timedelta(days=30)
        recent_analyses = len([listing_id for listing_id in user_listings 
                             if listing_id in self.listings 
                             and self.listings[listing_id].created_at >= month_ago])
        
        if recent_analyses >= analysis_limit:
            raise ValueError(f"Monthly analysis limit reached ({analysis_limit}). Upgrade your plan for more analyses.")
        
        # Validate Etsy URL
        if not self._is_valid_etsy_url(etsy_url):
            raise ValueError("Invalid Etsy URL. Please provide a valid Etsy listing URL.")
        
        # Extract listing ID from URL
        etsy_id = self._extract_etsy_id_from_url(etsy_url)
        
        # Scrape listing data
        listing_data = self._scrape_etsy_listing(etsy_id)
        
        # Create listing object
        listing = EtsyListing(
            id=f"listing_{uuid.uuid4().hex[:8]}",
            etsy_id=etsy_id,
            title=listing_data["title"],
            description=listing_data["description"],
            tags=listing_data["tags"],
            price=listing_data["price"],
            category=listing_data["category"],
            shop_name=listing_data["shop_name"],
            shop_id=listing_data["shop_id"],
            views=listing_data["views"],
            favorites=listing_data["favorites"],
            sales=listing_data["sales"],
            rating=listing_data["rating"],
            owner_email=user_email
        )
        
        # Store listing
        self.listings[listing.id] = listing
        
        # Link to user
        if user_email not in self.user_listings:
            self.user_listings[user_email] = []
        self.user_listings[user_email].append(listing.id)
        
        # Perform SEO analysis
        analysis = self._perform_seo_analysis(listing)
        
        # Store analysis
        self.seo_analyses[analysis.listing_id] = analysis
        
        # Find competitors
        competitors = self._find_competitors(listing)
        self.competitor_listings[listing.id] = competitors
        
        logger.info(f"Analyzed Etsy listing {etsy_id} for user {user_email}")
        return analysis
    
    def get_analysis_limit(self, plan: str) -> int:
        """
        Get analysis limit based on user plan
        
        Args:
            plan: User's subscription plan
            
        Returns:
            Maximum number of analyses per month
        """
        limits = {
            "free": 5,
            "basic": 50,
            "pro": 500,
            "enterprise": 5000
        }
        return limits.get(plan, 5)
    
    def _is_valid_etsy_url(self, url: str) -> bool:
        """
        Validate if URL is a valid Etsy listing URL
        
        Args:
            url: URL to validate
            
        Returns:
            True if valid Etsy listing URL
        """
        try:
            parsed = urlparse(url)
            return (parsed.netloc in ['etsy.com', 'www.etsy.com'] and 
                   '/listing/' in parsed.path)
        except Exception:
            return False
    
    def _extract_etsy_id_from_url(self, url: str) -> str:
        """
        Extract Etsy listing ID from URL
        
        Args:
            url: Etsy listing URL
            
        Returns:
            Etsy listing ID
        """
        # Extract ID from URL pattern: /listing/ID/title
        match = re.search(r'/listing/(\d+)', url)
        if match:
            return match.group(1)
        raise ValueError("Could not extract Etsy listing ID from URL")
    
    def _scrape_etsy_listing(self, etsy_id: str) -> Dict[str, Any]:
        """
        Scrape Etsy listing data
        
        In a real implementation, this would use web scraping
        to extract data from the Etsy listing page.
        
        Args:
            etsy_id: Etsy listing ID
            
        Returns:
            Dictionary with listing data
        """
        # Simulate scraping with mock data
        # In production, you'd use requests + BeautifulSoup or similar
        
        mock_data = {
            "title": "Handmade Leather Journal with Personalized Initial - Vintage Style Diary",
            "description": "This beautiful handmade leather journal is perfect for writing, drawing, or journaling. Made with genuine leather and high-quality paper, it features a personalized initial on the cover. Perfect as a gift for writers, students, or anyone who loves to document their thoughts.",
            "tags": ["journal", "leather journal", "personalized gift", "handmade", "vintage", "diary", "writing", "gift", "personalized", "book"],
            "price": 45.00,
            "category": "Stationery",
            "shop_name": "ArtisanLeatherWorks",
            "shop_id": "123456789",
            "views": 1250,
            "favorites": 89,
            "sales": 23,
            "rating": 4.8
        }
        
        return mock_data
    
    def _perform_seo_analysis(self, listing: EtsyListing) -> SEOAnalysis:
        """
        Perform comprehensive SEO analysis
        
        Analyzes title, description, tags, and overall SEO factors.
        
        Args:
            listing: Etsy listing to analyze
            
        Returns:
            SEOAnalysis results
        """
        # Analyze title
        title_analysis = self._analyze_title(listing.title)
        
        # Analyze description
        description_analysis = self._analyze_description(listing.description)
        
        # Analyze tags
        tags_analysis = self._analyze_tags(listing.tags)
        
        # Analyze keywords
        keyword_analysis = self._analyze_keywords(listing)
        
        # Calculate overall score
        overall_score = (
            title_analysis["score"] * 0.3 +
            description_analysis["score"] * 0.3 +
            tags_analysis["score"] * 0.2 +
            keyword_analysis["score"] * 0.2
        )
        
        # Generate recommendations
        recommendations = self._generate_recommendations(
            title_analysis, description_analysis, tags_analysis, keyword_analysis
        )
        
        # Find missing and overused keywords
        missing_keywords = self._find_missing_keywords(listing)
        overused_keywords = self._find_overused_keywords(listing)
        
        # Get trending keywords
        trending_keywords = self._get_trending_keywords(listing.category)
        
        analysis = SEOAnalysis(
            listing_id=listing.id,
            overall_score=overall_score,
            title_analysis=title_analysis,
            description_analysis=description_analysis,
            tags_analysis=tags_analysis,
            keyword_analysis=keyword_analysis,
            recommendations=recommendations,
            missing_keywords=missing_keywords,
            overused_keywords=overused_keywords,
            trending_keywords=trending_keywords
        )
        
        # Update listing with SEO score
        listing.seo_score = overall_score
        listing.keywords = keyword_analysis["keywords"]
        
        return analysis
    
    def _analyze_title(self, title: str) -> Dict[str, Any]:
        """
        Analyze listing title for SEO
        
        Args:
            title: Listing title
            
        Returns:
            Title analysis results
        """
        # Length analysis
        length_score = 0
        if 50 <= len(title) <= 140:
            length_score = 100
        elif 40 <= len(title) <= 160:
            length_score = 80
        else:
            length_score = 60
        
        # Keyword analysis
        title_lower = title.lower()
        high_value_count = sum(1 for kw in self.high_value_keywords if kw in title_lower)
        keyword_score = min(100, high_value_count * 20)
        
        # Structure analysis
        has_numbers = bool(re.search(r'\d', title))
        has_personalization = any(word in title_lower for word in ['personalized', 'custom', 'initial'])
        structure_score = 50
        if has_numbers:
            structure_score += 25
        if has_personalization:
            structure_score += 25
        
        # Overall title score
        overall_score = (length_score * 0.4 + keyword_score * 0.4 + structure_score * 0.2)
        
        return {
            "score": overall_score,
            "length": len(title),
            "length_score": length_score,
            "keyword_score": keyword_score,
            "structure_score": structure_score,
            "has_numbers": has_numbers,
            "has_personalization": has_personalization,
            "high_value_keywords": high_value_count
        }
    
    def _analyze_description(self, description: str) -> Dict[str, Any]:
        """
        Analyze listing description for SEO
        
        Args:
            description: Listing description
            
        Returns:
            Description analysis results
        """
        # Length analysis
        length_score = 0
        if 100 <= len(description) <= 500:
            length_score = 100
        elif 50 <= len(description) <= 1000:
            length_score = 80
        else:
            length_score = 60
        
        # Keyword density
        words = description.lower().split()
        total_words = len(words)
        
        # Count high-value keywords
        keyword_count = sum(1 for kw in self.high_value_keywords if kw in words)
        keyword_density = (keyword_count / total_words * 100) if total_words > 0 else 0
        density_score = min(100, keyword_density * 10)
        
        # Readability score (simplified)
        sentences = description.split('.')
        avg_sentence_length = sum(len(s.split()) for s in sentences) / len(sentences) if sentences else 0
        readability_score = 100 if 10 <= avg_sentence_length <= 20 else 70
        
        # Overall description score
        overall_score = (length_score * 0.4 + density_score * 0.3 + readability_score * 0.3)
        
        return {
            "score": overall_score,
            "length": len(description),
            "length_score": length_score,
            "keyword_density": keyword_density,
            "density_score": density_score,
            "readability_score": readability_score,
            "high_value_keywords": keyword_count
        }
    
    def _analyze_tags(self, tags: List[str]) -> Dict[str, Any]:
        """
        Analyze listing tags for SEO
        
        Args:
            tags: List of listing tags
            
        Returns:
            Tags analysis results
        """
        # Tag count analysis
        count_score = 0
        if 10 <= len(tags) <= 13:
            count_score = 100
        elif 8 <= len(tags) <= 15:
            count_score = 80
        else:
            count_score = 60
        
        # Tag length analysis
        avg_length = sum(len(tag) for tag in tags) / len(tags) if tags else 0
        length_score = 100 if 15 <= avg_length <= 20 else 70
        
        # High-value keyword analysis
        high_value_tags = [tag for tag in tags if any(kw in tag.lower() for kw in self.high_value_keywords)]
        keyword_score = min(100, len(high_value_tags) * 15)
        
        # Tag uniqueness (no duplicates)
        unique_tags = len(set(tags))
        uniqueness_score = 100 if unique_tags == len(tags) else 50
        
        # Overall tags score
        overall_score = (count_score * 0.3 + length_score * 0.2 + keyword_score * 0.3 + uniqueness_score * 0.2)
        
        return {
            "score": overall_score,
            "count": len(tags),
            "count_score": count_score,
            "avg_length": avg_length,
            "length_score": length_score,
            "keyword_score": keyword_score,
            "uniqueness_score": uniqueness_score,
            "high_value_tags": high_value_tags
        }
    
    def _analyze_keywords(self, listing: EtsyListing) -> Dict[str, Any]:
        """
        Analyze keywords in listing
        
        Args:
            listing: Etsy listing
            
        Returns:
            Keyword analysis results
        """
        # Combine all text
        all_text = f"{listing.title} {listing.description} {' '.join(listing.tags)}".lower()
        
        # Extract keywords (simple approach)
        words = re.findall(r'\b[a-z]+\b', all_text)
        
        # Filter out stop words
        keywords = [word for word in words if word not in self.stop_words and len(word) > 2]
        
        # Count keyword frequency
        keyword_freq = {}
        for keyword in keywords:
            keyword_freq[keyword] = keyword_freq.get(keyword, 0) + 1
        
        # Get top keywords
        top_keywords = sorted(keyword_freq.items(), key=lambda x: x[1], reverse=True)[:20]
        
        # Calculate keyword diversity
        diversity_score = len(set(keywords)) / len(keywords) * 100 if keywords else 0
        
        return {
            "score": min(100, diversity_score),
            "keywords": [kw[0] for kw in top_keywords],
            "keyword_frequency": dict(top_keywords),
            "total_keywords": len(keywords),
            "unique_keywords": len(set(keywords)),
            "diversity_score": diversity_score
        }
    
    def _generate_recommendations(self, title_analysis: Dict[str, Any],
                                description_analysis: Dict[str, Any],
                                tags_analysis: Dict[str, Any],
                                keyword_analysis: Dict[str, Any]) -> List[str]:
        """
        Generate actionable recommendations
        
        Args:
            title_analysis: Title analysis results
            description_analysis: Description analysis results
            tags_analysis: Tags analysis results
            keyword_analysis: Keyword analysis results
            
        Returns:
            List of recommendations
        """
        recommendations = []
        
        # Title recommendations
        if title_analysis["length_score"] < 80:
            recommendations.append("Optimize title length to 50-140 characters for better SEO")
        
        if title_analysis["keyword_score"] < 60:
            recommendations.append("Add more high-value keywords like 'handmade', 'personalized', or 'vintage'")
        
        if not title_analysis["has_personalization"]:
            recommendations.append("Consider adding 'personalized' or 'custom' to attract buyers")
        
        # Description recommendations
        if description_analysis["length_score"] < 80:
            recommendations.append("Expand description to 100-500 words for better SEO")
        
        if description_analysis["keyword_density"] < 2:
            recommendations.append("Increase keyword density by naturally adding relevant terms")
        
        # Tags recommendations
        if tags_analysis["count"] < 10:
            recommendations.append("Add more tags (aim for 10-13 tags for maximum visibility)")
        
        if tags_analysis["keyword_score"] < 60:
            recommendations.append("Include more high-value keywords in your tags")
        
        # Keyword recommendations
        if keyword_analysis["diversity_score"] < 50:
            recommendations.append("Use more diverse keywords to reach a wider audience")
        
        return recommendations
    
    def _find_missing_keywords(self, listing: EtsyListing) -> List[str]:
        """
        Find keywords that should be added
        
        Args:
            listing: Etsy listing
            
        Returns:
            List of missing keywords
        """
        all_text = f"{listing.title} {listing.description} {' '.join(listing.tags)}".lower()
        
        # Keywords that are commonly missing
        common_keywords = ['gift', 'present', 'birthday', 'wedding', 'christmas', 'anniversary', 'decoration', 'home decor']
        
        missing = [kw for kw in common_keywords if kw not in all_text]
        
        return missing[:5]  # Return top 5 missing keywords
    
    def _find_overused_keywords(self, listing: EtsyListing) -> List[str]:
        """
        Find overused keywords
        
        Args:
            listing: Etsy listing
            
        Returns:
            List of overused keywords
        """
        all_text = f"{listing.title} {listing.description} {' '.join(listing.tags)}".lower()
        words = all_text.split()
        
        # Count word frequency
        word_freq = {}
        for word in words:
            if word not in self.stop_words and len(word) > 2:
                word_freq[word] = word_freq.get(word, 0) + 1
        
        # Find overused words (appearing more than 3 times)
        overused = [word for word, count in word_freq.items() if count > 3]
        
        return overused[:3]  # Return top 3 overused keywords
    
    def _get_trending_keywords(self, category: str) -> List[str]:
        """
        Get trending keywords for a category
        
        Args:
            category: Product category
            
        Returns:
            List of trending keywords
        """
        # Simulated trending keywords by category
        trending_by_category = {
            "Stationery": ["journal", "planner", "notebook", "writing", "bullet journal", "scrapbook"],
            "Jewelry": ["necklace", "bracelet", "earrings", "ring", "personalized", "minimalist"],
            "Home Decor": ["wall art", "rustic", "modern", "boho", "farmhouse", "decor"],
            "Clothing": ["vintage", "bohemian", "sustainable", "organic", "handmade", "ethical"]
        }
        
        return trending_by_category.get(category, ["handmade", "unique", "custom", "gift"])
    
    def _find_competitors(self, listing: EtsyListing) -> List[CompetitorListing]:
        """
        Find competitor listings
        
        Args:
            listing: Etsy listing
            
        Returns:
            List of competitor listings
        """
        # Simulate competitor search
        # In production, you'd search Etsy for similar listings
        
        competitors = []
        
        # Generate mock competitors
        for i in range(5):
            competitor = CompetitorListing(
                etsy_id=f"competitor_{i}",
                title=f"Competitor {i+1}: {listing.title.split('-')[0].strip()} - Alternative Design",
                price=listing.price + (i - 2) * 5,  # Vary prices
                views=listing.views + (i - 2) * 200,
                favorites=listing.favorites + (i - 2) * 15,
                sales=listing.sales + (i - 2) * 3,
                tags=listing.tags[:8],  # Similar tags
                seo_score=75 + (i - 2) * 5,
                price_position=i + 1,
                performance_score=80 + (i - 2) * 10
            )
            
            # Add strengths and weaknesses
            if i == 0:  # Top competitor
                competitor.strengths = ["Higher sales", "Better SEO score", "More views"]
                competitor.weaknesses = ["Higher price", "Fewer tags"]
            elif i == 4:  # Bottom competitor
                competitor.strengths = ["Lower price", "More tags"]
                competitor.weaknesses = ["Lower sales", "Fewer views"]
            else:
                competitor.strengths = ["Balanced performance"]
                competitor.weaknesses = ["Average metrics"]
            
            competitors.append(competitor)
        
        return competitors
    
    def get_competitor_analysis(self, listing_id: str) -> Dict[str, Any]:
        """
        Get detailed competitor analysis
        
        Args:
            listing_id: ID of the listing
            
        Returns:
            Competitor analysis results
        """
        if listing_id not in self.competitor_listings:
            raise ValueError("Competitor data not found")
        
        competitors = self.competitor_listings[listing_id]
        listing = self.listings[listing_id]
        
        # Price analysis
        prices = [c.price for c in competitors]
        avg_price = statistics.mean(prices)
        price_position = sum(1 for p in prices if p < listing.price) + 1
        
        # Performance analysis
        performance_scores = [c.performance_score for c in competitors]
        avg_performance = statistics.mean(performance_scores)
        
        # SEO analysis
        seo_scores = [c.seo_score for c in competitors]
        avg_seo = statistics.mean(seo_scores)
        
        return {
            "listing_price": listing.price,
            "listing_performance": listing.seo_score,
            "price_position": price_position,
            "competitor_count": len(competitors),
            "average_price": avg_price,
            "average_performance": avg_performance,
            "average_seo": avg_seo,
            "price_comparison": {
                "cheaper": sum(1 for c in competitors if c.price < listing.price),
                "same_price": sum(1 for c in competitors if abs(c.price - listing.price) < 1),
                "more_expensive": sum(1 for c in competitors if c.price > listing.price)
            },
            "top_competitors": [
                {
                    "etsy_id": c.etsy_id,
                    "title": c.title,
                    "price": c.price,
                    "seo_score": c.seo_score,
                    "performance_score": c.performance_score,
                    "strengths": c.strengths,
                    "weaknesses": c.weaknesses
                }
                for c in sorted(competitors, key=lambda x: x.performance_score, reverse=True)[:3]
            ]
        }
    
    def export_analysis_report(self, listing_id: str, format: str = "json") -> str:
        """
        Export analysis report
        
        Args:
            listing_id: ID of the listing
            format: Export format (json, csv, markdown)
            
        Returns:
            Exported report
        """
        if listing_id not in self.listings:
            raise ValueError("Listing not found")
        
        listing = self.listings[listing_id]
        analysis = self.seo_analyses.get(listing_id)
        competitors = self.competitor_listings.get(listing_id, [])
        
        if format.lower() == "json":
            report_data = {
                "listing": {
                    "title": listing.title,
                    "price": listing.price,
                    "category": listing.category,
                    "shop_name": listing.shop_name,
                    "views": listing.views,
                    "favorites": listing.favorites,
                    "sales": listing.sales
                },
                "seo_analysis": analysis.__dict__ if analysis else {},
                "competitors": len(competitors),
                "export_date": datetime.now().isoformat()
            }
            # Convert datetime objects to strings
            def convert_datetime(obj):
                if isinstance(obj, datetime):
                    return obj.isoformat()
                elif isinstance(obj, dict):
                    return {k: convert_datetime(v) for k, v in obj.items()}
                elif isinstance(obj, list):
                    return [convert_datetime(item) for item in obj]
                return obj
            
            report_data = convert_datetime(report_data)
            return json.dumps(report_data, indent=2)
        
        elif format.lower() == "markdown":
            markdown = f"""# Etsy Listing Analysis Report

## Listing Information
- **Title**: {listing.title}
- **Price**: ${listing.price}
- **Category**: {listing.category}
- **Shop**: {listing.shop_name}
- **Views**: {listing.views}
- **Favorites**: {listing.favorites}
- **Sales**: {listing.sales}

## SEO Analysis
- **Overall Score**: {analysis.overall_score:.1f}/100
- **Title Score**: {analysis.title_analysis.get('score', 0):.1f}/100
- **Description Score**: {analysis.description_analysis.get('score', 0):.1f}/100
- **Tags Score**: {analysis.tags_analysis.get('score', 0):.1f}/100

## Recommendations
{chr(10).join(f"- {rec}" for rec in analysis.recommendations)}

## Competitor Analysis
- **Total Competitors**: {len(competitors)}
- **Average Price**: ${sum(c.price for c in competitors)/len(competitors):.2f}
- **Your Price Position**: {sum(1 for c in competitors if c.price < listing.price) + 1}/{len(competitors) + 1}

---
*Report generated on {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}*
"""
            return markdown
        
        else:
            raise ValueError(f"Unsupported export format: {format}")
    
    def get_user_analytics(self, user_email: str) -> Dict[str, Any]:
        """
        Get comprehensive analytics for a user
        
        Provides usage statistics, performance metrics,
        and insights about the user's Etsy analysis.
        
        Args:
            user_email: Email of the user
            
        Returns:
            Analytics data dictionary
        """
        if user_email not in self.users:
            raise ValueError("User not found")
        
        user = self.users[user_email]
        user_listing_ids = self.user_listings.get(user_email, [])
        
        # Get user's listings
        user_listings = [self.listings[lid] for lid in user_listing_ids if lid in self.listings]
        
        # Calculate statistics
        total_listings = len(user_listings)
        total_views = sum(listing.views for listing in user_listings)
        total_favorites = sum(listing.favorites for listing in user_listings)
        total_sales = sum(listing.sales for listing in user_listings)
        avg_price = sum(listing.price for listing in user_listings) / max(1, total_listings)
        
        # SEO statistics
        seo_scores = [listing.seo_score for listing in user_listings]
        avg_seo_score = sum(seo_scores) / max(1, len(seo_scores))
        
        # Category breakdown
        categories = {}
        for listing in user_listings:
            categories[listing.category] = categories.get(listing.category, 0) + 1
        
        # Recent activity (last 30 days)
        month_ago = datetime.now() - timedelta(days=30)
        recent_listings = [listing for listing in user_listings if listing.created_at >= month_ago]
        
        analytics = {
            "user": {
                "email": user_email,
                "name": user.name,
                "plan": user.plan
            },
            "listings": {
                "total": total_listings,
                "recent": len(recent_listings),
                "total_views": total_views,
                "total_favorites": total_favorites,
                "total_sales": total_sales,
                "average_price": round(avg_price, 2)
            },
            "seo": {
                "average_score": round(avg_seo_score, 2),
                "high_performing": len([s for s in seo_scores if s >= 80]),
                "needs_improvement": len([s for s in seo_scores if s < 60])
            },
            "categories": categories,
            "recent_activity": self._get_recent_analysis_activity(user_email)
        }
        
        return analytics
    
    def _get_recent_analysis_activity(self, user_email: str) -> List[Dict[str, Any]]:
        """Get recent analysis activity for user"""
        user_listing_ids = self.user_listings.get(user_email, [])
        recent_listings = []
        
        for listing_id in user_listing_ids[-5:]:  # Last 5 listings
            if listing_id in self.listings:
                listing = self.listings[listing_id]
                recent_listings.append({
                    "listing_id": listing.id,
                    "title": listing.title,
                    "price": listing.price,
                    "seo_score": listing.seo_score,
                    "created_at": listing.created_at.isoformat()
                })
        
        return recent_listings
    
    def handle_core_logic(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Handle Etsy analyzer specific requests
        
        Routes requests to appropriate Etsy analysis functions.
        """
        action = data.get("action", "")
        
        try:
            if action == "analyze_listing":
                result = self.analyze_etsy_url(
                    user_email=data["user_email"],
                    etsy_url=data["etsy_url"]
                )
                return {"status": "success", "analysis": result.__dict__}
            
            elif action == "get_competitor_analysis":
                result = self.get_competitor_analysis(data["listing_id"])
                return {"status": "success", "competitor_analysis": result}
            
            elif action == "export_report":
                export_data = self.export_analysis_report(
                    listing_id=data["listing_id"],
                    format=data.get("format", "json")
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
    Demo Etsy Listing Analyzer
    
    This function demonstrates core functionality with sample data.
    """
    print("🛍️ Etsy Listing Analyzer Demo")
    print("=" * 50)
    
    # Initialize analyzer
    analyzer = EtsyListingAnalyzer()
    
    # Register a demo user
    try:
        user = analyzer.register_user(
            email="seller@example.com",
            name="Etsy Seller",
            password="etsy123"
        )
        print(f"✅ Registered user: {user.name}")
        
        # Login user
        logged_in_user = analyzer.login_user("seller@example.com", "etsy123")
        if logged_in_user:
            print(f"✅ Logged in as: {logged_in_user.name}")
        
        # Analyze a sample Etsy listing
        sample_url = "https://www.etsy.com/listing/123456789/handmade-leather-journal-personalized"
        analysis = analyzer.analyze_etsy_url(
            user_email="seller@example.com",
            etsy_url=sample_url
        )
        print("✅ Analyzed Etsy listing")
        print(f"📊 Overall SEO Score: {analysis.overall_score:.1f}/100")
        
        # Display analysis results
        print("\n📋 SEO Analysis Results:")
        print(f"  Title Score: {analysis.title_analysis['score']:.1f}/100")
        print(f"  Description Score: {analysis.description_analysis['score']:.1f}/100")
        print(f"  Tags Score: {analysis.tags_analysis['score']:.1f}/100")
        print(f"  Keyword Diversity: {analysis.keyword_analysis['diversity_score']:.1f}%")
        
        # Display recommendations
        print(f"\n💡 Recommendations ({len(analysis.recommendations)}):")
        for i, rec in enumerate(analysis.recommendations, 1):
            print(f"  {i}. {rec}")
        
        # Display missing keywords
        if analysis.missing_keywords:
            print(f"\n🔍 Missing Keywords: {', '.join(analysis.missing_keywords)}")
        
        # Display trending keywords
        if analysis.trending_keywords:
            print(f"🔥 Trending Keywords: {', '.join(analysis.trending_keywords[:5])}")
        
        # Get competitor analysis
        competitor_analysis = analyzer.get_competitor_analysis(analysis.listing_id)
        print(f"\n🏆 Competitor Analysis:")
        print(f"  Total Competitors: {competitor_analysis['competitor_count']}")
        print(f"  Average Price: ${competitor_analysis['average_price']:.2f}")
        print(f"  Your Price Position: {competitor_analysis['price_position']}/{competitor_analysis['competitor_count'] + 1}")
        print(f"  Average SEO Score: {competitor_analysis['average_seo']:.1f}/100")
        
        # Export report
        json_report = analyzer.export_analysis_report(analysis.listing_id, "json")
        print("✅ Exported JSON report (" + str(len(json_report)) + " characters)")
        
        markdown_report = analyzer.export_analysis_report(analysis.listing_id, "markdown")
        print(f"✅ Exported Markdown report ({len(markdown_report)} characters)")
        
        # Get analytics
        analytics = analyzer.get_user_analytics("seller@example.com")
        print(f"✅ User analytics: {analytics['listings']['total']} listings, {analytics['seo']['average_score']:.1f} avg SEO score")
        
        print("🎉 Etsy Listing Analyzer demo complete!")
        print(f"🛍️ Listings analyzed: {analytics['listings']['total']}")
        print(f"📈 Average SEO score: {analytics['seo']['average_score']:.1f}/100")
        print(f"👀 Total views tracked: {analytics['listings']['total_views']}")
        print(f"❤️ Total favorites: {analytics['listings']['total_favorites']}")
        print(f"💰 Total sales: {analytics['listings']['total_sales']}")
        print(f"📊 Categories analyzed: {len(analytics['categories'])}")
        
    except Exception as e:
        logger.error(f"Demo failed: {e}")
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    main()
