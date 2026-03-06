#!/usr/bin/env python3
"""
D&D Campaign Memory Engine
==========================

A micro-SaaS tool for Dungeon Masters to track their campaigns.
This tool helps DMs organize story threads, NPC relationships, 
player decisions, and campaign lore consistency.

Features:
- NPC relationship tracking
- Plot thread management  
- Player decision logging
- Timeline events
- AI-powered session summaries
- Lore consistency checking
- PDF export for session recaps

Business Model:
- Free: 1 campaign, 10 sessions
- Basic: 3 campaigns, 100 sessions ($9.99/month)
- Pro: Unlimited campaigns, AI features ($29.99/month)

Author: Your Name
Created: 2026-03-06
"""

import os
import sys
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, field
from pathlib import Path
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
    # Handle import error
    print("Error: Could not import project_template. Make sure project-template.py exists.")
    raise

# Configure logging specifically for D&D campaign tracking
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - [D&D] %(message)s',
    handlers=[
        logging.FileHandler('dnd_campaign.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

@dataclass
class NPC:
    """
    Non-Player Character data structure
    
    Tracks NPCs across campaigns with relationships and development.
    This is crucial for DMs who want consistent character portrayals.
    
    Attributes:
        id: Unique identifier for the NPC
        name: Character name
        description: Physical appearance and personality
        location: Where the NPC can typically be found
        alignment: D&D alignment (e.g., "Lawful Good")
        relationships: Dictionary of relationship IDs to relationship types
        notes: DM notes about the NPC
        first_appearance: Session ID where NPC first appeared
        last_seen: Session ID where NPC was last seen
        status: "alive", "dead", "missing", "unknown"
        created_at: When NPC was added to system
    """
    id: str
    name: str
    description: str
    location: str
    alignment: str
    relationships: Dict[str, str] = field(default_factory=dict)
    notes: str = ""
    first_appearance: str = ""
    last_seen: str = ""
    status: str = "alive"
    created_at: datetime = field(default_factory=datetime.now)

@dataclass
class PlotThread:
    """
    Plot thread tracking for story management
    
    Helps DMs keep track of ongoing storylines and ensure
    no important plot points are forgotten.
    
    Attributes:
        id: Unique identifier
        title: Brief description of the plot thread
        description: Detailed explanation of the storyline
        status: "active", "resolved", "abandoned", "paused"
        priority: "low", "medium", "high", "critical"
        involved_npcs: List of NPC IDs involved in this thread
        involved_players: List of player names involved
        started_session: Session ID where this thread began
        resolved_session: Session ID where this was resolved (if applicable)
        tags: List of tags for categorization
        created_at: When thread was created
    """
    id: str
    title: str
    description: str
    status: str = "active"
    priority: str = "medium"
    involved_npcs: List[str] = field(default_factory=list)
    involved_players: List[str] = field(default_factory=list)
    started_session: str = ""
    resolved_session: str = ""
    tags: List[str] = field(default_factory=list)
    created_at: datetime = field(default_factory=datetime.now)

@dataclass
class PlayerDecision:
    """
    Track important player decisions and their consequences
    
    This is the core of reactive storytelling - tracking what players
    choose and how it impacts the world.
    
    Attributes:
        id: Unique identifier
        session_id: Session where this decision was made
        player_name: Who made the decision
        decision: What the player chose to do
        immediate_consequences: What happened right away
        long_term_consequences: Ongoing effects (to be updated)
        related_plot_threads: Plot threads affected by this decision
        importance: How significant this decision was (1-10)
        created_at: When decision was recorded
    """
    id: str
    session_id: str
    player_name: str
    decision: str
    immediate_consequences: str
    long_term_consequences: str = ""
    related_plot_threads: List[str] = field(default_factory=list)
    importance: int = 5
    created_at: datetime = field(default_factory=datetime.now)

@dataclass
class TimelineEvent:
    """
    Timeline events for campaign chronology
    
    Helps maintain consistent timeline and track when things happened.
    
    Attributes:
        id: Unique identifier
        session_id: Session where event occurred
        in_game_date: Date in the game world
        event_type: "combat", "social", "exploration", "discovery", "death"
        description: What happened
        location: Where it happened
        participants: Who was involved (players and NPCs)
        significance: How important this event was (1-10)
        created_at: When event was recorded
    """
    id: str
    session_id: str
    in_game_date: str
    event_type: str
    description: str
    location: str
    participants: List[str] = field(default_factory=list)
    significance: int = 5
    created_at: datetime = field(default_factory=datetime.now)

@dataclass
class Session:
    """
    Individual game session tracking
    
    Each session contains all the events, decisions, and developments
    that occurred during that game session.
    
    Attributes:
        id: Unique session identifier
        campaign_id: Which campaign this session belongs to
        session_number: Session number within the campaign
        date_played: Real-world date when session was played
        in_game_date_range: Start and end dates in game world
        summary: Brief overview of what happened
        player_attendance: List of players who attended
        new_npcs: NPCs introduced in this session
        new_plot_threads: Plot threads started in this session
        decisions_made: Key decisions made during session
        events: Timeline events from this session
        ai_summary: AI-generated session summary
        dm_notes: Private DM notes
        created_at: When session was created
    """
    id: str
    campaign_id: str
    session_number: int
    date_played: datetime
    in_game_date_range: str
    summary: str
    player_attendance: List[str] = field(default_factory=list)
    new_npcs: List[str] = field(default_factory=list)
    new_plot_threads: List[str] = field(default_factory=list)
    decisions_made: List[str] = field(default_factory=list)
    events: List[str] = field(default_factory=list)
    ai_summary: str = ""
    dm_notes: str = ""
    created_at: datetime = field(default_factory=datetime.now)

@dataclass
class Campaign:
    """
    Complete campaign data structure
    
    A campaign is the top-level container that holds all sessions,
    NPCs, plot threads, and campaign-specific data.
    
    Attributes:
        id: Unique campaign identifier
        name: Campaign name
        description: Campaign premise and setting
        dm_name: Who is running the campaign
        player_characters: List of PC names
        setting: Game world/setting name
        start_date: When campaign began
        current_session: Latest session number
        status: "active", "paused", "completed"
        house_rules: Any custom rules for this campaign
        campaign_notes: General DM notes
        created_at: When campaign was created
    """
    id: str
    name: str
    description: str
    dm_name: str
    player_characters: List[str] = field(default_factory=list)
    setting: str = ""
    start_date: datetime = field(default_factory=datetime.now)
    current_session: int = 0
    status: str = "active"
    house_rules: str = ""
    campaign_notes: str = ""
    created_at: datetime = field(default_factory=datetime.now)

class DnDCampaignEngine(MicroSaaSApp):
    """
    Main D&D Campaign Memory Engine application
    
    This class extends the base MicroSaaSApp with D&D-specific functionality
    for managing campaigns, NPCs, plot threads, and session data.
    
    Key Features:
    - Campaign management with multiple campaigns per user
    - NPC relationship tracking and consistency checking
    - Plot thread management with status tracking
    - Session logging with AI-powered summaries
    - Timeline management for chronology
    - Export functionality for session recaps
    - Usage limits for freemium model
    """
    
    def __init__(self, config_file: str = "config.json"):
        """Initialize the D&D Campaign Engine"""
        super().__init__(config_file)
        
        # D&D specific data storage
        self.campaigns: Dict[str, Campaign] = {}  # campaign_id -> Campaign
        self.npcs: Dict[str, NPC] = {}  # npc_id -> NPC
        self.plot_threads: Dict[str, PlotThread] = {}  # thread_id -> PlotThread
        self.sessions: Dict[str, Session] = {}  # session_id -> Session
        self.decisions: Dict[str, PlayerDecision] = {}  # decision_id -> PlayerDecision
        self.timeline_events: Dict[str, TimelineEvent] = {}  # event_id -> TimelineEvent
        
        # User campaign mapping - which campaigns belong to which user
        self.user_campaigns: Dict[str, List[str]] = {}  # user_email -> [campaign_ids]
        
        logger.info("D&D Campaign Engine initialized")
        logger.info(f"Loaded {len(self.campaigns)} campaigns")
    
    def create_campaign(self, user_email: str, name: str, description: str, 
                       dm_name: str, player_characters: List[str], 
                       setting: str = "") -> Campaign:
        """
        Create a new campaign for a user
        
        This is the entry point for DMs to start tracking a new campaign.
        We check usage limits here to enforce the freemium model.
        
        Args:
            user_email: Email of the user creating the campaign
            name: Campaign name
            description: Campaign description/premise
            dm_name: Name of the Dungeon Master
            player_characters: List of player character names
            setting: Game world/setting (optional)
            
        Returns:
            Created Campaign object
            
        Raises:
            ValueError: If user has reached campaign limit
        """
        # Check if user exists and get their plan
        if user_email not in self.users:
            raise ValueError("User not found. Please register first.")
        
        user = self.users[user_email]
        
        # Check campaign limits based on user plan
        user_campaigns = self.user_campaigns.get(user_email, [])
        campaign_limit = self.get_campaign_limit(user.plan)
        
        if len(user_campaigns) >= campaign_limit:
            raise ValueError(f"Campaign limit reached ({campaign_limit}). Upgrade your plan to create more campaigns.")
        
        # Create new campaign
        campaign_id = f"campaign_{uuid.uuid4().hex[:8]}"
        new_campaign = Campaign(
            id=campaign_id,
            name=name,
            description=description,
            dm_name=dm_name,
            player_characters=player_characters,
            setting=setting
        )
        
        # Store campaign
        self.campaigns[campaign_id] = new_campaign
        
        # Link to user
        if user_email not in self.user_campaigns:
            self.user_campaigns[user_email] = []
        self.user_campaigns[user_email].append(campaign_id)
        
        logger.info(f"Created campaign '{name}' for user {user_email}")
        return new_campaign
    
    def get_campaign_limit(self, plan: str) -> int:
        """
        Get campaign limit based on user plan
        
        This implements the freemium model - free users get 1 campaign,
        basic users get 3, pro users get unlimited.
        
        Args:
            plan: User's subscription plan
            
        Returns:
            Maximum number of campaigns allowed
        """
        limits = {
            "free": 1,
            "basic": 3,
            "pro": -1,  # Unlimited
            "enterprise": -1  # Unlimited
        }
        return limits.get(plan, 1)
    
    def add_npc(self, campaign_id: str, name: str, description: str, 
                location: str, alignment: str, session_id: str = "") -> NPC:
        """
        Add a new NPC to a campaign
        
        NPCs are crucial for consistent storytelling. This method
        creates a new NPC and links them to the campaign.
        
        Args:
            campaign_id: Which campaign this NPC belongs to
            name: NPC name
            description: Physical appearance and personality
            location: Where the NPC can be found
            alignment: D&D alignment
            session_id: Session where NPC first appeared (optional)
            
        Returns:
            Created NPC object
        """
        if campaign_id not in self.campaigns:
            raise ValueError("Campaign not found")
        
        # Create NPC
        npc_id = f"npc_{uuid.uuid4().hex[:8]}"
        new_npc = NPC(
            id=npc_id,
            name=name,
            description=description,
            location=location,
            alignment=alignment,
            first_appearance=session_id,
            last_seen=session_id
        )
        
        # Store NPC
        self.npcs[npc_id] = new_npc
        
        logger.info(f"Added NPC '{name}' to campaign {campaign_id}")
        return new_npc
    
    def create_session(self, campaign_id: str, session_number: int, 
                      date_played: datetime, in_game_date_range: str,
                      summary: str, player_attendance: List[str]) -> Session:
        """
        Create a new session for a campaign
        
        Sessions are the main unit of tracking - each session contains
        all the events, decisions, and developments that occurred.
        
        Args:
            campaign_id: Which campaign this session belongs to
            session_number: Session number within the campaign
            date_played: Real-world date when session was played
            in_game_date_range: Date range in the game world
            summary: Brief overview of what happened
            player_attendance: List of players who attended
            
        Returns:
            Created Session object
        """
        if campaign_id not in self.campaigns:
            raise ValueError("Campaign not found")
        
        # Create session
        session_id = f"session_{uuid.uuid4().hex[:8]}"
        new_session = Session(
            id=session_id,
            campaign_id=campaign_id,
            session_number=session_number,
            date_played=date_played,
            in_game_date_range=in_game_date_range,
            summary=summary,
            player_attendance=player_attendance
        )
        
        # Store session
        self.sessions[session_id] = new_session
        
        # Update campaign current session
        campaign = self.campaigns[campaign_id]
        campaign.current_session = max(campaign.current_session, session_number)
        
        logger.info(f"Created session {session_number} for campaign {campaign_id}")
        return new_session
    
    def add_plot_thread(self, campaign_id: str, title: str, description: str,
                       priority: str = "medium", started_session: str = "") -> PlotThread:
        """
        Add a new plot thread to track
        
        Plot threads help DMs keep track of ongoing storylines and ensure
        nothing important gets forgotten.
        
        Args:
            campaign_id: Which campaign this thread belongs to
            title: Brief description of the plot thread
            description: Detailed explanation
            priority: How important this thread is
            started_session: Session where this thread began
            
        Returns:
            Created PlotThread object
        """
        if campaign_id not in self.campaigns:
            raise ValueError("Campaign not found")
        
        # Create plot thread
        thread_id = f"thread_{uuid.uuid4().hex[:8]}"
        new_thread = PlotThread(
            id=thread_id,
            title=title,
            description=description,
            priority=priority,
            started_session=started_session
        )
        
        # Store plot thread
        self.plot_threads[thread_id] = new_thread
        
        logger.info(f"Added plot thread '{title}' to campaign {campaign_id}")
        return new_thread
    
    def record_player_decision(self, session_id: str, player_name: str,
                             decision: str, immediate_consequences: str,
                             importance: int = 5) -> PlayerDecision:
        """
        Record an important player decision
        
        Player decisions drive the story forward. Tracking them helps
        maintain consistency and creates a record of player agency.
        
        Args:
            session_id: Session where decision was made
            player_name: Who made the decision
            decision: What the player chose to do
            immediate_consequences: What happened right away
            importance: How significant this decision was (1-10)
            
        Returns:
            Created PlayerDecision object
        """
        if session_id not in self.sessions:
            raise ValueError("Session not found")
        
        # Create decision
        decision_id = f"decision_{uuid.uuid4().hex[:8]}"
        new_decision = PlayerDecision(
            id=decision_id,
            session_id=session_id,
            player_name=player_name,
            decision=decision,
            immediate_consequences=immediate_consequences,
            importance=importance
        )
        
        # Store decision
        self.decisions[decision_id] = new_decision
        
        # Link to session
        session = self.sessions[session_id]
        session.decisions_made.append(decision_id)
        
        logger.info(f"Recorded decision by {player_name} in session {session_id}")
        return new_decision
    
    def add_timeline_event(self, session_id: str, in_game_date: str,
                          event_type: str, description: str, location: str,
                          participants: List[str], significance: int = 5) -> TimelineEvent:
        """
        Add an event to the campaign timeline
        
        Timeline events help maintain chronology and track when
        important things happened in the game world.
        
        Args:
            session_id: Session where event occurred
            in_game_date: Date in the game world
            event_type: Type of event (combat, social, etc.)
            description: What happened
            location: Where it happened
            participants: Who was involved
            significance: How important this event was
            
        Returns:
            Created TimelineEvent object
        """
        if session_id not in self.sessions:
            raise ValueError("Session not found")
        
        # Create timeline event
        event_id = f"event_{uuid.uuid4().hex[:8]}"
        new_event = TimelineEvent(
            id=event_id,
            session_id=session_id,
            in_game_date=in_game_date,
            event_type=event_type,
            description=description,
            location=location,
            participants=participants,
            significance=significance
        )
        
        # Store event
        self.timeline_events[event_id] = new_event
        
        # Link to session
        session = self.sessions[session_id]
        session.events.append(event_id)
        
        logger.info(f"Added timeline event to session {session_id}")
        return new_event
    
    def generate_session_summary_ai(self, session_id: str) -> str:
        """
        Generate AI-powered session summary
        
        This is a premium feature that uses AI to create detailed
        session recaps that players can read between sessions.
        
        Args:
            session_id: Session to summarize
            
        Returns:
            AI-generated summary text
        """
        if session_id not in self.sessions:
            raise ValueError("Session not found")
        
        session = self.sessions[session_id]
        
        # In a real implementation, this would call OpenAI/Anthropic API
        # For now, we'll create a template-based summary
        
        summary_template = f"""
# Session {session.session_number} Summary

**Date Played:** {session.date_played.strftime('%Y-%m-%d')}
**In-Game Dates:** {session.in_game_date_range}
**Players Present:** {', '.join(session.player_attendance)}

## Overview
{session.summary}

## Key Events
"""
        
        # Add timeline events
        for event_id in session.events:
            if event_id in self.timeline_events:
                event = self.timeline_events[event_id]
                summary_template += f"- **{event.in_game_date}:** {event.description} ({event.event_type})\n"
        
        summary_template += "\n## Player Decisions\n"
        
        # Add player decisions
        for decision_id in session.decisions_made:
            if decision_id in self.decisions:
                decision = self.decisions[decision_id]
                summary_template += f"**{decision.player_name}:** {decision.decision}\n"
                summary_template += f"*Consequences:* {decision.immediate_consequences}\n\n"
        
        # Store AI summary
        session.ai_summary = summary_template
        
        logger.info(f"Generated AI summary for session {session_id}")
        return summary_template
    
    def check_lore_consistency(self, campaign_id: str) -> Dict[str, Any]:
        """
        Check campaign for lore consistency issues
        
        This premium feature analyzes the campaign for potential
        inconsistencies in character portrayals, timeline, etc.
        
        Args:
            campaign_id: Campaign to check
            
        Returns:
            Dictionary with consistency issues and suggestions
        """
        if campaign_id not in self.campaigns:
            raise ValueError("Campaign not found")
        
        issues = []
        suggestions = []
        
        # Check for NPCs with conflicting descriptions
        npc_names = {}
        for npc in self.npcs.values():
            if npc.name in npc_names:
                # This would be more sophisticated in real implementation
                issues.append(f"Multiple NPCs named '{npc.name}' found")
            npc_names[npc.name] = npc
        
        # Check timeline order
        campaign_sessions = [s for s in self.sessions.values() if s.campaign_id == campaign_id]
        campaign_sessions.sort(key=lambda x: x.session_number)
        
        for i, session in enumerate(campaign_sessions):
            if i > 0:
                prev_session = campaign_sessions[i-1]
                if session.session_number != prev_session.session_number + 1:
                    issues.append(f"Session numbering gap between {prev_session.session_number} and {session.session_number}")
        
        # Generate suggestions
        if len(self.npcs) > 20:
            suggestions.append("Consider archiving unused NPCs to reduce complexity")
        
        active_threads = [t for t in self.plot_threads.values() if t.status == "active"]
        if len(active_threads) > 10:
            suggestions.append("Many active plot threads - consider resolving some soon")
        
        result = {
            "campaign_id": campaign_id,
            "issues": issues,
            "suggestions": suggestions,
            "total_npcs": len(self.npcs),
            "active_plot_threads": len(active_threads),
            "total_sessions": len(campaign_sessions),
            "consistency_score": max(0, 100 - len(issues) * 10)  # Simple scoring
        }
        
        logger.info(f"Lore consistency check completed for campaign {campaign_id}")
        return result
    
    def export_session_recap(self, session_id: str, format: str = "markdown") -> str:
        """
        Export session recap for players
        
        This creates a formatted recap that DMs can share with their players
        to remind them of what happened between sessions.
        
        Args:
            session_id: Session to export
            format: Export format (markdown, html, pdf)
            
        Returns:
            Formatted session recap
        """
        if session_id not in self.sessions:
            raise ValueError("Session not found")
        
        session = self.sessions[session_id]
        campaign = self.campaigns[session.campaign_id]
        
        # Generate recap content
        recap = f"""# {campaign.name} - Session {session.session_number} Recap

**Campaign:** {campaign.name}
**Dungeon Master:** {campaign.dm_name}
**Session Date:** {session.date_played.strftime('%B %d, %Y')}
**In-Game Period:** {session.in_game_date_range}

## Adventure Summary
{session.summary}

## Major Events
"""
        
        # Add timeline events
        for event_id in session.events:
            if event_id in self.timeline_events:
                event = self.timeline_events[event_id]
                recap += f"### {event.in_game_date} - {event.event_type.title()}\n"
                recap += f"**Location:** {event.location}\n"
                recap += f"**What Happened:** {event.description}\n"
                recap += f"**Those Involved:** {', '.join(event.participants)}\n\n"
        
        recap += "## Important Decisions\n"
        
        # Add player decisions
        for decision_id in session.decisions_made:
            if decision_id in self.decisions:
                decision = self.decisions[decision_id]
                recap += f"### {decision.player_name}'s Choice\n"
                recap += f"**Decision:** {decision.decision}\n"
                recap += f"**Immediate Result:** {decision.immediate_consequences}\n\n"
        
        recap += f"## Next Session\n"
        recap += f"*Players should remember the key decisions made and be prepared for their consequences.*\n\n"
        recap += f"---\n*Generated by D&D Campaign Memory Engine*"
        
        logger.info(f"Exported session recap for {session_id}")
        return recap
    
    def get_campaign_overview(self, campaign_id: str) -> Dict[str, Any]:
        """
        Get comprehensive overview of a campaign
        
        This provides a dashboard view of the campaign with all
        key statistics and recent activity.
        
        Args:
            campaign_id: Campaign to overview
            
        Returns:
            Dictionary with campaign overview data
        """
        if campaign_id not in self.campaigns:
            raise ValueError("Campaign not found")
        
        campaign = self.campaigns[campaign_id]
        
        # Get campaign sessions
        campaign_sessions = [s for s in self.sessions.values() if s.campaign_id == campaign_id]
        campaign_sessions.sort(key=lambda x: x.session_number, reverse=True)
        
        # Get campaign NPCs
        campaign_npcs = list(self.npcs.values())  # In real implementation, filter by campaign
        
        # Get campaign plot threads
        campaign_threads = list(self.plot_threads.values())  # In real implementation, filter by campaign
        
        # Calculate statistics
        total_events = sum(len(s.events) for s in campaign_sessions)
        total_decisions = sum(len(s.decisions_made) for s in campaign_sessions)
        
        overview = {
            "campaign": {
                "id": campaign.id,
                "name": campaign.name,
                "description": campaign.description,
                "dm_name": campaign.dm_name,
                "setting": campaign.setting,
                "status": campaign.status,
                "current_session": campaign.current_session,
                "player_characters": campaign.player_characters
            },
            "statistics": {
                "total_sessions": len(campaign_sessions),
                "total_npcs": len(campaign_npcs),
                "total_plot_threads": len(campaign_threads),
                "total_events": total_events,
                "total_decisions": total_decisions,
                "active_plot_threads": len([t for t in campaign_threads if t.status == "active"]),
                "completed_sessions": len(campaign_sessions)
            },
            "recent_sessions": [
                {
                    "id": s.id,
                    "number": s.session_number,
                    "date": s.date_played.isoformat(),
                    "summary": s.summary,
                    "player_attendance": s.player_attendance
                }
                for s in campaign_sessions[:5]  # Last 5 sessions
            ],
            "active_plot_threads": [
                {
                    "id": t.id,
                    "title": t.title,
                    "priority": t.priority,
                    "started_session": t.started_session
                }
                for t in campaign_threads if t.status == "active"
            ],
            "recent_npcs": [
                {
                    "id": npc.id,
                    "name": npc.name,
                    "location": npc.location,
                    "status": npc.status,
                    "last_seen": npc.last_seen
                }
                for npc in campaign_npcs[:10]  # Last 10 NPCs
            ]
        }
        
        return overview
    
    def handle_core_logic(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Handle D&D specific requests
        
        This method routes requests to the appropriate D&D functionality
        based on the action specified in the request data.
        
        Args:
            data: Request data with 'action' field and relevant parameters
            
        Returns:
            Response data with results or error information
        """
        action = data.get("action", "")
        
        try:
            if action == "create_campaign":
                result = self.create_campaign(
                    user_email=data["user_email"],
                    name=data["name"],
                    description=data["description"],
                    dm_name=data["dm_name"],
                    player_characters=data["player_characters"],
                    setting=data.get("setting", "")
                )
                return {"status": "success", "campaign": result.__dict__}
            
            elif action == "add_npc":
                result = self.add_npc(
                    campaign_id=data["campaign_id"],
                    name=data["name"],
                    description=data["description"],
                    location=data["location"],
                    alignment=data["alignment"],
                    session_id=data.get("session_id", "")
                )
                return {"status": "success", "npc": result.__dict__}
            
            elif action == "create_session":
                result = self.create_session(
                    campaign_id=data["campaign_id"],
                    session_number=data["session_number"],
                    date_played=datetime.fromisoformat(data["date_played"]),
                    in_game_date_range=data["in_game_date_range"],
                    summary=data["summary"],
                    player_attendance=data["player_attendance"]
                )
                return {"status": "success", "session": result.__dict__}
            
            elif action == "add_plot_thread":
                result = self.add_plot_thread(
                    campaign_id=data["campaign_id"],
                    title=data["title"],
                    description=data["description"],
                    priority=data.get("priority", "medium"),
                    started_session=data.get("started_session", "")
                )
                return {"status": "success", "plot_thread": result.__dict__}
            
            elif action == "record_decision":
                result = self.record_player_decision(
                    session_id=data["session_id"],
                    player_name=data["player_name"],
                    decision=data["decision"],
                    immediate_consequences=data["immediate_consequences"],
                    importance=data.get("importance", 5)
                )
                return {"status": "success", "decision": result.__dict__}
            
            elif action == "add_timeline_event":
                result = self.add_timeline_event(
                    session_id=data["session_id"],
                    in_game_date=data["in_game_date"],
                    event_type=data["event_type"],
                    description=data["description"],
                    location=data["location"],
                    participants=data["participants"],
                    significance=data.get("significance", 5)
                )
                return {"status": "success", "event": result.__dict__}
            
            elif action == "generate_summary":
                summary = self.generate_session_summary_ai(data["session_id"])
                return {"status": "success", "summary": summary}
            
            elif action == "check_consistency":
                result = self.check_lore_consistency(data["campaign_id"])
                return {"status": "success", "consistency_check": result}
            
            elif action == "export_recap":
                recap = self.export_session_recap(
                    data["session_id"],
                    format=data.get("format", "markdown")
                )
                return {"status": "success", "recap": recap}
            
            elif action == "campaign_overview":
                overview = self.get_campaign_overview(data["campaign_id"])
                return {"status": "success", "overview": overview}
            
            else:
                return {"status": "error", "message": f"Unknown action: {action}"}
                
        except Exception as e:
            logger.error(f"Error handling action {action}: {e}")
            return {"status": "error", "message": str(e)}

def main():
    """
    Demo the D&D Campaign Engine
    
    This function shows how to use the D&D Campaign Engine
    with a sample campaign, NPCs, sessions, and events.
    """
    print("🐉 D&D Campaign Memory Engine Demo")
    print("=" * 50)
    
    # Initialize the engine
    engine = DnDCampaignEngine()
    
    # Register a demo user
    try:
        user = engine.register_user(
            email="dm@example.com",
            name="Dungeon Master Dave",
            password="dragon123"
        )
        print(f"✅ Registered DM: {user.name}")
        
        # Login the user
        logged_in_user = engine.login_user("dm@example.com", "dragon123")
        if logged_in_user:
            print(f"✅ Logged in as: {logged_in_user.name}")
        
        # Create a campaign
        campaign = engine.create_campaign(
            user_email="dm@example.com",
            name="The Curse of the Ancient Tomb",
            description="A classic dungeon crawl adventure with ancient curses and forgotten treasures",
            dm_name="Dungeon Master Dave",
            player_characters=["Thorin the Dwarf", "Elara the Elf", "Gimlock the Rogue"],
            setting="Forgotten Realms"
        )
        print(f"✅ Created campaign: {campaign.name}")
        
        # Add some NPCs
        npc1 = engine.add_npc(
            campaign_id=campaign.id,
            name="Zarthus the Wise",
            description="An old wizard with a long white beard and mysterious eyes. Carries a staff that glows faintly.",
            location="Tower of High Sorcery",
            alignment="Neutral Good",
            session_id="session_1"
        )
        print(f"✅ Added NPC: {npc1.name}")
        
        npc2 = engine.add_npc(
            campaign_id=campaign.id,
            name="Grak the Orc Chieftain",
            description="A massive orc with scars covering his face and a rusty axe. Wears the skull of his first kill as a helmet.",
            location="Orc Caverns",
            alignment="Chaotic Evil"
        )
        print(f"✅ Added NPC: {npc2.name}")
        
        # Create a session
        session = engine.create_session(
            campaign_id=campaign.id,
            session_number=1,
            date_played=datetime.now() - timedelta(days=7),
            in_game_date_range="Spring 15-16, 1492 DR",
            summary="The party arrived in the town of Shadowdale and heard rumors of an ancient tomb nearby. They met Zarthus who warned them of the curse.",
            player_attendance=["Thorin the Dwarf", "Elara the Elf", "Gimlock the Rogue"]
        )
        print(f"✅ Created session: Session {session.session_number}")
        
        # Add plot threads
        thread1 = engine.add_plot_thread(
            campaign_id=campaign.id,
            title="The Ancient Curse",
            description="Discover the source of the curse affecting the tomb and find a way to break it",
            priority="high",
            started_session=session.id
        )
        print(f"✅ Added plot thread: {thread1.title}")
        
        thread2 = engine.add_plot_thread(
            campaign_id=campaign.id,
            title="Zarthus's Mysterious Past",
            description="Learn more about the wizard's history and why he's interested in the tomb",
            priority="medium",
            started_session=session.id
        )
        print(f"✅ Added plot thread: {thread2.title}")
        
        # Record player decisions
        decision1 = engine.record_player_decision(
            session_id=session.id,
            player_name="Thorin the Dwarf",
            decision="Decided to enter the tomb despite Zarthus's warnings",
            immediate_consequences="The party entered the tomb and triggered a trap that injured Gimlock",
            importance=8
        )
        print(f"✅ Recorded decision by {decision1.player_name}")
        
        # Add timeline events
        event1 = engine.add_timeline_event(
            session_id=session.id,
            in_game_date="Spring 15, 1492 DR",
            event_type="social",
            description="Party met Zarthus the Wise in the Shadowdale tavern",
            location="Shadowdale Tavern",
            participants=["Thorin the Dwarf", "Elara the Elf", "Gimlock the Rogue", "Zarthus the Wise"],
            significance=7
        )
        print(f"✅ Added timeline event: {event1.description}")
        
        event2 = engine.add_timeline_event(
            session_id=session.id,
            in_game_date="Spring 16, 1492 DR",
            event_type="combat",
            description="Party fought skeletons guarding the tomb entrance",
            location="Ancient Tomb Entrance",
            participants=["Thorin the Dwarf", "Elara the Elf", "Gimlock the Rogue"],
            significance=6
        )
        print(f"✅ Added timeline event: {event2.description}")
        
        # Generate AI summary
        summary = engine.generate_session_summary_ai(session.id)
        print(f"✅ Generated AI summary for session {session.session_number}")
        
        # Check lore consistency
        consistency = engine.check_lore_consistency(campaign.id)
        print(f"✅ Lore consistency score: {consistency['consistency_score']}/100")
        
        # Export session recap
        recap = engine.export_session_recap(session.id)
        print(f"✅ Exported session recap ({len(recap)} characters)")
        
        # Get campaign overview
        overview = engine.get_campaign_overview(campaign.id)
        print(f"✅ Campaign overview: {overview['statistics']['total_sessions']} sessions, {overview['statistics']['total_npcs']} NPCs")
        
        print("\n🎉 D&D Campaign Engine demo complete!")
        print(f"📊 Campaign: {campaign.name}")
        print(f"📝 Sessions: {overview['statistics']['total_sessions']}")
        print(f"👥 NPCs: {overview['statistics']['total_npcs']}")
        print(f"🧵 Plot Threads: {overview['statistics']['total_plot_threads']}")
        print(f"⚡ Events: {overview['statistics']['total_events']}")
        print(f"🎯 Decisions: {overview['statistics']['total_decisions']}")
        
    except Exception as e:
        logger.error(f"Demo failed: {e}")
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    main()
