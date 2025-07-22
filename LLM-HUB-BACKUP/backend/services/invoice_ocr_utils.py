import re
from typing import Dict, Optional
from PIL import Image
import pytesseract

# If Tesseract is not in PATH, uncomment and set the correct path below
# pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

def extract_invoice_fields_from_image(image_path: str) -> Dict[str, Optional[str]]:
    """
    Extract GSTIN, Invoice Number, Date, Amount, Vendor from an invoice image using Tesseract OCR.
    Args:
        image_path (str): Path to the invoice image file.
    Returns:
        dict: Extracted fields (may contain None if not found).
    """
    # Step 1: OCR
    text = pytesseract.image_to_string(Image.open(image_path))

    # Step 2: Extract fields using regex and heuristics
    gstin = re.search(r'GSTIN[\/: ]*([0-9A-Z]{15})', text, re.IGNORECASE)
    invoice_no = re.search(r'(Invoice\s*No|Invoice\s*#|Inv\s*No)[\.\:\- ]*([A-Za-z0-9\/\-]+)', text, re.IGNORECASE)
    date = re.search(r'Date[\.\:\- ]*([0-9]{2}[\/\-][0-9]{2}[\/\-][0-9]{2,4})', text, re.IGNORECASE)
    amount = re.search(r'Amount[\.\:\- ]*([\d,]+\.\d{2})', text, re.IGNORECASE)
    # Vendor: Try to extract from the top lines (first 10 lines)
    lines = text.splitlines()
    vendor = None
    for line in lines[:10]:
        if any(word in line.lower() for word in ["vendor", "supplier", "from"]):
            vendor = line.strip()
            break
    if not vendor:
        # fallback: use first non-empty line
        for line in lines:
            if line.strip():
                vendor = line.strip()
                break

    return {
        "GSTIN": gstin.group(1) if gstin else None,
        "Invoice Number": invoice_no.group(2) if invoice_no else None,
        "Date": date.group(1) if date else None,
        "Amount": amount.group(1) if amount else None,
        "Vendor": vendor
    }
