#!/usr/bin/env python3
"""
Freelance Pricing Calculator
==========================

A micro-SaaS tool that helps freelancers calculate optimal pricing
for their services based on market rates, experience, and project complexity.

Features:
- Market rate analysis by industry and location
- Project complexity assessment
- Experience level pricing adjustments
- Hourly vs. project-based pricing
- Profit margin calculations
- Client budget analysis
- Pricing recommendations and insights
- Quote generation and export

Business Model:
- Free: 5 quotes/month, basic calculator
- Basic: 25 quotes/month, market data ($9.99/month)
- Pro: 100 quotes/month, advanced analytics ($29.99/month)

Target Users:
- Freelancers and independent contractors
- Small business owners
- Consultants
- Creative professionals
- Service providers

Technical Implementation:
- Market rate database
- Pricing algorithms
- Complexity scoring
- Profit margin calculations
- Quote generation
- Export and sharing features

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

# Configure logging specifically for pricing calculator
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - [PRICING] %(message)s',
    handlers=[
        logging.FileHandler('freelance_pricing.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

@dataclass
class FreelancerProfile:
    """
    Freelancer profile data structure
    
    Represents a freelancer's profile with experience,
    skills, and pricing preferences.
    
    Attributes:
        id: Unique identifier for the profile
        user_email: Email of the freelancer
        name: Freelancer name
        industry: Primary industry/field
        experience_years: Years of experience
        location: Geographic location
        skills: List of key skills
        hourly_rate: Current hourly rate
        preferred_pricing: Preferred pricing model (hourly, project, retainer)
        target_income: Target monthly income
        availability: Weekly availability hours
        created_at: When profile was created
        updated_at: When profile was last updated
    """
    id: str
    user_email: str
    name: str
    industry: str
    experience_years: int
    location: str
    skills: List[str]
    hourly_rate: float
    preferred_pricing: str
    target_income: float
    availability: int
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: Optional[datetime] = None

@dataclass
class Project:
    """
    Project data structure
    
    Represents a project with details for pricing calculation.
    
    Attributes:
        id: Unique identifier for the project
        freelancer_id: ID of the freelancer
        title: Project title
        description: Project description
        industry: Project industry
        complexity: Project complexity (1-10)
        duration_estimated: Estimated duration in hours
        client_budget: Client's budget range
        deliverables: List of deliverables
        requirements: List of requirements
        timeline: Project timeline/deadline
        created_at: When project was created
    """
    id: str
    freelancer_id: str
    title: str
    description: str
    industry: str
    complexity: int
    duration_estimated: int
    client_budget: Dict[str, float]  # min, max
    deliverables: List[str]
    requirements: List[str]
    timeline: str
    created_at: datetime = field(default_factory=datetime.now)

@dataclass
class PricingCalculation:
    """
    Pricing calculation results
    
    Contains detailed pricing analysis and recommendations
    for a specific project.
    
    Attributes:
        id: Unique identifier for the calculation
        project_id: ID of the project
        freelancer_id: ID of the freelancer
        hourly_rate: Calculated hourly rate
        project_price: Total project price
        profit_margin: Profit margin percentage
        market_comparison: Market rate comparison
        pricing_model: Recommended pricing model
        confidence_score: Confidence in pricing recommendation
        insights: List of pricing insights
        alternatives: Alternative pricing options
        created_at: When calculation was performed
    """
    id: str
    project_id: str
    freelancer_id: str
    hourly_rate: float
    project_price: float
    profit_margin: float
    market_comparison: Dict[str, Any]
    pricing_model: str
    confidence_score: float
    insights: List[str]
    alternatives: List[Dict[str, Any]]
    created_at: datetime = field(default_factory=datetime.now)

@dataclass
class Quote:
    """
    Quote data structure
    
    Represents a professional quote generated for a client.
    
    Attributes:
        id: Unique identifier for the quote
        calculation_id: ID of the pricing calculation
        project_id: ID of the project
        client_name: Client name
        quote_number: Quote number
        valid_until: Quote expiration date
        terms: Payment terms
        deliverables: List of deliverables with details
        timeline: Project timeline
        pricing_breakdown: Detailed pricing breakdown
        total_price: Total quote price
        status: Quote status (draft, sent, accepted, rejected)
        created_at: When quote was created
        sent_at: When quote was sent
        accepted_at: When quote was accepted
    """
    id: str
    calculation_id: str
    project_id: str
    client_name: str
    quote_number: str
    valid_until: datetime
    terms: str
    deliverables: List[Dict[str, Any]]
    timeline: str
    pricing_breakdown: Dict[str, Any]
    total_price: float
    status: str
    created_at: datetime = field(default_factory=datetime.now)
    sent_at: Optional[datetime] = None
    accepted_at: Optional[datetime] = None

class FreelancePricingCalculator(MicroSaaSApp):
    """
    Main Freelance Pricing Calculator application
    
    This class extends the base MicroSaaSApp with pricing-specific
    functionality for freelancers and service providers.
    
    Key Features:
    - Market rate analysis and comparison
    - Project complexity assessment
    - Experience-based pricing adjustments
    - Multiple pricing models (hourly, project, retainer)
    - Profit margin calculations
    - Quote generation and management
    - Usage limits for freemium model
    """
    
    def __init__(self, config_file: str = "config.json"):
        """Initialize the Freelance Pricing Calculator"""
        super().__init__(config_file)
        
        # Pricing calculator specific data storage
        self.freelancer_profiles: Dict[str, FreelancerProfile] = {}  # profile_id -> FreelancerProfile
        self.projects: Dict[str, Project] = {}  # project_id -> Project
        self.pricing_calculations: Dict[str, PricingCalculation] = {}  # calculation_id -> PricingCalculation
        self.quotes: Dict[str, Quote] = {}  # quote_id -> Quote
        
        # User profile mapping
        self.user_profiles: Dict[str, str] = {}  # user_email -> profile_id
        
        # Market rate database (simplified)
        self.market_rates = self._initialize_market_rates()
        
        # Industry complexity factors
        self.complexity_factors = {
            "web_development": 1.2,
            "graphic_design": 1.0,
            "writing": 0.8,
            "marketing": 1.1,
            "consulting": 1.3,
            "data_science": 1.4,
            "mobile_development": 1.3,
            "photography": 0.9,
            "video_production": 1.2,
            "translation": 0.7
        }
        
        # Experience multipliers
        self.experience_multipliers = {
            0: 0.7,   # Beginner (0-1 year)
            1: 0.8,   # Junior (1-2 years)
            2: 0.9,   # Mid-level (2-3 years)
            3: 1.0,   # Professional (3-5 years)
            4: 1.15,  # Senior (5-7 years)
            5: 1.3,   # Expert (7-10 years)
            6: 1.5    # Master (10+ years)
        }
        
        logger.info("Freelance Pricing Calculator initialized")
        logger.info(f"Loaded {len(self.market_rates)} market rate categories")
    
    def _initialize_market_rates(self) -> Dict[str, Dict[str, Any]]:
        """
        Initialize market rate database
        
        Returns:
            Dictionary of market rates by industry and location
        """
        return {
            "web_development": {
                "us_west": {"min": 75, "avg": 120, "max": 200},
                "us_east": {"min": 65, "avg": 100, "max": 180},
                "europe": {"min": 50, "avg": 80, "max": 150},
                "asia": {"min": 30, "avg": 50, "max": 100}
            },
            "graphic_design": {
                "us_west": {"min": 45, "avg": 75, "max": 120},
                "us_east": {"min": 40, "avg": 65, "max": 110},
                "europe": {"min": 35, "avg": 55, "max": 90},
                "asia": {"min": 20, "avg": 35, "max": 70}
            },
            "writing": {
                "us_west": {"min": 40, "avg": 65, "max": 100},
                "us_east": {"min": 35, "avg": 55, "max": 90},
                "europe": {"min": 30, "avg": 45, "max": 75},
                "asia": {"min": 20, "avg": 30, "max": 60}
            },
            "marketing": {
                "us_west": {"min": 60, "avg": 95, "max": 150},
                "us_east": {"min": 50, "avg": 85, "max": 140},
                "europe": {"min": 40, "avg": 70, "max": 120},
                "asia": {"min": 25, "avg": 45, "max": 90}
            },
            "consulting": {
                "us_west": {"min": 100, "avg": 150, "max": 250},
                "us_east": {"min": 85, "avg": 130, "max": 220},
                "europe": {"min": 70, "avg": 110, "max": 200},
                "asia": {"min": 40, "avg": 70, "max": 150}
            }
        }
    
    def create_freelancer_profile(self, user_email: str, name: str, industry: str,
                                experience_years: int, location: str, skills: List[str],
                                hourly_rate: float, preferred_pricing: str,
                                target_income: float, availability: int) -> FreelancerProfile:
        """
        Create a freelancer profile
        
        Args:
            user_email: Email of the user
            name: Freelancer name
            industry: Primary industry
            experience_years: Years of experience
            location: Geographic location
            skills: List of skills
            hourly_rate: Current hourly rate
            preferred_pricing: Preferred pricing model
            target_income: Target monthly income
            availability: Weekly availability hours
            
        Returns:
            Created FreelancerProfile object
        """
        if user_email not in self.users:
            raise ValueError("User not found. Please register first.")
        
        # Create profile
        profile_id = f"profile_{uuid.uuid4().hex[:8]}"
        new_profile = FreelancerProfile(
            id=profile_id,
            user_email=user_email,
            name=name,
            industry=industry,
            experience_years=experience_years,
            location=location,
            skills=skills,
            hourly_rate=hourly_rate,
            preferred_pricing=preferred_pricing,
            target_income=target_income,
            availability=availability
        )
        
        # Store profile
        self.freelancer_profiles[profile_id] = new_profile
        
        # Link to user
        self.user_profiles[user_email] = profile_id
        
        logger.info(f"Created freelancer profile for {name}")
        return new_profile
    
    def create_project(self, user_email: str, title: str, description: str,
                      industry: str, complexity: int, duration_estimated: int,
                      client_budget_min: float, client_budget_max: float,
                      deliverables: List[str], requirements: List[str],
                      timeline: str) -> Project:
        """
        Create a project for pricing calculation
        
        Args:
            user_email: Email of the user
            title: Project title
            description: Project description
            industry: Project industry
            complexity: Project complexity (1-10)
            duration_estimated: Estimated duration in hours
            client_budget_min: Minimum client budget
            client_budget_max: Maximum client budget
            deliverables: List of deliverables
            requirements: List of requirements
            timeline: Project timeline
            
        Returns:
            Created Project object
        """
        if user_email not in self.users:
            raise ValueError("User not found. Please register first.")
        
        # Check user limits
        user = self.users[user_email]
        quote_limit = self.get_quote_limit(user.plan)
        
        # Count quotes in last month
        month_ago = datetime.now() - timedelta(days=30)
        recent_quotes = len([calc for calc in self.pricing_calculations.values() 
                           if calc.created_at >= month_ago])
        
        if recent_quotes >= quote_limit:
            raise ValueError(f"Monthly quote limit reached ({quote_limit}). Upgrade your plan for more quotes.")
        
        # Get freelancer profile
        profile_id = self.user_profiles.get(user_email)
        if not profile_id:
            raise ValueError("Please create a freelancer profile first.")
        
        # Create project
        project_id = f"project_{uuid.uuid4().hex[:8]}"
        new_project = Project(
            id=project_id,
            freelancer_id=profile_id,
            title=title,
            description=description,
            industry=industry,
            complexity=complexity,
            duration_estimated=duration_estimated,
            client_budget={"min": client_budget_min, "max": client_budget_max},
            deliverables=deliverables,
            requirements=requirements,
            timeline=timeline
        )
        
        # Store project
        self.projects[project_id] = new_project
        
        logger.info(f"Created project '{title}' for pricing calculation")
        return new_project
    
    def get_quote_limit(self, plan: str) -> int:
        """
        Get quote limit based on user plan
        
        Args:
            plan: User's subscription plan
            
        Returns:
            Maximum number of quotes per month
        """
        limits = {
            "free": 5,
            "basic": 25,
            "pro": 100,
            "enterprise": 500
        }
        return limits.get(plan, 5)
    
    def calculate_pricing(self, project_id: str) -> PricingCalculation:
        """
        Calculate optimal pricing for a project
        
        Args:
            project_id: ID of the project
            
        Returns:
            PricingCalculation results
        """
        if project_id not in self.projects:
            raise ValueError("Project not found")
        
        project = self.projects[project_id]
        profile = self.freelancer_profiles[project.freelancer_id]
        
        # Calculate base hourly rate
        base_rate = self._calculate_base_hourly_rate(profile, project)
        
        # Adjust for complexity
        complexity_adjusted_rate = base_rate * (1 + (project.complexity - 5) * 0.1)
        
        # Calculate project price
        project_price = complexity_adjusted_rate * project.duration_estimated
        
        # Calculate profit margin
        profit_margin = self._calculate_profit_margin(project_price, project.duration_estimated)
        
        # Market comparison
        market_comparison = self._get_market_comparison(profile, project)
        
        # Generate insights
        insights = self._generate_pricing_insights(profile, project, project_price, market_comparison)
        
        # Generate alternatives
        alternatives = self._generate_pricing_alternatives(profile, project, project_price)
        
        # Determine confidence score
        confidence_score = self._calculate_confidence_score(profile, project, market_comparison)
        
        # Create calculation
        calculation_id = f"calc_{uuid.uuid4().hex[:8]}"
        calculation = PricingCalculation(
            id=calculation_id,
            project_id=project_id,
            freelancer_id=profile.id,
            hourly_rate=complexity_adjusted_rate,
            project_price=project_price,
            profit_margin=profit_margin,
            market_comparison=market_comparison,
            pricing_model=profile.preferred_pricing,
            confidence_score=confidence_score,
            insights=insights,
            alternatives=alternatives
        )
        
        # Store calculation
        self.pricing_calculations[calculation_id] = calculation
        
        logger.info(f"Calculated pricing for project {project_id}")
        return calculation
    
    def _calculate_base_hourly_rate(self, profile: FreelancerProfile, project: Project) -> float:
        """
        Calculate base hourly rate based on profile and market
        
        Args:
            profile: Freelancer profile
            project: Project details
            
        Returns:
            Base hourly rate
        """
        # Get market rate for industry and location
        market_rate = self._get_market_rate(profile.industry, profile.location)
        
        # Adjust for experience
        experience_level = min(6, profile.experience_years // 2)
        experience_multiplier = self.experience_multipliers[experience_level]
        
        # Calculate base rate
        base_rate = market_rate * experience_multiplier
        
        # Adjust for industry complexity
        industry_factor = self.complexity_factors.get(profile.industry, 1.0)
        base_rate *= industry_factor
        
        # Consider freelancer's current rate
        if profile.hourly_rate > 0:
            # Weight current rate 40%, calculated rate 60%
            base_rate = (profile.hourly_rate * 0.4) + (base_rate * 0.6)
        
        return round(base_rate, 2)
    
    def _get_market_rate(self, industry: str, location: str) -> float:
        """
        Get market rate for industry and location
        
        Args:
            industry: Industry name
            location: Location name
            
        Returns:
            Market average rate
        """
        # Normalize location
        location_key = location.lower().replace(" ", "_")
        if location_key not in ["us_west", "us_east", "europe", "asia"]:
            location_key = "us_west"  # Default
        
        # Get industry rates
        industry_rates = self.market_rates.get(industry, self.market_rates["web_development"])
        location_rates = industry_rates.get(location_key, industry_rates["us_west"])
        
        return location_rates["avg"]
    
    def _calculate_profit_margin(self, project_price: float, duration_hours: int) -> float:
        """
        Calculate profit margin
        
        Args:
            project_price: Total project price
            duration_hours: Project duration in hours
            
        Returns:
            Profit margin percentage
        """
        # Estimate costs (simplified)
        overhead_rate = 15  # $15/hour for overhead
        total_cost = duration_hours * overhead_rate
        
        # Calculate margin
        if project_price > total_cost:
            profit = project_price - total_cost
            margin = (profit / project_price) * 100
        else:
            margin = 0
        
        return round(margin, 2)
    
    def _get_market_comparison(self, profile: FreelancerProfile, project: Project) -> Dict[str, Any]:
        """
        Compare pricing with market rates
        
        Args:
            profile: Freelancer profile
            project: Project details
            
        Returns:
            Market comparison data
        """
        market_rates = self.market_rates.get(project.industry, self.market_rates["web_development"])
        location_key = profile.location.lower().replace(" ", "_")
        if location_key not in ["us_west", "us_east", "europe", "asia"]:
            location_key = "us_west"
        
        location_rates = market_rates.get(location_key, market_rates["us_west"])
        
        # Calculate project-based hourly rate
        project_hourly_rate = (project.client_budget["min"] + project.client_budget["max"]) / 2 / project.duration_estimated
        
        return {
            "market_min": location_rates["min"],
            "market_avg": location_rates["avg"],
            "market_max": location_rates["max"],
            "client_budget_avg": project_hourly_rate,
            "position": "below" if project_hourly_rate < location_rates["min"] else "above" if project_hourly_rate > location_rates["max"] else "within",
            "market_percentile": self._calculate_market_percentile(project_hourly_rate, location_rates)
        }
    
    def _calculate_market_percentile(self, rate: float, market_rates: Dict[str, float]) -> float:
        """
        Calculate market percentile for a rate
        
        Args:
            rate: Rate to compare
            market_rates: Market rate data
            
        Returns:
            Percentile (0-100)
        """
        min_rate = market_rates["min"]
        max_rate = market_rates["max"]
        
        if rate <= min_rate:
            return 0
        elif rate >= max_rate:
            return 100
        else:
            return ((rate - min_rate) / (max_rate - min_rate)) * 100
    
    def _generate_pricing_insights(self, profile: FreelancerProfile, project: Project,
                                   project_price: float, market_comparison: Dict[str, Any]) -> List[str]:
        """
        Generate pricing insights
        
        Args:
            profile: Freelancer profile
            project: Project details
            project_price: Calculated project price
            market_comparison: Market comparison data
            
        Returns:
            List of insights
        """
        insights = []
        
        # Client budget analysis
        if project_price < project.client_budget["min"]:
            insights.append("Your pricing is below the client's minimum budget - consider increasing your rate")
        elif project_price > project.client_budget["max"]:
            insights.append("Your pricing exceeds the client's maximum budget - consider reducing scope or negotiating")
        else:
            insights.append("Your pricing aligns well with the client's budget expectations")
        
        # Market comparison
        if market_comparison["position"] == "below":
            insights.append("Your rate is below market average - you may be undervaluing your services")
        elif market_comparison["position"] == "above":
            insights.append("Your rate is above market average - ensure you can justify the premium")
        
        # Experience consideration
        if profile.experience_years < 2:
            insights.append("Consider gaining more experience before commanding premium rates")
        elif profile.experience_years > 5:
            insights.append("Your experience justifies higher rates - consider positioning yourself as an expert")
        
        # Complexity insights
        if project.complexity > 7:
            insights.append("High complexity projects warrant premium pricing and risk mitigation")
        elif project.complexity < 4:
            insights.append("Lower complexity projects may be suitable for competitive pricing")
        
        return insights
    
    def _generate_pricing_alternatives(self, profile: FreelancerProfile, project: Project,
                                      project_price: float) -> List[Dict[str, Any]]:
        """
        Generate alternative pricing options
        
        Args:
            profile: Freelancer profile
            project: Project details
            project_price: Base project price
            
        Returns:
            List of alternative pricing options
        """
        alternatives = []
        
        # Hourly alternative
        hourly_rate = project_price / project.duration_estimated
        alternatives.append({
            "model": "hourly",
            "rate": round(hourly_rate, 2),
            "total": round(project_price, 2),
            "description": f"Charge ${hourly_rate:.2f}/hour for {project.duration_estimated} hours"
        })
        
        # Project-based alternative
        alternatives.append({
            "model": "project",
            "rate": round(project_price, 2),
            "total": round(project_price, 2),
            "description": f"Fixed price of ${project_price:.2f} for the entire project"
        })
        
        # Retainer alternative (monthly)
        monthly_retainer = project_price * 1.2  # 20% premium for retainer
        alternatives.append({
            "model": "retainer",
            "rate": round(monthly_retainer, 2),
            "total": round(monthly_retainer, 2),
            "description": f"Monthly retainer of ${monthly_retainer:.2f} for ongoing work"
        })
        
        # Value-based alternative
        value_based = project_price * 1.5  # 50% premium for value-based
        alternatives.append({
            "model": "value",
            "rate": round(value_based, 2),
            "total": round(value_based, 2),
            "description": f"Value-based pricing of ${value_based:.2f} based on delivered value"
        })
        
        return alternatives
    
    def _calculate_confidence_score(self, profile: FreelancerProfile, project: Project,
                                   market_comparison: Dict[str, Any]) -> float:
        """
        Calculate confidence score for pricing recommendation
        
        Args:
            profile: Freelancer profile
            project: Project details
            market_comparison: Market comparison data
            
        Returns:
            Confidence score (0-100)
        """
        score = 50  # Base score
        
        # Experience confidence
        if profile.experience_years >= 3:
            score += 20
        elif profile.experience_years >= 1:
            score += 10
        
        # Market alignment
        if market_comparison["position"] == "within":
            score += 20
        elif market_comparison["position"] == "below":
            score += 10
        
        # Budget alignment
        if project.client_budget["min"] <= project.client_budget["max"]:
            score += 10
        
        return min(100, score)
    
    def generate_quote(self, calculation_id: str, client_name: str, terms: str) -> Quote:
        """
        Generate a professional quote
        
        Args:
            calculation_id: ID of the pricing calculation
            client_name: Client name
            terms: Payment terms
            
        Returns:
            Generated Quote object
        """
        if calculation_id not in self.pricing_calculations:
            raise ValueError("Calculation not found")
        
        calculation = self.pricing_calculations[calculation_id]
        project = self.projects[calculation.project_id]
        
        # Generate quote number
        quote_number = f"Q{datetime.now().strftime('%Y%m%d')}{uuid.uuid4().hex[:4].upper()}"
        
        # Create quote
        quote_id = f"quote_{uuid.uuid4().hex[:8]}"
        new_quote = Quote(
            id=quote_id,
            calculation_id=calculation_id,
            project_id=project.id,
            client_name=client_name,
            quote_number=quote_number,
            valid_until=datetime.now() + timedelta(days=30),
            terms=terms,
            deliverables=[{"name": d, "description": ""} for d in project.deliverables],
            timeline=project.timeline,
            pricing_breakdown={
                "hourly_rate": calculation.hourly_rate,
                "estimated_hours": project.duration_estimated,
                "subtotal": calculation.project_price,
                "tax": calculation.project_price * 0.1,  # 10% tax
                "total": calculation.project_price * 1.1
            },
            total_price=calculation.project_price * 1.1,
            status="draft"
        )
        
        # Store quote
        self.quotes[quote_id] = new_quote
        
        logger.info(f"Generated quote {quote_number} for {client_name}")
        return new_quote
    
    def export_quote(self, quote_id: str, format: str = "pdf") -> str:
        """
        Export quote in various formats
        
        Args:
            quote_id: ID of the quote
            format: Export format (pdf, html, json)
            
        Returns:
            Exported quote data
        """
        if quote_id not in self.quotes:
            raise ValueError("Quote not found")
        
        quote = self.quotes[quote_id]
        calculation = self.pricing_calculations[quote.calculation_id]
        project = self.projects[quote.project_id]
        
        if format.lower() == "json":
            import json
            quote_data = {
                "quote_number": quote.quote_number,
                "client_name": quote.client_name,
                "project_title": project.title,
                "valid_until": quote.valid_until.isoformat(),
                "pricing": quote.pricing_breakdown,
                "deliverables": quote.deliverables,
                "timeline": quote.timeline,
                "terms": quote.terms,
                "export_date": datetime.now().isoformat()
            }
            return json.dumps(quote_data, indent=2)
        
        elif format.lower() == "html":
            html_content = f"""
<!DOCTYPE html>
<html>
<head>
    <title>Quote {quote.quote_number}</title>
    <style>
        body {{ font-family: Arial, sans-serif; margin: 40px; }}
        .header {{ border-bottom: 2px solid #333; padding-bottom: 20px; }}
        .section {{ margin: 20px 0; }}
        .pricing {{ background: #f5f5f5; padding: 20px; }}
        .total {{ font-size: 24px; font-weight: bold; color: #333; }}
    </style>
</head>
<body>
    <div class="header">
        <h1>Quote #{quote.quote_number}</h1>
        <p>Date: {datetime.now().strftime('%Y-%m-%d')}</p>
        <p>Client: {quote.client_name}</p>
        <p>Valid Until: {quote.valid_until.strftime('%Y-%m-%d')}</p>
    </div>
    
    <div class="section">
        <h2>Project: {project.title}</h2>
        <p>{project.description}</p>
    </div>
    
    <div class="section pricing">
        <h3>Pricing Breakdown</h3>
        <p>Hourly Rate: ${quote.pricing_breakdown['hourly_rate']:.2f}</p>
        <p>Estimated Hours: {quote.pricing_breakdown['estimated_hours']}</p>
        <p>Subtotal: ${quote.pricing_breakdown['subtotal']:.2f}</p>
        <p>Tax (10%): ${quote.pricing_breakdown['tax']:.2f}</p>
        <p class="total">Total: ${quote.pricing_breakdown['total']:.2f}</p>
    </div>
    
    <div class="section">
        <h3>Deliverables</h3>
        <ul>
            {''.join([f'<li>{d["name"]}</li>' for d in quote.deliverables])}
        </ul>
    </div>
    
    <div class="section">
        <h3>Timeline</h3>
        <p>{quote.timeline}</p>
    </div>
    
    <div class="section">
        <h3>Terms</h3>
        <p>{quote.terms}</p>
    </div>
</body>
</html>
"""
            return html_content
        
        else:
            raise ValueError(f"Unsupported export format: {format}")
    
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
        profile_id = self.user_profiles.get(user_email)
        
        if not profile_id:
            return {
                "user": {"email": user_email, "name": user.name, "plan": user.plan},
                "profile": None,
                "projects": {"total": 0, "recent": 0},
                "quotes": {"total": 0, "recent": 0},
                "pricing": {"average_hourly": 0, "average_project": 0}
            }
        
        profile = self.freelancer_profiles[profile_id]
        
        # Get user's projects
        user_projects = [p for p in self.projects.values() if p.freelancer_id == profile_id]
        
        # Get user's calculations
        user_calculations = [c for c in self.pricing_calculations.values() if c.freelancer_id == profile_id]
        
        # Get user's quotes
        user_quotes = [q for q in self.quotes.values() if q.calculation_id in [c.id for c in user_calculations]]
        
        # Calculate statistics
        total_projects = len(user_projects)
        total_quotes = len(user_quotes)
        
        # Recent activity (last 30 days)
        month_ago = datetime.now() - timedelta(days=30)
        recent_projects = len([p for p in user_projects if p.created_at >= month_ago])
        recent_quotes = len([q for q in user_quotes if q.created_at >= month_ago])
        
        # Pricing statistics
        if user_calculations:
            avg_hourly = sum(c.hourly_rate for c in user_calculations) / len(user_calculations)
            avg_project = sum(c.project_price for c in user_calculations) / len(user_calculations)
        else:
            avg_hourly = profile.hourly_rate
            avg_project = 0
        
        analytics = {
            "user": {
                "email": user_email,
                "name": user.name,
                "plan": user.plan
            },
            "profile": {
                "name": profile.name,
                "industry": profile.industry,
                "experience_years": profile.experience_years,
                "location": profile.location,
                "hourly_rate": profile.hourly_rate,
                "target_income": profile.target_income
            },
            "projects": {
                "total": total_projects,
                "recent": recent_projects,
                "by_complexity": {
                    "low": len([p for p in user_projects if p.complexity <= 3]),
                    "medium": len([p for p in user_projects if 4 <= p.complexity <= 7]),
                    "high": len([p for p in user_projects if p.complexity >= 8])
                }
            },
            "quotes": {
                "total": total_quotes,
                "recent": recent_quotes,
                "by_status": {
                    "draft": len([q for q in user_quotes if q.status == "draft"]),
                    "sent": len([q for q in user_quotes if q.status == "sent"]),
                    "accepted": len([q for q in user_quotes if q.status == "accepted"]),
                    "rejected": len([q for q in user_quotes if q.status == "rejected"])
                }
            },
            "pricing": {
                "average_hourly": round(avg_hourly, 2),
                "average_project": round(avg_project, 2),
                "total_value": sum(q.total_price for q in user_quotes)
            }
        }
        
        return analytics
    
    def handle_core_logic(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Handle pricing calculator specific requests
        
        Routes requests to appropriate pricing functions.
        """
        action = data.get("action", "")
        
        try:
            if action == "create_profile":
                result = self.create_freelancer_profile(
                    user_email=data["user_email"],
                    name=data["name"],
                    industry=data["industry"],
                    experience_years=data["experience_years"],
                    location=data["location"],
                    skills=data["skills"],
                    hourly_rate=data["hourly_rate"],
                    preferred_pricing=data["preferred_pricing"],
                    target_income=data["target_income"],
                    availability=data["availability"]
                )
                return {"status": "success", "profile": result.__dict__}
            
            elif action == "create_project":
                result = self.create_project(
                    user_email=data["user_email"],
                    title=data["title"],
                    description=data["description"],
                    industry=data["industry"],
                    complexity=data["complexity"],
                    duration_estimated=data["duration_estimated"],
                    client_budget_min=data["client_budget_min"],
                    client_budget_max=data["client_budget_max"],
                    deliverables=data["deliverables"],
                    requirements=data["requirements"],
                    timeline=data["timeline"]
                )
                return {"status": "success", "project": result.__dict__}
            
            elif action == "calculate_pricing":
                result = self.calculate_pricing(data["project_id"])
                return {"status": "success", "calculation": result.__dict__}
            
            elif action == "generate_quote":
                result = self.generate_quote(
                    calculation_id=data["calculation_id"],
                    client_name=data["client_name"],
                    terms=data["terms"]
                )
                return {"status": "success", "quote": result.__dict__}
            
            elif action == "export_quote":
                export_data = self.export_quote(
                    quote_id=data["quote_id"],
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
    Demo Freelance Pricing Calculator
    
    This function demonstrates core functionality with sample data.
    """
    print("💰 Freelance Pricing Calculator Demo")
    print("=" * 50)
    
    # Initialize calculator
    calculator = FreelancePricingCalculator()
    
    # Register a demo user
    try:
        user = calculator.register_user(
            email="freelancer@example.com",
            name="Creative Freelancer",
            password="freelance123"
        )
        print(f"✅ Registered user: {user.name}")
        
        # Login user
        logged_in_user = calculator.login_user("freelancer@example.com", "freelance123")
        if logged_in_user:
            print(f"✅ Logged in as: {logged_in_user.name}")
        
        # Create freelancer profile
        profile = calculator.create_freelancer_profile(
            user_email="freelancer@example.com",
            name="Creative Freelancer",
            industry="web_development",
            experience_years=4,
            location="US West",
            skills=["React", "Node.js", "Python", "UI/UX Design"],
            hourly_rate=85.0,
            preferred_pricing="project",
            target_income=8000.0,
            availability=40
        )
        print(f"✅ Created profile: {profile.name}")
        
        # Create a project
        project = calculator.create_project(
            user_email="freelancer@example.com",
            title="E-commerce Website Development",
            description="Full-stack e-commerce website with payment integration",
            industry="web_development",
            complexity=7,
            duration_estimated=80,
            client_budget_min=5000,
            client_budget_max=8000,
            deliverables=["Website Design", "Frontend Development", "Backend API", "Payment Integration"],
            requirements=["Responsive design", "SEO optimization", "Performance optimization"],
            timeline="8 weeks"
        )
        print(f"✅ Created project: {project.title}")
        
        # Calculate pricing
        calculation = calculator.calculate_pricing(project.id)
        print(f"✅ Calculated pricing: ${calculation.project_price:.2f}")
        
        # Display pricing results
        print(f"\n💰 Pricing Analysis:")
        print(f"  Hourly Rate: ${calculation.hourly_rate:.2f}")
        print(f"  Project Price: ${calculation.project_price:.2f}")
        print(f"  Profit Margin: {calculation.profit_margin:.1f}%")
        print(f"  Confidence Score: {calculation.confidence_score:.1f}/100")
        print(f"  Market Position: {calculation.market_comparison['position']}")
        
        # Display insights
        print(f"\n💡 Pricing Insights:")
        for i, insight in enumerate(calculation.insights, 1):
            print(f"  {i}. {insight}")
        
        # Display alternatives
        print(f"\n🔄 Pricing Alternatives:")
        for alt in calculation.alternatives:
            print("  " + alt['model'].title() + ": $" + str(alt['total']) + " - " + alt['description'])
        
        # Generate quote
        quote = calculator.generate_quote(
            calculation_id=calculation.id,
            client_name="ABC Company",
            terms="50% upfront, 50% on completion"
        )
        print(f"✅ Generated quote: {quote.quote_number}")
        
        # Export quote
        html_export = calculator.export_quote(quote.id, "html")
        print(f"✅ Exported HTML quote ({len(html_export)} characters)")
        
        # Get user analytics
        analytics = calculator.get_user_analytics("freelancer@example.com")
        print(f"✅ User analytics: {analytics['quotes']['total']} quotes, ${analytics['pricing']['average_hourly']:.2f}/hr avg rate")
        
        print("\n🎉 Freelance Pricing Calculator demo complete!")
        print(f"💰 Quotes generated: {analytics['quotes']['total']}")
        print(f"📊 Average hourly rate: ${analytics['pricing']['average_hourly']:.2f}")
        print(f"📈 Average project price: ${analytics['pricing']['average_project']:.2f}")
        print(f"🎯 Total quote value: ${analytics['pricing']['total_value']:.2f}")
        print(f"📋 Projects analyzed: {analytics['projects']['total']}")
        print(f"👤 Profile industry: {analytics['profile']['industry']}")
        
    except Exception as e:
        logger.error(f"Demo failed: {e}")
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    main()
