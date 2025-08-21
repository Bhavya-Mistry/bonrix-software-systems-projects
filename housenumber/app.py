import os
import sys
import time
import shutil
import logging
import re
import requests
import json
import threading
import webbrowser
from pathlib import Path
from datetime import datetime
from typing import Optional, Dict, Tuple, List
from urllib.parse import quote
import pandas as pd
import pdfplumber
from functools import wraps
from flask import Flask, render_template, request, jsonify, send_file
from werkzeug.utils import secure_filename

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key-here'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Global variables
processor = None
processing_thread = None
is_processing = False
status_messages = []  # Store status messages for polling

def get_exe_dir():
    """Get the directory where the exe is located"""
    if getattr(sys, 'frozen', False):
        # Running as exe
        return os.path.dirname(sys.executable)
    else:
        # Running as script
        return os.path.dirname(os.path.abspath(__file__))

# Set working directory to exe location
os.chdir(get_exe_dir())

# Create required directories
def create_required_dirs():
    """Create required directories in the exe location"""
    dirs = ['uploads', 'files', 'success', 'fail', 'templates']
    for dir_name in dirs:
        os.makedirs(dir_name, exist_ok=True)
        print(f"Created/verified directory: {os.path.abspath(dir_name)}")

create_required_dirs()

app.config['UPLOAD_FOLDER'] = os.path.abspath('uploads')

# Configure logging without emojis for Windows compatibility
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('pdf_processor.log', encoding='utf-8'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

def add_status_message(message_type: str, message: str, data: dict = None):
    """Add a status message to the global list."""
    global status_messages
    
    # Remove emojis for console logging compatibility
    clean_message = message
    emoji_replacements = {
        '🚀': '[START]',
        '📄': '[FILES]',
        '✅': '[SUCCESS]',
        '⏹️': '[STOP]',
        '📁': '[FOLDER]',
        '⏳': '[WAIT]',
        '🛑': '[AUTO-STOP]',
        '⏰': '[TIMER]'
    }
    
    for emoji, replacement in emoji_replacements.items():
        clean_message = clean_message.replace(emoji, replacement)
    
    status_messages.append({
        'type': message_type,
        'message': message,  # Keep original message with emojis for web UI
        'data': data,
        'timestamp': datetime.now().isoformat()
    })
    
    # Keep only last 50 messages
    if len(status_messages) > 50:
        status_messages = status_messages[-50:]
    
    # Log clean message without emojis
    logger.info(f"STATUS: {message_type} - {clean_message}")

class SimplePDFProcessor:
    def __init__(self, 
                 api_key: str,
                 custom_message: str = None,
                 send_delay: int = 10,
                 excel_file: str = None,
                 files_folder: str = "files",
                 success_folder: str = "success",
                 fail_folder: str = "fail"):
        """
        Initialize the PDF processor with folder paths and configuration.
        """
        self.api_key = api_key
        self.custom_message = custom_message or "Monthly statement for Flat {flat_no} is ready. Please find attached invoice and process payment."
        self.send_delay = send_delay
        self.excel_file = excel_file
        
        # Use absolute paths to avoid issues with exe temp directories
        self.files_folder = Path(os.path.abspath(files_folder))
        self.success_folder = Path(os.path.abspath(success_folder))
        self.fail_folder = Path(os.path.abspath(fail_folder))
        
        # Processing control
        self.should_stop = False
        
        # Auto-stop functionality
        self.empty_scan_count = 0
        self.last_file_processed_time = time.time()
        self.MAX_EMPTY_SCANS = 3
        self.AUTO_STOP_TIME = 120
        
        # Flat number patterns
        self.flat_patterns = [
            r"Flat\s*[Nn]o\.?\s*:?\s*([A-Z]?\d{2,4}[A-Z]?)",
            r"Flat\s*:?\s*([A-Z]?\d{2,4}[A-Z]?)",
            r"Unit\s*[Nn]o\.?\s*:?\s*([A-Z]?\d{2,4}[A-Z]?)",
            r"Unit\s*:?\s*([A-Z]?\d{2,4}[A-Z]?)",
            r"Apartment\s*[Nn]o\.?\s*:?\s*([A-Z]?\d{2,4}[A-Z]?)",
            r"Apartment\s*:?\s*([A-Z]?\d{2,4}[A-Z]?)",
            r"Room\s*[Nn]o\.?\s*:?\s*([A-Z]?\d{2,4}[A-Z]?)",
            r"Room\s*:?\s*([A-Z]?\d{2,4}[A-Z]?)",
            r"(?:Flat|Unit|Apt|Room)[\s:]*([A-Z]?\d{2,4}[A-Z]?)",
        ]
        
        # API endpoints
        self.upload_url = 'http://bot.bonrix.in/wapp/upload/mediafile'
        self.send_api_base_url = 'http://bot.bonrix.in/wapp/api/send'
        
        # Create folders and load data
        self._create_folders()
        self.phone_numbers = {}
        if self.excel_file:
            self.phone_numbers = self._load_phone_numbers()
        
        # Statistics
        self.stats = {
            'processed': 0,
            'success': 0,
            'failed': 0
        }
        
        # File status tracking
        self.file_status = {}
    
    def _create_folders(self):
        """Create required folders if they don't exist."""
        for folder in [self.files_folder, self.success_folder, self.fail_folder]:
            folder.mkdir(exist_ok=True)
            logger.info(f"Ensured folder exists: {folder}")
    
    def _load_phone_numbers(self) -> Dict[str, str]:
        """Load phone numbers from Excel file."""
        try:
            if not self.excel_file or not os.path.exists(self.excel_file):
                add_status_message('error', f'Excel file not found: {self.excel_file}')
                return {}
                
            df = pd.read_excel(self.excel_file)
            df.columns = df.columns.str.strip().str.lower()
            
            flat_col = None
            phone_col = None
            
            for col in df.columns:
                if 'flat' in col:
                    flat_col = col
                elif 'phone' in col:
                    phone_col = col
            
            if not flat_col or not phone_col:
                add_status_message('error', 'Could not find Flat No and Phone Number columns in Excel')
                return {}
            
            phone_dict = {}
            for _, row in df.iterrows():
                flat_no = str(row[flat_col]).strip()
                if '.' in flat_no and flat_no.endswith('.0'):
                    flat_no = str(int(float(flat_no)))
                
                phone = str(row[phone_col]).strip()
                if phone.startswith('+'):
                    phone = phone[1:]
                
                phone_dict[flat_no] = phone
            
            add_status_message('success', f'Loaded {len(phone_dict)} phone numbers from Excel')
            return phone_dict
            
        except Exception as e:
            add_status_message('error', f'Error loading Excel file: {e}')
            return {}
    
    def _normalize_flat_number(self, flat_no: str) -> str:
        """Normalize flat number."""
        if not flat_no:
            return flat_no
        normalized = flat_no.lstrip('0') or '0'
        normalized = normalized.replace(' ', '').replace('-', '')
        return normalized
    
    def _find_phone_number(self, flat_no: str) -> Optional[str]:
        """Find phone number with fuzzy matching."""
        if flat_no in self.phone_numbers:
            return self.phone_numbers[flat_no]
        
        normalized_flat = self._normalize_flat_number(flat_no)
        if normalized_flat in self.phone_numbers:
            return self.phone_numbers[normalized_flat]
        
        for key, phone in self.phone_numbers.items():
            if self._normalize_flat_number(key) == normalized_flat:
                return phone
        
        return None
    
    def _extract_flat_no_from_pdf(self, pdf_path: Path) -> Optional[str]:
        """Extract flat number from PDF."""
        try:
            with pdfplumber.open(pdf_path) as pdf:
                full_text = ""
                for page in pdf.pages:
                    text = page.extract_text()
                    if text:
                        full_text += text + "\n"
                
                if not full_text:
                    return None
                
                for pattern in self.flat_patterns:
                    match = re.search(pattern, full_text, re.IGNORECASE)
                    if match:
                        return match.group(1).strip()
                
                lines = full_text.split('\n')
                for line in lines:
                    if any(word in line.lower() for word in ['flat', 'unit', 'apartment', 'room']):
                        numbers = re.findall(r'\b([A-Z]?\d{2,4}[A-Z]?)\b', line)
                        if numbers:
                            return numbers[0]
            return None
            
        except Exception as e:
            logger.error(f"Error reading PDF {pdf_path.name}: {e}")
            return None
    
    def send_whatsapp_pdf(self, phone_number: str, pdf_path: Path, flat_no: str) -> bool:
        """Send PDF via WhatsApp."""
        try:
            file_size_kb = round(pdf_path.stat().st_size / 1024)
            logger.info(f"Uploading {pdf_path.name} for flat {flat_no} (Size: {file_size_kb} KB)")
            
            # Upload file
            with open(pdf_path, 'rb') as f:
                files = {'file': (pdf_path.name, f, 'application/pdf')}
                form_data = {'apikey': self.api_key}
                
                upload_response = requests.post(self.upload_url, data=form_data, files=files, timeout=30)
                upload_response.raise_for_status()
            
            uploaded_file_url = upload_response.text.strip()
            
            # Send message
            encoded_file_url = quote(uploaded_file_url)
            message = self.custom_message.replace('{flat_no}', str(flat_no))
            encoded_message = quote(message)
            
            send_api_url = (f"{self.send_api_base_url}?apikey={self.api_key}"
                          f"&mobile={phone_number}&msg={encoded_message}"
                          f"&pdf={encoded_file_url}&cache=false")
            
            api_response = requests.get(send_api_url, timeout=30)
            api_response.raise_for_status()
            
            logger.info(f"Successfully sent {pdf_path.name} to {phone_number}")
            return True
            
        except Exception as e:
            logger.error(f"Error sending {pdf_path.name}: {e}")
            return False
    
    def _move_file(self, source: Path, destination_folder: Path) -> bool:
        """Move file to destination folder."""
        try:
            destination = destination_folder / source.name
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
        """Process a single PDF file."""
        if self.should_stop:
            return False, "Processing stopped by user"
            
        filename = pdf_path.name
        self.stats['processed'] += 1
        
        # Update file status
        self.file_status[filename] = {
            'flat_no': 'Extracting...',
            'phone': '',
            'status': 'Processing',
            'timestamp': datetime.now().isoformat(),
            'message': 'Extracting flat number from PDF'
        }
        
        add_status_message('info', f'Processing {filename}')
        
        try:
            # Extract flat number
            flat_no = self._extract_flat_no_from_pdf(pdf_path)
            if not flat_no:
                self.file_status[filename].update({
                    'status': 'Failed',
                    'message': 'Could not extract flat number'
                })
                add_status_message('error', f'Could not extract flat number from {filename}')
                self._move_file(pdf_path, self.fail_folder)
                self.stats['failed'] += 1
                return False, "Failed to extract flat number"
            
            self.file_status[filename]['flat_no'] = flat_no
            
            # Get phone number
            phone_number = self._find_phone_number(flat_no)
            if not phone_number:
                self.file_status[filename].update({
                    'phone': 'Not found',
                    'status': 'Failed',
                    'message': f'No phone number found for flat {flat_no}'
                })
                add_status_message('error', f'No phone number found for flat {flat_no}')
                self._move_file(pdf_path, self.fail_folder)
                self.stats['failed'] += 1
                return False, f"No phone number for flat {flat_no}"
            
            self.file_status[filename]['phone'] = phone_number
            
            # Send via WhatsApp
            success = self.send_whatsapp_pdf(phone_number, pdf_path, flat_no)
            
            if success:
                self.file_status[filename].update({
                    'status': 'Sent',
                    'message': f'Successfully sent to {phone_number}'
                })
                add_status_message('success', f'Successfully sent {filename} to {phone_number}')
                self._move_file(pdf_path, self.success_folder)
                self.stats['success'] += 1
                return True, f"Sent to {phone_number} for flat {flat_no}"
            else:
                self.file_status[filename].update({
                    'status': 'Failed',
                    'message': 'Failed to send WhatsApp message'
                })
                add_status_message('error', f'Failed to send {filename}')
                self._move_file(pdf_path, self.fail_folder)
                self.stats['failed'] += 1
                return False, "Failed to send WhatsApp message"
                
        except Exception as e:
            self.file_status[filename].update({
                'status': 'Failed',
                'message': f'Unexpected error: {str(e)}'
            })
            add_status_message('error', f'Unexpected error processing {filename}: {str(e)}')
            self._move_file(pdf_path, self.fail_folder)
            self.stats['failed'] += 1
            return False, f"Unexpected error: {str(e)}"
    
    def continuous_scan_and_process(self):
        """Continuously scan and process files."""
        try:
            add_status_message('info', f'🚀 Starting continuous PDF processing (scanning every 10 seconds, delay: {self.send_delay}s between files)...')
            
            while not self.should_stop:
                try:
                    pdf_files = list(self.files_folder.glob("*.pdf"))
                    
                    if pdf_files:
                        self.empty_scan_count = 0
                        self.last_file_processed_time = time.time()
                        
                        add_status_message('info', f'📄 Found {len(pdf_files)} PDF files to process')
                        self.file_status = {}
                        
                        for i, pdf_file in enumerate(pdf_files):
                            if self.should_stop:
                                break
                                
                            success, message = self.process_file(pdf_file)
                            
                            if i < len(pdf_files) - 1 and not self.should_stop:
                                add_status_message('info', f'⏳ Waiting {self.send_delay} seconds before processing next file...')
                                for _ in range(self.send_delay):
                                    if self.should_stop:
                                        break
                                    time.sleep(1)
                        
                        if not self.should_stop:
                            add_status_message('success', f'✅ Batch complete. Processed: {len(pdf_files)} files')
                    else:
                        self.empty_scan_count += 1
                        
                        if self.empty_scan_count >= self.MAX_EMPTY_SCANS:
                            add_status_message('warning', '📁 No files found in "files" folder - waiting for new files...')
                        
                        time_since_last_file = time.time() - self.last_file_processed_time
                        if time_since_last_file >= self.AUTO_STOP_TIME:
                            add_status_message('error', f'🛑 Processing stopped automatically after {self.AUTO_STOP_TIME//60} minutes with no files. Click "Start Processing" to resume.')
                            self.should_stop = True
                            break
                        
                        if self.empty_scan_count >= self.MAX_EMPTY_SCANS:
                            remaining_time = self.AUTO_STOP_TIME - int(time_since_last_file)
                            if remaining_time > 0:
                                add_status_message('warning', f'⏰ Auto-stop in {remaining_time} seconds if no files are found...')
                    
                    for i in range(10):
                        if self.should_stop:
                            break
                        time.sleep(1)
                        
                except Exception as e:
                    add_status_message('error', f'Error during scan: {e}')
                    time.sleep(10)
            
            if self.should_stop:
                add_status_message('warning', '⏹️ Processing has been stopped')
                
        except Exception as e:
            add_status_message('error', f'Error during continuous processing: {e}')

# Flask routes
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/view_file/<filename>')
def view_file(filename):
    """Serve files from success folder for viewing in browser"""
    try:
        success_folder = Path(os.path.abspath('success'))
        file_path = success_folder / filename
        
        print(f"Looking for file at: {file_path}")
        print(f"File exists: {file_path.exists()}")
        
        if file_path.exists() and file_path.is_file():
            return send_file(str(file_path), 
                           mimetype='application/pdf',
                           as_attachment=False,
                           download_name=filename)
        else:
            return jsonify({'error': f'File not found at {file_path}'}), 404
            
    except Exception as e:
        print(f"Error in view_file: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/download_file/<filename>')
def download_file(filename):
    """Serve files from success folder for downloading"""
    try:
        success_folder = Path(os.path.abspath('success'))
        file_path = success_folder / filename
        
        print(f"Looking for download file at: {file_path}")
        print(f"File exists: {file_path.exists()}")
        
        if file_path.exists() and file_path.is_file():
            return send_file(str(file_path), 
                           as_attachment=True,
                           download_name=filename)
        else:
            return jsonify({'error': f'File not found at {file_path}'}), 404
            
    except Exception as e:
        print(f"Error in download_file: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/upload_excel', methods=['POST'])
def upload_excel():
    try:
        if 'excel_file' not in request.files:
            return jsonify({'success': False, 'message': 'No file selected'})
        
        file = request.files['excel_file']
        if file.filename == '':
            return jsonify({'success': False, 'message': 'No file selected'})
        
        if file and file.filename.lower().endswith(('.xlsx', '.xls')):
            filename = secure_filename(file.filename)
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"{timestamp}_{filename}"
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)
            
            try:
                df = pd.read_excel(filepath)
                df.columns = df.columns.str.strip().str.lower()
                
                flat_col = None
                phone_col = None
                
                for col in df.columns:
                    if 'flat' in col:
                        flat_col = col
                    elif 'phone' in col:
                        phone_col = col
                
                if not flat_col or not phone_col:
                    os.remove(filepath)
                    return jsonify({'success': False, 'message': 'Excel file must contain "Flat No" and "Phone Number" columns'})
                
                phone_count = len(df)
                return jsonify({
                    'success': True, 
                    'message': f'Excel file uploaded successfully! Loaded {phone_count} phone numbers.',
                    'filepath': filepath,
                    'phone_count': phone_count
                })
                
            except Exception as e:
                if os.path.exists(filepath):
                    os.remove(filepath)
                return jsonify({'success': False, 'message': f'Error reading Excel file: {str(e)}'})
        else:
            return jsonify({'success': False, 'message': 'Please upload a valid Excel file (.xlsx or .xls)'})
            
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error uploading file: {str(e)}'})

@app.route('/start_processing', methods=['POST'])
def start_processing():
    global processor, processing_thread, is_processing
    
    try:
        data = request.json
        api_key = data.get('api_key', '').strip()
        excel_filepath = data.get('excel_filepath', '').strip()
        custom_message = data.get('custom_message', '').strip()
        send_delay = int(data.get('send_delay', 10))
        
        if not api_key:
            return jsonify({'success': False, 'message': 'API key is required'})
        
        if not excel_filepath:
            return jsonify({'success': False, 'message': 'Please upload an Excel file first'})
        
        if is_processing:
            return jsonify({'success': False, 'message': 'Processing is already running'})
        
        if send_delay < 1 or send_delay > 300:
            return jsonify({'success': False, 'message': 'Send delay must be between 1 and 300 seconds'})
        
        if not custom_message:
            custom_message = "Monthly statement for Flat {flat_no} is ready. Please find attached invoice and process payment."
        
        processor = SimplePDFProcessor(
            api_key=api_key, 
            custom_message=custom_message,
            send_delay=send_delay,
            excel_file=excel_filepath
        )
        
        if not processor.phone_numbers:
            return jsonify({'success': False, 'message': 'Could not load phone numbers from Excel file'})
        
        add_status_message('success', '🚀 Processing initialized successfully! Starting file scanning...')
        
        def continuous_process():
            global is_processing
            is_processing = True
            processor.continuous_scan_and_process()
            is_processing = False
        
        processing_thread = threading.Thread(target=continuous_process)
        processing_thread.daemon = True
        processing_thread.start()
        
        return jsonify({'success': True, 'message': f'Continuous processing started with {send_delay}s delay between files'})
        
    except ValueError as e:
        return jsonify({'success': False, 'message': 'Invalid send delay value'})
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error starting processing: {str(e)}'})

@app.route('/stop_processing', methods=['POST'])
def stop_processing():
    global processor, is_processing
    
    if processor:
        processor.should_stop = True
    
    is_processing = False
    add_status_message('warning', '⏹️ Processing stopped manually')
    return jsonify({'success': True, 'message': 'Processing stopped'})

@app.route('/get_status')
def get_status():
    global processor, is_processing, status_messages
    
    response_data = {
        'is_processing': is_processing,
        'stats': {'processed': 0, 'success': 0, 'failed': 0},
        'file_status': {},
        'phone_numbers_loaded': 0,
        'messages': status_messages[-10:]  # Last 10 messages
    }
    
    if processor:
        response_data.update({
            'stats': processor.stats,
            'file_status': processor.file_status,
            'phone_numbers_loaded': len(processor.phone_numbers)
        })
    
    return jsonify(response_data)

@app.route('/clear_messages', methods=['POST'])
def clear_messages():
    global status_messages
    status_messages = []
    return jsonify({'success': True, 'message': 'Messages cleared'})

def open_browser():
    """Open browser automatically after a short delay"""
    time.sleep(1.5)
    try:
        webbrowser.open('http://127.0.0.1:5000')
        print("Browser opened automatically at http://127.0.0.1:5000")
    except Exception as e:
        print(f"Could not open browser automatically: {e}")
        print("Please open your browser and go to: http://127.0.0.1:5000")

if __name__ == '__main__':
    print("=" * 60)
    print("PDF WhatsApp Processor Starting...")
    print("=" * 60)
    print(f"Working directory: {os.getcwd()}")
    print(f"Files folder: {os.path.abspath('files')}")
    print(f"Success folder: {os.path.abspath('success')}")
    print(f"Upload folder: {os.path.abspath('uploads')}")
    print("=" * 60)
    
    # Start browser opener in background thread
    browser_thread = threading.Thread(target=open_browser)
    browser_thread.daemon = True
    browser_thread.start()
    
    try:
        app.run(debug=False, host='0.0.0.0', port=5000, use_reloader=False)
    except Exception as e:
        print(f"Error starting Flask app: {e}")
        input("Press Enter to exit...")