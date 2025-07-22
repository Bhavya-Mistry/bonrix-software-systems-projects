import os
import sys
import requests
import json
from dotenv import load_dotenv

# Open a log file
with open("mistral_test_log.txt", "w") as log_file:
    # Load environment variables
    load_dotenv()

    # Get API key
    api_key = os.getenv("MISTRAL_API_KEY", "")
    log_file.write(f"API key length: {len(api_key)}\n")
    log_file.write(f"API key first 5 chars: {api_key[:5]}...\n")

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
    log_file.write("Sending request to Mistral API...\n")
    try:
        response = requests.post(url, headers=headers, json=payload)
        log_file.write(f"Status code: {response.status_code}\n")
        log_file.write(f"Response: {response.text}\n")
        
        if response.status_code == 200:
            json_response = response.json()
            log_file.write("\nSuccessful response content:\n")
            log_file.write(json_response["choices"][0]["message"]["content"] + "\n")
        
    except Exception as e:
        log_file.write(f"Error: {str(e)}\n")

print("Test completed. Check mistral_test_log.txt for results.")
