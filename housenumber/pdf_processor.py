import os
import time
import shutil
import logging
import re
import requests
import json
from pathlib import Path
from datetime import datetime
from typing import Optional, Dict, Tuple
from urllib.parse import quote
import pandas as pd
import pdfplumber
from dotenv import load_dotenv
from functools import wraps

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('pdf_processor.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

def retry_on_failure(max_retries=3, delay=5):
    """Decorator to retry API calls on failure with exponential backoff."""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            for attempt in range(max_retries):
                try:
                    return func(*args, **kwargs)
                except requests.exceptions.RequestException as e:
                    if attempt == max_retries - 1:
                        raise
                    wait_time = delay * (2 ** attempt)  # Exponential backoff
                    logger.warning(f"API call failed (attempt {attempt + 1}/{max_retries}), retrying in {wait_time}s: {e}")
                    time.sleep(wait_time)
            return None
        return wrapper
    return decorator

class PDFProcessor:
    def __init__(self, 
                 files_folder: str = "files",
                 success_folder: str = "success",
                 fail_folder: str = "fail",
                 retry_folder: str = "retry",
                 excel_file: str = "phone_numbers.xlsx"):
        """
        Initialize the PDF processor with folder paths and configuration.
        
        Args:
            files_folder: Path to folder containing new PDFs
            success_folder: Path to folder for successfully sent files
            fail_folder: Path to folder for failed files
            retry_folder: Path to folder for files that can be retried
            excel_file: Path to Excel file containing flat numbers and phone numbers
        """
        self.files_folder = Path(files_folder)
        self.success_folder = Path(success_folder)
        self.fail_folder = Path(fail_folder)
        self.retry_folder = Path(retry_folder)
        self.excel_file = excel_file
        
        # Processing control
        self.should_stop = False
        self.empty_scan_count = 0
        self.MAX_EMPTY_SCANS = 6  # Stop processing after 6 scans with no files (3 minutes)
        
        # Multiple patterns for different flat number formats
        self.flat_patterns = [
            r"Flat\s*[Nn]o\.?\s*:?\s*([A-Z]?\d{2,4}[A-Z]?)",           # Flat No: 303, Flat no. A404
            r"Flat\s*:?\s*([A-Z]?\d{2,4}[A-Z]?)",                      # Flat: A303 or Flat: 303B
            r"Unit\s*[Nn]o\.?\s*:?\s*([A-Z]?\d{2,4}[A-Z]?)",           # Unit No: 303
            r"Unit\s*:?\s*([A-Z]?\d{2,4}[A-Z]?)",                      # Unit: A303
            r"Apartment\s*[Nn]o\.?\s*:?\s*([A-Z]?\d{2,4}[A-Z]?)",      # Apartment No: 303
            r"Apartment\s*:?\s*([A-Z]?\d{2,4}[A-Z]?)",                 # Apartment: 303
            r"Room\s*[Nn]o\.?\s*:?\s*([A-Z]?\d{2,4}[A-Z]?)",           # Room No: 303
            r"Room\s*:?\s*([A-Z]?\d{2,4}[A-Z]?)",                      # Room: 303
            r"(?:Flat|Unit|Apt|Room)[\s:]*([A-Z]?\d{2,4}[A-Z]?)",      # Generic pattern
        ]
        
        # Get API key from environment
        self.api_key = os.getenv('API_KEY')
        if not self.api_key:
            raise ValueError("API_KEY not found in environment variables. Make sure it's in your .env file.")
        
        # API endpoints
        self.upload_url = 'http://bot.bonrix.in/wapp/upload/mediafile'
        self.send_api_base_url = 'http://bot.bonrix.in/wapp/api/send'
        
        # Create folders if they don't exist
        self._create_folders()
        
        # Load phone numbers from Excel
        self.phone_numbers = self._load_phone_numbers()
        
        # Load processed files state from disk
        self.processed_files = self._load_processed_state()
        
        # Statistics
        self.stats = {
            'processed': 0,
            'success': 0,
            'failed': 0,
            'retried': 0
        }
    
    def _create_folders(self):
        """Create required folders if they don't exist."""
        for folder in [self.files_folder, self.success_folder, self.fail_folder, self.retry_folder]:
            folder.mkdir(exist_ok=True)
            logger.info(f"Ensured folder exists: {folder}")
    
    def _load_processed_state(self) -> set:
        """Load processed files state from disk."""
        state_file = Path("processed_state.json")
        if state_file.exists():
            try:
                with open(state_file, 'r') as f:
                    data = json.load(f)
                    processed_files = set(data.get('processed_files', []))
                    logger.info(f"Loaded {len(processed_files)} processed files from state")
                    return processed_files
            except Exception as e:
                logger.warning(f"Could not load processed state: {e}")
        return set()
    
    def _save_processed_state(self):
        """Save processed files state to disk."""
        state_file = Path("processed_state.json")
        try:
            with open(state_file, 'w') as f:
                json.dump({
                    'processed_files': list(self.processed_files),
                    'last_update': datetime.now().isoformat(),
                    'stats': self.stats
                }, f, indent=2)
        except Exception as e:
            logger.warning(f"Could not save processed state: {e}")
    
    def _load_phone_numbers(self) -> Dict[str, str]:
        """
        Load phone numbers from Excel file.
        Assumes Excel has columns: 'Flat No' and 'Phone Number'
        """
        try:
            df = pd.read_excel(self.excel_file)
            # Normalize column names (strip whitespace, convert to lowercase)
            df.columns = df.columns.str.strip().str.lower()
            
            # Try different possible column names
            flat_col = None
            phone_col = None
            
            for col in df.columns:
                if 'flat' in col:
                    flat_col = col
                elif 'phone' in col:
                    phone_col = col
            
            if not flat_col or not phone_col:
                raise ValueError("Could not find 'Flat No' and 'Phone Number' columns in Excel")
            
            # Convert to dictionary, ensuring flat numbers are strings
            phone_dict = {}
            for _, row in df.iterrows():
                # Handle flat numbers - preserve leading zeros
                flat_no = str(row[flat_col]).strip()
                # If it's a float (like 404.0), convert to int first
                if '.' in flat_no and flat_no.endswith('.0'):
                    flat_no = str(int(float(flat_no)))
                
                # Handle phone numbers - just ensure they're strings (no '+' needed for Bonrix API)
                phone = str(row[phone_col]).strip()
                # Remove any '+' if present
                if phone.startswith('+'):
                    phone = phone[1:]
                
                phone_dict[flat_no] = phone
            
            logger.info(f"Loaded {len(phone_dict)} phone numbers from Excel")
            logger.info(f"Sample entries: {dict(list(phone_dict.items())[:3])}")
            return phone_dict
            
        except Exception as e:
            logger.error(f"Error loading Excel file: {e}")
            return {}
    
    def _normalize_flat_number(self, flat_no: str) -> str:
        """
        Normalize flat number by removing leading zeros and common formatting.
        """
        if not flat_no:
            return flat_no
        
        # Remove leading zeros but keep at least one digit
        normalized = flat_no.lstrip('0') or '0'
        # Remove any spaces or dashes
        normalized = normalized.replace(' ', '').replace('-', '')
        return normalized
    
    def _find_phone_number(self, flat_no: str) -> Optional[str]:
        """
        Find phone number with fuzzy matching for flat numbers.
        Tries exact match first, then normalized matching.
        """
        # Try exact match first
        if flat_no in self.phone_numbers:
            logger.info(f"Found exact match for flat {flat_no}")
            return self.phone_numbers[flat_no]
        
        # Try normalized match
        normalized_flat = self._normalize_flat_number(flat_no)
        logger.info(f"Trying normalized flat number: {flat_no} -> {normalized_flat}")
        
        if normalized_flat in self.phone_numbers:
            logger.info(f"Found normalized match for flat {normalized_flat}")
            return self.phone_numbers[normalized_flat]
        
        # Try matching against normalized keys
        for key, phone in self.phone_numbers.items():
            if self._normalize_flat_number(key) == normalized_flat:
                logger.info(f"Found match: {key} normalized to {normalized_flat}")
                return phone
        
        # Log available options for debugging
        logger.warning(f"No match found for flat {flat_no} (normalized: {normalized_flat})")
        logger.info(f"Available flats: {list(self.phone_numbers.keys())}")
        return None
    
    def _extract_flat_no_from_pdf(self, pdf_path: Path) -> Optional[str]:
        """
        Extract flat number from PDF file using multiple patterns.
        
        Args:
            pdf_path: Path to PDF file
            
        Returns:
            Extracted flat number or None if not found
        """
        try:
            with pdfplumber.open(pdf_path) as pdf:
                # Extract text from all pages
                full_text = ""
                for page in pdf.pages:
                    text = page.extract_text()
                    if text:
                        full_text += text + "\n"
                
                if not full_text:
                    logger.warning(f"No text extracted from {pdf_path.name}")
                    return None
                
                # Try each pattern
                for pattern in self.flat_patterns:
                    match = re.search(pattern, full_text, re.IGNORECASE)
                    if match:
                        flat_no = match.group(1).strip()
                        logger.info(f"Extracted flat no '{flat_no}' from {pdf_path.name} using pattern: {pattern}")
                        return flat_no
                
                # If no pattern worked, try to find any 3-4 digit number after keywords
                lines = full_text.split('\n')
                for line in lines:
                    line_lower = line.lower()
                    if any(word in line_lower for word in ['flat', 'unit', 'apartment', 'room']):
                        # Look for 3-4 digit numbers in this line
                        numbers = re.findall(r'\b([A-Z]?\d{2,4}[A-Z]?)\b', line)
                        if numbers:
                            flat_no = numbers[0]
                            logger.info(f"Found potential flat no '{flat_no}' in line: {line.strip()}")
                            return flat_no
                
            logger.warning(f"Could not extract flat number from {pdf_path.name}")
            return None
            
        except Exception as e:
            logger.error(f"Error reading PDF {pdf_path.name}: {e}")
            return None
    
    @retry_on_failure(max_retries=3, delay=5)
    def send_whatsapp_pdf(self, phone_number: str, pdf_path: Path, flat_no: str) -> bool:
        """
        Upload PDF and send via WhatsApp using Bonrix API with retry logic.
        
        Args:
            phone_number: Recipient's phone number
            pdf_path: Path to PDF file to send
            flat_no: Flat number for the message
            
        Returns:
            True if sent successfully, False otherwise
        """
        try:
            logger.info(f"Uploading {pdf_path.name} for flat {flat_no}")
            
            # Get file stats
            file_size_kb = round(pdf_path.stat().st_size / 1024)
            logger.info(f"File size: {file_size_kb} KB")
            
            # Upload file to media server
            with open(pdf_path, 'rb') as f:
                files = {
                    'file': (pdf_path.name, f, 'application/pdf')
                }
                form_data = {
                    'apikey': self.api_key
                }
                
                upload_response = requests.post(self.upload_url, data=form_data, files=files, timeout=30)
                upload_response.raise_for_status()
            
            # Get the URL of the uploaded file
            uploaded_file_url = upload_response.text.strip()
            logger.info(f"File uploaded successfully. URL: {uploaded_file_url}")
            
            # Send WhatsApp message with the uploaded file URL
            encoded_file_url = quote(uploaded_file_url)
            message = f"Invoice for Flat No: {flat_no}"
            encoded_message = quote(message)
            
            send_api_url = (f"{self.send_api_base_url}?apikey={self.api_key}"
                          f"&mobile={phone_number}&msg={encoded_message}"
                          f"&pdf={encoded_file_url}&cache=false")
            
            api_response = requests.get(send_api_url, timeout=30)
            api_response.raise_for_status()
            
            logger.info(f"WhatsApp API response: {api_response.text}")
            logger.info(f"Successfully sent {pdf_path.name} to {phone_number} for flat {flat_no}")
            
            return True
            
        except requests.exceptions.RequestException as e:
            logger.error(f"API error sending WhatsApp message: {e}")
            if hasattr(e, 'response') and e.response:
                logger.error(f"API Error Response: {e.response.text}")
                logger.error(f"API Error Status: {e.response.status_code}")
            raise  # Re-raise for retry decorator
        except Exception as e:
            logger.error(f"Error sending WhatsApp message: {e}")
            return False
    
    def _move_file(self, source: Path, destination_folder: Path) -> bool:
        """
        Move file to destination folder.
        
        Args:
            source: Source file path
            destination_folder: Destination folder path
            
        Returns:
            True if moved successfully, False otherwise
        """
        try:
            destination = destination_folder / source.name
            
            # If file already exists in destination, add timestamp
            if destination.exists():
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                name_parts = source.name.rsplit('.', 1)
                new_name = f"{name_parts[0]}_{timestamp}.{name_parts[1]}"
                destination = destination_folder / new_name
            
            shutil.move(str(source), str(destination))
            logger.info(f"Moved {source.name} to {destination_folder.name}")
            return True
            
        except Exception as e:
            logger.error(f"Error moving file {source.name}: {e}")
            return False
    
    def process_file(self, pdf_path: Path) -> Tuple[bool, str]:
        """
        Process a single PDF file.
        
        Args:
            pdf_path: Path to PDF file
            
        Returns:
            Tuple of (success, status_message)
        """
        if self.should_stop:
            return False, "Processing stopped"
            
        logger.info(f"Processing file: {pdf_path.name}")
        self.stats['processed'] += 1
        
        try:
            # Extract flat number
            flat_no = self._extract_flat_no_from_pdf(pdf_path)
            if not flat_no:
                logger.error(f"Could not extract flat number from {pdf_path.name}")
                self._move_file(pdf_path, self.fail_folder)
                self.stats['failed'] += 1
                return False, "Failed to extract flat number"
            
            # Get phone number using improved lookup
            phone_number = self._find_phone_number(flat_no)
            if not phone_number:
                logger.error(f"No phone number found for flat {flat_no}")
                self._move_file(pdf_path, self.fail_folder)
                self.stats['failed'] += 1
                return False, f"No phone number for flat {flat_no}"
            
            # Send via WhatsApp
            success = self.send_whatsapp_pdf(phone_number, pdf_path, flat_no)
            
            # Move file based on result
            if success:
                self._move_file(pdf_path, self.success_folder)
                self.stats['success'] += 1
                return True, f"Sent to {phone_number} for flat {flat_no}"
            else:
                # Move to retry folder for API failures, fail folder for other errors
                self._move_file(pdf_path, self.retry_folder)
                self.stats['failed'] += 1
                return False, f"Failed to send to {phone_number} - moved to retry folder"
                
        except Exception as e:
            logger.error(f"Unexpected error processing {pdf_path.name}: {e}")
            self._move_file(pdf_path, self.fail_folder)
            self.stats['failed'] += 1
            return False, f"Unexpected error: {str(e)}"
    
    def process_retry_files(self):
        """Process files in the retry folder."""
        retry_files = list(self.retry_folder.glob("*.pdf"))
        if retry_files:
            logger.info(f"Processing {len(retry_files)} files from retry folder")
            for pdf_file in retry_files:
                if self.should_stop:
                    break
                success, message = self.process_file(pdf_file)
                if success:
                    self.stats['retried'] += 1
                time.sleep(3)  # Longer delay for retry files
    
    def scan_and_process(self):
        """Scan for new PDF files and process them."""
        try:
            # Process retry files first
            self.process_retry_files()
            
            # Get all PDF files in the files folder
            pdf_files = list(self.files_folder.glob("*.pdf"))
            
            # Filter out already processed files
            new_files = [f for f in pdf_files if str(f) not in self.processed_files]
            
            if new_files:
                logger.info(f"Found {len(new_files)} new PDF files to process")
                self.empty_scan_count = 0  # Reset counter when files are found
                
                for pdf_file in new_files:
                    if self.should_stop:
                        break
                    success, message = self.process_file(pdf_file)
                    self.processed_files.add(str(pdf_file))
                    
                    # Save state after each file
                    self._save_processed_state()
                    
                    # Small delay between processing files to avoid API rate limits
                    time.sleep(2)
                    
                # Log statistics
                logger.info(f"Session stats - Processed: {self.stats['processed']}, "
                           f"Success: {self.stats['success']}, Failed: {self.stats['failed']}, "
                           f"Retried: {self.stats['retried']}")
            else:
                self.empty_scan_count += 1
                logger.debug(f"No new files to process (empty scan #{self.empty_scan_count})")
                
                # Show waiting message after a few empty scans
                if self.empty_scan_count == 3:
                    logger.info("No files found in 'files' folder - waiting for new files...")
                
                # Stop processing after MAX_EMPTY_SCANS with no files
                if self.empty_scan_count >= self.MAX_EMPTY_SCANS:
                    logger.warning(f"Processing stopped - no files found in 'files' folder after {self.MAX_EMPTY_SCANS} scans. Add files to resume.")
                    self.should_stop = True
                    return
                
        except Exception as e:
            logger.error(f"Error during scan and process: {e}")
    
    def generate_daily_report(self):
        """Generate daily processing report."""
        reports_folder = Path("reports")
        reports_folder.mkdir(exist_ok=True)
        
        today = datetime.now().date()
        report = {
            'date': today.isoformat(),
            'processed_files': len(self.processed_files),
            'success_files': len(list(self.success_folder.glob('*.pdf'))),
            'failed_files': len(list(self.fail_folder.glob('*.pdf'))),
            'retry_files': len(list(self.retry_folder.glob('*.pdf'))),
            'phone_numbers_loaded': len(self.phone_numbers),
            'session_stats': self.stats,
            'generated_at': datetime.now().isoformat()
        }
        
        report_file = reports_folder / f"daily_report_{today}.json"
        with open(report_file, 'w') as f:
            json.dump(report, f, indent=2)
        
        logger.info(f"Daily report generated: {report_file}")
        return report
    
    def run_continuous(self, scan_interval: int = 30):
        """
        Run the processor continuously, scanning for new files at regular intervals.
        Stops processing when no files are found for an extended period.
        
        Args:
            scan_interval: Seconds between scans
        """
        logger.info(f"Starting continuous processing (scanning every {scan_interval} seconds)")
        logger.info("Processing will stop automatically when no files are found for an extended period")
        logger.info("Press Ctrl+C to stop manually")
        
        try:
            while not self.should_stop:
                self.scan_and_process()
                
                # If we should stop due to no files, break the loop
                if self.should_stop:
                    break
                
                # Generate daily report every hour
                if datetime.now().minute == 0:
                    self.generate_daily_report()
                
                # Sleep for scan interval, but check for stop every second
                for _ in range(scan_interval):
                    if self.should_stop:
                        break
                    time.sleep(1)
            
            # Final message when stopping
            if self.should_stop:
                logger.info("Processing has been stopped")
                
        except KeyboardInterrupt:
            logger.info("Stopping continuous processing (manual interrupt)")
            self.should_stop = True
            self._save_processed_state()
            self.generate_daily_report()
        except Exception as e:
            logger.error(f"Unexpected error: {e}")
            self._save_processed_state()


def main():
    """Main function to run the PDF processor."""
    # Configuration
    config = {
        "files_folder": "files",
        "success_folder": "success", 
        "fail_folder": "fail",
        "retry_folder": "retry",
        "excel_file": "phone_numbers.xlsx"
    }
    
    # Create processor
    processor = PDFProcessor(**config)
    
    # Run continuously (scan every 30 seconds)
    processor.run_continuous(scan_interval=30)


if __name__ == "__main__":
    main()