import os
from typing import Dict, Any, List
from google.generativeai import GenerativeModel, configure
from dotenv import load_dotenv
import re
import json

# Load environment variables from .env file
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

# Configure Gemini API with the API key
configure(api_key=GEMINI_API_KEY)

class GeminiService:
    def __init__(self, model_name="gemini-1.5-flash"):
        self.model_name = model_name
        self.model = GenerativeModel(model_name)

    def _execute_completion(self, messages: List[Dict[str, str]]) -> Dict[str, Any]:
        # Gemini expects a single string prompt
        prompt = "\n".join([msg["content"] for msg in messages])
        try:
            response = self.model.generate_content(prompt)
            return {
                "response": response.text,
                "tokens_used": len(prompt) // 4  # Estimate tokens used based on prompt length
            }
        except Exception as e:
            return {
                "response": f"Error: {str(e)}",
                "tokens_used": 0
            }

    def analyze_resume(self, resume_content: bytes, job_description: str) -> Dict[str, Any]:
        resume_text = resume_content.decode('utf-8', errors='ignore')
        messages = [
            {"role": "system", "content": "You are an expert HR recruiter with deep knowledge of various job roles and industries. "
                                        "Your task is to analyze a candidate's resume against a specific job profile and provide a detailed "
                                        "assessment of their fit for the role. Be thorough in your analysis, considering both technical skills and "
                                        "soft skills relevant to the position."},
            {"role": "user", "content": f"Job Profile Description:\n{job_description}\n\nCandidate Resume:\n{resume_text}\n\nProvide a comprehensive "
                                        "analysis with the following sections:\n\n1) Fit Score (0-100): Provide a numerical score indicating how well the candidate "
                                        "matches the job requirements.\n\n2) Strengths (bullet points): List the candidate's key strengths and qualifications that "
                                        "make them suitable for this role.\n\n3) Red Flags (bullet points): Identify any gaps, missing skills, or concerns in "
                                        "the candidate's profile relative to the job requirements.\n\n4) Final Verdict: Provide a concise summary of whether "
                                        "the candidate should be considered for the position and any recommendations for next steps (e.g., technical assessment, "
                                        "behavioral interview)."}
        ]
        result = self._execute_completion(messages)
        response_text = result["response"]

        # Parse the response into structured fields
        try:
            fit_score_line = [line for line in response_text.split('\n') if "Fit Score" in line][0]
            score_text = fit_score_line.split(':')[1].strip()
            fit_score = float(score_text.split('/')[0]) if '/' in score_text else float(score_text)
        except:
            fit_score = 0
        
        try:
            strengths_section = response_text.split("Strengths")[1].split("Red Flags")[0]
            strengths = [s.strip().strip('- ') for s in strengths_section.strip().split('\n') if s.strip()]
        except:
            strengths = []

        try:
            red_flags_section = response_text.split("Red Flags")[1].split("Final Verdict")[0]
            red_flags = [r.strip().strip('- ') for r in red_flags_section.strip().split('\n') if r.strip()]
        except:
            red_flags = []

        try:
            final_verdict = response_text.split("Final Verdict")[1].strip()
        except:
            final_verdict = "No verdict provided"

        return {
            "summary": response_text,
            "fit_score": fit_score,
            "strengths": strengths,
            "red_flags": red_flags,
            "final_verdict": final_verdict,
            "tokens_used": result["tokens_used"]
        }

    def generate_image_caption(self, detection_result: Dict[str, Any]) -> Dict[str, Any]:
        counts = detection_result.get("counts", {})
        counts_text = "\n".join([f"- {obj}: {count}" for obj, count in counts.items()])
        messages = [
            {"role": "system", "content": "You are an expert at describing images based on object detection results. Be accurate and specific in your descriptions."},
            {"role": "user", "content": f"The following objects were detected in an image:\n{counts_text}\n\nGenerate a concise, natural-sounding caption that describes what is in the image."}
        ]
        result = self._execute_completion(messages)
        return {
            "caption": result["response"],
            "tokens_used": result["tokens_used"]
        }

    def parse_invoice(self, extracted_text: str) -> Dict[str, Any]:
        prompt = (
            "You are an expert at extracting structured information from invoices, even when the text is noisy or comes from OCR.\n"
            "Extract the following fields as accurately as possible from the invoice text below.\n\n"
            "Fields to extract (return as JSON):\n"
            "gstin: The GSTIN number (15 characters, alphanumeric).\n"
            "invoice_no: The invoice or bill number.\n"
            "date: The date of the invoice (format as DD/MM/YYYY if possible).\n"
            "amount: The final total invoice amount.\n"
            "vendor: The vendor, store, or company name (usually at the top).\n\n"
            "If a field is not found, use an empty string for its value.\n"
            "Example output:\n"
            "{\"gstin\": \"22AAACT2727F1ZK\", \"invoice_no\": \"5040254304170488\", \"date\": \"18/07/2023\", \"amount\": \"10046.00\", \"vendor\": \"CROMA\"}"
            f"\n\nInvoice Text:\n{extracted_text}\n\nOutput only the JSON object."
        )
        messages = [
            {"role": "system", "content": "You are an expert at extracting structured information from invoices and always respond in JSON format."},
            {"role": "user", "content": prompt}
        ]
        result = self._execute_completion(messages)
        response_text = result["response"]
        fields = {}

        try:
            fields = json.loads(response_text)
        except (json.JSONDecodeError, TypeError):
            print("JSON parsing failed. Falling back to regex extraction.")
            gstin_match = re.search(r"GSTIN\s*[:\-]?\s*([A-Z0-9]{15})", extracted_text, re.IGNORECASE)
            invoice_no_match = re.search(r"(?:Invoice|Bill|Order)\s*(?:No\.?|Number|ID)\s*[:\-]?\s*([A-Za-z0-9\/-]+)", extracted_text, re.IGNORECASE)
            date_match = re.search(r"Date(?:d)?\s*[:\-]?\s*(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})", extracted_text, re.IGNORECASE)
            amount_match = re.search(r"(?:Total|Amount|Grand Total)\s*(?:Amt\.?)?\s*[:\-]?\s*(?:INR)?\s*([\d,]+\.\d{2})", extracted_text, re.IGNORECASE)
            vendor_match = re.search(r"^(.*?)(?:\n|$)", extracted_text.strip())

            fields["gstin"] = gstin_match.group(1) if gstin_match else ""
            fields["invoice_no"] = invoice_no_match.group(1).strip() if invoice_no_match else ""
            fields["date"] = date_match.group(1) if date_match else ""
            fields["amount"] = amount_match.group(1).replace(",", "") if amount_match else ""
            fields["vendor"] = vendor_match.group(1).strip() if vendor_match else ""

        required_keys = ["gstin", "invoice_no", "date", "amount", "vendor"]
        for key in required_keys:
            if key not in fields or fields[key] is None:
                fields[key] = ""
        return {
            "fields": fields,
            "tokens_used": result.get("tokens_used", 0)
        }

    def summarize_text(self, text: str) -> str:
        # Strict prompt to force plain text
        prompt = (
            "You are an expert summarizer. Provide ONLY a plain text summary and key points. "
            "DO NOT use JSON, code blocks, or any structured format. "
            "DO NOT include any curly braces, brackets, or quotation marks. "
            "Just write the summary as a paragraph, followed by bullet points for key points.\n\n"
            "Summarize the following text in plain English.\n"
            "First, write a concise summary paragraph.\n"
            "Then, list 3-7 key points as bullet points.\n"
            f"\nText:\n{text}"
        )
        messages = [
            {"role": "system", "content": prompt}
        ]
        result = self._execute_completion(messages)
        response = result.get("response", "")

        # Try to parse as JSON if it looks like JSON, but always output plain text
        try:
            if response.strip().startswith("{"):
                data = json.loads(response)
                summary = data.get("summary", "")
                key_points = data.get("key_points", [])
                output = f"Summary:\n{summary}\n\nKey Points:"
                if key_points:
                    output += "\n" + "\n".join([f"- {point}" for point in key_points])
                else:
                    output += "\nNo key points available."
                return output
        except (json.JSONDecodeError, TypeError):
            pass

        # If not JSON, just return the response as is
        return response
