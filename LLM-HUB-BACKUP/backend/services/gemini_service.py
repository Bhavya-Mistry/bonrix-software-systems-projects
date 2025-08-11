import os
import re
from typing import Dict, Any, List
from google.generativeai import GenerativeModel, configure
from dotenv import load_dotenv

load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

configure(api_key=GEMINI_API_KEY)

class GeminiService:
    def analyze_image(self, image_content: bytes) -> Dict[str, Any]:
        """
        Analyze an image using Gemini's multimodal API. If the image is an invoice, extract invoice fields. Otherwise, perform object detection (people, faces, groups, objects, background, etc.).
        """
        import json
        from PIL import Image
        import io
        import re
        image = Image.open(io.BytesIO(image_content)).convert("RGB")
        # Heuristic: if the image is likely an invoice (could be improved by passing a flag or filename)
        # For now, if the image is mostly white and portrait, treat as invoice. Otherwise, treat as general photo.
        width, height = image.size
        pixels = image.getdata()
        avg_brightness = sum([sum(px)/3 for px in pixels]) / (width*height)
        is_invoice = (height > width) and (avg_brightness > 180)
        if is_invoice:
            prompt = (
                "You are an expert at extracting structured information from invoices. "
                "Extract the following fields as accurately as possible from the invoice image below.\n\n"
                "Fields to extract (return as JSON):\n"
                "gstin: The GSTIN number (15 characters, may have letters and numbers).\n"
                "invoice_no: The invoice or bill number.\n"
                "date: The date of the invoice (format: DD/MM/YYYY or similar).\n"
                "amount: The total invoice amount (in INR, may be written as 'TOTAL', 'Amount', or 'Total Amt').\n"
                "vendor: The vendor or shop name (usually at the top of the bill).\n\n"
                "If a field is missing, use an empty string.\n"
                "Example output:\n"
                '{"gstin": "22AAACT2727F1ZK", "invoice_no": "5040254304170488", "date": "18/07/2023", "amount": "10046.00", "vendor": "CROMA"}'
            )
            response = self.model.generate_content([prompt, image])
            text = response.text
            try:
                fields = json.loads(text)
            except Exception:
                match = re.search(r'\{.*\}', text, re.DOTALL)
                if match:
                    try:
                        fields = json.loads(match.group(0))
                    except Exception:
                        fields = {}
                else:
                    fields = {}
            for k in ["gstin", "invoice_no", "date", "amount", "vendor"]:
                if k not in fields:
                    fields[k] = ""
            return {
                "fields": fields,
                "tokens_used": len(text) // 4
            }
        # Otherwise, treat as object detection
        prompt = (
            "You are an expert at visual object detection. "
            "Detect and list all visible people, faces, groups, and objects in the image. "
            "For each detected entity, provide the following as a JSON list: "
            "label (e.g. 'person', 'group of people', 'tree', 'mountain', 'face'), "
            "count (number of instances), and a short description. "
            "If possible, include a bounding box or location (optional). "
            "After the list, ALWAYS provide a concise summary of what is happening in the image (1-2 sentences), starting with 'Summary:'. The summary must be present and should describe the overall scene and context. "
            "Example output:\n"
            '[{"label": "person", "count": 8, "description": "A group of young men posing for a photo outdoors."}, '
            '{"label": "mountain", "count": 3, "description": "Green hills in the background."}, '
            '{"label": "tree", "count": 10, "description": "Trees and foliage in the foreground."}]\nSummary: A group of people are posing outdoors in front of green hills and trees.'
        )
        response = self.model.generate_content([prompt, image])
        text = response.text
        objects = []
        summary = ""
        # Attempt to extract JSON list and summary
        match = re.search(r'(\[.*\])', text, re.DOTALL)
        if match:
            try:
                objects = json.loads(match.group(1))
            except Exception:
                objects = []
            # Look for summary after the list
            summary_match = re.search(r'Summary:(.*)', text, re.DOTALL | re.IGNORECASE)
            if summary_match:
                summary = summary_match.group(1).strip().replace('\n', ' ').replace('\r', ' ')
        else:
            # Fallback: try to parse as JSON only
            try:
                objects = json.loads(text)
            except Exception:
                objects = []
        # Fallback summary if model did not provide one
        if not summary:
            if objects:
                summary = "This image contains: " + ', '.join(f"{obj.get('label', 'object')}: {obj.get('count', 1)}" for obj in objects) + '.'
            else:
                summary = "No summary or objects could be detected."
        # Build counts dictionary
        counts = {}
        for obj in objects:
            label = obj.get("label", "object")
            count = obj.get("count", 1)
            if label in counts:
                counts[label] += count
            else:
                counts[label] = count
        return {
            "objects": objects,
            "counts": counts,
            "summary": summary,
            "tokens_used": len(text) // 4
        }

    def analyze_resume(self, resume_content: bytes, job_description: str) -> Dict[str, Any]:
        resume_text = resume_content.decode('utf-8', errors='ignore')
        messages = [
            {"role": "system", "content": "You are an expert HR recruiter with deep knowledge of various job roles and industries. Your task is to analyze a candidate's resume against a specific job profile and provide a detailed assessment of their fit for the role. Be thorough in your analysis, considering both technical skills and soft skills relevant to the position."},
            {"role": "user", "content": f"Job Profile Description:\n{job_description}\n\nCandidate Resume:\n{resume_text}\n\nProvide a comprehensive analysis with the following sections:\n\n1) Fit Score (0-100): Provide a numerical score indicating how well the candidate matches the job requirements.\n\n2) Strengths (bullet points): List the candidate's key strengths and qualifications that make them suitable for this role.\n\n3) Red Flags (bullet points): Identify any gaps, missing skills, or concerns in the candidate's profile relative to the job requirements.\n\n4) Final Verdict: Provide a concise summary of whether the candidate should be considered for the position and any recommendations for next steps (e.g., technical assessment, behavioral interview)."}
        ]
        result = self._execute_completion(messages)
        response_text = result["response"]
        try:
            fit_score_line = [line for line in response_text.split('\n') if "Fit Score" in line][0]
            score_text = fit_score_line.split(':')[1].strip()
            if '/' in score_text:
                fit_score = float(score_text.split('/')[0])
            else:
                fit_score = float(score_text)
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

    def execute_prompt(self, prompt: str) -> Dict[str, Any]:
        messages = [
            {"role": "user", "content": prompt}
        ]
        return self._execute_completion(messages)

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

    import re
    def parse_invoice(self, extracted_text: str) -> Dict[str, Any]:
        import json
        prompt = (
            "You are an expert at extracting structured information from invoices, even when the text is noisy or comes from OCR.\n"
            "Extract the following fields as accurately as possible from the invoice text below.\n\n"
            "Fields to extract (return as JSON):\n"
            "gstin: The GSTIN number (15 characters, may have letters and numbers).\n"
            "invoice_no: The invoice or bill number.\n"
            "date: The date of the invoice (format: DD/MM/YYYY or similar).\n"
            "amount: The total invoice amount (in INR, may be written as 'TOTAL', 'Amount', or 'Total Amt').\n"
            "vendor: The vendor or shop name (usually at the top of the bill).\n\n"
            "If a field is missing, use an empty string.\n"
            "Example output:\n"
            "{\"gstin\": \"22AAACT2727F1ZK\", \"invoice_no\": \"5040254304170488\", \"date\": \"18/07/2023\", \"amount\": \"10046.00\", \"vendor\": \"CROMA\"}"
            f"\n\nInvoice Text:\n{extracted_text}\n\nOutput only the JSON object."
        )
        messages = [
            {"role": "system", "content": "You are an expert at extracting structured information from invoices, even when the text is noisy or comes from OCR."},
            {"role": "user", "content": prompt}
        ]
        result = self._execute_completion(messages)
        response = result["response"]
        try:
            fields = json.loads(response)
        except Exception as e:
            fields = {}
            gstin = re.search(r"GSTIN\s*[:\-]?\s*([A-Z0-9]{15})", extracted_text, re.IGNORECASE)
            invoice_no = re.search(r"(?:Bill No\.?|Invoice No\.?|Order Number|Order ID)\s*[:\-]?\s*([A-Za-z0-9\/-]+)", extracted_text, re.IGNORECASE)
            date = re.search(r"(?:Date|Dated)\s*[:\-]?\s*([0-9]{2}/[0-9]{2}/[0-9]{4})", extracted_text)
            amount = re.search(r"TOTAL\s*[:\-]?\s*INR\s*([0-9,.]+)", extracted_text, re.IGNORECASE)
            if not amount:
                amount = re.search(r"Total Amt\.?\s*[:\-]?\s*([0-9,.]+)", extracted_text, re.IGNORECASE)
            vendor = re.search(r"^(.*?)(?:\n|$)", extracted_text.strip())
            fields["gstin"] = gstin.group(1) if gstin else ""
            fields["invoice_no"] = invoice_no.group(1) if invoice_no else ""
            fields["date"] = date.group(1) if date else ""
            fields["amount"] = amount.group(1) if amount else ""
            fields["vendor"] = vendor.group(1).strip() if vendor else ""
            # Attach debug info
            fields["_ocr_text"] = extracted_text[:500]
            fields["_llm_response"] = response[:500]
        # Merge LLM fields if present in _llm_response
        if "_llm_response" in fields and fields["_llm_response"]:
            import json as _json
            import re as _re
            match = _re.search(r"\{.*\}", fields["_llm_response"], _re.DOTALL)
            if match:
                try:
                    llm_fields = _json.loads(match.group(0))
                    for k, v in llm_fields.items():
                        if k in fields and v:
                            fields[k] = v
                except Exception:
                    pass
        for k in ["gstin", "invoice_no", "date", "amount", "vendor"]:
            if k not in fields:
                fields[k] = ""
        return {
            "fields": fields,
            "tokens_used": result["tokens_used"]
        }

    def summarize_text(self, text: str) -> Dict[str, Any]:
        messages = [
            {"role": "system", "content": "You are an expert at summarizing text. Provide concise summaries that capture the main points."},
            {"role": "user", "content": f"Summarize the following text in a concise way, highlighting the key points:\n\n{text}"}
        ]
        result = self._execute_completion(messages)
        key_points = [point.strip().strip('- ') for point in result["response"].split('\n') if point.strip().startswith('-')]
        if not key_points:
            key_points = [s.strip() for s in result["response"].split('. ') if len(s.strip()) > 20][:5]
        return {
            "summary": result["response"],
            "key_points": key_points,
            "tokens_used": result["tokens_used"]
        }

    def analyze_sentiment(self, reviews: str) -> Dict[str, Any]:
        messages = [
            {"role": "system", "content": "You are an expert at sentiment analysis. Analyze the sentiment of the provided reviews."},
            {"role": "user", "content": f"Analyze the sentiment of the following reviews. Categorize each as positive, neutral, or negative, and provide an overall sentiment analysis with percentages.\n\nReviews:\n{reviews}"}
        ]
        result = self._execute_completion(messages)
        reviews_list = reviews.split('\n')
        positive_percentage = 0
        neutral_percentage = 0
        negative_percentage = 0
        try:
            for line in result["response"].split('\n'):
                if "positive" in line.lower() and "%" in line:
                    positive_percentage = int(line.split('%')[0].split()[-1])
                elif "neutral" in line.lower() and "%" in line:
                    neutral_percentage = int(line.split('%')[0].split()[-1])
                elif "negative" in line.lower() and "%" in line:
                    negative_percentage = int(line.split('%')[0].split()[-1])
        except:
            total_reviews = len(reviews_list)
            positive_percentage = 33
            neutral_percentage = 33
            negative_percentage = 34
        if positive_percentage > negative_percentage and positive_percentage > neutral_percentage:
            overall_sentiment = "Positive"
        elif negative_percentage > positive_percentage and negative_percentage > neutral_percentage:
            overall_sentiment = "Negative"
        else:
            overall_sentiment = "Neutral"
        return {
            "overall_sentiment": overall_sentiment,
            "positive_percentage": positive_percentage,
            "neutral_percentage": neutral_percentage,
            "negative_percentage": negative_percentage,
            "reviews_analyzed": reviews_list,
            "tokens_used": result["tokens_used"]
        }

    def analyze_resume(self, resume_content: bytes, job_description: str) -> Dict[str, Any]:
        resume_text = resume_content.decode('utf-8', errors='ignore')
        messages = [
            {"role": "system", "content": "You are an expert HR recruiter with deep knowledge of various job roles and industries. Your task is to analyze a candidate's resume against a specific job profile and provide a detailed assessment of their fit for the role. Be thorough in your analysis, considering both technical skills and soft skills relevant to the position."},
            {"role": "user", "content": f"Job Profile Description:\n{job_description}\n\nCandidate Resume:\n{resume_text}\n\nProvide a comprehensive analysis with the following sections:\n\n1) Fit Score (0-100): Provide a numerical score indicating how well the candidate matches the job requirements.\n\n2) Strengths (bullet points): List the candidate's key strengths and qualifications that make them suitable for this role.\n\n3) Red Flags (bullet points): Identify any gaps, missing skills, or concerns in the candidate's profile relative to the job requirements.\n\n4) Final Verdict: Provide a concise summary of whether the candidate should be considered for the position and any recommendations for next steps (e.g., technical assessment, behavioral interview)."}
        ]
        result = self._execute_completion(messages)
        response_text = result["response"]
        try:
            fit_score_line = [line for line in response_text.split('\n') if "Fit Score" in line][0]
            score_text = fit_score_line.split(':')[1].strip()
            if '/' in score_text:
                fit_score = float(score_text.split('/')[0])
            else:
                fit_score = float(score_text)
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

    def __init__(self, model_name="gemini-2.5-pro"):
        self.model_name = model_name
        self.model = GenerativeModel(model_name)

    def _execute_completion(self, messages: List[Dict[str, str]]) -> Dict[str, Any]:
        # Gemini expects a single string prompt
        prompt = "\n".join([msg["content"] for msg in messages])
        try:
            response = self.model.generate_content(prompt)
            return {
                "response": response.text,
                "tokens_used": len(prompt) // 4
            }
        except Exception as e:
            return {
                "response": f"Error: {str(e)}",
                "tokens_used": 0
            }

    def generate_image_caption(self, detection_result: Dict[str, Any]) -> Dict[str, Any]:
        objects = detection_result.get("objects", [])
        counts = detection_result.get("counts", {})
        counts_text = "\n".join([f"- {obj}: {count}" for obj, count in counts.items()])
        prompt = (
            "You are an expert at describing images based on object detection results. "
            "The following objects were detected in an image:\n"
            f"{counts_text}\n"
            "Generate a concise, natural-sounding caption that describes what is in the image."
        )
        result = self._execute_completion([
            {"role": "system", "content": "You are an expert at describing images based on object detection results."},
            {"role": "user", "content": prompt}
        ])
        return {
            "caption": result["response"],
            "tokens_used": result["tokens_used"]
        }

    def parse_invoice(self, extracted_text: str) -> Dict[str, Any]:
        messages = [
            {"role": "system", "content": "You are an expert at extracting structured information from invoices."},
            {"role": "user", "content": f"Extract the following fields from this invoice text:\n- GSTIN\n- Invoice Number\n- Date\n- Amount\n- Vendor Name\n- Any other relevant fields\n\nInvoice Text:\n{extracted_text}\n\nProvide the output in JSON format."}
        ]
        result = self._execute_completion(messages)
        try:
            fields = json.loads(result["response"])
        except:
            fields = {
                "gstin": "",
                "invoice_no": "",
                "date": "",
                "amount": "",
                "vendor": ""
            }
            for line in result["response"].split('\n'):
                if ':' in line:
                    key, value = line.split(':', 1)
                    key = key.strip().lower().replace(' ', '_')
                    value = value.strip()
                    fields[key] = value
        return {
            "fields": fields,
            "tokens_used": result["tokens_used"]
        }

    def summarize_text(self, text: str) -> Dict[str, Any]:
        messages = [
            {"role": "system", "content": "You are an expert at summarizing text. Provide concise summaries that capture the main points."},
            {"role": "user", "content": f"Summarize the following text in a concise way, highlighting the key points:\n\n{text}"}
        ]
        result = self._execute_completion(messages)
        key_points = [point.strip().strip('- ') for point in result["response"].split('\n') if point.strip().startswith('-')]
        if not key_points:
            key_points = [s.strip() for s in result["response"].split('. ') if len(s.strip()) > 20][:5]
        return {
            "summary": result["response"],
            "key_points": key_points,
            "tokens_used": result["tokens_used"]
        }

    def analyze_sentiment(self, reviews: str) -> Dict[str, Any]:
        messages = [
            {"role": "system", "content": "You are an expert at sentiment analysis. Analyze the sentiment of the provided reviews."},
            {"role": "user", "content": f"Analyze the sentiment of the following reviews. Categorize each as positive, neutral, or negative, and provide an overall sentiment analysis with percentages.\n\nReviews:\n{reviews}"}
        ]
        result = self._execute_completion(messages)
        reviews_list = reviews.split('\n')
        positive_percentage = 0
        neutral_percentage = 0
        negative_percentage = 0
        try:
            for line in result["response"].split('\n'):
                if "positive" in line.lower():
                    positive_percentage = int(''.join(filter(str.isdigit, line)))
                elif "neutral" in line.lower():
                    neutral_percentage = int(''.join(filter(str.isdigit, line)))
                elif "negative" in line.lower():
                    negative_percentage = int(''.join(filter(str.isdigit, line)))
        except:
            pass
        if positive_percentage > neutral_percentage and positive_percentage > negative_percentage:
            overall_sentiment = "Positive"
        elif negative_percentage > positive_percentage and negative_percentage > neutral_percentage:
            overall_sentiment = "Negative"
        else:
            overall_sentiment = "Neutral"
        return {
            "overall_sentiment": overall_sentiment,
            "positive_percentage": positive_percentage,
            "neutral_percentage": neutral_percentage,
            "negative_percentage": negative_percentage,
            "reviews_analyzed": reviews_list,
            "tokens_used": result["tokens_used"]
        }

    def execute_prompt(self, prompt: str) -> Dict[str, Any]:
        messages = [
            {"role": "user", "content": prompt}
        ]
        return self._execute_completion(messages)
