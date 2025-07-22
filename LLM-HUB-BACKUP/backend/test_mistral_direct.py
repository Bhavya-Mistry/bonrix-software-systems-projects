import os
import sys
import requests
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get API key
api_key = os.getenv("MISTRAL_API_KEY", "")
print(f"API key length: {len(api_key)}")
print(f"API key first 5 chars: {api_key[:5]}...")

# Define the API endpoint
url = "https://api.mistral.ai/v1/chat/completions"

# Define the headers
headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {api_key}"
}

# Define the payload
payload = {
    "model": "mistral-tiny",
    "messages": [{"role": "user", "content": "Hello, how are you?"}]
}

# Make the request
print("Sending request to Mistral API...")
try:
    response = requests.post(url, headers=headers, json=payload)
    print(f"Status code: {response.status_code}")
    print(f"Response: {response.text}")
    
    if response.status_code == 200:
        json_response = response.json()
        print("\nSuccessful response content:")
        print(json_response["choices"][0]["message"]["content"])
    
except Exception as e:
    print(f"Error: {str(e)}")
