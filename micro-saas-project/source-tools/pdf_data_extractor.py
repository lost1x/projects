#!/usr/bin/env python3
"""
PDF → Structured Data Extractor
===============================

A micro-SaaS tool that extracts structured data from PDF documents
and converts it to usable formats like JSON, CSV, and Excel.

Features:
- Automatic PDF text extraction and parsing
- Structured data recognition (invoices, receipts, forms)
- Table extraction and formatting
- OCR support for scanned PDFs
- Multiple output formats (JSON, CSV, Excel, API)
- Batch processing capabilities
- Custom extraction templates
- AI fallback for complex layouts
- Validation and error handling

Business Model:
- Free: 10 PDFs/month, basic extraction
- Basic: 100 PDFs/month, table extraction ($9.99/month)
- Pro: 1000 PDFs/month, OCR + AI ($29.99/month)

Target Users:
- Accounting departments processing invoices
- Data entry automation teams
- Document management companies
- Financial services processing statements
- Healthcare providers processing forms
- Legal firms extracting contract data

Technical Implementation:
- PyPDF2 for text-based PDFs
- OCR integration for scanned documents
- AI/LLM for complex layout understanding
- Template matching for structured forms
- Export to multiple formats
- Batch processing with queue management

Author: Your Name
Created: 2026-03-06
"""

import os
import sys
import json
import logging
import hashlib
import csv
import re
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Union
from dataclasses import dataclass, field
from pathlib import Path
import uuid
import threading
import queue
import base64
from io import StringIO, BytesIO

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

# Configure logging specifically for PDF extraction
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - [PDF] %(message)s',
    handlers=[
        logging.FileHandler('pdf_extractor.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

@dataclass
class ExtractionTemplate:
    """
    Template for extracting structured data from specific PDF types
    
    Defines how to extract and structure data from different document
    types like invoices, receipts, forms, etc.
    
    Attributes:
        id: Unique identifier for the template
        name: Human-readable template name
        document_type: Type of document (invoice, receipt, form, etc.)
        description: What this template extracts
        field_mappings: Dictionary mapping field names to extraction rules
        table_config: Configuration for table extraction
        validation_rules: Rules to validate extracted data
        created_at: When template was created
        owner_email: Email of the template owner
        is_public: Whether template is shareable
    """
    id: str
    name: str
    document_type: str
    description: str
    field_mappings: Dict[str, Any] = field(default_factory=dict)
    table_config: Dict[str, Any] = field(default_factory=dict)
    validation_rules: Dict[str, Any] = field(default_factory=dict)
    created_at: datetime = field(default_factory=datetime.now)
    owner_email: str = ""
    is_public: bool = False

@dataclass
class ExtractionJob:
    """
    PDF extraction job data structure
    
    Represents a single PDF extraction task with status,
    results, and metadata.
    
    Attributes:
        id: Unique identifier for the job
        user_email: Email of the user who submitted the job
        file_name: Original file name
        file_path: Path to the uploaded PDF file
        file_size: Size of the PDF file in bytes
        template_id: ID of the template used for extraction
        status: Job status (pending, processing, completed, failed)
        progress: Progress percentage (0-100)
        extracted_data: Extracted structured data
        output_format: Requested output format
        error_message: Error message if job failed
        processing_time: Time taken to process in seconds
        created_at: When job was created
        completed_at: When job was completed
        metadata: Additional job metadata
    """
    id: str
    user_email: str
    file_name: str
    file_path: str
    file_size: int
    template_id: str
    status: str = "pending"
    progress: int = 0
    extracted_data: Dict[str, Any] = field(default_factory=dict)
    output_format: str = "json"
    error_message: str = ""
    processing_time: float = 0.0
    created_at: datetime = field(default_factory=datetime.now)
    completed_at: Optional[datetime] = None
    metadata: Dict[str, Any] = field(default_factory=dict)

@dataclass
class ExtractedField:
    """
    Individual extracted field data
    
    Represents a single field extracted from a PDF with
    confidence score and source information.
    
    Attributes:
        name: Field name
        value: Extracted value
        confidence: Confidence score (0-1)
        source_location: Location in PDF (page, coordinates)
        extraction_method: How the field was extracted
        validated: Whether field passed validation
        validation_message: Validation result message
    """
    name: str
    value: Any
    confidence: float
    source_location: Dict[str, Any] = field(default_factory=dict)
    extraction_method: str = "pattern_match"
    validated: bool = False
    validation_message: str = ""

@dataclass
class ExtractedTable:
    """
    Extracted table data structure
    
    Represents a table extracted from a PDF with
    headers, rows, and metadata.
    
    Attributes:
        name: Table name or identifier
        headers: List of column headers
        rows: List of table rows
        confidence: Overall confidence score
        source_location: Location in PDF
        row_count: Number of rows
        column_count: Number of columns
    """
    name: str
    headers: List[str]
    rows: List[List[Any]]
    confidence: float
    source_location: Dict[str, Any] = field(default_factory=dict)
    row_count: int = 0
    column_count: int = 0

class PDFDataExtractor(MicroSaaSApp):
    """
    Main PDF Data Extractor application
    
    This class extends the base MicroSaaSApp with PDF-specific
    functionality for extracting structured data from PDFs.
    
    Key Features:
    - PDF text extraction and parsing
    - Template-based data extraction
    - OCR support for scanned PDFs
    - Multiple output formats
    - Batch processing with queue
    - Usage limits for freemium model
    """
    
    def __init__(self, config_file: str = "config.json"):
        """Initialize the PDF Data Extractor"""
        super().__init__(config_file)
        
        # PDF extractor specific data storage
        self.extraction_jobs: Dict[str, ExtractionJob] = {}  # job_id -> ExtractionJob
        self.extraction_templates: Dict[str, ExtractionTemplate] = {}  # template_id -> ExtractionTemplate
        self.user_jobs: Dict[str, List[str]] = {}  # user_email -> [job_ids]
        self.user_templates: Dict[str, List[str]] = {}  # user_email -> [template_ids]
        
        # Processing queue for batch jobs
        self.processing_queue = queue.Queue()
        self.processing_active = False
        self.processing_thread = None
        
        # Storage paths
        self.uploads_path = "uploads"
        self.exports_path = "exports"
        
        # Create storage directories
        os.makedirs(self.uploads_path, exist_ok=True)
        os.makedirs(self.exports_path, exist_ok=True)
        
        # Initialize default templates
        self._initialize_default_templates()
        
        logger.info("PDF Data Extractor initialized")
        logger.info(f"Uploads path: {self.uploads_path}")
        logger.info(f"Loaded {len(self.extraction_templates)} templates")
    
    def _initialize_default_templates(self):
        """Initialize default extraction templates"""
        
        # Invoice template
        invoice_template = ExtractionTemplate(
            id="template_invoice_default",
            name="Invoice Extractor",
            document_type="invoice",
            description="Extract key fields from invoices",
            owner_email="system",
            is_public=True,
            field_mappings={
                "invoice_number": {
                    "pattern": r"(?:Invoice|INVOICE|Bill)\s*#?\s*([A-Z0-9-]+)",
                    "required": True
                },
                "date": {
                    "pattern": r"(?:Date|DATE)\s*[:]\s*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})",
                    "required": True
                },
                "amount": {
                    "pattern": r"(?:Total|TOTAL|Amount)\s*[:]\s*\$?(\d+,?\d*\.?\d{2})",
                    "required": True
                },
                "vendor": {
                    "pattern": r"(?:From|FROM|Vendor|VENDOR)\s*[:]\s*([A-Za-z0-9\s&]+)",
                    "required": False
                }
            },
            table_config={
                "line_items": {
                    "headers": ["Description", "Quantity", "Unit Price", "Total"],
                    "start_pattern": r"Item\s+Description",
                    "end_pattern": r"Subtotal|TOTAL"
                }
            }
        )
        
        # Receipt template
        receipt_template = ExtractionTemplate(
            id="template_receipt_default",
            name="Receipt Extractor", 
            document_type="receipt",
            description="Extract key fields from receipts",
            owner_email="system",
            is_public=True,
            field_mappings={
                "receipt_number": {
                    "pattern": r"(?:Receipt|RECEIPT)\s*#?\s*([A-Z0-9-]+)",
                    "required": False
                },
                "date": {
                    "pattern": r"(?:Date|DATE)\s*[:]\s*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})",
                    "required": True
                },
                "amount": {
                    "pattern": r"(?:Total|TOTAL)\s*[:]\s*\$?(\d+,?\d*\.?\d{2})",
                    "required": True
                },
                "merchant": {
                    "pattern": r"([A-Za-z0-9\s&]+(?:Store|Shop|Market|Restaurant))",
                    "required": False
                }
            }
        )
        
        self.extraction_templates[invoice_template.id] = invoice_template
        self.extraction_templates[receipt_template.id] = receipt_template
        
        logger.info("Initialized default templates")
    
    def upload_pdf(self, user_email: str, file_data: bytes, file_name: str) -> str:
        """
        Upload and store a PDF file for processing
        
        Args:
            user_email: Email of the user uploading
            file_data: Raw PDF file data
            file_name: Original file name
            
        Returns:
            Path to the stored file
        """
        # Check user limits
        if user_email not in self.users:
            raise ValueError("User not found. Please register first.")
        
        user = self.users[user_email]
        user_jobs = self.user_jobs.get(user_email, [])
        job_limit = self.get_job_limit(user.plan)
        
        # Count jobs in last month
        month_ago = datetime.now() - timedelta(days=30)
        recent_jobs = len([job_id for job_id in user_jobs 
                          if job_id in self.extraction_jobs 
                          and self.extraction_jobs[job_id].created_at >= month_ago])
        
        if recent_jobs >= job_limit:
            raise ValueError(f"Monthly job limit reached ({job_limit}). Upgrade your plan for more processing.")
        
        # Validate file type
        if not file_name.lower().endswith('.pdf'):
            raise ValueError("Only PDF files are supported")
        
        # Generate unique filename
        file_id = f"pdf_{uuid.uuid4().hex[:8]}"
        filename = f"{file_id}.pdf"
        file_path = os.path.join(self.uploads_path, filename)
        
        # Store file
        with open(file_path, 'wb') as f:
            f.write(file_data)
        
        logger.info(f"Uploaded PDF: {file_name} -> {file_path}")
        return file_path
    
    def get_job_limit(self, plan: str) -> int:
        """
        Get job limit based on user plan
        
        Args:
            plan: User's subscription plan
            
        Returns:
            Maximum number of jobs per month
        """
        limits = {
            "free": 10,
            "basic": 100,
            "pro": 1000,
            "enterprise": 10000
        }
        return limits.get(plan, 10)
    
    def create_extraction_job(self, user_email: str, file_path: str, 
                           template_id: str, output_format: str = "json") -> ExtractionJob:
        """
        Create a new PDF extraction job
        
        Args:
            user_email: Email of the user
            file_path: Path to the PDF file
            template_id: ID of the extraction template
            output_format: Output format (json, csv, excel)
            
        Returns:
            Created ExtractionJob object
        """
        # Validate inputs
        if not os.path.exists(file_path):
            raise ValueError("PDF file not found")
        
        if template_id not in self.extraction_templates:
            raise ValueError("Template not found")
        
        # Create job
        job_id = f"job_{uuid.uuid4().hex[:8]}"
        file_size = os.path.getsize(file_path)
        file_name = os.path.basename(file_path)
        
        new_job = ExtractionJob(
            id=job_id,
            user_email=user_email,
            file_name=file_name,
            file_path=file_path,
            file_size=file_size,
            template_id=template_id,
            output_format=output_format
        )
        
        # Store job
        self.extraction_jobs[job_id] = new_job
        
        # Link to user
        if user_email not in self.user_jobs:
            self.user_jobs[user_email] = []
        self.user_jobs[user_email].append(job_id)
        
        logger.info(f"Created extraction job {job_id} for user {user_email}")
        return new_job
    
    def process_pdf_job(self, job_id: str) -> Dict[str, Any]:
        """
        Process a PDF extraction job
        
        This is the core extraction logic that extracts structured
        data from the PDF using the specified template.
        
        Args:
            job_id: ID of the job to process
            
        Returns:
            Extraction results
        """
        if job_id not in self.extraction_jobs:
            raise ValueError("Job not found")
        
        job = self.extraction_jobs[job_id]
        template = self.extraction_templates[job.template_id]
        
        try:
            # Update job status
            job.status = "processing"
            job.progress = 10
            
            start_time = datetime.now()
            
            # Extract text from PDF (simulated)
            pdf_text = self._extract_pdf_text(job.file_path)
            job.progress = 40
            
            # Extract fields using template
            extracted_fields = self._extract_fields(pdf_text, template)
            job.progress = 70
            
            # Extract tables if configured
            extracted_tables = self._extract_tables(pdf_text, template)
            job.progress = 90
            
            # Validate extracted data
            validated_data = self._validate_extracted_data(
                extracted_fields, extracted_tables, template
            )
            
            # Compile results
            results = {
                "job_id": job_id,
                "template_name": template.name,
                "document_type": template.document_type,
                "file_name": job.file_name,
                "extraction_timestamp": datetime.now().isoformat(),
                "fields": [field.__dict__ for field in extracted_fields],
                "tables": [table.__dict__ for table in extracted_tables],
                "summary": {
                    "total_fields": len(extracted_fields),
                    "total_tables": len(extracted_tables),
                    "confidence_score": self._calculate_overall_confidence(extracted_fields, extracted_tables)
                }
            }
            
            # Store results
            job.extracted_data = results
            job.status = "completed"
            job.progress = 100
            job.completed_at = datetime.now()
            job.processing_time = (job.completed_at - start_time).total_seconds()
            
            logger.info(f"Completed job {job_id} in {job.processing_time:.2f}s")
            return results
            
        except Exception as e:
            job.status = "failed"
            job.error_message = str(e)
            job.completed_at = datetime.now()
            logger.error(f"Failed to process job {job_id}: {e}")
            raise
    
    def _extract_pdf_text(self, file_path: str) -> str:
        """
        Extract text from PDF file
        
        In a real implementation, this would use PyPDF2 or similar.
        For demo purposes, we'll simulate text extraction.
        
        Args:
            file_path: Path to the PDF file
            
        Returns:
            Extracted text content
        """
        # Simulate PDF text extraction
        # In production, you'd use PyPDF2, pdfplumber, or similar
        
        sample_text = """
        INVOICE #2024-001
        Date: 03/15/2024
        
        From: ABC Supplies Inc.
        To: XYZ Corporation
        
        Item Description        Quantity    Unit Price    Total
        Widget A                5           $10.00        $50.00
        Widget B                3           $15.00        $45.00
        Widget C                2           $20.00        $40.00
        
        Subtotal: $135.00
        Tax (10%): $13.50
        TOTAL: $148.50
        """
        
        return sample_text.strip()
    
    def _extract_fields(self, text: str, template: ExtractionTemplate) -> List[ExtractedField]:
        """
        Extract fields from text using template patterns
        
        Args:
            text: Extracted PDF text
            template: Extraction template
            
        Returns:
            List of extracted fields
        """
        fields = []
        
        for field_name, field_config in template.field_mappings.items():
            pattern = field_config.get("pattern", "")
            required = field_config.get("required", False)
            
            try:
                match = re.search(pattern, text, re.IGNORECASE | re.MULTILINE)
                
                if match:
                    value = match.group(1) if match.groups() else match.group(0)
                    
                    field = ExtractedField(
                        name=field_name,
                        value=value.strip(),
                        confidence=0.85,  # Simulated confidence
                        extraction_method="pattern_match",
                        validated=True
                    )
                    fields.append(field)
                    
                elif required:
                    # Required field not found
                    field = ExtractedField(
                        name=field_name,
                        value="",
                        confidence=0.0,
                        extraction_method="pattern_match",
                        validated=False,
                        validation_message=f"Required field '{field_name}' not found"
                    )
                    fields.append(field)
                    
            except Exception as e:
                logger.error(f"Error extracting field {field_name}: {e}")
        
        return fields
    
    def _extract_tables(self, text: str, template: ExtractionTemplate) -> List[ExtractedTable]:
        """
        Extract tables from text using template configuration
        
        Args:
            text: Extracted PDF text
            template: Extraction template
            
        Returns:
            List of extracted tables
        """
        tables = []
        
        if not template.table_config:
            return tables
        
        for table_name, table_config in template.table_config.items():
            try:
                # Simulate table extraction
                # In production, this would be more sophisticated
                
                headers = table_config.get("headers", [])
                
                # Create sample table data
                rows = [
                    ["Widget A", "5", "$10.00", "$50.00"],
                    ["Widget B", "3", "$15.00", "$45.00"],
                    ["Widget C", "2", "$20.00", "$40.00"]
                ]
                
                table = ExtractedTable(
                    name=table_name,
                    headers=headers,
                    rows=rows,
                    confidence=0.80,
                    row_count=len(rows),
                    column_count=len(headers)
                )
                
                tables.append(table)
                
            except Exception as e:
                logger.error(f"Error extracting table {table_name}: {e}")
        
        return tables
    
    def _validate_extracted_data(self, fields: List[ExtractedField], 
                               tables: List[ExtractedTable],
                               template: ExtractionTemplate) -> Dict[str, Any]:
        """
        Validate extracted data against template rules
        
        Args:
            fields: Extracted fields
            tables: Extracted tables
            template: Extraction template
            
        Returns:
            Validation results
        """
        validation_results = {
            "valid": True,
            "errors": [],
            "warnings": [],
            "field_validation": {},
            "table_validation": {}
        }
        
        # Validate fields
        for field in fields:
            field_validation = {
                "valid": field.validated,
                "message": field.validation_message
            }
            validation_results["field_validation"][field.name] = field_validation
            
            if not field.validated:
                validation_results["valid"] = False
                validation_results["errors"].append(f"Field '{field.name}' validation failed")
        
        # Validate tables
        for table in tables:
            table_validation = {
                "valid": table.confidence > 0.5,
                "confidence": table.confidence,
                "rows": table.row_count,
                "columns": table.column_count
            }
            validation_results["table_validation"][table.name] = table_validation
            
            if table.confidence <= 0.5:
                validation_results["warnings"].append(f"Table '{table.name}' has low confidence")
        
        return validation_results
    
    def _calculate_overall_confidence(self, fields: List[ExtractedField], 
                                    tables: List[ExtractedTable]) -> float:
        """
        Calculate overall confidence score for extraction
        
        Args:
            fields: Extracted fields
            tables: Extracted tables
            
        Returns:
            Overall confidence score (0-1)
        """
        all_confidences = []
        
        # Field confidences
        for field in fields:
            all_confidences.append(field.confidence)
        
        # Table confidences
        for table in tables:
            all_confidences.append(table.confidence)
        
        if not all_confidences:
            return 0.0
        
        return sum(all_confidences) / len(all_confidences)
    
    def export_results(self, job_id: str, format: str = "json") -> str:
        """
        Export extraction results in specified format
        
        Args:
            job_id: ID of the completed job
            format: Export format (json, csv, excel)
            
        Returns:
            Path to exported file or string content
        """
        if job_id not in self.extraction_jobs:
            raise ValueError("Job not found")
        
        job = self.extraction_jobs[job_id]
        
        if job.status != "completed":
            raise ValueError("Job must be completed before export")
        
        data = job.extracted_data
        
        if format.lower() == "json":
            return json.dumps(data, indent=2)
        
        elif format.lower() == "csv":
            return self._export_to_csv(data)
        
        elif format.lower() == "excel":
            return self._export_to_excel(data)
        
        else:
            raise ValueError(f"Unsupported export format: {format}")
    
    def _export_to_csv(self, data: Dict[str, Any]) -> str:
        """Export data to CSV format"""
        output = StringIO()
        
        # Export fields
        if data.get("fields"):
            writer = csv.writer(output)
            writer.writerow(["Field", "Value", "Confidence"])
            
            for field in data["fields"]:
                writer.writerow([
                    field["name"],
                    field["value"],
                    field["confidence"]
                ])
        
        return output.getvalue()
    
    def _export_to_excel(self, data: Dict[str, Any]) -> str:
        """Export data to Excel format (simulated)"""
        # In production, you'd use pandas or openpyxl
        # For demo, return formatted text
        excel_data = "EXCEL FORMAT (simulated)\n\n"
        
        if data.get("fields"):
            excel_data += "FIELDS:\n"
            for field in data["fields"]:
                excel_data += f"{field['name']}\t{field['value']}\t{field['confidence']}\n"
        
        if data.get("tables"):
            excel_data += "\nTABLES:\n"
            for table in data["tables"]:
                excel_data += f"\n{table['name']}:\n"
                excel_data += "\t".join(table["headers"]) + "\n"
                for row in table["rows"]:
                    excel_data += "\t".join(str(cell) for cell in row) + "\n"
        
        return excel_data
    
    def create_custom_template(self, user_email: str, name: str, document_type: str,
                             description: str, field_mappings: Dict[str, Any],
                             table_config: Dict[str, Any] = None,
                             validation_rules: Dict[str, Any] = None) -> ExtractionTemplate:
        """
        Create a custom extraction template
        
        Args:
            user_email: Email of the user
            name: Template name
            document_type: Type of document
            description: Template description
            field_mappings: Field extraction rules
            table_config: Table extraction configuration
            validation_rules: Data validation rules
            
        Returns:
            Created ExtractionTemplate object
        """
        template_id = f"template_{uuid.uuid4().hex[:8]}"
        
        new_template = ExtractionTemplate(
            id=template_id,
            name=name,
            document_type=document_type,
            description=description,
            field_mappings=field_mappings,
            table_config=table_config or {},
            validation_rules=validation_rules or {},
            owner_email=user_email
        )
        
        # Store template
        self.extraction_templates[template_id] = new_template
        
        # Link to user
        if user_email not in self.user_templates:
            self.user_templates[user_email] = []
        self.user_templates[user_email].append(template_id)
        
        logger.info(f"Created custom template '{name}' for user {user_email}")
        return new_template
    
    def get_user_analytics(self, user_email: str) -> Dict[str, Any]:
        """
        Get comprehensive analytics for a user
        
        Provides usage statistics, performance metrics,
        and insights about the user's PDF processing.
        
        Args:
            user_email: Email of the user
            
        Returns:
            Analytics data dictionary
        """
        if user_email not in self.users:
            raise ValueError("User not found")
        
        user = self.users[user_email]
        user_job_ids = self.user_jobs.get(user_email, [])
        
        # Get user's jobs
        user_jobs = [self.extraction_jobs[jid] for jid in user_job_ids if jid in self.extraction_jobs]
        
        # Calculate statistics
        total_jobs = len(user_jobs)
        completed_jobs = len([j for j in user_jobs if j.status == "completed"])
        failed_jobs = len([j for j in user_jobs if j.status == "failed"])
        
        # Processing statistics
        total_processing_time = sum(j.processing_time for j in user_jobs if j.processing_time > 0)
        avg_processing_time = total_processing_time / max(1, completed_jobs)
        
        # File statistics
        total_file_size = sum(j.file_size for j in user_jobs)
        avg_file_size = total_file_size / max(1, total_jobs)
        
        # Template usage
        template_usage = {}
        for job in user_jobs:
            template_name = self.extraction_templates.get(job.template_id, {}).name or "Unknown"
            template_usage[template_name] = template_usage.get(template_name, 0) + 1
        
        # Recent activity (last 30 days)
        month_ago = datetime.now() - timedelta(days=30)
        recent_jobs = [j for j in user_jobs if j.created_at >= month_ago]
        
        analytics = {
            "user": {
                "email": user_email,
                "name": user.name,
                "plan": user.plan
            },
            "jobs": {
                "total": total_jobs,
                "completed": completed_jobs,
                "failed": failed_jobs,
                "success_rate": (completed_jobs / max(1, total_jobs)) * 100,
                "recent": len(recent_jobs)
            },
            "performance": {
                "avg_processing_time": round(avg_processing_time, 2),
                "total_processing_time": round(total_processing_time, 2),
                "avg_file_size_mb": round(avg_file_size / (1024 * 1024), 2),
                "total_file_size_mb": round(total_file_size / (1024 * 1024), 2)
            },
            "templates": {
                "used": len(template_usage),
                "usage_breakdown": template_usage
            },
            "recent_activity": self._get_recent_processing_activity(user_email)
        }
        
        return analytics
    
    def _get_recent_processing_activity(self, user_email: str) -> List[Dict[str, Any]]:
        """Get recent processing activity for user"""
        user_job_ids = self.user_jobs.get(user_email, [])
        recent_jobs = []
        
        for job_id in user_job_ids[-5:]:  # Last 5 jobs
            if job_id in self.extraction_jobs:
                job = self.extraction_jobs[job_id]
                recent_jobs.append({
                    "job_id": job.id,
                    "file_name": job.file_name,
                    "status": job.status,
                    "created_at": job.created_at.isoformat(),
                    "processing_time": job.processing_time
                })
        
        return recent_jobs
    
    def handle_core_logic(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Handle PDF extractor specific requests
        
        Routes requests to appropriate PDF extraction functions.
        """
        action = data.get("action", "")
        
        try:
            if action == "upload_pdf":
                # In a real implementation, you'd handle file upload
                # For demo, simulate with file path
                file_path = self.upload_pdf(
                    user_email=data["user_email"],
                    file_data=b"FAKE_PDF_DATA",  # Simulated
                    file_name=data["file_name"]
                )
                return {"status": "success", "file_path": file_path}
            
            elif action == "create_job":
                result = self.create_extraction_job(
                    user_email=data["user_email"],
                    file_path=data["file_path"],
                    template_id=data["template_id"],
                    output_format=data.get("output_format", "json")
                )
                return {"status": "success", "job": result.__dict__}
            
            elif action == "process_job":
                result = self.process_pdf_job(data["job_id"])
                return {"status": "success", "results": result}
            
            elif action == "export_results":
                export_data = self.export_results(
                    job_id=data["job_id"],
                    format=data.get("format", "json")
                )
                return {"status": "success", "export": export_data}
            
            elif action == "create_template":
                result = self.create_custom_template(
                    user_email=data["user_email"],
                    name=data["name"],
                    document_type=data["document_type"],
                    description=data["description"],
                    field_mappings=data["field_mappings"],
                    table_config=data.get("table_config", {}),
                    validation_rules=data.get("validation_rules", {})
                )
                return {"status": "success", "template": result.__dict__}
            
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
    Demo PDF Data Extractor
    
    This function demonstrates core functionality with sample data.
    """
    print("📄 PDF Data Extractor Demo")
    print("=" * 50)
    
    # Initialize extractor
    extractor = PDFDataExtractor()
    
    # Register a demo user
    try:
        user = extractor.register_user(
            email="extract@example.com",
            name="Data Extractor",
            password="extract123"
        )
        print(f"✅ Registered user: {user.name}")
        
        # Login user
        logged_in_user = extractor.login_user("extract@example.com", "extract123")
        if logged_in_user:
            print(f"✅ Logged in as: {logged_in_user.name}")
        
        # Upload a PDF (simulated)
        file_path = extractor.upload_pdf(
            user_email="extract@example.com",
            file_data=b"FAKE_PDF_DATA",
            file_name="sample_invoice.pdf"
        )
        print(f"✅ Uploaded PDF: {file_path}")
        
        # Create extraction job
        job = extractor.create_extraction_job(
            user_email="extract@example.com",
            file_path=file_path,
            template_id="template_invoice_default",
            output_format="json"
        )
        print(f"✅ Created extraction job: {job.id}")
        
        # Process the job
        results = extractor.process_pdf_job(job.id)
        print(f"✅ Processed job: {len(results['fields'])} fields, {len(results['tables'])} tables")
        
        # Display extracted fields
        print("\n📋 Extracted Fields:")
        for field in results["fields"]:
            print(f"  {field['name']}: {field['value']} (confidence: {field['confidence']})")
        
        # Display extracted tables
        if results["tables"]:
            print("\n📊 Extracted Tables:")
            for table in results["tables"]:
                print(f"  {table['name']}: {table['row_count']} rows, {table['column_count']} columns")
        
        # Export results
        json_export = extractor.export_results(job.id, "json")
        print(f"✅ Exported JSON ({len(json_export)} characters)")
        
        csv_export = extractor.export_results(job.id, "csv")
        print(f"✅ Exported CSV ({len(csv_export)} characters)")
        
        # Create custom template
        custom_template = extractor.create_custom_template(
            user_email="extract@example.com",
            name="Custom Receipt Extractor",
            document_type="receipt",
            description="Extract data from restaurant receipts",
            field_mappings={
                "restaurant_name": {
                    "pattern": r"([A-Za-z\s]+(?:Restaurant|Cafe|Bistro))",
                    "required": True
                },
                "total_amount": {
                    "pattern": r"Total[:]\s*\$?(\d+\.\d{2})",
                    "required": True
                },
                "date": {
                    "pattern": r"(\d{1,2}[/-]\d{1,2}[/-]\d{4})",
                    "required": True
                }
            }
        )
        print(f"✅ Created custom template: {custom_template.name}")
        
        # Get analytics
        analytics = extractor.get_user_analytics("extract@example.com")
        print(f"✅ User analytics: {analytics['jobs']['total']} jobs, {analytics['jobs']['success_rate']:.1f}% success rate")
        
        print("\n🎉 PDF Data Extractor demo complete!")
        print(f"📄 Jobs processed: {analytics['jobs']['total']}")
        print(f"⚡ Average processing time: {analytics['performance']['avg_processing_time']}s")
        print(f"📊 Success rate: {analytics['jobs']['success_rate']:.1f}%")
        print(f"📁 Total file size processed: {analytics['performance']['total_file_size_mb']} MB")
        print(f"📋 Templates used: {analytics['templates']['used']}")
        
    except Exception as e:
        logger.error(f"Demo failed: {e}")
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    main()
