#!/usr/bin/env python3
"""
Meeting Chaos Organizer
====================

A micro-SaaS tool that organizes meeting chaos by transcribing,
analyzing, and extracting actionable items from meeting recordings.

Features:
- Audio/video meeting transcription
- AI-powered action item extraction
- Meeting summary generation
- Participant tracking and speaking time analysis
- Decision documentation and follow-up
- Meeting analytics and insights
- Calendar integration for follow-ups
- Export capabilities for sharing

Business Model:
- Free: 1 meeting/month, basic transcription
- Basic: 10 meetings/month, action items ($9.99/month)
- Pro: 50 meetings/month, AI insights ($29.99/month)

Target Users:
- Business teams and managers
- Project managers
- Executive assistants
- Meeting facilitators
- Remote work teams

Technical Implementation:
- Audio/video transcription services
- AI/LLM for content analysis
- Speaker diarization
- Action item extraction
- Meeting analytics
- Calendar integration
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

# Configure logging specifically for meeting organization
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - [MEETING] %(message)s',
    handlers=[
        logging.FileHandler('meeting_organizer.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

@dataclass
class Meeting:
    """
    Meeting data structure
    
    Represents a meeting with all metadata and content
    needed for organization and analysis.
    
    Attributes:
        id: Unique identifier for the meeting
        title: Meeting title
        description: Meeting description or agenda
        date: Meeting date and time
        duration: Meeting duration in minutes
        participants: List of participant names
        recording_path: Path to audio/video recording
        transcript: Full meeting transcript
        summary: AI-generated meeting summary
        decisions: List of key decisions made
        action_items: List of action items
        next_steps: List of next steps identified
        created_at: When meeting was added
        owner_email: Email of the meeting owner
        is_processed: Whether AI processing is complete
    """
    id: str
    title: str
    description: str
    date: datetime
    duration: int
    participants: List[str]
    recording_path: str
    transcript: str = ""
    summary: str = ""
    decisions: List[str] = field(default_factory=list)
    action_items: List[Dict[str, Any]] = field(default_factory=list)
    next_steps: List[str] = field(default_factory=list)
    created_at: datetime = field(default_factory=datetime.now)
    owner_email: str = ""
    is_processed: bool = False

@dataclass
class ActionItem:
    """
    Action item data structure
    
    Represents an action item extracted from a meeting
    with assignment and tracking information.
    
    Attributes:
        id: Unique identifier for the action item
        meeting_id: ID of the meeting this belongs to
        description: Description of the action item
        assignee: Person assigned to the action
        due_date: Due date for completion
        priority: Priority level (high, medium, low)
        status: Current status (pending, in_progress, completed)
        context: Context or additional details
        created_at: When action item was extracted
        completed_at: When action item was completed
    """
    id: str
    meeting_id: str
    description: str
    assignee: str
    due_date: Optional[datetime]
    priority: str
    status: str
    context: str = ""
    created_at: datetime = field(default_factory=datetime.now)
    completed_at: Optional[datetime] = None

@dataclass
class Participant:
    """
    Participant data structure
    
    Represents a meeting participant with speaking
    time and contribution analysis.
    
    Attributes:
        id: Unique identifier for the participant
        meeting_id: ID of the meeting
        name: Participant name
        email: Participant email
        role: Role in the meeting (host, attendee, presenter)
        speaking_time: Total speaking time in minutes
        speaking_percentage: Percentage of total speaking time
        contributions: List of key contributions made
        engagement_score: Engagement score based on participation
        created_at: When participant was added
    """
    id: str
    meeting_id: str
    name: str
    email: str
    role: str
    speaking_time: float = 0.0
    speaking_percentage: float = 0.0
    contributions: List[str] = field(default_factory=list)
    engagement_score: float = 0.0
    created_at: datetime = field(default_factory=datetime.now)

@dataclass
class MeetingInsight:
    """
    Meeting insight data structure
    
    Represents AI-generated insights about meeting
    effectiveness and improvements.
    
    Attributes:
        id: Unique identifier for the insight
        meeting_id: ID of the meeting
        insight_type: Type of insight (efficiency, participation, decisions)
        title: Insight title
        description: Detailed insight description
        recommendations: List of actionable recommendations
        score: Insight score or rating
        created_at: When insight was generated
    """
    id: str
    meeting_id: str
    insight_type: str
    title: str
    description: str
    recommendations: List[str] = field(default_factory=list)
    score: float = 0.0
    created_at: datetime = field(default_factory=datetime.now)

class MeetingOrganizer(MicroSaaSApp):
    """
    Main Meeting Chaos Organizer application
    
    This class extends the base MicroSaaSApp with meeting-specific
    functionality for transcription, analysis, and organization.
    
    Key Features:
    - Audio/video transcription and analysis
    - AI-powered action item extraction
    - Participant speaking time analysis
    - Meeting insights and recommendations
    - Action item tracking and follow-up
    - Usage limits for freemium model
    """
    
    def __init__(self, config_file: str = "config.json"):
        """Initialize the Meeting Organizer"""
        super().__init__(config_file)
        
        # Meeting organizer specific data storage
        self.meetings: Dict[str, Meeting] = {}  # meeting_id -> Meeting
        self.action_items: Dict[str, ActionItem] = {}  # action_id -> ActionItem
        self.participants: Dict[str, Participant] = {}  # participant_id -> Participant
        self.meeting_insights: Dict[str, MeetingInsight] = {}  # insight_id -> MeetingInsight
        
        # User meeting mapping
        self.user_meetings: Dict[str, List[str]] = {}  # user_email -> [meeting_ids]
        
        # Storage paths
        self.recordings_path = "recordings"
        self.transcripts_path = "transcripts"
        self.exports_path = "exports"
        
        # Create storage directories
        os.makedirs(self.recordings_path, exist_ok=True)
        os.makedirs(self.transcripts_path, exist_ok=True)
        os.makedirs(self.exports_path, exist_ok=True)
        
        # Action item detection patterns
        self.action_keywords = [
            "action", "action item", "follow up", "follow-up", "todo", "task",
            "responsible", "assign", "complete", "finish", "deadline", "due date",
            "by next meeting", "by end of week", "by friday", "asap", "immediately"
        ]
        
        # Decision detection patterns
        self.decision_keywords = [
            "decide", "decision", "agreed", "agreement", "concluded", "determined",
            "final", "approved", "rejected", "accepted", "confirmed", "settled"
        ]
        
        logger.info("Meeting Organizer initialized")
        logger.info(f"Recordings path: {self.recordings_path}")
        logger.info(f"Loaded {len(self.meetings)} meetings")
    
    def upload_meeting(self, user_email: str, recording_data: bytes, file_name: str,
                      title: str, description: str, date: datetime, duration: int,
                      participants: List[str] = None) -> Meeting:
        """
        Upload and process a meeting recording
        
        Args:
            user_email: Email of the user uploading
            recording_data: Raw recording file data
            file_name: Original file name
            title: Meeting title
            description: Meeting description
            date: Meeting date and time
            duration: Meeting duration in minutes
            participants: List of participant names
            
        Returns:
            Created Meeting object
        """
        # Check user limits
        if user_email not in self.users:
            raise ValueError("User not found. Please register first.")
        
        user = self.users[user_email]
        user_meetings = self.user_meetings.get(user_email, [])
        meeting_limit = self.get_meeting_limit(user.plan)
        
        # Count meetings in last month
        month_ago = datetime.now() - timedelta(days=30)
        recent_meetings = len([meeting_id for meeting_id in user_meetings 
                             if meeting_id in self.meetings 
                             and self.meetings[meeting_id].created_at >= month_ago])
        
        if recent_meetings >= meeting_limit:
            raise ValueError(f"Monthly meeting limit reached ({meeting_limit}). Upgrade your plan for more processing.")
        
        # Validate file type
        if not file_name.lower().endswith(('.mp3', '.wav', '.m4a', '.mp4', '.mov', '.avi')):
            raise ValueError("Only audio (MP3, WAV, M4A) and video (MP4, MOV, AVI) files are supported")
        
        # Generate unique filename
        meeting_id = f"meeting_{uuid.uuid4().hex[:8]}"
        recording_filename = f"{meeting_id}.mp4"
        recording_path = os.path.join(self.recordings_path, recording_filename)
        
        # Store recording
        with open(recording_path, 'wb') as f:
            f.write(recording_data)
        
        # Create meeting
        new_meeting = Meeting(
            id=meeting_id,
            title=title,
            description=description,
            date=date,
            duration=duration,
            participants=participants or [],
            recording_path=recording_path,
            owner_email=user_email
        )
        
        # Store meeting
        self.meetings[meeting_id] = new_meeting
        
        # Link to user
        if user_email not in self.user_meetings:
            self.user_meetings[user_email] = []
        self.user_meetings[user_email].append(meeting_id)
        
        logger.info(f"Uploaded meeting '{title}' for user {user_email}")
        return new_meeting
    
    def get_meeting_limit(self, plan: str) -> int:
        """
        Get meeting limit based on user plan
        
        Args:
            plan: User's subscription plan
            
        Returns:
            Maximum number of meetings per month
        """
        limits = {
            "free": 1,
            "basic": 10,
            "pro": 50,
            "enterprise": 200
        }
        return limits.get(plan, 1)
    
    def transcribe_meeting(self, meeting_id: str) -> str:
        """
        Transcribe meeting recording to text
        
        In a real implementation, this would use speech-to-text
        services like OpenAI Whisper, Google Speech-to-Text, etc.
        
        Args:
            meeting_id: ID of the meeting to transcribe
            
        Returns:
            Full transcription text
        """
        if meeting_id not in self.meetings:
            raise ValueError("Meeting not found")
        
        meeting = self.meetings[meeting_id]
        
        # Simulate transcription
        # In production, you'd use actual speech-to-text
        mock_transcript = """
        [00:00:00] Host: Welcome everyone to our weekly team meeting. Today we have several important topics to discuss.
        
        [00:00:30] Host: First on the agenda is the Q3 marketing campaign. Sarah, can you give us an update?
        
        [00:01:00] Sarah: Sure! The Q3 campaign is performing 15% above our targets. We've seen great engagement on social media, particularly Instagram and LinkedIn. The conversion rate has improved to 3.2% from 2.8% last quarter.
        
        [00:01:45] Host: That's excellent news. What about the budget allocation?
        
        [00:02:00] Sarah: We're currently at 75% of the allocated budget with one month left. I recommend we reallocate the remaining 25% to focus more on Instagram ads, as that's where we're seeing the best ROI.
        
        [00:02:30] John: I agree with Sarah's recommendation. We should also consider A/B testing different ad creatives to optimize further.
        
        [00:03:00] Host: Good point. Sarah, can you set up the A/B tests by next week?
        
        [00:03:15] Sarah: Absolutely. I'll have two different creatives ready for testing by Friday.
        
        [00:03:30] Host: Perfect. Next topic: Customer feedback analysis. Mike, what are the key takeaways from our recent survey?
        
        [00:04:00] Mike: We received 234 responses. The overall satisfaction score is 4.2 out of 5. Customers love our product quality but mention concerns about shipping times. 67% of respondents want faster delivery options.
        
        [00:04:45] Host: That's valuable feedback. What are your recommendations?
        
        [00:05:00] Mike: I suggest we partner with a premium shipping service for express delivery. We could offer it as an optional upgrade. I'll research potential partners and present options by our next meeting.
        
        [00:05:30] Lisa: I support that idea. We should also communicate more clearly about our standard shipping times to manage expectations.
        
        [00:06:00] Host: Great insights. Mike, please research shipping partners and Lisa, please update our shipping communication guidelines. Both due by next week.
        
        [00:06:30] Mike: Will do.
        
        [00:06:35] Lisa: Consider it done.
        
        [00:06:45] Host: Final topic: Q4 planning. What should our main focus be?
        
        [00:07:00] John: Based on the Q3 success, I recommend we double down on our marketing efforts and expand into two new markets: Austin and Denver.
        
        [00:07:30] Sarah: I agree with the expansion, but we should also invest in improving our shipping infrastructure first, as that's a key concern for customers.
        
        [00:08:00] Host: This makes sense. Let's decide: we'll prioritize shipping improvements in October, then plan market expansion for November and December. Is everyone in agreement?
        
        [00:08:30] All: Yes, agreed.
        
        [00:08:45] Host: Excellent. Sarah, please prepare a detailed shipping improvement proposal. John, start researching the Austin and Denver markets. Both due by our next meeting.
        
        [00:09:15] Sarah: Got it.
        
        [00:09:20] John: Will do.
        
        [00:09:30] Host: Great meeting everyone. Action items have been assigned. Our next meeting is scheduled for next Tuesday at 10 AM. Thanks everyone!
        """.strip()
        
        # Store transcript
        meeting.transcript = mock_transcript
        
        # Process the transcript
        self._process_meeting_transcript(meeting)
        
        logger.info(f"Transcribed meeting {meeting_id}")
        return meeting.transcript
    
    def _process_meeting_transcript(self, meeting: Meeting):
        """
        Process meeting transcript to extract insights
        
        Args:
            meeting: Meeting with transcript to process
        """
        # Extract action items
        action_items = self._extract_action_items(meeting)
        meeting.action_items = action_items
        
        # Extract decisions
        decisions = self._extract_decisions(meeting)
        meeting.decisions = decisions
        
        # Generate summary
        summary = self._generate_meeting_summary(meeting)
        meeting.summary = summary
        
        # Analyze participants
        self._analyze_participants(meeting)
        
        # Generate insights
        insights = self._generate_meeting_insights(meeting)
        for insight in insights:
            self.meeting_insights[insight.id] = insight
        
        # Mark as processed
        meeting.is_processed = True
    
    def _extract_action_items(self, meeting: Meeting) -> List[Dict[str, Any]]:
        """
        Extract action items from meeting transcript
        
        Args:
            meeting: Meeting with transcript
            
        Returns:
            List of action items
        """
        action_items = []
        transcript_lines = meeting.transcript.split('\n')
        
        for i, line in enumerate(transcript_lines):
            # Check if line contains action keywords
            if any(keyword in line.lower() for keyword in self.action_keywords):
                # Extract action item details
                action_item = self._parse_action_item(line, transcript_lines, i, meeting)
                if action_item:
                    action_items.append(action_item)
        
        return action_items
    
    def _parse_action_item(self, line: str, transcript_lines: List[str], 
                          line_index: int, meeting: Meeting) -> Optional[Dict[str, Any]]:
        """
        Parse action item from transcript line
        
        Args:
            line: Line containing action item
            transcript_lines: All transcript lines
            line_index: Index of the current line
            meeting: Meeting context
            
        Returns:
            Action item dictionary or None
        """
        # Extract description (simplified)
        description = line.split(':')[-1].strip() if ':' in line else line.strip()
        
        # Try to find assignee from context
        assignee = self._find_assignee(transcript_lines, line_index, meeting)
        
        # Extract due date (simplified)
        due_date = self._extract_due_date(line)
        
        # Determine priority
        priority = self._determine_priority(line)
        
        # Create action item
        action_id = f"action_{uuid.uuid4().hex[:8]}"
        
        return {
            "id": action_id,
            "description": description,
            "assignee": assignee,
            "due_date": due_date,
            "priority": priority,
            "status": "pending"
        }
    
    def _find_assignee(self, transcript_lines: List[str], line_index: int, 
                      meeting: Meeting) -> str:
        """
        Find the assignee from context
        
        Args:
            transcript_lines: All transcript lines
            line_index: Index of the current line
            meeting: Meeting context
            
        Returns:
            Assignee name
        """
        # Look for speaker in the current or nearby lines
        current_line = transcript_lines[line_index]
        
        # Extract speaker from current line
        if '[' in current_line and ']' in current_line:
            speaker_part = current_line.split(']')[0].strip('[')
            if speaker_part and ':' in speaker_part:
                speaker = speaker_part.split(':')[1].strip()
                if speaker in meeting.participants:
                    return speaker
        
        # Look at previous lines for speaker
        for i in range(max(0, line_index - 5), line_index):
            line = transcript_lines[i]
            if '[' in line and ']' in line:
                speaker_part = line.split(']')[0].strip('[')
                if ':' in speaker_part:
                    speaker = speaker_part.split(':')[1].strip()
                    if speaker in meeting.participants:
                        return speaker
        
        return "Unassigned"
    
    def _extract_due_date(self, line: str) -> Optional[datetime]:
        """
        Extract due date from action item line
        
        Args:
            line: Line containing action item
            
        Returns:
            Due date or None
        """
        line_lower = line.lower()
        
        # Check for common due date patterns
        if "next week" in line_lower:
            return datetime.now() + timedelta(days=7)
        elif "by friday" in line_lower:
            days_until_friday = (4 - datetime.now().weekday()) % 7
            return datetime.now() + timedelta(days=days_until_friday)
        elif "by end of week" in line_lower:
            return datetime.now() + timedelta(days=(6 - datetime.now().weekday()))
        elif "asap" in line_lower or "immediately" in line_lower:
            return datetime.now() + timedelta(days=1)
        
        return None
    
    def _determine_priority(self, line: str) -> str:
        """
        Determine priority from context
        
        Args:
            line: Line containing action item
            
        Returns:
            Priority level
        """
        line_lower = line.lower()
        
        if "asap" in line_lower or "immediately" in line_lower or "urgent" in line_lower:
            return "high"
        elif "by next meeting" in line_lower or "important" in line_lower:
            return "medium"
        else:
            return "low"
    
    def _extract_decisions(self, meeting: Meeting) -> List[str]:
        """
        Extract decisions from meeting transcript
        
        Args:
            meeting: Meeting with transcript
            
        Returns:
            List of decisions
        """
        decisions = []
        transcript_lines = meeting.transcript.split('\n')
        
        for line in transcript_lines:
            if any(keyword in line.lower() for keyword in self.decision_keywords):
                # Extract decision (simplified)
                decision = line.split(':')[-1].strip() if ':' in line else line.strip()
                if decision and len(decision) > 10:  # Filter out short matches
                    decisions.append(decision)
        
        return decisions
    
    def _generate_meeting_summary(self, meeting: Meeting) -> str:
        """
        Generate AI-powered meeting summary
        
        Args:
            meeting: Meeting with transcript
            
        Returns:
            Meeting summary
        """
        # Generate summary based on extracted data
        summary_parts = []
        
        # Meeting overview
        summary_parts.append(f"Meeting: {meeting.title}")
        summary_parts.append(f"Duration: {meeting.duration} minutes")
        summary_parts.append(f"Participants: {len(meeting.participants)}")
        
        # Key decisions
        if meeting.decisions:
            summary_parts.append(f"\nKey Decisions:")
            for decision in meeting.decisions[:3]:  # Top 3 decisions
                summary_parts.append(f"• {decision}")
        
        # Action items
        if meeting.action_items:
            summary_parts.append(f"\nAction Items ({len(meeting.action_items)}):")
            for action in meeting.action_items[:3]:  # Top 3 action items
                summary_parts.append(f"• {action['description']} (Assigned: {action['assignee']})")
        
        # Next steps
        if meeting.next_steps:
            summary_parts.append(f"\nNext Steps:")
            for step in meeting.next_steps[:3]:  # Top 3 next steps
                summary_parts.append(f"• {step}")
        
        return '\n'.join(summary_parts)
    
    def _analyze_participants(self, meeting: Meeting):
        """
        Analyze participant contributions
        
        Args:
            meeting: Meeting to analyze
        """
        transcript_lines = meeting.transcript.split('\n')
        participant_stats = {}
        
        # Count speaking contributions
        for line in transcript_lines:
            if '[' in line and ']' in line:
                speaker_part = line.split(']')[0].strip('[')
                if ':' in speaker_part:
                    speaker = speaker_part.split(':')[1].strip()
                    if speaker in meeting.participants:
                        if speaker not in participant_stats:
                            participant_stats[speaker] = {
                                "speaking_time": 0,
                                "contributions": []
                            }
                        
                        # Estimate speaking time (simplified)
                        words = line.split(':')[-1].split() if ':' in line else []
                        speaking_time = len(words) * 0.1  # Rough estimate
                        participant_stats[speaker]["speaking_time"] += speaking_time
                        
                        # Track contributions
                        if len(words) > 5:  # Meaningful contribution
                            contribution = ':'.join(line.split(':')[1:]).strip()
                            if len(contribution) > 20:
                                participant_stats[speaker]["contributions"].append(contribution)
        
        # Calculate percentages and scores
        total_speaking_time = sum(stats["speaking_time"] for stats in participant_stats.values())
        
        for participant_name, stats in participant_stats.items():
            # Create participant object
            participant_id = f"participant_{uuid.uuid4().hex[:8]}"
            
            participant = Participant(
                id=participant_id,
                meeting_id=meeting.id,
                name=participant_name,
                email="",  # Could be extracted or provided separately
                role="attendee",  # Could be determined from context
                speaking_time=stats["speaking_time"],
                speaking_percentage=(stats["speaking_time"] / total_speaking_time * 100) if total_speaking_time > 0 else 0,
                contributions=stats["contributions"],
                engagement_score=min(100, len(stats["contributions"]) * 10 + stats["speaking_time"])
            )
            
            self.participants[participant_id] = participant
    
    def _generate_meeting_insights(self, meeting: Meeting) -> List[MeetingInsight]:
        """
        Generate AI-powered meeting insights
        
        Args:
            meeting: Meeting to analyze
            
        Returns:
            List of meeting insights
        """
        insights = []
        
        # Efficiency insight
        if meeting.duration > 60:
            efficiency_insight = MeetingInsight(
                id=f"insight_{uuid.uuid4().hex[:8]}",
                meeting_id=meeting.id,
                insight_type="efficiency",
                title="Meeting Duration Analysis",
                description=f"This meeting lasted {meeting.duration} minutes, which is longer than the recommended 45-60 minutes for optimal focus.",
                recommendations=[
                    "Consider breaking long meetings into shorter focused sessions",
                    "Send detailed agenda in advance to improve efficiency",
                    "Use a timekeeper to keep discussions on track"
                ],
                score=60.0
            )
            insights.append(efficiency_insight)
        
        # Participation insight
        meeting_participants = [p for p in self.participants.values() if p.meeting_id == meeting.id]
        if meeting_participants:
            avg_engagement = sum(p.engagement_score for p in meeting_participants) / len(meeting_participants)
            
            if avg_engagement < 50:
                participation_insight = MeetingInsight(
                    id=f"insight_{uuid.uuid4().hex[:8]}",
                    meeting_id=meeting.id,
                    insight_type="participation",
                    title="Participation Analysis",
                    description=f"Average participant engagement score is {avg_engagement:.1f}, indicating room for improvement in meeting dynamics.",
                    recommendations=[
                        "Encourage quieter participants to share their thoughts",
                        "Use round-robin speaking to ensure everyone contributes",
                        "Send pre-meeting materials to help participants prepare"
                    ],
                    score=avg_engagement
                )
                insights.append(participation_insight)
        
        # Action items insight
        if len(meeting.action_items) == 0:
            action_insight = MeetingInsight(
                id=f"insight_{uuid.uuid4().hex[:8]}",
                meeting_id=meeting.id,
                insight_type="decisions",
                title="Action Items Analysis",
                description="No action items were identified in this meeting, which may limit follow-through and accountability.",
                recommendations=[
                    "Explicitly ask for action items and assignments",
                    "Summarize decisions and next steps before ending",
                    "Use a dedicated note-taker to capture action items"
                ],
                score=30.0
            )
            insights.append(action_insight)
        
        return insights
    
    def get_meeting_analytics(self, meeting_id: str) -> Dict[str, Any]:
        """
        Get comprehensive analytics for a meeting
        
        Args:
            meeting_id: ID of the meeting
            
        Returns:
            Analytics data dictionary
        """
        if meeting_id not in self.meetings:
            raise ValueError("Meeting not found")
        
        meeting = self.meetings[meeting_id]
        
        # Get meeting participants
        meeting_participants = [p for p in self.participants.values() if p.meeting_id == meeting_id]
        
        # Get meeting insights
        meeting_insights = [i for i in self.meeting_insights.values() if i.meeting_id == meeting_id]
        
        # Calculate metrics
        total_speaking_time = sum(p.speaking_time for p in meeting_participants)
        avg_engagement = sum(p.engagement_score for p in meeting_participants) / len(meeting_participants) if meeting_participants else 0
        
        # Action item status breakdown
        action_items = [a for a in self.action_items.values() if a.meeting_id == meeting_id]
        action_status = {"pending": 0, "in_progress": 0, "completed": 0}
        for action in action_items:
            action_status[action["status"]] += 1
        
        return {
            "meeting": {
                "id": meeting.id,
                "title": meeting.title,
                "date": meeting.date.isoformat(),
                "duration": meeting.duration,
                "participants_count": len(meeting.participants),
                "is_processed": meeting.is_processed
            },
            "transcript": {
                "word_count": len(meeting.transcript.split()) if meeting.transcript else 0,
                "character_count": len(meeting.transcript) if meeting.transcript else 0
            },
            "participants": {
                "total": len(meeting_participants),
                "total_speaking_time": round(total_speaking_time, 2),
                "average_engagement": round(avg_engagement, 2),
                "top_speakers": sorted(
                    [{"name": p.name, "time": p.speaking_time} for p in meeting_participants],
                    key=lambda x: x["time"], reverse=True
                )[:3]
            },
            "action_items": {
                "total": len(action_items),
                "by_status": action_status,
                "by_priority": {
                    "high": len([a for a in action_items if a["priority"] == "high"]),
                    "medium": len([a for a in action_items if a["priority"] == "medium"]),
                    "low": len([a for a in action_items if a["priority"] == "low"])
                }
            },
            "decisions": {
                "total": len(meeting.decisions),
                "decisions": meeting.decisions[:5]  # Top 5 decisions
            },
            "insights": {
                "total": len(meeting_insights),
                "average_score": round(sum(i.score for i in meeting_insights) / len(meeting_insights), 2) if meeting_insights else 0,
                "by_type": {
                    insight_type: len([i for i in meeting_insights if i.insight_type == insight_type])
                    for insight_type in set(i.insight_type for i in meeting_insights)
                }
            }
        }
    
    def update_action_item_status(self, action_id: str, status: str) -> ActionItem:
        """
        Update action item status
        
        Args:
            action_id: ID of the action item
            status: New status
            
        Returns:
            Updated ActionItem object
        """
        if action_id not in self.action_items:
            raise ValueError("Action item not found")
        
        action = self.action_items[action_id]
        action.status = status
        
        if status == "completed":
            action.completed_at = datetime.now()
        
        logger.info(f"Updated action item {action_id} status to {status}")
        return action
    
    def export_meeting_data(self, meeting_id: str, format: str = "json") -> str:
        """
        Export meeting data in various formats
        
        Args:
            meeting_id: ID of the meeting
            format: Export format (json, csv, markdown)
            
        Returns:
            Exported data
        """
        if meeting_id not in self.meetings:
            raise ValueError("Meeting not found")
        
        meeting = self.meetings[meeting_id]
        analytics = self.get_meeting_analytics(meeting_id)
        
        if format.lower() == "json":
            export_data = {
                "meeting": {
                    "title": meeting.title,
                    "description": meeting.description,
                    "date": meeting.date.isoformat(),
                    "duration": meeting.duration,
                    "participants": meeting.participants
                },
                "transcript": meeting.transcript,
                "summary": meeting.summary,
                "decisions": meeting.decisions,
                "action_items": [a.__dict__ for a in self.action_items.values() if a.meeting_id == meeting_id],
                "analytics": analytics,
                "export_date": datetime.now().isoformat()
            }
            import json
            return json.dumps(export_data, indent=2)
        
        elif format.lower() == "markdown":
            markdown = f"""# {meeting.title}

## Meeting Details
- **Date:** {meeting.date.strftime('%Y-%m-%d %H:%M')}
- **Duration:** {meeting.duration} minutes
- **Participants:** {', '.join(meeting.participants)}

## Summary
{meeting.summary}

## Decisions
{chr(10).join(f"• {decision}" for decision in meeting.decisions)}

## Action Items
{chr(10).join(f"• {item['description']} - {item['assignee']} ({item['status']})" for item in self.action_items.values() if item.meeting_id == meeting_id)}

## Analytics
- **Total Speaking Time:** {analytics['participants']['total_speaking_time']} minutes
- **Average Engagement:** {analytics['participants']['average_engagement']}%
- **Action Items:** {analytics['action_items']['total']}
- **Decisions:** {analytics['decisions']['total']}

---
*Exported from Meeting Organizer on {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}*
"""
            return markdown
        
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
        user_meeting_ids = self.user_meetings.get(user_email, [])
        
        # Get user's meetings
        user_meetings = [self.meetings[mid] for mid in user_meeting_ids if mid in self.meetings]
        
        # Calculate statistics
        total_meetings = len(user_meetings)
        total_duration = sum(m.duration for m in user_meetings)
        total_participants = sum(len(m.participants) for m in user_meetings)
        
        # Action items across all meetings
        user_action_items = [a for a in self.action_items.values() 
                           for mid in user_meeting_ids if a.meeting_id == mid]
        
        # Recent activity (last 30 days)
        month_ago = datetime.now() - timedelta(days=30)
        recent_meetings = [m for m in user_meetings if m.created_at >= month_ago]
        
        analytics = {
            "user": {
                "email": user_email,
                "name": user.name,
                "plan": user.plan
            },
            "meetings": {
                "total": total_meetings,
                "recent": len(recent_meetings),
                "total_duration": total_duration,
                "average_duration": round(total_duration / max(1, total_meetings), 2),
                "total_participants": total_participants
            },
            "action_items": {
                "total": len(user_action_items),
                "by_status": {
                    "pending": len([a for a in user_action_items if a["status"] == "pending"]),
                    "in_progress": len([a for a in user_action_items if a["status"] == "in_progress"]),
                    "completed": len([a for a in user_action_items if a["status"] == "completed"])
                }
            },
            "recent_activity": self._get_recent_activity(user_email)
        }
        
        return analytics
    
    def _get_recent_activity(self, user_email: str) -> List[Dict[str, Any]]:
        """Get recent activity for user"""
        user_meeting_ids = self.user_meetings.get(user_email, [])
        recent_activity = []
        
        # Recent meetings
        for meeting_id in user_meeting_ids[-3:]:  # Last 3 meetings
            if meeting_id in self.meetings:
                meeting = self.meetings[meeting_id]
                recent_activity.append({
                    "type": "meeting_uploaded",
                    "title": meeting.title,
                    "date": meeting.created_at.isoformat(),
                    "duration": meeting.duration,
                    "participants": len(meeting.participants)
                })
        
        return sorted(recent_activity, key=lambda x: x["date"], reverse=True)
    
    def handle_core_logic(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Handle meeting organizer specific requests
        
        Routes requests to appropriate meeting functions.
        """
        action = data.get("action", "")
        
        try:
            if action == "upload_meeting":
                result = self.upload_meeting(
                    user_email=data["user_email"],
                    recording_data=b"FAKE_RECORDING_DATA",  # Simulated
                    file_name=data["file_name"],
                    title=data["title"],
                    description=data["description"],
                    date=datetime.fromisoformat(data["date"]),
                    duration=data["duration"],
                    participants=data.get("participants", [])
                )
                return {"status": "success", "meeting": result.__dict__}
            
            elif action == "transcribe_meeting":
                transcript = self.transcribe_meeting(data["meeting_id"])
                return {"status": "success", "transcript": transcript}
            
            elif action == "get_analytics":
                result = self.get_meeting_analytics(data["meeting_id"])
                return {"status": "success", "analytics": result}
            
            elif action == "update_action_status":
                result = self.update_action_item_status(
                    action_id=data["action_id"],
                    status=data["status"]
                )
                return {"status": "success", "action_item": result.__dict__}
            
            elif action == "export_meeting":
                export_data = self.export_meeting_data(
                    meeting_id=data["meeting_id"],
                    format=data.get("format", "json")
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
    Demo Meeting Organizer
    
    This function demonstrates core functionality with sample data.
    """
    print("📅 Meeting Chaos Organizer Demo")
    print("=" * 50)
    
    # Initialize organizer
    organizer = MeetingOrganizer()
    
    # Register a demo user
    try:
        user = organizer.register_user(
            email="manager@example.com",
            name="Team Manager",
            password="meeting123"
        )
        print(f"✅ Registered user: {user.name}")
        
        # Login user
        logged_in_user = organizer.login_user("manager@example.com", "meeting123")
        if logged_in_user:
            print(f"✅ Logged in as: {logged_in_user.name}")
        
        # Upload a meeting
        meeting = organizer.upload_meeting(
            user_email="manager@example.com",
            recording_data=b"FAKE_RECORDING_DATA",
            file_name="team_meeting.mp4",
            title="Q3 Marketing Campaign Review",
            description="Weekly team meeting to discuss Q3 marketing performance and planning",
            date=datetime.now() - timedelta(days=1),
            duration=65,
            participants=["Host", "Sarah", "John", "Mike", "Lisa"]
        )
        print(f"✅ Uploaded meeting: {meeting.title}")
        
        # Transcribe the meeting
        transcript = organizer.transcribe_meeting(meeting.id)
        print(f"✅ Transcribed meeting ({len(transcript)} characters)")
        
        # Display extracted data
        print(f"\n📋 Meeting Analysis Results:")
        print(f"  Action items: {len(meeting.action_items)}")
        print(f"  Decisions: {len(meeting.decisions)}")
        print(f"  Participants: {len(meeting.participants)}")
        
        # Display action items
        if meeting.action_items:
            print(f"\n✅ Action Items:")
            for i, action in enumerate(meeting.action_items, 1):
                print(f"  {i}. {action['description']} - {action['assignee']} ({action['priority']})")
        
        # Display decisions
        if meeting.decisions:
            print(f"\n🎯 Decisions:")
            for i, decision in enumerate(meeting.decisions, 1):
                print(f"  {i}. {decision}")
        
        # Display summary
        print(f"\n📝 Meeting Summary:")
        print(meeting.summary[:200] + "..." if len(meeting.summary) > 200 else meeting.summary)
        
        # Get meeting analytics
        analytics = organizer.get_meeting_analytics(meeting.id)
        print(f"✅ Meeting analytics: {analytics['participants']['total']} participants, {analytics['action_items']['total']} action items")
        
        # Update action item status
        if meeting.action_items:
            updated_action = organizer.update_action_item_status(
                meeting.action_items[0]["id"], 
                "in_progress"
            )
            print(f"✅ Updated action item status: {updated_action.status}")
        
        # Export meeting data
        json_export = organizer.export_meeting_data(meeting.id, "json")
        print(f"✅ Exported JSON ({len(json_export)} characters)")
        
        # Get user analytics
        user_analytics = organizer.get_user_analytics("manager@example.com")
        print(f"✅ User analytics: {user_analytics['meetings']['total']} meetings, {user_analytics['action_items']['total']} action items")
        
        print("\n🎉 Meeting Chaos Organizer demo complete!")
        print(f"📅 Meetings processed: {user_analytics['meetings']['total']}")
        print(f"⏱️ Total duration: {user_analytics['meetings']['total_duration']} minutes")
        print(f("👥 Total participants: " + str(user_analytics['meetings']['total_participants']))
        print(f"✅ Action items: " + str(user_analytics['action_items']['total']))
        print(f"📊 Average meeting duration: " + str(user_analytics['meetings']['average_duration']) + " minutes")
        
    except Exception as e:
        logger.error(f"Demo failed: {e}")
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    main()
