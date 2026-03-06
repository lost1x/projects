#!/usr/bin/env python3
"""
AI Prompt Version Manager
=========================

A micro-SaaS tool for prompt engineers to save, compare, and optimize
their AI prompts with version control, A/B testing, and performance tracking.

Features:
- Save prompt versions with metadata
- Compare prompts side-by-side
- Track cost per prompt and token usage
- Store best performing prompts
- A/B testing capabilities
- Performance analytics and metrics
- Export prompts in various formats
- Team collaboration features

Business Model:
- Free: 10 prompts, basic comparison
- Basic: 100 prompts, A/B testing ($9.99/month)
- Pro: Unlimited prompts, advanced analytics ($29.99/month)

Target Users:
- AI prompt engineers
- LLM application developers
- Content creators using AI
- Marketing teams using AI copywriting

Author: Your Name
Created: 2026-03-06
"""

import sys
import json
import logging
from datetime import datetime
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

# Configure logging specifically for AI prompt management
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - [PROMPT] %(message)s',
    handlers=[
        logging.FileHandler('prompt_manager.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

@dataclass
class PromptVersion:
    """
    Individual prompt version data structure
    
    Each time a prompt is modified, a new version is created.
    This tracks the evolution and performance of prompts over time.
    
    Attributes:
        id: Unique identifier for this version
        prompt_id: ID of the parent prompt
        version_number: Sequential version number
        content: The actual prompt text
        system_prompt: System instructions (if applicable)
        parameters: Model parameters (temperature, max_tokens, etc.)
        tags: List of tags for categorization
        notes: User notes about this version
        performance_metrics: Dictionary of performance data
        cost_per_use: Cost in USD for single use
        token_count: Number of tokens in this prompt
        created_at: When this version was created
        is_active: Whether this is the currently active version
        test_results: Results from A/B tests
    """
    id: str
    prompt_id: str
    version_number: int
    content: str
    system_prompt: str = ""
    parameters: Dict[str, Any] = field(default_factory=dict)
    tags: List[str] = field(default_factory=list)
    notes: str = ""
    performance_metrics: Dict[str, float] = field(default_factory=dict)
    cost_per_use: float = 0.0
    token_count: int = 0
    created_at: datetime = field(default_factory=datetime.now)
    is_active: bool = False
    test_results: List[Dict[str, Any]] = field(default_factory=list)

@dataclass
class Prompt:
    """
    Main prompt data structure
    
    A prompt represents a complete prompt template that can have
    multiple versions. This is the top-level container.
    
    Attributes:
        id: Unique identifier for the prompt
        name: Human-readable name
        description: What this prompt does
        category: Prompt category (e.g., "copywriting", "coding", "analysis")
        model: Target AI model (e.g., "gpt-4", "claude-3")
        language: Prompt language
        purpose: Primary purpose/use case
        current_version: Currently active version number
        versions: List of all version IDs
        created_at: When prompt was created
        last_modified: When prompt was last updated
        owner_email: Email of the owner
        is_public: Whether prompt is shareable
        usage_count: Total number of times this prompt has been used
    """
    id: str
    name: str
    description: str
    category: str
    model: str
    language: str = "en"
    purpose: str = ""
    current_version: int = 1
    versions: List[str] = field(default_factory=list)
    created_at: datetime = field(default_factory=datetime.now)
    last_modified: datetime = field(default_factory=datetime.now)
    owner_email: str = ""
    is_public: bool = False
    usage_count: int = 0

@dataclass
class ABTest:
    """
    A/B test data structure for comparing prompt versions
    
    A/B tests allow users to compare two or more prompt versions
    to determine which performs better for their specific use case.
    
    Attributes:
        id: Unique identifier for the test
        prompt_id: ID of the prompt being tested
        name: Test name/description
        versions_being_tested: List of version IDs in the test
        test_input: Sample input used for testing
        evaluation_criteria: What metrics to measure
        status: "running", "completed", "paused"
        results: Test results and metrics
        winner_version: Version that performed best
        confidence_score: Statistical confidence in results
        created_at: When test was created
        completed_at: When test was completed
        sample_size: Number of test runs
    """
    id: str
    prompt_id: str
    name: str
    versions_being_tested: List[str]
    test_input: str
    evaluation_criteria: List[str]
    status: str = "running"
    results: Dict[str, Any] = field(default_factory=dict)
    winner_version: str = ""
    confidence_score: float = 0.0
    created_at: datetime = field(default_factory=datetime.now)
    completed_at: Optional[datetime] = None
    sample_size: int = 0

@dataclass
class PerformanceMetric:
    """
    Performance metrics for prompt versions
    
    Tracks various performance indicators to help users
    identify the best performing prompt versions.
    
    Attributes:
        id: Unique identifier
        version_id: ID of the prompt version
        metric_name: Name of the metric (e.g., "response_quality", "speed")
        metric_value: Numeric value of the metric
        metric_type: "higher_is_better" or "lower_is_better"
        test_context: Context in which metric was measured
        recorded_at: When metric was recorded
        notes: Additional notes about the measurement
    """
    id: str
    version_id: str
    metric_name: str
    metric_value: float
    metric_type: str  # "higher_is_better" or "lower_is_better"
    test_context: str = ""
    recorded_at: datetime = field(default_factory=datetime.now)
    notes: str = ""

class AIPromptManager(MicroSaaSApp):
    """
    Main AI Prompt Version Manager application
    
    This class extends the base MicroSaaSApp with AI prompt-specific functionality
    for managing prompt versions, A/B testing, and performance tracking.
    
    Key Features:
    - Prompt version control with diff comparison
    - A/B testing for prompt optimization
    - Performance metrics and analytics
    - Cost tracking and token counting
    - Export functionality for sharing prompts
    - Usage limits for freemium model
    """
    
    def __init__(self, config_file: str = "config.json"):
        """Initialize the AI Prompt Manager"""
        super().__init__(config_file)
        
        # AI prompt specific data storage
        self.prompts: Dict[str, Prompt] = {}  # prompt_id -> Prompt
        self.prompt_versions: Dict[str, PromptVersion] = {}  # version_id -> PromptVersion
        self.ab_tests: Dict[str, ABTest] = {}  # test_id -> ABTest
        self.performance_metrics: Dict[str, PerformanceMetric] = {}  # metric_id -> PerformanceMetric
        
        # User prompt mapping
        self.user_prompts: Dict[str, List[str]] = {}  # user_email -> [prompt_ids]
        
        # Model pricing for cost calculation (example rates)
        self.model_pricing = {
            "gpt-3.5-turbo": {"input": 0.001, "output": 0.002},  # per 1K tokens
            "gpt-4": {"input": 0.03, "output": 0.06},
            "claude-3-sonnet": {"input": 0.015, "output": 0.075},
            "claude-3-haiku": {"input": 0.0025, "output": 0.0125}
        }
        
        logger.info("AI Prompt Manager initialized")
        logger.info(f"Loaded {len(self.prompts)} prompts")
    
    def create_prompt(self, user_email: str, name: str, description: str,
                    category: str, model: str, content: str, system_prompt: str = "",
                    tags: List[str] = None, parameters: Dict[str, Any] = None) -> Prompt:
        """
        Create a new prompt with initial version
        
        This is the entry point for users to start tracking their prompts.
        Creates both the prompt container and the first version.
        
        Args:
            user_email: Email of the user creating the prompt
            name: Human-readable prompt name
            description: What this prompt does
            category: Prompt category
            model: Target AI model
            content: The actual prompt text
            system_prompt: System instructions (optional)
            tags: List of tags for categorization
            parameters: Model parameters
            
        Returns:
            Created Prompt object
        """
        # Check user limits
        if user_email not in self.users:
            raise ValueError("User not found. Please register first.")
        
        user = self.users[user_email]
        user_prompts = self.user_prompts.get(user_email, [])
        prompt_limit = self.get_prompt_limit(user.plan)
        
        if len(user_prompts) >= prompt_limit:
            raise ValueError(f"Prompt limit reached ({prompt_limit}). Upgrade your plan to create more prompts.")
        
        # Create prompt
        prompt_id = f"prompt_{uuid.uuid4().hex[:8]}"
        new_prompt = Prompt(
            id=prompt_id,
            name=name,
            description=description,
            category=category,
            model=model,
            owner_email=user_email
        )
        
        # Create first version
        version_id = f"version_{uuid.uuid4().hex[:8]}"
        token_count = self.count_tokens(content)
        cost_per_use = self.calculate_cost(content, model)
        
        first_version = PromptVersion(
            id=version_id,
            prompt_id=prompt_id,
            version_number=1,
            content=content,
            system_prompt=system_prompt,
            tags=tags or [],
            parameters=parameters or {},
            token_count=token_count,
            cost_per_use=cost_per_use,
            is_active=True
        )
        
        # Store prompt and version
        self.prompts[prompt_id] = new_prompt
        self.prompt_versions[version_id] = first_version
        
        # Link to user
        if user_email not in self.user_prompts:
            self.user_prompts[user_email] = []
        self.user_prompts[user_email].append(prompt_id)
        
        # Update prompt with version
        new_prompt.versions = [version_id]
        new_prompt.current_version = 1
        
        logger.info(f"Created prompt '{name}' for user {user_email}")
        return new_prompt
    
    def get_prompt_limit(self, plan: str) -> int:
        """
        Get prompt limit based on user plan
        
        Args:
            plan: User's subscription plan
            
        Returns:
            Maximum number of prompts allowed
        """
        limits = {
            "free": 10,
            "basic": 100,
            "pro": -1,  # Unlimited
            "enterprise": -1  # Unlimited
        }
        return limits.get(plan, 10)
    
    def create_new_version(self, prompt_id: str, content: str, 
                         system_prompt: str = "", tags: List[str] = None,
                         parameters: Dict[str, Any] = None, notes: str = "") -> PromptVersion:
        """
        Create a new version of an existing prompt
        
        When users modify their prompts, this creates a new version
        while preserving the previous ones for comparison.
        
        Args:
            prompt_id: ID of the prompt to version
            content: New prompt content
            system_prompt: New system prompt
            tags: New tags list
            parameters: New model parameters
            notes: User notes about this version
            
        Returns:
            Created PromptVersion object
        """
        if prompt_id not in self.prompts:
            raise ValueError("Prompt not found")
        
        prompt = self.prompts[prompt_id]
        
        # Deactivate previous versions
        for version_id in prompt.versions:
            if version_id in self.prompt_versions:
                self.prompt_versions[version_id].is_active = False
        
        # Create new version
        version_id = f"version_{uuid.uuid4().hex[:8]}"
        new_version_number = max([v.version_number for v in self.prompt_versions.values() 
                              if v.prompt_id == prompt_id], default=0) + 1
        
        token_count = self.count_tokens(content)
        cost_per_use = self.calculate_cost(content, prompt.model)
        
        new_version = PromptVersion(
            id=version_id,
            prompt_id=prompt_id,
            version_number=new_version_number,
            content=content,
            system_prompt=system_prompt,
            tags=tags or [],
            parameters=parameters or {},
            notes=notes,
            token_count=token_count,
            cost_per_use=cost_per_use,
            is_active=True
        )
        
        # Store version
        self.prompt_versions[version_id] = new_version
        
        # Update prompt
        prompt.versions.append(version_id)
        prompt.current_version = new_version_number
        prompt.last_modified = datetime.now()
        
        logger.info(f"Created version {new_version_number} for prompt {prompt_id}")
        return new_version
    
    def count_tokens(self, text: str) -> int:
        """
        Count tokens in text (simplified implementation)
        
        In a real implementation, you'd use the appropriate tokenizer
        for each model (tiktoken for OpenAI, etc.).
        
        Args:
            text: Text to count tokens for
            
        Returns:
            Approximate token count
        """
        # Simplified token counting (rough approximation)
        # In production, use model-specific tokenizers
        words = len(text.split())
        # Rough estimate: 1 token ≈ 0.75 words for English
        return int(words * 1.33)
    
    def calculate_cost(self, content: str, model: str) -> float:
        """
        Calculate cost per use for a prompt
        
        Args:
            content: Prompt content
            model: Target AI model
            
        Returns:
            Cost in USD per use
        """
        if model not in self.model_pricing:
            return 0.0
        
        token_count = self.count_tokens(content)
        input_cost_per_token = self.model_pricing[model]["input"] / 1000
        
        # Estimate output tokens (typically 50% of input for responses)
        estimated_output_tokens = int(token_count * 0.5)
        output_cost_per_token = self.model_pricing[model]["output"] / 1000
        
        total_cost = (token_count * input_cost_per_token) + (estimated_output_tokens * output_cost_per_token)
        return round(total_cost, 6)
    
    def compare_versions(self, prompt_id: str, version_ids: List[str]) -> Dict[str, Any]:
        """
        Compare multiple prompt versions side-by-side
        
        This is a core feature that allows users to see the differences
        between prompt versions and their performance metrics.
        
        Args:
            prompt_id: ID of the prompt
            version_ids: List of version IDs to compare
            
        Returns:
            Comparison data with differences and metrics
        """
        if prompt_id not in self.prompts:
            raise ValueError("Prompt not found")
        
        versions = []
        for version_id in version_ids:
            if version_id in self.prompt_versions:
                versions.append(self.prompt_versions[version_id])
        
        if len(versions) < 2:
            raise ValueError("Need at least 2 versions to compare")
        
        # Calculate differences
        comparison = {
            "prompt_id": prompt_id,
            "prompt_name": self.prompts[prompt_id].name,
            "versions": [],
            "differences": {},
            "performance_comparison": {}
        }
        
        # Add version data
        for version in versions:
            comparison["versions"].append({
                "id": version.id,
                "version_number": version.version_number,
                "content": version.content,
                "system_prompt": version.system_prompt,
                "token_count": version.token_count,
                "cost_per_use": version.cost_per_use,
                "is_active": version.is_active,
                "created_at": version.created_at.isoformat(),
                "tags": version.tags,
                "parameters": version.parameters
            })
        
        # Calculate text differences (simplified)
        if len(versions) >= 2:
            v1, v2 = versions[0], versions[1]
            comparison["differences"] = {
                "content_length_diff": len(v2.content) - len(v1.content),
                "token_count_diff": v2.token_count - v1.token_count,
                "cost_diff": v2.cost_per_use - v1.cost_per_use,
                "parameter_changes": self._compare_parameters(v1.parameters, v2.parameters),
                "tag_changes": self._compare_lists(v1.tags, v2.tags)
            }
        
        # Compare performance metrics
        for version in versions:
            metrics = [m for m in self.performance_metrics.values() 
                      if m.version_id == version.id]
            
            if metrics:
                avg_performance = statistics.mean([m.metric_value for m in metrics])
                comparison["performance_comparison"][version.id] = {
                    "average_score": avg_performance,
                    "metrics_count": len(metrics),
                    "best_metric": max(metrics, key=lambda x: x.metric_value).__dict__
                }
        
        return comparison
    
    def _compare_parameters(self, params1: Dict[str, Any], params2: Dict[str, Any]) -> Dict[str, Any]:
        """Compare two parameter dictionaries"""
        changes = {}
        
        all_keys = set(params1.keys()) | set(params2.keys())
        
        for key in all_keys:
            val1 = params1.get(key)
            val2 = params2.get(key)
            
            if val1 != val2:
                changes[key] = {
                    "old": val1,
                    "new": val2,
                    "type": type(val1).__name__
                }
        
        return changes
    
    def _compare_lists(self, list1: List[str], list2: List[str]) -> Dict[str, List[str]]:
        """Compare two lists and return differences"""
        set1, set2 = set(list1), set(list2)
        
        return {
            "added": list(set2 - set1),
            "removed": list(set1 - set2),
            "unchanged": list(set1 & set2)
        }
    
    def create_ab_test(self, prompt_id: str, name: str, version_ids: List[str],
                     test_input: str, evaluation_criteria: List[str]) -> ABTest:
        """
        Create an A/B test to compare prompt versions
        
        A/B testing allows users to scientifically determine which
        prompt version performs better for their specific use case.
        
        Args:
            prompt_id: ID of the prompt to test
            name: Test name/description
            version_ids: List of version IDs to test
            test_input: Sample input for testing
            evaluation_criteria: What metrics to measure
            
        Returns:
            Created ABTest object
        """
        if prompt_id not in self.prompts:
            raise ValueError("Prompt not found")
        
        # Verify all versions exist
        for version_id in version_ids:
            if version_id not in self.prompt_versions:
                raise ValueError(f"Version {version_id} not found")
        
        # Create A/B test
        test_id = f"test_{uuid.uuid4().hex[:8]}"
        new_test = ABTest(
            id=test_id,
            prompt_id=prompt_id,
            name=name,
            versions_being_tested=version_ids,
            test_input=test_input,
            evaluation_criteria=evaluation_criteria
        )
        
        # Store test
        self.ab_tests[test_id] = new_test
        
        logger.info(f"Created A/B test '{name}' for prompt {prompt_id}")
        return new_test
    
    def record_test_result(self, test_id: str, version_id: str, 
                         metrics: Dict[str, float]) -> None:
        """
        Record results from an A/B test
        
        This method records performance metrics for a specific version
        during an A/B test.
        
        Args:
            test_id: ID of the A/B test
            version_id: ID of the version being tested
            metrics: Dictionary of metric names to values
        """
        if test_id not in self.ab_tests:
            raise ValueError("A/B test not found")
        
        test = self.ab_tests[test_id]
        
        # Record test result
        result = {
            "version_id": version_id,
            "metrics": metrics,
            "timestamp": datetime.now().isoformat()
        }
        
        if version_id not in test.results:
            test.results[version_id] = []
        
        test.results[version_id].append(result)
        test.sample_size += 1
        
        # Store performance metrics
        for metric_name, metric_value in metrics.items():
            metric_id = f"metric_{uuid.uuid4().hex[:8]}"
            performance_metric = PerformanceMetric(
                id=metric_id,
                version_id=version_id,
                metric_name=metric_name,
                metric_value=metric_value,
                metric_type="higher_is_better",  # Default assumption
                test_context=f"A/B Test: {test.name}"
            )
            self.performance_metrics[metric_id] = performance_metric
        
        logger.info(f"Recorded test result for version {version_id} in test {test_id}")
    
    def analyze_test_results(self, test_id: str) -> Dict[str, Any]:
        """
        Analyze A/B test results and determine winner
        
        This method performs statistical analysis on test results
        to determine which version performed better.
        
        Args:
            test_id: ID of the A/B test to analyze
            
        Returns:
            Analysis results with winner and confidence
        """
        if test_id not in self.ab_tests:
            raise ValueError("A/B test not found")
        
        test = self.ab_tests[test_id]
        
        if len(test.results) < 2:
            raise ValueError("Not enough data to analyze")
        
        # Calculate average scores for each version
        version_scores = {}
        
        for version_id, results in test.results.items():
            if not results:
                continue
            
            # Calculate average across all metrics
            all_metric_values = []
            for result in results:
                all_metric_values.extend(result["metrics"].values())
            
            if all_metric_values:
                avg_score = statistics.mean(all_metric_values)
                version_scores[version_id] = avg_score
        
        if not version_scores:
            raise ValueError("No valid results to analyze")
        
        # Determine winner
        winner_version = max(version_scores, key=version_scores.get)
        winner_score = version_scores[winner_version]
        
        # Calculate confidence (simplified)
        total_samples = sum(len(results) for results in test.results.values())
        confidence = min(95.0, (total_samples / 10) * 20)  # Simplified confidence calculation
        
        # Update test
        test.winner_version = winner_version
        test.confidence_score = confidence
        test.status = "completed"
        test.completed_at = datetime.now()
        
        analysis = {
            "test_id": test_id,
            "test_name": test.name,
            "winner_version": winner_version,
            "winner_score": winner_score,
            "confidence_score": confidence,
            "version_scores": version_scores,
            "total_samples": total_samples,
            "recommendation": f"Version {winner_version} performed best with {confidence:.1f}% confidence"
        }
        
        logger.info(f"Analyzed A/B test {test_id}: Winner is {winner_version}")
        return analysis
    
    def get_best_prompts(self, category: str = "", limit: int = 10) -> List[Dict[str, Any]]:
        """
        Get best performing prompts
        
        This method returns prompts with the highest performance scores,
        useful for users looking for proven prompt templates.
        
        Args:
            category: Filter by category (optional)
            limit: Maximum number of prompts to return
            
        Returns:
            List of best performing prompts
        """
        best_prompts = []
        
        for prompt in self.prompts.values():
            if category and prompt.category != category:
                continue
            
            # Get all performance metrics for this prompt
            prompt_metrics = []
            for version_id in prompt.versions:
                version_metrics = [m for m in self.performance_metrics.values() 
                               if m.version_id == version_id]
                prompt_metrics.extend(version_metrics)
            
            if prompt_metrics:
                avg_score = statistics.mean([m.metric_value for m in prompt_metrics])
                best_prompts.append({
                    "prompt": prompt.__dict__,
                    "average_score": avg_score,
                    "metrics_count": len(prompt_metrics),
                    "best_version": max(prompt_metrics, key=lambda x: x.metric_value).version_id
                })
        
        # Sort by average score
        best_prompts.sort(key=lambda x: x["average_score"], reverse=True)
        
        return best_prompts[:limit]
    
    def export_prompt(self, prompt_id: str, format: str = "json") -> str:
        """
        Export prompt in various formats
        
        Allows users to export their prompts for sharing,
        backup, or use in other applications.
        
        Args:
            prompt_id: ID of the prompt to export
            format: Export format ("json", "markdown", "yaml")
            
        Returns:
            Exported prompt as string
        """
        if prompt_id not in self.prompts:
            raise ValueError("Prompt not found")
        
        prompt = self.prompts[prompt_id]
        active_version = None
        
        # Find active version
        for version_id in prompt.versions:
            if version_id in self.prompt_versions:
                version = self.prompt_versions[version_id]
                if version.is_active:
                    active_version = version
                    break
        
        if not active_version:
            active_version = self.prompt_versions[prompt.versions[-1]]  # Use latest
        
        if format.lower() == "json":
            export_data = {
                "prompt": {
                    "name": prompt.name,
                    "description": prompt.description,
                    "category": prompt.category,
                    "model": prompt.model,
                    "language": prompt.language,
                    "purpose": prompt.purpose
                },
                "version": {
                    "number": active_version.version_number,
                    "content": active_version.content,
                    "system_prompt": active_version.system_prompt,
                    "parameters": active_version.parameters,
                    "tags": active_version.tags,
                    "notes": active_version.notes
                },
                "metadata": {
                    "exported_at": datetime.now().isoformat(),
                    "token_count": active_version.token_count,
                    "cost_per_use": active_version.cost_per_use
                }
            }
            return json.dumps(export_data, indent=2)
        
        elif format.lower() == "markdown":
            markdown = f"""# {prompt.name}

**Description:** {prompt.description}
**Category:** {prompt.category}
**Model:** {prompt.model}
**Version:** {active_version.version_number}

## Content
```
{active_version.content}
```

## System Prompt
```
{active_version.system_prompt}
```

## Parameters
{json.dumps(active_version.parameters, indent=2)}

## Tags
{', '.join(active_version.tags)}

## Notes
{active_version.notes}

---
*Exported from AI Prompt Version Manager on {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}*
"""
            return markdown
        
        else:
            raise ValueError(f"Unsupported export format: {format}")
    
    def get_user_analytics(self, user_email: str) -> Dict[str, Any]:
        """
        Get comprehensive analytics for a user
        
        Provides usage statistics, performance metrics,
        and insights about the user's prompt optimization.
        
        Args:
            user_email: Email of the user
            
        Returns:
            Analytics data dictionary
        """
        if user_email not in self.users:
            raise ValueError("User not found")
        
        user = self.users[user_email]
        user_prompt_ids = self.user_prompts.get(user_email, [])
        
        # Get user's prompts
        user_prompts = [self.prompts[pid] for pid in user_prompt_ids if pid in self.prompts]
        
        # Calculate statistics
        total_prompts = len(user_prompts)
        total_versions = sum(len(p.versions) for p in user_prompts)
        total_usage = sum(p.usage_count for p in user_prompts)
        
        # Category breakdown
        categories = {}
        for prompt in user_prompts:
            categories[prompt.category] = categories.get(prompt.category, 0) + 1
        
        # Model usage
        models = {}
        for prompt in user_prompts:
            models[prompt.model] = models.get(prompt.model, 0) + 1
        
        # Performance metrics
        user_metrics = []
        for prompt_id in user_prompt_ids:
            for version_id in self.prompts.get(prompt_id, {}).versions:
                version_metrics = [m for m in self.performance_metrics.values() 
                               if m.version_id == version_id]
                user_metrics.extend(version_metrics)
        
        avg_performance = 0
        if user_metrics:
            avg_performance = statistics.mean([m.metric_value for m in user_metrics])
        
        # Cost analysis
        total_cost = 0
        for prompt_id in user_prompt_ids:
            for version_id in self.prompts.get(prompt_id, {}).versions:
                if version_id in self.prompt_versions:
                    version = self.prompt_versions[version_id]
                    total_cost += version.cost_per_use * self.prompts[prompt_id].usage_count
        
        analytics = {
            "user": {
                "email": user_email,
                "name": user.name,
                "plan": user.plan
            },
            "usage": {
                "total_prompts": total_prompts,
                "total_versions": total_versions,
                "total_usage": total_usage,
                "average_versions_per_prompt": total_versions / max(1, total_prompts)
            },
            "categories": categories,
            "models": models,
            "performance": {
                "total_metrics": len(user_metrics),
                "average_performance": avg_performance,
                "best_performing_prompt": self._get_user_best_prompt(user_email)
            },
            "costs": {
                "total_estimated_cost": total_cost,
                "average_cost_per_use": total_cost / max(1, total_usage)
            },
            "recent_activity": self._get_recent_activity(user_email)
        }
        
        return analytics
    
    def _get_user_best_prompt(self, user_email: str) -> Optional[Dict[str, Any]]:
        """Get user's best performing prompt"""
        user_prompt_ids = self.user_prompts.get(user_email, [])
        best_prompt = None
        best_score = 0
        
        for prompt_id in user_prompt_ids:
            prompt_metrics = []
            for version_id in self.prompts.get(prompt_id, {}).versions:
                version_metrics = [m for m in self.performance_metrics.values() 
                               if m.version_id == version_id]
                prompt_metrics.extend(version_metrics)
            
            if prompt_metrics:
                avg_score = statistics.mean([m.metric_value for m in prompt_metrics])
                if avg_score > best_score:
                    best_score = avg_score
                    best_prompt = {
                        "prompt_id": prompt_id,
                        "name": self.prompts[prompt_id].name,
                        "average_score": avg_score
                    }
        
        return best_prompt
    
    def _get_recent_activity(self, user_email: str) -> List[Dict[str, Any]]:
        """Get recent activity for user"""
        # This would track recent changes, tests, etc.
        # For now, return placeholder
        return [
            {
                "type": "prompt_created",
                "timestamp": datetime.now().isoformat(),
                "description": "Recent prompt activity"
            }
        ]
    
    def handle_core_logic(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Handle AI prompt manager specific requests
        
        Routes requests to appropriate prompt management functions.
        """
        action = data.get("action", "")
        
        try:
            if action == "create_prompt":
                result = self.create_prompt(
                    user_email=data["user_email"],
                    name=data["name"],
                    description=data["description"],
                    category=data["category"],
                    model=data["model"],
                    content=data["content"],
                    system_prompt=data.get("system_prompt", ""),
                    tags=data.get("tags", []),
                    parameters=data.get("parameters", {})
                )
                return {"status": "success", "prompt": result.__dict__}
            
            elif action == "create_version":
                result = self.create_new_version(
                    prompt_id=data["prompt_id"],
                    content=data["content"],
                    system_prompt=data.get("system_prompt", ""),
                    tags=data.get("tags", []),
                    parameters=data.get("parameters", {}),
                    notes=data.get("notes", "")
                )
                return {"status": "success", "version": result.__dict__}
            
            elif action == "compare_versions":
                result = self.compare_versions(
                    prompt_id=data["prompt_id"],
                    version_ids=data["version_ids"]
                )
                return {"status": "success", "comparison": result}
            
            elif action == "create_ab_test":
                result = self.create_ab_test(
                    prompt_id=data["prompt_id"],
                    name=data["name"],
                    version_ids=data["version_ids"],
                    test_input=data["test_input"],
                    evaluation_criteria=data["evaluation_criteria"]
                )
                return {"status": "success", "test": result.__dict__}
            
            elif action == "record_test_result":
                self.record_test_result(
                    test_id=data["test_id"],
                    version_id=data["version_id"],
                    metrics=data["metrics"]
                )
                return {"status": "success", "message": "Test result recorded"}
            
            elif action == "analyze_test":
                result = self.analyze_test_results(data["test_id"])
                return {"status": "success", "analysis": result}
            
            elif action == "get_best_prompts":
                result = self.get_best_prompts(
                    category=data.get("category", ""),
                    limit=data.get("limit", 10)
                )
                return {"status": "success", "best_prompts": result}
            
            elif action == "export_prompt":
                export_data = self.export_prompt(
                    prompt_id=data["prompt_id"],
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
    Demo the AI Prompt Manager
    
    This function demonstrates the core functionality with sample data.
    """
    print("🤖 AI Prompt Version Manager Demo")
    print("=" * 50)
    
    # Initialize the manager
    manager = AIPromptManager()
    
    # Register a demo user
    try:
        user = manager.register_user(
            email="prompt@example.com",
            name="Prompt Engineer",
            password="prompt123"
        )
        print(f"✅ Registered user: {user.name}")
        
        # Login the user
        logged_in_user = manager.login_user("prompt@example.com", "prompt123")
        if logged_in_user:
            print(f"✅ Logged in as: {logged_in_user.name}")
        
        # Create a prompt
        prompt = manager.create_prompt(
            user_email="prompt@example.com",
            name="Blog Post Generator",
            description="Generate engaging blog posts about technology",
            category="content_creation",
            model="gpt-4",
            content="Write a blog post about {topic} that is {tone} and approximately {word_count} words. Include {num_sections} sections with clear headings.",
            system_prompt="You are a professional content writer who creates engaging, well-researched blog posts.",
            tags=["blog", "content", "technology"],
            parameters={"temperature": 0.7, "max_tokens": 1000}
        )
        print(f"✅ Created prompt: {prompt.name}")
        
        # Create a second version
        version2 = manager.create_new_version(
            prompt_id=prompt.id,
            content="Write an engaging blog post about {topic} that is {tone} and approximately {word_count} words. Include {num_sections} sections with clear headings. Start with a hook and end with a call-to-action.",
            system_prompt="You are an expert content marketer who specializes in viral blog posts.",
            tags=["blog", "content", "marketing"],
            parameters={"temperature": 0.8, "max_tokens": 1200},
            notes="Added hook and CTA for better engagement"
        )
        print(f"✅ Created version 2: {version2.version_number}")
        
        # Compare versions
        comparison = manager.compare_versions(
            prompt_id=prompt.id,
            version_ids=[prompt.versions[0], version2.id]
        )
        print(f"✅ Compared versions: {len(comparison['versions'])} versions compared")
        
        # Create A/B test
        ab_test = manager.create_ab_test(
            prompt_id=prompt.id,
            name="Blog Post Performance Test",
            version_ids=[prompt.versions[0], version2.id],
            test_input="topic=artificial intelligence, tone=informative, word_count=800, num_sections=3",
            evaluation_criteria=["engagement_score", "readability", "call_to_action_effectiveness"]
        )
        print(f"✅ Created A/B test: {ab_test.name}")
        
        # Record test results
        manager.record_test_result(
            test_id=ab_test.id,
            version_id=prompt.versions[0],
            metrics={"engagement_score": 7.5, "readability": 8.2, "call_to_action_effectiveness": 6.0}
        )
        
        manager.record_test_result(
            test_id=ab_test.id,
            version_id=version2.id,
            metrics={"engagement_score": 8.8, "readability": 7.9, "call_to_action_effectiveness": 9.2}
        )
        print("✅ Recorded test results")
        
        # Analyze test
        analysis = manager.analyze_test_results(ab_test.id)
        print(f"✅ Analyzed test: Winner is {analysis['winner_version']}")
        
        # Export prompt
        export_json = manager.export_prompt(prompt.id, "json")
        print(f"✅ Exported prompt ({len(export_json)} characters)")
        
        # Get analytics
        analytics = manager.get_user_analytics("prompt@example.com")
        print(f"✅ User analytics: {analytics['usage']['total_prompts']} prompts, {analytics['usage']['total_versions']} versions")
        
        # Get best prompts
        best_prompts = manager.get_best_prompts(limit=5)
        print(f"✅ Found {len(best_prompts)} best performing prompts")
        
        print("🎉 AI Prompt Manager demo complete!")
        print(f"📊 Prompts created: {analytics['usage']['total_prompts']}")
        print(f"📈 Versions created: {analytics['usage']['total_versions']}")
        print(f"🧪 A/B tests run: 1")
        print(f"💰 Total estimated cost: ${analytics['costs']['total_estimated_cost']:.4f}")
        print(f"⭐ Average performance: {analytics['performance']['average_performance']:.2f}")
        
    except Exception as e:
        logger.error(f"Demo failed: {e}")
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    main()
