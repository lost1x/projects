#!/usr/bin/env python3
"""
Podcast Content Repurposer
==========================

A micro-SaaS tool that automatically repurposes podcast content into
multiple formats for maximum reach and engagement.

Features:
- Audio transcription and analysis
- Blog post generation from episodes
- Social media content creation
- Email newsletter summaries
- Quote extraction and formatting
- Chapter/timestamp generation
- SEO optimization for repurposed content
- Multi-format export capabilities
- Content scheduling and automation

Business Model:
- Free: 1 episode/month, basic repurposing
- Basic: 10 episodes/month, social media ($9.99/month)
- Pro: 50 episodes/month, full automation ($29.99/month)

Target Users:
- Podcast creators and hosts
- Content marketing teams
- Social media managers
- Marketing agencies
- Solo entrepreneurs with podcasts

Technical Implementation:
- Audio processing and transcription
- AI content generation
- Template-based content creation
- Social media formatting
- SEO optimization
- Export and scheduling features

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

# Configure logging specifically for podcast repurposing
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - [PODCAST] %(message)s',
    handlers=[
        logging.FileHandler('podcast_repurposer.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

@dataclass
class PodcastEpisode:
    """
    Podcast episode data structure
    
    Represents a podcast episode with all metadata and content
    needed for repurposing into different formats.
    
    Attributes:
        id: Unique identifier for the episode
        title: Episode title
        description: Episode description
        audio_file_path: Path to audio file
        duration: Episode duration in seconds
        file_size: Audio file size in bytes
        transcript: Full transcription of the episode
        podcast_name: Name of the podcast
        episode_number: Episode number
        publish_date: Original publish date
        guest_names: List of guest names
        host_names: List of host names
        topics: List of main topics discussed
        key_quotes: Extracted key quotes
        chapters: Timestamp chapters
        seo_keywords: SEO-relevant keywords
        created_at: When episode was added
        owner_email: Email of the user who uploaded it
    """
    id: str
    title: str
    description: str
    audio_file_path: str
    duration: int
    file_size: int
    transcript: str = ""
    podcast_name: str = ""
    episode_number: int = 0
    publish_date: Optional[datetime] = None
    guest_names: List[str] = field(default_factory=list)
    host_names: List[str] = field(default_factory=list)
    topics: List[str] = field(default_factory=list)
    key_quotes: List[Dict[str, Any]] = field(default_factory=list)
    chapters: List[Dict[str, Any]] = field(default_factory=list)
    seo_keywords: List[str] = field(default_factory=list)
    created_at: datetime = field(default_factory=datetime.now)
    owner_email: str = ""

@dataclass
class RepurposedContent:
    """
    Repurposed content data structure
    
    Represents content generated from a podcast episode
    in various formats for different platforms.
    
    Attributes:
        id: Unique identifier for the content
        episode_id: ID of the source episode
        content_type: Type of content (blog, social, email, etc.)
        title: Content title
        content: Generated content
        platform: Target platform
        character_count: Content length
        seo_score: SEO optimization score
        engagement_prediction: Predicted engagement score
        generated_at: When content was generated
        template_used: Template used for generation
        metadata: Additional content metadata
    """
    id: str
    episode_id: str
    content_type: str
    title: str
    content: str
    platform: str
    character_count: int
    seo_score: float
    engagement_prediction: float
    generated_at: datetime = field(default_factory=datetime.now)
    template_used: str = ""
    metadata: Dict[str, Any] = field(default_factory=dict)

@dataclass
class ContentTemplate:
    """
    Content template for repurposing
    
    Defines how to transform podcast content into
    specific formats for different platforms.
    
    Attributes:
        id: Unique identifier for the template
        name: Template name
        content_type: Type of content this template generates
        platform: Target platform
        template_structure: Template structure with placeholders
        max_length: Maximum content length
        seo_guidelines: SEO optimization guidelines
        engagement_tips: Tips for maximizing engagement
        created_at: When template was created
        owner_email: Email of the template owner
        is_public: Whether template is shareable
    """
    id: str
    name: str
    content_type: str
    platform: str
    template_structure: str
    max_length: int
    seo_guidelines: Dict[str, Any] = field(default_factory=dict)
    engagement_tips: List[str] = field(default_factory=list)
    created_at: datetime = field(default_factory=datetime.now)
    owner_email: str = ""
    is_public: bool = False

class PodcastRepurposer(MicroSaaSApp):
    """
    Main Podcast Content Repurposer application
    
    This class extends the base MicroSaaSApp with podcast-specific
    functionality for content analysis, generation, and repurposing.
    
    Key Features:
    - Audio transcription and analysis
    - AI-powered content generation
    - Multi-platform content creation
    - SEO optimization
    - Template-based repurposing
    - Usage limits for freemium model
    """
    
    def __init__(self, config_file: str = "config.json"):
        """Initialize the Podcast Repurposer"""
        super().__init__(config_file)
        
        # Podcast repurposer specific data storage
        self.episodes: Dict[str, PodcastEpisode] = {}  # episode_id -> PodcastEpisode
        self.repurposed_content: Dict[str, RepurposedContent] = {}  # content_id -> RepurposedContent
        self.content_templates: Dict[str, ContentTemplate] = {}  # template_id -> ContentTemplate
        
        # User episode mapping
        self.user_episodes: Dict[str, List[str]] = {}  # user_email -> [episode_ids]
        self.user_content: Dict[str, List[str]] = {}  # user_email -> [content_ids]
        
        # Storage paths
        self.audio_path = "audio_files"
        self.transcripts_path = "transcripts"
        self.exports_path = "exports"
        
        # Create storage directories
        os.makedirs(self.audio_path, exist_ok=True)
        os.makedirs(self.transcripts_path, exist_ok=True)
        os.makedirs(self.exports_path, exist_ok=True)
        
        # Initialize default templates
        self._initialize_default_templates()
        
        logger.info("Podcast Repurposer initialized")
        logger.info(f"Audio path: {self.audio_path}")
        logger.info(f"Loaded {len(self.content_templates)} templates")
    
    def _initialize_default_templates(self):
        """Initialize default content templates"""
        
        # Blog post template
        blog_template = ContentTemplate(
            id="template_blog_default",
            name="Blog Post Template",
            content_type="blog_post",
            platform="website",
            template_structure="""# {episode_title}

## Episode Summary
{episode_summary}

## Key Takeaways
{key_takeaways}

## Notable Quotes
{notable_quotes}

## About This Episode
{episode_details}

*This blog post was generated from the {podcast_name} podcast. Listen to the full episode [here]({episode_link}).""",
            max_length=2000,
            owner_email="system",
            is_public=True
        )
        
        # Twitter thread template
        twitter_template = ContentTemplate(
            id="template_twitter_thread",
            name="Twitter Thread",
            content_type="social_media",
            platform="twitter",
            template_structure="""1/{thread_count} {hook}

{main_point}

{key_insight}

{call_to_action}

#podcast #contentmarketing {hashtags}""",
            max_length=280,
            owner_email="system",
            is_public=True
        )
        
        # LinkedIn template
        linkedin_template = ContentTemplate(
            id="template_linkedin_post",
            name="LinkedIn Post",
            content_type="social_media",
            platform="linkedin",
            template_structure="""{professional_hook}

In our latest {podcast_name} episode, we explored {main_topic}.

🎯 Key Insights:
• {insight_1}
• {insight_2}
• {insight_3}

{expert_takeaway}

{call_to_action}

#Podcast #ContentMarketing #ProfessionalDevelopment {hashtags}""",
            max_length=1300,
            owner_email="system",
            is_public=True
        )
        
        # Email newsletter template
        email_template = ContentTemplate(
            id="template_email_newsletter",
            name="Email Newsletter",
            content_type="email",
            platform="email",
            template_structure="""Subject: {email_subject}

Hi {subscriber_name},

This week's {podcast_name} episode is packed with valuable insights!

{episode_preview}

## What You'll Learn:
{learning_points}

## Quote of the Week:
"{quote_of_the_week}"

## Listen Now
{call_to_action}

Best regards,
{sender_name}""",
            max_length=5000,
            owner_email="system",
            is_public=True
        )
        
        self.content_templates[blog_template.id] = blog_template
        self.content_templates[twitter_template.id] = twitter_template
        self.content_templates[linkedin_template.id] = linkedin_template
        self.content_templates[email_template.id] = email_template
        
        logger.info("Initialized default templates")
    
    def upload_episode(self, user_email: str, audio_data: bytes, file_name: str,
                      title: str, description: str, podcast_name: str = "",
                      episode_number: int = 0) -> PodcastEpisode:
        """
        Upload and process a podcast episode
        
        Args:
            user_email: Email of the user uploading
            audio_data: Raw audio file data
            file_name: Original file name
            title: Episode title
            description: Episode description
            podcast_name: Name of the podcast
            episode_number: Episode number
            
        Returns:
            Created PodcastEpisode object
        """
        # Check user limits
        if user_email not in self.users:
            raise ValueError("User not found. Please register first.")
        
        user = self.users[user_email]
        user_episodes = self.user_episodes.get(user_email, [])
        episode_limit = self.get_episode_limit(user.plan)
        
        # Count episodes in last month
        month_ago = datetime.now() - timedelta(days=30)
        recent_episodes = len([episode_id for episode_id in user_episodes 
                              if episode_id in self.episodes 
                              and self.episodes[episode_id].created_at >= month_ago])
        
        if recent_episodes >= episode_limit:
            raise ValueError(f"Monthly episode limit reached ({episode_limit}). Upgrade your plan for more processing.")
        
        # Validate file type
        if not file_name.lower().endswith(('.mp3', '.wav', '.m4a', '.aac')):
            raise ValueError("Only audio files (MP3, WAV, M4A, AAC) are supported")
        
        # Generate unique filename
        episode_id = f"episode_{uuid.uuid4().hex[:8]}"
        audio_filename = f"{episode_id}.mp3"
        audio_path = os.path.join(self.audio_path, audio_filename)
        
        # Store audio file
        with open(audio_path, 'wb') as f:
            f.write(audio_data)
        
        # Create episode
        file_size = len(audio_data)
        duration = self._estimate_audio_duration(file_size)  # Simulated
        
        new_episode = PodcastEpisode(
            id=episode_id,
            title=title,
            description=description,
            audio_file_path=audio_path,
            duration=duration,
            file_size=file_size,
            podcast_name=podcast_name,
            episode_number=episode_number,
            owner_email=user_email
        )
        
        # Store episode
        self.episodes[episode_id] = new_episode
        
        # Link to user
        if user_email not in self.user_episodes:
            self.user_episodes[user_email] = []
        self.user_episodes[user_email].append(episode_id)
        
        logger.info(f"Uploaded episode '{title}' for user {user_email}")
        return new_episode
    
    def get_episode_limit(self, plan: str) -> int:
        """
        Get episode limit based on user plan
        
        Args:
            plan: User's subscription plan
            
        Returns:
            Maximum number of episodes per month
        """
        limits = {
            "free": 1,
            "basic": 10,
            "pro": 50,
            "enterprise": 200
        }
        return limits.get(plan, 1)
    
    def _estimate_audio_duration(self, file_size: int) -> int:
        """
        Estimate audio duration from file size
        
        In a real implementation, you'd use audio processing
        libraries to get accurate duration.
        
        Args:
            file_size: File size in bytes
            
        Returns:
            Estimated duration in seconds
        """
        # Rough estimation: 1MB ≈ 1 minute for compressed audio
        return (file_size // (1024 * 1024)) * 60
    
    def transcribe_episode(self, episode_id: str) -> str:
        """
        Transcribe audio episode to text
        
        In a real implementation, this would use speech-to-text
        services like OpenAI Whisper, Google Speech-to-Text, etc.
        
        Args:
            episode_id: ID of the episode to transcribe
            
        Returns:
            Full transcription text
        """
        if episode_id not in self.episodes:
            raise ValueError("Episode not found")
        
        episode = self.episodes[episode_id]
        
        # Simulate transcription
        # In production, you'd use actual speech-to-text
        mock_transcript = """
        [00:00:00] Host: Welcome to the {podcast_name} podcast! I'm your host, and today we have an amazing episode for you.
        
        [00:00:15] Host: Today we're discussing {main_topic}, which is something that's really been on my mind lately.
        
        [00:00:30] Guest: Absolutely! It's fascinating how {main_topic} is changing the way we think about {related_field}.
        
        [00:01:00] Host: That's so true. One of the key insights I've had is that {key_insight}.
        
        [00:01:30] Guest: I completely agree. In fact, I recently worked with a client who {example_story}.
        
        [00:02:00] Host: That's a powerful example. What would you say is the biggest misconception people have about {main_topic}?
        
        [00:02:30] Guest: Great question. I think the biggest misconception is {misconception}.
        
        [00:03:00] Host: Wow, that's really eye-opening. For our listeners who want to learn more, where can they start?
        
        [00:03:30] Guest: I'd recommend starting with {actionable_advice}.
        
        [00:04:00] Host: Perfect! And we'll have links to all of that in the show notes.
        
        [00:04:15] Host: Thank you so much for joining us today. This has been incredibly valuable.
        
        [00:04:30] Guest: It's been my pleasure. Thanks for having me!
        
        [00:04:45] Host: And thank you for listening! Don't forget to subscribe and leave us a review.
        """.format(
            podcast_name=episode.podcast_name or "Our Podcast",
            main_topic="content creation",
            related_field="digital marketing",
            key_insight="consistency beats perfection",
            example_story="transformed their business by focusing on quality over quantity",
            misconception="that you need to post every single day",
            actionable_advice="creating a content calendar that works for your schedule"
        )
        
        # Store transcript
        episode.transcript = mock_transcript.strip()
        
        # Extract additional data from transcript
        self._extract_episode_data(episode)
        
        logger.info(f"Transcribed episode {episode_id}")
        return episode.transcript
    
    def _extract_episode_data(self, episode: PodcastEpisode):
        """
        Extract additional data from transcript
        
        Args:
            episode: Episode to extract data from
        """
        # Extract key quotes (simplified)
        quotes = [
            {
                "text": "consistency beats perfection",
                "speaker": "Host",
                "timestamp": "00:01:00",
                "context": "key insight about content creation"
            },
            {
                "text": "the biggest misconception is that you need to post every single day",
                "speaker": "Guest",
                "timestamp": "00:02:30",
                "context": "discussing common myths about content creation"
            }
        ]
        episode.key_quotes = quotes
        
        # Extract topics
        episode.topics = ["content creation", "digital marketing", "consistency", "quality vs quantity"]
        
        # Generate chapters
        episode.chapters = [
            {"title": "Introduction", "timestamp": "00:00:00", "description": "Welcome and episode overview"},
            {"title": "Main Topic Discussion", "timestamp": "00:00:30", "description": "Deep dive into content creation"},
            {"title": "Key Insights", "timestamp": "00:01:00", "description": "Important takeaways and examples"},
            {"title": "Misconceptions", "timestamp": "00:02:00", "description": "Common myths debunked"},
            {"title": "Actionable Advice", "timestamp": "00:03:00", "description": "Practical tips for listeners"},
            {"title": "Conclusion", "timestamp": "00:04:00", "description": "Summary and next steps"}
        ]
        
        # Generate SEO keywords
        episode.seo_keywords = ["content creation", "digital marketing", "podcast", "consistency", "quality", "strategy"]
    
    def generate_content(self, episode_id: str, template_id: str, 
                         custom_instructions: str = "") -> RepurposedContent:
        """
        Generate repurposed content from episode
        
        Args:
            episode_id: ID of the source episode
            template_id: ID of the content template
            custom_instructions: Additional instructions for content generation
            
        Returns:
            Generated RepurposedContent object
        """
        if episode_id not in self.episodes:
            raise ValueError("Episode not found")
        
        if template_id not in self.content_templates:
            raise ValueError("Template not found")
        
        episode = self.episodes[episode_id]
        template = self.content_templates[template_id]
        
        # Ensure transcript exists
        if not episode.transcript:
            self.transcribe_episode(episode_id)
        
        # Generate content based on template
        content = self._generate_content_from_template(episode, template, custom_instructions)
        
        # Calculate metrics
        character_count = len(content)
        seo_score = self._calculate_seo_score(content, episode)
        engagement_prediction = self._predict_engagement(content, template)
        
        # Create content object
        content_id = f"content_{uuid.uuid4().hex[:8]}"
        new_content = RepurposedContent(
            id=content_id,
            episode_id=episode_id,
            content_type=template.content_type,
            title=self._generate_content_title(episode, template),
            content=content,
            platform=template.platform,
            character_count=character_count,
            seo_score=seo_score,
            engagement_prediction=engagement_prediction,
            template_used=template.name
        )
        
        # Store content
        self.repurposed_content[content_id] = new_content
        
        # Link to user
        user_email = episode.owner_email
        if user_email not in self.user_content:
            self.user_content[user_email] = []
        self.user_content[user_email].append(content_id)
        
        logger.info(f"Generated {template.content_type} content for episode {episode_id}")
        return new_content
    
    def _generate_content_from_template(self, episode: PodcastEpisode, 
                                       template: ContentTemplate, 
                                       custom_instructions: str) -> str:
        """
        Generate content using template
        
        Args:
            episode: Source episode
            template: Content template
            custom_instructions: Additional instructions
            
        Returns:
            Generated content
        """
        # Prepare template variables
        variables = {
            "episode_title": episode.title,
            "episode_summary": self._generate_summary(episode),
            "key_takeaways": self._generate_takeaways(episode),
            "notable_quotes": self._format_quotes(episode.key_quotes),
            "episode_details": episode.description,
            "podcast_name": episode.podcast_name,
            "episode_link": f"https://example.com/episode/{episode.id}",
            "hook": self._generate_hook(episode),
            "main_point": self._extract_main_point(episode),
            "key_insight": self._extract_key_insight(episode),
            "call_to_action": self._generate_call_to_action(episode),
            "hashtags": " ".join([f"#{keyword.replace(' ', '')}" for keyword in episode.seo_keywords[:3]]),
            "professional_hook": self._generate_professional_hook(episode),
            "main_topic": episode.topics[0] if episode.topics else "content strategy",
            "insight_1": episode.key_quotes[0]["text"] if episode.key_quotes else "Great insight",
            "insight_2": episode.key_quotes[1]["text"] if len(episode.key_quotes) > 1 else "Another valuable point",
            "insight_3": "Third key insight from the discussion",
            "expert_takeaway": f"Expert advice: {episode.key_quotes[0]['text'] if episode.key_quotes else 'Valuable advice'}",
            "email_subject": f"New Episode: {episode.title}",
            "subscriber_name": "Subscriber",
            "episode_preview": self._generate_preview(episode),
            "learning_points": self._generate_learning_points(episode),
            "quote_of_the_week": episode.key_quotes[0]["text"] if episode.key_quotes else "Inspiring quote",
            "sender_name": "Podcast Team"
        }
        
        # Replace placeholders in template
        content = template.template_structure
        for placeholder, value in variables.items():
            content = content.replace(f"{{{placeholder}}}", str(value))
        
        # Apply custom instructions
        if custom_instructions:
            content += f"\n\n{custom_instructions}"
        
        # Ensure content doesn't exceed max length
        if len(content) > template.max_length:
            content = content[:template.max_length - 3] + "..."
        
        return content
    
    def _generate_summary(self, episode: PodcastEpisode) -> str:
        """Generate episode summary"""
        return f"In this episode of {episode.podcast_name}, we explore {episode.topics[0] if episode.topics else 'important topics'} with expert insights and practical advice."
    
    def _generate_takeaways(self, episode: PodcastEpisode) -> str:
        """Generate key takeaways"""
        takeaways = []
        for quote in episode.key_quotes[:3]:
            takeaways.append(f"• {quote['text']}")
        return "\n".join(takeaways)
    
    def _format_quotes(self, quotes: List[Dict[str, Any]]) -> str:
        """Format quotes for display"""
        formatted = []
        for quote in quotes:
            formatted.append(f"> \"{quote['text']}\" - {quote['speaker']} ({quote['timestamp']})")
        return "\n\n".join(formatted)
    
    def _generate_hook(self, episode: PodcastEpisode) -> str:
        """Generate engaging hook"""
        return f"What if I told you that {episode.key_quotes[0]['text'] if episode.key_quotes else 'one simple change could transform your results'}?"
    
    def _extract_main_point(self, episode: PodcastEpisode) -> str:
        """Extract main point from episode"""
        return episode.key_quotes[0]["text"] if episode.key_quotes else "Key insight from the discussion"
    
    def _extract_key_insight(self, episode: PodcastEpisode) -> str:
        """Extract key insight"""
        return episode.key_quotes[1]["text"] if len(episode.key_quotes) > 1 else "Another valuable insight"
    
    def _generate_call_to_action(self, episode: PodcastEpisode) -> str:
        """Generate call to action"""
        return "Listen to the full episode for more insights and subscribe to never miss an update!"
    
    def _generate_professional_hook(self, episode: PodcastEpisode) -> str:
        """Generate professional hook for LinkedIn"""
        return f"In the latest episode of {episode.podcast_name}, we dive deep into {episode.topics[0] if episode.topics else 'content strategy'}."
    
    def _generate_preview(self, episode: PodcastEpisode) -> str:
        """Generate episode preview for email"""
        return f"This week's episode features an insightful discussion about {episode.topics[0] if episode.topics else 'important topics'} with practical takeaways you can implement immediately."
    
    def _generate_learning_points(self, episode: PodcastEpisode) -> str:
        """Generate learning points"""
        points = []
        for topic in episode.topics[:3]:
            points.append(f"• Deep understanding of {topic}")
        return "\n".join(points)
    
    def _generate_content_title(self, episode: PodcastEpisode, template: ContentTemplate) -> str:
        """Generate content title"""
        if template.content_type == "blog_post":
            return f"{episode.title} - Key Takeaways & Insights"
        elif template.content_type == "social_media":
            return f"{episode.title} 🎙️"
        elif template.content_type == "email":
            return f"New Episode: {episode.title}"
        else:
            return episode.title
    
    def _calculate_seo_score(self, content: str, episode: PodcastEpisode) -> float:
        """
        Calculate SEO score for generated content
        
        Args:
            content: Generated content
            episode: Source episode
            
        Returns:
            SEO score (0-100)
        """
        score = 50  # Base score
        
        # Check for keywords
        keyword_count = sum(1 for keyword in episode.seo_keywords if keyword.lower() in content.lower())
        score += min(30, keyword_count * 5)
        
        # Check length
        if 100 <= len(content) <= 2000:
            score += 10
        elif 50 <= len(content) <= 5000:
            score += 5
        
        # Check for structure (headings, lists, etc.)
        if any(marker in content for marker in ['#', '##', '###', '*', '-']):
            score += 10
        
        return min(100, score)
    
    def _predict_engagement(self, content: str, template: ContentTemplate) -> float:
        """
        Predict engagement score for content
        
        Args:
            content: Generated content
            template: Content template
            
        Returns:
            Engagement prediction (0-100)
        """
        score = 60  # Base score
        
        # Check for engaging elements
        if any(word in content.lower() for word in ['you', 'your', 'amazing', 'incredible', 'transform']):
            score += 10
        
        # Check for questions
        if '?' in content:
            score += 10
        
        # Check for call to action
        if any(phrase in content.lower() for phrase in ['listen', 'subscribe', 'click', 'check out']):
            score += 10
        
        # Platform-specific factors
        if template.platform == "twitter" and len(content) <= 280:
            score += 10
        elif template.platform == "linkedin" and len(content) >= 100:
            score += 10
        
        return min(100, score)
    
    def get_episode_analytics(self, episode_id: str) -> Dict[str, Any]:
        """
        Get comprehensive analytics for an episode
        
        Args:
            episode_id: ID of the episode
            
        Returns:
            Analytics data
        """
        if episode_id not in self.episodes:
            raise ValueError("Episode not found")
        
        episode = self.episodes[episode_id]
        
        # Get generated content
        generated_content = [content for content in self.repurposed_content.values() 
                           if content.episode_id == episode_id]
        
        # Calculate metrics
        total_content = len(generated_content)
        content_by_type = {}
        for content in generated_content:
            content_by_type[content.content_type] = content_by_type.get(content.content_type, 0) + 1
        
        avg_seo_score = sum(c.seo_score for c in generated_content) / max(1, total_content)
        avg_engagement = sum(c.engagement_prediction for c in generated_content) / max(1, total_content)
        
        return {
            "episode": {
                "id": episode.id,
                "title": episode.title,
                "duration": episode.duration,
                "file_size": episode.file_size,
                "topics": episode.topics,
                "quotes_count": len(episode.key_quotes),
                "chapters_count": len(episode.chapters)
            },
            "content_generated": {
                "total": total_content,
                "by_type": content_by_type,
                "average_seo_score": round(avg_seo_score, 2),
                "average_engagement": round(avg_engagement, 2)
            },
            "transcript": {
                "word_count": len(episode.transcript.split()) if episode.transcript else 0,
                "character_count": len(episode.transcript) if episode.transcript else 0
            }
        }
    
    def export_content(self, content_id: str, format: str = "txt") -> str:
        """
        Export repurposed content
        
        Args:
            content_id: ID of the content to export
            format: Export format (txt, html, markdown)
            
        Returns:
            Exported content
        """
        if content_id not in self.repurposed_content:
            raise ValueError("Content not found")
        
        content = self.repurposed_content[content_id]
        
        if format.lower() == "txt":
            return content.content
        
        elif format.lower() == "html":
            return f"""<!DOCTYPE html>
<html>
<head>
    <title>{content.title}</title>
    <meta charset="utf-8">
</head>
<body>
    <h1>{content.title}</h1>
    <div>{content.content.replace('\n', '<br>')}</div>
</body>
</html>"""
        
        elif format.lower() == "markdown":
            return f"""# {content.title}

{content.content}
"""
        
        else:
            raise ValueError(f"Unsupported export format: {format}")
    
    def get_user_analytics(self, user_email: str) -> Dict[str, Any]:
        """
        Get comprehensive analytics for a user
        
        Args:
            user_email: Email of the user
            
        Returns:
            Analytics data
        """
        if user_email not in self.users:
            raise ValueError("User not found")
        
        user = self.users[user_email]
        user_episode_ids = self.user_episodes.get(user_email, [])
        user_content_ids = self.user_content.get(user_email, [])
        
        # Get user's episodes
        user_episodes = [self.episodes[eid] for eid in user_episode_ids if eid in self.episodes]
        
        # Get user's content
        user_content = [self.repurposed_content[cid] for cid in user_content_ids if cid in self.repurposed_content]
        
        # Calculate statistics
        total_episodes = len(user_episodes)
        total_content = len(user_content)
        total_duration = sum(e.duration for e in user_episodes)
        total_file_size = sum(e.file_size for e in user_episodes)
        
        # Content breakdown
        content_by_type = {}
        for content in user_content:
            content_by_type[content.content_type] = content_by_type.get(content.content_type, 0) + 1
        
        # Platform breakdown
        content_by_platform = {}
        for content in user_content:
            content_by_platform[content.platform] = content_by_platform.get(content.platform, 0) + 1
        
        # Performance metrics
        avg_seo_score = sum(c.seo_score for c in user_content) / max(1, total_content)
        avg_engagement = sum(c.engagement_prediction for c in user_content) / max(1, total_content)
        
        # Recent activity (last 30 days)
        month_ago = datetime.now() - timedelta(days=30)
        recent_episodes = [e for e in user_episodes if e.created_at >= month_ago]
        recent_content = [c for c in user_content if c.generated_at >= month_ago]
        
        analytics = {
            "user": {
                "email": user_email,
                "name": user.name,
                "plan": user.plan
            },
            "episodes": {
                "total": total_episodes,
                "recent": len(recent_episodes),
                "total_duration": total_duration,
                "total_file_size_mb": round(total_file_size / (1024 * 1024), 2),
                "average_duration": round(total_duration / max(1, total_episodes), 2)
            },
            "content": {
                "total": total_content,
                "recent": len(recent_content),
                "by_type": content_by_type,
                "by_platform": content_by_platform,
                "average_seo_score": round(avg_seo_score, 2),
                "average_engagement": round(avg_engagement, 2)
            },
            "recent_activity": self._get_recent_activity(user_email)
        }
        
        return analytics
    
    def _get_recent_activity(self, user_email: str) -> List[Dict[str, Any]]:
        """Get recent activity for user"""
        user_episode_ids = self.user_episodes.get(user_email, [])
        user_content_ids = self.user_content.get(user_email, [])
        
        recent_activity = []
        
        # Recent episodes
        for episode_id in user_episode_ids[-3:]:  # Last 3 episodes
            if episode_id in self.episodes:
                episode = self.episodes[episode_id]
                recent_activity.append({
                    "type": "episode_uploaded",
                    "title": episode.title,
                    "timestamp": episode.created_at.isoformat(),
                    "duration": episode.duration
                })
        
        # Recent content
        for content_id in user_content_ids[-5:]:  # Last 5 content items
            if content_id in self.repurposed_content:
                content = self.repurposed_content[content_id]
                recent_activity.append({
                    "type": "content_generated",
                    "content_type": content.content_type,
                    "platform": content.platform,
                    "timestamp": content.generated_at.isoformat(),
                    "seo_score": content.seo_score
                })
        
        return sorted(recent_activity, key=lambda x: x["timestamp"], reverse=True)
    
    def handle_core_logic(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Handle podcast repurposer specific requests
        
        Routes requests to appropriate podcast functions.
        """
        action = data.get("action", "")
        
        try:
            if action == "upload_episode":
                result = self.upload_episode(
                    user_email=data["user_email"],
                    audio_data=b"FAKE_AUDIO_DATA",  # Simulated
                    file_name=data["file_name"],
                    title=data["title"],
                    description=data["description"],
                    podcast_name=data.get("podcast_name", ""),
                    episode_number=data.get("episode_number", 0)
                )
                return {"status": "success", "episode": result.__dict__}
            
            elif action == "transcribe_episode":
                transcript = self.transcribe_episode(data["episode_id"])
                return {"status": "success", "transcript": transcript}
            
            elif action == "generate_content":
                result = self.generate_content(
                    episode_id=data["episode_id"],
                    template_id=data["template_id"],
                    custom_instructions=data.get("custom_instructions", "")
                )
                return {"status": "success", "content": result.__dict__}
            
            elif action == "get_episode_analytics":
                result = self.get_episode_analytics(data["episode_id"])
                return {"status": "success", "analytics": result}
            
            elif action == "export_content":
                export_data = self.export_content(
                    content_id=data["content_id"],
                    format=data.get("format", "txt")
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
    Demo Podcast Repurposer
    
    This function demonstrates core functionality with sample data.
    """
    print("🎙️ Podcast Content Repurposer Demo")
    print("=" * 50)
    
    # Initialize repurposer
    repurposer = PodcastRepurposer()
    
    # Register a demo user
    try:
        user = repurposer.register_user(
            email="podcaster@example.com",
            name="Podcast Creator",
            password="podcast123"
        )
        print(f"✅ Registered user: {user.name}")
        
        # Login user
        logged_in_user = repurposer.login_user("podcaster@example.com", "podcast123")
        if logged_in_user:
            print(f"✅ Logged in as: {logged_in_user.name}")
        
        # Upload a podcast episode
        episode = repurposer.upload_episode(
            user_email="podcaster@example.com",
            audio_data=b"FAKE_AUDIO_DATA",
            file_name="episode_001.mp3",
            title="Content Creation Strategies That Actually Work",
            description="In this episode, we dive deep into content creation strategies that deliver real results.",
            podcast_name="The Content Mastery Podcast",
            episode_number=1
        )
        print(f"✅ Uploaded episode: {episode.title}")
        
        # Transcribe the episode
        transcript = repurposer.transcribe_episode(episode.id)
        print(f"✅ Transcribed episode ({len(transcript)} characters)")
        
        # Generate blog post
        blog_content = repurposer.generate_content(
            episode_id=episode.id,
            template_id="template_blog_default"
        )
        print(f"✅ Generated blog post: {blog_content.title}")
        
        # Generate Twitter thread
        twitter_content = repurposer.generate_content(
            episode_id=episode.id,
            template_id="template_twitter_thread"
        )
        print(f"✅ Generated Twitter thread: {twitter_content.title}")
        
        # Generate LinkedIn post
        linkedin_content = repurposer.generate_content(
            episode_id=episode.id,
            template_id="template_linkedin_post"
        )
        print(f"✅ Generated LinkedIn post: {linkedin_content.title}")
        
        # Generate email newsletter
        email_content = repurposer.generate_content(
            episode_id=episode.id,
            template_id="template_email_newsletter"
        )
        print(f"✅ Generated email newsletter: {email_content.title}")
        
        # Display content metrics
        print(f"\n📊 Content Generation Results:")
        print(f"  Blog post: {blog_content.character_count} chars, SEO: {blog_content.seo_score:.1f}/100")
        print(f"  Twitter: {twitter_content.character_count} chars, Engagement: {twitter_content.engagement_prediction:.1f}/100")
        print(f"  LinkedIn: {linkedin_content.character_count} chars, SEO: {linkedin_content.seo_score:.1f}/100")
        print(f"  Email: {email_content.character_count} chars, Engagement: {email_content.engagement_prediction:.1f}/100")
        
        # Get episode analytics
        episode_analytics = repurposer.get_episode_analytics(episode.id)
        print(f"✅ Episode analytics: {episode_analytics['content_generated']['total']} pieces of content generated")
        
        # Export content
        blog_export = repurposer.export_content(blog_content.id, "markdown")
        print(f"✅ Exported blog post ({len(blog_export)} characters)")
        
        # Get user analytics
        analytics = repurposer.get_user_analytics("podcaster@example.com")
        print(f"✅ User analytics: {analytics['episodes']['total']} episodes, {analytics['content']['total']} pieces of content")
        
        print("🎉 Podcast Repurposer demo complete!")
        print(f"🎙️ Episodes processed: {analytics['episodes']['total']}")
        print(f"📝 Content generated: {analytics['content']['total']}")
        print(f"⏱️ Total duration: {analytics['episodes']['total_duration']} seconds")
        print(f"📁 Storage used: {analytics['episodes']['total_file_size_mb']} MB")
        print(f"📈 Average SEO score: {analytics['content']['average_seo_score']:.1f}/100")
        print(f"🎯 Average engagement: {analytics['content']['average_engagement']:.1f}/100")
        print(f"📊 Content types: {list(analytics['content']['by_type'].keys())}")
        
    except Exception as e:
        logger.error(f"Demo failed: {e}")
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    main()
