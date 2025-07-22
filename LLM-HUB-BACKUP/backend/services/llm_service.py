import os
from typing import Dict, Any, List
from abc import ABC, abstractmethod
import json
import re
from dotenv import load_dotenv

# Import necessary clients
import openai
from mistralai.client import MistralClient
from mistralai.models.chat_completion import ChatMessage
import requests
from google.generativeai import GenerativeModel, configure

# --- Configuration ---
load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY", "")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
OLLAMA_API_URL = os.getenv("OLLAMA_API_URL", "http://localhost:11434/api/generate")

# Configure Gemini
if GEMINI_API_KEY:
    configure(api_key=GEMINI_API_KEY)

print(f"OpenAI API key loaded: {bool(OPENAI_API_KEY)}")
print(f"Mistral API key loaded: {bool(MISTRAL_API_KEY)}")
print(f"Gemini API key loaded: {bool(GEMINI_API_KEY)}")

from services.invoice_ocr_utils import extract_invoice_fields_from_image

# --- Base LLM Service with Centralized Logic ---

class BaseLLMService(ABC):
    """
    Abstract Base Class for LLM services.
    Implements the core logic for all tasks, relying on subclasses
    to provide the specific API execution method.
    """
    
    @abstractmethod
    def _execute_completion(self, messages: List[Dict[str, str]]) -> Dict[str, Any]:
        """
        Subclasses must implement this method to call their specific LLM API.
        It should return a dictionary with "response" and "tokens_used".
        """
        pass

    def analyze_resume(self, resume_content: bytes, job_description: str) -> Dict[str, Any]:
        resume_text = resume_content.decode('utf-8', errors='ignore')
        prompt = (
            "You are an expert HR analyst. Analyze the candidate's resume against the job profile.\n"
            "Provide a comprehensive analysis by returning a single JSON object with the following keys:\n"
            "- 'fit_score': A numerical score from 0 to 100 indicating the match.\n"
            "- 'strengths': A list of strings detailing the candidate's key strengths.\n"
            "- 'red_flags': A list of strings identifying gaps, missing skills, or concerns.\n"
            "- 'final_verdict': A concise summary and recommendation for next steps.\n\n"
            f"Job Profile Description:\n{job_description}\n\n"
            f"Candidate Resume:\n{resume_text}\n\n"
            "Output only the raw JSON object and nothing else."
        )
        messages = [
            {"role": "system", "content": "You are an expert HR analyst that provides responses in structured JSON format."},
            {"role": "user", "content": prompt}
        ]
        result = self._execute_completion(messages)
        
        try:
            data = json.loads(result["response"])
        except (json.JSONDecodeError, TypeError):
            data = {
                "fit_score": 0, "strengths": [], "red_flags": [],
                "final_verdict": "Error: Failed to parse the model's response.",
                "summary": result["response"] # Keep raw response for debugging
            }
        
        # Ensure all keys are present
        return {
            "fit_score": data.get("fit_score", 0),
            "strengths": data.get("strengths", []),
            "red_flags": data.get("red_flags", []),
            "final_verdict": data.get("final_verdict", "No verdict provided."),
            "tokens_used": result.get("tokens_used", 0)
        }

    def generate_image_caption(self, detection_result: Dict[str, Any]) -> Dict[str, Any]:
        counts = detection_result.get("counts", {})
        counts_text = "\n".join([f"- {obj}: {count}" for obj, count in counts.items()])
        messages = [
            {"role": "system", "content": "You are an expert at describing images based on object detection results."},
            {"role": "user", "content": f"The following objects were detected in an image:\n{counts_text}\n\nGenerate a concise, natural-sounding caption that describes the scene."}
        ]
        result = self._execute_completion(messages)
        return {
            "caption": result["response"],
            "tokens_used": result.get("tokens_used", 0)
        }

    def extract_invoice_from_image(self, image_path: str):
        """
        Extract GSTIN, Invoice Number, Date, Amount, Vendor from an invoice image using Tesseract OCR.
        Args:
            image_path (str): Path to the invoice image file.
        Returns:
            dict: Extracted fields (may contain None if not found).
        """
        return extract_invoice_fields_from_image(image_path)

    def parse_invoice(self, extracted_text: str) -> Dict[str, Any]:
        prompt = (
            "You are an expert at extracting structured information from invoices.\n"
            "Extract the following fields from the invoice text and return a single JSON object:\n"
            "- 'gstin': The GSTIN number (15 characters, alphanumeric).\n"
            "- 'invoice_no': The invoice or bill number.\n"
            "- 'date': The date of the invoice (format as DD/MM/YYYY).\n"
            "- 'amount': The final total invoice amount as a string.\n"
            "- 'vendor': The vendor or company name.\n\n"
            "If a field is not found, use an empty string for its value.\n"
            f"Invoice Text:\n{extracted_text}\n\n"
            "Output only the raw JSON object and nothing else."
        )
        messages = [
            {"role": "system", "content": "You are an expert invoice parser that provides responses in structured JSON format."},
            {"role": "user", "content": prompt}
        ]
        result = self._execute_completion(messages)
        
        try:
            fields = json.loads(result["response"])
        except (json.JSONDecodeError, TypeError):
            print("JSON parsing failed. Falling back to regex.")
            # Your robust regex fallback from before
            gstin_match = re.search(r"GSTIN\s*[:\-]?\s*([A-Z0-9]{15})", extracted_text, re.IGNORECASE)
            invoice_no_match = re.search(r"(?:Invoice|Bill|Order)\s*(?:No\.?|Number|ID)\s*[:\-]?\s*([A-Za-z0-9\/-]+)", extracted_text, re.IGNORECASE)
            date_match = re.search(r"Date(?:d)?\s*[:\-]?\s*(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})", extracted_text, re.IGNORECASE)
            amount_match = re.search(r"(?:Total|Amount|Grand Total)\s*(?:Amt\.?)?\s*[:\-]?\s*(?:INR)?\s*([\d,]+\.\d{2})", extracted_text, re.IGNORECASE)
            vendor_match = re.search(r"^(.*?)(?:\n|$)", extracted_text.strip())
            fields = {
                "gstin": gstin_match.group(1) if gstin_match else "",
                "invoice_no": invoice_no_match.group(1).strip() if invoice_no_match else "",
                "date": date_match.group(1) if date_match else "",
                "amount": amount_match.group(1).replace(",", "") if amount_match else "",
                "vendor": vendor_match.group(1).strip() if vendor_match else ""
            }

        # Final check to ensure all required keys exist
        required_keys = ["gstin", "invoice_no", "date", "amount", "vendor"]
        for key in required_keys:
            if key not in fields or fields[key] is None:
                fields[key] = ""
        
        return {"fields": fields, "tokens_used": result.get("tokens_used", 0)}

    def summarize_text(self, text: str) -> str:
        messages = [
            {"role": "system", "content": "You are an expert at summarizing text. Provide a summary and a list of key points in plain text format."},
            {"role": "user", "content": f"Summarize the following text. Provide the output as a plain text with the summary followed by key points.\n\nText:\n{text}"}
        ]
        result = self._execute_completion(messages)
        
        try:
            data = json.loads(result["response"])
        except (json.JSONDecodeError, TypeError):
            data = {"summary": result["response"], "key_points": []}
        
        summary = data.get("summary", result["response"])
        key_points = data.get("key_points", [])
        
        # Prepare the plain text output
        output = f"Summary:\n{summary}\n\nKey Points:"
        
        if key_points:
            output += "\n" + "\n".join([f"- {point}" for point in key_points])
        else:
            output += "\nNo key points available."
        
        return output

    # def summarize_text(self, text: str) -> Dict[str, Any]:
    #     messages = [
    #         {"role": "system", "content": "You are an expert at summarizing text. Provide a summary and a list of key points in JSON format."},
    #         {"role": "user", "content": f"Summarize the following text. Provide the output as a JSON object with two keys: 'summary' (a string) and 'key_points' (a list of strings).\n\nText:\n{text}"}
    #     ]
    #     result = self._execute_completion(messages)
    #     try:
    #         data = json.loads(result["response"])
    #     except (json.JSONDecodeError, TypeError):
    #         data = {"summary": result["response"], "key_points": []}
            
    #     return {
    #         "summary": data.get("summary", result["response"]),
    #         "key_points": data.get("key_points", []),
    #         "tokens_used": result.get("tokens_used", 0)
    #     }

    def analyze_sentiment(self, reviews: str) -> Dict[str, Any]:
        messages = [
            {"role": "system", "content": "You are a sentiment analysis expert who responds in JSON."},
            {"role": "user", "content": f"Analyze the sentiment of the following reviews. Provide the output as a JSON object with keys: 'overall_sentiment' ('Positive', 'Neutral', or 'Negative'), 'positive_percentage' (0-100), 'neutral_percentage' (0-100), and 'negative_percentage' (0-100).\n\nReviews:\n{reviews}"}
        ]
        result = self._execute_completion(messages)
        try:
            data = json.loads(result["response"])
        except (json.JSONDecodeError, TypeError):
            data = {"overall_sentiment": "Unknown", "positive_percentage": 0, "neutral_percentage": 0, "negative_percentage": 0}

        return {
            "overall_sentiment": data.get("overall_sentiment", "Unknown"),
            "positive_percentage": data.get("positive_percentage", 0),
            "neutral_percentage": data.get("neutral_percentage", 0),
            "negative_percentage": data.get("negative_percentage", 0),
            "tokens_used": result.get("tokens_used", 0)
        }

#     def summarize_text_simple(self, text: str) -> Dict[str, Any]:
#         prompt = f"""Please read the following text and create a comprehensive summary in the following format:

# Summary
# [Write a concise paragraph that captures the main ideas and key points of the text.]

# Key Points:
# - [Bullet point 1: A key point from the text]
# - [Bullet point 2: Another important aspect]
# - [Bullet point 3: A significant detail]
# - [Bullet point 4: Additional important information]
# - [Bullet point 5: Final key point]

# Compression ratio: [Calculate as (1 - (summary_length / original_length)) * 100]% (this is just an example - calculate the actual ratio based on the original text length and your summary length)

# Rules:
# 1. The summary should be concise but comprehensive
# 2. Include 3-7 key points that capture the most important ideas
# 3. The compression ratio should be calculated as (1 - (summary_length / original_length)) * 100
# 4. Format the output exactly as shown above with "Summary" and "Key Points:" headers
# 5. Do not include any additional text, explanations, or notes
# 6. Keep the summary professional and objective
# 7. Respond in plain text.

# Text to summarize:
# {text}"""
        
#         messages = [
#             {"role": "system", "content": "You are a helpful assistant that summarizes text in a structured format with a paragraph summary and key bullet points."},
#             {"role": "user", "content": prompt}
#         ]

#         result = self._execute_completion(messages)
        
#         # Debug print to see the raw response
#         print("\n=== Raw Response ===")
#         print(result.get("response", ""))
#         print("=== End Raw Response ===\n")
        
#         # Process the response to ensure we always return plain text
#         response = result.get("response", "")
        
#         # Try to parse as JSON if it looks like JSON
#         try:
#             if response.strip().startswith("{"):
#                 print("\n=== Attempting JSON Parse ===")
#                 print(f"Is JSON: {response.strip().startswith('{')}")
#                 print("=== End JSON Parse ===\n")
                
#                 data = json.loads(response)
#                 # Extract the summary text from the JSON
#                 summary = data.get("summary", "")
#                 key_points = data.get("key_points", [])
                
#                 # Format the response as plain text
#                 response = f"Summary\n{summary}\n\nKey Points:\n" + "\n".join([f"- {point}" for point in key_points])
#         except (json.JSONDecodeError, TypeError) as e:
#             print(f"\n=== JSON Parse Error ===")
#             print(f"Error: {str(e)}")
#             print(f"Response was: {response}")
#             print("=== End Error ===\n")
#             # If not JSON, keep the original response
#             pass
        
#         return {"response": response, "tokens_used": result.get("tokens_used", 0)}

    def execute_prompt(self, prompt: str) -> Dict[str, Any]:
        messages = [{"role": "user", "content": prompt}]
        return self._execute_completion(messages)

# --- Concrete LLM Service Implementations ---

class OpenAIService(BaseLLMService):
    def __init__(self, model_name="gpt-4"):
        self.client = openai.OpenAI(api_key=OPENAI_API_KEY)
        self.model_name = model_name
    
    def _execute_completion(self, messages: List[Dict[str, str]]) -> Dict[str, Any]:
        if not self.client.api_key:
            return {"response": "Error: OpenAI API key is missing.", "tokens_used": 0}
        try:
            response = self.client.chat.completions.create(model=self.model_name, messages=messages)
            return {
                "response": response.choices[0].message.content or "",
                "tokens_used": response.usage.total_tokens if response.usage else 0
            }
        except Exception as e:
            return {"response": f"Error: {e}", "tokens_used": 0}

class MistralService(BaseLLMService):
    def __init__(self, model_name="mistral-large-latest"):
        self.client = MistralClient(api_key=MISTRAL_API_KEY) if MISTRAL_API_KEY else None
        self.model_name = model_name
    
    def _execute_completion(self, messages: List[Dict[str, str]]) -> Dict[str, Any]:
        if not self.client:
            return {"response": "Error: Mistral API key is missing.", "tokens_used": 0}
        try:
            mistral_messages = [ChatMessage(role=msg["role"], content=msg["content"]) for msg in messages]
            response = self.client.chat(model=self.model_name, messages=mistral_messages)
            return {
                "response": response.choices[0].message.content,
                "tokens_used": response.usage.total_tokens
            }
        except Exception as e:
            return {"response": f"Error: {e}", "tokens_used": 0}

class GeminiService(BaseLLMService):
    def __init__(self, model_name="gemini-1.5-flash"):
        self.model = GenerativeModel(model_name) if GEMINI_API_KEY else None

    def _execute_completion(self, messages: List[Dict[str, str]]) -> Dict[str, Any]:
        if not self.model:
            return {"response": "Error: Gemini API key is missing.", "tokens_used": 0}
        try:
            prompt = "\n".join([msg["content"] for msg in messages])
            response = self.model.generate_content(prompt)
            return {
                "response": response.text,
                "tokens_used": response.usage_metadata.total_token_count
            }
        except Exception as e:
            return {"response": f"Error: {e}", "tokens_used": 0}

    def summarize_text_simple(self, text: str) -> Dict[str, Any]:
        prompt = f"""Please read the following text and create a comprehensive summary in the following format:\n\nSummary\n[Write a concise paragraph that captures the main ideas and key points of the text.]\n\nKey Points:\n- [Bullet point 1: A key point from the text]\n- [Bullet point 2: Another important aspect]\n- [Bullet point 3: A significant detail]\n- [Bullet point 4: Additional important information]\n- [Bullet point 5: Final key point]\n\nCompression ratio: [Calculate as (1 - (summary_length / original_length)) * 100]% (this is just an example - calculate the actual ratio based on the original text length and your summary length)\n\nRules:\n1. The summary should be concise but comprehensive\n2. Include 3-7 key points that capture the most important ideas\n3. The compression ratio should be calculated as (1 - (summary_length / original_length)) * 100\n4. Format the output exactly as shown above with \"Summary\" and \"Key Points:\" headers\n5. Do not include any additional text, explanations, or notes\n6. Keep the summary professional and objective\n7. Respond in plain text.\n\nText to summarize:\n{text}"""
        messages = [
            {"role": "system", "content": "You are a helpful assistant that summarizes text in a structured format with a paragraph summary and key bullet points."},
            {"role": "user", "content": prompt}
        ]
        result = self._execute_completion(messages)
        response = result.get("response", "")
        # Try to parse as JSON if it looks like JSON, but always output plain text
        try:
            if response.strip().startswith("{"):
                data = json.loads(response)
                summary = data.get("summary", "")
                key_points = data.get("key_points", [])
                response = f"Summary\n{summary}\n\nKey Points:\n" + "\n".join([f"- {point}" for point in key_points])
        except (json.JSONDecodeError, TypeError):
            pass
        return {"response": response, "tokens_used": result.get("tokens_used", 0)}


class LlamaService(BaseLLMService):
    def __init__(self, model_name="llama3"):
        self.model_name = model_name
        self.api_url = OLLAMA_API_URL
    
    def _execute_completion(self, messages: List[Dict[str, str]]) -> Dict[str, Any]:
        prompt = "\n".join([msg["content"] for msg in messages])
        data = {"model": self.model_name, "prompt": prompt, "stream": False, "format": "json"}
        try:
            response = requests.post(self.api_url, json=data)
            response.raise_for_status()
            result = response.json()
            return {
                "response": result.get("response", ""),
                "tokens_used": result.get("total_duration", 0) # Ollama provides duration, not tokens
            }
        except Exception as e:
            return {"response": f"Error: {e}", "tokens_used": 0}

# --- Factory Function ---

def get_llm_service(model: str) -> BaseLLMService:
    if model.startswith("gpt"):
        return OpenAIService(model_name=model)
    elif model.startswith("mistral"):
        return MistralService(model_name=model)
    elif model.startswith("gemini"):
        return GeminiService(model_name=model)
    elif model.startswith("llama"):
        return LlamaService(model_name=model)
    else:
        print(f"Warning: Model '{model}' not recognized. Defaulting to gpt-3.5-turbo.")
        return OpenAIService(model_name="gpt-3.5-turbo")