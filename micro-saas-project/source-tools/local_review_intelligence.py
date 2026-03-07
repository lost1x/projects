#!/usr/bin/env python3
"""
Local Business Review Intelligence
=================================

A micro-SaaS tool that analyzes local business reviews across platforms
to provide reputation management insights and competitive intelligence.

Features:
- Multi-platform review aggregation (Google, Yelp, Facebook, etc.)
- Sentiment analysis and trend tracking
- Competitor review comparison
- Review response automation
- Performance analytics and reporting
- Alert system for new reviews
- Review export and backup
- Local SEO optimization insights

Business Model:
- Free: 1 business, basic analytics
- Basic: 5 businesses, sentiment analysis ($9.99/month)
- Pro: 25 businesses, competitor tracking ($29.99/month)

Target Users:
- Local business owners
- Marketing agencies
- Reputation management companies
- Multi-location businesses
- Franchise managers

Technical Implementation:
- Web scraping for review data
- Sentiment analysis algorithms
- Competitor tracking
- Alert system
- Analytics dashboard
- Export capabilities

Author: Your Name
Created: 2026-03-06
"""

import sys
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, field
import uuid

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

# Configure logging specifically for review intelligence
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - [REVIEW] %(message)s',
    handlers=[
        logging.FileHandler('review_intelligence.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

@dataclass
class LocalBusiness:
    """
    Local business data structure
    
    Represents a local business with all information needed
    for review analysis and reputation management.
    
    Attributes:
        id: Unique identifier for the business
        name: Business name
        category: Business category (restaurant, retail, service, etc.)
        address: Business address
        phone: Phone number
        website: Website URL
        platforms: List of review platforms tracked
        created_at: When business was added
        last_updated: When data was last updated
        owner_email: Email of the business owner
        is_active: Whether tracking is active
        alert_settings: Alert configuration
    """
    id: str
    name: str
    category: str
    address: str
    phone: str
    website: str
    platforms: List[str] = field(default_factory=list)
    created_at: datetime = field(default_factory=datetime.now)
    last_updated: Optional[datetime] = None
    owner_email: str = ""
    is_active: bool = True
    alert_settings: Dict[str, Any] = field(default_factory=dict)

@dataclass
class BusinessReview:
    """
    Individual review data structure
    
    Represents a single review with sentiment analysis
    and metadata for tracking and analysis.
    
    Attributes:
        id: Unique identifier for the review
        business_id: ID of the business being reviewed
        platform: Review platform (Google, Yelp, Facebook, etc.)
        reviewer_name: Name of the reviewer
        rating: Star rating (1-5)
        text: Review text content
        date: Review date
        sentiment_score: Sentiment analysis score (-1 to 1)
        sentiment_label: Sentiment label (positive, negative, neutral)
        key_topics: Extracted key topics from review
        response_text: Business response to review
        response_date: Date of business response
        is_verified: Whether reviewer is verified
        helpful_count: Number of helpful votes
        extracted_at: When review was processed
    """
    id: str
    business_id: str
    platform: str
    reviewer_name: str
    rating: int
    text: str
    date: datetime
    sentiment_score: float
    sentiment_label: str
    key_topics: List[str] = field(default_factory=list)
    response_text: str = ""
    response_date: Optional[datetime] = None
    is_verified: bool = False
    helpful_count: int = 0
    extracted_at: datetime = field(default_factory=datetime.now)

@dataclass
class CompetitorBusiness:
    """
    Competitor business data structure
    
    Represents a competitor business for comparison
    and competitive intelligence analysis.
    
    Attributes:
        id: Unique identifier for the competitor
        name: Competitor business name
        category: Business category
        address: Competitor address
        platforms: Review platforms tracked
        review_count: Total number of reviews
        average_rating: Average star rating
        sentiment_analysis: Sentiment analysis results
        strength_areas: Areas where competitor excels
        weakness_areas: Areas for improvement
        last_analyzed: When competitor was last analyzed
        created_at: When competitor was added
    """
    id: str
    name: str
    category: str
    address: str
    platforms: List[str]
    review_count: int
    average_rating: float
    sentiment_analysis: Dict[str, Any] = field(default_factory=dict)
    strength_areas: List[str] = field(default_factory=list)
    weakness_areas: List[str] = field(default_factory=list)
    last_analyzed: datetime = field(default_factory=datetime.now)
    created_at: datetime = field(default_factory=datetime.now)

@dataclass
class ReviewAlert:
    """
    Review alert data structure
    
    Represents an alert triggered by review activity
    or sentiment changes that require attention.
    
    Attributes:
        id: Unique identifier for the alert
        business_id: ID of the business
        alert_type: Type of alert (new_review, negative_sentiment, rating_drop, etc.)
        severity: Alert severity (low, medium, high, critical)
        title: Alert title
        message: Detailed alert message
        review_id: Related review ID (if applicable)
        triggered_at: When alert was triggered
        acknowledged: Whether alert has been acknowledged
        acknowledged_at: When alert was acknowledged
        action_taken: Actions taken in response
    """
    id: str
    business_id: str
    alert_type: str
    severity: str
    title: str
    message: str
    review_id: str = ""
    triggered_at: datetime = field(default_factory=datetime.now)
    acknowledged: bool = False
    acknowledged_at: Optional[datetime] = None
    action_taken: str = ""

class LocalReviewIntelligence(MicroSaaSApp):
    """
    Main Local Business Review Intelligence application
    
    This class extends the base MicroSaaSApp with review-specific
    functionality for reputation management and competitive analysis.
    
    Key Features:
    - Multi-platform review aggregation
    - Sentiment analysis and tracking
    - Competitor analysis and comparison
    - Alert system for review monitoring
    - Performance analytics and reporting
    - Usage limits for freemium model
    """
    
    def __init__(self, config_file: str = "config.json"):
        """Initialize the Local Review Intelligence"""
        super().__init__(config_file)
        
        # Review intelligence specific data storage
        self.businesses: Dict[str, LocalBusiness] = {}  # business_id -> LocalBusiness
        self.reviews: Dict[str, BusinessReview] = {}  # review_id -> BusinessReview
        self.competitors: Dict[str, CompetitorBusiness] = {}  # competitor_id -> CompetitorBusiness
        self.alerts: Dict[str, ReviewAlert] = {}  # alert_id -> ReviewAlert
        
        # User business mapping
        self.user_businesses: Dict[str, List[str]] = {}  # user_email -> [business_ids]
        
        # Sentiment analysis keywords
        self.positive_keywords = {
            'excellent', 'amazing', 'great', 'good', 'fantastic', 'wonderful', 'perfect',
            'love', 'loved', 'awesome', 'brilliant', 'outstanding', 'superb', 'magnificent',
            'friendly', 'helpful', 'professional', 'clean', 'delicious', 'beautiful',
            'recommend', 'recommended', 'best', 'quality', 'service', 'staff', 'experience'
        }
        
        self.negative_keywords = {
            'terrible', 'awful', 'horrible', 'bad', 'poor', 'disappointing', 'worst',
            'hate', 'hated', 'disgusting', 'dirty', 'rude', 'unprofessional', 'slow',
            'expensive', 'overpriced', 'cheap', 'broken', 'wrong', 'never', 'again',
            'complaint', 'problem', 'issue', 'concern', 'worried', 'unhappy', 'dissatisfied'
        }
        
        logger.info("Local Review Intelligence initialized")
        logger.info(f"Loaded {len(self.businesses)} businesses")
    
    def add_business(self, user_email: str, name: str, category: str, address: str,
                    phone: str, website: str, platforms: List[str] = None) -> LocalBusiness:
        """
        Add a new business for review tracking
        
        Args:
            user_email: Email of the user adding the business
            name: Business name
            category: Business category
            address: Business address
            phone: Phone number
            website: Website URL
            platforms: List of review platforms to track
            
        Returns:
            Created LocalBusiness object
        """
        # Check user limits
        if user_email not in self.users:
            raise ValueError("User not found. Please register first.")
        
        user = self.users[user_email]
        user_businesses = self.user_businesses.get(user_email, [])
        business_limit = self.get_business_limit(user.plan)
        
        if len(user_businesses) >= business_limit:
            raise ValueError(f"Business limit reached ({business_limit}). Upgrade your plan to track more businesses.")
        
        # Create business
        business_id = f"business_{uuid.uuid4().hex[:8]}"
        new_business = LocalBusiness(
            id=business_id,
            name=name,
            category=category,
            address=address,
            phone=phone,
            website=website,
            platforms=platforms or ["Google", "Yelp"],
            owner_email=user_email,
            alert_settings={
                "new_reviews": True,
                "negative_reviews": True,
                "rating_drops": True,
                "competitor_changes": False
            }
        )
        
        # Store business
        self.businesses[business_id] = new_business
        
        # Link to user
        if user_email not in self.user_businesses:
            self.user_businesses[user_email] = []
        self.user_businesses[user_email].append(business_id)
        
        logger.info(f"Added business '{name}' for user {user_email}")
        return new_business
    
    def get_business_limit(self, plan: str) -> int:
        """
        Get business limit based on user plan
        
        Args:
            plan: User's subscription plan
            
        Returns:
            Maximum number of businesses allowed
        """
        limits = {
            "free": 1,
            "basic": 5,
            "pro": 25,
            "enterprise": 100
        }
        return limits.get(plan, 1)
    
    def collect_reviews(self, business_id: str, platform: str = None) -> List[BusinessReview]:
        """
        Collect reviews for a business
        
        In a real implementation, this would use web scraping
        or API calls to collect actual review data.
        
        Args:
            business_id: ID of the business
            platform: Specific platform to collect from
            
        Returns:
            List of collected reviews
        """
        if business_id not in self.businesses:
            raise ValueError("Business not found")
        
        business = self.businesses[business_id]
        platforms_to_check = [platform] if platform else business.platforms
        
        collected_reviews = []
        
        for plat in platforms_to_check:
            # Simulate review collection
            platform_reviews = self._simulate_review_collection(business, plat)
            collected_reviews.extend(platform_reviews)
        
        # Store reviews
        for review in collected_reviews:
            self.reviews[review.id] = review
        
        # Update business last updated
        business.last_updated = datetime.now()
        
        logger.info(f"Collected {len(collected_reviews)} reviews for business {business_id}")
        return collected_reviews
    
    def _simulate_review_collection(self, business: LocalBusiness, platform: str) -> List[BusinessReview]:
        """
        Simulate review collection for demonstration
        
        Args:
            business: Business to collect reviews for
            platform: Platform to collect from
            
        Returns:
            List of simulated reviews
        """
        # Generate mock reviews based on platform
        mock_reviews = []
        
        # Different review patterns for different platforms
        if platform == "Google":
            reviews_data = [
                {
                    "rating": 5,
                    "text": "Amazing service! The staff was incredibly helpful and the atmosphere was perfect. Will definitely be coming back!",
                    "reviewer": "John D.",
                    "verified": True
                },
                {
                    "rating": 4,
                    "text": "Good experience overall. The food was delicious and service was friendly. A bit pricey but worth it for special occasions.",
                    "reviewer": "Sarah M.",
                    "verified": False
                },
                {
                    "rating": 3,
                    "text": "Average experience. Service was slow but the food was good. Might try again during less busy hours.",
                    "reviewer": "Mike R.",
                    "verified": False
                }
            ]
        elif platform == "Yelp":
            reviews_data = [
                {
                    "rating": 4,
                    "text": "Solid choice for the area. The menu has good variety and the quality is consistent. Service can be hit or miss during peak hours.",
                    "reviewer": "Emily T.",
                    "verified": True
                },
                {
                    "rating": 2,
                    "text": "Disappointing visit. Waited 45 minutes for food that was cold when it arrived. Manager was apologetic but didn't offer compensation.",
                    "reviewer": "David L.",
                    "verified": False
                }
            ]
        else:  # Facebook
            reviews_data = [
                {
                    "rating": 5,
                    "text": "Love this place! Been coming here for years and it's always consistently great. The owners really care about their customers.",
                    "reviewer": "Lisa K.",
                    "verified": True
                }
            ]
        
        # Create BusinessReview objects
        for i, review_data in enumerate(reviews_data):
            review_id = f"review_{uuid.uuid4().hex[:8]}"
            
            # Perform sentiment analysis
            sentiment_score, sentiment_label = self._analyze_sentiment(review_data["text"])
            
            # Extract key topics
            key_topics = self._extract_key_topics(review_data["text"])
            
            review = BusinessReview(
                id=review_id,
                business_id=business.id,
                platform=platform,
                reviewer_name=review_data["reviewer"],
                rating=review_data["rating"],
                text=review_data["text"],
                date=datetime.now() - timedelta(days=i),
                sentiment_score=sentiment_score,
                sentiment_label=sentiment_label,
                key_topics=key_topics,
                is_verified=review_data.get("verified", False),
                helpful_count=0
            )
            
            mock_reviews.append(review)
        
        return mock_reviews
    
    def _analyze_sentiment(self, text: str) -> tuple[float, str]:
        """
        Analyze sentiment of review text
        
        Args:
            text: Review text to analyze
            
        Returns:
            Tuple of (sentiment_score, sentiment_label)
        """
        text_lower = text.lower()
        words = text_lower.split()
        
        # Count positive and negative words
        positive_count = sum(1 for word in words if word in self.positive_keywords)
        negative_count = sum(1 for word in words if word in self.negative_keywords)
        
        # Calculate sentiment score (-1 to 1)
        total_sentiment_words = positive_count + negative_count
        if total_sentiment_words == 0:
            sentiment_score = 0.0
        else:
            sentiment_score = (positive_count - negative_count) / total_sentiment_words
        
        # Determine sentiment label
        if sentiment_score > 0.2:
            sentiment_label = "positive"
        elif sentiment_score < -0.2:
            sentiment_label = "negative"
        else:
            sentiment_label = "neutral"
        
        return sentiment_score, sentiment_label
    
    def _extract_key_topics(self, text: str) -> List[str]:
        """
        Extract key topics from review text
        
        Args:
            text: Review text to analyze
            
        Returns:
            List of key topics
        """
        text_lower = text.lower()
        topics = []
        
        # Common review topics
        topic_keywords = {
            "service": ["service", "staff", "waiter", "waitress", "server", "helpful", "friendly"],
            "food": ["food", "meal", "dish", "menu", "delicious", "taste", "flavor"],
            "atmosphere": ["atmosphere", "ambiance", "decor", "environment", "vibe"],
            "price": ["price", "cost", "expensive", "cheap", "value", "affordable"],
            "cleanliness": ["clean", "dirty", "hygienic", "sanitary", "tidy"],
            "location": ["location", "parking", "area", "neighborhood", "convenient"],
            "speed": ["fast", "slow", "quick", "wait", "time", "prompt"]
        }
        
        for topic, keywords in topic_keywords.items():
            if any(keyword in text_lower for keyword in keywords):
                topics.append(topic)
        
        return topics
    
    def get_business_analytics(self, business_id: str) -> Dict[str, Any]:
        """
        Get comprehensive analytics for a business
        
        Args:
            business_id: ID of the business
            
        Returns:
            Analytics data dictionary
        """
        if business_id not in self.businesses:
            raise ValueError("Business not found")
        
        business = self.businesses[business_id]
        
        # Get all reviews for this business
        business_reviews = [review for review in self.reviews.values() 
                           if review.business_id == business_id]
        
        if not business_reviews:
            return {
                "business": {
                    "name": business.name,
                    "category": business.category,
                    "platforms": business.platforms
                },
                "reviews": {
                    "total": 0,
                    "average_rating": 0,
                    "sentiment_breakdown": {}
                },
                "alerts": {
                    "total": 0,
                    "unacknowledged": 0
                }
            }
        
        # Calculate metrics
        total_reviews = len(business_reviews)
        average_rating = sum(review.rating for review in business_reviews) / total_reviews
        
        # Sentiment breakdown
        sentiment_counts = {"positive": 0, "negative": 0, "neutral": 0}
        for review in business_reviews:
            sentiment_counts[review.sentiment_label] += 1
        
        # Platform breakdown
        platform_stats = {}
        for review in business_reviews:
            if review.platform not in platform_stats:
                platform_stats[review.platform] = {"count": 0, "avg_rating": 0}
            platform_stats[review.platform]["count"] += 1
        
        for platform, stats in platform_stats.items():
            platform_reviews = [r for r in business_reviews if r.platform == platform]
            stats["avg_rating"] = sum(r.rating for r in platform_reviews) / len(platform_reviews)
        
        # Rating distribution
        rating_distribution = {i: 0 for i in range(1, 6)}
        for review in business_reviews:
            rating_distribution[review.rating] += 1
        
        # Recent reviews (last 30 days)
        thirty_days_ago = datetime.now() - timedelta(days=30)
        recent_reviews = [r for r in business_reviews if r.date >= thirty_days_ago]
        
        # Alerts
        business_alerts = [alert for alert in self.alerts.values() 
                          if alert.business_id == business_id]
        unacknowledged_alerts = [a for a in business_alerts if not a.acknowledged]
        
        analytics = {
            "business": {
                "name": business.name,
                "category": business.category,
                "platforms": business.platforms,
                "address": business.address
            },
            "reviews": {
                "total": total_reviews,
                "average_rating": round(average_rating, 2),
                "sentiment_breakdown": sentiment_counts,
                "platform_breakdown": platform_stats,
                "rating_distribution": rating_distribution,
                "recent_count": len(recent_reviews),
                "recent_average": round(sum(r.rating for r in recent_reviews) / len(recent_reviews), 2) if recent_reviews else 0
            },
            "alerts": {
                "total": len(business_alerts),
                "unacknowledged": len(unacknowledged_alerts)
            },
            "trends": {
                "sentiment_trend": self._calculate_sentiment_trend(business_reviews),
                "rating_trend": self._calculate_rating_trend(business_reviews)
            }
        }
        
        return analytics
    
    def _calculate_sentiment_trend(self, reviews: List[BusinessReview]) -> str:
        """
        Calculate sentiment trend over time
        
        Args:
            reviews: List of reviews
            
        Returns:
            Trend description
        """
        if len(reviews) < 2:
            return "insufficient_data"
        
        # Sort reviews by date
        sorted_reviews = sorted(reviews, key=lambda r: r.date)
        
        # Compare first half vs second half
        mid_point = len(sorted_reviews) // 2
        first_half = sorted_reviews[:mid_point]
        second_half = sorted_reviews[mid_point:]
        
        first_avg_sentiment = sum(r.sentiment_score for r in first_half) / len(first_half)
        second_avg_sentiment = sum(r.sentiment_score for r in second_half) / len(second_half)
        
        if second_avg_sentiment > first_avg_sentiment + 0.1:
            return "improving"
        elif second_avg_sentiment < first_avg_sentiment - 0.1:
            return "declining"
        else:
            return "stable"
    
    def _calculate_rating_trend(self, reviews: List[BusinessReview]) -> str:
        """
        Calculate rating trend over time
        
        Args:
            reviews: List of reviews
            
        Returns:
            Trend description
        """
        if len(reviews) < 2:
            return "insufficient_data"
        
        # Sort reviews by date
        sorted_reviews = sorted(reviews, key=lambda r: r.date)
        
        # Compare first half vs second half
        mid_point = len(sorted_reviews) // 2
        first_half = sorted_reviews[:mid_point]
        second_half = sorted_reviews[mid_point:]
        
        first_avg_rating = sum(r.rating for r in first_half) / len(first_half)
        second_avg_rating = sum(r.rating for r in second_half) / len(second_half)
        
        if second_avg_rating > first_avg_rating + 0.3:
            return "improving"
        elif second_avg_rating < first_avg_rating - 0.3:
            return "declining"
        else:
            return "stable"
    
    def add_competitor(self, business_id: str, competitor_name: str, 
                      competitor_address: str) -> CompetitorBusiness:
        """
        Add a competitor for analysis
        
        Args:
            business_id: ID of the business adding competitor
            competitor_name: Name of the competitor
            competitor_address: Address of the competitor
            
        Returns:
            Created CompetitorBusiness object
        """
        if business_id not in self.businesses:
            raise ValueError("Business not found")
        
        # Create competitor
        competitor_id = f"competitor_{uuid.uuid4().hex[:8]}"
        
        # Simulate competitor data collection
        competitor_data = self._simulate_competitor_data(competitor_name, competitor_address)
        
        new_competitor = CompetitorBusiness(
            id=competitor_id,
            name=competitor_name,
            category=competitor_data["category"],
            address=competitor_address,
            platforms=competitor_data["platforms"],
            review_count=competitor_data["review_count"],
            average_rating=competitor_data["average_rating"],
            sentiment_analysis=competitor_data["sentiment_analysis"],
            strength_areas=competitor_data["strength_areas"],
            weakness_areas=competitor_data["weakness_areas"]
        )
        
        # Store competitor
        self.competitors[competitor_id] = new_competitor
        
        logger.info(f"Added competitor '{competitor_name}' for business {business_id}")
        return new_competitor
    
    def _simulate_competitor_data(self, name: str, address: str) -> Dict[str, Any]:
        """
        Simulate competitor data collection
        
        Args:
            name: Competitor name
            address: Competitor address
            
        Returns:
            Simulated competitor data
        """
        return {
            "category": "restaurant",
            "platforms": ["Google", "Yelp"],
            "review_count": 150,
            "average_rating": 4.2,
            "sentiment_analysis": {
                "positive": 65,
                "neutral": 25,
                "negative": 10
            },
            "strength_areas": ["service", "atmosphere"],
            "weakness_areas": ["price", "parking"]
        }
    
    def get_competitor_comparison(self, business_id: str) -> Dict[str, Any]:
        """
        Get competitor comparison analysis
        
        Args:
            business_id: ID of the business
            
        Returns:
            Competitor comparison data
        """
        if business_id not in self.businesses:
            raise ValueError("Business not found")
        
        business = self.businesses[business_id]
        business_reviews = [r for r in self.reviews.values() if r.business_id == business_id]
        
        if not business_reviews:
            return {"error": "No reviews available for comparison"}
        
        # Get business metrics
        business_avg_rating = sum(r.rating for r in business_reviews) / len(business_reviews)
        business_sentiment = self._calculate_sentiment_breakdown(business_reviews)
        
        # Get all competitors for this business
        comparison_data = {
            "business": {
                "name": business.name,
                "average_rating": round(business_avg_rating, 2),
                "sentiment_breakdown": business_sentiment,
                "review_count": len(business_reviews)
            },
            "competitors": []
        }
        
        # Add competitor data
        for competitor in self.competitors.values():
            competitor_data = {
                "name": competitor.name,
                "average_rating": competitor.average_rating,
                "sentiment_breakdown": competitor.sentiment_analysis,
                "review_count": competitor.review_count,
                "strength_areas": competitor.strength_areas,
                "weakness_areas": competitor.weakness_areas,
                "rating_difference": round(competitor.average_rating - business_avg_rating, 2),
                "sentiment_difference": {
                    "positive": competitor.sentiment_analysis.get("positive", 0) - business_sentiment.get("positive", 0),
                    "negative": competitor.sentiment_analysis.get("negative", 0) - business_sentiment.get("negative", 0)
                }
            }
            comparison_data["competitors"].append(competitor_data)
        
        # Generate insights
        comparison_data["insights"] = self._generate_competitor_insights(comparison_data)
        
        return comparison_data
    
    def _calculate_sentiment_breakdown(self, reviews: List[BusinessReview]) -> Dict[str, int]:
        """Calculate sentiment breakdown for reviews"""
        breakdown = {"positive": 0, "negative": 0, "neutral": 0}
        for review in reviews:
            breakdown[review.sentiment_label] += 1
        return breakdown
    
    def _generate_competitor_insights(self, comparison_data: Dict[str, Any]) -> List[str]:
        """Generate insights from competitor comparison"""
        insights = []
        
        business = comparison_data["business"]
        competitors = comparison_data["competitors"]
        
        if not competitors:
            return ["No competitors available for comparison"]
        
        # Rating comparison
        avg_competitor_rating = sum(c["average_rating"] for c in competitors) / len(competitors)
        if business["average_rating"] > avg_competitor_rating:
            insights.append("Your business rating is above the local average")
        elif business["average_rating"] < avg_competitor_rating:
            insights.append("Your business rating is below the local average")
        
        # Sentiment comparison
        avg_positive_sentiment = sum(c["sentiment_breakdown"]["positive"] for c in competitors) / len(competitors)
        if business["sentiment_breakdown"]["positive"] > avg_positive_sentiment:
            insights.append("Your positive sentiment is above competitor average")
        
        # Common strengths and weaknesses
        all_strengths = []
        all_weaknesses = []
        for competitor in competitors:
            all_strengths.extend(competitor["strength_areas"])
            all_weaknesses.extend(competitor["weakness_areas"])
        
        if all_strengths:
            common_strengths = [s for s in set(all_strengths) if all_strengths.count(s) > 1]
            if common_strengths:
                insights.append(f"Common competitor strengths: {', '.join(common_strengths)}")
        
        if all_weaknesses:
            common_weaknesses = [w for w in set(all_weaknesses) if all_weaknesses.count(w) > 1]
            if common_weaknesses:
                insights.append(f"Common competitor weaknesses: {', '.join(common_weaknesses)}")
        
        return insights
    
    def generate_review_response(self, review_id: str, tone: str = "professional") -> str:
        """
        Generate automated response for a review
        
        Args:
            review_id: ID of the review to respond to
            tone: Response tone (professional, friendly, apologetic)
            
        Returns:
            Generated response text
        """
        if review_id not in self.reviews:
            raise ValueError("Review not found")
        
        review = self.reviews[review_id]
        
        # Generate response based on rating and sentiment
        if review.rating >= 4:
            response_templates = {
                "professional": f"Thank you for your {review.rating}-star review, {review.reviewer_name}! We're delighted that you had a positive experience with our {', '.join(review.key_topics)}. We appreciate your business and look forward to serving you again soon.",
                "friendly": f"Wow, thank you so much for the amazing {review.rating}-star review, {review.reviewer_name}! We're thrilled you loved our {', '.join(review.key_topics)}. Your support means the world to us. Come see us again soon!"
            }
        elif review.rating == 3:
            response_templates = {
                "professional": f"Thank you for your feedback, {review.reviewer_name}. We appreciate you taking the time to share your {review.rating}-star experience. We're always looking to improve and would welcome any additional suggestions you might have.",
                "friendly": f"Thanks for the honest feedback, {review.reviewer_name}! We're glad you gave us a try and want to make sure every experience is great. Is there anything we could do better next time?"
            }
        else:
            response_templates = {
                "professional": f"Thank you for bringing this to our attention, {review.reviewer_name}. We sincerely apologize that your experience did not meet expectations. We take your feedback seriously and would appreciate the opportunity to make this right. Please contact us directly so we can address your concerns.",
                "apologetic": f"We're truly sorry to hear about your experience, {review.reviewer_name}. This is not the standard we aim for, and we want to make things right. Please reach out to us so we can personally address your concerns and restore your faith in our business."
            }
        
        return response_templates.get(tone, response_templates["professional"])
    
    def export_reviews(self, business_id: str, format: str = "csv", 
                       date_range: int = 90) -> str:
        """
        Export reviews for a business
        
        Args:
            business_id: ID of the business
            format: Export format (csv, json, excel)
            date_range: Number of days to include
            
        Returns:
            Exported data
        """
        if business_id not in self.businesses:
            raise ValueError("Business not found")
        
        # Get reviews within date range
        cutoff_date = datetime.now() - timedelta(days=date_range)
        business_reviews = [r for r in self.reviews.values() 
                           if r.business_id == business_id and r.date >= cutoff_date]
        
        if format.lower() == "csv":
            return self._export_reviews_csv(business_reviews)
        elif format.lower() == "json":
            return self._export_reviews_json(business_reviews)
        else:
            raise ValueError(f"Unsupported export format: {format}")
    
    def _export_reviews_csv(self, reviews: List[BusinessReview]) -> str:
        """Export reviews to CSV format"""
        import csv
        from io import StringIO
        
        output = StringIO()
        writer = csv.writer(output)
        
        # Write header
        writer.writerow([
            "Date", "Platform", "Reviewer", "Rating", "Sentiment", 
            "Text", "Key Topics", "Verified"
        ])
        
        # Write reviews
        for review in reviews:
            writer.writerow([
                review.date.strftime("%Y-%m-%d"),
                review.platform,
                review.reviewer_name,
                review.rating,
                review.sentiment_label,
                review.text,
                ", ".join(review.key_topics),
                "Yes" if review.is_verified else "No"
            ])
        
        return output.getvalue()
    
    def _export_reviews_json(self, reviews: List[BusinessReview]) -> str:
        """Export reviews to JSON format"""
        import json
        
        reviews_data = []
        for review in reviews:
            reviews_data.append({
                "date": review.date.isoformat(),
                "platform": review.platform,
                "reviewer_name": review.reviewer_name,
                "rating": review.rating,
                "sentiment_label": review.sentiment_label,
                "sentiment_score": review.sentiment_score,
                "text": review.text,
                "key_topics": review.key_topics,
                "is_verified": review.is_verified
            })
        
        return json.dumps(reviews_data, indent=2)
    
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
        user_business_ids = self.user_businesses.get(user_email, [])
        
        # Get user's businesses
        user_businesses = [self.businesses[bid] for bid in user_business_ids if bid in self.businesses]
        
        # Calculate statistics
        total_businesses = len(user_businesses)
        active_businesses = len([b for b in user_businesses if b.is_active])
        
        # Review statistics
        all_reviews = []
        for business_id in user_business_ids:
            business_reviews = [r for r in self.reviews.values() if r.business_id == business_id]
            all_reviews.extend(business_reviews)
        
        total_reviews = len(all_reviews)
        if total_reviews > 0:
            average_rating = sum(r.rating for r in all_reviews) / total_reviews
            sentiment_breakdown = self._calculate_sentiment_breakdown(all_reviews)
        else:
            average_rating = 0
            sentiment_breakdown = {"positive": 0, "negative": 0, "neutral": 0}
        
        # Platform breakdown
        platform_usage = {}
        for business in user_businesses:
            for platform in business.platforms:
                platform_usage[platform] = platform_usage.get(platform, 0) + 1
        
        # Recent activity (last 30 days)
        month_ago = datetime.now() - timedelta(days=30)
        recent_reviews = [r for r in all_reviews if r.date >= month_ago]
        
        analytics = {
            "user": {
                "email": user_email,
                "name": user.name,
                "plan": user.plan
            },
            "businesses": {
                "total": total_businesses,
                "active": active_businesses,
                "platforms_tracked": list(set([p for b in user_businesses for p in b.platforms]))
            },
            "reviews": {
                "total": total_reviews,
                "recent": len(recent_reviews),
                "average_rating": round(average_rating, 2),
                "sentiment_breakdown": sentiment_breakdown
            },
            "platforms": platform_usage,
            "recent_activity": self._get_recent_activity(user_email)
        }
        
        return analytics
    
    def _get_recent_activity(self, user_email: str) -> List[Dict[str, Any]]:
        """Get recent activity for user"""
        user_business_ids = self.user_businesses.get(user_email, [])
        recent_activity = []
        
        # Recent reviews
        for business_id in user_business_ids:
            business_reviews = [r for r in self.reviews.values() if r.business_id == business_id]
            recent_reviews = sorted(business_reviews, key=lambda r: r.date, reverse=True)[:3]
            
            for review in recent_reviews:
                recent_activity.append({
                    "type": "new_review",
                    "business_name": self.businesses.get(business_id, {}).name or "Unknown",
                    "platform": review.platform,
                    "rating": review.rating,
                    "sentiment": review.sentiment_label,
                    "date": review.date.isoformat()
                })
        
        return sorted(recent_activity, key=lambda x: x["date"], reverse=True)[:10]
    
    def handle_core_logic(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Handle review intelligence specific requests
        
        Routes requests to appropriate review functions.
        """
        action = data.get("action", "")
        
        try:
            if action == "add_business":
                result = self.add_business(
                    user_email=data["user_email"],
                    name=data["name"],
                    category=data["category"],
                    address=data["address"],
                    phone=data["phone"],
                    website=data["website"],
                    platforms=data.get("platforms", ["Google", "Yelp"])
                )
                return {"status": "success", "business": result.__dict__}
            
            elif action == "collect_reviews":
                result = self.collect_reviews(
                    business_id=data["business_id"],
                    platform=data.get("platform")
                )
                return {"status": "success", "reviews": [r.__dict__ for r in result]}
            
            elif action == "get_analytics":
                result = self.get_business_analytics(data["business_id"])
                return {"status": "success", "analytics": result}
            
            elif action == "add_competitor":
                result = self.add_competitor(
                    business_id=data["business_id"],
                    competitor_name=data["competitor_name"],
                    competitor_address=data["competitor_address"]
                )
                return {"status": "success", "competitor": result.__dict__}
            
            elif action == "get_competitor_comparison":
                result = self.get_competitor_comparison(data["business_id"])
                return {"status": "success", "comparison": result}
            
            elif action == "generate_response":
                response = self.generate_review_response(
                    review_id=data["review_id"],
                    tone=data.get("tone", "professional")
                )
                return {"status": "success", "response": response}
            
            elif action == "export_reviews":
                export_data = self.export_reviews(
                    business_id=data["business_id"],
                    format=data.get("format", "csv"),
                    date_range=data.get("date_range", 90)
                )
                return {"status": "success", "export": export_data}
            
            elif action == "get_user_analytics":
                result = self.get_user_analytics(data["user_email"])
                return {"status": "success", "analytics": result}
            
            else:
                return {"status": "error", "message": f"Unknown action: {action}"}
                
        except Exception as e:
            logger.error(f"Error handling action {action}: {e}")
            return {"status": "error", "message": str(e)}

def main():
    """
    Demo Local Review Intelligence
    
    This function demonstrates core functionality with sample data.
    """
    print("🏢 Local Business Review Intelligence Demo")
    print("=" * 50)
    
    # Initialize intelligence system
    intelligence = LocalReviewIntelligence()
    
    # Register a demo user
    try:
        user = intelligence.register_user(
            email="business@example.com",
            name="Business Owner",
            password="business123"
        )
        print(f"✅ Registered user: {user.name}")
        
        # Login user
        logged_in_user = intelligence.login_user("business@example.com", "business123")
        if logged_in_user:
            print(f"✅ Logged in as: {logged_in_user.name}")
        
        # Add a business
        business = intelligence.add_business(
            user_email="business@example.com",
            name="The Cozy Cafe",
            category="restaurant",
            address="123 Main Street, Anytown, USA",
            phone="(555) 123-4567",
            website="https://cozycafe.com",
            platforms=["Google", "Yelp", "Facebook"]
        )
        print(f"✅ Added business: {business.name}")
        
        # Collect reviews
        reviews = intelligence.collect_reviews(business.id)
        print(f"✅ Collected {len(reviews)} reviews")
        
        # Get business analytics
        analytics = intelligence.get_business_analytics(business.id)
        print(f"✅ Business analytics: {analytics['reviews']['total']} reviews, {analytics['reviews']['average_rating']} avg rating")
        
        # Display review breakdown
        print(f"\n📊 Review Analysis:")
        print(f"  Total Reviews: {analytics['reviews']['total']}")
        print(f"  Average Rating: {analytics['reviews']['average_rating']}/5")
        print(f"  Sentiment Breakdown: {analytics['reviews']['sentiment_breakdown']}")
        print(f"  Recent Reviews: {analytics['reviews']['recent_count']}")
        print(f"  Platform Breakdown: {analytics['reviews']['platform_breakdown']}")
        
        # Add competitors
        competitor1 = intelligence.add_competitor(
            business_id=business.id,
            competitor_name="Rival Restaurant",
            competitor_address="125 Main Street, Anytown, USA"
        )
        print(f"✅ Added competitor: {competitor1.name}")
        
        competitor2 = intelligence.add_competitor(
            business_id=business.id,
            competitor_name="Competitor Cafe",
            competitor_address="127 Main Street, Anytown, USA"
        )
        print(f"✅ Added competitor: {competitor2.name}")
        
        # Get competitor comparison
        comparison = intelligence.get_competitor_comparison(business.id)
        print(f"✅ Competitor comparison: {len(comparison['competitors'])} competitors analyzed")
        
        # Display comparison insights
        print("\n🏆 Competitive Analysis:")
        print("  Your Rating: " + str(comparison['business']['average_rating']) + "/5")
        for insight in comparison['insights']:
            print("  • " + insight)
        
        # Generate review response
        if reviews:
            response = intelligence.generate_review_response(reviews[0].id, "friendly")
            print("💬 Generated Response: " + response[:100] + "...")
        
        # Export reviews
        csv_export = intelligence.export_reviews(business.id, "csv")
        print(f"✅ Exported reviews to CSV ({len(csv_export)} characters)")
        
        # Get user analytics
        user_analytics = intelligence.get_user_analytics("business@example.com")
        print(f"✅ User analytics: {user_analytics['businesses']['total']} businesses, {user_analytics['reviews']['total']} total reviews")
        
        print("🎉 Local Review Intelligence demo complete!")
        print(f"🏢 Businesses tracked: {user_analytics['businesses']['total']}")
        print(f"⭐ Total reviews: {user_analytics['reviews']['total']}")
        print(f"📈 Average rating: {user_analytics['reviews']['average_rating']}/5")
        print(f"😊 Positive sentiment: {user_analytics['reviews']['sentiment_breakdown']['positive']}")
        print(f"😞 Negative sentiment: {user_analytics['reviews']['sentiment_breakdown']['negative']}")
        print(f"📊 Platforms tracked: {len(user_analytics['businesses']['platforms_tracked'])}")
        
    except Exception as e:
        logger.error(f"Demo failed: {e}")
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    main()
