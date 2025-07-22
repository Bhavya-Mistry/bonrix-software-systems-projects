import os
import io
from typing import Dict, Any, List, Optional
from PIL import Image
import pytesseract
import pdf2image
import tempfile

# Configure pytesseract path (for Windows)
# In a production environment, you would install Tesseract and set the path in environment variables
pytesseract.pytesseract.tesseract_cmd = os.getenv("TESSERACT_PATH", r"C:\Program Files\Tesseract-OCR\tesseract.exe")

def extract_text_from_image(file_content: bytes, filename: str) -> str:
    """
    Extract text from an image or PDF file using OCR.
    
    Args:
        file_content: File content as bytes
        filename: Original filename with extension
        
    Returns:
        Extracted text
    """
    # Check if the file is a PDF
    if filename.lower().endswith('.pdf'):
        return extract_text_from_pdf(file_content)
    else:
        return extract_text_from_image_file(file_content)

def extract_text_from_image_file(image_content: bytes) -> str:
    """
    Extract text from an image file using OCR.
    
    Args:
        image_content: Image content as bytes
        
    Returns:
        Extracted text
    """
    try:
        # Load the image
        image = Image.open(io.BytesIO(image_content))
        
        # Convert to RGB if needed (some images might be in RGBA or other formats)
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Extract text using pytesseract
        text = pytesseract.image_to_string(image)
        
        return text
    except Exception as e:
        print(f"Error extracting text from image: {str(e)}")
        return ""

def extract_text_from_pdf(pdf_content: bytes) -> str:
    """
    Extract text from a PDF file using OCR.
    
    Args:
        pdf_content: PDF content as bytes
        
    Returns:
        Extracted text
    """
    try:
        # Create a temporary file to save the PDF
        with tempfile.NamedTemporaryFile(suffix='.pdf', delete=False) as temp_pdf:
            temp_pdf.write(pdf_content)
            temp_pdf_path = temp_pdf.name
        
        # Convert PDF to images
        images = pdf2image.convert_from_path(temp_pdf_path)
        
        # Extract text from each image
        extracted_text = ""
        for image in images:
            # Convert to RGB if needed
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            # Extract text using pytesseract
            page_text = pytesseract.image_to_string(image)
            extracted_text += page_text + "\n\n"
        
        # Clean up the temporary file
        os.unlink(temp_pdf_path)
        
        return extracted_text
    except Exception as e:
        print(f"Error extracting text from PDF: {str(e)}")
        return ""

# Mock implementation for testing without actual Tesseract installation
def mock_extract_text_from_image(file_content: bytes, filename: str) -> str:
    """
    Mock function to simulate text extraction from an image or PDF.
    
    Args:
        file_content: File content as bytes
        filename: Original filename with extension
        
    Returns:
        Simulated extracted text
    """
    # Simulate an invoice with common fields
    return """
    INVOICE
    
    GSTIN: 22AAAAA0000A1Z5
    Invoice No: INV-2023-0042
    Date: 26/05/2023
    
    Vendor: Windsurf Technologies Pvt Ltd
    Address: 123 Tech Park, Silicon Valley
    
    Bill To:
    Customer Name: John Doe
    Customer Address: 456 Business Center, New York
    
    Item Description           Quantity    Rate    Amount
    -----------------------------------------------------
    AI Processing Credits      1000        0.10    100.00
    Premium Support Package    1           50.00    50.00
    -----------------------------------------------------
    Subtotal                                      150.00
    Tax (18%)                                      27.00
    -----------------------------------------------------
    Total Amount                                  177.00
    
    Payment Terms: Net 30
    Due Date: 25/06/2023
    
    Thank you for your business!
    """

# Use the real implementation for actual OCR
extract_text_from_image = extract_text_from_image
